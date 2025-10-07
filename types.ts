import type React from 'react';

export interface NavItem {
  label: string;
  icon: React.ElementType;
}

export interface Admin {
  id: number | string;
  name: string;
  username: string;
  password?: string;
}

export interface Student {
  id: number;
  username: string;
  password?: string;
  name: string;
  grade: number;
  class: string;
  guardianName: string;
  guardianPhone: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Teacher {
  id: number;
  name: string;
  subject: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  teacherId: number;
}

export interface Grade {
  studentId: number;
  subject: string;
  score: number;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  category: 'general' | 'academic' | 'urgent';
}

export interface Attendance {
    studentId: number;
    date: string;
    status: 'present' | 'absent' | 'late';
}

export interface AppData {
    students: Student[];
    teachers: Teacher[];
    subjects: Subject[];
    grades: Grade[];
    announcements: Announcement[];
    attendance: Attendance[];
    adminCredentials: Admin[];
}