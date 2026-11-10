import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1, { message: 'Название не может быть пустым' })
  @MaxLength(100, { message: 'Название слишком длинное (макс. 100)' })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Описание слишком длинное (макс. 500)' })
  description?: string;
}
