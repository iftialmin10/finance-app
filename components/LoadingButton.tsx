'use client'

import { Button, ButtonProps, CircularProgress, Box } from '@mui/material'

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
}

export function LoadingButton({
  loading = false,
  disabled,
  startIcon,
  children,
  sx,
  ...rest
}: LoadingButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Button
      {...rest}
      disabled={isDisabled}
      startIcon={loading ? undefined : startIcon}
      sx={{
        position: 'relative',
        pointerEvents: loading ? 'none' : undefined,
        ...sx,
      }}
    >
      {loading && (
        <CircularProgress
          size={20}
          color="inherit"
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginTop: '-10px',
            marginLeft: '-10px',
          }}
        />
      )}
      <Box component="span" sx={{ opacity: loading ? 0 : 1, display: 'inherit' }}>
        {children}
      </Box>
    </Button>
  )
}

