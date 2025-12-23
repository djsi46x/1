'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const haptic = (() => {
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  return (duration: number = 15) => {
    if (canVibrate) navigator.vibrate(duration);
  };
})();

const ICON_PATHS: Record<string, string> = {
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  chevronRight: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
};

const Icon = memo(({ name, className = "w-6 h-6" }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d={ICON_PATHS[name]} />
  </svg>
));
Icon.displayName = 'Icon';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  url: string;
  description?: string;
}

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { id: 'home', label: '信息生成器', icon: 'home', url: '/', description: '生成身份信息' },
  { id: 'mail', label: '临时邮箱大全', icon: 'info', url: '/mail', description: '查看临时邮箱服务列表' }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Sidebar = memo(({ isOpen, onClose, title, children }: SidebarProps) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    scrollYRef.current = window.scrollY;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.cssText = `position:fixed;top:-${scrollYRef.current}px;width:100%;padding-right:${scrollbarWidth}px`;

    return () => {
      body.style.cssText = '';
      window.scrollTo(0, scrollYRef.current);
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    haptic(20);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/20 transition-opacity duration-300"
        onClick={handleClose}
        style={{ touchAction: 'none' }}
      />

      <div className="relative w-[85vw] max-w-sm h-full bg-white flex flex-col shadow-2xl overflow-hidden transition-transform duration-300 translate-x-0">
        <div className="px-4 py-3 border-b border-black/[0.08] sticky top-0 z-10 shrink-0 bg-white">
          <div className="relative flex items-center justify-between min-h-[44px]">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E]">
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 transition-all duration-150 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="关闭"
            >
              <Icon name="close" className="w-5 h-5 text-[#1C1C1E]" />
            </button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto overscroll-contain hide-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}, (prev, next) => prev.isOpen === next.isOpen && prev.title === next.title);
Sidebar.displayName = 'Sidebar';

interface NavItemProps {
  item: NavigationItem;
  onClick: (item: NavigationItem) => void;
}

const NavItem = memo(({ item, onClick }: NavItemProps) => {
  const handleClick = useCallback(() => {
    haptic(20);
    onClick(item);
  }, [item, onClick]);

  return (
    <button
      onClick={handleClick}
      className="w-full glass-card glass-card-hover rounded-[14px] p-4 flex items-center gap-3 min-h-[60px]"
    >
      <div className="p-2.5 rounded-[10px] bg-[#007AFF]/10 flex-shrink-0">
        <Icon name={item.icon} className="w-5 h-5 text-[#007AFF]" />
      </div>

      <div className="flex-1 text-left min-w-0">
        <h4 className="text-[16px] font-semibold text-[#1C1C1E] truncate">
          {item.label}
        </h4>
      </div>

      <Icon name="chevronRight" className="w-5 h-5 text-[#8E8E93] flex-shrink-0" />
    </button>
  );
}, (prev, next) => prev.item.id === next.item.id);
NavItem.displayName = 'NavItem';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationMenu = memo(({ isOpen, onClose }: NavigationMenuProps) => {
  const router = useRouter();

  const handleNavigate = useCallback((item: NavigationItem) => {
    if (item.url.startsWith('http')) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      onClose();
    } else {
      router.push(item.url);
      onClose();
    }
  }, [onClose, router]);

  return (
    <Sidebar isOpen={isOpen} onClose={onClose} title="导航菜单">
      <div className="p-4 pb-8 space-y-2">
        {NAVIGATION_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            onClick={handleNavigate}
          />
        ))}
      </div>
    </Sidebar>
  );
}, (prev, next) => prev.isOpen === next.isOpen);
NavigationMenu.displayName = 'NavigationMenu';
