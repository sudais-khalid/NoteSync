import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-hairline bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold text-ink">NoteSync</span>
          <span className="label-mono hidden sm:inline">annotated lecture notes</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm text-ink-muted hover:text-ink">
                Lectures
              </Link>
              <Link to="/record" className="text-sm text-ink-muted hover:text-ink">
                Record
              </Link>
              <span className="label-mono hidden md:inline">{user?.fullName || user?.email}</span>
              <Button variant="outline" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-ink-muted hover:text-ink">
                Log in
              </Link>
              <Button variant="amber" onClick={() => navigate('/register')}>
                Get started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
