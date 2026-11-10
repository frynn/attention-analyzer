import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AnalysesService } from './analyses.service';
import { multerConfig } from './multer.config';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user.decorator';
import type { AnalysisDetailDto, AnalysisDto } from '@attention/shared';

@Controller('analyses')
@UseGuards(JwtAuthGuard)
export class AnalysesController {
  constructor(private readonly analyses: AnalysesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AnalysisDetailDto> {
    if (!file) throw new BadRequestException('Файл не загружен');
    if (!projectId) throw new BadRequestException('projectId обязателен');
    return this.analyses.create(user.userId, projectId, file);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('projectId') projectId: string,
  ): Promise<AnalysisDto[]> {
    if (!projectId) throw new BadRequestException('projectId обязателен');
    return this.analyses.findAll(user.userId, projectId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<AnalysisDetailDto> {
    return this.analyses.findOne(user.userId, id);
  }

  @Get(':id/image')
  async getImage(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const path = await this.analyses.getImagePath(user.userId, id);
    res.sendFile(path);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<{ success: true }> {
    return this.analyses.remove(user.userId, id);
  }
}
