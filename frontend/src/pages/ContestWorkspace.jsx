import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { VscChevronLeft, VscCheck, VscSymbolMethod, VscPlay, VscArrowRight } from 'react-icons/vsc';
import { FaSun, FaMoon, FaPalette } from 'react-icons/fa';

const ContestWorkspace = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    
    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('// Write your solution here...');
    const [language, setLanguage] = useState('javascript');
    const [mcqAnswer, setMcqAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const [theme, setTheme] = useState('dark'); // 'light', 'dark', 'colorful'

    // Tab switch detector (Anti-cheat)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden && contest) {
                toast.error("Anti-Cheat Triggered: Screen modification detected!");
                try {
                    await apiConnector("POST", `${import.meta.env.VITE_APP_BASE_URL}/contest/violation`, {
                        contestId,
                        violationType: 'Tab Switch / Window Blur'
                    }, { Authorization: `Bearer ${token}` });
                } catch (err) {
                    console.error("Failed to record cheat violation:", err);
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [contest]);

    const fetchContestData = async () => {
        setLoading(true);
        try {
            const response = await apiConnector(
                "GET", 
                `${contestEndpoints.GET_CONTEST_DETAILS_API}${contestId}`,
                null,
                { Authorization: `Bearer ${token}` }
            );
            if (response?.data?.success) {
                if (response.data.isCompleted) {
                    toast.error("You have already submitted this contest!");
                    navigate(`/contests/${contestId}`);
                    return;
                }
                setContest(response.data.data);
                setProblems(response.data.data.problems || []);
            }
        } catch (error) {
            console.error("Fetch Contest Workspace Error:", error);
            toast.error("Failed to load workspace");
            navigate('/contests');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContestData();
    }, [contestId]);

    // Timer logic
    useEffect(() => {
        if (!contest) return;
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(contest.endTime).getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft('Contest Ended');
                clearInterval(timer);
                toast.error("Contest time is up!");
                navigate(`/contests/${contestId}`);
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [contest]);

    const activeProblem = problems[selectedProblemIndex];

    const handleSubmitMcq = async () => {
        if (!mcqAnswer) {
            toast.error("Please select an answer option");
            return;
        }
        setSubmitting(true);
        try {
            const response = await apiConnector("POST", `${import.meta.env.VITE_APP_BASE_URL}/contest/submit-mcq`, {
                contestId,
                problemId: activeProblem._id,
                answer: mcqAnswer
            }, { Authorization: `Bearer ${token}` });

            if (response?.data?.success) {
                toast.success("MCQ Choice Submitted!");
            } else {
                toast.error(response?.data?.message || "Failed to submit");
            }
        } catch (error) {
            toast.error("Failed to submit answer");
        }
        setSubmitting(false);
    };

    const handleRunCode = async () => {
        setConsoleOutput('Executing test cases...');
        try {
            const response = await apiConnector("POST", `${import.meta.env.VITE_APP_BASE_URL}/contest/run-code`, {
                problemId: activeProblem._id,
                code,
                language
            }, { Authorization: `Bearer ${token}` });

            if (response?.data?.success) {
                setConsoleOutput(response.data.output || "Execution Completed successfully!");
            } else {
                setConsoleOutput(response.data.error || "Compilation/Execution failed.");
            }
        } catch (err) {
            setConsoleOutput("Compilation Error: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCompleteContest = async () => {
        const confirm = window.confirm("Are you sure you want to submit and exit? You will be blocked from entering again.");
        if (!confirm) return;

        setSubmitting(true);
        try {
            const response = await apiConnector(
                "POST",
                `${import.meta.env.VITE_APP_BASE_URL}/contest/${contestId}/complete`,
                null,
                { Authorization: `Bearer ${token}` }
            );
            if (response?.data?.success) {
                toast.success("Contest submitted!");
                navigate(`/contests/${contestId}/report`);
            } else {
                toast.error("Failed to complete contest");
            }
        } catch (error) {
            console.error("Complete Contest Error:", error);
            toast.error("Error submitting contest");
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="h-screen w-screen bg-richblack-950 flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-50 mb-4"></div>
                <p className="text-richblack-200 font-mono text-xs">ENTERING SECURE CONTEST ROOM...</p>
            </div>
        );
    }

    if (!contest) return null;

    // Theme style mapping dictionary
    const themeStyles = {
        light: {
            bg: 'bg-[#F8F9FA] text-[#1E293B]',
            header: 'bg-[#FFFFFF] border-b border-[#E2E8F0] text-[#1E293B]',
            sidebar: 'bg-[#FFFFFF] border-r border-[#E2E8F0] text-[#1E293B]',
            sidebarCardSelected: 'bg-[#EFF6FF] text-[#1E293B] border-[#3B82F6] shadow-sm',
            sidebarCardUnselected: 'bg-[#FFFFFF] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#475569]',
            cardPanel: 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#1E293B]',
            optPillSelected: 'border-[#3B82F6] bg-[#EFF6FF] text-[#1E293B] shadow-sm',
            optPillUnselected: 'border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#1E293B]',
            optDotSelected: 'border-[#3B82F6] bg-[#3B82F6] text-white',
            optDotUnselected: 'border-[#94A3B8] bg-white',
            detailsPanel: 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569]',
            detailsPanelLabel: 'text-[#64748B]',
            detailsPanelVal: 'bg-[#E2E8F0] text-[#1E293B]',
            btnPrimary: 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-sm',
            console: 'bg-[#0F172A] text-emerald-400 border-t border-[#E2E8F0]',
            divider: 'bg-[#E2E8F0]',
            btnBack: 'hover:bg-[#F1F5F9] text-[#475569] hover:text-black',
            txtMuted: 'text-[#64748B]',
            editorBorder: 'border-r border-[#E2E8F0]'
        },
        dark: {
            bg: 'bg-richblack-950 text-white',
            header: 'bg-richblack-900/60 border-b border-richblack-800 text-white',
            sidebar: 'bg-richblack-900 border-r border-richblack-800 text-white',
            sidebarCardSelected: 'bg-yellow-25 text-black border-yellow-25 shadow-glass',
            sidebarCardUnselected: 'bg-richblack-800 hover:bg-richblack-700 border-richblack-800 text-richblack-200',
            cardPanel: 'bg-[#1C1D24] border border-richblack-800 text-white',
            optPillSelected: 'border-[#12D8FA] bg-[#1C1D24] shadow-[0_0_15px_rgba(18,216,250,0.08)] text-white',
            optPillUnselected: 'border-richblack-800 bg-[#1C1D24]/40 text-white',
            optDotSelected: 'border-[#12D8FA] bg-[#12D8FA] text-black',
            optDotUnselected: 'border-richblack-600 bg-transparent',
            detailsPanel: 'bg-[#1C1D24] border border-richblack-800 text-richblack-400',
            detailsPanelLabel: 'text-richblack-400',
            detailsPanelVal: 'bg-richblack-850 text-white',
            btnPrimary: 'bg-yellow-50 hover:bg-yellow-100 text-black',
            console: 'bg-richblack-900/40 text-caribbeangreen-200 border-t border-richblack-800',
            divider: 'bg-richblack-800',
            btnBack: 'hover:bg-richblack-800 text-richblack-300 hover:text-white',
            txtMuted: 'text-richblack-400',
            editorBorder: 'border-r border-richblack-800'
        },
        colorful: {
            bg: 'bg-[#0d091a] text-[#f1ebff]',
            header: 'bg-[#140e2b]/80 border-b border-[#3c1e70] text-white',
            sidebar: 'bg-[#140e2b] border-r border-[#3c1e70] text-[#f1ebff]',
            sidebarCardSelected: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)]',
            sidebarCardUnselected: 'bg-[#20163f] hover:bg-[#2b1f54] border-[#3c1e70] text-[#cbd5e1]',
            cardPanel: 'bg-[#191136] border border-[#3c1e70] text-[#f1ebff]',
            optPillSelected: 'border-[#ec4899] bg-[#27164b] shadow-[0_0_15px_rgba(236,72,153,0.15)] text-white',
            optPillUnselected: 'border-[#3c1e70] bg-[#191136]/40 text-[#f1ebff]',
            optDotSelected: 'border-[#ec4899] bg-[#ec4899] text-white',
            optDotUnselected: 'border-[#5c3c9e] bg-transparent',
            detailsPanel: 'bg-[#191136] border border-[#3c1e70] text-[#cbd5e1]',
            detailsPanelLabel: 'text-[#cbd5e1]',
            detailsPanelVal: 'bg-[#2a1b54] text-white',
            btnPrimary: 'bg-[#ec4899] hover:bg-[#db2777] text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]',
            console: 'bg-[#080410] text-[#ec4899] border-t border-[#3c1e70]',
            divider: 'bg-[#3c1e70]',
            btnBack: 'hover:bg-[#20163f] text-[#cbd5e1] hover:text-white',
            txtMuted: 'text-[#5c3c9e]',
            editorBorder: 'border-r border-[#3c1e70]'
        }
    };

    const currentStyle = themeStyles[theme];

    return (
        <div className={`h-screen w-screen flex flex-col font-inter overflow-hidden select-none transition-colors duration-300 ${currentStyle.bg}`}>
            
            {/* Top Workspace Header */}
            <header className={`h-14 backdrop-blur-md flex items-center justify-between px-6 z-50 transition-colors duration-300 ${currentStyle.header}`}>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(`/contests/${contestId}`)}
                        className={`p-2 rounded-lg transition-colors ${currentStyle.btnBack}`}
                    >
                        <VscChevronLeft size={20} />
                    </button>
                    <span className={`h-4 w-[1px] ${currentStyle.divider}`}></span>
                    <h1 className="font-bold text-base truncate max-w-[200px]">
                        {contest.title}
                    </h1>
                    <span className="bg-yellow-25/10 text-yellow-50 text-[10px] font-semibold px-2 py-0.5 rounded border border-yellow-25/20 uppercase">
                        {contest.type}
                    </span>
                    <span className={`h-4 w-[1px] ${currentStyle.divider}`}></span>
                    <button 
                        onClick={() => navigate(`/contests/${contestId}/leaderboard`)}
                        className="text-xs text-yellow-50 hover:underline transition-all font-semibold"
                    >
                        View Leaderboard
                    </button>
                </div>

                {/* Theme switch triggers & secure countdown timer */}
                <div className="flex items-center gap-6">
                    {/* Theme Controls */}
                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 gap-0.5">
                        <button 
                            onClick={() => setTheme('light')}
                            className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-richblack-400 hover:text-white'}`}
                            title="Light Theme"
                        >
                            <FaSun size={12} />
                        </button>
                        <button 
                            onClick={() => setTheme('dark')}
                            className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-yellow-50 text-black shadow-sm' : 'text-richblack-400 hover:text-white'}`}
                            title="Dark Theme"
                        >
                            <FaMoon size={12} />
                        </button>
                        <button 
                            onClick={() => setTheme('colorful')}
                            className={`p-1.5 rounded-md transition-all ${theme === 'colorful' ? 'bg-[#ec4899] text-white shadow-sm' : 'text-richblack-400 hover:text-white'}`}
                            title="Cyberpunk Theme"
                        >
                            <FaPalette size={12} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs text-richblack-400 font-medium">Time Remaining</span>
                        <div className="bg-pink-900/20 text-pink-200 font-mono font-bold px-3 py-1.5 rounded-lg border border-pink-500/20 text-sm tracking-wider">
                            {timeLeft}
                        </div>
                        <button
                            onClick={handleCompleteContest}
                            disabled={submitting}
                            className="bg-pink-500 hover:bg-pink-400 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-lg uppercase tracking-wider"
                        >
                            Submit & Exit
                        </button>
                    </div>
                </div>
            </header>

            {/* Split layout */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left Sidebar - Question index switcher */}
                <div className={`w-64 flex flex-col p-4 space-y-4 transition-colors duration-300 ${currentStyle.sidebar}`}>
                    <span className="text-[10px] font-bold tracking-wider text-richblack-400 uppercase">
                        Question ({problems.length})
                    </span>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {problems.map((prob, i) => {
                            const isSelected = selectedProblemIndex === i;
                            return (
                                <button
                                    key={prob._id}
                                    onClick={() => {
                                        setSelectedProblemIndex(i);
                                        setMcqAnswer('');
                                        setConsoleOutput('');
                                    }}
                                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all duration-200 group ${isSelected ? currentStyle.sidebarCardSelected : currentStyle.sidebarCardUnselected}`}
                                >
                                    <div className="truncate">
                                        <span className="text-[9px] block uppercase font-bold opacity-60">Q {i + 1} • {prob.type}</span>
                                        <span className="font-semibold text-sm truncate block">{prob.title}</span>
                                    </div>
                                    {isSelected && <VscArrowRight size={14} className="ml-2 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right panel: content area */}
                <div className="flex-1 flex overflow-hidden">
                    {activeProblem ? (
                        <>
                            {/* Problem details panel */}
                            <div className={`w-1/2 overflow-y-auto p-8 space-y-6 ${currentStyle.editorBorder}`}>
                                <div className="flex justify-between items-center">
                                    <span className="bg-yellow-25/10 text-yellow-50 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-25/20 uppercase">
                                        {activeProblem.difficulty}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-extrabold">{activeProblem.title}</h2>

                                {activeProblem.type === 'Coding' ? (
                                    <div className="space-y-6 text-richblack-200">
                                        <div>
                                            <h3 className="text-white font-bold border-b border-richblack-800 pb-2 flex items-center gap-2">
                                                <VscSymbolMethod /> Problem Statement
                                            </h3>
                                            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{activeProblem.statement}</p>
                                        </div>
                                        {activeProblem.constraints && (
                                            <div>
                                                <h3 className="text-white font-bold border-b border-richblack-800 pb-2">Constraints</h3>
                                                <pre className="mt-3 font-mono text-sm bg-richblack-900 p-3 rounded-lg border border-richblack-800">{activeProblem.constraints}</pre>
                                            </div>
                                        )}
                                        {activeProblem.examples && (
                                            <div>
                                                <h3 className="text-white font-bold border-b border-richblack-800 pb-2">Examples</h3>
                                                <pre className="mt-3 font-mono text-sm bg-richblack-900 p-4 rounded-lg border border-richblack-800 overflow-x-auto whitespace-pre-wrap">{activeProblem.examples}</pre>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // MCQ Option Panel (Clean alignment inspired by Light mode mockup details)
                                    <div className="space-y-6">
                                        {/* Type Header Tag */}
                                        <div className="flex items-center justify-between">
                                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none ${currentStyle.detailsPanelVal}`}>
                                                <VscSymbolMethod /> Multiple choice
                                            </span>
                                            <span className="text-[10px] text-richblack-500 font-bold uppercase tracking-widest font-mono">Question {selectedProblemIndex + 1} of {problems.length}</span>
                                        </div>

                                        {/* Statement Card */}
                                        <div className={`p-6 rounded-2xl text-base md:text-lg font-bold leading-relaxed whitespace-pre-wrap ${currentStyle.cardPanel}`}>
                                            {activeProblem.statement || activeProblem.title}
                                        </div>

                                        {/* Choice List Container */}
                                        <div className="space-y-3">
                                            <span className="block text-[10px] text-richblack-400 font-bold uppercase tracking-wider font-mono">Choices *</span>
                                            {activeProblem.options?.map((opt, i) => {
                                                const isSelected = mcqAnswer === opt;
                                                return (
                                                    <label 
                                                        key={i} 
                                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${isSelected ? currentStyle.optPillSelected : currentStyle.optPillUnselected}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {/* Custom Styled Circle */}
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? currentStyle.optDotSelected : currentStyle.optDotUnselected}`}>
                                                                {isSelected && <VscCheck size={12} className={theme === 'light' ? 'text-white' : 'text-black'} />}
                                                            </div>
                                                            <span className="text-sm font-semibold select-none">{opt}</span>
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="mcq"
                                                            value={opt}
                                                            checked={isSelected}
                                                            onChange={(e) => setMcqAnswer(e.target.value)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {/* Mark as points Cards */}
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className={`flex justify-between items-center p-4 rounded-xl text-xs font-semibold ${currentStyle.detailsPanel}`}>
                                                <span className={currentStyle.detailsPanelLabel}>Estimation time</span>
                                                <span className={`font-mono px-2.5 py-1 rounded-md text-[10px] ${currentStyle.detailsPanelVal}`}>2 Mins</span>
                                            </div>
                                            <div className={`flex justify-between items-center p-4 rounded-xl text-xs font-semibold ${currentStyle.detailsPanel}`}>
                                                <span className={currentStyle.detailsPanelLabel}>Mark as point</span>
                                                <span className={`font-mono px-2.5 py-1 rounded-md text-[10px] ${currentStyle.detailsPanelVal}`}>1 Points</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSubmitMcq}
                                            disabled={submitting}
                                            className={`w-full font-bold py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider mt-4 ${currentStyle.btnPrimary}`}
                                        >
                                            {submitting ? 'Submitting Choice...' : 'Submit Choice'}
                                        </button>
                                    </div>
                                )}
                             </div>

                            {/* Coding Editor playground */}
                            {activeProblem.type === 'Coding' && (
                                <div className="w-1/2 flex flex-col overflow-hidden bg-richblack-950">
                                    {/* Action Bar */}
                                    <div className="h-12 border-b border-richblack-800 bg-richblack-900/40 flex justify-between items-center px-4">
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="bg-richblack-800 text-white text-xs p-1 px-3 rounded-lg outline-none border border-richblack-700"
                                        >
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="cpp">C++</option>
                                            <option value="java">Java</option>
                                        </select>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleRunCode} 
                                                className="bg-richblack-800 border border-richblack-700 hover:bg-richblack-700 text-[11px] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-white"
                                            >
                                                <VscPlay /> Run Code
                                            </button>
                                            <button className="bg-caribbeangreen-400 hover:bg-caribbeangreen-300 text-black text-[11px] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all">
                                                <VscCheck /> Submit Code
                                            </button>
                                        </div>
                                    </div>

                                    {/* Monaco Editor */}
                                    <div className="flex-1 relative border-b border-richblack-800">
                                        <Editor
                                            height="100%"
                                            language={language}
                                            theme={theme === 'light' ? 'light' : 'vs-dark'}
                                            value={code}
                                            onChange={(val) => setCode(val || '')}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                fontFamily: 'Fira Code, monospace',
                                                automaticLayout: true,
                                                padding: { top: 16 }
                                            }}
                                        />
                                    </div>

                                    {/* Terminal execution output */}
                                    <div className="h-1/3 bg-richblack-900/40 p-4 font-mono overflow-y-auto flex flex-col">
                                        <span className="text-[10px] text-richblack-400 font-bold uppercase tracking-wider border-b border-richblack-800 pb-1">Console</span>
                                        <div className="flex-1 mt-2 text-xs text-caribbeangreen-200 whitespace-pre-wrap">{consoleOutput || 'Click "Run Code" to compile and execute.'}</div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-richblack-500">
                            No questions added to this workspace.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestWorkspace;
