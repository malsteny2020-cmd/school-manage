import React, { useState } from 'react';
import DataTable from '../DataTable';
import Modal from '../Modal';
import AddTeacherForm, { TeacherFormData } from '../forms/AddTeacherForm';
import type { Teacher } from '../../types';
import EditIcon from '../icons/EditIcon';
import DeleteIcon from '../icons/DeleteIcon';
import { writeData } from '../../utils/api';

interface TeachersProps {
    teachers: Teacher[];
    setTeachers: (teachers: Teacher[]) => void;
}

const Teachers: React.FC<TeachersProps> = ({ teachers, setTeachers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleOpenAddModal = () => {
        setEditingTeacher(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTeacher(null);
        setError('');
    };

    const handleSaveTeacher = async (data: TeacherFormData) => {
        setIsSaving(true);
        setError('');
        const teacherToSave: Teacher = editingTeacher
            ? { ...editingTeacher, ...data }
            : {
                id: Date.now(),
                status: 'active',
                ...data,
            };
        
        try {
            const savedData = await writeData(
                editingTeacher ? 'UPDATE_TEACHER' : 'ADD_TEACHER',
                teacherToSave
            );
            if (editingTeacher) {
                setTeachers(teachers.map(t => t.id === savedData.id ? savedData : t));
            } else {
                setTeachers([savedData, ...teachers]);
            }
            handleCloseModal();
        } catch (error: any) {
            console.error("Failed to save teacher:", error);
            setError(`حدث خطأ أثناء حفظ المعلم: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenDeleteModal = (teacher: Teacher) => {
        setError('');
        setTeacherToDelete(teacher);
    };

    const handleConfirmDelete = async () => {
        if (!teacherToDelete) return;

        setIsSaving(true);
        setError('');
        try {
            await writeData('DELETE_TEACHER', { id: teacherToDelete.id });
            setTeachers(teachers.filter(t => t.id !== teacherToDelete.id));
            setTeacherToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete teacher:", error);
            setError(`حدث خطأ أثناء حذف المعلم: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        { header: 'المعرف', accessor: 'id' },
        { header: 'الاسم', accessor: 'name' },
        { header: 'المادة', accessor: 'subject' },
        { header: 'البريد الإلكتروني', accessor: 'email' },
        { header: 'الهاتف', accessor: 'phone' },
        {
            header: 'الحالة',
            accessor: 'status',
            render: (item: Teacher) => (
                 <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${item.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {item.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
            )
        },
        {
            header: 'الإجراءات',
            accessor: 'actions',
            render: (item: Teacher) => (
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
                <h2 className="text-3xl font-bold">إدارة المعلمين</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-accent text-white px-4 py-2 rounded-md hover:bg-indigo-600 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                >
                    <span>إضافة معلم جديد</span>
                </button>
            </div>
            <DataTable 
                data={teachers} 
                columns={columns} 
                searchKeys={['name', 'subject', 'email']} 
            />
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                title={editingTeacher ? 'تعديل سجل معلم' : 'إنشاء سجل معلم جديد'}
            >
                <AddTeacherForm 
                    onSave={handleSaveTeacher}
                    onCancel={handleCloseModal}
                    initialData={editingTeacher}
                    isSaving={isSaving}
                    error={error}
                />
            </Modal>
             <Modal 
                isOpen={!!teacherToDelete} 
                onClose={() => setTeacherToDelete(null)}
                title="تأكيد الحذف"
            >
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</div>}
                <p>هل أنت متأكد من أنك تريد حذف المعلم "{teacherToDelete?.name}"؟</p>
                <p className="text-sm text-text-secondary mt-2">هذا الإجراء سيقوم بحذف سجل المعلم نهائياً ولا يمكن التراجع عنه.</p>
                <div className="flex justify-end gap-3 mt-6 border-t border-secondary pt-4">
                    <button 
                        type="button" 
                        onClick={() => setTeacherToDelete(null)} 
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

export default Teachers;