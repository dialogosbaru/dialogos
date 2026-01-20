import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { logEmotionalState, getEmotionalLogs, getEmotionalStats } from './db_emotional_analytics';
import * as dbModule from './db';

// Mock database
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

describe('Emotional Analytics Database Functions', () => {
  const mockUserId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logEmotionalState', () => {
    it('should log emotional state successfully', async () => {
      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue(undefined);

      const mockDb = {
        insert: mockInsert,
      };

      mockInsert.mockReturnValue({
        values: mockValues,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const log = {
        userId: mockUserId,
        primaryEmotion: 'sad',
        secondaryEmotions: JSON.stringify(['anxious']),
        intensity: 0.8,
        valence: -0.5,
        conversationalMode: 'CONTENCIÓN',
        crisisDetected: 0,
      };

      await logEmotionalState(log);

      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith(log);
    });

    it('should handle database unavailable gracefully', async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const log = {
        userId: mockUserId,
        primaryEmotion: 'happy',
        secondaryEmotions: JSON.stringify([]),
        intensity: 0.6,
        valence: 0.7,
        conversationalMode: 'ACOMPAÑAMIENTO',
        crisisDetected: 0,
      };

      // Should not throw error
      await expect(logEmotionalState(log)).resolves.toBeUndefined();
    });

    it('should throw error on database failure', async () => {
      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockRejectedValue(new Error('Database error'));

      const mockDb = {
        insert: mockInsert,
      };

      mockInsert.mockReturnValue({
        values: mockValues,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const log = {
        userId: mockUserId,
        primaryEmotion: 'crisis',
        secondaryEmotions: JSON.stringify(['anxious', 'sad']),
        intensity: 0.9,
        valence: -0.8,
        conversationalMode: 'CONTENCIÓN',
        crisisDetected: 1,
      };

      await expect(logEmotionalState(log)).rejects.toThrow('Database error');
    });
  });

  describe('getEmotionalLogs', () => {
    it('should return emotional logs for date range', async () => {
      const mockLogs = [
        {
          id: 1,
          userId: mockUserId,
          primaryEmotion: 'sad',
          intensity: 0.8,
          valence: -0.5,
          conversationalMode: 'CONTENCIÓN',
          crisisDetected: 0,
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
        {
          id: 2,
          userId: mockUserId,
          primaryEmotion: 'happy',
          intensity: 0.6,
          valence: 0.7,
          conversationalMode: 'ACOMPAÑAMIENTO',
          crisisDetected: 0,
          createdAt: new Date('2025-01-16T10:00:00Z'),
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockLogs);

      const mockDb = {
        select: mockSelect,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-17');

      const logs = await getEmotionalLogs(mockUserId, startDate, endDate);

      expect(logs).toEqual(mockLogs);
      expect(logs).toHaveLength(2);
    });

    it('should return empty array when database unavailable', async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-17');

      const logs = await getEmotionalLogs(mockUserId, startDate, endDate);

      expect(logs).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockRejectedValue(new Error('Database error'));

      const mockDb = {
        select: mockSelect,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-17');

      const logs = await getEmotionalLogs(mockUserId, startDate, endDate);

      expect(logs).toEqual([]);
    });
  });

  describe('getEmotionalStats', () => {
    it('should calculate statistics correctly', async () => {
      const mockLogs = [
        {
          id: 1,
          userId: mockUserId,
          primaryEmotion: 'sad',
          intensity: 0.8,
          valence: -0.5,
          conversationalMode: 'CONTENCIÓN',
          crisisDetected: 0,
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
        {
          id: 2,
          userId: mockUserId,
          primaryEmotion: 'happy',
          intensity: 0.4,
          valence: 0.5,
          conversationalMode: 'ACOMPAÑAMIENTO',
          crisisDetected: 0,
          createdAt: new Date('2025-01-16T10:00:00Z'),
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockLogs);

      const mockDb = {
        select: mockSelect,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-17');

      const stats = await getEmotionalStats(mockUserId, startDate, endDate);

      expect(stats).not.toBeNull();
      expect(stats?.totalMessages).toBe(2);
      expect(stats?.avgIntensity).toBeCloseTo(0.6, 10); // (0.8 + 0.4) / 2
      expect(stats?.avgValence).toBe(0); // (-0.5 + 0.5) / 2
      expect(stats?.emotionDistribution).toEqual({ sad: 1, happy: 1 });
      expect(stats?.modeDistribution).toEqual({ CONTENCIÓN: 1, ACOMPAÑAMIENTO: 1 });
      expect(stats?.crisisCount).toBe(0);
    });

    it('should count crisis correctly', async () => {
      const mockLogs = [
        {
          id: 1,
          userId: mockUserId,
          primaryEmotion: 'crisis',
          intensity: 0.9,
          valence: -0.8,
          conversationalMode: 'CONTENCIÓN',
          crisisDetected: 1,
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
        {
          id: 2,
          userId: mockUserId,
          primaryEmotion: 'crisis',
          intensity: 0.85,
          valence: -0.7,
          conversationalMode: 'CONTENCIÓN',
          crisisDetected: 1,
          createdAt: new Date('2025-01-16T10:00:00Z'),
        },
        {
          id: 3,
          userId: mockUserId,
          primaryEmotion: 'sad',
          intensity: 0.6,
          valence: -0.4,
          conversationalMode: 'ACOMPAÑAMIENTO',
          crisisDetected: 0,
          createdAt: new Date('2025-01-17T10:00:00Z'),
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockLogs);

      const mockDb = {
        select: mockSelect,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-18');

      const stats = await getEmotionalStats(mockUserId, startDate, endDate);

      expect(stats?.crisisCount).toBe(2);
    });

    it('should return empty stats when no logs exist', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue([]);

      const mockDb = {
        select: mockSelect,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-17');

      const stats = await getEmotionalStats(mockUserId, startDate, endDate);

      expect(stats).toEqual({
        totalMessages: 0,
        avgIntensity: 0,
        avgValence: 0,
        emotionDistribution: {},
        modeDistribution: {},
        crisisCount: 0,
      });
    });

    it('should return null when database unavailable', async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-17');

      const stats = await getEmotionalStats(mockUserId, startDate, endDate);

      expect(stats).toBeNull();
    });

    it('should handle multiple emotions of same type', async () => {
      const mockLogs = [
        {
          id: 1,
          userId: mockUserId,
          primaryEmotion: 'sad',
          intensity: 0.8,
          valence: -0.5,
          conversationalMode: 'CONTENCIÓN',
          crisisDetected: 0,
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
        {
          id: 2,
          userId: mockUserId,
          primaryEmotion: 'sad',
          intensity: 0.6,
          valence: -0.4,
          conversationalMode: 'CONTENCIÓN',
          crisisDetected: 0,
          createdAt: new Date('2025-01-16T10:00:00Z'),
        },
        {
          id: 3,
          userId: mockUserId,
          primaryEmotion: 'sad',
          intensity: 0.7,
          valence: -0.3,
          conversationalMode: 'ACOMPAÑAMIENTO',
          crisisDetected: 0,
          createdAt: new Date('2025-01-17T10:00:00Z'),
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockLogs);

      const mockDb = {
        select: mockSelect,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-18');

      const stats = await getEmotionalStats(mockUserId, startDate, endDate);

      expect(stats?.emotionDistribution.sad).toBe(3);
      expect(stats?.modeDistribution.CONTENCIÓN).toBe(2);
      expect(stats?.modeDistribution.ACOMPAÑAMIENTO).toBe(1);
    });
  });
});
