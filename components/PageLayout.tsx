'use client'

import { Box, Container } from '@mui/material'
import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { GlobalProgressBar } from './GlobalProgressBar'
import { PageTransition } from './PageTransition'

interface PageLayoutProps {
  children: React.ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
}

export function PageLayout({ children, maxWidth = 'lg' }: PageLayoutProps) {
  const pathname = usePathname()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <GlobalProgressBar />
      <Header />
      <PageTransition key={pathname}>
        <Container maxWidth={maxWidth} sx={{ flex: 1, py: 4 }}>
          {children}
        </Container>
      </PageTransition>
    </Box>
  )
}

