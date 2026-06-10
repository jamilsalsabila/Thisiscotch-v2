'use client'

import { useState } from 'react'

export function NavBrandLogo() {
  const [imgFailed, setImgFailed] = useState(false)

  if (!imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/assets/images/cotch-logo.png"
        alt="Cotch"
        className="nav__logo-img"
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <svg viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Cotch">
      <text x="0" y="34" fontFamily="Georgia, serif" fontSize="38" fontStyle="italic" fontWeight="bold" fill="#C41230">Cotch</text>
      <path d="M4 40 Q60 48 116 40" stroke="#D4941A" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function WordmarkLogo({ className = 'ticket__logo' }: { className?: string }) {
  return <div className={className}>Cotch</div>
}
