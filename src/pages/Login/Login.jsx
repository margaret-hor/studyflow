import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';
import styles from './Login.module.scss';
import cx from 'classnames';
import { BiError } from "react-icons/bi";
import { TbEyeClosed } from "react-icons/tb";
import { FaEye } from "react-icons/fa";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }
      if (!isLogin && !formData.name) {
        throw new Error('Enter your name');
      }

      const email = formData.email.trim().toLowerCase();
      const password = formData.password.trim();
      const name = formData.name.trim();

      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Full error object:', error); 

      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters long');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(error.message || 'Failed to authenticate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  }

  const Icons = {
    Error: () => <span className={cx('error-icon')}><BiError /></span>,
    EyeClosed: () => <span className={cx('eye-closed-icon')}><TbEyeClosed /></span>,
    EyeOpen: () => <span className={cx('eye-icon')}><FaEye /></span>
  };
  return (
    <section className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <header className={styles.loginHeader}>
          <div className={styles.logo}>
            <img src={logo} className={styles.logoImg} alt="logo" />
            <span className={styles.logoText}>StudyFlow</span>
          </div>
          <div className={styles.welcomeText}>
            <h1 className={styles.title}>
              {isLogin ? 'Welcome back' : 'Start studying effectively'}
            </h1>
            <p className={styles.subtitle}>
              {isLogin ? 'Log in to your account to access all features' : 'Create an account and gain access to powerful learning tools'}
            </p>
          </div>
        </header>

        <div className={styles.loginCard}>
          {error && (
            <div className={cx('error-alert')}>
              <Icons.Error />
              <span className={cx('error-text')}>{error}</span>
            </div>
          )}
          <div className={styles.loginForm}>
            {!isLogin && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={styles.formInput}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className={styles.formInput}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={styles.formInput}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  disabled={loading}
                >
                  {showPassword ? <Icons.EyeClosed /> : <Icons.EyeOpen />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <span className={styles.loadingSpinner} />
                  Loading...
                </>
              ) : (
                isLogin ? 'Login' : 'Create account'
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}