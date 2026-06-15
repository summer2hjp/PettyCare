// src/features/auth/PetBackground.tsx
import { useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

const BG_VIDEO = '/video/lachang-1.mp4'

export function PetBackground({ children }: { children: ReactNode }) {
  const [videoLoaded, setVideoLoaded] = useState(false)

  return (
    <div className="h-screen flex bg-[#0D0D0F]">
      {/* ── 视频层（全屏绝对定位，供左侧玻璃模糊） ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        className={cn(
          'fixed inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0',
          videoLoaded ? 'opacity-100' : 'opacity-0',
        )}
      >
        <source src={BG_VIDEO} type="video/mp4" />
      </video>

      {/* ── Left: 玻璃磨砂面板 ── */}
      <div className="relative z-10 w-[35%] min-w-[400px] h-full flex items-center justify-center px-12
        bg-white/[0.08] backdrop-blur-[40px]
        border-r border-white/[0.06] shadow-[2px_0_20px_rgba(0,0,0,0.3)]">
        <div className="w-full">{children}</div>
      </div>

      {/* ── Right: 带画框的视频展示区 ── */}
      <div className="relative z-10 flex-1 h-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.65)' }}>
        <div className="w-[85%] h-[80%] rounded-2xl overflow-hidden ring-1 ring-white/[0.08] shadow-2xl shadow-black/50" />
      </div>
    </div>
  )
}
