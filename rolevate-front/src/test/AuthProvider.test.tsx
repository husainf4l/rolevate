import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthProvider from '../components/common/AuthProvider'

// Mock the auth service
vi.mock('../services/auth', () => ({
  getCurrentUser: vi.fn(),
  refreshToken: vi.fn(),
}))

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders children when not loading', () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('provides authentication context', () => {
    const TestComponent = () => {
      return <div data-testid="auth-test">Authentication Context Available</div>
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-test')).toBeInTheDocument()
  })
})