import { useActionState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { usePageMeta } from '../hooks/usePageMeta';
import AuthCard from '../components/AuthCard';
import SubmitButton from '../components/SubmitButton';

const PASSWORD_MIN_LENGTH = 8;

interface RegisterState {
  values: { email: string };
  errors: { email?: string; password?: string; confirm?: string; form?: string };
}

const initialState: RegisterState = {
  values: { email: '' },
  errors: {},
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  usePageMeta(
    'Регистрация — Attention Analyzer',
    'Создайте аккаунт Attention Analyzer и начните анализировать визуальное внимание пользователей на ваших макетах.',
  );

  const { user, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const [state, formAction] = useActionState(async (_prev: RegisterState, formData: FormData) => {
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirm = String(formData.get('confirm') ?? '');

    const errors: RegisterState['errors'] = {};
    if (!email) errors.email = 'Введите email';
    else if (!EMAIL_RE.test(email)) errors.email = 'Некорректный email';
    if (!password) errors.password = 'Введите пароль';
    else if (password.length < PASSWORD_MIN_LENGTH)
      errors.password = `Минимум ${PASSWORD_MIN_LENGTH} символов`;
    if (!confirm) errors.confirm = 'Повторите пароль';
    else if (password !== confirm) errors.confirm = 'Пароли не совпадают';

    if (Object.keys(errors).length > 0) {
      return { values: { email }, errors };
    }

    try {
      await register(email, password);
      return { values: { email }, errors: {} };
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        return { values: { email }, errors: { email: 'Этот email уже зарегистрирован' } };
      }
      if (err instanceof ApiError && err.statusCode === 400) {
        return { values: { email }, errors: { form: err.message } };
      }
      return {
        values: { email },
        errors: { form: err instanceof Error ? err.message : 'Не удалось зарегистрироваться' },
      };
    }
  }, initialState);

  return (
    <AuthCard
      title="Attention Analyzer"
      subtitle="Создать аккаунт"
      footer={
        <span>
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-sage-500 hover:text-sage-400">
            Войти
          </Link>
        </span>
      }
    >
      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label htmlFor="reg-email" className="sr-only">
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="Email"
            defaultValue={state.values.email}
            autoComplete="email"
            aria-invalid={Boolean(state.errors.email)}
            aria-describedby={state.errors.email ? 'reg-email-error' : undefined}
            className="w-full px-3 py-2 rounded bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-cream-500 focus:outline-none focus:border-sage-500 aria-[invalid=true]:border-red-500"
          />
          {state.errors.email && (
            <p id="reg-email-error" className="mt-1 text-sm text-red-400">
              {state.errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-password" className="sr-only">
            Пароль
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            placeholder={`Пароль (мин. ${PASSWORD_MIN_LENGTH} символов)`}
            autoComplete="new-password"
            aria-invalid={Boolean(state.errors.password)}
            aria-describedby={state.errors.password ? 'reg-password-error' : undefined}
            className="w-full px-3 py-2 rounded bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-cream-500 focus:outline-none focus:border-sage-500 aria-[invalid=true]:border-red-500"
          />
          {state.errors.password && (
            <p id="reg-password-error" className="mt-1 text-sm text-red-400">
              {state.errors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-confirm" className="sr-only">
            Повторите пароль
          </label>
          <input
            id="reg-confirm"
            name="confirm"
            type="password"
            placeholder="Повторите пароль"
            autoComplete="new-password"
            aria-invalid={Boolean(state.errors.confirm)}
            aria-describedby={state.errors.confirm ? 'reg-confirm-error' : undefined}
            className="w-full px-3 py-2 rounded bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-cream-500 focus:outline-none focus:border-sage-500 aria-[invalid=true]:border-red-500"
          />
          {state.errors.confirm && (
            <p id="reg-confirm-error" className="mt-1 text-sm text-red-400">
              {state.errors.confirm}
            </p>
          )}
        </div>

        {state.errors.form && (
          <p role="alert" className="text-sm text-red-400">
            {state.errors.form}
          </p>
        )}

        <SubmitButton label="Зарегистрироваться" pendingLabel="Создание..." />
      </form>
    </AuthCard>
  );
}
