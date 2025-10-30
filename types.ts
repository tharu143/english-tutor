// FIX: Create content for types.ts to resolve module errors.
export interface UserProfile {
  name: string;
  gender: 'female' | 'male' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  learningGoal: string;
  dailyStreak: number;
  rewardPoints: number;
  totalPracticeTime: number; // in seconds
  tutorVoice: string;
  tutorAppearance: 'default' | 'custom';
  languageMode: 'tanglish' | 'english-only';
  theme: 'light' | 'dark';
}

export interface Feedback {
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    overallFeedback: string;
}

export interface SessionSummaryData {
    duration: number; // in seconds
    finalTranscription: { speaker: 'user' | 'tutor'; text: string }[];
}