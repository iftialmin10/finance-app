'use client'

import { forwardRef, ReactElement, ForwardedRef } from 'react'
import Slide from '@mui/material/Slide'
import type { SlideProps } from '@mui/material/Slide'

export const DialogTransition = forwardRef(function DialogTransition(
  props: SlideProps & { children: ReactElement },
  ref: ForwardedRef<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

