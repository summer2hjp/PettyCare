import { cn } from '@/utils/cn'
import type { ReactNode, HTMLAttributes } from 'react'

type AppleTextStyle = 'largeTitle' | 'title1' | 'title2' | 'title3' | 'headline' | 'body' | 'callout' | 'subhead' | 'footnote' | 'caption1' | 'caption2'
type TextColor = 'label' | 'secondaryLabel' | 'tertiaryLabel' | 'quaternaryLabel' | 'link'

interface DynamicTypeProps extends HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  children?: ReactNode; styleLevel?: AppleTextStyle; color?: TextColor; weight?: 400 | 500 | 600 | 700
}

const styleMap: Record<AppleTextStyle, string> = {
  largeTitle: 'text-apple-large-title', title1: 'text-apple-title-1', title2: 'text-apple-title-2', title3: 'text-apple-title-3',
  headline: 'text-apple-headline', body: 'text-apple-body', callout: 'text-apple-callout', subhead: 'text-apple-subhead',
  footnote: 'text-apple-footnote', caption1: 'text-apple-caption-1', caption2: 'text-apple-caption-2',
}
const colorMap: Record<TextColor, string> = {
  label: 'text-apple-label', secondaryLabel: 'text-apple-secondaryLabel', tertiaryLabel: 'text-apple-tertiaryLabel',
  quaternaryLabel: 'text-apple-quaternaryLabel', link: 'text-apple-link',
}
const defaultTag: Record<AppleTextStyle, 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'> = {
  largeTitle: 'h1', title1: 'h2', title2: 'h3', title3: 'h4', headline: 'p', body: 'p', callout: 'p', subhead: 'p', footnote: 'p', caption1: 'span', caption2: 'span',
}

export function DynamicType({ as, children, styleLevel = 'body', color = 'label', weight, className, ...props }: DynamicTypeProps) {
  const Tag = as ?? defaultTag[styleLevel]
  return (
    <Tag className={cn(styleMap[styleLevel], colorMap[color], className)} style={weight ? { fontWeight: weight } : undefined} {...props}>
      {children}
    </Tag>
  )
}
