import React from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  to?: string
  fallback?: string
}

export default function BackButton({ to, fallback = '/dashboard' }: BackButtonProps) {
  const navigate = useNavigate()

  const handleGoBack = () => {
    if (to) {
      navigate(to)
    } else if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <div
      className="back-button"
      onClick={handleGoBack}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleGoBack()
        }
      }}
    >
      <ArrowLeftOutlined />
      <span>返回</span>
    </div>
  )
}
