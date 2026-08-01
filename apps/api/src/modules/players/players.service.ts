import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player } from './player.schema';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class PlayersService {
  constructor(@InjectModel(Player.name) private readonly playerModel: Model<Player>) {}

  findPublic(sport?: string) {
    const filter: Record<string, unknown> = { active: true };
    if (sport) filter.sport = sport;
    return this.playerModel.find(filter).sort({ number: 1 }).lean();
  }

  async findBySlug(slug: string) {
    const player = await this.playerModel.findOne({ slug, active: true }).lean();
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  findAllAdmin(sport?: string) {
    const filter: Record<string, unknown> = {};
    if (sport) filter.sport = sport;
    return this.playerModel.find(filter).sort({ sport: 1, number: 1 }).lean();
  }

  async create(input: Partial<Player>) {
    let slug = slugify(input.name || '') || `player-${Date.now().toString(36)}`;
    if (await this.playerModel.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
    return this.playerModel.create({ ...input, slug });
  }

  async update(id: string, input: Partial<Player>) {
    const player = await this.playerModel.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  async remove(id: string) {
    const player = await this.playerModel.findByIdAndDelete(id);
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }
}
