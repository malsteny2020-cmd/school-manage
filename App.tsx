import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/pages/Dashboard';
import Students from './components/pages/Students';
import Teachers from './components/pages/Teachers';
import Subjects from './components/pages/Subjects';
import Attendance from './components/pages/Attendance';
import Grades from './components/pages/Grades';
import Announcements from './components/pages/Announcements';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import StudentDashboard from './components/pages/StudentDashboard';
import { NAV_ITEMS } from './constants';
import { fetchAllData } from './utils/api';
import type { NavItem, AppData, Student, Admin } from './types';

const App: React.FC = () => {
    const [activeItem, setActiveItem] = useState<string>(NAV_ITEMS[0].label);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AppData | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<{ type: 'admin' | 'student'; data: Admin | Student } | null>(null);
    const [view, setView] = useState<'login' | 'register'>('login');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetchedData = await fetchAllData();
                setData(fetchedData);
            } catch (err: any) {
                setError(err.message || 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        const sessionUser = sessionStorage.getItem('loggedInUser');
        if (sessionUser) {
            setLoggedInUser(JSON.parse(sessionUser));
        }

        loadData();
    }, []);

    const handleLogin = (user: { type: 'admin' | 'student'; data: Admin | Student }) => {
        setLoggedInUser(user);
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));
        if (user.type === 'admin') {
            setActiveItem(NAV_ITEMS[0].label);
        }
    };

    const handleLogout = () => {
        setLoggedInUser(null);
        sessionStorage.removeItem('loggedInUser');
    };

    const renderContent = () => {
        if (!data) return null;

        switch (activeItem) {
            case 'لوحة التحكم':
                return <Dashboard students={data.students} teachers={data.teachers} />;
            case 'الطلاب':
                return <Students students={data.students} setStudents={(s) => setData({ ...data, students: s })} />;
            case 'المعلمين':
                return <Teachers teachers={data.teachers} setTeachers={(t) => setData({ ...data, teachers: t })} />;
            case 'المواد الدراسية':
                 return <Subjects subjects={data.subjects} setSubjects={(s) => setData({ ...data, subjects: s })} teachers={data.teachers} />;
            case 'الحضورو الغياب':
                return <Attendance students={data.students} attendance={data.attendance} setAttendance={(a) => setData({ ...data, attendance: a })} />;
            case 'الدرجات':
                return <Grades students={data.students} subjects={data.subjects} grades={data.grades} setGrades={(g) => setData({ ...data, grades: g })} />;
            case 'الإعلانات':
                 return <Announcements announcements={data.announcements} setAnnouncements={(a) => setData({ ...data, announcements: a })} />;
            default:
                return <Dashboard students={data.students} teachers={data.teachers} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-white">
                <div className="text-center">
                    <p className="text-2xl font-bold">...جاري تحميل البيانات</p>
                    <p className="text-sm text-text-secondary mt-2">قد يستغرق هذا بعض الوقت. شكراً لصبركم</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-white p-4">
                <div className="bg-red-900/50 border border-red-700 p-8 rounded-lg text-center max-w-lg">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">حدث خطأ فادح</h2>
                    <p className="text-red-300 mb-6">{error}</p>
                    <p className="text-sm text-text-secondary">يرجى التأكد من صحة إعدادات الربط مع Google Sheets في ملف `config.ts` ومن أن إعدادات المشاركة للملف صحيحة (Anyone with the link can view).</p>
                </div>
            </div>
        );
    }

    if (!loggedInUser && data) {
        if (view === 'login') {
            return <Login 
                onLogin={handleLogin} 
                onSwitchToRegister={() => setView('register')} 
            />;
        } else {
            return <Register 
                onBackToLogin={() => setView('login')} 
            />;
        }
    }
    
    if (loggedInUser?.type === 'student' && data) {
        return (
            <StudentDashboard 
                student={loggedInUser.data as Student} 
                onLogout={handleLogout}
                grades={data.grades}
                subjects={data.subjects}
                announcements={data.announcements}
                attendance={data.attendance}
            />
        );
    }
    
    if (loggedInUser?.type === 'admin' && data) {
        return (
            <div className="flex h-screen bg-background text-text-primary font-sans" dir="rtl">
                <Sidebar
                    navItems={NAV_ITEMS}
                    activeItem={activeItem}
                    onNavClick={(item: NavItem) => {
                        setActiveItem(item.label)
                        setIsSidebarOpen(false); // Close sidebar on nav click on mobile
                    }}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header 
                        onLogout={handleLogout} 
                        user={loggedInUser.data as Admin} 
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                        {renderContent()}
                    </main>
                </div>
            </div>
        );
    }

    return null;
};

export default App;