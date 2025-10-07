import React from 'react';
import DashboardCard from '../DashboardCard';
import StudentsIcon from '../icons/StudentsIcon';
import TeachersIcon from '../icons/TeachersIcon';
import AttendanceIcon from '../icons/AttendanceIcon';
import EnrollmentChart from '../EnrollmentChart';
import type { Student, Teacher } from '../../types';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, teachers }) => {
  const totalStudents = students.length;
  const totalTeachers = teachers.length;

  const enrollmentData = students.reduce((acc, student) => {
    const gradeName = `الصف ${student.grade}`;
    const existing = acc.find(item => item.name === gradeName);
    if (existing) {
        existing.students += 1;
    } else {
        acc.push({ name: gradeName, students: 1 });
    }
    return acc;
  }, [] as { name: string; students: number }[]).sort((a, b) => a.name.localeCompare(b.name, 'ar'));


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">لوحة التحكم الرئيسية</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="إجمالي الطلاب"
          value={totalStudents.toString()}
          icon={StudentsIcon}
          color="primary"
        />
        <DashboardCard
          title="إجمالي المعلمين"
          value={totalTeachers.toString()}
          icon={TeachersIcon}
          color="accent"
        />
        <DashboardCard
          title="الحضور اليومي"
          value="96.8%"
          icon={AttendanceIcon}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="bg-surface rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-4 text-white">الطلاب حسب الصف الدراسي</h3>
          <div className="h-80">
               <EnrollmentChart data={enrollmentData} />
          </div>
      </div>
    </div>
  );
};

export default Dashboard;