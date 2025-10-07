import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'primary' | 'accent' | 'green';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    primary: 'bg-sky-500/10 text-sky-400',
    accent: 'bg-indigo-500/10 text-indigo-400',
    green: 'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg p-5 flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-text-secondary">{title}</p>
        <p className="text-3xl font-bold text-text-primary mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon className="h-7 w-7" />
      </div>
    </div>
  );
};

export default DashboardCard;