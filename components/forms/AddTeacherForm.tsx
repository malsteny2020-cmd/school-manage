import React, { useState, useEffect } from 'react';
import type { Teacher } from '../../types';

export type TeacherFormData = Omit<Teacher, 'id' | 'status'>;

interface AddTeacherFormProps {
  onSave: (data: TeacherFormData) => void;
  onCancel: () => void;
  initialData?: Teacher | null;
  isSaving: boolean;
  error?: string;
}

const AddTeacherForm: React.FC<AddTeacherFormProps> = ({ onSave, onCancel, initialData, isSaving, error }) => {
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    subject: '',
    email: '',
    phone: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        subject: initialData.subject,
        email: initialData.email,
        phone: initialData.phone,
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        email: '',
        phone: '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.subject || !formData.email || !formData.phone) {
      setFormError('جميع الحقول مطلوبة.');
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
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">اسم المعلم:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputStyles} />
        </div>
        <div className="space-y-1">
          <label htmlFor="subject" className="block text-sm font-medium text-text-secondary">المادة:</label>
          <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className={inputStyles} />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">البريد الإلكتروني:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputStyles} />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">الهاتف:</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className={inputStyles} />
        </div>
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

export default AddTeacherForm;