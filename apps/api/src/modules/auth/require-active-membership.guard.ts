import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Membership } from '../memberships/membership.schema';

@Injectable()
export class RequireActiveMembership implements CanActivate {
  constructor(
    @InjectModel(Membership.name)
    private readonly membershipModel: Model<Membership>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.sub) {
      throw new ForbiddenException('Accès refusé : Veuillez vous connecter');
    }

    const now = new Date();
    const activeMembership = await this.membershipModel
      .findOne({
        userId: user.sub,
        status: 'active',
        endDate: { $gte: now },
      })
      .exec();

    if (!activeMembership) {
      throw new ForbiddenException('Accès réservé : Un abonnement actif est requis');
    }

    return true;
  }
}
