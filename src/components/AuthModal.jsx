import React, { useState, useEffect } from 'react';
import { Sparkles, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginUser, signupUser, loginWithGoogle } from '../services/firebaseService';
import './AuthModal.css';

const parseAuthError = (err) => {
  const code = err?.code || '';
  const message = err?.message || '';

  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your-domain.netlify.app';
    return `Domain not authorized. Please add "${currentHost}" in Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
  }
  if (code === 'auth/internal-error' || message.includes('internal-error')) {
    return 'Firebase authentication error. Please verify Google Sign-In is enabled and your Netlify domain is added under Authorized Domains in Firebase Console.';
  }
  if (code === 'auth/user-not-found' || message.includes('user-not-found')) {
    return 'Email does not exist. Please check your email address or click Sign Up.';
  }
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || message.includes('wrong-password') || message.includes('invalid-credential')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
    return 'An account with this email already exists. Please Sign In instead.';
  }
  if (code === 'auth/weak-password' || message.includes('weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
    return 'Google Sign-In popup was closed before completing login.';
  }
  if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
    return 'Google Sign-In popup was blocked by browser. Please allow popups for this site.';
  }
  if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
    return 'Too many failed login attempts. Access temporarily locked. Please try again later.';
  }
  if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  return message || 'Authentication failed. Please check your details.';
};

export const AuthModal = ({
  isOpen,
  onClose,
  onAuthSuccess,
  userRole = 'Student'
}) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isFaculty = userRole === 'Faculty';

  // If Faculty is chosen on the navbar, lock to login mode (never show signup)
  useEffect(() => {
    if (isFaculty) {
      setMode('login');
    }
  }, [isFaculty, isOpen]);

  if (!isOpen) return null;

  const handleSuccess = (user) => {
    setLoading(false);
    setErrorMsg('');
    if (onAuthSuccess) onAuthSuccess(user);
    if (onClose) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const user = await loginUser(email, password);
        handleSuccess(user);
      } else {
        const user = await signupUser(email, password, displayName);
        handleSuccess(user);
      }
    } catch (err) {
      setErrorMsg(parseAuthError(err));
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const user = await loginWithGoogle();
      handleSuccess(user);
    } catch (err) {
      setLoading(false);
      setErrorMsg(parseAuthError(err));
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-modal-card animate-fade-in">
        <button
          onClick={onClose}
          className="auth-modal-close"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-icon-badge">
            <Sparkles size={24} />
          </div>
          <h2 className="font-serif auth-modal-title">
            {isFaculty 
              ? 'Faculty Sign In' 
              : (mode === 'login' ? 'Student Sign In' : 'Create Student Profile')}
          </h2>
          <p className="auth-modal-subtitle">
            {isFaculty
              ? 'Faculty mentorship & proposal review console'
              : 'Campus academic collaboration & project platform'}
          </p>
        </div>

        {errorMsg && (
          <div className="auth-error-alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Fast Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="auth-google-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {loading ? 'Connecting...' : (isFaculty ? 'Sign in with Google' : 'Continue with Google')}
        </button>

        <div className="auth-divider-row">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">OR EMAIL LOGIN</span>
          <div className="auth-divider-line" />
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && !isFaculty && (
            <div>
              <label className="auth-input-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivers"
                  className="auth-input-field"
                />
              </div>
            </div>
          )}

          <div>
            <label className="auth-input-label">
              {isFaculty ? 'Official Faculty Email' : 'University Email'}
            </label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isFaculty ? 'dr.jenkins@university.edu' : 'alex.rivers@university.edu'}
                className="auth-input-field"
              />
            </div>
          </div>

          <div>
            <label className="auth-input-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary auth-submit-btn"
          >
            {loading
              ? 'Authenticating...'
              : isFaculty
              ? 'Sign In as Faculty'
              : mode === 'login'
              ? 'Sign In as Student'
              : 'Create Student Account'}
          </button>
        </form>

        {/* ONLY STUDENTS GET SIGNUP OPTION. FACULTY NEVER SEES SIGNUP. */}
        {!isFaculty && (
          <div className="auth-switch-mode-text">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setErrorMsg(''); }} className="auth-toggle-btn">
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button onClick={() => { setMode('login'); setErrorMsg(''); }} className="auth-toggle-btn">
                  Sign In
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
