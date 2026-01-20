import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  initializeUserStats,
  updateUserStats,
  unlockAchievement,
  getUserAchievements,
  getUserStatsData,
} from './gamificationService';
import * as dbModule from '../db';
import { ACHIEVEMENT_TYPES } from '../../drizzle/schema';

// Mock database
vi.mock('../db', () => ({
  getDb: vi.fn(),
}));

describe('Gamification Service', () => {
  const mockUserId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeUserStats', () => {
    it('should initialize user stats if they do not exist', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue(undefined);

      const mockDb = {
        select: mockSelect,
        insert: mockInsert,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      mockInsert.mockReturnValue({
        values: mockValues,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await initializeUserStats(mockUserId);

      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith({
        userId: mockUserId,
        totalConversations: 0,
        totalDaysActive: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
      });
    });

    it('should not initialize if stats already exist', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([{ id: 1, userId: mockUserId }]);
      const mockInsert = vi.fn();

      const mockDb = {
        select: mockSelect,
        insert: mockInsert,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await initializeUserStats(mockUserId);

      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should handle database unavailable gracefully', async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      await expect(initializeUserStats(mockUserId)).resolves.toBeUndefined();
    });
  });

  describe('updateUserStats', () => {
    it('should update stats and increase streak for consecutive days', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const mockStats = {
        id: 1,
        userId: mockUserId,
        totalConversations: 5,
        totalDaysActive: 3,
        currentStreak: 3,
        longestStreak: 3,
        lastActiveDate: yesterday,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockStats]);
      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();

      const mockDb = {
        select: mockSelect,
        update: mockUpdate,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      mockUpdate.mockReturnValue({
        set: mockSet,
      });

      mockSet.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await updateUserStats(mockUserId);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          totalConversations: 6,
          totalDaysActive: 4,
          currentStreak: 4,
          longestStreak: 4,
        })
      );
    });

    it('should reset streak if days are not consecutive', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);

      const mockStats = {
        id: 1,
        userId: mockUserId,
        totalConversations: 5,
        totalDaysActive: 3,
        currentStreak: 3,
        longestStreak: 5,
        lastActiveDate: threeDaysAgo,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockStats]);
      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();

      const mockDb = {
        select: mockSelect,
        update: mockUpdate,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      mockUpdate.mockReturnValue({
        set: mockSet,
      });

      mockSet.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await updateUserStats(mockUserId);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          totalConversations: 6,
          totalDaysActive: 4,
          currentStreak: 1, // Reset
          longestStreak: 5, // Keep longest
        })
      );
    });

    it('should not change streak on same day', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockStats = {
        id: 1,
        userId: mockUserId,
        totalConversations: 5,
        totalDaysActive: 3,
        currentStreak: 3,
        longestStreak: 3,
        lastActiveDate: today,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockStats]);
      const mockUpdate = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();

      const mockDb = {
        select: mockSelect,
        update: mockUpdate,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      mockUpdate.mockReturnValue({
        set: mockSet,
      });

      mockSet.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await updateUserStats(mockUserId);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          totalConversations: 6,
          totalDaysActive: 3, // Same
          currentStreak: 3, // Same
          longestStreak: 3,
        })
      );
    });
  });

  describe('unlockAchievement', () => {
    it('should unlock achievement if not already unlocked', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue(undefined);

      const mockDb = {
        select: mockSelect,
        insert: mockInsert,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      mockInsert.mockReturnValue({
        values: mockValues,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await unlockAchievement(mockUserId, ACHIEVEMENT_TYPES.FIRST_CONVERSATION);

      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith({
        userId: mockUserId,
        achievementType: ACHIEVEMENT_TYPES.FIRST_CONVERSATION,
        metadata: null,
      });
    });

    it('should not unlock if already unlocked', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        { id: 1, userId: mockUserId, achievementType: ACHIEVEMENT_TYPES.FIRST_CONVERSATION },
      ]);
      const mockInsert = vi.fn();

      const mockDb = {
        select: mockSelect,
        insert: mockInsert,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await unlockAchievement(mockUserId, ACHIEVEMENT_TYPES.FIRST_CONVERSATION);

      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe('getUserAchievements', () => {
    it('should return all user achievements with metadata', async () => {
      const mockAchievements = [
        {
          id: 1,
          userId: mockUserId,
          achievementType: ACHIEVEMENT_TYPES.FIRST_CONVERSATION,
          unlockedAt: new Date(),
          metadata: null,
        },
        {
          id: 2,
          userId: mockUserId,
          achievementType: ACHIEVEMENT_TYPES.STREAK_3_DAYS,
          unlockedAt: new Date(),
          metadata: null,
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue(mockAchievements);

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

      const achievements = await getUserAchievements(mockUserId);

      expect(achievements).toHaveLength(2);
      expect(achievements[0]).toHaveProperty('title');
      expect(achievements[0]).toHaveProperty('description');
      expect(achievements[0]).toHaveProperty('icon');
      expect(achievements[0]).toHaveProperty('message');
    });

    it('should return empty array when database unavailable', async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const achievements = await getUserAchievements(mockUserId);

      expect(achievements).toEqual([]);
    });
  });

  describe('getUserStatsData', () => {
    it('should return user stats', async () => {
      const mockStats = {
        id: 1,
        userId: mockUserId,
        totalConversations: 10,
        totalDaysActive: 5,
        currentStreak: 3,
        longestStreak: 5,
        lastActiveDate: new Date(),
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockStats]);

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
        limit: mockLimit,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const stats = await getUserStatsData(mockUserId);

      expect(stats).toEqual(mockStats);
    });

    it('should return default stats if user has no stats', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockResolvedValue(undefined);

      const mockDb = {
        select: mockSelect,
        insert: mockInsert,
      };

      mockSelect.mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      mockInsert.mockReturnValue({
        values: mockValues,
      });

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const stats = await getUserStatsData(mockUserId);

      expect(stats).toEqual({
        totalConversations: 0,
        totalDaysActive: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
      });
    });

    it('should return null when database unavailable', async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(null);

      const stats = await getUserStatsData(mockUserId);

      expect(stats).toBeNull();
    });
  });
});
