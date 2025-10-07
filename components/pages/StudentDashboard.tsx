import React, { useState, useEffect } from 'react';
import type { Student, Grade, Subject, Announcement, Attendance } from '../../types';
import { writeData } from '../../utils/api';
import LogoutIcon from '../icons/LogoutIcon';
import BellIcon from '../icons/BellIcon';
import IdentificationIcon from '../icons/IdentificationIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import ClipboardListIcon from '../icons/ClipboardListIcon';

interface StudentDashboardProps {
  student: Student;
  onLogout: () => void;
  grades: Grade[];
  subjects: Subject[];
  announcements: Announcement[];
  attendance: Attendance[];
}

type ActiveTab = 'personal' | 'grades' | 'attendance' | 'announcements';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onLogout, grades, subjects, announcements, attendance }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
    const [readAnnouncements, setReadAnnouncements] = useState<number[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    
    useEffect(() => {
        const checkUnreadStatus = async () => {
            try {
                const data = await writeData('GET_READ_ANNOUNCEMENTS_BY_STUDENT', { studentId: student.id });
                const readIds = data.readAnnouncementIds || [];
                setReadAnnouncements(readIds);

                const allAnnouncementIds = announcements.map(a => a.id);
                const hasUnreadAnnouncements = allAnnouncementIds.some(id => !readIds.includes(id));
                
                setHasUnread(hasUnreadAnnouncements);

            } catch (error) {
                console.error("Failed to check for unread announcements:", error);
                setHasUnread(false);
            }
        };

        checkUnreadStatus();
    }, [student.id, announcements]);


    const handleTabClick = async (tab: ActiveTab) => {
        setActiveTab(tab);
        if (tab === 'announcements' && hasUnread) {
            const unreadIds = announcements.map(a => a.id).filter(id => !readAnnouncements.includes(id));
            if (unreadIds.length > 0) {
                try {
                    setHasUnread(false);
                    setReadAnnouncements(prev => [...prev, ...unreadIds]);
                    
                    await writeData('MARK_ANNOUNCEMENTS_AS_READ', {
                        studentId: student.id,
                        announcementIds: unreadIds
                    });
                } catch (error) {
                    console.error("Failed to mark announcements as read:", error);
                    setHasUnread(true);
                    setReadAnnouncements(prev => prev.filter(id => !unreadIds.includes(id)));
                }
            }
        }
    };
    
    const studentGrades = grades.filter(g => g.studentId === student.id);
    const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getGradeForSubject = (subjectName: string) => {
        const grade = studentGrades.find(g => g.subject === subjectName);
        return grade ? grade.score : null;
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

    const renderContent = () => {
        switch (activeTab) {
            case 'personal':
                return (
                    <div className="bg-surface rounded-lg shadow-lg p-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <IdentificationIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                                <p className="text-text-secondary">طالب/ة</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-secondary font-semibold">المعرف:</span>
                                <span>{student.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary font-semibold">الصف:</span>
                                <span>{student.grade}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary font-semibold">الفصل:</span>
                                <span>{student.class}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary font-semibold">اسم ولي الأمر:</span>
                                <span>{student.guardianName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary font-semibold">هاتف ولي الأمر:</span>
                                <span dir="ltr">{student.guardianPhone}</span>
                            </div>
                        </div>
                    </div>
                );
            case 'grades':
                return (
                     <div className="bg-surface rounded-lg shadow-lg p-6 animate-fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <DocumentTextIcon className="w-6 h-6 text-accent"/>
                            <h2 className="text-xl font-bold text-white">كشف الدرجات</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right text-text-primary">
                                <thead className="text-xs uppercase bg-secondary/30 text-text-secondary">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">المادة</th>
                                        <th scope="col" className="px-6 py-3 text-center">الدرجة</th>
                                        <th scope="col" className="px-6 py-3 text-center">التقدير</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((subject, index) => {
                                        const score = getGradeForSubject(subject.name);
                                        const gradeLetter = score === null ? '-' : score >= 90 ? 'أ+' : score >= 80 ? 'أ' : score >= 70 ? 'ب' : score >= 60 ? 'ج' : 'د';
                                        const gradeColor = score === null ? 'text-text-secondary' : score >= 90 ? 'text-green-400' : score >= 80 ? 'text-sky-400' : score >= 70 ? 'text-yellow-400' : score >= 60 ? 'text-orange-400' : 'text-red-400';

                                        return (
                                            <tr key={subject.id} className={`border-b border-secondary ${index % 2 === 0 ? 'bg-surface' : 'bg-background'}`}>
                                                <td className="px-6 py-4 font-bold">{subject.name}</td>
                                                <td className={`px-6 py-4 text-center font-mono font-bold ${gradeColor}`}>{score ?? 'لم ترصد'}</td>
                                                <td className={`px-6 py-4 text-center font-bold ${gradeColor}`}>{gradeLetter}</td>
                                            </tr>
                                        )
                                    })}
                                     {subjects.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="text-center p-6 text-text-secondary">
                                                لا توجد مواد دراسية مسجلة.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'attendance':
                const studentAttendance = attendance
                    .filter(a => a.studentId === student.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                const stats = {
                    present: studentAttendance.filter(a => a.status === 'present').length,
                    absent: studentAttendance.filter(a => a.status === 'absent').length,
                    late: studentAttendance.filter(a => a.status === 'late').length,
                };
                
                const getStatusBadge = (status: Attendance['status']) => {
                    switch(status) {
                        case 'present': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300">حاضر</span>;
                        case 'absent': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-300">غائب</span>;
                        case 'late': return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300">متأخر</span>;
                        default: return null;
                    }
                };
                
                return (
                     <div className="bg-surface rounded-lg shadow-lg p-6 animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <ClipboardListIcon className="w-6 h-6 text-primary"/>
                            <h2 className="text-xl font-bold text-white">سجل الحضور والغياب</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                            <div className="bg-green-500/10 p-4 rounded-lg">
                                <p className="text-2xl font-bold text-green-300">{stats.present}</p>
                                <p className="text-sm text-text-secondary">يوم حضور</p>
                            </div>
                             <div className="bg-red-500/10 p-4 rounded-lg">
                                <p className="text-2xl font-bold text-red-300">{stats.absent}</p>
                                <p className="text-sm text-text-secondary">يوم غياب</p>
                            </div>
                             <div className="bg-yellow-500/10 p-4 rounded-lg">
                                <p className="text-2xl font-bold text-yellow-300">{stats.late}</p>
                                <p className="text-sm text-text-secondary">يوم تأخير</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                            <table className="w-full text-sm text-right text-text-primary">
                                <thead className="text-xs uppercase bg-secondary/30 text-text-secondary sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">التاريخ</th>
                                        <th scope="col" className="px-6 py-3 text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-background">
                                    {studentAttendance.map((record, index) => (
                                        <tr key={`${record.date}-${index}`} className="border-b border-secondary">
                                            <td className="px-6 py-4 font-mono">{record.date}</td>
                                            <td className="px-6 py-4 text-center">{getStatusBadge(record.status)}</td>
                                        </tr>
                                    ))}
                                    {studentAttendance.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="text-center p-6 text-text-secondary">
                                                لا توجد سجلات حضور حتى الآن.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'announcements':
                return (
                    <div className="bg-surface rounded-lg shadow-lg p-6 animate-fade-in">
                         <div className="flex items-center gap-3 mb-4">
                            <BellIcon className="w-6 h-6 text-yellow-400"/>
                            <h2 className="text-xl font-bold text-white">لوحة الإعلانات</h2>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {sortedAnnouncements.map(announcement => (
                                <div key={announcement.id} className="bg-background rounded-lg p-4 border-l-4 border-accent/50">
                                    <div className="flex justify-between items-start">
                                       <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                 {getCategoryBadge(announcement.category)}
                                                <span className="text-sm text-text-secondary">{announcement.date}</span>
                                            </div>
                                            <h3 className="text-md font-bold text-white">{announcement.title}</h3>
                                       </div>
                                    </div>
                                    <p className="text-text-secondary text-sm mt-2 whitespace-pre-wrap">{announcement.content}</p>
                                </div>
                            ))}
                             {sortedAnnouncements.length === 0 && (
                                <div className="text-center p-6 text-text-secondary">
                                    لا توجد إعلانات حالية.
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const navItems = [
        { id: 'personal', label: 'الشخصية', icon: IdentificationIcon },
        { id: 'grades', label: 'الدرجات', icon: DocumentTextIcon },
        { id: 'attendance', label: 'الحضور', icon: ClipboardListIcon },
        { id: 'announcements', label: 'الإعلانات', icon: BellIcon }
    ];

    return (
        <div className="bg-background text-text-primary min-h-screen font-sans">
            <header className="bg-surface/80 backdrop-blur-sm p-4 flex justify-between items-center text-text-primary border-b border-secondary sticky top-0 z-20">
                <div>
                    <h1 className="text-xl font-bold">بوابة الطالب</h1>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <p className="hidden sm:block text-sm">أهلاً بك، <span className="font-bold">{student.name}</span></p>
                    <button 
                        onClick={onLogout}
                        className="bg-accent text-white px-3 py-2 rounded-md hover:bg-indigo-600 flex items-center gap-2 text-sm transition-colors"
                        aria-label="تسجيل الخروج"
                    >
                       <LogoutIcon className="w-4 h-4" />
                       <span className="hidden sm:inline">خروج</span>
                    </button>
                </div>
            </header>
            
            <div className="flex flex-col md:flex-row-reverse max-w-7xl mx-auto p-4 md:p-8 gap-8">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
                    <nav className="bg-surface rounded-lg shadow-lg p-4 space-y-2 sticky top-24">
                       {navItems.map(item => (
                           <button
                               key={item.id}
                               onClick={() => handleTabClick(item.id as ActiveTab)}
                               className={`w-full flex items-center p-3 text-right rounded-md transition-colors text-base relative ${
                                 activeTab === item.id
                                   ? 'bg-accent text-white shadow-lg'
                                   : 'hover:bg-secondary/50'
                               }`}
                           >
                               <item.icon className="w-5 h-5 ml-4" />
                               <span>{item.label === 'الشخصية' ? 'المعلومات الشخصية' : item.label}</span>
                               {item.id === 'announcements' && hasUnread && (
                                   <span className="absolute top-2 right-2 flex h-3 w-3">
                                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                       <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                   </span>
                               )}
                           </button>
                       ))}
                    </nav>
                </aside>

                 <main className="flex-1 pb-20 md:pb-0">
                    {renderContent()}
                 </main>
            </div>
            
            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-sm border-t border-secondary z-30">
                <div className="flex justify-around items-center max-w-xl mx-auto">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleTabClick(item.id as ActiveTab)}
                            className={`flex flex-col items-center justify-center p-2 w-full transition-colors relative ${
                                activeTab === item.id ? 'text-primary' : 'text-text-secondary hover:text-primary'
                            }`}
                            aria-label={item.label}
                        >
                             <div className="relative">
                                <item.icon className="w-6 h-6 mb-1" />
                                {item.id === 'announcements' && hasUnread && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-surface"></span>
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-semibold">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <style>{`
                @keyframes fade-in {
                  0% { opacity: 0; transform: translateY(10px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                  animation: fade-in 0.4s ease-out forwards;
                }
              `}</style>
        </div>
    );
};

export default StudentDashboard;