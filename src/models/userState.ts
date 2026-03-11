export interface HangmanStats {
  played: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
}

export interface UserState {
  id: 'singleton';
  lastTestId?: string;
  bestScores?: Record<string, number>;
  hangmanStats?: HangmanStats;
}
