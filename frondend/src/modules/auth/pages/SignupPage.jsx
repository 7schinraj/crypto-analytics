import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/AuthLayout.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Alert from '../../../components/ui/Alert.jsx';
import { signup, clearError, resetSignupSuccess } from '../../../store/slices/authSlice';
import styles from './AuthForms.module.css';

const HERO_STATS = [
  { label: 'Active Traders', value: '50K+' },
  { label: 'Avg. Return', value: '+18.4%' },
  { label: 'Market Assets', value: '2.4K+' },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, signupSuccess } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (signupSuccess) {
      dispatch(resetSignupSuccess());
      navigate('/login', { state: { signupSuccess: true } });
    }
    return () => dispatch(clearError());
  }, [signupSuccess, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) dispatch(clearError());
  };

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = 'Username is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email is invalid';
    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 8) errors.password = 'Password must be 8+ chars';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    dispatch(signup({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password
    }));
  };

  return (
    <AuthLayout
      headline="Join the Future of Crypto Trading"
      sub="Create an account and access institutional-grade analytics and real-time market insights."
      stats={HERO_STATS}
    >
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Get Started</h2>
          <p className={styles.formSubtitle}>Create your free account in seconds.</p>
        </div>

        <Alert type="error" message={error} id="signup-error" />

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="signup-username"
            name="username"
            label="Username"
            placeholder="johndoe"
            value={form.username}
            onChange={handleChange}
            error={fieldErrors.username}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          />
          <Input
            id="signup-email"
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
            id="signup-password"
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

          <Button type="submit" loading={loading} id="signup-btn">
            Create Account
          </Button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
