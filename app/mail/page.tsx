'use client';

import React, { useState, memo, useMemo, useEffect } from 'react';
import { NavigationMenu } from '@/app/NavigationMenu';
import RandomBackground from '@/components/RandomBackground';
import Image from 'next/image';

const ICON_PATHS: Record<string, React.ReactElement> = {
  search: <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>,
  open: <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>,
  close: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>,
  email: <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>,
  menu: <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>,
  info: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
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

interface TempEmail {
  name: string;
  url: string;
  description: string;
  features: string[];
  logo?: string;
}

const tempEmails: TempEmail[] = [
  {
    name: 'YOPmail',
    url: 'https://yopmail.com',
    description: '最受欢迎的临时邮箱服务,无需注册',
    features: ['无需注册', '即时收信', '保留8天', '支持多语言'],
    logo: '/mail/yopmail.png'
  },
  {
    name: '10 Minute Mail',
    url: 'https://10minutemail.com',
    description: '自动生成10分钟有效的临时邮箱',
    features: ['自动生成', '10分钟有效', '可延长时间', '界面简洁'],
    logo: '/mail/10minutemail.png'
  },
  {
    name: 'Temp Mail',
    url: 'https://temp-mail.org',
    description: '自动生成临时邮箱,实时接收邮件',
    features: ['自动生成', '实时接收', '支持API', '多语言界面']
  },
  {
    name: 'Guerrilla Mail',
    url: 'https://www.guerrillamail.com',
    description: '匿名临时邮箱,保护隐私',
    features: ['匿名接收', '加密传输', '1小时有效', '开源项目']
  },
  {
    name: 'Mohmal',
    url: 'https://www.mohmal.com',
    description: '阿拉伯语临时邮箱服务',
    features: ['45分钟有效', '自定义地址', '支持附件', '中东地区快']
  },
  {
    name: 'Maildrop',
    url: 'https://maildrop.cc',
    description: '简单快速的临时邮箱,24小时有效',
    features: ['24小时有效', '自定义地址', '无广告', '开源']
  },
  {
    name: 'ThrowAwayMail',
    url: 'https://www.throwawaymail.com',
    description: '随机生成临时邮箱地址',
    features: ['随机生成', '48小时有效', '无需注册', '简单易用']
  },
  {
    name: 'EmailOnDeck',
    url: 'https://www.emailondeck.com',
    description: '快速临时邮箱,支持多个地址',
    features: ['多个地址', '实时刷新', '1小时有效', '界面友好']
  },
  {
    name: 'FakeMail',
    url: 'https://www.fakemail.net',
    description: '免费临时邮箱生成器',
    features: ['自动生成', '无限邮箱', '实时接收', '支持附件']
  },
  {
    name: 'TempMail.Plus',
    url: 'https://tempmail.plus',
    description: '高级临时邮箱服务',
    features: ['多域名', '长期保存', 'API支持', '高级功能']
  },
  {
    name: 'Mailinator',
    url: 'https://www.mailinator.com',
    description: '公共临时邮箱系统',
    features: ['公共收件箱', '无需注册', '即时可用', '企业版可用']
  },
  {
    name: 'Dispostable',
    url: 'https://www.dispostable.com',
    description: '可抛弃的临时邮箱',
    features: ['自定义前缀', '多域名', '长期有效', 'Chrome插件']
  },
  {
    name: 'Temp-Mail.io',
    url: 'https://temp-mail.io',
    description: '现代化临时邮箱界面',
    features: ['现代UI', '自动刷新', 'PWA支持', '移动优化']
  },
  {
    name: 'MailDrop',
    url: 'https://maildrop.cc',
    description: 'MailDrop临时邮箱服务',
    features: ['无需注册', '自定义地址', 'REST API', '开源']
  },
  {
    name: 'MailCatch',
    url: 'https://mailcatch.com',
    description: '捕获临时邮件的服务',
    features: ['测试邮件', '开发调试', 'SMTP支持', '团队协作']
  }
];

const EmailCard = memo(({ email }: { email: TempEmail }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleClick = () => {
    haptic(30);
    setIsOpening(true);
    setTimeout(() => {
      window.open(email.url, '_blank');
      setTimeout(() => setIsOpening(false), 600);
    }, 200);
  };

  return (
    <div className="glass-card rounded-[14px] p-3.5 glass-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="shrink-0 w-11 h-11 rounded-[10px] bg-black/5 flex items-center justify-center overflow-hidden">
            {email.logo && !logoError ? (
              <Image
                src={email.logo}
                alt={`${email.name} logo`}
                width={44}
                height={44}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Icon name="email" className="w-5 h-5 text-[#8E8E93]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold text-[#1C1C1E] truncate mb-1">
              {email.name}
            </h3>
            <p className="text-[13px] text-[#8E8E93] leading-snug line-clamp-2">
              {email.description}
            </p>
          </div>
        </div>

        <button
          onClick={handleClick}
          disabled={isOpening}
          className={`shrink-0 px-3.5 py-2 rounded-[10px] flex items-center gap-1.5 font-semibold text-[13px] transition-all duration-300 active:scale-95 touch-manipulation ${
            isOpening
              ? 'bg-[#34C759]/20 text-[#34C759]'
              : 'bg-[#007AFF] text-white'
          }`}
        >
          <Icon name="open" className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{isOpening ? '打开中' : '访问'}</span>
        </button>
      </div>
    </div>
  );
});
EmailCard.displayName = 'EmailCard';

export default function TempEmailCollection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);
  const [ipInfo, setIpInfo] = useState({ ip: '...', country: 'US' });

  const filteredEmails = useMemo(() => {
    if (!searchQuery) return tempEmails;
    const query = searchQuery.toLowerCase();
    return tempEmails.filter(email =>
      email.name.toLowerCase().includes(query) ||
      email.description.toLowerCase().includes(query) ||
      email.features.some(f => f.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const initializeApp = async () => {
      try {
        const response = await fetch('/api/ip-info');
        const data = await response.json();
        if (!isMounted) return;
        setIpInfo({ ip: data.ip || '未知', country: data.country || 'US' });
      } catch (error) {
        if (isMounted) {
          setIpInfo({ ip: '检测失败', country: 'US' });
        }
      }
    };
    initializeApp();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen relative">
      <RandomBackground />
      <div className="max-w-2xl mx-auto relative z-10">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-white/30">
          <div className="flex items-center justify-between h-14 px-4">
            <h1 className="text-[17px] font-semibold text-[#1C1C1E]">
              临时邮箱大全
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="w-4 h-4 text-[#8E8E93]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索临时邮箱..."
              className="w-full pl-9 pr-9 py-2.5 bg-white border border-black/5 rounded-[12px] text-[16px] text-[#1C1C1E] placeholder-[#8E8E93] focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]/20 transition-colors caret-[#007AFF] outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => { haptic(20); setSearchQuery(''); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation active:scale-90 transition-transform"
              >
                <div className="bg-black/10 rounded-full p-0.5">
                  <Icon name="close" className="w-3 h-3 text-[#8E8E93]" />
                </div>
              </button>
            )}
          </div>

          <div className="glass-card rounded-[16px] p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[10px] bg-[#007AFF]/10 shrink-0">
                <Icon name="info" className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-semibold text-[#1C1C1E] mb-1">
                  使用提示
                </h3>
                <p className="text-[13px] text-[#8E8E93] leading-relaxed">
                  临时邮箱用于注册网站或接收验证码,请勿用于重要账户。邮件可能被他人查看,注意隐私安全。
                </p>
              </div>
            </div>
          </div>

          {filteredEmails.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold text-[#8E8E93] uppercase px-4 mb-3">
                邮箱服务
              </h2>
              <div className="space-y-2">
                {filteredEmails.map((email, idx) => (
                  <EmailCard key={idx} email={email} />
                ))}
              </div>
            </section>
          )}

          {filteredEmails.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/5 mb-4">
                <Icon name="search" className="w-8 h-8 text-[#8E8E93]" />
              </div>
              <p className="text-[#8E8E93] text-[15px]">未找到匹配的邮箱服务</p>
            </div>
          )}

          <footer className="pt-4 pb-8 text-center space-y-2">
            <p className="text-[12px] text-[#8E8E93]">
              数据持续更新中 · 如有新的临时邮箱推荐,欢迎联系我们
            </p>
            <p className="text-[12px] text-[#8E8E93] font-semibold">
              共收录 {tempEmails.length} 个临时邮箱服务
            </p>
          </footer>
        </main>
      </div>

      <NavigationMenu
        isOpen={showNavigationMenu}
        onClose={() => setShowNavigationMenu(false)}
      />
    </div>
  );
}
