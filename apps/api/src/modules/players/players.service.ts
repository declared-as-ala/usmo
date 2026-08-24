import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  async findPublic(params: {
    sport?: string;
    position?: string;
    season?: string;
    isFeatured?: boolean;
  } = {}) {
    const filter: Record<string, unknown> = {
      active: true,
      archivedAt: null,
    };
    if (params.sport) filter.sport = params.sport;
    if (params.position && params.position !== 'all' && params.position !== 'Tous') {
      filter.position = params.position;
    }
    if (params.season) filter.season = params.season;
    if (params.isFeatured) filter.isFeatured = true;

    return this.playerModel
      .find(filter)
      .sort({ displayOrder: 1, number: 1 })
      .lean();
  }

  async findBySlug(slug: string) {
    const player = await this.playerModel
      .findOne({ slug, archivedAt: null })
      .lean();
    if (!player) throw new NotFoundException(`Joueur introuvable: ${slug}`);
    return player;
  }

  async findById(id: string) {
    const player = await this.playerModel.findById(id).lean();
    if (!player) throw new NotFoundException(`Joueur introuvable avec l'identifiant ${id}`);
    return player;
  }

  async findAllAdmin(params: {
    sport?: string;
    position?: string;
    season?: string;
    status?: string;
    search?: string;
    withPhoto?: string;
  } = {}) {
    const filter: Record<string, unknown> = {};

    if (params.sport && params.sport !== 'all') {
      filter.sport = params.sport;
    }
    if (params.position && params.position !== 'all') {
      filter.position = params.position;
    }
    if (params.season && params.season !== 'all') {
      filter.season = params.season;
    }
    if (params.status && params.status !== 'all') {
      if (params.status === 'archived') {
        filter.archivedAt = { $ne: null };
      } else {
        filter.status = params.status;
        filter.archivedAt = null;
      }
    } else {
      filter.archivedAt = null;
    }
    if (params.withPhoto === 'true') {
      filter.image = { $nin: ['', null] };
    } else if (params.withPhoto === 'false') {
      filter.$or = [{ image: '' }, { image: null }];
    }
    if (params.search) {
      const searchRegex = { $regex: params.search, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { displayName: searchRegex },
        { position: searchRegex },
        { nationality: searchRegex },
      ];
    }

    return this.playerModel.find(filter).sort({ sport: 1, number: 1 }).lean();
  }

  async create(input: Partial<Player>) {
    let slug = input.slug || slugify(input.name || '') || `player-${Date.now().toString(36)}`;
    if (await this.playerModel.exists({ slug })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const name = input.name || `${input.firstName || ''} ${input.lastName || ''}`.trim() || 'Joueur USM';
    const image = input.image || input.media?.portrait || '';

    return this.playerModel.create({
      ...input,
      name,
      slug,
      image,
      active: input.active !== false,
      status: input.status || 'ACTIVE',
      displayOrder: Number(input.displayOrder) || 0,
      season: input.season || '2026-2027',
    });
  }

  async update(id: string, input: Partial<Player>) {
    const updatePayload: Record<string, unknown> = { ...input };
    if (input.media?.portrait && !input.image) {
      updatePayload.image = input.media.portrait;
    }
    if (input.image && (!input.media || !input.media.portrait)) {
      updatePayload['media.portrait'] = input.image;
    }

    const player = await this.playerModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true },
    );
    if (!player) throw new NotFoundException('Joueur introuvable');
    return player;
  }

  async archive(id: string) {
    const player = await this.playerModel.findByIdAndUpdate(
      id,
      { $set: { archivedAt: new Date(), active: false } },
      { new: true },
    );
    if (!player) throw new NotFoundException('Joueur introuvable');
    return player;
  }

  async restore(id: string) {
    const player = await this.playerModel.findByIdAndUpdate(
      id,
      { $set: { archivedAt: null, active: true } },
      { new: true },
    );
    if (!player) throw new NotFoundException('Joueur introuvable');
    return player;
  }

  async duplicateDraft(id: string) {
    const source = await this.playerModel.findById(id).lean();
    if (!source) throw new NotFoundException('Joueur source introuvable');

    const copy = { ...source };
    delete copy._id;
    delete (copy as any).createdAt;
    delete (copy as any).updatedAt;
    copy.slug = `${source.slug}-copie-${Date.now().toString(36)}`;
    copy.name = `${source.name} (Copie)`;
    copy.active = false;
    copy.status = 'INACTIVE';

    return this.playerModel.create(copy);
  }

  async remove(id: string) {
    const player = await this.playerModel.findByIdAndDelete(id);
    if (!player) throw new NotFoundException('Joueur introuvable');
    return { success: true };
  }
}
