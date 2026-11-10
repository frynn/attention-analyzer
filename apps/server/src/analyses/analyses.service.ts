import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { SaliencyService } from './saliency.service';
import { UPLOADS_DIR } from './multer.config';
import type { AnalysisDetailDto, AnalysisDto } from '@attention/shared';
import { UxAuditService } from './ux-audit.service';

@Injectable()
export class AnalysesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly saliency: SaliencyService,
    private readonly uxAudit: UxAuditService,
  ) {}

  async create(
    userId: string,
    projectId: string,
    file: Express.Multer.File,
  ): Promise<AnalysisDetailDto> {
    await this.projects.findOne(userId, projectId);

    let meta: sharp.Metadata;
    try {
      meta = await sharp(file.path).metadata();
    } catch {
      await this.safeUnlink(file.path);
      throw new BadRequestException('Не удалось прочитать изображение');
    }

    if (!meta.width || !meta.height) {
      await this.safeUnlink(file.path);
      throw new BadRequestException('Некорректное изображение');
    }

    const saliency = await this.saliency.compute(file.path);
    const uxReport = this.uxAudit.analyze(saliency);

    const analysis = await this.prisma.analysis.create({
      data: {
        filename: file.filename,
        width: meta.width,
        height: meta.height,
        saliencyData: saliency as unknown as object,
        uxReport: uxReport,
        projectId,
      },
    });

    return { ...this.toDto(analysis), saliency };
  }

  async findAll(userId: string, projectId: string): Promise<AnalysisDto[]> {
    await this.projects.findOne(userId, projectId);
    const list = await this.prisma.analysis.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((a) => this.toDto(a));
  }

  async findOne(userId: string, analysisId: string): Promise<AnalysisDetailDto> {
    const analysis = await this.ensureOwnership(userId, analysisId);
    return {
      ...this.toDto(analysis),
      saliency: (analysis.saliencyData as unknown as AnalysisDetailDto['saliency']) ?? null,
    };
  }

  async remove(userId: string, analysisId: string): Promise<{ success: true }> {
    const analysis = await this.ensureOwnership(userId, analysisId);
    await this.prisma.analysis.delete({ where: { id: analysisId } });
    await this.safeUnlink(join(UPLOADS_DIR, analysis.filename));
    return { success: true };
  }

  async getImagePath(userId: string, analysisId: string): Promise<string> {
    const analysis = await this.ensureOwnership(userId, analysisId);
    return join(UPLOADS_DIR, analysis.filename);
  }

  private async ensureOwnership(userId: string, analysisId: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { project: true },
    });
    if (!analysis) throw new NotFoundException('Анализ не найден');
    if (analysis.project.userId !== userId) {
      throw new NotFoundException('Анализ не найден');
    }
    return analysis;
  }

  private async safeUnlink(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch {
      // файл уже удалён или не существовал — не критично
    }
  }

  private toDto(a: {
    id: string;
    filename: string;
    width: number;
    height: number;
    uxReport: string | null;
    createdAt: Date;
    projectId: string;
  }): AnalysisDto {
    return {
      id: a.id,
      filename: a.filename,
      width: a.width,
      height: a.height,
      uxReport: a.uxReport,
      createdAt: a.createdAt.toISOString(),
      projectId: a.projectId,
    };
  }
}
