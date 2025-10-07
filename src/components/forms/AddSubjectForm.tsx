import React, { useState, useEffect } from 'react';
import type { Subject, Teacher } from '../../types';

export type SubjectFormData = Omit<Subject, 'id'>;

interface AddSubjectFormProps {
  onSave: (data: SubjectFormData) => void;
  onCancel: () => void;
  initialData?: Subject | null;
  teachers: Teacher[];
  isSaving: boolean;
  error?: string;
}

const AddSubjectForm: React.FC<AddSubjectFormProps> = ({ onSave, onCancel, initialData, teachers, isSaving, error }) => {
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    teacherId: teachers[0]?.id || 0,
  });
  const [formError, setFormError] = useState('');


  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        teacherId: initialData.teacherId,
      });
    } else {
       setFormData({
        name: '',
        code: '',
        teacherId: teachers[0]?.id || 0,
      });
    }
  }, [initialData, teachers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'teacherId' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.code || !formData.teacherId) {
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
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">اسم المادة:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputStyles} />
        </div>
        <div className="space-y-1">
          <label htmlFor="code" className="block text-sm font-medium text-text-secondary">رمز المادة:</label>
          <input type="text" id="code" name="code" value={formData.code} onChange={handleChange} required className={inputStyles} placeholder="مثال: MATH101"/>
        </div>
        <div className="md:col-span-2 space-y-1">
           <label htmlFor="teacherId" className="block text-sm font-medium text-text-secondary">إسناد إلى معلم:</label>
            <select id="teacherId" name="teacherId" value={formData.teacherId} onChange={handleChange} className={inputStyles}>
                {teachers.length > 0 ? teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                )) : <option disabled>لا يوجد معلمون متاحون</option>}
            </select>
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
          {isSaving ? 'جار الحفظ...' : (initialData ? 'حفظ التغييرات' : 'إنشاء المادة')}
        </button>
      </div>
    </form>
  );
};

export default AddSubjectForm;
