import React from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Instagram, Facebook } from "lucide-react";
import { TikTokIcon } from "./TikTokIcon";
import type { Tab } from "../../types";
import { useTranslation } from "../../lib/i18n.tsx";

const Clock = React.memo(() => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date) => {
    return date
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(" AM", "")
      .replace(" PM", "");
  };

  return <span className="text-sm font-semibold">{formatTime(time)}</span>;
});

interface DesktopNavItemProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

const DesktopNavItem = React.memo(
  ({ label, active, onClick }: DesktopNavItemProps) => (
    <button
      onClick={onClick}
      className="relative text-sm font-semibold group focus:outline-none py-2"
    >
      <span
        className={`transition-colors ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}
      >
        {label}
      </span>
      <div
        className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full transition-all duration-300 transform ${active ? "bg-white scale-x-100" : "bg-transparent scale-x-0 group-hover:scale-x-100 group-hover:bg-gray-600"}`}
      />
    </button>
  ),
);

interface AppHeaderProps {
  onRestart: () => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const AppHeader = React.memo(
  ({ onRestart, activeTab, onTabChange }: AppHeaderProps) => {
    const { t } = useTranslation();

    const navItems: { tab: Tab; labelKey: string }[] = [
      { tab: "home", labelKey: "footer.home" },
      { tab: "explore", labelKey: "footer.explore" },
      { tab: "services", labelKey: "footer.services" },
      { tab: "about", labelKey: "footer.about" },
    ];

    return (
      <header className="w-full flex-shrink-0 z-10">
        <div className="p-4 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2 lg:w-1/3">
            <button onClick={onRestart} aria-label="Go to home screen">
              <PapiLogo />
            </button>
          </div>

          <nav className="hidden lg:flex justify-center items-center space-x-8 w-1/3">
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.tab}
                label={t(item.labelKey)}
                active={activeTab === item.tab}
                onClick={() => onTabChange(item.tab)}
              />
            ))}
          </nav>

          <div className="flex justify-end items-center space-x-3 lg:w-1/3">
            <div className="hidden lg:flex items-center space-x-2">
              <Clock />
              <LanguageSwitcher />
            </div>
            <a
              href="https://www.instagram.com/papi_hair_design/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-300 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.facebook.com/papihairdesign/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-300 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://www.tiktok.com/@papi_hair_design?_t=ZN-900K0AEZh3e&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-300 transition-colors"
              aria-label="TikTok"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
            <div className="lg:hidden">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
    );
  },
);

const PapiLogo = () => (
  <div className="text-center">
    <div
      className="text-2xl font-bold tracking-wider bg-gradient-to-r from-yellow-300 via-white to-yellow-200 bg-clip-text text-transparent"
      style={{ textShadow: "0 1px 10px rgba(255, 215, 0, 0.3)" }}
    >
      PAPI
    </div>
    <p className="text-[0.6rem] tracking-[0.3em] whitespace-nowrap bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
      HAIR DESIGN & BARBER
    </p>
  </div>
);
