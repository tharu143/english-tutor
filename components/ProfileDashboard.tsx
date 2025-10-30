import React, { useState } from 'react';
// FIX: Add file extension to fix module resolution error.
import { UserProfile } from '../types.ts';
// FIX: Add file extension to fix module resolution error.
import { UserIcon, SettingsIcon } from './icons.tsx';
// FIX: Add file extension to fix module resolution error.
import TutorSettings from './TutorSettings.tsx';
// FIX: Add file extension to fix module resolution error.
import Dictionary from './Dictionary.tsx';

interface ProfileDashboardProps {
    userProfile: UserProfile;
    onStartPractice: () => void;
    onUpdateProfile: (profile: UserProfile) => void;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ userProfile, onStartPractice, onUpdateProfile }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [
            h > 0 ? `${h}h` : '',
            m > 0 ? `${m}m` : '',
            s > 0 && h === 0 ? `${s}s` : ''
        ].filter(Boolean).join(' ') || '0s';
    };

    return (
        <div className="flex flex-col h-screen w-full p-4 md:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-6 md:mb-8">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-purple-600 flex items-center justify-center">
                        <UserIcon className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                        Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-[var(--accent-primary)]">{userProfile.name}!</span>
                    </h1>
                </div>
                 <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors">
                    <SettingsIcon className="w-6 h-6 text-[var(--text-secondary)]"/>
                 </button>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <StatCard title="Proficiency" value={userProfile.level} />
                <StatCard title="Daily Streak" value={`${userProfile.dailyStreak} days`} />
                <StatCard title="Reward Points" value={`${userProfile.rewardPoints} pts`} />
                <StatCard title="Total Practice" value={formatTime(userProfile.totalPracticeTime)} />
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 flex flex-col justify-between items-center text-center">
                    <div className="w-full">
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-accent)] mb-2">Today's Goal</h2>
                        <p className="text-[var(--text-secondary)] max-w-md mx-auto text-base md:text-lg">
                            Focus on your goal of <strong className="font-semibold text-[var(--text-primary)]">{userProfile.learningGoal}</strong>. 
                            Let's practice speaking and build your confidence together.
                        </p>
                    </div>
                    <button
                        onClick={onStartPractice}
                        className="mt-8 w-full max-w-xs py-3 px-6 rounded-lg text-lg font-semibold text-[var(--text-inverted)] bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] shadow-lg transform hover:scale-105 transition-transform"
                    >
                        Start Practice Session
                    </button>
                </div>
                <div className="lg:col-span-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 md:p-6">
                    <Dictionary userProfile={userProfile} />
                </div>
            </div>

            {isSettingsOpen && <TutorSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                userProfile={userProfile}
                onUpdateProfile={onUpdateProfile}
            />}
        </div>
    );
};

const StatCard: React.FC<{title: string, value: string}> = ({ title, value }) => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-4 rounded-xl text-center">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">{title}</h3>
        <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)] capitalize mt-1">{value}</p>
    </div>
);


export default ProfileDashboard;