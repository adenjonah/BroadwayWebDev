'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import '@/styles/login.css';

type LoginState = 'idle' | 'sending' | 'sent' | 'error';

export default function LoginPage() {
  const [state, setState] = useState<LoginState>('idle');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState('sending');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setState('error');
    } else {
      setState('sent');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Team Login</h1>
        <p>Enter your email to receive a magic link.</p>

        {state === 'sent' && (
          <div className="login-message login-message-success">
            Check your email for a login link.
          </div>
        )}

        {state === 'error' && (
          <div className="login-message login-message-error">
            Something went wrong. Please try again.
          </div>
        )}

        {state !== 'sent' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                name="email"
                placeholder="you@broadwaywebsites.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="form-submit"
              disabled={state === 'sending'}
            >
              {state === 'sending' ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
