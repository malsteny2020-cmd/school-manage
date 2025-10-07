import React, { useState } from 'react';
import { writeData } from '../../utils/api';
import LogoIcon from '../icons/LogoIcon';
import EyeIcon from '../icons/EyeIcon';
import EyeSlashIcon from '../icons/EyeSlashIcon';


interface RegisterProps {
    onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        grade: '10',
        class: '',
        guardianName: '',
        guardianPhone: '',
    });
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password.startsWith('0')) {
            setError('لا يجب ان تبدأ كلمة المرور بالرقم 0.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('كلمتا المرور غير متطابقتين.');
            return;
        }
        if (Object.values(formData).some(val => val === '')) {
            setError('جميع الحقول مطلوبة.');
            return;
        }

        setIsRegistering(true);
        try {
            const studentData = {
                ...formData,
                grade: parseInt(formData.grade),
            };
            delete (studentData as any).confirmPassword;
            await writeData('REGISTER_STUDENT', studentData);
            setIsSuccess(true);
        } catch (err: any) {
            console.error("Registration failed:", err);
            setError(err.message || 'حدث خطأ أثناء إنشاء الحساب.');
        } finally {
            setIsRegistering(false);
        }
    };

    const inputStyles = "w-full p-3 bg-surface border border-secondary text-text-primary rounded-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition";

    if (isSuccess) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-background text-text-primary p-4" dir="rtl">
                <div className="w-full max-w-md bg-surface rounded-xl shadow-2xl p-8 border border-secondary/50 text-center">
                    <LogoIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-3">تم التسجيل بنجاح!</h1>
                    <p className="text-text-secondary mb-6">حسابك الآن قيد المراجعة من قبل الإدارة. سيتم تفعيله قريباً.</p>
                    <button onClick={onBackToLogin} className="w-full bg-accent text-white py-3 rounded-md hover:bg-indigo-600 transition-colors font-semibold">
                        العودة إلى صفحة الدخول
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-text-primary p-4" dir="rtl">
            <div className="w-full max-w-lg bg-surface rounded-xl shadow-2xl p-6 sm:p-8 border border-secondary/50">
                <div className="text-center mb-8">
                    <LogoIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white">إنشاء حساب طالب جديد</h1>
                    <p className="text-text-secondary mt-2">أدخل بياناتك لتقديم طلب تسجيل.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                     {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm text-center">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">الاسم الكامل:</label>
                            <input name="name" type="text" value={formData.name} onChange={handleChange} className={inputStyles} required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">اسم المستخدم:</label>
                            <input name="username" type="text" value={formData.username} onChange={handleChange} className={inputStyles} required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">كلمة المرور:</label>
                             <div className="relative">
                                <input name="password" type={isPasswordVisible ? 'text' : 'password'} value={formData.password} onChange={handleChange} className={`${inputStyles} pe-10`} required />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-secondary hover:text-primary"
                                >
                                    {isPasswordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">تأكيد كلمة المرور:</label>
                            <div className="relative">
                                <input name="confirmPassword" type={isConfirmPasswordVisible ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} className={`${inputStyles} pe-10`} required />
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-secondary hover:text-primary"
                                >
                                    {isConfirmPasswordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">الصف:</label>
                             <select name="grade" value={formData.grade} onChange={handleChange} className={inputStyles}>
                                <option value="10">الصف العاشر</option>
                                <option value="11">الصف الحادي عشر</option>
                                <option value="12">الصف الثاني عشر</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">الفصل:</label>
                            <select name="class" value={formData.class} onChange={handleChange} className={inputStyles} required>
                                <option value="" disabled>اختر الفصل...</option>
                                <option value="أ">أ</option>
                                <option value="ب">ب</option>
                                <option value="ج">ج</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">اسم ولي الأمر:</label>
                            <input name="guardianName" type="text" value={formData.guardianName} onChange={handleChange} className={inputStyles} required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">هاتف ولي الأمر:</label>
                            <input name="guardianPhone" type="tel" value={formData.guardianPhone} onChange={handleChange} className={inputStyles} required />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full bg-accent text-white py-3 rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold mt-6"
                    >
                        {isRegistering ? '...جاري التسجيل' : 'إنشاء الحساب'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button onClick={onBackToLogin} className="text-primary hover:underline font-semibold text-sm">
                        العودة إلى صفحة تسجيل الدخول
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
