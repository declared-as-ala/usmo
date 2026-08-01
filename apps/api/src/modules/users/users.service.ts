import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';
import { MembershipsService } from '../memberships/memberships.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly membershipsService: MembershipsService,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
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

  async findAllAdmin(search?: string, status?: string) {
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
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
}
