import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export default function PrivacyPage() {
  usePageMeta(
    'Политика конфиденциальности — Attention Analyzer',
    'Как Attention Analyzer обрабатывает, хранит и защищает персональные данные пользователей.',
  );

  return (
    <div className="min-h-screen bg-forest-950 text-cream-100">
      <nav className="border-b border-forest-700 px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-sm text-sage-500 hover:text-sage-400 transition">
            ← На главную
          </Link>
          <div className="font-bold">Attention Analyzer</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-6 text-cream-100 leading-relaxed">
        <h1 className="text-3xl md:text-4xl font-bold">Политика конфиденциальности</h1>
        <p className="text-sm text-cream-500">
          Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </p>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">1. Какие данные мы собираем</h2>
          <p>
            При регистрации мы сохраняем{' '}
            <strong className="text-cream-100">адрес электронной почты</strong> и{' '}
            <strong className="text-cream-100">хэш пароля</strong> (алгоритм bcrypt, 10 раундов).
            Пароль в открытом виде не хранится и не передаётся третьим лицам.
          </p>
          <p className="mt-2">
            При загрузке макетов мы сохраняем{' '}
            <strong className="text-cream-100">изображения</strong> (PNG/JPG) и результаты их
            анализа: матрицу saliency, размеры, автоматический UX-отчёт.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">2. Как мы используем данные</h2>
          <p>
            Данные используются <strong className="text-cream-100">исключительно</strong> для работы
            сервиса: аутентификации, отображения ваших проектов и анализа, генерации отчётов. Мы не
            продаём, не передаём и не публикуем ваши данные.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">3. Где хранятся данные</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Метаданные (пользователи, проекты, анализы) — PostgreSQL в облаке Neon (EU Central).
            </li>
            <li>Загруженные изображения — на сервере приложения в приватной директории.</li>
            <li>
              Пароли — только в виде bcrypt-хэшей; восстановление пароля через email (при наличии
              соответствующей функции).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">4. Ваши права</h2>
          <p>
            Вы можете в любой момент удалить свои проекты и связанные с ними анализы через
            интерфейс. Удаление проекта каскадно удаляет все его анализы, зоны интереса (ROI) и
            загруженные файлы. Аккаунт также можно удалить по запросу через GitHub Issues.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">5. Безопасность</h2>
          <p>
            Соединение с сервером защищено HTTPS (в production). Аутентификация — JWT-токены с
            истечением срока действия. Вход в кабинет требует действующего токена, данные
            пользователя изолированы на уровне запросов к БД.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">6. Cookies и трекинг</h2>
          <p>
            Мы <strong className="text-cream-100">не используем</strong> сторонние cookies,
            аналитические трекеры, рекламные пиксели. Для сохранения сессии используется{' '}
            <code className="px-1 py-0.5 rounded bg-forest-900 text-sage-500 text-sm">
              localStorage
            </code>{' '}
            браузера (JWT-токен), который можно очистить средствами браузера в любой момент.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">7. Контакты</h2>
          <p>
            Вопросы по обработке данных — через{' '}
            <a
              href="https://github.com/frynn/attention-analyzer/issues"
              className="text-sage-500 hover:text-sage-400 underline"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Issues
            </a>
            .
          </p>
        </section>

        <p className="text-xs text-cream-500 mt-12 pt-6 border-t border-forest-700">
          Данная политика составлена для курсового проекта и не является юридическим документом. Для
          production-развёртывания требуется консультация юриста и адаптация под применимое
          законодательство (GDPR, 152-ФЗ и др.).
        </p>
      </main>
    </div>
  );
}
