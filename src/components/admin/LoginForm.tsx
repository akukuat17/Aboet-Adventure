'use client';

import { useActionState } from 'react';
import { login } from '@/actions/auth';
import SubmitButton from './SubmitButton';

const CSS = `
.login-wrap{--bg:#f4f9f3;--surface:#fff;--primary:#1f7a46;--primary-dark:#145c34;--primary-soft:#dff3e6;--text:#16241a;--text-muted:#6b7d70;--border:rgba(20,40,25,.08);--radius-lg:20px;--radius-md:14px;
background:var(--bg);font-family:'Atkinson Hyperlegible Next',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.login-card{background:var(--surface);border-radius:var(--radius-lg);box-shadow:0 3px 14px rgba(20,40,25,.07);padding:40px 32px;width:100%;max-width:400px}
.login-card .brand{display:flex;align-items:center;gap:10px;margin-bottom:24px}
.login-card .mark{width:40px;height:40px;border-radius:12px;background:var(--primary-soft);display:flex;align-items:center;justify-content:center}
.login-card .mark .material-symbols-outlined{color:var(--primary-dark);font-size:24px}
.login-card .brand span.t{font-family:'Epilogue',sans-serif;font-weight:800;font-size:22px}
.login-card h1{font-size:24px;margin-bottom:8px}
.login-card p{color:var(--text-muted);margin-bottom:24px}
.login-card .fg{margin-bottom:16px}
.login-card label{display:block;font-size:13px;font-weight:700;color:var(--text-muted);margin-bottom:6px}
.login-card input[type=email],.login-card input[type=password]{width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius-md);font-family:inherit;font-size:16px;box-sizing:border-box}
.login-card input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft)}
.login-card .lbtn{width:100%;background:var(--primary);color:#fff;border:none;font-size:16px;font-weight:800;padding:16px;border-radius:999px;min-height:54px;cursor:pointer}
.login-card .lbtn:hover{opacity:.9}
.login-card .error{color:#dc2626;font-size:13px;margin-bottom:16px;display:block}
`;

export default function LoginForm() {
  const [state, action] = useActionState(login, null);
  return (
    <div className="login-wrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="login-card">
        <div className="brand">
          <span className="mark"><span className="material-symbols-outlined">landscape</span></span>
          <span className="t">Aboet Admin</span>
        </div>
        <h1>Masuk ke Dashboard</h1>
        <p>Masukkan email dan password untuk mengakses panel admin.</p>
        <form action={action}>
          <div className="fg">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required autoComplete="email" defaultValue={state?.email ?? ''} />
          </div>
          <div className="fg">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required autoComplete="current-password" />
          </div>
          <div className="fg">
            <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
              <input type="checkbox" name="remember" className="w-4 h-4 accent-primary" />
              <span className="text-sm text-gray-700" style={{ fontWeight: 400 }}>Ingat saya</span>
            </label>
          </div>
          {state?.error && <div className="error" role="alert">{state.error}</div>}
          <SubmitButton className="lbtn" pendingText="Memeriksa…">Masuk</SubmitButton>
        </form>
      </div>
    </div>
  );
}
