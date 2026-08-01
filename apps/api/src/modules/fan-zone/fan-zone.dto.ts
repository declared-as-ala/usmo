import { IsNotEmpty, IsString } from 'class-validator';

export class CastVoteDto {
  @IsNotEmpty({ message: 'L\'option de vote est requise' })
  @IsString()
  optionKey: string;
}
