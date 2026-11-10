import { useEffect, useState } from 'react';
import { getToken, API_URL } from '../lib/api';

interface AuthedImageProps {
  analysisId: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  onLoad?: (img: HTMLImageElement) => void;
}

export default function AuthedImage({
  analysisId,
  alt,
  width,
  height,
  className,
  onLoad,
}: AuthedImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    (async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/analyses/${analysisId}/image`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [analysisId]);

  const aspect = { aspectRatio: `${width} / ${height}` };

  if (error) {
    return (
      <div
        className="bg-forest-900 flex items-center justify-center text-red-400 text-sm p-4 text-center w-full rounded"
        style={aspect}
      >
        Не удалось загрузить изображение: {error}
      </div>
    );
  }

  if (!src) {
    return <div className="shimmer rounded w-full" style={aspect} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onLoad={(e) => onLoad?.(e.currentTarget)}
    />
  );
}
