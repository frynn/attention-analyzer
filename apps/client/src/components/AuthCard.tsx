import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-950 text-cream-100 px-4">
      <div className="w-full max-w-sm p-6 bg-forest-900 border border-forest-700 rounded-lg space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-cream-500 text-sm mt-1">{subtitle}</p>
        </div>
        {children}
        <div className="pt-2 border-t border-forest-700 text-center text-sm text-cream-500">
          {footer}
        </div>
      </div>
    </div>
  );
}
