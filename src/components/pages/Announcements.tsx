import React, { useState } from 'react';
import Modal from '../Modal';
import AddAnnouncementForm, { AnnouncementFormData } from '../forms/AddAnnouncementForm';
import type { Announcement } from '../../types';
import EditIcon from '../icons/EditIcon';
import DeleteIcon from '../icons/DeleteIcon';
import { writeData } from '../../utils/api';


interface AnnouncementsProps {
    announcements: Announcement[];
    setAnnouncements: (announcements: Announcement[]) => void;
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements, setAnnouncements }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');


    const handleOpenAddModal = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAnnouncement(null);
        setError('');
    };

    const handleSaveAnnouncement = async (data: AnnouncementFormData) => {
        setIsSaving(true);
        setError('');
        const announcementToSave: Announcement = editingAnnouncement
            ? { ...editingAnnouncement, ...data }
            : {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                ...data
            };
        
        try {
            const savedData = await writeData(
                editingAnnouncement ? 'UPDATE_ANNOUNCEMENT' : 'ADD_ANNOUNCEMENT',
                announcementToSave
            );

            if (editingAnnouncement) {
                setAnnouncements(announcements.map(a => a.id === savedData.id ? savedData : a));
            } else {
                setAnnouncements([savedData, ...announcements]);
            }
            handleCloseModal();
        } catch (error: any) {
            console.error("Failed to save announcement:", error);
            setError(`حدث خطأ أثناء حفظ الإعلان: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenDeleteModal = (announcement: Announcement) => {
        setError('');
        setAnnouncementToDelete(announcement);
    };

    const handleConfirmDelete = async () => {
        if (!announcementToDelete) return;
        setIsSaving(true);
        setError('');
        try {
            await writeData('DELETE_ANNOUNCEMENT', { id: announcementToDelete.id });
            setAnnouncements(announcements.filter(a => a.id !== announcementToDelete.id));
            setAnnouncementToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete announcement:", error);
            setError(`حدث خطأ أثناء حذف الإعلان: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const getCategoryBadge = (category: Announcement['category']) => {
        switch (category) {
            case 'urgent':
                return <span className="text-xs font-semibold px-2.5 py-1 bg-red-500/20 text-red-300 rounded-full">عاجل</span>;
            case 'academic':
                return <span className="text-xs font-semibold px-2.5 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">أكاديمي</span>;
            case 'general':
            default:
                return <span className="text-xs font-semibold px-2.5 py-1 bg-sky-500/20 text-sky-300 rounded-full">عام</span>;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-3xl font-bold">لوحة تحكم الإعلانات</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-accent text-white px-4 py-2 rounded-md hover:bg-indigo-600 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                >
                    <span>إعلان جديد</span>
                </button>
            </div>
            
            <div className="space-y-4">
                {announcements.map(announcement => (
                    <div key={announcement.id} className="bg-surface rounded-lg shadow-lg p-4 border border-secondary/50">
                        <div className="flex justify-between items-start">
                           <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                     {getCategoryBadge(announcement.category)}
                                    <span className="text-sm text-text-secondary">التاريخ: {announcement.date}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                           </div>
                           <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleOpenEditModal(announcement)} className="text-text-secondary hover:text-yellow-400" aria-label={`تعديل ${announcement.title}`}>
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleOpenDeleteModal(announcement)} className="text-text-secondary hover:text-red-500" aria-label={`حذف ${announcement.title}`}>
                                    <DeleteIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <p className="text-text-primary mt-2 whitespace-pre-wrap">{announcement.content}</p>
                    </div>
                ))}
                 {announcements.length === 0 && (
                    <div className="text-center p-6 bg-surface rounded-lg shadow-lg text-text-secondary">
                        لا توجد إعلانات حالية.
                    </div>
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                title={editingAnnouncement ? 'تعديل الإعلان' : 'إعلان جديد'}
            >
                <AddAnnouncementForm 
                    onSave={handleSaveAnnouncement}
                    onCancel={handleCloseModal}
                    initialData={editingAnnouncement}
                    isSaving={isSaving}
                    error={error}
                />
            </Modal>
             <Modal 
                isOpen={!!announcementToDelete} 
                onClose={() => setAnnouncementToDelete(null)}
                title="تأكيد الحذف"
            >
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</div>}
                <p>هل أنت متأكد من أنك تريد حذف الإعلان "{announcementToDelete?.title}"؟</p>
                <p className="text-sm text-text-secondary mt-2">هذا الإجراء سيقوم بحذف الإعلان نهائياً ولا يمكن التراجع عنه.</p>
                <div className="flex justify-end gap-3 mt-6 border-t border-secondary pt-4">
                    <button 
                        type="button" 
                        onClick={() => setAnnouncementToDelete(null)} 
                        disabled={isSaving}
                        className="bg-secondary/50 text-text-primary px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors text-sm font-semibold disabled:opacity-50">
                        إلغاء
                    </button>
                    <button 
                        type="button" 
                        onClick={handleConfirmDelete}
                        disabled={isSaving}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                    >
                        {isSaving ? 'جار الحذف...' : 'نعم، قم بالحذف'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Announcements;
