import { ImageResponse } from 'next/og'
import { Book } from 'lucide-react'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#FFFFFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#111827',
        }}
      >
        <Book size={22} />
      </div>
    ),
    {
      ...size,
    }
  )
}
