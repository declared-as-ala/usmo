import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Competition } from './competition.schema';

@Injectable()
export class CompetitionsService {
  constructor(@InjectModel(Competition.name) private readonly competitionModel: Model<Competition>) {}

  findPublic(sport?: string) {
    const filter: Record<string, unknown> = { active: true };
    if (sport) filter.sport = sport;
    return this.competitionModel.find(filter).sort({ season: -1 }).lean();
  }

  findAllAdmin() {
    return this.competitionModel.find().sort({ season: -1 }).lean();
  }

  create(input: Partial<Competition>) {
    return this.competitionModel.create(input);
  }

  update(id: string, input: Partial<Competition>) {
    return this.competitionModel.findByIdAndUpdate(id, { $set: input }, { new: true });
  }

  remove(id: string) {
    return this.competitionModel.findByIdAndDelete(id);
  }
}
