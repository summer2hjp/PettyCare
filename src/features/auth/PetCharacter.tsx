// src/features/auth/PetCharacter.tsx
import { motion, type Variants } from 'framer-motion'

type PetMood = 'idle' | 'happy' | 'curious' | 'shy' | 'confused' | 'excited' | 'sad'

interface PetCharacterProps {
  mood: PetMood
  isTyping?: boolean
  activeField?: 'email' | 'password' | null
  passwordVisible?: boolean
}

// ── Animation variants ──

const headVariants: Variants = {
  idle: { rotate: 0, y: 0 },
  curious: { rotate: 8, y: -4, transition: { type: 'spring', stiffness: 200, damping: 15 } },
  shy: { rotate: -6, y: 0 },
  confused: { rotate: -15, y: 0 },
  happy: { rotate: 0, y: -4 },
  excited: { rotate: 0, y: -8 },
  sad: { rotate: 0, y: 2 },
}

const earVariants: Variants = {
  idle: { rotate: 0, scaleY: 1, originY: 1 },
  curious: { rotate: 0, scaleY: 1.15, originY: 1 },
  shy: { rotate: 12, scaleY: 0.85, originY: 1 },
  confused: { rotate: -8, scaleY: 0.85, originY: 1 },
  sad: { y: 4, scaleY: 0.8, originY: 1 },
  happy: { rotate: 0, scaleY: 1.05, originY: 1 },
  excited: { rotate: 0, scaleY: 1.1, originY: 1 },
}

const tailVariants: Variants = {
  idle: {
    rotate: [0, -8, 0, 8, 0],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  curious: {
    rotate: [0, -4, 0, 4, 0],
    transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
  },
  happy: {
    rotate: [0, -15, 0, 15, 0],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
  excited: {
    rotate: [0, -20, 0, 20, 0],
    transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
  },
  shy: {
    rotate: [0, -3, 0, 3, 0],
    transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
  },
  confused: {
    rotate: 0,
    transition: { duration: 0 },
  },
  sad: {
    rotate: 0,
    transition: { duration: 0 },
  },
}

const eyeVariants: Variants = {
  idle: { scaleY: 1, scaleX: 1 },
  curious: { scaleX: 1.4, scaleY: 1.4 },
  shy: { scaleY: 0.15, scaleX: 1 },
  confused: { scaleX: 0.85, scaleY: 0.85 },
  happy: { scaleY: 0.3, scaleX: 1.1 },
  excited: { scaleY: 0.25, scaleX: 1.1 },
  sad: { scaleY: 0.85, scaleX: 0.95 },
}

const bodyBounceVariants: Variants = {
  idle: { y: 0 },
  happy: {
    y: [0, -6, 0],
    transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
  },
  excited: {
    y: [0, -12, 0, -8, 0],
    transition: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' },
  },
}

const entranceVariants: Variants = {
  hidden: { y: 40, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 12, stiffness: 180, mass: 0.8 },
  },
}

const pawVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 0.6,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

const sparkleVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: [0, 1.2, 0],
    opacity: [0, 1, 0],
    y: [-10, -30],
    transition: { duration: 0.8, delay: i * 0.15, ease: 'easeOut' },
  }),
}

export function PetCharacter({ mood, isTyping: _isTyping, activeField, passwordVisible }: PetCharacterProps) {
  const showSparkles = mood === 'excited' || mood === 'happy'
  const isShy = mood === 'shy' || (activeField === 'password' && !passwordVisible)

  return (
    <motion.svg
      viewBox="0 0 120 130"
      width="120"
      height="130"
      className="select-none"
      variants={entranceVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Tail ── */}
      <motion.g variants={tailVariants} animate={mood} style={{ originX: 88, originY: 95 }}>
        <path
          d="M88,92 Q108,82 104,64"
          stroke="#5856D6"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </motion.g>

      {/* ── Body ── */}
      <motion.g variants={bodyBounceVariants} animate={mood}>
        <ellipse cx="60" cy="94" rx="27" ry="20" fill="#5856D6" />

        {/* Belly accent */}
        <ellipse cx="60" cy="96" rx="18" ry="13" fill="#6B6BD6" opacity={0.4} />

        {/* Back legs */}
        <ellipse cx="42" cy="112" rx="7" ry="5" fill="#5856D6" />
        <ellipse cx="78" cy="112" rx="7" ry="5" fill="#5856D6" />
        <ellipse cx="42" cy="113" rx="4" ry="3" fill="#7A7AD6" opacity={0.3} />
        <ellipse cx="78" cy="113" rx="4" ry="3" fill="#7A7AD6" opacity={0.3} />

        {/* Front legs */}
        <ellipse cx="48" cy="113" rx="5" ry="4" fill="#5856D6" />
        <ellipse cx="72" cy="113" rx="5" ry="4" fill="#5856D6" />
      </motion.g>

      {/* ── Head group ── */}
      <motion.g variants={headVariants} animate={mood} style={{ originX: 60, originY: 50 }}>
        {/* Left ear */}
        <motion.g variants={earVariants} animate={mood} style={{ originX: 44, originY: 30 }}>
          <polygon points="44,34 36,8 52,26" fill="#5856D6" />
          <polygon points="44,32 38,14 49,26" fill="#FF9F0A" opacity={0.55} />
        </motion.g>

        {/* Right ear */}
        <motion.g variants={earVariants} animate={mood} style={{ originX: 76, originY: 30 }}>
          <polygon points="76,34 84,8 68,26" fill="#5856D6" />
          <polygon points="76,32 82,14 71,26" fill="#FF9F0A" opacity={0.55} />
        </motion.g>

        {/* Head */}
        <circle cx="60" cy="48" r="25" fill="#5856D6" />

        {/* Face accent */}
        <circle cx="60" cy="50" r="19" fill="#6B6BD6" opacity={0.2} />

        {/* Eyes */}
        <motion.g variants={eyeVariants} animate={mood} style={{ originX: 60, originY: 45 }}>
          <ellipse cx="50" cy="44" rx="4" ry="4.5" fill="#1C1C1E" />
          <ellipse cx="70" cy="44" rx="4" ry="4.5" fill="#1C1C1E" />
        </motion.g>

        {/* Eye highlights */}
        <circle cx="51" cy="42.5" r="1.8" fill="white" opacity={0.85} />
        <circle cx="71" cy="42.5" r="1.8" fill="white" opacity={0.85} />

        {/* Nose */}
        <ellipse cx="60" cy="52" rx="3" ry="2.2" fill="#FF9500" />

        {/* Mouth */}
        <path
          d="M57,55 Q60,59 63,55"
          stroke="#1C1C1E"
          strokeWidth="1.5"
          fill="none"
          opacity={0.35}
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <g opacity={0.25} stroke="#8E8E93" strokeWidth="1" strokeLinecap="round">
          <line x1="28" y1="48" x2="42" y2="50" />
          <line x1="28" y1="54" x2="42" y2="53" />
          <line x1="92" y1="48" x2="78" y2="50" />
          <line x1="92" y1="54" x2="78" y2="53" />
        </g>

        {/* Paws (遮眼) */}
        <motion.path
          d="M48,58 Q44,48 48,40"
          stroke="#5856D6"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          variants={pawVariants}
          initial="hidden"
          animate={isShy ? 'visible' : 'hidden'}
        />
      </motion.g>

      {/* ── Sparkles (happy/excited) ── */}
      {showSparkles && (
        <g>
          {[0, 1, 2].map((i) => (
            <motion.text
              key={i}
              x={[40, 70, 55][i]}
              y={[10, 8, 2][i]}
              fontSize="10"
              fill="#FF9F0A"
              custom={i}
              variants={sparkleVariants}
              initial="hidden"
              animate="visible"
            >
              ✦
            </motion.text>
          ))}
        </g>
      )}
    </motion.svg>
  )
}
