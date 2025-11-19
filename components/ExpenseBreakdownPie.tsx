'use client'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
} from 'recharts'
import { Box, Paper, Typography } from '@mui/material'
import { useMemo } from 'react'

export interface ExpensePieItem {
  name: string
  value: number // display units (e.g., 123.45), not minor
  color?: string
}

interface ExpenseBreakdownPieProps {
  title?: string
  items: ExpensePieItem[]
  height?: number
}

/**
 * Generates a random color using HSL color space
 * Colors are absolutely random each time
 */
function generateRandomColor(): string {
  // Generate random HSL values
  // Hue: 0-360 (full color spectrum)
  const hue = Math.random() * 360
  
  // Saturation: 60-85% (vibrant colors)
  const saturation = 60 + Math.random() * 25
  
  // Lightness: 50-70% (good visibility, avoid too dark/light)
  const lightness = 50 + Math.random() * 20

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export function ExpenseBreakdownPie({
  title = 'Expense Breakdown',
  items,
  height = 360,
}: ExpenseBreakdownPieProps) {
  const chartHeight = Math.max(height - 56, 240)

  const data = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        color: item.color || generateRandomColor(),
      })),
    [items]
  )

  return (
    <Paper
      elevation={2}
      sx={{ p: 2, height, minWidth: 0, display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1, flexShrink: 0 }}>
        {title}
      </Typography>
      <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%', minHeight: chartHeight }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label
              isAnimationActive
              animationDuration={400}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color!} />
              ))}
            </Pie>
            <ReTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}


