import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RoomService } from '../services/room'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('RoomService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('joinRoom', () => {
    it('should successfully join a room with valid parameters', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        roomName: 'test-room',
        participantName: 'test-participant',
        liveKitUrl: 'wss://test.livekit.cloud',
        candidate: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        job: {
          id: '1',
          title: 'Software Engineer',
          company: 'Test Company',
        },
        application: {
          id: '1',
          status: 'pending',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const request = {
        phone: '+1234567890',
        jobId: '1',
        roomName: 'test-room',
      }

      const result = await RoomService.joinRoom(request)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/room/join'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(request),
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should handle join room failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      })

      const request = {
        phone: '+1234567890',
        jobId: '1',
        roomName: 'test-room',
      }

      await expect(RoomService.joinRoom(request)).rejects.toThrow()
    })
  })

  describe('getRoomStatus', () => {
    it('should return room status', async () => {
      const mockStatus = {
        exists: true,
        status: 'active',
        participantCount: 2,
        liveKitStatus: 'connected',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      })

      const result = await RoomService.getRoomStatus('test-room')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/room/status'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomName: 'test-room' }),
        })
      )

      expect(result).toEqual(mockStatus)
    })
  })
})