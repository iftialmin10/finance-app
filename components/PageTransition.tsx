'use client'

import { ReactNode } from 'react'
import { Fade } from '@mui/material'
import { usePrefersReducedMotion, getMotionDuration } from '@/utils/motion'

interface PageTransitionProps {
  children: ReactNode
  duration?: number
}

export function PageTransition({ children, duration = 350 }: PageTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  const timeout = getMotionDuration(prefersReducedMotion, duration)

  return (
    <Fade in timeout={timeout}>
      <div style={{ width: '100%', display: 'flex', flex: 1 }}>{children}</div>
    </Fade>
  )
}

