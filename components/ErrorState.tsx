'use client'

import { ReactNode } from 'react'
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material'
import { ReportProblem as ReportProblemIcon } from '@mui/icons-material'

interface ErrorStateProps {
  title?: string
  message: string
  details?: ReactNode
  action?: ReactNode
  onRetry?: () => void
  retryLabel?: string
  icon?: ReactNode
  compact?: boolean
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  details,
  action,
  onRetry,
  retryLabel = 'Try again',
  icon,
  compact = false,
}: ErrorStateProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'error.light',
        bgcolor: 'error.light',
        color: 'error.contrastText',
        p: compact ? 2 : 3,
        mb: compact ? 2 : 3,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="flex-start" spacing={2}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: '50%',
            bgcolor: 'error.main',
            color: 'error.contrastText',
          }}
        >
          {icon || <ReportProblemIcon />}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {message}
          </Typography>
          {details && (
            <Alert
              severity="warning"
              variant="outlined"
              sx={{ mt: 2, bgcolor: 'error.light', borderColor: 'error.contrastText', color: 'inherit' }}
            >
              {details}
            </Alert>
          )}
          {(onRetry || action) && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
              {onRetry && (
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={onRetry}
                  sx={{ color: 'error.main', fontWeight: 600 }}
                >
                  {retryLabel}
                </Button>
              )}
              {action}
            </Stack>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

