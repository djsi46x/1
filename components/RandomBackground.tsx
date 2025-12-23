'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'random_bg_url';

/**
 * 随机背景图片组件 (无加载动画版)
 *
 * 功能特性:
 * - 使用 sessionStorage 存储图片URL,页面切换时保持不变
 * - 只有浏览器刷新(重新加载)时才生成新图片
 * - 图片加载时显示纯色渐变背景
 * - 图片加载完成后平滑淡入
 */
export default function RandomBackground() {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // 检查 sessionStorage 中是否已有图片URL
    const storedUrl = sessionStorage.getItem(STORAGE_KEY);

    if (storedUrl) {
      // 如果有缓存的URL,直接使用(页面切换场景)
      setImageUrl(storedUrl);
    } else {
      // 只在没有缓存时生成新的URL(浏览器真正刷新时)
      const timestamp = Date.now();
      const url = `https://loliapi.com/acg/?timestamp=${timestamp}`;
      setImageUrl(url);
      sessionStorage.setItem(STORAGE_KEY, url);
    }
  }, []);

  const handleImageLoad = () => {
    // 图片加载完成后触发淡入动画
    setBgLoaded(true);
  };

  const handleImageError = () => {
    console.warn('Background image failed to load, retrying...');
    sessionStorage.removeItem(STORAGE_KEY);
    const newUrl = `https://loliapi.com/acg/?timestamp=${Date.now()}`;
    setImageUrl(newUrl);
    setBgLoaded(false);
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 基础渐变背景 - 始终存在 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-black/10 to-black/15 backdrop-blur-md" />

      {/* 背景图片层 - 加载完成后显示 */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="background"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ${
            bgLoaded
              ? 'opacity-100 blur-0 scale-100'
              : 'opacity-0 blur-md scale-105'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          loading="eager"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}
