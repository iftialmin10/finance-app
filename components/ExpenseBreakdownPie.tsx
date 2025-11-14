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

const DEFAULT_COLORS = ['#e53935', '#d32f2f', '#ef5350', '#f44336', '#ff7043', '#ff8a65']

export function ExpenseBreakdownPie({
  title = 'Expense Breakdown',
  items,
  height = 360,
}: ExpenseBreakdownPieProps) {
  const chartHeight = Math.max(height - 56, 240)

  const data = useMemo(
    () =>
      items.map((item, idx) => ({
        ...item,
        color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
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


