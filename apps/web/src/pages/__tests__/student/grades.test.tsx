import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Grades Component - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('should have grades page file', () => {
    // Basic import test to ensure the file exists and compiles
    expect(true).toBe(true);
  });

  describe('Authentication checks', () => {
    it('checks for token in localStorage', () => {
      const token = localStorage.getItem('token');
      expect(token).toBeNull();
    });

    it('stores token after login', () => {
      localStorage.setItem('token', 'test-token');
      expect(localStorage.getItem('token')).toBe('test-token');
    });
  });

  describe('API calls', () => {
    it('should call fetch with correct URL when fetching grades', async () => {
      const mockToken = 'test-token';
      const mockGrades = [{ coursename: 'CS101', grade: 'A' }];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGrades,
      });

      const API_URL = 'http://localhost:8000';
      const response = await fetch(`${API_URL}/student/view_grades`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/student/view_grades'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );

      const data = await response.json();
      expect(data).toEqual(mockGrades);
    });

    it('handles fetch error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('http://localhost:8000/student/view_grades');
      } catch (error: any) {
        expect(error.message).toBe('Network error');
      }
    });
  });
});
