"use client";
import React, { useState } from 'react';
import { useSendContactMessageMutation } from '@/lib/redux/slices/ContactMessageSlice';
import { ArrowRight, User, Mail, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        agreeToPrivacy: false
    });
    const [charCount, setCharCount] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sendContactMessage] = useSendContactMessageMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });

            if (name === 'message') {
                setCharCount(value.length);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await sendContactMessage(formData).unwrap();
            setIsSubmitted(true);
            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({ name: '', email: '', phone: '', message: '', agreeToPrivacy: false });
                setCharCount(0);
            }, 3000);
        } catch (error) {
            alert("Failed to send message. Please try again later.");
        }
        setIsSubmitting(false);
    };

    return (
        <section id="contact" className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 min-h-screen overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]"></div>

            <div className="relative min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Side - Text Content */}
                        <div className="space-y-8">
                            <div className="inline-block">
                                <span className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm text-slate-300 backdrop-blur-sm">
                                    Contact Us
                                </span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                                Let's Get In Touch.
                            </h1>

                            <div className="flex items-baseline gap-2 text-lg text-slate-400">
                                <span>Or just reach out manually to</span>
                                <a href="mailto:ae2c@ae2c.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                    ae2c@ae2c.com
                                </a>
                                <span>.</span>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div>
                            {isSubmitted ? (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-3">Thank You!</h3>
                                    <p className="text-slate-400 text-lg">We've received your message and will get back to you shortly.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Full Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-white mb-3">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-white placeholder-slate-500"
                                                placeholder="Enter your full name..."
                                            />
                                        </div>
                                    </div>

                                    {/* Email Address */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-white mb-3">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-white placeholder-slate-500"
                                                placeholder="Enter your email address..."
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-white mb-3">
                                            Phone Number
                                        </label>
                                        <div className="relative flex">
                                            <div className="flex items-center gap-2 pl-4 pr-3 bg-slate-900/50 border border-slate-700/50 border-r-0 rounded-l-2xl">
                                                <span className="text-2xl">🇬🇧</span>
                                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="flex-1 pl-4 pr-12 py-4 bg-slate-900/50 border border-slate-700/50 rounded-r-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-white placeholder-slate-500"
                                                placeholder="+25 (000) 000-0000"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-white mb-3">
                                            Message
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                maxLength={300}
                                                rows={5}
                                                className="w-full px-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none text-white placeholder-slate-500"
                                                placeholder="Enter your main text here..."
                                            />
                                            <div className="absolute bottom-3 right-4 text-sm text-slate-500">
                                                {charCount}/300
                                            </div>
                                        </div>
                                    </div>

                                    {/* Privacy Policy Checkbox */}
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="agreeToPrivacy"
                                            name="agreeToPrivacy"
                                            checked={formData.agreeToPrivacy}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 w-5 h-5 rounded bg-indigo-500 border-0 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                        />
                                        <label htmlFor="agreeToPrivacy" className="text-sm text-slate-400 cursor-pointer select-none">
                                            I hereby agree to our{' '}
                                            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                                Privacy Policy
                                            </a>{' '}
                                            terms.
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !formData.agreeToPrivacy}
                                        className="group w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Submit Form
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactForm;