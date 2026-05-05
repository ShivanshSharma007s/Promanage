import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, UserPlus, Mail, Lock, User, Shield } from 'lucide-react';

const API = import.meta.env.DEV ? 'http://localhost:5000' : '';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    try {
      const { data } = await axios.post(`${API}${endpoint}`, formData);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">PM</div>
          <h1>ProManage</h1>
        </div>
        <h2 className="auth-title">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-subtitle">{isLogin ? 'Sign in to continue to your workspace' : 'Get started with your free account'}</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label"><User size={13} style={{verticalAlign: 'middle', marginRight: 4}} />Name</label>
              <input type="text" name="name" className="form-input" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label"><Mail size={13} style={{verticalAlign: 'middle', marginRight: 4}} />Email</label>
            <input type="email" name="email" className="form-input" placeholder="you@example.com" required value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label"><Lock size={13} style={{verticalAlign: 'middle', marginRight: 4}} />Password</label>
            <input type="password" name="password" className="form-input" placeholder="••••••••" required value={formData.password} onChange={handleChange} />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label"><Shield size={13} style={{verticalAlign: 'middle', marginRight: 4}} />Role</label>
              <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-primary-full" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode}>{isLogin ? 'Sign up' : 'Login'}</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
