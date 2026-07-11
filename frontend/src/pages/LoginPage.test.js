import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import client from '../api/client';

jest.mock('../api/client');

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  test('renders email and password fields and a submit button', () => {
    renderLogin();
    expect(screen.getByText('Log in to NoteSync')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@university.edu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('shows the API error message when login fails', async () => {
    client.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials' } } });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('you@university.edu'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });

  test('stores the token on successful login', async () => {
    client.post.mockResolvedValueOnce({ data: { success: true, token: 'jwt-token', user: { email: 'a@b.com' } } });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('you@university.edu'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('notesync_token')).toBe('jwt-token');
    });
  });
});
