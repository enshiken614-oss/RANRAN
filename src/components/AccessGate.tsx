'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import './access.css';

export function AccessGate() {
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) setError(result.error || '星门暂时无法开启，请稍后重试。');
      else window.location.reload();
    } catch {
      setError('暂时无法连接星门，请检查网络后重试。');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="access-scene">
      <div className="access-stars" aria-hidden="true" />
      <div className="access-orbit" aria-hidden="true" />
      <header className="access-brand">
        <Sparkles size={19} /> HER UNIVERSE <span>她的宇宙</span>
      </header>
      <section className="access-card" aria-labelledby="access-title">
        <span className="access-eyebrow">A PRIVATE LITTLE UNIVERSE</span>
        <h1 id="access-title">
          有一个宇宙，
          <br />
          只为你亮起。
        </h1>
        <p>
          每一颗星，都藏着一句只想对你说的话。
          <br />
          带上我们的钥匙，推开这扇星门。
        </p>
        <form onSubmit={enter}>
          <label htmlFor="universe-key">
            <LockKeyhole size={14} /> 宇宙通行口令
          </label>
          <input
            id="universe-key"
            name="password"
            type="password"
            autoComplete="current-password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="输入只属于我们的口令"
            required
            maxLength={512}
            aria-describedby={error ? 'access-error' : undefined}
            disabled={pending}
          />
          <button type="submit" disabled={pending || !code}>
            {pending ? '正在开启星门…' : '进入我们的宇宙'}
            <ArrowRight size={17} />
          </button>
          {error && (
            <p className="access-error" id="access-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <small>
          <LockKeyhole size={12} /> 这里的故事，只向拥有钥匙的人开放
        </small>
      </section>
      <footer className="access-footer">IN EVERY UNIVERSE, I CHOOSE YOU.</footer>
    </main>
  );
}
