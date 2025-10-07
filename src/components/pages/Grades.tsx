import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Subject, Grade } from '../../types';
import { writeData } from '../../utils/api';
import Modal from '../Modal';

interface GradesProps {
    students: Student[];
    subjects: Subject[];
    grades: Grade[];
    setGrades: (grades: Grade[]) => void;
}

const Grades: React.FC<GradesProps> = ({ students: allStudents, subjects, grades, setGrades }) => {
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedGrade, setSelectedGrade] = useState<number | ''>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [studentsToList, setStudentsToList] = useState<Student[]>([]);
    const [currentGrades, setCurrentGrades] = useState<Record<number, string | number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [modalInfo, setModalInfo] = useState({ isOpen: false, title: '', message: '' });

    useEffect(() => {
        if (subjects.length > 0 && !selectedSubject) {
            setSelectedSubject(subjects[0].name);
        }
    }, [subjects, selectedSubject]);

    // FIX: The sort comparison function now explicitly converts values to numbers.
    // This prevents type errors if `s.grade` is null or a string representation of a number.
    const studentGrades = useMemo(() => [...new Set(allStudents.map(s => s.grade))].sort((a, b) => Number(a) - Number(b)), [allStudents]);
    
    const classes = useMemo(() => {
        if (selectedGrade === '') return [];
        return [...new Set(allStudents.filter(s => s.grade === selectedGrade).map(s => s.class))].sort();
    }, [selectedGrade, allStudents]);

    const handleShowStudents = () => {
        if (selectedGrade === '' || !selectedClass || !selectedSubject) {
            setModalInfo({ isOpen: true, title: 'خطأ', message: 'يرجى تحديد المادة والصف والفصل أولاً.' });
            return;
        }
        const filteredStudents = allStudents
            .filter(s => s.grade === selectedGrade && s.class === selectedClass)
            .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        setStudentsToList(filteredStudents);

        const initialGrades: Record<number, string | number> = {};
        filteredStudents.forEach(student => {
            const grade = grades.find(g => g.studentId === student.id && g.subject === selectedSubject);
            initialGrades[student.id] = grade?.score ?? '';
        });
        setCurrentGrades(initialGrades);
    };

    const handleGradeChange = (studentId: number, score: string) => {
        setCurrentGrades(prev => ({ ...prev, [studentId]: score }));
    };

    const handleSaveGrades = async () => {
        if (studentsToList.length === 0) {
            setModalInfo({ isOpen: true, title: 'خطأ', message: 'لا يوجد طلاب لحفظ الدرجات لهم.' });
            return;
        }
        setIsSaving(true);
        try {
            const gradesToSave = Object.entries(currentGrades).map(([studentId, score]) => ({
                studentId: Number(studentId),
                score: score === '' ? null : Number(score)
            }));
            
            for (const grade of gradesToSave) {
                if (grade.score !== null && (isNaN(grade.score) || grade.score < 0 || grade.score > 100)) {
                     setModalInfo({ isOpen: true, title: 'خطأ', message: `الدرجة للطالب صاحب المعرف ${grade.studentId} غير صالحة. يجب أن تكون رقمًا بين 0 و 100.` });
                     setIsSaving(false);
                     return;
                }
            }
            
            await writeData('SAVE_GRADES', {
                subject: selectedSubject,
                gradesToSave: gradesToSave
            });

            const otherGrades = grades.filter(g => g.subject !== selectedSubject);
            const updatedSubjectGrades = gradesToSave
                .filter(g => g.score !== null)
                .map(g => ({ ...g, subject: selectedSubject } as Grade));
            
            setGrades([...otherGrades, ...updatedSubjectGrades]);

            setModalInfo({ isOpen: true, title: 'نجاح', message: `تم حفظ درجات مادة '${selectedSubject}' بنجاح.` });
        } catch (error: any) {
            console.error("Failed to save grades:", error);
            setModalInfo({ isOpen: true, title: 'خطأ في الحفظ', message: `حدث خطأ أثناء حفظ الدرجات: ${error.message}` });
        } finally {
            setIsSaving(false);
        }
    };

    const inputStyles = "w-full p-2.5 bg-surface border border-secondary text-text-primary rounded-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition";
    const gradeInputStyles = "w-full p-2 bg-background border border-secondary text-text-primary rounded-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition text-center"

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">إدارة الدرجات</h2>

            <div className="bg-surface rounded-lg shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1">
                        <label htmlFor="subject-select" className="block text-sm font-medium text-text-secondary">المادة:</label>
                        <select id="subject-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={inputStyles}>
                            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="grade-select" className="block text-sm font-medium text-text-secondary">الصف:</label>
                        <select id="grade-select" value={selectedGrade} onChange={e => { setSelectedGrade(Number(e.target.value)); setSelectedClass('') }} className={inputStyles}>
                            <option value="" disabled>اختر الصف...</option>
                            {studentGrades.map(g => <option key={g} value={g}>الصف {g}</option>)}
                        </select>
                    </div>
                     <div className="space-y-1">
                        <label htmlFor="class-select" className="block text-sm font-medium text-text-secondary">الفصل:</label>
                        <select id="class-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedGrade} className={`${inputStyles} disabled:opacity-50`}>
                            <option value="" disabled>اختر الفصل...</option>
                            {classes.map(c => <option key={c} value={c}>فصل {c}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <button onClick={handleShowStudents} className="bg-accent text-white px-4 py-2.5 rounded-md hover:bg-indigo-600 w-full text-sm font-semibold transition-colors">
                            عرض الطلاب
                        </button>
                    </div>
                </div>
            </div>

            {studentsToList.length > 0 ? (
                 <div className="bg-surface rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-text-primary">
                            <thead className="text-xs uppercase bg-secondary/30 text-text-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3">اسم الطالب</th>
                                    <th scope="col" className="px-6 py-3 text-center w-48">الدرجة (من 100)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsToList.map((student, index) => (
                                    <tr key={student.id} className={`border-b border-secondary ${index % 2 === 0 ? 'bg-surface' : 'bg-background'}`}>
                                        <td className="px-6 py-4 font-bold">{student.name}</td>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={currentGrades[student.id] ?? ''}
                                                onChange={e => handleGradeChange(student.id, e.target.value)}
                                                className={gradeInputStyles}
                                                placeholder="-"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-secondary flex justify-end">
                        <button 
                            onClick={handleSaveGrades}
                            disabled={isSaving}
                            className="bg-accent text-white px-6 py-2 rounded-md hover:bg-indigo-600 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {isSaving ? 'جار الحفظ...' : 'حفظ الدرجات'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center p-6 bg-surface rounded-lg shadow-lg text-text-secondary">
                  اختر المادة والصف والفصل ثم اضغط 'عرض الطلاب' للبدء.
                </div>
            )}
             <Modal isOpen={modalInfo.isOpen} onClose={() => setModalInfo({ ...modalInfo, isOpen: false })} title={modalInfo.title}>
                <p>{modalInfo.message}</p>
            </Modal>
        </div>
    );
};

export default Grades;