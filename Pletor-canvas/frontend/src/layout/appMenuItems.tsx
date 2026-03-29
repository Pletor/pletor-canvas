import { type ReactNode } from 'react'

export interface MenuItem {
  id: string
  label: string
  icon: ReactNode
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'project',
    label: 'Nastavení projektu',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L14.5 4.75V11.25L8 15L1.5 11.25V4.75L8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    id: 'app',
    label: 'Nastavení aplikace',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    id: 'frontend',
    label: 'Nastavení frontendu',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M5.5 3L2 8L5.5 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.5 3L14 8L10.5 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="9" y1="2" x2="7" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'backend',
    label: 'Nastavení backendu',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="2" y="10" width="12" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="5" cy="4" r="0.8" fill="currentColor" />
        <circle cx="5" cy="12" r="0.8" fill="currentColor" />
        <line x1="2" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="10" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'global',
    label: 'Nastavení globální',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
        <ellipse cx="8" cy="8" rx="3" ry="6" stroke="currentColor" strokeWidth="1.3" />
        <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    id: 'database',
    label: 'Nastavení databáze',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <ellipse cx="8" cy="4" rx="5.5" ry="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.5 4V12C2.5 13.1 5 14 8 14C11 14 13.5 13.1 13.5 12V4" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.5 8C2.5 9.1 5 10 8 10C11 10 13.5 9.1 13.5 8" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
]
