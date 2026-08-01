import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class RequestMembershipDto {
  @IsNotEmpty({ message: 'Le planId est requis' })
  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  proofFile?: string;
}

export class ApproveMembershipDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class StatusNoteDto {
  @IsOptional()
  @IsString()
  note?: string;
}
