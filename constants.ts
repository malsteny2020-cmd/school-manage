import type { NavItem } from './types';
import DashboardIcon from './components/icons/DashboardIcon';
import StudentsIcon from './components/icons/StudentsIcon';
import TeachersIcon from './components/icons/TeachersIcon';
import ClipboardListIcon from './components/icons/ClipboardListIcon';
import DocumentCheckIcon from './components/icons/DocumentCheckIcon';
import BookOpenIcon from './components/icons/BookOpenIcon';
import MegaphoneIcon from './components/icons/MegaphoneIcon';

export const NAV_ITEMS: NavItem[] = [
  { label: 'لوحة التحكم', icon: DashboardIcon },
  { label: 'الطلاب', icon: StudentsIcon },
  { label: 'المعلمين', icon: TeachersIcon },
  { label: 'المواد الدراسية', icon: BookOpenIcon },
  { label: 'الحضور', icon: ClipboardListIcon },
  { label: 'الدرجات', icon: DocumentCheckIcon },
  { label: 'الإعلانات', icon: MegaphoneIcon },
];
