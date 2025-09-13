import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignUpPage.css';
import { login, register } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginSignUpPage = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            if (activeTab === 'login') {
                const userData = await login({ 
                    email: formData.email, 
                    password: formData.password 
                });
                setUser(userData);
                navigate('/todo');
            } else {
                const userData = await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                setUser(userData);
                navigate('/todo');
            }
        } catch (error) {
            setError(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-signup-container">
            <div className="login-signup-card">
                <div className="login-signup-logo">TaskMaster</div>
                <h1 className="login-signup-title">Welcome</h1>
                <p className="login-signup-subtitle">
                    {activeTab === 'login' 
                        ? 'Sign in to access your tasks and notes' 
                        : 'Create an account to get started'}
                </p>

                <div className="tab-container">
                    <div 
                        className={`tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                    </div>
                    <div 
                        className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Sign Up
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {activeTab === 'signup' && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Full Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                className="form-input" 
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            className="form-input" 
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            className="form-input" 
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="button-container">
                        {activeTab === 'login' ? (
                            <>
                                <button 
                                    type="submit" 
                                    className="primary-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>
                                <button 
                                    type="button" 
                                    className="secondary-button"
                                    onClick={() => setActiveTab('signup')}
                                    disabled={isLoading}
                                >
                                    Create Account
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    type="button" 
                                    className="secondary-button"
                                    onClick={() => setActiveTab('login')}
                                    disabled={isLoading}
                                >
                                    Back to Login
                                </button>
                                <button 
                                    type="submit" 
                                    className="primary-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Signing up...' : 'Sign Up'}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginSignUpPage;