import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <span className="brand">Fieldnotes</span>
        <p className="aside-copy">A quiet place to keep your work in order.</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}
