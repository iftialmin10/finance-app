import type { SxProps, Theme } from '@mui/material/styles'

export const STANDARD_DIALOG_MAX_WIDTH = 480

export const standardDialogPaperSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: STANDARD_DIALOG_MAX_WIDTH,
  m: 2,
}


