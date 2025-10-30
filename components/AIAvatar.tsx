import React from 'react';

interface AIAvatarProps {
  isSpeaking: boolean;
  isProcessing: boolean;
  isListening: boolean;
  gender: 'male' | 'female' | 'other';
}

const MaleAvatarIcon = () => (
    <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><title>Archy</title><mask id="mask__beam" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36"><rect width="36" height="36" rx="72" fill="#FFFFFF"></rect></mask><g mask="url(#mask__beam)"><rect width="36" height="36" fill="#7d4cff"></rect><rect x="0" y="0" width="36" height="36" transform="translate(4 4) rotate(340 18 18) scale(1.2)" fill="#ffad08" rx="36"></rect><g transform="translate(2 -2) rotate(0 18 18)"><path d="M15 19c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round"></path><rect x="11" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect><rect x="23" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect></g></g></svg>
)

const FemaleAvatarIcon = () => (
    <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><title>Grace</title><mask id="mask__beam" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36"><rect width="36" height="36" rx="72" fill="#FFFFFF"></rect></mask><g mask="url(#mask__beam)"><rect width="36" height="36" fill="#7d4cff"></rect><rect x="0" y="0" width="36" height="36" transform="translate(-4 -4) rotate(350 18 18) scale(1.2)" fill="#ffad08" rx="36"></rect><g transform="translate(-4 -3) rotate(0 18 18)"><path d="M15 21c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round"></path><rect x="13" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect><rect x="21" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect></g></g></svg>
)

const AIAvatar: React.FC<AIAvatarProps> = ({ isSpeaking, isProcessing, isListening, gender }) => {
    let ringColor = 'var(--border-secondary)';
    let ringAnimation = '';
    if (isSpeaking) {
        ringColor = 'var(--accent-primary)';
        ringAnimation = 'animate-pulse';
    } else if (isListening) {
        ringColor = 'green';
    } else if (isProcessing) {
        ringColor = 'orange';
    }

    return (
        // FIX: Replaced invalid `ringColor` style property with `borderColor` and `ring-4` class with `border-4`.
        <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${ringAnimation}`} style={{ borderColor: ringColor }}>
            <div className="w-[90%] h-[90%] rounded-full overflow-hidden bg-[var(--bg-tertiary)] p-2">
                {gender === 'male' ? <MaleAvatarIcon /> : <FemaleAvatarIcon />}
            </div>
            {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-overlay)] rounded-full">
                    <svg className="animate-spin h-12 w-12 text-[var(--accent-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
        </div>
    );
};

export default AIAvatar;