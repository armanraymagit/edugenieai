
import React, { useState, useRef } from 'react';
import { summarizeLecture } from '../services/ai';

interface LectureBuddyProps {
    onProcessed?: () => void;
}

const LectureBuddy: React.FC<LectureBuddyProps> = ({ onProcessed }) => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [transcript, setTranscript] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState<{ name: string; type: string; data: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProcess = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            let result = '';
            if (mediaFile) {
                // Process Audio/Video with Gemini (Multimodal)
                result = await summarizeLecture(mediaFile.data, 'media', mediaFile.type);
            } else if (youtubeUrl.trim() && !transcript.trim()) {
                // Guide user to provide transcript or try to fetch (if possible)
                result = "To summarize this YouTube video, please copy the transcript from YouTube (Under '...' -> 'Show Transcript') and paste it into the Transcript box below. I'm ready to analyze it!";
                setTranscript('');
            } else if (transcript.trim()) {
                // Process Text Transcript
                result = await summarizeLecture(transcript, 'text');
            } else {
                alert("Please provide a transcript, a video link, or upload an audio/video file.");
                setIsLoading(false);
                return;
            }
            setSummary(result);
            if (onProcessed) onProcessed();
        } catch (error) {
            console.error(error);
            alert("Failed to process the lecture. Make sure your Gemini API key is configured for media processing.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];
            setMediaFile({
                name: file.name,
                type: file.type,
                data: base64Data
            });
            setYoutubeUrl('');
            setTranscript('');
        };

        if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
            reader.readAsDataURL(file);
        } else {
            alert("Please upload an audio (.mp3, .wav) or video (.mp4) file.");
        }
    };

    const handleClear = () => {
        setYoutubeUrl('');
        setTranscript('');
        setSummary('');
        setMediaFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-800">Lecture Buddy</h2>
                    <p className="text-slate-500 mt-2">Summarize YouTube lectures, Zoom recordings, or classroom audio in seconds.</p>
                </div>
                <button onClick={handleClear} className="px-4 py-2 text-rose-500 font-semibold hover:bg-rose-50 rounded-xl transition-all">
                    Clear All
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Input Modes */}
                <div className="lg:col-span-5 space-y-6">
                    {/* YouTube Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                        <div className="flex items-center space-x-3 text-rose-600">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            <h3 className="font-bold text-slate-800">YouTube Video</h3>
                        </div>
                        <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => { setYoutubeUrl(e.target.value); setMediaFile(null); }}
                            placeholder="Paste YouTube Link..."
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-rose-300 transition-all font-medium"
                        />
                    </div>

                    {/* Media Upload Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                        <div className="flex items-center space-x-3 text-indigo-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            <h3 className="font-bold text-slate-800">Recording Upload</h3>
                        </div>
                        {mediaFile ? (
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{mediaFile.name}</p>
                                        <p className="text-xs text-slate-500 uppercase">{mediaFile.type.split('/')[1]}</p>
                                    </div>
                                </div>
                                <button onClick={() => setMediaFile(null)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-slate-50 transition-all group"
                            >
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-700">Upload MP3, WAV or MP4</span>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*,video/*" />
                            </div>
                        )}
                    </div>

                    {/* Transcript Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                            <span>Transcript (Manual)</span>
                        </h3>
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Paste lecture transcript here for more accurate results..."
                            className="w-full h-48 p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-indigo-200 resize-none font-medium text-slate-700"
                        />
                    </div>

                    <button
                        onClick={handleProcess}
                        disabled={isLoading || (!youtubeUrl && !mediaFile && !transcript)}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Wait, Analyzying Lecture...' : 'Process Lecture'}
                    </button>
                </div>

                {/* Right Column: Result Output */}
                <div className="lg:col-span-7 h-full min-h-[600px]">
                    <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col p-8 ${!summary ? 'justify-center items-center' : ''}`}>
                        {summary ? (
                            <div className="flex-1 w-full overflow-y-auto space-y-6 animate-fadeIn pb-8">
                                <div className="flex items-center space-x-2 text-indigo-600 mb-6">
                                    <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-2xl font-display font-bold">Lecture Analysis</h3>
                                </div>
                                <div className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-indigo-600">
                                    {summary.split('\n').map((line, i) => {
                                        if (line.startsWith('#')) return <h3 key={i} className="font-display font-bold text-xl mt-6 mb-2">{line.replace(/#/g, '').trim()}</h3>;
                                        if (line.startsWith('-') || line.startsWith('*')) return <li key={i} className="ml-4 mb-1">{line.replace(/[-*]/, '').trim()}</li>;
                                        return <p key={i} className="mb-2">{line}</p>;
                                    })}
                                </div>
                                <div className="mt-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-center">
                                    <p className="text-indigo-900 font-bold mb-2">Want to test your knowledge?</p>
                                    <p className="text-indigo-600 text-sm mb-4">I can generate a quiz or flashcards based specifically on this lecture.</p>
                                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">Create Study Set</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 max-w-sm">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-400">Analysis Pending</h4>
                                    <p className="text-slate-400 text-sm">Upload a lecture file or paste a link to see the magic happen.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectureBuddy;
