import { useState, useEffect, useCallback, memo } from 'react';

const ICON_PATHS: Record<string, React.ReactElement> = {
  check: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>,
  gift: <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
};

const Icon = memo(({ name, className = "w-6 h-6" }: { name: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">{ICON_PATHS[name]}</svg>
));
Icon.displayName = 'Icon';

const haptic = (duration: number = 15) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

const setCookie = (name: string, value: string, days: number = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const FreeNoticeModal = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNoticeStatus = () => {
      const shown = getCookie('freeNoticeShown');
      if (shown !== 'true') {
        setIsOpen(true);
      }
      setIsLoading(false);
    };
    checkNoticeStatus();
  }, []);

  const handleClose = useCallback(() => {
    haptic(20);
    setIsOpen(false);
  }, []);

  const handleDontShowAgain = useCallback(() => {
    haptic(30);
    setIsOpen(false);
    setCookie('freeNoticeShown', 'true', 365);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (isLoading || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-sm bg-white rounded-[20px] overflow-hidden shadow-2xl max-h-[85vh] flex flex-col animate-scaleIn">
        <div className="p-6 pt-8 space-y-6 overflow-y-auto flex-1 hide-scrollbar">
          <div className="flex justify-center">
            <div className="w-16 h-16 text-5xl flex items-center justify-center">
              📱
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#1C1C1E]">
              欢迎使用
            </h2>
            <p className="text-[#8E8E93] text-[15px]">
              无广告 · 无限制
            </p>
          </div>

          <div className="space-y-3 bg-[#F2F2F7] rounded-[16px] p-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#34C759]/10 p-2 rounded-[10px] shrink-0">
                <Icon name="check" className="w-5 h-5 text-[#34C759]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#1C1C1E] font-semibold text-[15px] mb-1">
                  无广告干扰
                </h3>
                <p className="text-[#8E8E93] text-[13px] leading-relaxed">
                  纯净体验,专注使用
                </p>
              </div>
            </div>

            <div className="h-[0.5px] bg-black/[0.08]" />

            <div className="flex items-start gap-3">
              <div className="bg-[#007AFF]/10 p-2 rounded-[10px] shrink-0">
                <Icon name="gift" className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#1C1C1E] font-semibold text-[15px] mb-1">
                  无使用限制
                </h3>
                <p className="text-[#8E8E93] text-[13px] leading-relaxed">
                  随心使用,畅享所有功能
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pb-safe">
            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-[#007AFF] rounded-[14px] text-white font-semibold text-[16px] shadow-[0_2px_8px_rgba(0,122,255,0.3)] active:scale-[0.96] transition-all touch-manipulation"
            >
              开始使用
            </button>

            <a
              href="https://t.me/fang180"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptic(20)}
              className="block w-full py-3 text-[#007AFF] text-[14px] font-medium text-center active:opacity-70 transition-opacity touch-manipulation"
            >
              加入交流群 @fang180
            </a>

            <button
              onClick={handleDontShowAgain}
              className="w-full py-3 text-[#8E8E93] text-[14px] font-medium active:opacity-70 transition-opacity touch-manipulation"
            >
              不再提示
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
FreeNoticeModal.displayName = 'FreeNoticeModal';