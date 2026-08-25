import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { MembershipsService } from '../memberships/memberships.service';
import { AdminInvitation } from '../auth/admin-invitation.schema';
import { AdminSession } from '../auth/admin-session.schema';
import { AuditLogsService } from '../auditlogs/auditlogs.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(AdminInvitation.name) private readonly invitationModel: Model<AdminInvitation>,
    @InjectModel(AdminSession.name) private readonly sessionModel: Model<AdminSession>,
    private readonly membershipsService: MembershipsService,
    private readonly auditLogsService: AuditLogsService,
    private readonly mailService: MailService,
  ) {}

  async findOne(filter: any): Promise<User | null> {
    return this.userModel.findOne(filter).exec();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async countActiveSuperAdmins(): Promise<number> {
    return this.userModel.countDocuments({
      role: { $in: ['SUPER_ADMIN', 'Super Admin'] },
      status: 'Active',
      isSuspended: false,
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const hashedPassword = userData.password
      ? await bcrypt.hash(userData.password, 10)
      : undefined;

    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  // ── Fan / Normal User Management ──────────────────────────────────────────

  async findAllAdmin(search?: string, status?: string) {
    const filter: Record<string, unknown> = {
      role: { $in: ['USER', 'Customer', 'Fan'] },
    };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      filter.status = status;
    }
    return this.userModel.find(filter).select('-password').sort({ createdAt: -1 }).exec();
  }

  async findAdminDetail(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    const membershipSummary = await this.membershipsService.getMembershipSummary(id);
    return { ...user.toObject(), membershipSummary };
  }

  async updateFanStatus(id: string, status: 'Active' | 'Inactive', actorId?: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.status = status;
    user.isSuspended = status === 'Inactive';
    if (user.isSuspended && actorId) {
      user.suspendedAt = new Date();
      user.suspendedBy = new Types.ObjectId(actorId);
    }
    await user.save();
    if (actorId) {
      await this.auditLogsService.logAction(
        actorId,
        status === 'Inactive' ? 'user_suspended' : 'user_reactivated',
        'User',
        id,
      );
    }
    return user;
  }

  async updateFanNotes(id: string, notes: string, actorId?: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.internalNotes = notes;
    await user.save();
    return user;
  }

  async promoteUserToAdmin(userId: string, role: string, permissions: string[], actorId: string) {
    const actor = await this.userModel.findById(actorId);
    if (!actor || (actor.role !== 'SUPER_ADMIN' && actor.role !== 'Super Admin')) {
      throw new ForbiddenException('Seul un Super Administrateur peut promouvoir un utilisateur en administrateur');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    user.role = role || 'ADMIN';
    user.customPermissions = permissions || [];
    await user.save();

    await this.auditLogsService.logAction(actorId, 'user_promoted_to_admin', 'User', userId);
    return user;
  }

  // ── Administrator Management (SUPER ADMIN ONLY) ─────────────────────────────

  async findAllAdministrators(query: { search?: string; role?: string; status?: string }) {
    const filter: Record<string, unknown> = {
      role: { $nin: ['USER', 'Customer', 'Fan'] },
    };
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.role) {
      filter.role = query.role;
    }
    if (query.status) {
      filter.status = query.status;
    }

    return this.userModel.find(filter).select('-password').sort({ createdAt: -1 }).exec();
  }

  async getAdminDetails(id: string) {
    const admin = await this.userModel.findById(id).select('-password').exec();
    if (!admin) throw new NotFoundException('Administrateur introuvable');

    const sessions = await this.sessionModel.find({ adminId: new Types.ObjectId(id), isRevoked: false });
    return {
      ...admin.toObject(),
      sessions,
    };
  }

  async inviteAdmin(dto: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    permissions?: string[];
    sendInvitation?: boolean;
    actorId: string;
  }) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase().trim() });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cette adresse email');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.invitationModel.create({
      email: dto.email.toLowerCase().trim(),
      role: dto.role,
      permissions: dto.permissions || [],
      token,
      expiresAt,
      createdBy: new Types.ObjectId(dto.actorId),
    });

    const newAdmin = await this.userModel.create({
      name: `${dto.firstName} ${dto.lastName}`,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone,
      role: dto.role,
      customPermissions: dto.permissions || [],
      status: 'Active',
      isSuspended: false,
      createdBy: new Types.ObjectId(dto.actorId),
      password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Temporary random hash
    });

    await this.auditLogsService.logAction(dto.actorId, 'admin_created', 'User', newAdmin._id.toString());

    const relativeUrl = `/accept-invitation?token=${token}`;
    const fullInvitationUrl = `${process.env.APP_URL || 'http://54.37.226.228'}${relativeUrl}`;

    // Send invitation email asynchronously via OVH SMTP
    this.mailService.sendAdminInvitationEmail(
      dto.email.toLowerCase().trim(),
      `${dto.firstName} ${dto.lastName}`,
      fullInvitationUrl,
      dto.role,
    ).catch((err) => {
      console.error('[SMTP INVITATION ERROR]', err);
    });

    return {
      admin: newAdmin,
      invitationToken: token,
      invitationUrl: relativeUrl,
    };
  }

  async updateAdminRoleAndPermissions(
    id: string,
    role: string,
    permissions: string[],
    actorId: string,
  ) {
    const targetAdmin = await this.userModel.findById(id);
    if (!targetAdmin) throw new NotFoundException('Administrateur introuvable');

    const targetIsSuperAdmin = targetAdmin.role === 'SUPER_ADMIN' || targetAdmin.role === 'Super Admin';
    if (targetIsSuperAdmin && role !== 'SUPER_ADMIN' && role !== 'Super Admin') {
      const activeSuperCount = await this.countActiveSuperAdmins();
      if (activeSuperCount <= 1) {
        throw new BadRequestException(
          'Impossible de rétrograder le dernier Super Administrateur actif de la plateforme.',
        );
      }
    }

    targetAdmin.role = role;
    targetAdmin.customPermissions = permissions;
    await targetAdmin.save();

    await this.auditLogsService.logAction(actorId, 'admin_role_permissions_updated', 'User', id);
    return targetAdmin;
  }

  async suspendOrReactivateAdmin(id: string, suspend: boolean, actorId: string) {
    const targetAdmin = await this.userModel.findById(id);
    if (!targetAdmin) throw new NotFoundException('Administrateur introuvable');

    const targetIsSuperAdmin = targetAdmin.role === 'SUPER_ADMIN' || targetAdmin.role === 'Super Admin';
    if (targetIsSuperAdmin && suspend) {
      const activeSuperCount = await this.countActiveSuperAdmins();
      if (activeSuperCount <= 1) {
        throw new BadRequestException(
          'Impossible de suspendre le dernier Super Administrateur actif de la plateforme.',
        );
      }
    }

    targetAdmin.isSuspended = suspend;
    targetAdmin.status = suspend ? 'Inactive' : 'Active';
    if (suspend) {
      targetAdmin.suspendedAt = new Date();
      targetAdmin.suspendedBy = new Types.ObjectId(actorId);
    }
    await targetAdmin.save();

    await this.auditLogsService.logAction(
      actorId,
      suspend ? 'admin_suspended' : 'admin_reactivated',
      'User',
      id,
    );
    return targetAdmin;
  }

  async deleteAdmin(id: string, actorId: string) {
    const targetAdmin = await this.userModel.findById(id);
    if (!targetAdmin) throw new NotFoundException('Administrateur introuvable');

    const targetIsSuperAdmin = targetAdmin.role === 'SUPER_ADMIN' || targetAdmin.role === 'Super Admin';
    if (targetIsSuperAdmin) {
      const activeSuperCount = await this.countActiveSuperAdmins();
      if (activeSuperCount <= 1) {
        throw new BadRequestException(
          'Impossible de supprimer le dernier Super Administrateur actif de la plateforme.',
        );
      }
    }

    await this.userModel.findByIdAndDelete(id);
    await this.auditLogsService.logAction(actorId, 'admin_deleted', 'User', id);
    return { success: true };
  }

  async resetAdminAccess(id: string, actorId: string) {
    const targetAdmin = await this.userModel.findById(id);
    if (!targetAdmin) throw new NotFoundException('Administrateur introuvable');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.invitationModel.create({
      email: targetAdmin.email,
      role: targetAdmin.role,
      permissions: targetAdmin.customPermissions || [],
      token,
      expiresAt,
      createdBy: new Types.ObjectId(actorId),
    });

    await this.auditLogsService.logAction(actorId, 'admin_access_reset_issued', 'User', id);

    return {
      success: true,
      resetToken: token,
      resetUrl: `/accept-invitation?token=${token}`,
    };
  }

  async acceptInvitation(token: string, newPass: string) {
    const invitation = await this.invitationModel.findOne({ token, isUsed: false });
    if (!invitation || invitation.expiresAt < new Date()) {
      throw new BadRequestException('L\'invitation est invalide ou a expiré.');
    }

    const user = await this.userModel.findOne({ email: invitation.email });
    if (!user) throw new NotFoundException('Compte introuvable');

    user.password = await bcrypt.hash(newPass, 10);
    user.status = 'Active';
    user.isSuspended = false;
    user.emailVerified = true;
    await user.save();

    invitation.isUsed = true;
    invitation.usedAt = new Date();
    await invitation.save();

    return { success: true };
  }

  async updateEmail(id: string, newEmail: string, currentPassword?: string): Promise<User> {
    const normalizedEmail = newEmail.toLowerCase().trim();
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.email.toLowerCase() === normalizedEmail) {
      return user;
    }

    const existing = await this.userModel.findOne({
      _id: { $ne: id },
      email: normalizedEmail,
    }).exec();
    if (existing) {
      throw new ConflictException('Cette adresse e-mail est déjà utilisée par un autre compte');
    }

    if (currentPassword && user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Mot de passe actuel incorrect');
      }
    }

    user.email = normalizedEmail;
    user.emailVerified = false;
    await user.save();
    return user;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user || !user.password) {
      throw new BadRequestException('Utilisateur introuvable');
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  async recordLogin(id: string, ip?: string, userAgent?: string) {
    const user = await this.userModel.findById(id);
    if (!user) return;
    user.lastLogin = new Date();
    if (ip) user.lastLoginIp = ip;
    await user.save();

    if (user.role !== 'USER' && user.role !== 'Customer' && user.role !== 'Fan') {
      await this.sessionModel.create({
        adminId: user._id,
        tokenHash: crypto.createHash('sha256').update(`${id}-${Date.now()}`).digest('hex'),
        device: userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop',
        browser: userAgent || 'Web Browser',
        ip: ip || '127.0.0.1',
        lastActivity: new Date(),
      });
    }
  }

  async revokeSession(sessionId: string, actorId: string) {
    await this.sessionModel.findByIdAndUpdate(sessionId, { isRevoked: true });
    await this.auditLogsService.logAction(actorId, 'admin_session_revoked', 'Session', sessionId);
    return { success: true };
  }

  async sendEmailCampaign(dto: {
    subject: string;
    target: 'ALL' | 'ADMINS' | 'USERS';
    htmlContent: string;
    testEmail?: string;
    actorId: string;
  }) {
    if (dto.testEmail) {
      const sent = await this.mailService.sendCampaignEmail(
        dto.testEmail,
        `[TEST] ${dto.subject}`,
        dto.htmlContent,
      );
      return { success: sent, test: true, count: 1, total: 1 };
    }

    let filter: any = { status: 'Active', isSuspended: false };
    if (dto.target === 'ADMINS') {
      filter.role = { $in: ['SUPER_ADMIN', 'ADMIN', 'Super Admin', 'Admin'] };
    } else if (dto.target === 'USERS') {
      filter.role = { $in: ['USER', 'User', 'Fan', 'Customer'] };
    }

    const recipients = await this.userModel.find(filter).select('email').exec();
    let sentCount = 0;

    for (const user of recipients) {
      if (user.email) {
        const ok = await this.mailService.sendCampaignEmail(user.email, dto.subject, dto.htmlContent);
        if (ok) sentCount++;
      }
    }

    await this.auditLogsService.logAction(
      dto.actorId,
      'email_campaign_sent',
      'Campaign',
      `subject:${dto.subject}`,
    );

    return {
      success: true,
      count: sentCount,
      total: recipients.length,
    };
  }
}
