import { NextResponse } from 'next/server'

export function success<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    init
  )
}

export function successMessage(message: string, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    init
  )
}

export function errorResponse(
  message: string,
  status: number = 400,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...extra,
      },
    },
    { status }
  )
}

