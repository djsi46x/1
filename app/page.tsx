'use client';

import { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import { FreeNoticeModal } from './FreeNoticeModal';
import { NavigationMenu } from './NavigationMenu';
import RandomBackground from '@/components/RandomBackground';
import { countries, CountryConfig } from '@/lib/countryData';
import {
  generateName,
  generateBirthday,
  generatePhone,
  generatePassword,
  generateEmail,
  getCountryConfig,
  getAllDomains
} from '@/lib/generator';

interface UserInfo {
  firstName: string;
  lastName: string;
  birthday: string;
  phone: string;
  password: string;
  email: string;
}

const ICON_PATHS: Record<string, React.ReactElement> = {
  check: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>,
  chevronRight: <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>,
  close: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>,
  sparkles: <path d="M7 11v2l-4 1 4 1v2l1-4-1-4zm5-7v4l-3 1 3 1v4l2-5-2-5zm5.66 2.94L15 6.26l.66-2.94L18.34 6l2.66.68-2.66.68-.68 2.58-.66-2.94zM15 18l-2-3 2-3 2 3-2 3z"/>,
  search: <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>,
  inbox: <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"/>,
  link: <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>,
  menu: <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
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

const InfoRow = memo(({ label, value, onCopy, isCopied, isLast = false }: {
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
  isLast?: boolean;
}) => (
  <div
    onClick={onCopy}
    className={`group relative flex items-center justify-between py-3.5 px-4 cursor-pointer transition-all duration-200 touch-manipulation active:scale-[0.99] ${
      isCopied ? 'bg-[#007AFF]/10' : 'active:bg-black/5'
    }`}
  >
    <span className="text-[15px] font-medium text-[#8E8E93] w-20 shrink-0">
      {label}
    </span>

    <div className="flex items-center gap-3 min-w-0 flex-1 justify-end h-6 relative overflow-hidden">
      <span
        className={`absolute right-0 text-[16px] font-semibold truncate select-all transition-all duration-300 ${
          isCopied ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100 text-[#1C1C1E]'
        }`}
      >
        {value || '---'}
      </span>

      <div
        className={`absolute right-0 flex items-center gap-1.5 transition-all duration-300 ${
          isCopied ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-90 pointer-events-none'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <div className="bg-[#34C759] rounded-full p-0.5">
          <Icon name="check" className="w-3 h-3 text-white" />
        </div>
        <span className="text-[14px] font-semibold text-[#34C759]">
          已复制
        </span>
      </div>
    </div>

    {!isLast && <div className="absolute bottom-0 left-4 right-0 h-[0.5px] bg-black/10" />}
  </div>
));
InfoRow.displayName = 'InfoRow';

const BottomSheet = memo(({
  isOpen,
  onClose,
  title,
  children,
  rightAction
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md glass-card rounded-t-[20px] sm:rounded-[20px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        style={{
          animation: 'slideUp 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <div className="p-4 border-b border-black/5 sticky top-0 z-10 shrink-0 bg-white">
          <div className="w-9 h-1 bg-black/10 rounded-full mx-auto mb-4" />
          <div className="relative flex items-center justify-center min-h-[22px]">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E]">
              {title}
            </h3>
            {rightAction ? (
              <div className="absolute right-0 top-1/2 -translate-y-1/2">{rightAction}</div>
            ) : (
              <button
                onClick={onClose}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/5 p-1.5 rounded-full text-[#8E8E93] hover:bg-black/10 active:scale-95 transition-all touch-manipulation"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
});
BottomSheet.displayName = 'BottomSheet';

const ListItem = memo(({ label, isSelected, onClick, icon }: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] touch-manipulation ${
      isSelected
        ? 'bg-[#007AFF]/10 text-[#007AFF] font-semibold'
        : 'bg-transparent text-[#1C1C1E] active:bg-black/5'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon && (
        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#007AFF]/20' : 'bg-black/5'}`}>
          <Icon name={icon} className={`w-4 h-4 ${isSelected ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`} />
        </div>
      )}
      <span className="text-[16px]">{label}</span>
    </div>
    {isSelected && <Icon name="check" className="w-5 h-5 text-[#007AFF]" />}
  </button>
));
ListItem.displayName = 'ListItem';

const CountryList = memo(({ countries, selectedCode, onSelect }: {
  countries: CountryConfig[];
  selectedCode: string;
  onSelect: (c: CountryConfig) => void;
}) => (
  <div className="p-4 space-y-2">
    {countries.map((country) => (
      <ListItem
        key={country.code}
        label={country.name}
        isSelected={selectedCode === country.code}
        onClick={() => onSelect(country)}
      />
    ))}
  </div>
));
CountryList.displayName = 'CountryList';

const DomainList = memo(({ allDomains, selectedDomain, onSelect }: {
  allDomains: string[];
  selectedDomain: string;
  onSelect: (d: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredDomains = useMemo(() => {
    if (!searchQuery) return allDomains;
    return allDomains.filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allDomains, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pb-2 sticky top-0 z-10 bg-white">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="w-4 h-4 text-[#8E8E93]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索域名"
            className="w-full pl-9 pr-8 py-2 bg-black/5 border border-transparent rounded-lg text-[16px] text-[#1C1C1E] placeholder-[#8E8E93] focus:ring-2 focus:ring-[#007AFF]/20 focus:bg-white transition-colors caret-[#007AFF] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation active:scale-90 transition-transform"
            >
              <div className="bg-black/10 rounded-full p-0.5">
                <Icon name="close" className="w-3 h-3 text-[#8E8E93]" />
              </div>
            </button>
          )}
        </div>
      </div>
      <div className="p-4 pt-2 space-y-2">
        {!searchQuery && (
          <ListItem
            label="随机域名"
            isSelected={selectedDomain === 'random'}
            onClick={() => onSelect('random')}
            icon="sparkles"
          />
        )}
        {filteredDomains.map((domain) => (
          <ListItem
            key={domain}
            label={domain}
            isSelected={selectedDomain === domain}
            onClick={() => onSelect(domain)}
          />
        ))}
        {filteredDomains.length === 0 && (
          <div className="text-center py-8 text-[#8E8E93] text-sm">无匹配结果</div>
        )}
      </div>
    </div>
  );
});
DomainList.displayName = 'DomainList';

export default function HomePage() {
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(countries[0]);
  const [selectedDomain, setSelectedDomain] = useState<string>('random');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '', lastName: '', birthday: '', phone: '', password: '', email: ''
  });
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [showDomainSheet, setShowDomainSheet] = useState(false);
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);
  const [ipInfo, setIpInfo] = useState({ ip: '...', country: 'US' });
  const [isInitialized, setIsInitialized] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [inboxStatus, setInboxStatus] = useState<'idle' | 'opening'>('idle');

  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    haptic(30);
    try {
      await navigator.clipboard.writeText(text);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      setCopiedField(label);
      copyTimerRef.current = setTimeout(() => setCopiedField(null), 1500);
    } catch {
      haptic(50);
    }
  }, []);

  const generate = useCallback(() => {
    haptic(50);
    setCopiedField(null);

    try {
      const { firstName, lastName } = generateName(selectedCountry.code);
      const birthday = generateBirthday();
      const phone = generatePhone(selectedCountry);
      const password = generatePassword();
      const customDomain = selectedDomain === 'random' ? undefined : selectedDomain;
      const email = generateEmail(firstName, lastName, customDomain);
      setUserInfo({ firstName, lastName, birthday, phone, password, email });
    } catch (error) {
      console.error(error);
    }
  }, [selectedCountry, selectedDomain]);

  const handleInboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (inboxStatus === 'opening') return;
    haptic(30);
    setInboxStatus('opening');
    const emailName = userInfo.email.split('@')[0];
    setTimeout(() => {
      window.open(`https://yopmail.net/?login=${emailName}`, '_blank');
      setInboxStatus('idle');
    }, 600);
  }, [userInfo.email, inboxStatus]);

  useEffect(() => {
    let isMounted = true;
    const initializeApp = async () => {
      try {
        const response = await fetch('/api/ip-info');
        const data = await response.json();
        if (!isMounted) return;
        setIpInfo({ ip: data.ip || '未知', country: data.country || 'US' });
        if (data.country && data.accurate) {
          const detectedCountry = getCountryConfig(data.country);
          if (detectedCountry) setSelectedCountry(detectedCountry);
        }
        setIsInitialized(true);
      } catch (error) {
        if (isMounted) {
          setIpInfo({ ip: '检测失败', country: 'US' });
          setIsInitialized(true);
        }
      }
    };
    initializeApp();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isInitialized && !userInfo.firstName) {
      generate();
    }
  }, [isInitialized, userInfo.firstName, generate]);

  useEffect(() => {
    if (isInitialized && userInfo.firstName) generate();
  }, [selectedCountry.code]);

  const allDomains = useMemo(() => getAllDomains(), []);
  const displayDomain = selectedDomain === 'random' ? '随机' : selectedDomain;

  const handleCountrySelect = useCallback((country: CountryConfig) => {
    haptic(20);
    setSelectedCountry(country);
    setShowCountrySheet(false);
  }, []);

  const handleDomainSelect = useCallback((domain: string) => {
    haptic(20);
    setSelectedDomain(domain);
    setShowDomainSheet(false);
  }, []);

  return (
    <div className="min-h-screen relative">
      <RandomBackground />
      <FreeNoticeModal />

      <div className="max-w-2xl mx-auto relative z-10">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-white/30">
          <div className="flex items-center justify-between h-14 px-4">
            <h1 className="text-[17px] font-semibold text-[#1C1C1E]">
              脸书小助手
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#34C759]/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                <span className="text-[11px] font-semibold text-[#34C759] font-mono">
                  {ipInfo.ip}
                </span>
              </div>

              <button
                onClick={() => { haptic(20); setShowNavigationMenu(true); }}
                className="p-2 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 transition-all touch-manipulation"
              >
                <Icon name="menu" className="w-5 h-5 text-[#1C1C1E]" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 pt-6 pb-10 space-y-4">
          {!isInitialized ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-8 h-8 border-[3px] border-black/10 border-t-[#007AFF] rounded-full animate-spin" />
              <p className="text-[#8E8E93] text-sm">加载中...</p>
            </div>
          ) : (
            <>
              <section className="glass-card rounded-[16px] overflow-hidden">
                <InfoRow label="姓氏" value={userInfo.lastName} onCopy={() => copyToClipboard(userInfo.lastName, '姓氏')} isCopied={copiedField === '姓氏'} />
                <InfoRow label="名字" value={userInfo.firstName} onCopy={() => copyToClipboard(userInfo.firstName, '名字')} isCopied={copiedField === '名字'} />
                <InfoRow label="生日" value={userInfo.birthday} onCopy={() => copyToClipboard(userInfo.birthday, '生日')} isCopied={copiedField === '生日'} />
                <InfoRow label="手机号" value={userInfo.phone} onCopy={() => copyToClipboard(userInfo.phone, '手机号')} isCopied={copiedField === '手机号'} />
                <InfoRow label="密码" value={userInfo.password} onCopy={() => copyToClipboard(userInfo.password, '密码')} isCopied={copiedField === '密码'} />

                <div className="relative flex flex-col py-3.5 px-4">
                  <div
                    className="flex items-center justify-between mb-2.5 cursor-pointer touch-manipulation active:scale-[0.99] transition-transform"
                    onClick={() => copyToClipboard(userInfo.email, '邮箱')}
                  >
                    <span className="text-[15px] font-medium text-[#8E8E93] w-20 shrink-0">
                      邮箱
                    </span>

                    <div className="flex items-center gap-3 min-w-0 flex-1 justify-end h-6 relative overflow-hidden">
                      <span
                        className={`absolute right-0 text-[16px] font-semibold truncate select-all transition-all duration-300 ${
                          copiedField === '邮箱' ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100 text-[#1C1C1E]'
                        }`}
                      >
                        {userInfo.email}
                      </span>
                      <div
                        className={`absolute right-0 flex items-center gap-1.5 transition-all duration-300 ${
                          copiedField === '邮箱' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-90 pointer-events-none'
                        }`}
                        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                      >
                        <div className="bg-[#34C759] rounded-full p-0.5">
                          <Icon name="check" className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[14px] font-semibold text-[#34C759]">已复制</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleInboxClick}
                      className={`inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-[13px] font-semibold transition-all duration-300 active:scale-95 touch-manipulation ${
                        inboxStatus === 'opening'
                          ? 'bg-[#34C759]/20 text-[#34C759]'
                          : 'bg-[#007AFF]/10 text-[#007AFF]'
                      }`}
                    >
                      <Icon name="inbox" className="w-3.5 h-3.5" />
                      <span>{inboxStatus === 'opening' ? '打开中' : '查看收件箱'}</span>
                    </button>
                  </div>
                </div>
              </section>

              <button
                onClick={generate}
                className="w-full py-3.5 btn-primary flex items-center justify-center gap-2"
              >
                <Icon name="sparkles" className="w-5 h-5" />
                <span className="text-[17px]">生成新身份</span>
              </button>

              <section>
                <h2 className="text-[13px] font-semibold text-[#8E8E93] uppercase px-4 mb-2">
                  生成设置
                </h2>
                <div className="glass-card rounded-[16px] overflow-hidden">
                  <button
                    onClick={() => { haptic(20); setShowCountrySheet(true); }}
                    className="w-full flex items-center justify-between py-3.5 px-4 active:bg-black/5 transition-all touch-manipulation"
                  >
                    <span className="text-[16px] font-medium text-[#1C1C1E]">
                      选择地区
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] text-[#8E8E93]">
                        {selectedCountry.name}
                      </span>
                      <Icon name="chevronRight" className="w-4 h-4 text-[#C7C7CC]" />
                    </div>
                  </button>
                  <div className="ml-4 h-[0.5px] bg-black/10" />
                  <button
                    onClick={() => { haptic(20); setShowDomainSheet(true); }}
                    className="w-full flex items-center justify-between py-3.5 px-4 active:bg-black/5 transition-all touch-manipulation"
                  >
                    <span className="text-[16px] font-medium text-[#1C1C1E]">
                      邮箱域名
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] text-[#8E8E93]">
                        {displayDomain}
                      </span>
                      <Icon name="chevronRight" className="w-4 h-4 text-[#C7C7CC]" />
                    </div>
                  </button>
                </div>
              </section>

              <footer className="pt-4 pb-8 text-center space-y-3">
                <a
                  href="https://t.me/fang180"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[14px] text-[#007AFF] font-semibold py-2 px-4 rounded-full bg-[#007AFF]/10 active:scale-95 transition-all touch-manipulation"
                >
                  <Icon name="link" className="w-4 h-4" />
                  <span>加入 Telegram 频道</span>
                </a>
                <p className="text-[12px] text-[#8E8E93] font-medium">
                  支持 {countries.length} 个国家 · {allDomains.length} 个域名
                </p>
              </footer>
            </>
          )}
        </main>
      </div>

      <BottomSheet
        isOpen={showCountrySheet}
        onClose={() => setShowCountrySheet(false)}
        title="选择地区"
      >
        <CountryList
          countries={countries}
          selectedCode={selectedCountry.code}
          onSelect={handleCountrySelect}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={showDomainSheet}
        onClose={() => setShowDomainSheet(false)}
        title="选择域名"
        rightAction={
          <button
            onClick={() => setShowDomainSheet(false)}
            className="text-[#007AFF] font-semibold text-[16px] p-2 -mr-2 touch-manipulation active:scale-95 transition-transform"
          >
            完成
          </button>
        }
      >
        <DomainList
          allDomains={allDomains}
          selectedDomain={selectedDomain}
          onSelect={handleDomainSelect}
        />
      </BottomSheet>

      <NavigationMenu
        isOpen={showNavigationMenu}
        onClose={() => setShowNavigationMenu(false)}
      />
    </div>
  );
}
