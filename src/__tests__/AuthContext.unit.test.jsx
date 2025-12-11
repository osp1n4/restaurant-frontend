import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, AuthContext } from '../context/AuthContext';

describe('AuthContext', () => {
    it('login y logout del contexto por defecto no lanzan error', () => {
      // Usar el contexto fuera del provider
      function Consumer() {
        const { login, logout } = useContext(AuthContext);
        // Llamar a ambas funciones y verificar que no lanzan error
        expect(() => login()).not.toThrow();
        expect(() => logout()).not.toThrow();
        return <div>ok</div>;
      }
      render(<Consumer />);
      expect(screen.getByText('ok')).toBeInTheDocument();
    });
  function TestComponent() {
    const { isLoggedIn, user, login, logout } = useContext(AuthContext);
    return (
      <div>
        <span data-testid="isLoggedIn">{isLoggedIn ? 'yes' : 'no'}</span>
        <span data-testid="user">{user ? user.name : 'none'}</span>
        <button onClick={() => login({ name: 'Test User', email: 'test@example.com' })}>Login</button>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  it('proporciona valores iniciales correctos', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('no');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('login actualiza el estado y el usuario', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByText('Login').click();
    });
    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('yes');
    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
  });

  it('logout limpia el estado y el usuario', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    // Login primero
    await act(async () => {
      screen.getByText('Login').click();
    });
    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('yes');
    // Logout
    await act(async () => {
      screen.getByText('Logout').click();
    });
    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('no');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });
});
