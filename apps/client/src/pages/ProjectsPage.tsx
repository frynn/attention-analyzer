import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import Skeleton from '../components/Skeleton';
import type { ProjectDto } from '@attention/shared';

export default function ProjectsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ProjectDto[]>('/projects')
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const p = await apiFetch<ProjectDto>('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      });
      setProjects((prev) => [p, ...prev]);
      setName('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить проект?')) return;
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 text-cream-100">
      <header className="border-b border-forest-700 px-4 md:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-sage-500 transition">
          Attention Analyzer
        </Link>
        <div className="flex items-center gap-3 md:gap-4 text-sm">
          <span className="text-cream-500 hidden sm:inline">{user?.email}</span>
          <button onClick={logout} className="text-sage-500 hover:text-sage-400 transition">
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <form onSubmit={create} className="flex flex-col sm:flex-row gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название нового проекта"
            className="flex-1 px-3 py-2 rounded bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-cream-500 focus:outline-none focus:border-sage-500"
          />
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="px-4 py-2 rounded bg-sage-500 text-forest-950 hover:bg-sage-400 disabled:opacity-50 font-medium transition"
          >
            Создать
          </button>
        </form>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-cream-500 text-center py-12">Пока нет проектов</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li key={p.id}>
                <div className="group flex items-center gap-3 p-3 md:p-4 bg-forest-900 rounded-lg border border-forest-700 hover:border-sage-500/60 hover:bg-forest-800/80 transition-all">
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="flex-1 text-left cursor-pointer flex items-center gap-3 min-w-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate group-hover:text-sage-500 transition">
                        {p.name}
                      </div>
                      <div className="text-xs text-cream-500 truncate">
                        {new Date(p.updatedAt).toLocaleString('ru-RU')}
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
                    onClick={() => remove(p.id)}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded hover:bg-red-500/10 transition shrink-0"
                    title="Удалить проект"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
