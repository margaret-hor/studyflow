import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.svg";
import { EmailIcon, LockIcon, EyeOpenIcon, EyeClosedIcon, UserProfileIcon } from "../../components/icons";
import styles from './Signup.module.scss';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    if (!formData.username.trim() || formData.username.trim().length < 2) {
      newErrors.username = 'Name should contain at least 2 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password || formData.password.trim().length < 6) {
      newErrors.password = 'Password should contain at least 6 characters';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password.trim() !== formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await signup(formData.email, formData.password, formData.username);
      navigate('/dashboard');
    } catch (error) {
      console.error("Signup error:", error);

      switch (error.code) {
        case 'auth/email-already-in-use':
          setServerError('This email is already registered');
          break;
        case 'auth/invalid-email':
          setServerError('Invalid email address');
          break;
        case 'auth/weak-password':
          setServerError('Password should be at least 6 characters');
          break;
        default:
          setServerError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.signupPage}>

      <div className={`${styles.bgBlob1} bg-blob-1`}></div>
      <div className={`${styles.bgBlob2} bg-blob-2`}></div>

      <div className={styles.container}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <img src={logo} className={`${styles.logoImg} img-cover`} alt="logo" />
          </div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Start your learning journey with <span className={styles.logoTitle}>StudyFlow</span></p>
        </div>

        <div className={styles.card}>
          {serverError && <div className='error-message'>{serverError}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">Full Name</label>
              <div className={styles.inputWrapper}>
                <UserProfileIcon className={styles.inputIcon} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="John Doe"
                  className={`input-base ${errors.username ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
              </div>
              {errors.username && <span className={styles.error}>{errors.username}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <div className={styles.inputWrapper}>
                <EmailIcon className={styles.inputIcon} />
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
                <LockIcon className={styles.inputIcon} />
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeClosedIcon />
                  ) : (
                    <EyeOpenIcon />
                  )}
                </button>
              </div>
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles.inputWrapper}>
                <LockIcon className={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••"
                  className={`input-base ${errors.confirmPassword ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showPassword)}
                  className={styles.togglePassword}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeClosedIcon />
                  ) : (
                    <EyeOpenIcon />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>

            <button type="submit" disabled={loading} className={`${styles.submitButton} button-primary`}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className={styles.loginLink}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}