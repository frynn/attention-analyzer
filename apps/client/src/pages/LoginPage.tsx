import { useActionState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { usePageMeta } from '../hooks/usePageMeta';
import AuthCard from '../components/AuthCard';
import SubmitButton from '../components/SubmitButton';

interface LoginState {
  values: { email: string };
  errors: { email?: string; password?: string; form?: string };
}

const initialState: LoginState = {
  values: { email: '' },
  errors: {},
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  usePageMeta(
    'Вход — Attention Analyzer',
    'Войдите в аккаунт Attention Analyzer, чтобы анализировать макеты и строить прогностические тепловые карты.',
  );

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const [state, formAction] = useActionState(async (_prev: LoginState, formData: FormData) => {
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    const errors: LoginState['errors'] = {};
    if (!email) errors.email = 'Введите email';
    else if (!EMAIL_RE.test(email)) errors.email = 'Некорректный email';
    if (!password) errors.password = 'Введите пароль';

    if (Object.keys(errors).length > 0) {
      return { values: { email }, errors };
    }

    try {
      await login(email, password);
      return { values: { email }, errors: {} };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          return { values: { email }, errors: { form: 'Неверный email или пароль' } };
        }
        if (err.statusCode === 400) {
          return { values: { email }, errors: { form: err.message } };
        }
        return { values: { email }, errors: { form: err.message } };
      }
      return { values: { email }, errors: { form: 'Не удалось войти. Попробуйте ещё раз.' } };
    }
  }, initialState);

  return (
    <AuthCard
      title="Attention Analyzer"
      subtitle="Вход в аккаунт"
      footer={
        <span>
          Нет аккаунта?{' '}
          <Link to="/register" className="text-sage-500 hover:text-sage-400">
            Зарегистрироваться
          </Link>
        </span>
      }
    >
      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="Email"
            defaultValue={state.values.email}
            autoComplete="email"
            aria-invalid={Boolean(state.errors.email)}
            aria-describedby={state.errors.email ? 'login-email-error' : undefined}
            className="w-full px-3 py-2 rounded bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-cream-500 focus:outline-none focus:border-sage-500 aria-[invalid=true]:border-red-500"
          />
          {state.errors.email && (
            <p id="login-email-error" className="mt-1 text-sm text-red-400">
              {state.errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="sr-only">
            Пароль
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Пароль"
            autoComplete="current-password"
            aria-invalid={Boolean(state.errors.password)}
            aria-describedby={state.errors.password ? 'login-password-error' : undefined}
            className="w-full px-3 py-2 rounded bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-cream-500 focus:outline-none focus:border-sage-500 aria-[invalid=true]:border-red-500"
          />
          {state.errors.password && (
            <p id="login-password-error" className="mt-1 text-sm text-red-400">
              {state.errors.password}
            </p>
          )}
        </div>

        {state.errors.form && (
          <p role="alert" className="text-sm text-red-400">
            {state.errors.form}
          </p>
        )}

        <SubmitButton label="Войти" pendingLabel="Вход..." />
      </form>
    </AuthCard>
  );
}
