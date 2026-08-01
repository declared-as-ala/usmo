import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportTicket } from './support-ticket.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name) private readonly ticketModel: Model<SupportTicket>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, subject: string, category: string, message: string): Promise<SupportTicket> {
    return this.ticketModel.create({
      userId: new Types.ObjectId(userId),
      subject,
      category,
      status: 'open',
      messages: [{ from: 'fan', message, createdAt: new Date() }],
    });
  }

  async findMine(userId: string) {
    return this.ticketModel.find({ userId: new Types.ObjectId(userId) }).sort({ updatedAt: -1 }).exec();
  }

  async findOneMine(userId: string, id: string): Promise<SupportTicket> {
    const ticket = await this.ticketModel.findOne({ _id: id, userId: new Types.ObjectId(userId) }).exec();
    if (!ticket) throw new NotFoundException('Ticket introuvable');
    return ticket;
  }

  async replyAsFan(userId: string, id: string, message: string): Promise<SupportTicket> {
    const ticket = await this.findOneMine(userId, id);
    ticket.messages.push({ from: 'fan', message, createdAt: new Date() } as any);
    if (ticket.status === 'answered') ticket.status = 'open';
    return ticket.save();
  }

  // ── Admin ──────────────────────────────────────────────────────────────
  async findAllAdmin() {
    return this.ticketModel.find({}).sort({ updatedAt: -1 }).populate('userId', 'name email').exec();
  }

  async findOneAdmin(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketModel.findById(id).populate('userId', 'name email').exec();
    if (!ticket) throw new NotFoundException('Ticket introuvable');
    return ticket;
  }

  async replyAsAdmin(id: string, message: string): Promise<SupportTicket> {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) throw new NotFoundException('Ticket introuvable');
    ticket.messages.push({ from: 'admin', message, createdAt: new Date() } as any);
    ticket.status = 'answered';
    const saved = await ticket.save();

    await this.notificationsService.create(
      ticket.userId.toString(),
      'support_reply',
      'Réponse à votre ticket',
      `Le support a répondu à votre demande "${ticket.subject}".`,
      '/compte/support',
    );

    return saved;
  }

  async updateStatus(id: string, status: 'open' | 'answered' | 'closed'): Promise<SupportTicket> {
    const ticket = await this.ticketModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!ticket) throw new NotFoundException('Ticket introuvable');
    return ticket;
  }
}
