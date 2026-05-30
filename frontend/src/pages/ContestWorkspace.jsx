import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { VscChevronLeft, VscCheck, VscSymbolMethod, VscPlay, VscArrowRight } from 'react-icons/vsc';

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
                <p className="text-richblack-200">Entering Secure Contest Workspace...</p>
            </div>
        );
    }

    if (!contest) return null;

    return (
        <div className="h-screen w-screen bg-richblack-950 text-white flex flex-col font-inter overflow-hidden select-none">
            {/* Top Workspace Header */}
            <header className="h-14 border-b border-richblack-800 bg-richblack-900/60 backdrop-blur-md flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(`/contests/${contestId}`)}
                        className="p-2 hover:bg-richblack-800 rounded-lg transition-colors text-richblack-300 hover:text-white"
                    >
                        <VscChevronLeft size={20} />
                    </button>
                    <span className="h-4 w-[1px] bg-richblack-800"></span>
                    <h1 className="font-bold text-base bg-gradient-to-r from-yellow-50 to-yellow-200 text-transparent bg-clip-text truncate max-w-[250px]">
                        {contest.title}
                    </h1>
                    <span className="bg-yellow-25/10 text-yellow-50 text-[10px] font-semibold px-2 py-0.5 rounded border border-yellow-25/20 uppercase">
                        {contest.type}
                    </span>
                    <span className="h-4 w-[1px] bg-richblack-800"></span>
                    <button 
                        onClick={() => navigate(`/contests/${contestId}/leaderboard`)}
                        className="text-xs text-richblack-300 hover:text-yellow-50 hover:underline transition-all"
                    >
                        View Leaderboard
                    </button>
                </div>

                {/* Secure Countdown timer & Submit & Exit */}
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
            </header>

            {/* Split layout */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left Sidebar - Question index switcher */}
                <div className="w-64 bg-richblack-900 border-r border-richblack-800 flex flex-col p-4 space-y-4">
                    <span className="text-[10px] font-bold tracking-wider text-richblack-400 uppercase">Question Navigation</span>
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
                                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all duration-200 group ${isSelected ? 'bg-yellow-25 text-black border-yellow-25 shadow-glass' : 'bg-richblack-800 hover:bg-richblack-700 border-richblack-800'}`}
                                >
                                    <div className="truncate">
                                        <span className="text-[9px] block uppercase font-bold opacity-60">Q {i + 1} • {prob.type}</span>
                                        <span className="font-semibold text-sm truncate block">{prob.title}</span>
                                    </div>
                                    {isSelected && <VscArrowRight size={14} className="text-black ml-2" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right panel: content area */}
                <div className="flex-1 flex overflow-hidden bg-richblack-950">
                    {activeProblem ? (
                        <>
                            {/* Problem details panel */}
                            <div className="w-1/2 overflow-y-auto p-8 space-y-6 border-r border-richblack-800">
                                <div className="flex justify-between items-center">
                                    <span className="bg-richblack-800 border border-richblack-700 text-yellow-50 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
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
                                    // MCQ Option Panel
                                    <div className="space-y-6">
                                        <p className="text-base text-richblack-100 bg-richblack-900 p-4 rounded-xl border border-richblack-800 whitespace-pre-wrap">
                                            {activeProblem.statement || activeProblem.title}
                                        </p>
                                        <div className="space-y-3">
                                            {activeProblem.options?.map((opt, i) => (
                                                <label 
                                                    key={i} 
                                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer hover:bg-richblack-900/60 transition-all ${mcqAnswer === opt ? 'border-yellow-50 bg-richblack-900 shadow-glass' : 'border-richblack-800 bg-richblack-900/20'}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="mcq"
                                                        value={opt}
                                                        checked={mcqAnswer === opt}
                                                        onChange={(e) => setMcqAnswer(e.target.value)}
                                                        className="w-4 h-4 accent-yellow-50 cursor-pointer"
                                                    />
                                                    <span className="text-sm font-semibold text-richblack-300">{String.fromCharCode(65 + i)}.</span>
                                                    <span className="text-sm font-medium">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleSubmitMcq}
                                            disabled={submitting}
                                            className="w-full bg-yellow-50 text-black font-bold py-3 rounded-xl hover:bg-yellow-100 transition-all text-sm uppercase tracking-wider"
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
                                                className="bg-richblack-800 border border-richblack-700 hover:bg-richblack-700 text-[11px] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
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
                                            theme="vs-dark"
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
