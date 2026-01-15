import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.svg";
import styles from './Login.module.scss';

export default function Login() {
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState(() => {
    const savedEmail = localStorage.getItem('savedEmail') || '';
    const shouldRemember = localStorage.getItem('shouldRememberEmail') === 'true';

    return {
      email: shouldRemember ? savedEmail : '',
      password: ''
    };
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem('shouldRememberEmail') === 'true'
  );

  const message = location.state?.message;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setServerError('');
  }

  const validateForm = () => {
    setServerError('');
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password || formData.password.trim().length < 6) {
      newErrors.password = 'Password should contain at least 6 characters';
    }

    return newErrors;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);

      if (rememberMe) {
        localStorage.setItem('savedEmail', formData.email.trim());
        localStorage.setItem('shouldRememberEmail', 'true');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('shouldRememberEmail');
      }
    } catch (error) {
      console.error("Login error:", error);

      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setServerError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setServerError('Too many attempts. Try again later');
          break;
        default:
          setServerError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);

    if (isChecked) {
      localStorage.setItem('shouldRememberEmail', 'true');

      if (formData.email.trim()) {
        localStorage.setItem('savedEmail', formData.email.trim());
      }
    } else {
      localStorage.removeItem('shouldRememberEmail');
    }
  };

  return (
    <div className={styles.loginPage}>

      <div className={`${styles.bgBlob1} bg-blob-1`}></div>
      <div className={`${styles.bgBlob2} bg-blob-2`}></div>

      <div className={styles.container}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <img src={logo} className={`${styles.logoImg} img-cover`} alt="logo" />
            <h1 className={styles.title}>StudyFlow</h1>
          </div>
          <p className={styles.subtitle}>Welcome back! Please login to your account.</p>
        </div>

        <div className={styles.card}>
          {message && <div className='success-message'>{message}</div>}
          {serverError && <div className='error-message'>{serverError}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 5l8 5 8-5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="you@example.com"
                  className={`input-base ${errors.email ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
              </div>
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 8V6a4 4 0 118 0v2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••"
                  className={`input-base ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <div className={styles.rememberRow}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  disabled={loading}
                />
                <span>Remember email</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className={`${styles.submitButton} button-primary`}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className={styles.signupLink}>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}