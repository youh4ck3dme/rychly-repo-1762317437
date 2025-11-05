

import React from 'react';
import type { Tab } from '../../types';
import { useTranslation } from '../../lib/i18n.tsx';
import { Home, Scissors, Users, Wand2 } from 'lucide-react';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

const NavItem = React.memo(({ label, icon, active, onClick }: NavItemProps) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-1 group focus:outline-none focus:ring-2 focus:ring-white rounded-md p-1 transition-transform transform active:scale-95 w-16">
    <div className={`transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
        {icon}
    </div>
    <span className={`text-xs transition-colors ${active ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>{label}</span>
    <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${active ? 'bg-white' : 'bg-transparent group-hover:bg-gray-600'}`} />
  </button>
));

interface AppFooterProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export const AppFooter = React.memo(({ activeTab, onTabChange }: AppFooterProps) => {
  const { t } = useTranslation();
  
  const navItems: { tab: Tab; labelKey: string; icon: React.ReactNode }[] = [
    { tab: 'home', labelKey: 'footer.home', icon: <Home size={22} /> },
    { tab: 'explore', labelKey: 'footer.explore', icon: <Wand2 size={22} /> },
    { tab: 'services', labelKey: 'footer.services', icon: <Scissors size={22} /> },
    { tab: 'about', labelKey: 'footer.about', icon: <Users size={22} /> },
  ];

  return (
    <footer className="w-full bg-black border-t border-gray-800 p-2 z-20 lg:hidden">
        <nav className="flex justify-around items-center">
            {navItems.map(item => (
                <NavItem 
                    key={item.tab}
                    label={t(item.labelKey)} 
                    icon={item.icon}
                    active={activeTab === item.tab} 
                    onClick={() => onTabChange(item.tab)} 
                />
            ))}
        </nav>
    </footer>
  );
});