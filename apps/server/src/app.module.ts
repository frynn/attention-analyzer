import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { AnalysesModule } from './analyses/analyses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
      override: true,
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    AnalysesModule,
  ],
})
export class AppModule {}
