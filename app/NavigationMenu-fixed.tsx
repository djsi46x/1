import React, { memo, useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- 触摸反馈(缓存实例) ---
const haptic = (() => {
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  return (duration: number = 15) => {
    if (canVibrate) navigator.vibrate(duration);
  };
})();

// --- 图标组件(完全静态化) ---
const ICON_PATHS: Record<string, string> = {
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  chevronRight: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  settings: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
};

const Icon = memo(({ name, className = "w-6 h-6" }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d={ICON_PATHS[name]} />
  </svg>
));
Icon.displayName = 'Icon';

// --- 导航项接口 ---
interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  url: string;
  description?: string;
}

// --- 导航数据(完全静态) ---
const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { id: 'home', label: '信息生成器', icon: 'home', url: '/', description: '生成身份信息' },
  { id: 'mail', label: '临时邮箱大全', icon: 'info', url: '/mail', description: '查看临时邮箱服务列表' }
];

// --- 侧边栏接口 ---
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// --- 高性能侧边栏组件(修复版 - 移除动画延迟) ---
const Sidebar = memo(({ isOpen, onClose, title, children }: SidebarProps) => {
  const scrollYRef = useRef(0);

  // 优化:只在打开时执行防滚动逻辑
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

  // 即时关闭处理
  const handleClose = useCallback(() => {
    haptic(20);
    onClose();
  }, [onClose]);

  // 不显示时直接返回 null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out opacity-100"
        onClick={handleClose}
        style={{
          touchAction: 'none'
        }}
      />

      {/* 侧边栏容器 */}
      <div
        className="relative w-[85vw] max-w-sm h-full bg-black/20 backdrop-blur-3xl border-r border-white/30 flex flex-col shadow-2xl overflow-hidden transition-transform duration-300 translate-x-0"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* 顶部标题栏 */}
        <div className="p-5 pb-4 border-b border-white/20 sticky top-0 z-10 shrink-0 bg-black/15 backdrop-blur-2xl">
          <div className="relative flex items-center justify-between min-h-[28px]">
            <h3 className="text-[19px] font-bold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="bg-white/25 p-2.5 rounded-full text-white hover:bg-white/35 active:scale-90 transition-all duration-150 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center shadow-xl hover:shadow-2xl"
              aria-label="关闭"
            >
              <Icon name="close" className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]" />
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}, (prev, next) => prev.isOpen === next.isOpen && prev.title === next.title);
Sidebar.displayName = 'Sidebar';

// --- 导航项组件(简化版 - 移除复杂动画) ---
interface NavItemProps {
  item: NavigationItem;
  index: number;
  onClick: (item: NavigationItem) => void;
}

const NavItem = memo(({ item, index, onClick }: NavItemProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = useCallback(() => {
    haptic(30);
    onClick(item);
  }, [item, onClick]);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    haptic(15);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`w-full bg-white/10 backdrop-blur-lg border border-white/25 rounded-[14px] p-3.5 flex items-center gap-3 transition-all duration-150 touch-manipulation hover:bg-white/20 hover:border-white/40 hover:shadow-xl min-h-[60px] shadow-xl ${
        isPressed ? 'scale-[0.96] bg-white/15' : 'scale-100'
      }`}
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: 'backwards'
      }}
    >
      <div
        className={`bg-gradient-to-br from-blue-500/80 to-blue-600/80 p-2.5 rounded-[10px] border border-white/40 flex-shrink-0 shadow-lg transition-transform duration-150 ${
          isPressed ? 'scale-90' : 'scale-100'
        }`}
      >
        <Icon name={item.icon} className="w-5 h-5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" />
      </div>

      <div className="flex-1 text-left min-w-0">
        <h4 className="text-[16px] font-bold text-white tracking-tight truncate drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
          {item.label}
        </h4>
      </div>

      <Icon
        name="chevronRight"
        className={`w-5 h-5 text-white/90 flex-shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-150 ${
          isPressed ? 'translate-x-1' : 'translate-x-0'
        }`}
      />
    </button>
  );
}, (prev, next) =>
  prev.item.id === next.item.id &&
  prev.index === next.index
);
NavItem.displayName = 'NavItem';

// --- 高性能导航菜单组件(简化版) ---
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
      <div className="p-5 pb-8 space-y-3">
        {NAVIGATION_ITEMS.map((item, index) => (
          <NavItem
            key={item.id}
            item={item}
            index={index}
            onClick={handleNavigate}
          />
        ))}
      </div>
    </Sidebar>
  );
}, (prev, next) => prev.isOpen === next.isOpen);
NavigationMenu.displayName = 'NavigationMenu';

// --- 全局样式(性能优化版) ---
const GlobalStyles = memo(() => (
  <style>{`
    /* 隐藏滚动条 */
    *::-webkit-scrollbar {
      display: none;
    }

    * {
      -webkit-tap-highlight-color: transparent;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    /* 优化移动端滚动 */
    @supports (-webkit-overflow-scrolling: touch) {
      .overscroll-contain {
        -webkit-overflow-scrolling: touch;
      }
    }

    /* 提升动画性能 */
    @media (prefers-reduced-motion: no-preference) {
      * {
        scroll-behavior: smooth;
      }
    }

    /* 低性能设备降级 */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `}</style>
));
GlobalStyles.displayName = 'GlobalStyles';

// --- 演示组件 ---
export default function Demo() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <GlobalStyles />
      <button
        onClick={handleOpen}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-2xl shadow-xl active:scale-95 transition-transform duration-150"
      >
        打开导航菜单
      </button>
      
      <NavigationMenu isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}
