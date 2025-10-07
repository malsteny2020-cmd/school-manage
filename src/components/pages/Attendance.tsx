import React, { useState, useMemo } from 'react';
import type { Student, Attendance as AttendanceType } from '../../types';
import { writeData } from '../../utils/api';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface AttendanceProps {
    students: Student[];
    attendance: AttendanceType[];
    setAttendance: (attendance: AttendanceType[]) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ students: allStudents, attendance: allAttendance, setAttendance }) => {
    const [selectedGrade, setSelectedGrade] = useState<number | ''>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [studentsToList, setStudentsToList] = useState<Student[]>([]);
    const [attendance, setAttendanceRecords] = useState<Record<number, AttendanceStatus>>({});
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const grades = useMemo(() => [...new Set(allStudents.map(s => s.grade))].sort((a,b) => a-b), [allStudents]);
    
    const classes = useMemo(() => {
        if (selectedGrade === '') return [];
        return [...new Set(allStudents.filter(s => s.grade === selectedGrade).map(s => s.class))].sort();
    }, [selectedGrade, allStudents]);
    
    const inputStyles = "w-full p-2.5 bg-surface border border-secondary text-text-primary rounded-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition";

    const handleShowStudents = () => {
        if (selectedGrade === '' || !selectedClass) {
            setMessage('يرجى تحديد الصف والفصل أولاً.');
            return;
        }
        setMessage('');
        const filteredStudents = allStudents.filter(s => s.grade === selectedGrade && s.class === selectedClass);
        setStudentsToList(filteredStudents);

        const initialAttendance: Record<number, AttendanceStatus> = {};
        filteredStudents.forEach(student => {
            initialAttendance[student.id] = 'present';
        });
        setAttendanceRecords(initialAttendance);
    };

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSaveAttendance = async () => {
        if (studentsToList.length === 0) {
            setMessage('لا يوجد طلاب لحفظ الحضور لهم.');
            return;
        }
        setIsSaving(true);
        setMessage('');
        try {
            const result = await writeData('SAVE_ATTENDANCE', { date: selectedDate, records: attendance });
            const savedRecords: AttendanceType[] = result.savedRecords || [];

            // Update the global state immediately
            const studentIdsForUpdate = Object.keys(attendance).map(Number);
            const otherAttendanceRecords = allAttendance.filter(record => 
                !(record.date === selectedDate && studentIdsForUpdate.includes(record.studentId))
            );

            setAttendance([...otherAttendanceRecords, ...savedRecords]);
            
            setMessage(`تم حفظ سجل الحضور ليوم ${selectedDate} بنجاح.`);
            setTimeout(() => setMessage(''), 4000);
        } catch (error: any) {
            console.error("Failed to save attendance:", error);
            setMessage(`حدث خطأ أثناء حفظ السجل: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const getStatusButtonStyle = (currentStatus: AttendanceStatus, buttonStatus: AttendanceStatus) => {
        if (currentStatus === buttonStatus) {
            switch(buttonStatus) {
                case 'present': return 'bg-green-500 text-white';
                case 'absent': return 'bg-red-500 text-white';
                case 'late': return 'bg-yellow-500 text-white';
            }
        }
        return 'bg-secondary/50 hover:bg-secondary/80';
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">تسجيل الحضور</h2>

            <div className="bg-surface rounded-lg shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                        <label htmlFor="grade-select" className="block text-sm font-medium text-text-secondary">الصف:</label>
                        <select id="grade-select" value={selectedGrade} onChange={e => {setSelectedGrade(Number(e.target.value)); setSelectedClass('')}} className={inputStyles}>
                            <option value="" disabled>اختر الصف...</option>
                            {grades.map(g => <option key={g} value={g}>الصف {g}</option>)}
                        </select>
                    </div>
                     <div className="space-y-1">
                        <label htmlFor="class-select" className="block text-sm font-medium text-text-secondary">الفصل:</label>
                        <select id="class-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedGrade} className={`${inputStyles} disabled:opacity-50`}>
                            <option value="" disabled>اختر الفصل...</option>
                            {classes.map(c => <option key={c} value={c}>فصل {c}</option>)}
                        </select>
                    </div>
                     <div className="space-y-1">
                        <label htmlFor="date-select" className="block text-sm font-medium text-text-secondary">التاريخ:</label>
                        <input type="date" id="date-select" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={inputStyles} />
                    </div>
                    <button onClick={handleShowStudents} className="bg-accent text-white px-4 py-2.5 rounded-md hover:bg-indigo-600 w-full text-sm font-semibold transition-colors h-fit">
                        عرض الطلاب
                    </button>
                </div>
                 {message && <p className="text-center mt-4 text-sm text-yellow-300">{message}</p>}
            </div>

            {studentsToList.length > 0 ? (
                <div className="bg-surface rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-text-primary">
                            <thead className="text-xs uppercase bg-secondary/30 text-text-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3">اسم الطالب</th>
                                    <th scope="col" className="px-6 py-3 text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsToList.map((student, index) => (
                                    <tr key={student.id} className={`border-b border-secondary ${index % 2 === 0 ? 'bg-surface' : 'bg-background'}`}>
                                        <td className="px-6 py-4 font-bold">{student.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleStatusChange(student.id, 'present')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${getStatusButtonStyle(attendance[student.id], 'present')}`}>حاضر</button>
                                                <button onClick={() => handleStatusChange(student.id, 'absent')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${getStatusButtonStyle(attendance[student.id], 'absent')}`}>غائب</button>
                                                <button onClick={() => handleStatusChange(student.id, 'late')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${getStatusButtonStyle(attendance[student.id], 'late')}`}>متأخر</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-secondary flex justify-end">
                        <button 
                            onClick={handleSaveAttendance} 
                            disabled={isSaving}
                            className="bg-accent text-white px-6 py-2 rounded-md hover:bg-indigo-600 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {isSaving ? 'جار الحفظ...' : 'حفظ السجل'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center p-6 bg-surface rounded-lg shadow-lg text-text-secondary">
                  اختر الصف والفصل ثم اضغط 'عرض الطلاب' للبدء.
                </div>
            )}
        </div>
    );
};

export default Attendance;
