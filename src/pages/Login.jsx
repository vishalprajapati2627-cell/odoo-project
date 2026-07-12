import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Login.css';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setError('');
    login(email);
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <form className="login-card card" onSubmit={handleSubmit}>
        <h1 className="login-title">AssetFlow — {mode === 'login' ? 'Login' : 'Sign up'}</h1>

        <div className="login-avatar">AF</div>

        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          className="input"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="field-label" style={{ marginTop: 14 }} htmlFor="password">Password</label>
        <input
          id="password"
          className="input"
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === 'login' && (
          <div className="login-forgot">
            <a href="#" onClick={(e) => e.preventDefault()}>Forgot password</a>
          </div>
        )}

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 18, padding: '11px 0' }}>
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>

        <hr className="login-divider" />

        {mode === 'login' ? (
          <>
            <p className="login-note-title">New here?</p>
            <p className="login-note">Signing up creates an employee account. Admin roles are assigned later in Organization Setup.</p>
            <button type="button" className="btn" style={{ width: '100%' }} onClick={() => setMode('signup')}>
              Create Account
            </button>
          </>
        ) : (
          <>
            <p className="login-note">Already have an account?</p>
            <button type="button" className="btn" style={{ width: '100%' }} onClick={() => setMode('login')}>
              Back to login
            </button>
          </>
        )}

        <p className="login-hint">Demo tip: log in with any email starting "admin" (e.g. admin@company.com) to see the Admin role, or anything else for an Employee account.</p>
      </form>
    </div>
  );
}
