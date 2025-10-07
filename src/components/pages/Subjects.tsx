import React, { useState } from 'react';
import DataTable from '../DataTable';
import Modal from '../Modal';
import AddSubjectForm, { SubjectFormData } from '../forms/AddSubjectForm';
import type { Subject, Teacher } from '../../types';
import EditIcon from '../icons/EditIcon';
import DeleteIcon from '../icons/DeleteIcon';
import { writeData } from '../../utils/api';

interface SubjectsProps {
    subjects: Subject[];
    setSubjects: (subjects: Subject[]) => void;
    teachers: Teacher[];
}

const Subjects: React.FC<SubjectsProps> = ({ subjects, setSubjects, teachers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');


    const handleOpenAddModal = () => {
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (subject: Subject) => {
        setEditingSubject(subject);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubject(null);
        setError('');
    };

    const handleSaveSubject = async (data: SubjectFormData) => {
        setIsSaving(true);
        setError('');
        const subjectToSave: Subject = editingSubject
            ? { ...editingSubject, ...data }
            : {
                id: Date.now(),
                ...data
            };
        
        try {
            const savedData = await writeData(
                editingSubject ? 'UPDATE_SUBJECT' : 'ADD_SUBJECT',
                subjectToSave
            );
            if (editingSubject) {
                setSubjects(subjects.map(s => s.id === savedData.id ? savedData : s));
            } else {
                setSubjects([savedData, ...subjects]);
            }
            handleCloseModal();
        } catch (error: any) {
            console.error("Failed to save subject:", error);
            setError(`حدث خطأ أثناء حفظ المادة: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenDeleteModal = (subject: Subject) => {
        setError('');
        setSubjectToDelete(subject);
    };

    const handleConfirmDelete = async () => {
        if (!subjectToDelete) return;
        setIsSaving(true);
        setError('');
        try {
            await writeData('DELETE_SUBJECT', { id: subjectToDelete.id });
            setSubjects(subjects.filter(s => s.id !== subjectToDelete.id));
            setSubjectToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete subject:", error);
            setError(`حدث خطأ أثناء حذف المادة: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        { header: 'الرمز', accessor: 'code' },
        { header: 'اسم المادة', accessor: 'name' },
        { 
            header: 'المعلم المسند', 
            accessor: 'teacherId',
            render: (item: Subject) => {
                const teacher = teachers.find(t => t.id === item.teacherId);
                return teacher ? teacher.name : <span className="text-yellow-400/80">غير مسند</span>;
            }
        },
        {
            header: 'الإجراءات',
            accessor: 'actions',
            render: (item: Subject) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenEditModal(item)} className="text-text-secondary hover:text-yellow-400" aria-label={`تعديل ${item.name}`}>
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleOpenDeleteModal(item)} className="text-text-secondary hover:text-red-500" aria-label={`حذف ${item.name}`}>
                        <DeleteIcon className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-3xl font-bold">إدارة المواد الدراسية</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-accent text-white px-4 py-2 rounded-md hover:bg-indigo-600 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                >
                   <span>إضافة مادة جديدة</span>
                </button>
            </div>
            <DataTable 
                data={subjects} 
                columns={columns} 
                searchKeys={['name', 'code']} 
            />
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                title={editingSubject ? 'تعديل المادة' : 'إنشاء مادة جديدة'}
            >
                <AddSubjectForm 
                    onSave={handleSaveSubject}
                    onCancel={handleCloseModal}
                    initialData={editingSubject}
                    teachers={teachers}
                    isSaving={isSaving}
                    error={error}
                />
            </Modal>
             <Modal 
                isOpen={!!subjectToDelete} 
                onClose={() => setSubjectToDelete(null)}
                title="تأكيد الحذف"
            >
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</div>}
                <p>هل أنت متأكد من أنك تريد حذف مادة "{subjectToDelete?.name}"؟</p>
                <p className="text-sm text-text-secondary mt-2">هذا الإجراء سيقوم بحذف سجل المادة نهائياً ولا يمكن التراجع عنه.</p>
                <div className="flex justify-end gap-3 mt-6 border-t border-secondary pt-4">
                    <button 
                        type="button" 
                        onClick={() => setSubjectToDelete(null)} 
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

export default Subjects;
