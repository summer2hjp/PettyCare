import { cn } from '@/utils/cn'
import type { ReactNode, HTMLAttributes } from 'react'

type MMTextStyle = 'hero' | 'section' | 'sectionAlt' | 'cardTitle' | 'subheading' | 'feature' | 'bodyLarge' | 'body' | 'bodyBold' | 'nav' | 'button' | 'caption' | 'small' | 'micro'
// Legacy aliases for backward compatibility — map old Apple style names to MiniMax equivalents
type LegacyAppleStyle = 'largeTitle' | 'title1' | 'title2' | 'title3' | 'headline' | 'callout' | 'subhead' | 'footnote' | 'caption1' | 'caption2'
type TextColor = 'primary' | 'secondary' | 'muted' | 'link'

interface DynamicTypeProps extends HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  children?: ReactNode
  styleLevel?: MMTextStyle | LegacyAppleStyle
  color?: TextColor
  weight?: 400 | 500 | 600 | 700
}

// Map legacy Apple style names to MiniMax equivalents
const legacyMap: Record<LegacyAppleStyle, MMTextStyle> = {
  largeTitle: 'cardTitle',
  title1: 'subheading',
  title2: 'bodyLarge',
  title3: 'section',
  headline: 'bodyBold',
  callout: 'body',
  subhead: 'body',
  footnote: 'button',
  caption1: 'caption',
  caption2: 'small',
}

const styleMap: Record<MMTextStyle, string> = {
  hero: 'text-mm-hero font-display',
  section: 'text-mm-section font-display',
  sectionAlt: 'text-mm-section-alt',
  cardTitle: 'text-mm-card-title font-display',
  subheading: 'text-mm-subheading font-poppins',
  feature: 'text-mm-feature font-poppins',
  bodyLarge: 'text-mm-body-large',
  body: 'text-mm-body',
  bodyBold: 'text-mm-body-bold',
  nav: 'text-mm-nav',
  button: 'text-mm-button font-semibold',
  caption: 'text-mm-caption',
  small: 'text-mm-small',
  micro: 'text-mm-micro',
}

const colorMap: Record<TextColor, string> = {
  primary: 'text-[var(--mm-label)]',
  secondary: 'text-[var(--mm-secondaryLabel)]',
  muted: 'text-[var(--mm-mutedLabel)]',
  link: 'text-[var(--mm-link)]',
}

const defaultTag: Record<MMTextStyle, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span'> = {
  hero: 'h1', section: 'h2', sectionAlt: 'h2', cardTitle: 'h3', subheading: 'h3',
  feature: 'h4', bodyLarge: 'p', body: 'p', bodyBold: 'p', nav: 'span',
  button: 'span', caption: 'p', small: 'span', micro: 'span',
}

function resolveStyle(styleLevel: MMTextStyle | LegacyAppleStyle | undefined): MMTextStyle {
  if (!styleLevel) return 'body'
  if (styleLevel in legacyMap) return legacyMap[styleLevel as LegacyAppleStyle]
  return styleLevel as MMTextStyle
}

export function DynamicType({
  as, children, styleLevel = 'body', color = 'primary', weight, className, ...props
}: DynamicTypeProps) {
  const resolved = resolveStyle(styleLevel)
  const Tag = as ?? defaultTag[resolved]
  return (
    <Tag className={cn(styleMap[resolved], colorMap[color], className)} style={weight ? { fontWeight: weight } : undefined} {...props}>
      {children}
    </Tag>
  )
}
