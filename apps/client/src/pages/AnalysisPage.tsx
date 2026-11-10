import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { usePageMeta } from '../hooks/usePageMeta';
import HeatmapViewer from '../components/HeatmapViewer';
import Skeleton from '../components/Skeleton';
import type { AnalysisDetailDto } from '@attention/shared';

export default function AnalysisPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysis, setAnalysis] = useState<AnalysisDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  usePageMeta('Анализ — Attention Analyzer');

  useEffect(() => {
    if (!analysisId) return;
    apiFetch<AnalysisDetailDto>(`/analyses/${analysisId}`)
      .then(setAnalysis)
      .catch((err) => setError((err as Error).message));
  }, [analysisId]);

  if (error) {
    return (
      <div className="min-h-screen bg-forest-950 text-cream-100 px-4 md:px-6 py-8 max-w-5xl mx-auto">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-forest-950 text-cream-100 px-4 md:px-6 py-8 max-w-5xl mx-auto">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
        <Skeleton className="aspect-[16/10] w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-950 text-cream-100">
      <header className="border-b border-forest-700 px-4 md:px-6 py-4">
        <Link
          to={`/projects/${analysis.projectId}`}
          className="text-sm text-sage-500 hover:text-sage-400 transition"
        >
          ← К проекту
        </Link>
        <h1 className="text-xl font-bold mt-1">Анализ внимания</h1>
        <p className="text-sm text-cream-500">{analysis.filename}</p>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
        {analysis.saliency && (
          <HeatmapViewer
            analysisId={analysis.id}
            saliency={analysis.saliency}
            width={analysis.width}
            height={analysis.height}
            alt={analysis.filename}
          />
        )}

        {analysis.uxReport && (
          <section className="bg-forest-900 border border-forest-700 rounded-lg p-5 md:p-6">
            <h2 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2 leading-tight">
              🧠 UX-аудит (автоматический)
            </h2>
            <div className="text-sm text-cream-100 whitespace-pre-line leading-relaxed wrap-break-word">
              {analysis.uxReport}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
