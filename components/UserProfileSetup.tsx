import React, { useState } from 'react';
// FIX: Add file extension to fix module resolution error.
import { UserProfile } from '../types.ts';

interface UserProfileSetupProps {
  // FIX: Added 'tutorVoice' to the Omit type to match the expected profile data shape in App.tsx.
  // The tutor voice is assigned in the parent component, so it's not part of the setup form data.
  onProfileSave: (profile: Omit<UserProfile, 'dailyStreak' | 'rewardPoints' | 'totalPracticeTime' | 'tutorVoice' | 'tutorAppearance' | 'languageMode' | 'theme'>) => void;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ onProfileSave }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<UserProfile['gender']>('female');
  const [level, setLevel] = useState<UserProfile['level']>('beginner');
  const [learningGoal, setLearningGoal] = useState('Speaking Fluency');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onProfileSave({ name: name.trim(), gender, level, learningGoal });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-[var(--bg-secondary)] rounded-2xl shadow-lg" style={{ boxShadow: `0 10px 25px -5px var(--shadow-color-lg), 0 10px 10px -5px var(--shadow-color)`}}>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-[var(--accent-primary)]">Welcome!</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Let's set up your profile for personalized practice.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)]">
              What should we call you?
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-[var(--text-primary)]">
              Your Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as UserProfile['gender'])}
              className="mt-1 block w-full pl-3 pr-10 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-[var(--text-primary)]">
              Your English Proficiency
            </label>
            <select
              id="level"
              name="level"
              value={level}
              onChange={(e) => setLevel(e.target.value as UserProfile['level'])}
              className="mt-1 block w-full pl-3 pr-10 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="learningGoal" className="block text-sm font-medium text-[var(--text-primary)]">
              Primary Learning Goal
            </label>
             <select
              id="learningGoal"
              name="learningGoal"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
            >
              <option>Speaking Fluency</option>
              <option>Pronunciation</option>
              <option>Interview Prep</option>
              <option>Vocabulary Building</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-inverted)] bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)] disabled:opacity-50"
            >
              Create My Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileSetup;