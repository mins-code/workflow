import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ onAuthSuccess }) => { // 💡 Accepting onAuthSuccess prop from App.jsx
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '', 
        role: 'Team Member' // Default role for signup
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Base URL for the backend
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
            // FIX: Use the absolute URL with the base path
            const url = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/signup`;
            
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password, name: formData.name, role: formData.role }; // Include role

            const response = await axios.post(url, payload);

            if (isLogin) {
                // Login Success: Store the JWT and notify parent component
                localStorage.setItem('token', response.data.token);
                onAuthSuccess(); // Notify App.jsx
                navigate('/dashboard'); 
            } else {
                // Signup Success: Switch to login mode
                setIsLogin(true);
                setFormData({ email: '', password: '', name: '', role: 'Team Member' });
                alert('Signup successful! Please log in.');
            }
        } catch (err) {
            // Display specific backend error message (400/401)
            setError(err.response?.data?.error || 'An unexpected error occurred. Please check the backend terminal.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // NOTE: Removed redundant handleSignup function

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {isLogin ? 'Log In' : 'Sign Up'}
                </h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Your Name"
                                required={!isLogin}
                            />
                        </div>
                    )}
                    {/* ... Email and Password Inputs remain the same ... */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your Email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your Password"
                            required
                        />
                    </div>
                    {/* End Inputs */}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 font-semibold"
                        disabled={isLoading}
                    >
                        {isLoading ? (isLogin ? 'Logging in...' : 'Signing up...') : isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-sm text-gray-500 mt-4 text-center">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(null); }} // Clear error on toggle
                        className="text-blue-500 hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;