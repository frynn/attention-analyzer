import { Module } from '@nestjs/common';
import { AnalysesController } from './analyses.controller';
import { AnalysesService } from './analyses.service';
import { SaliencyService } from './saliency.service';
import { UxAuditService } from './ux-audit.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [AnalysesController],
  providers: [AnalysesService, SaliencyService, UxAuditService],
  exports: [AnalysesService, SaliencyService],
})
export class AnalysesModule {}
