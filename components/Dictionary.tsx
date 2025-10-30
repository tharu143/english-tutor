import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
// FIX: Add file extension to fix module resolution error.
import { UserProfile } from '../types.ts';
// FIX: Add file extension to fix module resolution error.
import { SpinnerIcon, SearchIcon, SpeakerWaveIcon } from './icons.tsx';
// FIX: Add file extension to fix module resolution error.
import { decode, decodeAudioData } from '../services/audioUtils.ts';

interface DictionaryProps {
    userProfile: UserProfile;
}

interface DefinitionResult {
    englishMeaning: string;
    tamilEnglishMeaning: string;
    exampleSentence: string;
}

const Dictionary: React.FC<DictionaryProps> = ({ userProfile }) => {
    const [word, setWord] = useState('');
    const [result, setResult] = useState<DefinitionResult | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPronouncing, setIsPronouncing] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!word.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError('');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Provide a simple definition for the English word "${word}". Structure the response as a JSON object with three keys: "englishMeaning" (a simple English explanation), "tamilEnglishMeaning" (a simple explanation in Tanglish, which is Tamil written in English letters), and "exampleSentence" (an example sentence using the word).`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            englishMeaning: { type: Type.STRING },
                            tamilEnglishMeaning: { type: Type.STRING },
                            exampleSentence: { type: Type.STRING },
                        }
                    },
                },
            });
            const jsonString = response.text.trim();
            const parsedResult = JSON.parse(jsonString);
            setResult(parsedResult);
        } catch (err) {
            console.error("Dictionary lookup failed:", err);
            setError("Sorry, I couldn't find a definition for that word.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePronounce = async () => {
        if (!word.trim() || isPronouncing) return;

        setIsPronouncing(true);

        try {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
             const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: word }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: userProfile.tutorVoice },
                        },
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
                source.onended = () => setIsPronouncing(false);
            } else {
                setIsPronouncing(false);
            }
        } catch (err) {
            console.error("Pronunciation failed:", err);
            setIsPronouncing(false);
        }
    };


    return (
        <div className="flex flex-col h-full">
            <h3 className="font-bold text-lg text-[var(--text-accent)] mb-3">Dictionary</h3>
            <form onSubmit={handleLookup} className="relative flex items-center mb-3">
                <input 
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Look up a word..."
                    className="w-full pl-4 pr-10 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                />
                <button type="submit" className="absolute right-3" disabled={isLoading}>
                   {isLoading ? <SpinnerIcon className="w-5 h-5 text-[var(--text-accent)]"/> : <SearchIcon className="w-5 h-5 text-[var(--text-secondary)]" />}
                </button>
            </form>
            
            <div className="flex-grow overflow-y-auto pr-2">
                {result && (
                    <div className="bg-[var(--bg-tertiary)] p-4 rounded-md space-y-3 animate-fade-in">
                        <div className="flex justify-between items-start">
                            <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-[var(--accent-primary)] capitalize">{word}</h4>
                            <button onClick={handlePronounce} disabled={isPronouncing} className="p-1 rounded-full hover:bg-[var(--bg-secondary)] transition-colors">
                                {isPronouncing ? <SpinnerIcon className="w-5 h-5 text-[var(--text-accent)]" /> : <SpeakerWaveIcon className="w-5 h-5 text-[var(--text-primary)]" />}
                            </button>
                        </div>

                        <div>
                            <strong className="text-sm text-[var(--text-secondary)] block">Meaning:</strong>
                            <p className="text-[var(--text-primary)]">{result.englishMeaning}</p>
                        </div>
                         <div>
                            <strong className="text-sm text-[var(--text-secondary)] block">Tanglish:</strong>
                            <p className="text-[var(--text-primary)]">{result.tamilEnglishMeaning}</p>
                        </div>
                         <div>
                            <strong className="text-sm text-[var(--text-secondary)] block">Example:</strong>
                            <p className="text-[var(--text-primary)] italic">"{result.exampleSentence}"</p>
                        </div>
                    </div>
                )}
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                {!result && !isLoading && !error && (
                    <div className="flex items-center justify-center h-full text-center text-[var(--text-tertiary)]">
                        <p>Look up a word to see its definition here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dictionary;