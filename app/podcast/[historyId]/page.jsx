"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Sidebar from "@/app/components/Sidebar";
import { UserButton } from "@clerk/nextjs";

export default function AudioPlayerPage() {
    const params = useParams();
    const router = useRouter();
    const historyId = params.historyId;

    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTranscript, setShowTranscript] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [pausedAt, setPausedAt] = useState(0);
    const audioBufferRef = useRef(null);
    const startTimeRef = useRef(0);


    // Add WAV header to raw PCM data
    const addWavHeader = async (audioBlob) => {
        const pcmData = await audioBlob.arrayBuffer();
        const header = new ArrayBuffer(44);
        const view = new DataView(header);

        // RIFF header (24kHz mono 16-bit PCM)
        view.setUint32(0, 0x52494646, false); // "RIFF"
        view.setUint32(4, 36 + pcmData.byteLength, true); // Chunk size
        view.setUint32(8, 0x57415645, false); // "WAVE"
        view.setUint32(12, 0x666d7420, false); // "fmt "
        view.setUint32(16, 16, true); // Subchunk size
        view.setUint16(20, 1, true); // PCM format
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, 24000, true); // Sample rate
        view.setUint32(28, 24000 * 2, true); // Byte rate
        view.setUint16(32, 2, true); // Block align
        view.setUint16(34, 16, true); // Bits per sample
        view.setUint32(36, 0x64617461, false); // "data"
        view.setUint32(40, pcmData.byteLength, true); // Data size

        return new Blob([header, pcmData], { type: 'audio/wav' });
    };

    const handlePlay = async () => {
        try {
            if (!audioBufferRef.current) {
                // If no audio buffer, fetch and decode
                const response = await fetch('/api/gcp/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: history.podcast })
                });
    
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'TTS failed');
                }
    
                const audioBlob = await response.blob();
                const fixedBlob = await addWavHeader(audioBlob);
                const arrayBuffer = await fixedBlob.arrayBuffer();
    
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: 24000
                });
    
                audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
                setDuration(audioBufferRef.current.duration);
            } else {
                if (!audioContextRef.current || audioContextRef.current.state === "closed") {
                    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                        sampleRate: 24000
                    });
                }
            }
    
            // Setup and play
            sourceRef.current = audioContextRef.current.createBufferSource();
            sourceRef.current.buffer = audioBufferRef.current;
            sourceRef.current.connect(audioContextRef.current.destination);
    
            const offset = pausedAt;
            startTimeRef.current = audioContextRef.current.currentTime - offset;
            sourceRef.current.start(0, offset);
            setIsPlaying(true);
    
            const updateProgress = () => {
                const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
                setCurrentTime(Math.min(elapsed, audioBufferRef.current.duration));
                if (elapsed < audioBufferRef.current.duration && isPlaying) {
                    animationFrameRef.current = requestAnimationFrame(updateProgress);
                }
            };
            updateProgress();
        } catch (error) {
            console.error("Playback error:", error);
            alert(`Audio Error: ${error.message}`);
        }
    };
    


    const handlePause = () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
            setPausedAt(audioContextRef.current.currentTime - startTimeRef.current);
            setIsPlaying(false);
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const handleStop = async () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            await audioContextRef.current.close();
        }
        audioContextRef.current = null;
        audioBufferRef.current = null;
        setCurrentTime(0);
        setDuration(0);
        setPausedAt(0);
        setIsPlaying(false);
        cancelAnimationFrame(animationFrameRef.current);
    };
    
    

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this podcast? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/podcast/delete/${historyId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error("Failed to delete podcast");
            }
            router.push('/home');
        } catch (error) {
            console.error("Failed to delete podcast:", error);
            alert("Failed to delete podcast. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/podcast/fetch/${historyId}`);

                if (!res.ok) {
                    throw new Error("History not found");
                }

                const data = await res.json();
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
                setHistory(null);
            } finally {
                setLoading(false);
            }
        };

        if (historyId) fetchHistory();

        // Cleanup audio context and animation frame
        return () => {
            if (sourceRef.current) {
                sourceRef.current.stop();
                sourceRef.current.disconnect();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [historyId]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!history) return <div className="text-center mt-10">History not found</div>;

    return (
        <>
            <Sidebar />
            <div style={{
                minHeight: '100vh',
                background: '#fff',
                padding: '60px 0 0 0',
                fontFamily: 'sans-serif',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Top right avatar */}
                <div style={{
                    position: 'absolute',
                    top: 40,
                    right: 60,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#dab6fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                    fontSize: 22,
                    color: '#7c3aed'
                }}>
                    <UserButton />
                </div>

                {/* Animated Bubble Background */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 0,
                    overflow: 'hidden',
                    pointerEvents: 'none'
                }}>
                    <style>{`
                        @keyframes bubbleMove1 {
                            0% { transform: translateY(0) scale(1);}
                            50% { transform: translateY(-40px) scale(1.1);}
                            100% { transform: translateY(0) scale(1);}
                        }
                        @keyframes bubbleMove2 {
                            0% { transform: translateY(0) scale(1);}
                            50% { transform: translateY(-60px) scale(1.15);}
                            100% { transform: translateY(0) scale(1);}
                        }
                        @keyframes bubbleMove3 {
                            0% { transform: translateY(0) scale(1);}
                            50% { transform: translateY(-30px) scale(0.95);}
                            100% { transform: translateY(0) scale(1);}
                        }
                        @keyframes bubbleMove4 {
                            0% { transform: translateY(0) scale(1);}
                            50% { transform: translateY(-50px) scale(1.08);}
                            100% { transform: translateY(0) scale(1);}
                        }
                        @keyframes bubbleMove5 {
                            0% { transform: translateY(0) scale(1);}
                            50% { transform: translateY(-35px) scale(1.12);}
                            100% { transform: translateY(0) scale(1);}
                        }
                    `}</style>
                    <div style={{
                        position: 'absolute',
                        left: '10vw',
                        top: '20vh',
                        width: 160,
                        height: 160,
                        background: 'radial-gradient(circle at 60% 40%, #fbc2eb 60%, #a18cd1 100%)',
                        borderRadius: '50%',
                        opacity: 0.45,
                        filter: 'blur(2px)',
                        animation: 'bubbleMove1 8s ease-in-out infinite'
                    }} />
                    <div style={{
                        position: 'absolute',
                        left: '60vw',
                        top: '10vh',
                        width: 220,
                        height: 220,
                        background: 'radial-gradient(circle at 40% 60%, #a18cd1 60%, #fbc2eb 100%)',
                        borderRadius: '50%',
                        opacity: 0.35,
                        filter: 'blur(4px)',
                        animation: 'bubbleMove2 10s ease-in-out infinite'
                    }} />
                    <div style={{
                        position: 'absolute',
                        left: '30vw',
                        top: '60vh',
                        width: 120,
                        height: 120,
                        background: 'radial-gradient(circle at 50% 50%, #fad0c4 60%, #a1c4fd 100%)',
                        borderRadius: '50%',
                        opacity: 0.30,
                        filter: 'blur(3px)',
                        animation: 'bubbleMove3 9s ease-in-out infinite'
                    }} />
                    <div style={{
                        position: 'absolute',
                        left: '75vw',
                        top: '65vh',
                        width: 180,
                        height: 180,
                        background: 'radial-gradient(circle at 60% 40%, #b6a4f6 60%, #fbc2eb 100%)',
                        borderRadius: '50%',
                        opacity: 0.38,
                        filter: 'blur(3px)',
                        animation: 'bubbleMove4 11s ease-in-out infinite'
                    }} />
                    <div style={{
                        position: 'absolute',
                        left: '50vw',
                        top: '35vh',
                        width: 100,
                        height: 100,
                        background: 'radial-gradient(circle at 50% 50%, #fbc2eb 60%, #b6a4f6 100%)',
                        borderRadius: '50%',
                        opacity: 0.32,
                        filter: 'blur(2px)',
                        animation: 'bubbleMove5 12s ease-in-out infinite'
                    }} />
                </div>

                {/* Centered Title header */}
                <div style={{
                    width: 650,
                    maxWidth: '90vw',
                    margin: '0 auto 24px auto',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    position: 'relative'
                }}>
                    <h2 style={{
                        fontWeight: 800,
                        fontSize: 32,
                        margin: 0,
                        color: '#7c3aed',
                        letterSpacing: '0.5px',
                        textShadow: '0 2px 12px #e5d4fa',
                        fontFamily: 'sans-serif'
                    }}>
                        {history.title}
                    </h2>
                    <div style={{
                        width: 60,
                        height: 4,
                        background: '#bda4f6',
                        borderRadius: 2,
                        marginTop: 10,
                        marginBottom: 4
                    }} />
                </div>

                {/* Centered Audio player */}
                <div style={{
                    background: '#f6edfd',
                    borderRadius: 4,
                    margin: '0 auto 16px auto',
                    width: 650,
                    maxWidth: '90vw',
                    padding: '12px 16px 8px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            {/* Play Icon for text to speech of the podcast script*/}
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={handlePlay}>
                                <svg width="28" height="28" fill="none" stroke="#222" strokeWidth="2"><polygon points="7,5 23,14 7,23" fill="#222" /></svg>
                            </button>

                            {/* Pause Icon */}
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={handlePause}>
                                <svg width="24" height="24" stroke="#222" strokeWidth="2">
                                    <rect x="6" y="4" width="4" height="16" fill="#222" />
                                    <rect x="14" y="4" width="4" height="16" fill="#222" />
                                </svg>
                            </button>

                            {/* Stop Icon */}
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={handleStop}>
                                <svg width="24" height="24" stroke="#222" strokeWidth="2">
                                    <rect x="6" y="6" width="12" height="12" fill="#222" />
                                </svg>
                            </button>

        
                        </div>
                        {/* Trash Icon */}
                        <button
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                opacity: isDeleting ? 0.6 : 1
                            }}
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <svg width="28" height="28" fill="none" stroke="#222" strokeWidth="2">
                                <rect x="9" y="11" width="10" height="10" rx="2" fill="none" />
                                <line x1="12" y1="14" x2="12" y2="18" stroke="#222" strokeWidth="2" />
                                <line x1="16" y1="14" x2="16" y2="18" stroke="#222" strokeWidth="2" />
                                <rect x="11" y="7" width="6" height="2" rx="1" fill="#222" />
                            </svg>
                        </button>
                    </div>
                    {/* Progress bar */}
                    <div style={{
                        width: '100%',
                        height: 4,
                        background: '#e5d4fa',
                        borderRadius: 2,
                        position: 'relative'
                    }}>
                        <div style={{
                            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                            height: '100%',
                            background: '#bda4f6',
                            borderRadius: 2,
                            transition: 'width 0.1s linear'
                        }} />
                    </div>
                    {/* Generate Transcript Button */}
                    <div style={{ marginTop: 16, textAlign: 'right', width: '100%' }}>
                        <button
                            style={{
                                padding: '6px 14px',
                                background: '#7c3aed',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: 14,
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                            onClick={() => setShowTranscript((v) => !v)}
                        >
                            Show Transcript
                        </button>
                    </div>
                </div>

                {/* Transcript Box */}
                {showTranscript && (
                    <div style={{
                        background: '#f6edfd',
                        borderRadius: 4,
                        margin: '0 auto 24px auto',
                        width: 650,
                        maxWidth: '90vw',
                        padding: '18px 20px',
                        boxSizing: 'border-box',
                        fontSize: 15,
                        color: '#222',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {history.podcast || "No transcript available."}
                    </div>
                )}
            </div>
        </>
    );
}
