import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match } from './match.schema';
import { randomUUID } from 'crypto';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class MatchesService {
  constructor(@InjectModel(Match.name) private readonly matchModel: Model<Match>) {}

  async findUpcoming(sport?: string, limit = 10) {
    const filter: Record<string, unknown> = { status: { $in: ['upcoming', 'live'] } };
    if (sport) filter.sport = sport;
    return this.matchModel.find(filter).sort({ date: 1, time: 1 }).limit(limit).lean();
  }

  async findResults(sport?: string, limit = 10) {
    const filter: Record<string, unknown> = { status: 'finished' };
    if (sport) filter.sport = sport;
    return this.matchModel.find(filter).sort({ date: -1 }).limit(limit).lean();
  }

  async findPublic(sport?: string) {
    const filter: Record<string, unknown> = {};
    if (sport) filter.sport = sport;
    return this.matchModel.find(filter).sort({ date: -1 }).lean();
  }

  async findBySlug(slug: string) {
    const match = await this.matchModel.findOne({ slug }).lean();
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  findAllAdmin() {
    return this.matchModel.find().sort({ date: -1 }).lean();
  }

  async create(input: Partial<Match>) {
    const base = `${input.homeTeam}-vs-${input.awayTeam}-${input.date}`;
    let slug = slugify(base) || randomUUID();
    const exists = await this.matchModel.exists({ slug });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    return this.matchModel.create({ ...input, slug });
  }

  async update(id: string, input: Partial<Match>) {
    const match = await this.matchModel.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  async remove(id: string) {
    const match = await this.matchModel.findByIdAndDelete(id);
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  async updateScore(id: string, team: 'home' | 'away', amount: number) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');
    match.score = { ...match.score, [team]: Math.max(0, (match.score?.[team] || 0) + amount) };
    await match.save();
    return match;
  }

  async updateStatus(id: string, status: 'upcoming' | 'live' | 'finished') {
    const match = await this.matchModel.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  async addEvent(id: string, event: Omit<Match['timeline'][number], 'id'>) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');
    match.timeline.push({ ...event, id: randomUUID() } as Match['timeline'][number]);
    await match.save();
    return match;
  }
}
