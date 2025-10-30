// FIX: Create content for App.tsx to resolve module errors.
import React, { useState, useEffect } from 'react';
// FIX: Add file extension to fix module resolution error.
import UserProfileSetup from './components/UserProfileSetup.tsx';
// FIX: Add file extension to fix module resolution error.
import ProfileDashboard from './components/ProfileDashboard.tsx';
// FIX: Add file extension to fix module resolution error.
import PracticeSession from './components/PracticeSession.tsx';
// FIX: Add file extension to fix module resolution error.
import { UserProfile, SessionSummaryData } from './types.ts';
// FIX: Add file extension to fix module resolution error.
import SessionSummary from './components/SessionSummary.tsx';


type AppView = 'setup' | 'dashboard' | 'practice' | 'summary';

const App: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [view, setView] = useState<AppView>('setup');
    const [sessionSummary, setSessionSummary] = useState<SessionSummaryData | null>(null);

    useEffect(() => {
        try {
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
                setUserProfile(JSON.parse(storedProfile));
                setView('dashboard');
            }
        } catch (error) {
            console.error("Failed to parse user profile from localStorage", error);
            localStorage.removeItem('userProfile');
        }
    }, []);

    useEffect(() => {
        if (userProfile?.theme) {
            document.documentElement.dataset.theme = userProfile.theme;
        }
    }, [userProfile?.theme]);

    const saveProfile = (profile: UserProfile) => {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setUserProfile(profile);
    };

    const handleProfileSave = (profileData: Omit<UserProfile, 'dailyStreak' | 'rewardPoints' | 'totalPracticeTime' | 'tutorVoice' | 'tutorAppearance' | 'languageMode' | 'theme'>) => {
        const newProfile: UserProfile = {
            ...profileData,
            dailyStreak: 0,
            rewardPoints: 0,
            totalPracticeTime: 0,
            tutorVoice: profileData.gender === 'male' ? 'Puck' : 'Kore',
            tutorAppearance: 'default',
            languageMode: 'tanglish',
            theme: 'dark', // Default theme
        };
        saveProfile(newProfile);
        setView('dashboard');
    };

    const handleUpdateProfile = (updatedProfile: UserProfile) => {
        saveProfile(updatedProfile);
    };
    
    const handleStartPractice = () => {
        setView('practice');
    };

    const handleSessionEnd = (summary: SessionSummaryData) => {
        if(userProfile) {
            const updatedProfile = {
                ...userProfile,
                totalPracticeTime: userProfile.totalPracticeTime + summary.duration,
                // 10 points per minute, rounded
                rewardPoints: userProfile.rewardPoints + Math.round(summary.duration / 60) * 10,
            };
            saveProfile(updatedProfile);
        }
        setSessionSummary(summary);
        setView('summary');
    };

    const handleReturnToDashboard = () => {
        setSessionSummary(null);
        setView('dashboard');
    }

    const renderView = () => {
        switch (view) {
            case 'setup':
                return <UserProfileSetup onProfileSave={handleProfileSave} />;
            case 'dashboard':
                return userProfile && <ProfileDashboard userProfile={userProfile} onStartPractice={handleStartPractice} onUpdateProfile={handleUpdateProfile} />;
            case 'practice':
                return userProfile && <PracticeSession userProfile={userProfile} onSessionEnd={handleSessionEnd} />;
            case 'summary':
                return sessionSummary && userProfile && <SessionSummary summary={sessionSummary} userProfile={userProfile} onReturnToDashboard={handleReturnToDashboard} />;
            default:
                return <UserProfileSetup onProfileSave={handleProfileSave} />;
        }
    };

    return (
        <main className="font-sans min-h-screen">
            {renderView()}
        </main>
    );
};

export default App;