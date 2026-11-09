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

// ---------- Analysis ----------

export const SALIENCY_MAX_SCORE = 100;
