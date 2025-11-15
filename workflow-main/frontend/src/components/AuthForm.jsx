import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '', 
        role: 'Team Member'
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:3000/api/auth'; 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const url = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/signup`;
            
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : { 
                    email: formData.email, 
                    password: formData.password, 
                    name: formData.name, 
                    role: formData.role
                }; 

            const response = await axios.post(url, payload);

            if (isLogin) {
                localStorage.setItem('token', response.data.token);
                onAuthSuccess();
                navigate('/dashboard'); 
            } else {
                setIsLogin(true);
                setFormData({ email: '', password: '', name: '', role: 'Team Member' });
                alert('Signup successful! Please log in.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An unexpected error occurred. Please check the backend terminal.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
            <div className="app-card w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-bold shadow-glow mx-auto mb-4 text-2xl">
                        WF
                    </div>
                    <h2 className="text-3xl font-bold text-dark-text mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-dark-text-secondary">
                        {isLogin ? 'Sign in to continue to Workflow' : 'Sign up to get started'}
                    </p>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-error bg-opacity-10 border border-error">
                        <p className="text-error text-sm">{error}</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="app-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="app-input"
                                    placeholder="John Doe"
                                    required={!isLogin}
                                />
                            </div>
                            
                            <div>
                                <label className="app-label">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="app-select"
                                    required={!isLogin}
                                >
                                    <option value="Team Member">Team Member</option>
                                    <option value="Developer">Developer</option>
                                    <option value="Senior Dev">Senior Developer</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Backend Lead">Backend Lead</option>
                                    <option value="Junior Dev">Junior Developer</option>
                                </select>
                                <p className="text-xs text-dark-muted mt-2">
                                    💡 Only Managers and Senior Developers can assign tasks
                                </p>
                            </div>
                        </>
                    )}
                    
                    <div>
                        <label className="app-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="app-input"
                            placeholder="you@company.com"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="app-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="app-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isLogin ? 'Signing in...' : 'Creating account...'}
                            </span>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-dark-text-secondary">
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button
                            onClick={() => { 
                                setIsLogin(!isLogin); 
                                setError(null);
                                setFormData({ email: '', password: '', name: '', role: 'Team Member' });
                            }}
                            className="text-primary hover:text-secondary font-semibold transition-colors"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;