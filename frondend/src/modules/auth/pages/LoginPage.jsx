import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/AuthLayout.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Alert from '../../../components/ui/Alert.jsx';
import { login, clearError } from '../../../store/slices/authSlice';
import styles from './AuthForms.module.css';

const HERO_STATS = [
  { label: 'Daily Volume', value: '$2.1B+' },
  { label: 'Security Score', value: '99.9%' },
  { label: 'Users Worldwide', value: '1M+' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (location.state?.signupSuccess) {
      setSuccessMsg('Account created successfully! Please sign in.');
    }
    return () => dispatch(clearError());
  }, [location.state, dispatch]);

  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('access_token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) dispatch(clearError());
  };

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = 'Email is required';
    if (!form.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    dispatch(login(form));
  };

  return (
    <AuthLayout
      headline="Welcome Back to Crypto Intelligence"
      sub="Sign in to your account and continue your trading journey with real-time data."
      stats={HERO_STATS}
    >
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Sign In</h2>
          <p className={styles.formSubtitle}>Enter your credentials to access your dashboard.</p>
        </div>

        <Alert type="success" message={successMsg} id="login-success" />
        <Alert type="error" message={error} id="login-error" />

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="login-email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="name@company.com"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
          />
          <Input
            id="login-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            rightElement={
              <button type="button" onClick={() => setShowPass(!showPass)} className={styles.eyeBtn}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            }
          />

          <div className={styles.formAction}>
            <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </div>

          <Button type="submit" loading={loading} id="login-btn">
            Sign In
          </Button>
        </form>

        <p className={styles.switchLink}>
          Don't have an account? <Link to="/signup">Create one free</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
