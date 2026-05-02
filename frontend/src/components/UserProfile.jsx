import React, { useState } from 'react';
import { authAPI } from '../services/api';

const UserProfile = ({ user, onUpdate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    university: user.university || '',
    fieldOfStudy: user.fieldOfStudy || '',
    educationLevel: user.educationLevel || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsLoading(true);
    try {
      const response = await authAPI.updateProfile(formData);
      onUpdate(response.user);
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) { setError('New passwords do not match'); return; }
    if (passwordData.newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      setSuccess('Password changed successfully.');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const inputClass = "w-full px-3.5 py-2.5 border border-claude-border rounded-lg text-sm text-claude-dark placeholder-claude-subtle focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition";
  const labelClass = "block text-sm font-medium text-claude-dark mb-1.5";

  const initials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Profile card */}
      <div className="bg-white rounded-xl border border-claude-border overflow-hidden">
        {/* Header banner */}
        <div className="bg-claude-dark px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-claude-orange flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{user.fullName}</h1>
                <p className="text-sm text-white/60 mt-0.5">{user.email}</p>
                {user.university && <p className="text-xs text-white/40 mt-0.5">{user.university}</p>}
              </div>
            </div>
            <button onClick={onLogout}
              className="text-sm font-medium text-white/80 hover:text-white border border-white/20 hover:border-white/50 px-4 py-2 rounded-lg transition">
              Sign out
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="px-6 pt-4">
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-sm">{success}</div>
          )}
        </div>

        {/* Profile info */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-claude-dark">Profile Information</h2>
            <button onClick={() => { setIsEditing(!isEditing); setError(''); setSuccess(''); }}
              className="text-xs font-medium text-claude-orange border border-claude-border hover:border-claude-orange hover:bg-claude-orange-light px-3 py-1.5 rounded-lg transition">
              {isEditing ? 'Cancel' : 'Edit profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>University</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Field of study</label>
                  <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Education level</label>
                  <select name="educationLevel" value={formData.educationLevel} onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-claude-border rounded-lg text-sm text-claude-dark focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-claude-orange transition cursor-pointer bg-white">
                    <option value="High School">High School</option>
                    <option value="Bachelor's">Bachelor's Degree</option>
                    <option value="Master's">Master's Degree</option>
                    <option value="PhD">PhD / Doctorate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="bg-claude-orange hover:bg-claude-orange-dark disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
                {isLoading ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Full name', value: user.fullName },
                { label: 'Email address', value: user.email },
                { label: 'University', value: user.university },
                { label: 'Field of study', value: user.fieldOfStudy },
                { label: 'Education level', value: user.educationLevel },
                { label: 'Member since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-claude-bg rounded-lg border border-claude-border px-4 py-3">
                  <p className="text-xs text-claude-subtle mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-claude-dark">{value || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security card */}
      <div className="bg-white rounded-xl border border-claude-border px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-claude-dark">Security</h2>
          <button onClick={() => { setIsChangingPassword(!isChangingPassword); setError(''); setSuccess(''); }}
            className="text-xs font-medium text-claude-orange border border-claude-border hover:border-claude-orange hover:bg-claude-orange-light px-3 py-1.5 rounded-lg transition">
            {isChangingPassword ? 'Cancel' : 'Change password'}
          </button>
        </div>

        {isChangingPassword ? (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div>
              <label className={labelClass}>Current password</label>
              <input type="password" name="currentPassword" value={passwordData.currentPassword}
                onChange={handlePasswordChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <input type="password" name="newPassword" value={passwordData.newPassword}
                onChange={handlePasswordChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Confirm new password</label>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword}
                onChange={handlePasswordChange} required className={inputClass} />
            </div>
            <button type="submit" disabled={isLoading}
              className="bg-claude-orange hover:bg-claude-orange-dark disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
              {isLoading ? 'Changing...' : 'Change password'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-claude-muted">Password was last updated on your account settings.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;