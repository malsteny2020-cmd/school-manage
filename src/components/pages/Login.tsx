import React, { useState } from 'react';
import type { Admin, Student } from '../../types';
import { writeData } from '../../utils/api';
import LogoIcon from '../icons/LogoIcon';
import EyeIcon from '../icons/EyeIcon';
import EyeSlashIcon from '../icons/EyeSlashIcon';
import SpinnerIcon from '../icons/SpinnerIcon';

interface LoginProps {
  onLogin: (user: { type: 'admin' | 'student'; data: Admin | Student }) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        try {
            // Check admin login
            const adminUser = await writeData('LOGIN_ADMIN', { username, password });
            if (adminUser) {
                onLogin({ type: 'admin', data: adminUser });
                return;
            }

            // Check student login
            const studentUser = await writeData('LOGIN_STUDENT', { username, password });
            if (studentUser) {
                onLogin({ type: 'student', data: studentUser });
                return;
            }

            setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err.message || 'حدث خطأ أثناء محاولة تسجيل الدخول.');
        } finally {
            setIsLoggingIn(false);
        }
    };
    
    const inputStyles = "w-full p-3 bg-surface border border-secondary text-text-primary rounded-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition";

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-text-primary p-4" dir="rtl">
            <div className="w-full max-w-md bg-surface rounded-xl shadow-2xl p-6 sm:p-8 border border-secondary/50">
                <div className="text-center mb-8">
                    <LogoIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white">نظام إدارة المدرسة</h1>
                    <p className="text-text-secondary mt-2">مرحباً بعودتك! الرجاء تسجيل الدخول للمتابعة.</p>
                </div>
                
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm text-center">{error}</div>}
                    
                    <div className="space-y-2">
                        <label htmlFor="username" className="block text-sm font-medium text-text-secondary">اسم المستخدم:</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                setUsername(value);
                            }}
                            className={`${inputStyles} text-left`}
                            required
                            placeholder="أحرف وأرقام إنجليزية فقط"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password"  className="block text-sm font-medium text-text-secondary">كلمة المرور:</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={isPasswordVisible ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputStyles} pe-10`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-secondary hover:text-primary"
                                aria-label={isPasswordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                            >
                                {isPasswordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full bg-accent text-white py-3 rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold flex items-center justify-center"
                    >
                        {isLoggingIn ? (
                            <>
                                <SpinnerIcon className="w-5 h-5 ml-3" />
                                <span>...جاري التحقق</span>
                            </>
                        ) : (
                            'تسجيل الدخول'
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-text-secondary">ليس لديك حساب؟</p>
                    <button onClick={onSwitchToRegister} className="text-primary hover:underline font-semibold text-sm mt-1">
                        أنشئ حساباً جديداً
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;