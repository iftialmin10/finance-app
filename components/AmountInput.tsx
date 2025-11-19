'use client'

import { TextField, InputAdornment } from '@mui/material'
import { useState, useEffect, useRef } from 'react'

interface AmountInputProps {
  label: string
  value: number // Amount in minor units (e.g., 10000 = $100.00)
  onChange: (value: number) => void
  currency?: string
  error?: boolean
  helperText?: string
  disabled?: boolean
  required?: boolean
  fullWidth?: boolean
}

/**
 * AmountInput component
 * Handles amount input with proper formatting
 * Value is stored in minor units (integer), but displayed as decimal
 */
export function AmountInput({
  label,
  value,
  onChange,
  currency = 'USD',
  error,
  helperText,
  disabled,
  required,
  fullWidth = true,
}: AmountInputProps) {
  // Convert minor units to decimal for display
  const minorToDecimal = (minor: number): string => {
    if (minor === 0) return ''
    return (minor / 100).toFixed(2)
  }

  // Convert decimal string to minor units
  const decimalToMinor = (decimal: string): number => {
    const cleaned = decimal.replace(/[^0-9.]/g, '')
    if (!cleaned || cleaned === '.') return 0
    const num = parseFloat(cleaned)
    if (isNaN(num)) return 0
    return Math.round(num * 100)
  }

  const [displayValue, setDisplayValue] = useState<string>(minorToDecimal(value))
  const isUserTypingRef = useRef(false)
  const lastPropValueRef = useRef(value)

  // Only update display value when prop value changes externally (e.g., form reset)
  // Don't update while user is typing
  useEffect(() => {
    if (!isUserTypingRef.current && value !== lastPropValueRef.current) {
      setDisplayValue(minorToDecimal(value))
      lastPropValueRef.current = value
    }
  }, [value])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    setDisplayValue(inputValue)
    
    // Mark that user is typing
    isUserTypingRef.current = true
    
    // Convert to minor units and call onChange
    const minor = decimalToMinor(inputValue)
    lastPropValueRef.current = minor
    onChange(minor)
    
    // Reset typing flag after a brief moment
    setTimeout(() => {
      isUserTypingRef.current = false
    }, 100)
  }

  const handleBlur = () => {
    // Format on blur only - this is when user finishes typing
    const minor = decimalToMinor(displayValue)
    const formatted = minorToDecimal(minor)
    setDisplayValue(formatted)
    lastPropValueRef.current = minor
    isUserTypingRef.current = false
    
    // Update parent if value changed during formatting
    if (minor !== value) {
      onChange(minor)
    }
  }

  return (
    <TextField
      label={label}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      helperText={helperText}
      disabled={disabled}
      required={required}
      fullWidth={fullWidth}
      type="text"
      inputMode="decimal"
      InputProps={{
        startAdornment: currency && (
          <InputAdornment position="start">{currency}</InputAdornment>
        ),
      }}
    />
  )
}

