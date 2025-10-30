// FIX: Create content for components/SessionSummary.tsx to resolve module errors.
import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { UserProfile, SessionSummaryData } from '../types.ts';

interface SessionSummaryProps {
    summary: SessionSummaryData;
    userProfile: UserProfile;
    onReturnToDashboard: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ summary, userProfile, onReturnToDashboard }) => {

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 animate-fade-in">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-[var(--bg-secondary)] rounded-2xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-[var(--accent-primary)]">Session Complete!</h1>
                    <p className="mt-2 text-[var(--text-secondary)]">Great work, {userProfile.name}! Here's your summary.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Duration</h3>
                        <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{formatTime(summary.duration)}</p>
                    </div>
                     <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Points Earned</h3>
                        <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">+{Math.round(summary.duration / 60) * 10} pts</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Conversation Transcript</h3>
                    <div className="bg-[var(--bg-primary)] p-4 rounded-lg max-h-60 overflow-y-auto space-y-3 border border-[var(--border-primary)]">
                        {summary.finalTranscription.map((turn, index) => (
                            <div key={index} className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-sm ${turn.speaker === 'user' ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'}`}>
                                    <p className="text-sm">{turn.text}</p>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <button
                        onClick={onReturnToDashboard}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-inverted)] bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)]"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionSummary;