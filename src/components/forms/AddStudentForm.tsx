import React, { useState, useEffect } from 'react';
import type { Student } from '../../types';

export type StudentFormData = Omit<Student, 'id'>;

interface AddStudentFormProps {
  onSave: (data: StudentFormData) => void;
  onCancel: () => void;
  initialData?: Student | null;
  isSaving: boolean;
  error?: string;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onSave, onCancel, initialData, isSaving, error }) => {
  const [formData, setFormData] = useState<StudentFormData>({
    username: '',
    password: '',
    name: '',
    grade: 10,
    class: '',
    guardianName: '',
    guardianPhone: '',
    status: 'active',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username,
        password: '', // Leave password blank for editing for security
        name: initialData.name,
        grade: initialData.grade,
        class: initialData.class,
        guardianName: initialData.guardianName,
        guardianPhone: initialData.guardianPhone,
        status: initialData.status,
      });
    } else {
       setFormData({
        username: '',
        password: '',
        name: '',
        grade: 10,
        class: '',
        guardianName: '',
        guardianPhone: '',
        status: 'active',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'grade' ? parseInt(value) : value } as StudentFormData));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.username || !formData.name || !formData.class || !formData.guardianName || !formData.guardianPhone) {
      setFormError('جميع الحقول مطلوبة.');
      return;
    }
    // Password is required only for new students
    if (!initialData && !formData.password) {
        setFormError('كلمة المرور مطلوبة للطالب الجديد.');
        return;
    }

    if (formData.password && formData.password.startsWith('0')) {
        setFormError('لا يجب ان تبدأ كلمة المرور بالرقم 0.');
        return;
    }
    
    onSave(formData);
  };
  
  const inputStyles = "w-full p-2.5 bg-background border border-secondary text-text-primary rounded-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition";

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</div>}
      {formError && <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded-md mb-4 text-sm">{formError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">الاسم الكامل:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputStyles} />
        </div>
        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm font-medium text-text-secondary">اسم المستخدم (للدخول):</label>
          <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required className={inputStyles} placeholder="مثال: aabdullah"/>
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary">كلمة المرور:</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={inputStyles} placeholder={initialData ? "اتركه فارغاً لعدم التغيير" : "مطلوب"}/>
        </div>
        <div className="space-y-1">
          <label htmlFor="grade" className="block text-sm font-medium text-text-secondary">الصف:</label>
          <select id="grade" name="grade" value={formData.grade} onChange={handleChange} className={inputStyles}>
            <option value={10}>الصف العاشر</option>
            <option value={11}>الصف الحادي عشر</option>
            <option value={12}>الصف الثاني عشر</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="class" className="block text-sm font-medium text-text-secondary">الفصل:</label>
          <select id="class" name="class" value={formData.class} onChange={handleChange} required className={inputStyles}>
              <option value="" disabled>اختر الفصل...</option>
              <option value="أ">أ</option>
              <option value="ب">ب</option>
              <option value="ج">ج</option>
          </select>
        </div>
         <div className="space-y-1">
          <label htmlFor="guardianName" className="block text-sm font-medium text-text-secondary">اسم ولي الأمر:</label>
          <input type="text" id="guardianName" name="guardianName" value={formData.guardianName} onChange={handleChange} required className={inputStyles} />
        </div>
        <div className="space-y-1">
          <label htmlFor="guardianPhone" className="block text-sm font-medium text-text-secondary">هاتف ولي الأمر:</label>
          <input type="tel" id="guardianPhone" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} required className={inputStyles} />
        </div>
        {initialData && (
          <div className="space-y-1">
              <label htmlFor="status" className="block text-sm font-medium text-text-secondary">حالة الحساب:</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                  <option value="active">السماح بالدخول (نشط)</option>
                  <option value="inactive">حظر الطالب (غير نشط)</option>
              </select>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 mt-6 border-t border-secondary pt-4">
        <button type="button" onClick={onCancel} className="bg-secondary/50 text-text-primary px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors text-sm font-semibold">
          إلغاء
        </button>
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-accent text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
        >
          {isSaving ? 'جار الحفظ...' : (initialData ? 'حفظ التغييرات' : 'إنشاء سجل')}
        </button>
      </div>
    </form>
  );
};

export default AddStudentForm;
