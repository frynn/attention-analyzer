import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch, getToken, API_URL, ApiError } from '../lib/api';
import { usePageMeta } from '../hooks/usePageMeta';
import Skeleton from '../components/Skeleton';
import type { AnalysisDto, ProjectDto } from '@attention/shared';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  usePageMeta(project ? `${project.name} — Attention Analyzer` : 'Проект — Attention Analyzer');

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      apiFetch<ProjectDto>(`/projects/${projectId}`),
      apiFetch<AnalysisDto[]>(`/analyses?projectId=${projectId}`),
    ])
      .then(([p, list]) => {
        setProject(p);
        setAnalyses(list);
      })
      .catch((err) => setError((err as Error).message));
  }, [projectId]);

  const upload = async (file: File) => {
    if (!projectId) return;
    setUploading(true);
    setError(null);
    try {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      form.append('projectId', projectId);

      const res = await fetch(`${API_URL}/analyses`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({ message: res.statusText }));
        throw new ApiError(payload.message ?? `Ошибка ${res.status}`, res.status, payload);
      }
      const created = (await res.json()) as AnalysisDto;
      setAnalyses((prev) => [created, ...prev]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void upload(file);
  };

  const remove = async (analysisId: string) => {
    if (!confirm('Удалить этот анализ?')) return;
    try {
      await apiFetch(`/analyses/${analysisId}`, { method: 'DELETE' });
      setAnalyses((prev) => prev.filter((a) => a.id !== analysisId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (error && !project) {
    return (
      <div className="min-h-screen bg-forest-950 text-cream-100 px-4 md:px-6 py-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-forest-950 text-cream-100 px-4 md:px-6 py-8 max-w-4xl mx-auto">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-950 text-cream-100">
      <header className="border-b border-forest-700 px-4 md:px-6 py-4">
        <Link to="/app" className="text-sm text-sage-500 hover:text-sage-400 transition">
          ← Все проекты
        </Link>
        <h1 className="text-xl font-bold mt-1">{project.name}</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <section className="p-6 border-2 border-dashed border-forest-700 rounded-lg text-center bg-forest-900/40 flex flex-col items-center">
          <p className="text-cream-100 mb-4">Загрузите скриншот макета (PNG или JPG, до 10 МБ)</p>

          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={onFileChange}
            disabled={uploading}
            className="hidden" // ← Скрываем нативный инпут
          />

          <label
            htmlFor="file-upload"
            className={`px-5 py-2.5 rounded-md font-medium text-sm transition cursor-pointer
      ${
        uploading
          ? 'bg-sage-500/50 text-forest-950/50 cursor-not-allowed'
          : 'bg-sage-500 text-forest-950 hover:bg-sage-400'
      }`}
          >
            {uploading ? 'Загрузка...' : 'Выберите файл'}
          </label>

          {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">Анализы ({analyses.length})</h2>
          {analyses.length === 0 ? (
            <p className="text-cream-500 text-sm">Пока нет загруженных макетов</p>
          ) : (
            <ul className="space-y-2">
              {analyses.map((a) => (
                <li key={a.id}>
                  <div className="group flex items-center gap-3 p-3 md:p-4 bg-forest-900 rounded-lg border border-forest-700 hover:border-sage-500/60 hover:bg-forest-800/80 transition-all">
                    <button
                      onClick={() => navigate(`/analyses/${a.id}`)}
                      className="flex-1 text-left cursor-pointer flex items-center gap-3 min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate group-hover:text-sage-500 transition">
                          {a.filename}
                        </div>
                        <div className="text-xs text-cream-500">
                          {a.width}×{a.height} px · {new Date(a.createdAt).toLocaleString('ru-RU')}
                        </div>
                      </div>
                      <svg
                        className="w-4 h-4 text-forest-700 group-hover:text-sage-500 group-hover:translate-x-1 transition-all shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded hover:bg-red-500/10 transition shrink-0"
                      title="Удалить анализ"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
