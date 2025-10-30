import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
// FIX: Add file extension to fix module resolution error.
import { UserProfile } from '../types.ts';
// FIX: Add file extension to fix module resolution error.
import { CloseIcon, PlayIcon, SpinnerIcon } from './icons.tsx';
// FIX: Add file extension to fix module resolution error.
import { decode, decodeAudioData } from '../services/audioUtils.ts';

interface TutorSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
}

const femaleVoices = [
    { name: 'Kore', id: 'Kore' },
    { name: 'Charon', id: 'Charon' },
    { name: 'Zephyr', id: 'Zephyr' },
];

const maleVoices = [
    { name: 'Puck', id: 'Puck' },
    { name: 'Fenrir', id: 'Fenrir' },
];

const TutorSettings: React.FC<TutorSettingsProps> = ({ isOpen, onClose, userProfile, onUpdateProfile }) => {
    const [selectedVoice, setSelectedVoice] = useState(userProfile.tutorVoice);
    const [appearance, setAppearance] = useState(userProfile.tutorAppearance);
    const [languageMode, setLanguageMode] = useState(userProfile.languageMode);
    const [theme, setTheme] = useState(userProfile.theme);
    const [testingVoice, setTestingVoice] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    
    if (!isOpen) return null;

    const handleTestVoice = async (voiceName: string) => {
        if (testingVoice) return;
        setTestingVoice(voiceName);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: "Hello, this is my voice." }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
                    },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                 if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
                    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
                }
                const audioCtx = audioContextRef.current;
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.start();
                source.onended = () => setTestingVoice(null);
            } else {
                setTestingVoice(null);
            }
        } catch (err) {
            console.error("Voice test failed:", err);
            setTestingVoice(null);
        }
    };

    const handleSave = () => {
        onUpdateProfile({ ...userProfile, tutorVoice: selectedVoice, tutorAppearance: appearance, languageMode: languageMode, theme: theme });
        onClose();
    };

    const VoiceList = ({ title, voices }: { title: string, voices: {name: string, id: string}[]}) => (
        <div>
            <h4 className="text-md font-semibold text-[var(--text-secondary)] mb-2">{title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {voices.map(voice => (
                    <label key={voice.id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedVoice === voice.id ? 'bg-[var(--accent-primary)]/20 border-[var(--border-accent)]' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 border-transparent'} border`}>
                        <span className="flex items-center">
                            <input
                                type="radio"
                                name="tutor-voice"
                                value={voice.id}
                                checked={selectedVoice === voice.id}
                                onChange={() => setSelectedVoice(voice.id)}
                                className="h-4 w-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-secondary)] focus:ring-[var(--accent-primary)]"
                            />
                            <span className="ml-3 text-sm font-medium text-[var(--text-primary)]">{voice.name}</span>
                        </span>
                        <button onClick={(e) => { e.preventDefault(); handleTestVoice(voice.id); }} disabled={!!testingVoice} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-accent)]">
                            {testingVoice === voice.id ? <SpinnerIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        </button>
                    </label>
                ))}
            </div>
        </div>
    );

    const RadioGroup = ({ title, name, options, selected, onChange }: { title: string, name: string, options: {value: string, label: string, disabled?: boolean}[], selected: string, onChange: (value: any) => void}) => (
        <div>
            <h4 className="text-md font-semibold text-[var(--text-secondary)] mb-2">{title}</h4>
            <div className="space-y-2">
                {options.map(option => (
                     <label key={option.value} className={`flex items-center p-3 rounded-lg transition-colors ${option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${selected === option.value ? 'bg-[var(--accent-primary)]/20 border-[var(--border-accent)]' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 border-transparent'} border`}>
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={selected === option.value}
                            onChange={() => onChange(option.value)}
                            disabled={option.disabled}
                            className="h-4 w-4 text-[var(--accent-primary)] bg-[var(--bg-tertiary)] border-[var(--border-secondary)] focus:ring-[var(--accent-primary)] disabled:cursor-not-allowed"
                        />
                        <span className="ml-3 text-sm font-medium text-[var(--text-primary)]">{option.label}</span>
                         {option.disabled && <span className="ml-auto text-xs text-[var(--text-tertiary)]">Coming Soon</span>}
                    </label>
                ))}
            </div>
        </div>
    );


    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-md m-4 p-6 space-y-6 relative overflow-y-auto max-h-full animate-fade-in">
                 <button onClick={onClose} className="absolute top-4 right-4 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-[var(--accent-primary)]">Tutor Profile Settings</h3>
                
                <div className="space-y-6">
                    <RadioGroup 
                        title="Theme"
                        name="theme"
                        selected={theme}
                        onChange={setTheme}
                        options={[
                            { value: 'light', label: 'Light Mode' },
                            { value: 'dark', label: 'Dark Mode' },
                        ]}
                    />
                    <div>
                        <h4 className="text-md font-semibold text-[var(--text-secondary)] mb-2">Tutor Voice</h4>
                        <div className="space-y-4">
                            <VoiceList title="Female Voices" voices={femaleVoices} />
                            <VoiceList title="Male Voices" voices={maleVoices} />
                        </div>
                    </div>
                    <RadioGroup 
                        title="Tutor Visuals"
                        name="tutor-appearance"
                        selected={appearance}
                        onChange={setAppearance}
                        options={[
                            { value: 'default', label: 'Default Realistic Robot' },
                            { value: 'custom', label: 'Upload My Custom Tutor Image', disabled: true },
                        ]}
                    />
                    <RadioGroup 
                        title="Language Mode"
                        name="language-mode"
                        selected={languageMode}
                        onChange={setLanguageMode}
                        options={[
                            { value: 'tanglish', label: 'Tamil-English Mixed (Tanglish)' },
                            { value: 'english-only', label: 'English Only' },
                        ]}
                    />
                </div>
                
                <div>
                    <button
                        onClick={handleSave}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-inverted)] bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)]"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorSettings;