// FIX: Create content for components/PracticeSession.tsx to resolve module errors.
import React, { useState, useEffect, useRef } from 'react';
// FIX: Remove 'LiveSession' as it is not an exported member of '@google/genai'.
import { GoogleGenAI, Session, LiveServerMessage, Modality, Type } from '@google/genai';
// FIX: Add file extension to fix module resolution error.
import AIAvatar from './AIAvatar.tsx';
// FIX: Add file extension to fix module resolution error.
import { MicIcon, StopIcon, SpinnerIcon } from './icons.tsx';
// FIX: Add file extension to fix module resolution error.
import { UserProfile, Feedback, SessionSummaryData } from '../types.ts';
// FIX: Add file extension to fix module resolution error.
import { createBlob, decode, decodeAudioData } from '../services/audioUtils.ts';
// FIX: Add file extension to fix module resolution error.
import FeedbackCard from './FeedbackCard.tsx';

interface PracticeSessionProps {
    userProfile: UserProfile;
    onSessionEnd: (summary: SessionSummaryData) => void;
}

type SessionState = 'idle' | 'listening' | 'processing' | 'speaking' | 'ending';

const PracticeSession: React.FC<PracticeSessionProps> = ({ userProfile, onSessionEnd }) => {
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [transcription, setTranscription] = useState<{ speaker: 'user' | 'tutor'; text: string }[]>([]);
    const [currentSpokenText, setCurrentSpokenText] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const sessionRef = useRef<Promise<Session> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioPlaybackQueue = useRef<AudioBuffer[]>([]);
    const nextStartTime = useRef(0);
    const isPlaying = useRef(false);
    const sessionStartTime = useRef<Date | null>(null);

    const startSession = async () => {
        if (sessionState !== 'idle') return;

        setSessionState('listening');
        sessionStartTime.current = new Date();

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const InputAudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            inputAudioContextRef.current = new InputAudioContext({ sampleRate: 16000 });
            
            const OutputAudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            outputAudioContextRef.current = new OutputAudioContext({ sampleRate: 24000 });

            sessionRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: userProfile.tutorVoice } }
                    },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: `You are an AI English tutor. Your name is ${userProfile.gender === 'male' ? 'Ryan' : 'Sophia'}. You are talking to ${userProfile.name}, whose proficiency is ${userProfile.level}. Their goal is ${userProfile.learningGoal}. Keep your responses concise and friendly. Start the conversation by greeting them and asking how their day is going. If they speak in ${userProfile.languageMode === 'tanglish' ? 'Tanglish (Tamil-English mix)' : 'English'}, respond in the same style to make them comfortable, but gently guide them towards using more English.`
                },
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;

                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (event) => {
                           sessionRef.current?.then(session => {
                                const inputData = event.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        handleServerMessage(message);
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        endSession(true); 
                    },
                    onclose: () => {
                        console.log('Session closed.');
                    }
                }
            });
        } catch (error) {
            console.error('Failed to start session:', error);
            setSessionState('idle');
        }
    };

    const playAudioFromQueue = async () => {
        if (isPlaying.current || audioPlaybackQueue.current.length === 0) return;
        
        isPlaying.current = true;
        setSessionState('speaking');

        const audioCtx = outputAudioContextRef.current!;
        const playNextChunk = () => {
            if (audioPlaybackQueue.current.length > 0) {
                const buffer = audioPlaybackQueue.current.shift()!;
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(audioCtx.destination);

                const startTime = Math.max(audioCtx.currentTime, nextStartTime.current);
                source.start(startTime);
                nextStartTime.current = startTime + buffer.duration;
                source.onended = playNextChunk;
            } else {
                isPlaying.current = false;
                setSessionState('listening');
            }
        };
        playNextChunk();
    };

    const handleServerMessage = async (message: LiveServerMessage) => {
        if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            setSessionState('processing');
            const audioData = message.serverContent.modelTurn.parts[0].inlineData.data;
            const decodedBytes = decode(audioData);
            const audioBuffer = await decodeAudioData(decodedBytes, outputAudioContextRef.current!, 24000, 1);
            audioPlaybackQueue.current.push(audioBuffer);
            playAudioFromQueue();
        }
        
        if (message.serverContent?.inputTranscription?.text) {
             setTranscription(prev => {
                const last = prev[prev.length - 1];
                if (last?.speaker === 'user') {
                    last.text += message.serverContent!.inputTranscription!.text;
                    return [...prev.slice(0, -1), last];
                }
                return [...prev, { speaker: 'user', text: message.serverContent!.inputTranscription!.text }];
             });
        }

        if (message.serverContent?.outputTranscription?.text) {
            setCurrentSpokenText(prev => prev + message.serverContent!.outputTranscription!.text);
        }

        if (message.serverContent?.turnComplete && currentSpokenText.trim()) {
            setTranscription(prev => [...prev, { speaker: 'tutor', text: currentSpokenText.trim() }]);
            setCurrentSpokenText('');
        }
    };
    
    const stopRecordingAndCleanup = () => {
        mediaStreamSourceRef.current?.disconnect();
        scriptProcessorRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        inputAudioContextRef.current?.close().catch(e => console.error("Error closing input audio context:", e));
        outputAudioContextRef.current?.close().catch(e => console.error("Error closing output audio context:", e));
        mediaStreamRef.current = null;
    };

    const endSession = async (isError: boolean = false) => {
        setSessionState('ending');
        stopRecordingAndCleanup();
        
        await sessionRef.current?.then(session => session.close());
        sessionRef.current = null;

        if (isError || transcription.length < 2) {
             const duration = sessionStartTime.current ? Math.round((new Date().getTime() - sessionStartTime.current.getTime()) / 1000) : 0;
             onSessionEnd({ duration, finalTranscription: transcription });
             return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const conversation = transcription.map(t => `${t.speaker}: ${t.text}`).join('\n');
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Analyze the following English conversation with a student named ${userProfile.name}. Provide feedback on their performance. The student's speech is labeled "user".
                
                Conversation:
                ${conversation}

                Provide a JSON response with keys: "fluency", "pronunciation", "grammar", "vocabulary" (all scores out of 10), and "overallFeedback" (a short, encouraging paragraph in plain text).`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            fluency: { type: Type.NUMBER },
                            pronunciation: { type: Type.NUMBER },
                            grammar: { type: Type.NUMBER },
                            vocabulary: { type: Type.NUMBER },
                            overallFeedback: { type: Type.STRING },
                        },
                        required: ["fluency", "pronunciation", "grammar", "vocabulary", "overallFeedback"]
                    }
                }
            });
            const feedbackResult = JSON.parse(response.text.trim());
            setFeedback(feedbackResult);
            setShowFeedback(true);
        } catch (error) {
            console.error('Failed to get feedback:', error);
            // End session without feedback if feedback generation fails
            const duration = sessionStartTime.current ? Math.round((new Date().getTime() - sessionStartTime.current.getTime()) / 1000) : 0;
            onSessionEnd({ duration, finalTranscription: transcription });
        }
    };

    const handleFeedbackClosed = () => {
        setShowFeedback(false);
        const duration = sessionStartTime.current ? Math.round((new Date().getTime() - sessionStartTime.current.getTime()) / 1000) : 0;
        onSessionEnd({ duration, finalTranscription: transcription });
    };
    
    useEffect(() => {
        return () => {
           if (sessionRef.current) {
               stopRecordingAndCleanup();
               sessionRef.current.then(s => s.close());
           }
        };
    }, []);

    const getStatusText = () => {
        switch (sessionState) {
            case 'idle': return 'Tap the mic to start your session';
            case 'listening': return 'Listening...';
            case 'processing': return 'Thinking...';
            case 'speaking': return "Tutor is speaking...";
            case 'ending': return 'Wrapping up...';
            default: return '';
        }
    }

    return (
        <div className="flex flex-col items-center justify-between h-screen w-full p-4 md:p-6 lg:p-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Practice Session</h1>
                <p className="text-[var(--text-secondary)] mt-1">{getStatusText()}</p>
            </div>

            <div className="my-6">
                <AIAvatar
                    isSpeaking={sessionState === 'speaking'}
                    isProcessing={sessionState === 'processing' || sessionState === 'ending'}
                    isListening={sessionState === 'listening'}
                    gender={userProfile.gender}
                />
            </div>
            
             <div className="w-full max-w-2xl h-32 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 overflow-y-auto flex flex-col-reverse">
                <div className="space-y-1">
                    {currentSpokenText && <p className="text-sm text-[var(--text-secondary)] opacity-70"><strong>Tutor:</strong> {currentSpokenText}</p>}
                    {transcription.slice().reverse().map((t, i) => (
                        <p key={i} className={`text-sm ${t.speaker === 'user' ? 'text-[var(--text-accent)]' : 'text-[var(--text-primary)]'}`}>
                            <strong className="capitalize">{t.speaker === 'user' ? userProfile.name : 'Tutor'}:</strong> {t.text}
                        </p>
                    ))}
                </div>
            </div>


            <div className="mt-8 flex items-center justify-center space-x-6 h-20">
                {sessionState === 'idle' && (
                    <button onClick={startSession} className="w-20 h-20 flex items-center justify-center rounded-full bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-lg transform hover:scale-105 transition-transform">
                        <MicIcon className="w-8 h-8"/>
                    </button>
                )}
                {(sessionState === 'listening' || sessionState === 'speaking' || sessionState === 'processing') && (
                    <button onClick={() => endSession(false)} className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-tertiary)]">
                        <StopIcon className="w-8 h-8"/>
                    </button>
                )}
                 {sessionState === 'ending' && (
                    <div className="flex items-center space-x-2 text-[var(--text-secondary)]">
                        <SpinnerIcon className="w-6 h-6"/>
                        <span>Analyzing...</span>
                    </div>
                )}
            </div>

            {showFeedback && <FeedbackCard feedback={feedback} onClose={handleFeedbackClosed} />}
        </div>
    );
};

export default PracticeSession;