import React, { useState } from 'react';
import { authAPI } from '../services/api';

const EyeIcon = ({ open }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    )}
  </svg>
);

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    university: '', fieldOfStudy: '', educationLevel: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      onRegister(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 border border-claude-border rounded-lg text-sm text-claude-dark placeholder-claude-subtle focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition";
  const labelClass = "block text-sm font-medium text-claude-dark mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-claude-bg px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl border border-claude-border shadow-claude-lg p-8">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-claude-orange flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-claude-dark">Create your account</h2>
            <p className="text-claude-muted text-sm mt-1">Start learning smarter with NoteSync</p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="reg-fullName" className={labelClass}>Full name *</label>
                <input id="reg-fullName" name="fullName" type="text" required value={formData.fullName}
                  onChange={handleChange} placeholder="John Doe" className={inputClass} />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className={labelClass}>Email address *</label>
                <input id="reg-email" name="email" type="email" autoComplete="email" required
                  value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} />
              </div>

              {/* University */}
              <div>
                <label htmlFor="reg-university" className={labelClass}>University *</label>
                <input id="reg-university" name="university" type="text" required value={formData.university}
                  onChange={handleChange} placeholder="University of XYZ" className={inputClass} />
              </div>

              {/* Field of Study */}
              <div>
                <label htmlFor="reg-fieldOfStudy" className={labelClass}>Field of study *</label>
                <input id="reg-fieldOfStudy" name="fieldOfStudy" type="text" required value={formData.fieldOfStudy}
                  onChange={handleChange} placeholder="Computer Science" className={inputClass} />
              </div>

              {/* Education Level */}
              <div className="md:col-span-2">
                <label htmlFor="reg-educationLevel" className={labelClass}>Education level *</label>
                <select id="reg-educationLevel" name="educationLevel" required value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-claude-border rounded-lg text-sm text-claude-dark focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition cursor-pointer bg-white">
                  <option value="">Select level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD / Doctorate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className={labelClass}>Password *</label>
                <div className="relative">
                  <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password" required value={formData.password}
                    onChange={handleChange} placeholder="Min. 8 characters"
                    className={inputClass + ' pr-10'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-claude-subtle hover:text-claude-muted">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirmPassword" className={labelClass}>Confirm password *</label>
                <input id="reg-confirmPassword" name="confirmPassword"
                  type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                  required value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password" className={inputClass} />
              </div>
            </div>

            {/* Hint */}
            <p className="text-xs text-claude-muted bg-claude-bg border border-claude-border rounded-lg px-3 py-2">
              Password must be at least 8 characters and should be unique and secure.
            </p>

            <button type="submit" disabled={isLoading}
              className="w-full bg-claude-orange hover:bg-claude-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : 'Create account'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-claude-muted">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-semibold text-claude-orange hover:text-claude-orange-dark transition">
              Sign in
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-claude-subtle mt-5">
          By creating an account you agree to our Terms &amp; Privacy Policy &mdash; &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default Register;