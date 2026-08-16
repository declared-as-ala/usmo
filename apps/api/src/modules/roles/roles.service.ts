import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './role.schema';
import { DEFAULT_ROLE_PERMISSIONS } from './default-roles';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) {}

  async findAll() {
    const customRoles = await this.roleModel.find().sort({ createdAt: -1 }).exec();
    
    // Combine built-in system roles with custom database roles
    const systemRoles = Object.keys(DEFAULT_ROLE_PERMISSIONS).map((code) => ({
      name: code.replace(/_/g, ' '),
      code,
      permissions: DEFAULT_ROLE_PERMISSIONS[code],
      isSystem: true,
    }));

    return {
      systemRoles,
      customRoles,
    };
  }

  async create(dto: { name: string; code: string; description?: string; permissions: string[] }, actorId: string) {
    const code = dto.code.toUpperCase().replace(/\s+/g, '_');
    const existing = await this.roleModel.findOne({ $or: [{ code }, { name: dto.name }] });
    if (existing || DEFAULT_ROLE_PERMISSIONS[code]) {
      throw new ConflictException('Un rôle existe déjà avec ce nom ou ce code');
    }

    const newRole = new this.roleModel({
      name: dto.name,
      code,
      description: dto.description,
      permissions: dto.permissions || [],
      isSystem: false,
      createdBy: actorId,
    });

    return newRole.save();
  }

  async update(id: string, dto: { name?: string; description?: string; permissions?: string[] }) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException('Rôle personnalisé introuvable');
    if (role.isSystem) throw new BadRequestException('Impossible de modifier un rôle système');

    if (dto.name) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.permissions) role.permissions = dto.permissions;

    return role.save();
  }

  async delete(id: string) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException('Rôle introuvable');
    if (role.isSystem) throw new BadRequestException('Impossible de supprimer un rôle système');

    await this.roleModel.findByIdAndDelete(id);
    return { success: true };
  }
}
