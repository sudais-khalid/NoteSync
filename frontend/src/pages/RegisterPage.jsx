import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ErrorBanner from '../components/common/ErrorBanner';

const EDUCATION_LEVELS = ['High School', "Bachelor's", "Master's", 'PhD', 'Other'];

const INITIAL_FORM = {
  fullName: '',
  email: '',
  password: '',
  university: '',
  fieldOfStudy: '',
  educationLevel: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
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
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="label-mono mb-2">start annotating</p>
          <h1 className="font-display text-3xl font-semibold">Create your NoteSync account</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <ErrorBanner message={error} />}

            <label className="flex flex-col gap-1">
              <span className="label-mono">Full name</span>
              <input
                required
                value={form.fullName}
                onChange={update('fullName')}
                className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="label-mono">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={update('email')}
                className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="label-mono">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={update('password')}
                className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
                placeholder="At least 8 characters"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="label-mono">University</span>
              <input
                required
                value={form.university}
                onChange={update('university')}
                className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="label-mono">Field of study</span>
                <input
                  required
                  value={form.fieldOfStudy}
                  onChange={update('fieldOfStudy')}
                  className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="label-mono">Education level</span>
                <select
                  required
                  value={form.educationLevel}
                  onChange={update('educationLevel')}
                  className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Button type="submit" variant="amber" disabled={submitting} className="mt-2 w-full">
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
