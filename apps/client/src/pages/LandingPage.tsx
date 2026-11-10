import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';

const FEATURES = [
  {
    title: 'Predictive Heatmap',
    desc: 'Тепловая карта прогнозирует, куда пользователь посмотрит в первую очередь — ещё до запуска сайта.',
  },
  {
    title: 'ROI-анализ',
    desc: 'Выделите любую область — кнопку, блок, баннер — и получите оценку заметности от 0 до 100.',
  },
  {
    title: 'UX-аудит',
    desc: 'Автоматические рекомендации: где внимание смещено, какие зоны «мертвы», что нужно усилить.',
  },
  {
    title: 'Без запуска и трафика',
    desc: 'Анализируйте макеты до релиза. Никаких A/B тестов, ожидания и потерь трафика.',
  },
];

const STEPS = [
  { n: '01', title: 'Загрузите макет', desc: 'Скриншот страницы в PNG или JPG — до 10 МБ.' },
  {
    n: '02',
    title: 'Получите heatmap',
    desc: 'Saliency-алгоритм размечает зоны внимания за секунды.',
  },
  { n: '03', title: 'Исправьте UX', desc: 'Найдите слабые CTA и узнайте, что привлекает взгляд.' },
];

export default function LandingPage() {
  usePageMeta(
    'Attention Analyzer — Predictive UX',
    'Предсказывайте визуальное внимание пользователей на макетах до запуска сайта. Heatmap, ROI, UX-аудит.',
  );

  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // ⚡ Оптимизированное свечение: никаких ре-рендеров React
  useEffect(() => {
    const hero = heroRef.current;
    const glow = glowRef.current;
    if (!hero || !glow) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const render = () => {
      frame = 0;
      glow.style.transform = `translate3d(${x - 250}px, ${y - 250}px, 0)`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(render);
    };

    // Только на устройствах с мышью
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (mediaQuery.matches) {
      hero.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0E1311] text-[#E8EDE9] overflow-x-hidden">
      {/* ========== HERO ========== */}
      <div ref={heroRef} className="relative overflow-hidden">
        {/* Статические свечения — приглушённые, без неона */}
        <div className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-[#A3C1AD]/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full bg-[#D4C5B0]/6 blur-3xl pointer-events-none" />

        {/* Свечение за курсором — GPU-композитное, без React state */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="absolute pointer-events-none hidden md:block"
          style={{
            width: 500,
            height: 500,
            top: 0,
            left: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(163,193,173,0.15) 0%, rgba(163,193,173,0.05) 40%, transparent 70%)',
            mixBlendMode: 'screen',
            willChange: 'transform',
            transform: 'translate3d(-9999px, -9999px, 0)',
            zIndex: 1,
          }}
        />

        {/* Декоративные ROI-боксы (витрина) — песочные/шалфейные */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block z-[2]">
          <div className="absolute top-[25%] right-[8%] w-52 h-16 border border-[#D4C5B0]/40 bg-[#D4C5B0]/5 rounded flex items-start justify-between p-2 text-[10px] text-[#D4C5B0] font-mono backdrop-blur-[1px]">
            <span>CTA · 87/100</span>
            <span className="text-[#D4C5B0]/60">●</span>
          </div>
          <div className="absolute bottom-[25%] left-[6%] w-40 h-20 border border-[#A3C1AD]/30 bg-[#A3C1AD]/5 rounded flex items-start justify-between p-2 text-[10px] text-[#A3C1AD] font-mono backdrop-blur-[1px]">
            <span>IMG · 42/100</span>
            <span className="text-[#A3C1AD]/60">●</span>
          </div>
        </div>

        {/* Mock preview: "скриншот" с heatmap — витрина продукта */}
        <div className="absolute top-1/2 right-[3%] -translate-y-1/2 w-[24rem] rounded-xl bg-forest-900/80 backdrop-blur-md border border-forest-700 overflow-hidden shadow-2xl hidden xl:block z-[2]">
          {/* Browser bar */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-forest-700 bg-forest-950/60">
            <div className="w-2 h-2 rounded-full bg-sand-500/50" />
            <div className="w-2 h-2 rounded-full bg-sage-500/50" />
            <div className="w-2 h-2 rounded-full bg-cream-500/50" />
            <div className="ml-auto text-[10px] text-cream-500 font-mono">example.com</div>
          </div>

          {/* Mock content */}
          <div className="relative p-5 h-48">
            <div className="space-y-2">
              <div className="h-2.5 w-2/3 bg-forest-700 rounded" />
              <div className="h-2 w-1/2 bg-forest-700 rounded" />
              <div className="h-8 w-24 bg-sage-500/40 rounded mt-4" />
            </div>
            <div className="absolute bottom-4 left-5 right-5 space-y-1.5">
              <div className="h-1.5 w-full bg-forest-700 rounded" />
              <div className="h-1.5 w-4/5 bg-forest-700 rounded" />
              <div className="h-1.5 w-3/5 bg-forest-700 rounded" />
            </div>

            {/* Heatmap overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(circle at 25% 60%, rgba(212,197,176,0.55) 0%, transparent 25%),
                  radial-gradient(circle at 40% 72%, rgba(163,193,173,0.5) 0%, transparent 30%),
                  radial-gradient(circle at 75% 30%, rgba(210,140,110,0.45) 0%, transparent 25%),
                  radial-gradient(circle at 88% 78%, rgba(163,193,173,0.35) 0%, transparent 28%)
                `,
                filter: 'blur(8px)',
              }}
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-forest-700 flex items-center justify-between text-[10px] font-mono">
            <span className="text-cream-500">predictive heatmap</span>
            <span className="text-sage-500">● live</span>
          </div>
        </div>

        {/* Навигация */}
        <nav className="relative z-20 max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-base md:text-lg text-cream-100 whitespace-nowrap shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse shrink-0" />
            Attention Analyzer
          </Link>
          <div className="flex items-center gap-2 md:gap-4 text-sm shrink-0">
            {user ? (
              <Link
                to="/app"
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-md bg-sage-500 text-forest-950 hover:bg-sage-400 transition font-medium text-xs md:text-sm whitespace-nowrap"
              >
                Кабинет
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-cream-500 hover:text-cream-100 transition text-xs md:text-sm whitespace-nowrap px-1"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 md:px-4 md:py-2 rounded-md bg-sage-500 text-forest-950 hover:bg-sage-400 transition font-medium text-xs md:text-sm whitespace-nowrap"
                >
                  Начать
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Контент hero */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-32 min-h-[80vh] flex flex-col justify-center">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 mb-6 text-xs font-mono text-[#A3C1AD] border border-[#A3C1AD]/30 rounded-full bg-[#A3C1AD]/5">
              Visual Saliency · Predictive UX
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-[#E8EDE9]">
              Узнайте, куда смотрит пользователь
              <span className="text-[#A3C1AD]"> до запуска сайта</span>
            </h1>
            <p className="mt-6 text-base md:text-xl text-[#8A9A91] max-w-2xl">
              Загрузите скриншот макета — система построит прогностическую тепловую карту внимания и
              подскажет, какие элементы работают, а какие пользователь пропустит.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={user ? '/app' : '/register'}
                className="px-6 py-3 rounded-md bg-[#A3C1AD] text-[#0E1311] hover:bg-[#B8D4C2] transition font-semibold text-center"
              >
                {user ? 'Открыть кабинет' : 'Попробовать бесплатно'}
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-md border border-[#2A3530] text-[#E8EDE9] hover:border-[#A3C1AD]/60 hover:bg-[#1F2823]/50 transition font-semibold text-center"
              >
                Войти
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-[#8A9A91] font-mono">
              <span>◆ 3 компоненты saliency</span>
              <span>◆ 40 960 точек на карту</span>
              <span>◆ Оценка ROI 0–100</span>
            </div>
          </div>
        </div>

        {/* Градиент-переход */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0E1311] pointer-events-none" />
      </div>

      {/* ========== STEPS ========== */}
      <section className="relative max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#E8EDE9]">Как это работает</h2>
        <p className="text-[#8A9A91] mb-10">Три шага — от макета до инсайтов.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="p-6 rounded-xl bg-[#161D19] border border-[#2A3530] hover:border-[#A3C1AD]/40 transition"
            >
              <div className="text-3xl font-mono text-[#A3C1AD] mb-3">{s.n}</div>
              <h3 className="font-semibold mb-2 text-[#E8EDE9]">{s.title}</h3>
              <p className="text-sm text-[#8A9A91]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="relative max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#E8EDE9]">Что внутри</h2>
        <p className="text-[#8A9A91] mb-10">
          Классическая веб-аналитика смотрит назад. Мы смотрим вперёд.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-xl bg-gradient-to-br from-[#161D19] to-[#161D19]/40 border border-[#2A3530] hover:border-[#D4C5B0]/30 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-[#A3C1AD]/10 border border-[#A3C1AD]/30 mb-4 flex items-center justify-center text-[#A3C1AD] text-sm font-bold">
                ✦
              </div>
              <h3 className="font-semibold mb-2 text-[#E8EDE9]">{f.title}</h3>
              <p className="text-sm text-[#8A9A91]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="relative max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="p-8 md:p-12 rounded-2xl bg-[#161D19] border border-[#2A3530] text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 text-[#E8EDE9]">
            Проверьте свой макет прямо сейчас
          </h2>
          <p className="text-[#8A9A91] mb-6 max-w-xl mx-auto">
            Регистрация за 10 секунд. Загрузите скриншот — получите heatmap и UX-рекомендации.
          </p>
          <Link
            to={user ? '/app' : '/register'}
            className="inline-block px-8 py-3 rounded-md bg-[#A3C1AD] text-[#0E1311] hover:bg-[#B8D4C2] transition font-semibold"
          >
            {user ? 'В кабинет' : 'Начать бесплатно'}
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-[#2A3530] px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-[#8A9A91]">
          <div>© {new Date().getFullYear()} Attention Analyzer</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-[#E8EDE9] transition">
              Политика конфиденциальности
            </Link>
            <a
              href="https://github.com/frynn/attention-analyzer"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#E8EDE9] transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
