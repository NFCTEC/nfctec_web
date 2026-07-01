import { IsOptional, IsString, MinLength } from 'class-validator';

export class RecordPostViewDto {
  @IsString()
  @MinLength(8)
  @IsOptional()
  viewerId?: string;
}
