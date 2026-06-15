// src/features/auth/PetBackground.tsx
import { useState, useEffect } from 'react'

const PET_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1920&q=80',
    name: 'Alaskan Malamute',
    credit: 'Photo by Mylene Magnier',
  },
  {
    url: 'https://images.unsplash.com/photo-1612441806115-0dab974a70d1?w=1920&q=80',
    name: 'Dachshund',
    credit: 'Photo by Eduardo Gutiérrez',
  },
  {
    url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1920&q=80',
    name: 'Russian Blue',
    credit: 'Photo by Olena Bohovyk',
  },
]

const ROTATION_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function PetBackground({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    // Preload first image
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.src = PET_IMAGES[0].url

    // Start rotation timer
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % PET_IMAGES.length
      // Preload next image before switching
      const nextImg = new Image()
      nextImg.onload = () => setCurrentIndex(nextIndex)
      nextImg.src = PET_IMAGES[nextIndex].url
    }, ROTATION_INTERVAL)

    return () => clearInterval(timer)
  }, [currentIndex])

  const current = PET_IMAGES[currentIndex]

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Current background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${current.url})`, opacity: loaded ? 1 : 0 }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      {/* Pet name label - bottom left */}
      <div className="absolute bottom-6 left-6 z-10">
        <p className="text-white/60 text-apple-caption-1 tracking-wide">{current.name}</p>
        <p className="text-white/40 text-apple-caption-2">{current.credit}</p>
      </div>

      {/* Dot indicators - bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {PET_IMAGES.map((_, i) => (
          <span
            key={i}
            className={`block rounded-full transition-all duration-500 ${
              i === currentIndex ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
