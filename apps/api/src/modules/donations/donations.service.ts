import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Donation, DonationDocument } from './donation.schema';
import { CreateDonationDto } from './donations.dto';
import { AuditLogsService } from '../auditlogs/auditlogs.service';
import { BadgesService } from '../loyalty/badges.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DonationsService {
  constructor(
    @InjectModel(Donation.name)
    private readonly donationModel: Model<DonationDocument>,
    @InjectModel('FanPoint')
    private readonly fanPointModel: Model<any>,
    @InjectModel('User')
    private readonly userModel: Model<any>,
    private readonly auditLogsService: AuditLogsService,
    private readonly badgesService: BadgesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateDonationDto, userId?: string): Promise<DonationDocument> {
    const donation = new this.donationModel({
      ...dto,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      paymentStatus: 'pending',
    });
    return donation.save();
  }

  async confirm(id: string, paymentReference: string): Promise<DonationDocument> {
    const donation = await this.donationModel.findById(id).exec();
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }
    if (donation.paymentStatus === 'completed') {
      return donation;
    }

    donation.paymentStatus = 'completed';
    donation.paymentReference = paymentReference;
    const saved = await donation.save();

    // Grant points to user if logged in (1 point per 1 unit currency)
    if (donation.userId) {
      const pointsToAward = donation.amount;
      
      const ledgerEntry = new this.fanPointModel({
        userId: donation.userId,
        points: pointsToAward,
        reason: 'donation',
        sourceType: 'donation',
        sourceId: donation._id.toString(),
      });
      await ledgerEntry.save();

      await this.userModel.findByIdAndUpdate(donation.userId, {
        $inc: { points: pointsToAward }
      });

      await this.badgesService.unlock(donation.userId.toString(), 'donor');
      await this.notificationsService.create(
        donation.userId.toString(),
        'donation_status',
        'Don confirmé',
        `Votre don de ${donation.amount} ${donation.currency || 'TND'} a été confirmé. Merci pour votre soutien !`,
        '/compte/dons',
      );
    }

    return saved;
  }

  async findPublic() {
    const list = await this.donationModel
      .find({ paymentStatus: 'completed' })
      .sort({ createdAt: -1 })
      .exec();

    return list.map(d => {
      const isAnon = d.visibility === 'anonymous';
      const raw = d as any;
      return {
        _id: d._id,
        amount: d.amount,
        currency: d.currency,
        donorName: isAnon ? 'Donateur Anonyme' : d.donorName,
        message: d.message,
        createdAt: raw.createdAt,
      };
    });
  }

  async getLeaderboard() {
    const list = await this.donationModel.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          visibility: 'public',
          userId: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalAmount: { $sum: '$amount' },
          name: { $first: '$donorName' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]).exec();

    return list.map((item, idx) => ({
      userId: item._id,
      name: item.name,
      totalAmount: item.totalAmount,
      rank: idx + 1
    }));
  }

  async findMyHistory(userId: string) {
    return this.donationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllAdmin() {
    return this.donationModel
      .find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .exec();
  }

  async exportCsv(adminId: string): Promise<string> {
    const donations = await this.donationModel
      .find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .exec();

    // Log the csv export action
    await this.auditLogsService.logAction(adminId, 'DONATION_EXPORT_CSV', 'Donation', 'bulk');

    // Create CSV Header
    const header = 'Donation ID,Donor Name,Donor Email,Amount,Currency,Visibility,Payment Status,Payment Reference,Date\n';
    
    // Create rows
    const rows = donations.map((d: any) => {
      const id = d._id.toString();
      const name = `"${d.donorName.replace(/"/g, '""')}"`;
      const email = `"${d.donorEmail.replace(/"/g, '""')}"`;
      const amount = d.amount;
      const currency = d.currency;
      const visibility = d.visibility;
      const status = d.paymentStatus;
      const ref = d.paymentReference ? `"${d.paymentReference.replace(/"/g, '""')}"` : '';
      const date = d.createdAt ? d.createdAt.toISOString() : '';

      return `${id},${name},${email},${amount},${currency},${visibility},${status},${ref},${date}`;
    });

    return header + rows.join('\n');
  }
}
