import React, { useState } from 'react';
import DataTable from '../DataTable';
import Modal from '../Modal';
import AddStudentForm, { StudentFormData } from '../forms/AddStudentForm';
import type { Student } from '../../types';
import EditIcon from '../icons/EditIcon';
import DeleteIcon from '../icons/DeleteIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import XCircleIcon from '../icons/XCircleIcon';
import { writeData } from '../../utils/api';

interface StudentsProps {
    students: Student[];
    setStudents: (students: Student[]) => void;
}

const Students: React.FC<StudentsProps> = ({ students, setStudents }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isRejection, setIsRejection] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleOpenAddModal = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (student: Student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
        setError('');
    };

    const handleSaveStudent = async (data: StudentFormData) => {
        setIsSaving(true);
        setError('');
        const studentToSave: Student = editingStudent
            ? { ...editingStudent, ...data }
            : {
                id: Date.now(),
                ...data,
              };

        try {
            const savedData = await writeData(
                editingStudent ? 'UPDATE_STUDENT' : 'ADD_STUDENT',
                studentToSave
            );
            if (editingStudent) {
                setStudents(students.map(s => s.id === savedData.id ? savedData : s));
            } else {
                setStudents([savedData, ...students]);
            }
            handleCloseModal();
        } catch (error: any) {
            console.error("Failed to save student:", error);
            setError(`حدث خطأ أثناء حفظ الطالب: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleOpenDeleteModal = (student: Student, rejection: boolean = false) => {
        setError('');
        setStudentToDelete(student);
        setIsRejection(rejection);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;

        setIsSaving(true);
        setError('');
        try {
            await writeData('DELETE_STUDENT', { id: studentToDelete.id });
            setStudents(students.filter(s => s.id !== studentToDelete.id));
            setStudentToDelete(null);
            setIsRejection(false);
        } catch (error: any) {
            console.error("Failed to delete student:", error);
            setError(`حدث خطأ أثناء حذف الطالب: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleApproveStudent = async (studentToApprove: Student) => {
        const originalStudents = students;
        setStudents(students.map(s => s.id === studentToApprove.id ? { ...s, status: 'active' } : s));

        try {
            await writeData('APPROVE_STUDENT', { id: studentToApprove.id });
        } catch (error: any) {
            console.error("Failed to approve student:", error);
            setError(`حدث خطأ أثناء اعتماد الطالب: ${error.message}`);
            setStudents(originalStudents); // Revert on failure
        }
    };

    const columns = [
        { header: 'المعرف', accessor: 'id' },
        { header: 'الاسم', accessor: 'name' },
        { header: 'الصف', accessor: 'grade' },
        { header: 'الفصل', accessor: 'class' },
        { header: 'اسم ولي الأمر', accessor: 'guardianName' },
        { header: 'هاتف ولي الأمر', accessor: 'guardianPhone' },
        {
            header: 'الحالة',
            accessor: 'status',
            render: (item: Student) => {
                 let badge;
                 switch(item.status) {
                     case 'active':
                        badge = <span className="bg-green-500/20 text-green-300">نشط</span>;
                        break;
                     case 'inactive':
                        badge = <span className="bg-red-500/20 text-red-300">غير نشط</span>;
                        break;
                     case 'pending':
                        badge = <span className="bg-yellow-500/20 text-yellow-300">قيد المراجعة</span>;
                        break;
                     default:
                         badge = <span className="bg-gray-500/20 text-gray-300">غير معروف</span>
                 }
                 return <div className="px-2.5 py-1 text-xs font-medium rounded-full inline-block">{badge}</div>
            }
        },
        {
            header: 'الإجراءات',
            accessor: 'actions',
            render: (item: Student) => {
                if (item.status === 'pending') {
                    return (
                        <div className="flex items-center gap-3">
                            <button onClick={() => handleApproveStudent(item)} className="text-text-secondary hover:text-green-400" aria-label={`اعتماد ${item.name}`}>
                                <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleOpenDeleteModal(item, true)} className="text-text-secondary hover:text-red-500" aria-label={`رفض ${item.name}`}>
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center gap-3">
                        <button onClick={() => handleOpenEditModal(item)} className="text-text-secondary hover:text-yellow-400" aria-label={`تعديل ${item.name}`}>
                            <EditIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleOpenDeleteModal(item)} className="text-text-secondary hover:text-red-500" aria-label={`حذف ${item.name}`}>
                            <DeleteIcon className="w-5 h-5" />
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-3xl font-bold">إدارة الطلاب</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-accent text-white px-4 py-2 rounded-md hover:bg-indigo-600 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                >
                    <span>إضافة طالب جديد</span>
                </button>
            </div>
            <DataTable 
                data={students} 
                columns={columns} 
                searchKeys={['name', 'grade', 'class', 'guardianName']} 
            />
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                title={editingStudent ? 'تعديل سجل طالب' : 'إنشاء سجل طالب جديد'}
            >
                <AddStudentForm 
                    onSave={handleSaveStudent}
                    onCancel={handleCloseModal}
                    initialData={editingStudent}
                    isSaving={isSaving}
                    error={error}
                />
            </Modal>
            <Modal 
                isOpen={!!studentToDelete} 
                onClose={() => setStudentToDelete(null)}
                title={isRejection ? "تأكيد الرفض" : "تأكيد الحذف"}
            >
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</div>}
                <p>
                    {isRejection 
                        ? `هل أنت متأكد من أنك تريد رفض طلب الطالب "${studentToDelete?.name}"؟` 
                        : `هل أنت متأكد من أنك تريد حذف الطالب "${studentToDelete?.name}"؟`
                    }
                </p>
                <p className="text-sm text-text-secondary mt-2">
                     {isRejection 
                        ? "سيتم حذف هذا الطلب نهائياً ولا يمكن التراجع عنه."
                        : "هذا الإجراء سيقوم بحذف سجل الطالب نهائياً ولا يمكن التراجع عنه."
                     }
                </p>
                <div className="flex justify-end gap-3 mt-6 border-t border-secondary pt-4">
                    <button 
                        type="button" 
                        onClick={() => { setStudentToDelete(null); setIsRejection(false); }} 
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
                        {isSaving ? 'جار العمل...' : (isRejection ? 'نعم، قم بالرفض' : 'نعم، قم بالحذف')}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Students;
