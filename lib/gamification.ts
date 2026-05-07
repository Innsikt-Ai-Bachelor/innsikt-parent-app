import { FeedbackResult, SessionSummary } from "./api";
import { getJson } from "./storage";

export type Badge = {
  id: string;
  emoji: string;
  title: string;
  description: string;
};

export type Quest = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  current: number;
  target: number;
  xpReward: number;
  completed: boolean;
};

export type MasterySkill = {
  key: string;
  label: string;
  score: number; // 0–100
  sessionCount: number;
};

export type GamificationState = {
  xp: number;
  level: number;
  xpToNextLevel: number;
  levelProgress: number; // 0–1
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  earnedBadgeIds: string[];
  masterySkills: MasterySkill[];
  activeQuests: Quest[];
};

export const XP_PER_LEVEL = 150;

export const ALL_BADGES: Badge[] = [
  {
    id: "first_steps",
    emoji: "🌱",
    title: "First Steps",
    description: "Complete your first session",
  },
  {
    id: "getting_started",
    emoji: "🚀",
    title: "Getting Started",
    description: "Complete 3 sessions",
  },
  {
    id: "dedicated",
    emoji: "💪",
    title: "Dedicated",
    description: "Complete 10 sessions",
  },
  {
    id: "streak_3",
    emoji: "🔥",
    title: "On a Roll",
    description: "Keep a 3-day streak",
  },
  {
    id: "streak_7",
    emoji: "⚡",
    title: "Unstoppable",
    description: "Keep a 7-day streak",
  },
  {
    id: "high_achiever",
    emoji: "🏆",
    title: "High Achiever",
    description: "Score 80+ in a session",
  },
  {
    id: "perfectionist",
    emoji: "⭐",
    title: "Excellent",
    description: "Score 90+ in a session",
  },
  {
    id: "explorer",
    emoji: "🗺️",
    title: "Explorer",
    description: "Practice 3 different scenarios",
  },
  {
    id: "consistent",
    emoji: "📅",
    title: "Consistent",
    description: "Practice on 5 different days",
  },
];

function computeStreaks(sessions: SessionSummary[]): {
  current: number;
  longest: number;
} {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  const toKey = (s: SessionSummary) => {
    const d = new Date(s.savedAt);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };

  const days = [...new Set(sessions.map(toKey))]
    .map((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m, d);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const day of days) {
    if (!prev) {
      run = 1;
    } else {
      const diff = Math.round((day.getTime() - prev.getTime()) / 86_400_000);
      run = diff === 1 ? run + 1 : 1;
    }
    if (run > longest) longest = run;
    prev = day;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let current = 0;
  const last = new Date(days[days.length - 1]);
  last.setHours(0, 0, 0, 0);
  if (
    last.getTime() === today.getTime() ||
    last.getTime() === yesterday.getTime()
  ) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      const a = new Date(days[i + 1]);
      a.setHours(0, 0, 0, 0);
      const b = new Date(days[i]);
      b.setHours(0, 0, 0, 0);
      if (Math.round((a.getTime() - b.getTime()) / 86_400_000) === 1) current++;
      else break;
    }
  }

  return { current, longest };
}

export async function loadFeedbackMap(
  sessions: SessionSummary[],
): Promise<Record<string, FeedbackResult>> {
  const entries = await Promise.all(
    sessions.map(async (s) => {
      const fb = await getJson<FeedbackResult>(`feedback:${s.sessionId}`);
      return fb ? ([s.sessionId, fb] as [string, FeedbackResult]) : null;
    }),
  );
  return Object.fromEntries(
    entries.filter((e): e is [string, FeedbackResult] => e !== null),
  );
}

export function computeGamification(
  sessions: SessionSummary[],
  feedbackMap: Record<string, FeedbackResult>,
): GamificationState {
  // Only sessions that have completed feedback count toward progress
  const completed = sessions.filter(
    (s) => s.totalScore !== undefined && s.totalScore !== null,
  );

  const { current: currentStreak, longest: longestStreak } =
    computeStreaks(completed);
  const total = completed.length;

  const xp = completed.reduce((sum, s) => sum + (s.totalScore ?? 10), 0);
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpIntoLevel = xp % XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - xpIntoLevel;
  const levelProgress = xpIntoLevel / XP_PER_LEVEL;

  const maxScore = completed.reduce(
    (m, s) => Math.max(m, s.totalScore ?? 0),
    0,
  );
  const uniqueScenarios = new Set(
    completed.map((s) => s.scenarioId).filter(Boolean),
  ).size;
  const uniqueDays = new Set(
    completed.map((s) => {
      const d = new Date(s.savedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  ).size;

  const earnedBadgeIds: string[] = [];
  if (total >= 1) earnedBadgeIds.push("first_steps");
  if (total >= 3) earnedBadgeIds.push("getting_started");
  if (total >= 10) earnedBadgeIds.push("dedicated");
  if (currentStreak >= 3 || longestStreak >= 3) earnedBadgeIds.push("streak_3");
  if (currentStreak >= 7 || longestStreak >= 7) earnedBadgeIds.push("streak_7");
  if (maxScore >= 80) earnedBadgeIds.push("high_achiever");
  if (maxScore >= 90) earnedBadgeIds.push("perfectionist");
  if (uniqueScenarios >= 3) earnedBadgeIds.push("explorer");
  if (uniqueDays >= 5) earnedBadgeIds.push("consistent");

  // Aggregate criteria scores from all cached feedback
  const skillTotals: Record<string, { sum: number; count: number }> = {};
  for (const fb of Object.values(feedbackMap)) {
    for (const c of fb.criteria) {
      if (!c.max_score) continue;
      const key = c.name.toLowerCase().trim();
      if (!skillTotals[key]) skillTotals[key] = { sum: 0, count: 0 };
      skillTotals[key].sum += Math.round((c.score / c.max_score) * 100);
      skillTotals[key].count += 1;
    }
  }
  const masterySkills: MasterySkill[] = Object.entries(skillTotals)
    .map(([key, { sum, count }]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      score: Math.round(sum / count),
      sessionCount: count,
    }))
    .sort((a, b) => b.score - a.score);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);
  const weekSessions = completed.filter((s) => new Date(s.savedAt) >= weekAgo);
  const weekCount = weekSessions.length;
  const weekHighScore = weekSessions.reduce(
    (m, s) => Math.max(m, s.totalScore ?? 0),
    0,
  );

  const activeQuests: Quest[] = [
    {
      id: "weekly_3",
      emoji: "📅",
      title: "Øvelse gjør mester",
      description: "Fullfør 3 økter denne uken",
      current: Math.min(3, weekCount),
      target: 3,
      xpReward: 50,
      completed: weekCount >= 3,
    },
    {
      id: "score_70",
      emoji: "🎯",
      title: "Sikta høyt",
      description: "Få 70+ poeng i en hvilken som helst økt denne uken",
      current: weekHighScore >= 70 ? 1 : 0,
      target: 1,
      xpReward: 30,
      completed: weekHighScore >= 70,
    },
    {
      id: "total_5",
      emoji: "💎",
      title: "Bygge vaner",
      description: "Fullfør 5 økter totalt",
      current: Math.min(5, total),
      target: 5,
      xpReward: 75,
      completed: total >= 5,
    },
  ];

  return {
    xp,
    level,
    xpToNextLevel,
    levelProgress,
    currentStreak,
    longestStreak,
    totalSessions: total,
    earnedBadgeIds,
    masterySkills,
    activeQuests,
  };
}

export function sessionXpGain(totalScore?: number): number {
  return totalScore ?? 10;
}

export function motivationalMessage(score: number): string {
  if (score >= 90) return "Outstanding! You're truly mastering this. 🌟";
  if (score >= 75)
    return "Great work! You're building real parenting skills. 💪";
  if (score >= 60)
    return "Good effort! Every session makes you a stronger parent. 🌱";
  return "Keep going — growth happens step by step. You've got this! 🤗";
}
