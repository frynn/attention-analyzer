// Общие DTO между клиентом и сервером.
// Правило: здесь только типы/enum'ы/константы, никаких рантайм-зависимостей.

// ---------- Общие ----------

export interface UserDto {
  id: string;
  email: string;
  createdAt: string; // ISO 8601
}

// ---------- Auth ----------

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}

// ---------- Projects ----------

export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
}

// ---------- Analysis ----------
// ---------- Analysis ----------

export interface SaliencyMapDto {
  width: number;
  height: number;
  /** Flat row-major array, values in [0, 1] */
  map: number[];
}

export interface AnalysisDto {
  id: string;
  filename: string;
  width: number;
  height: number;
  uxReport: string | null;
  createdAt: string;
  projectId: string;
}

export interface AnalysisDetailDto extends AnalysisDto {
  saliency: SaliencyMapDto | null;
}

export const SALIENCY_MAX_SCORE = 100;
