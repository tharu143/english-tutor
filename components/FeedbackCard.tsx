import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { CloseIcon, BookOpenIcon } from './icons.tsx';

export interface Feedback {
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    overallFeedback: string;
}

interface FeedbackCardProps {
    feedback: Feedback | null;
    onClose: () => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onClose }) => {
    if (!feedback) return null;

    const ScoreBar = ({ score, label }: { score: number; label: string }) => (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
                <span className="text-sm font-bold text-[var(--text-accent)]">{score}/10</span>
            </div>
            <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5">
                <div className="bg-gradient-to-r from-purple-500 to-[var(--accent-primary)] h-2.5 rounded-full" style={{ width: `${score * 10}%` }}></div>
            </div>
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-lg m-4 p-6 space-y-4 relative overflow-y-auto max-h-full">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3 mb-2">
                    <BookOpenIcon className="w-8 h-8 text-[var(--text-accent)]"/>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-[var(--accent-primary)]">Session Feedback</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScoreBar label="Fluency" score={feedback.fluency} />
                    <ScoreBar label="Pronunciation" score={feedback.pronunciation} />
                    <ScoreBar label="Grammar" score={feedback.grammar} />
                    <ScoreBar label="Vocabulary" score={feedback.vocabulary} />
                </div>
                
                <div>
                    <h4 className="text-md font-semibold text-[var(--text-secondary)] mb-2">Tutor's Comments</h4>
                    <p className="text-[var(--text-primary)] bg-[var(--bg-tertiary)] p-3 rounded-md text-sm">{feedback.overallFeedback}</p>
                </div>
                
                <div>
                    <button
                        onClick={onClose}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-inverted)] bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)]"
                    >
                        Got it, Thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackCard;