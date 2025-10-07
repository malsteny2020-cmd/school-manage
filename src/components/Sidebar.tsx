import React from 'react';
import type { NavItem } from '../types';
import LogoIcon from './icons/LogoIcon';
import CloseIcon from './icons/CloseIcon';

interface SidebarProps {
  navItems: NavItem[];
  activeItem: string;
  onNavClick: (item: NavItem) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, activeItem, onNavClick, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>
      
      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 start-0 z-40 w-64 bg-surface text-text-primary flex flex-col h-screen p-4 transform transition-transform lg:transform-none ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between text-center py-4 mb-4 border-b border-secondary">
          <div className="flex items-center gap-3">
             <LogoIcon className="w-8 h-8 text-primary" />
             <h1 className="text-2xl font-bold">نظام المدرسة</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-text-secondary hover:text-white p-1" aria-label="إغلاق القائمة">
             <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => onNavClick(item)}
                  className={`w-full flex items-center p-3 text-right rounded-md transition-colors text-base ${
                    activeItem === item.label
                      ? 'bg-accent text-white shadow-lg'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <item.icon className="w-5 h-5 ml-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-secondary">
            <p className="text-xs text-center text-text-secondary">
                &copy; {new Date().getFullYear()} أنظمة وزارة التعليم
            </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
