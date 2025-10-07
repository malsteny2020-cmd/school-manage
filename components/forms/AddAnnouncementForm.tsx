import React, { useState, useEffect } from 'react';
import type { Announcement } from '../../types';

export type AnnouncementFormData = Omit<Announcement, 'id' | 'date'>;

interface AddAnnouncementFormProps {
  onSave: (data: AnnouncementFormData) => void;
  onCancel: () => void;
  initialData?: Announcement | null;
  isSaving: boolean;
  error?: string;
}

const AddAnnouncementForm: React.FC<AddAnnouncementFormProps> = ({ onSave, onCancel, initialData, isSaving, error }) => {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    category: 'general',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        category: initialData.category,
      });
    } else {
       setFormData({
        title: '',
        content: '',
        category: 'general',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.title || !formData.content) {
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
      
      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary">العنوان:</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className={inputStyles} />
        </div>
        <div className="space-y-1">
           <label htmlFor="category" className="block text-sm font-medium text-text-secondary">التصنيف:</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange} className={inputStyles}>
                <option value="general">عام</option>
                <option value="academic">أكاديمي</option>
                <option value="urgent">عاجل</option>
            </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="content" className="block text-sm font-medium text-text-secondary">المحتوى:</label>
          <textarea id="content" name="content" value={formData.content} onChange={handleChange} required rows={5} className={inputStyles} />
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
          {isSaving ? 'جار الحفظ...' : (initialData ? 'حفظ التغييرات' : 'نشر')}
        </button>
      </div>
    </form>
  );
};

export default AddAnnouncementForm;