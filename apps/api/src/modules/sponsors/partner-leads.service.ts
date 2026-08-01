import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartnerLead } from './partner-lead.schema';

@Injectable()
export class PartnerLeadsService {
  constructor(@InjectModel(PartnerLead.name) private readonly model: Model<PartnerLead>) {}

  create(input: Partial<PartnerLead>) {
    return this.model.create(input);
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  async updateStatus(id: string, status: PartnerLead['status']) {
    const doc = await this.model.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!doc) throw new NotFoundException('Partner lead not found');
    return doc;
  }
}
