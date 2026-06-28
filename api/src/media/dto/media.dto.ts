import { IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @IsString()
  @IsOptional()
  alt?: string | null;
}
