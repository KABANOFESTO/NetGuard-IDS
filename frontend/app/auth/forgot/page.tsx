'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForgotPasswordMutation } from '@/lib/redux/slices/AuthSlice';

export default function Forgot() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [forgotPassword, { isLoading, isSuccess, isError, error: mutationError }] = useForgotPasswordMutation();

    // Clear messages after successful submission
    useEffect(() => {
        if (isSuccess && message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 10000); // Clear success message after 10 seconds

            return () => clearTimeout(timer);
        }
    }, [isSuccess, message]);

    // Handle RTK Query errors automatically
    useEffect(() => {
        if (isError && mutationError) {
            handleApiError(mutationError);
        }
    }, [isError, mutationError]);

    const handleApiError = (err: any) => {
        if (err?.status === 404) {
            setError('Email not found in our system.');
        } else if (err?.status === 429) {
            setError('Too many requests. Please try again later.');
        } else if (err?.status === 500) {
            setError('Server error. Please try again later.');
        } else if (err?.data?.message) {
            setError(err.data.message);
        } else if (err?.data?.email) {
            setError(Array.isArray(err.data.email) ? err.data.email[0] : err.data.email);
        } else if (err?.data?.detail) {
            setError(err.data.detail);
        } else if (err?.data?.non_field_errors) {
            setError(Array.isArray(err.data.non_field_errors) ? err.data.non_field_errors[0] : err.data.non_field_errors);
        } else {
            setError('Something went wrong. Please try again.');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Clear previous messages
        setMessage('');
        setError('');

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const result = await forgotPassword({ email }).unwrap();

            // Handle success response
            if (result?.message) {
                setMessage(result.message);
            } else {
                setMessage('Password reset link has been sent to your email! Check your inbox and spam folder.');
            }

            // Clear the form
            setEmail('');
        } catch (err: any) {
            // Error handling is now done in useEffect
            console.error('Forgot password error:', err);
        }
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <div className="min-h-screen flex items-center bg-cover bg-center"
            style={{
                backgroundImage: "url('/login.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}>

            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black/40"></div>

            <div className="relative z-10 w-full max-w-2xl lg:ml-16 ml-8">
                <div className="backdrop-blur-sm bg-black/20 rounded-xl shadow-2xl border border-blue-500/20 overflow-hidden">
                    <div className="p-10 lg:p-12">
                        <div className="flex flex-col items-start mb-10">
                            <h2 className="text-4xl font-bold text-white mb-3">Forgot Password? <span>🤔</span></h2>
                            <p className="text-blue-100 text-lg">Enter your email to receive a password reset link.</p>
                        </div>

                        {/* Success Message */}
                        {message && (
                            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                                <div className="flex items-start">
                                    <span className="text-green-400 mr-2">✓</span>
                                    <p className="text-green-300 text-sm">{message}</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                                <div className="flex items-start">
                                    <span className="text-red-400 mr-2">⚠</span>
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <label htmlFor="email" className="block text-base font-medium text-blue-300 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        // Clear error when user starts typing
                                        if (error) setError('');
                                    }}
                                    placeholder="yourname@gmail.com"
                                    className={`appearance-none block w-full px-5 py-4 bg-black/30 text-white placeholder-gray-500 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-lg ${error
                                            ? 'border-red-500/50 focus:ring-red-500'
                                            : 'border-blue-500/30 focus:ring-blue-500'
                                        }`}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                                <p className="text-sm text-gray-400 mt-2">
                                    We'll send a password reset link to this email address.
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <Link
                                    href="/auth"
                                    className="text-sm text-gray-300 hover:text-white transition-colors flex items-center"
                                >
                                    <span className="mr-1">←</span> Back To Login
                                </Link>
                                {isSuccess && (
                                    <Link
                                        href="/auth"
                                        className="text-sm text-green-300 hover:text-green-200 transition-colors"
                                    >
                                        Go to Login →
                                    </Link>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading || !email.trim() || !isValidEmail(email)}
                                    className="w-full flex justify-center items-center py-5 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : 'Send Reset Link'}
                                </button>

                                {/* Button helper text */}
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    This may take a few moments to arrive
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}