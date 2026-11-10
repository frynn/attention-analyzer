import { IsString, MinLength, MaxLength, IsOptional, ValidateIf } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Название не может быть пустым' })
  @MaxLength(100, { message: 'Название слишком длинное (макс. 100)' })
  name?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(500, { message: 'Описание слишком длинное (макс. 500)' })
  description?: string | null;
}
