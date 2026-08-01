import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Membership } from './membership.schema';
import { MembershipPlan } from '../membership-plans/membership-plan.schema';
import { AuditLogsService } from '../auditlogs/auditlogs.service';
import { BadgesService } from '../loyalty/badges.service';
import { NotificationsService } from '../notifications/notifications.service';

const STATUS_NOTIFICATION: Record<string, { title: string; message: string }> = {
  active: { title: 'Abonnement activé', message: 'Votre demande d\'abonnement a été approuvée. Bienvenue parmi les membres actifs !' },
  rejected: { title: 'Demande refusée', message: 'Votre demande d\'abonnement n\'a pas été approuvée. Contactez le club pour plus d\'informations.' },
  suspended: { title: 'Abonnement suspendu', message: 'Votre abonnement a été suspendu. Contactez le club pour plus d\'informations.' },
  cancelled: { title: 'Abonnement annulé', message: 'Votre abonnement a été annulé.' },
  expired: { title: 'Abonnement expiré', message: 'Votre abonnement est arrivé à expiration. Renouvelez-le pour conserver vos avantages.' },
};

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(Membership.name)
    private readonly membershipModel: Model<Membership>,
    @InjectModel(MembershipPlan.name)
    private readonly planModel: Model<MembershipPlan>,
    private readonly auditLogsService: AuditLogsService,
    private readonly badgesService: BadgesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByUserId(userId: string): Promise<Membership | null> {
    const membership = await this.membershipModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('planId')
      .exec();

    if (!membership) return null;

    // Lazy expiration check
    if (
      membership.status === 'active' &&
      membership.endDate &&
      membership.endDate < new Date()
    ) {
      membership.status = 'expired';
      membership.statusHistory.push({
        status: 'expired',
        at: new Date(),
        note: 'Expiration automatique détectée à la lecture',
      } as any);
      await membership.save();
    }

    return membership;
  }

  async getMembershipSummary(userId: string) {
    const membership = await this.findByUserId(userId);
    if (!membership) {
      return {
        active: false,
        plan: null,
        status: null,
        startDate: null,
        endDate: null,
        daysRemaining: 0,
        benefitsUnlocked: [],
        renewalCta: false,
      };
    }

    const plan = membership.planId as any as MembershipPlan;
    const isPlanActive = membership.status === 'active';
    
    let daysRemaining = 0;
    if (isPlanActive && membership.endDate) {
      daysRemaining = Math.max(
        0,
        Math.ceil((membership.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      );
    }

    const renewalCta =
      membership.status === 'expired' ||
      membership.status === 'cancelled' ||
      (isPlanActive && daysRemaining <= 7);

    return {
      id: membership._id,
      active: isPlanActive,
      plan: plan?.name || 'Inconnu',
      status: membership.status,
      startDate: membership.startDate || null,
      endDate: membership.endDate || null,
      daysRemaining,
      benefitsUnlocked: plan?.benefits || [],
      memberDiscountPercent: isPlanActive ? (plan?.memberDiscountPercent || 0) : 0,
      renewalCta,
    };
  }

  /** Discount percent a fan's active membership grants at checkout, 0 if none. */
  async getActiveDiscountPercent(userId: string): Promise<number> {
    const membership = await this.findByUserId(userId);
    if (!membership || membership.status !== 'active') return 0;
    const plan = membership.planId as any as MembershipPlan;
    return plan?.memberDiscountPercent || 0;
  }

  async requestMembership(userId: string, planId: string, proofFile?: string): Promise<Membership> {
    const plan = await this.planModel.findById(planId).exec();
    if (!plan) {
      throw new NotFoundException('Plan non trouvé');
    }

    const pending = await this.membershipModel
      .findOne({ userId: new Types.ObjectId(userId), status: 'pending' })
      .exec();

    if (pending) {
      throw new BadRequestException('MEMBERSHIP_REQUEST_ALREADY_PENDING');
    }

    const newMembership = new this.membershipModel({
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(planId),
      status: 'pending',
      proofFile,
      statusHistory: [
        {
          status: 'pending',
          at: new Date(),
          note: 'Demande soumise par le supporter',
        },
      ],
    });

    return newMembership.save();
  }

  async findAllAdmin(filters: { status?: string; planId?: string; search?: string }): Promise<any[]> {
    const query: any = {};
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.planId) {
      query.planId = new Types.ObjectId(filters.planId);
    }

    let usersMatchIds: Types.ObjectId[] = [];
    if (filters.search) {
      // Find matching users in database
      const userModel = this.membershipModel.db.model('User');
      const users = await userModel
        .find({
          $or: [
            { name: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } },
          ],
        })
        .select('_id')
        .exec();
      usersMatchIds = users.map((u: any) => u._id as Types.ObjectId);
      query.userId = { $in: usersMatchIds };
    }

    return this.membershipModel
      .find(query)
      .populate('userId', 'name email')
      .populate('planId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(
    id: string,
    nextStatus: 'active' | 'rejected' | 'suspended' | 'cancelled' | 'expired',
    adminId: string,
    options?: { note?: string; startDate?: Date; endDate?: Date },
  ): Promise<Membership> {
    const membership = await this.membershipModel.findById(id).populate('planId').exec();
    if (!membership) {
      throw new NotFoundException('Abonnement non trouvé');
    }

    const currentStatus = membership.status;

    // Validate transitions strictly
    let isValid = false;
    if (currentStatus === 'pending') {
      if (nextStatus === 'active' || nextStatus === 'rejected') isValid = true;
    } else if (currentStatus === 'active') {
      if (nextStatus === 'expired' || nextStatus === 'suspended' || nextStatus === 'cancelled') isValid = true;
    } else if (currentStatus === 'suspended') {
      if (nextStatus === 'active') isValid = true;
    }

    if (!isValid) {
      throw new BadRequestException('INVALID_MEMBERSHIP_TRANSITION');
    }

    membership.status = nextStatus;

    if (nextStatus === 'active') {
      membership.approvedBy = new Types.ObjectId(adminId);
      membership.approvedAt = new Date();

      const plan = membership.planId as any as MembershipPlan;
      const duration = plan?.durationDays || 365;

      membership.startDate = options?.startDate || new Date();
      if (options?.endDate) {
        membership.endDate = options.endDate;
      } else {
        const end = new Date(membership.startDate);
        end.setDate(end.getDate() + duration);
        membership.endDate = end;
      }
    } else if (nextStatus === 'cancelled') {
      membership.cancelledBy = new Types.ObjectId(adminId);
      membership.cancelledAt = new Date();
    }

    if (options?.note) {
      membership.internalNote = options.note;
    }

    membership.statusHistory.push({
      status: nextStatus,
      at: new Date(),
      by: new Types.ObjectId(adminId),
      note: options?.note,
    } as any);

    const saved = await membership.save();

    // Trigger Audit Log
    await this.auditLogsService.logAction(
      adminId,
      `membership.${nextStatus}`,
      'Membership',
      saved._id.toString(),
    );

    if (nextStatus === 'active') {
      await this.badgesService.unlock(membership.userId.toString(), 'member');
    }

    const notif = STATUS_NOTIFICATION[nextStatus];
    if (notif) {
      await this.notificationsService.create(
        membership.userId.toString(),
        'membership_status',
        notif.title,
        notif.message,
        '/abonnement',
      );
    }

    return saved;
  }

  async renewMembership(id: string, adminId: string, options?: { note?: string }): Promise<Membership> {
    const oldMembership = await this.membershipModel.findById(id).exec();
    if (!oldMembership) {
      throw new NotFoundException('Abonnement précédent non trouvé');
    }

    const newMembership = new this.membershipModel({
      userId: oldMembership.userId,
      planId: oldMembership.planId,
      status: 'pending',
      renewedFrom: oldMembership._id,
      statusHistory: [
        {
          status: 'pending',
          at: new Date(),
          by: new Types.ObjectId(adminId),
          note: options?.note || 'Demande de renouvellement initiée par admin',
        },
      ],
    });

    const saved = await newMembership.save();

    await this.auditLogsService.logAction(
      adminId,
      'membership.renew',
      'Membership',
      saved._id.toString(),
    );

    return saved;
  }
}
