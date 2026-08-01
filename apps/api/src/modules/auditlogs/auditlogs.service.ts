import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from './auditlog.schema';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLog>,
  ) {}

  async logAction(
    adminId: string,
    action: string,
    entityType: string,
    entityId: string,
  ): Promise<AuditLog> {
    const entry = new this.auditLogModel({
      adminId: new Types.ObjectId(adminId),
      action,
      entityType,
      entityId,
    });
    return entry.save();
  }

  async findAll(filters: { search?: string; action?: string; limit?: number }) {
    const query: any = {};
    if (filters.action) {
      query.action = filters.action;
    }
    const limit = Math.min(100, filters.limit || 50);
    return this.auditLogModel
      .find(query)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
