import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MembershipPlan } from './membership-plan.schema';
import { CreateMembershipPlanDto, UpdateMembershipPlanDto } from './membership-plan.dto';

@Injectable()
export class MembershipPlansService {
  constructor(
    @InjectModel(MembershipPlan.name)
    private readonly planModel: Model<MembershipPlan>,
  ) {}

  async findAllActive(): Promise<MembershipPlan[]> {
    return this.planModel.find({ isActive: true }).sort({ displayOrder: 1 }).exec();
  }

  async findAllAdmin(): Promise<MembershipPlan[]> {
    return this.planModel.find().sort({ displayOrder: 1 }).exec();
  }

  async findOne(id: string): Promise<MembershipPlan> {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException('Plan d\'abonnement non trouvé');
    }
    return plan;
  }

  async findBySlug(slug: string): Promise<MembershipPlan | null> {
    return this.planModel.findOne({ slug }).exec();
  }

  async create(dto: CreateMembershipPlanDto): Promise<MembershipPlan> {
    const existing = await this.planModel.findOne({ slug: dto.slug }).exec();
    if (existing) {
      throw new ConflictException('Un plan avec ce slug existe déjà');
    }
    const newPlan = new this.planModel(dto);
    return newPlan.save();
  }

  async update(id: string, dto: UpdateMembershipPlanDto): Promise<MembershipPlan> {
    if (dto.slug) {
      const existing = await this.planModel.findOne({ slug: dto.slug, _id: { $ne: id } }).exec();
      if (existing) {
        throw new ConflictException('Un plan avec ce slug existe déjà');
      }
    }
    const updated = await this.planModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Plan d\'abonnement non trouvé');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.planModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Plan d\'abonnement non trouvé');
    }
  }
}
