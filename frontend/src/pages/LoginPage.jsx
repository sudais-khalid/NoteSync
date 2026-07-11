import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ErrorBanner from '../components/common/ErrorBanner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not log in. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="label-mono mb-2">welcome back</p>
          <h1 className="font-display text-3xl font-semibold">Log in to NoteSync</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <ErrorBanner message={error} />}

            <label className="flex flex-col gap-1">
              <span className="label-mono">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={update('email')}
                className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
                placeholder="you@university.edu"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="label-mono">Password</span>
              <input
                type="password"
                required
                value={form.password}
                onChange={update('password')}
                className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
                placeholder="••••••••"
              />
            </label>

            <Button type="submit" variant="amber" disabled={submitting} className="mt-2 w-full">
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-ink-muted">
          New here?{' '}
          <Link to="/register" className="font-medium text-teal hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
