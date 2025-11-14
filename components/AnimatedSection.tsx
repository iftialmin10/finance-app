'use client'

import { ReactNode } from 'react'
import { Grow, Box } from '@mui/material'
import { usePrefersReducedMotion, getMotionDuration } from '@/utils/motion'

interface AnimatedSectionProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function AnimatedSection({
  children,
  delay = 0,
  duration = 225,
  className,
}: AnimatedSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const timeout = getMotionDuration(prefersReducedMotion, duration)

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <Grow in timeout={timeout} style={{ transitionDelay: `${delay}ms` }}>
      <Box className={className}>{children}</Box>
    </Grow>
  )
}

