import React from 'react';
import LogoutIcon from './icons/LogoutIcon';
import MenuIcon from './icons/MenuIcon';
import type { Admin } from '../types';

interface HeaderProps {
    onLogout: () => void;
    user: Admin;
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user, onToggleSidebar }) => {
  return (
    <header className="bg-background/80 backdrop-blur-sm p-4 flex justify-between items-center text-text-primary border-b border-surface sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden text-text-secondary hover:text-white"
          aria-label="فتح القائمة"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold whitespace-nowrap">لوحة تحكم المدير</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
        <p className="hidden sm:block text-sm">المستخدم: <span className="font-bold">{user.name}</span></p>
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
  );
};

export default Header;
