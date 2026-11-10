import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import type { ProjectDto } from '@attention/shared';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectDto> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        userId,
      },
    });
    return this.toDto(project);
  }

  async findAll(userId: string): Promise<ProjectDto[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return projects.map((p) => this.toDto(p));
  }

  async findOne(userId: string, projectId: string): Promise<ProjectDto> {
    const project = await this.ensureOwnership(userId, projectId);
    return this.toDto(project);
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    await this.ensureOwnership(userId, projectId);

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
    return this.toDto(updated);
  }

  async remove(userId: string, projectId: string): Promise<{ success: true }> {
    await this.ensureOwnership(userId, projectId);
    await this.prisma.project.delete({ where: { id: projectId } });
    return { success: true };
  }

  /**
   * Гарантирует, что проект существует и принадлежит юзеру.
   * Возвращает 404, если не существует, и 403, если чужой.
   * Такая схема не даёт узнать о существовании чужих проектов.
   */
  private async ensureOwnership(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому проекту');
    }
    return project;
  }

  private toDto(project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
