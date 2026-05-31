import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    VscChevronLeft, 
    VscCheck, 
    VscSymbolMethod, 
    VscPlay, 
    VscArrowRight 
} from 'react-icons/vsc';
import { 
    FaSun, 
    FaMoon, 
    FaPalette,
    FaRegStickyNote,
    FaRegBookmark,
    FaBookmark,
    FaClock,
    FaExpand,
    FaCompress,
    FaTerminal
} from 'react-icons/fa';

// Digital Canvas Space Background particles using requestAnimationFrame
const SpaceBackground = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        let stars = [];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        for (let i = 0; i < 40; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.2 + 0.3,
                speed: Math.random() * 0.4 + 0.1,
                alpha: Math.random()
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(234, 255, 32, ${star.alpha})`; 
                ctx.fill();
                star.y -= star.speed;
                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = Math.random() * canvas.width;
                }
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />;
};

// Premium Option Selection component with magnetic/cursor glow and checking morph
const OptionCard = ({ opt, isSelected, optionLetter, onSelect, currentStyle }) => {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        const { currentTarget, clientX, clientY } = e;
        const { left, top } = currentTarget.getBoundingClientRect();
        setCoords({
            x: clientX - left,
            y: clientY - top
        });
    };

    return (
        <motion.label
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onSelect}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 group overflow-hidden ${
                isSelected ? currentStyle.optPillSelected : currentStyle.optPillUnselected
            }`}
        >
            {isHovered && (
                <div 
                    className="absolute pointer-events-none rounded-full opacity-30 blur-xl transition-opacity duration-300"
                    style={{
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(234, 255, 32, 0.12) 0%, transparent 70%)',
                        left: coords.x - 75,
                        top: coords.y - 75
                    }}
                />
            )}
            
            <div className="flex items-center gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isSelected ? currentStyle.optDotSelected : currentStyle.optDotUnselected
                }`}>
                    {optionLetter}
                </div>
                <span className="text-sm font-semibold select-none">{opt}</span>
            </div>

            {isSelected && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="text-[#EAFF20] relative z-10"
                >
                    <VscCheck size={18} />
                </motion.div>
            )}
            
            <input
                type="radio"
                name="mcq"
                value={opt}
                checked={isSelected}
                onChange={onSelect}
                className="hidden"
            />
        </motion.label>
    );
};

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
    const [theme, setTheme] = useState('dark'); 

    const [showSidebar, setShowSidebar] = useState(true);
    const [direction, setDirection] = useState(1); 

    const [fontSize, setFontSize] = useState(14);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); 

    const [notes, setNotes] = useState(() => {
        try {
            const saved = localStorage.getItem(`contest_notes_${contestId}`);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const [markedForReview, setMarkedForReview] = useState(() => {
        try {
            const saved = localStorage.getItem(`contest_review_${contestId}`);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const handleNoteChange = (problemId, text) => {
        const newNotes = { ...notes, [problemId]: text };
        setNotes(newNotes);
        localStorage.setItem(`contest_notes_${contestId}`, JSON.stringify(newNotes));
    };

    const toggleMarkForReview = (problemId) => {
        const updated = { ...markedForReview, [problemId]: !markedForReview[problemId] };
        setMarkedForReview(updated);
        localStorage.setItem(`contest_review_${contestId}`, JSON.stringify(updated));
        toast.success(!markedForReview[problemId] ? "Question marked for review" : "Removed mark for review");
    };

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

    useEffect(() => {
        if (activeProblem && activeProblem.type === 'Coding') {
            const starter = activeProblem.starterCode?.[language === 'cpp' || language === 'c++' ? 'cpp' : language];
            setCode(starter || '// Write your solution here...');
        }
    }, [activeProblem, language]);

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
        setActiveConsoleTab('console');
        try {
            const response = await apiConnector("POST", `${import.meta.env.VITE_APP_BASE_URL}/contest/run-code`, {
                problemId: activeProblem._id,
                code,
                language,
                customInput
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

    const handlePrevious = () => {
        if (selectedProblemIndex > 0) {
            setDirection(-1);
            setSelectedProblemIndex(selectedProblemIndex - 1);
            setMcqAnswer('');
            setConsoleOutput('');
        }
    };

    const handleSubmitCoding = async () => {
        try {
            setConsoleOutput('Submitting and evaluating test cases...');
            setActiveConsoleTab('console');

            const response = await apiConnector(
                "POST",
                `${import.meta.env.VITE_APP_BASE_URL}/contest/submit-coding`,
                {
                    contestId,
                    problemId: activeProblem._id,
                    code,
                    language
                },
                { Authorization: `Bearer ${token}` }
            );
            if (response?.data?.success) {
                if (response.data.verdict === 'Accepted') {
                    toast.success("Solution Accepted! Moving to next problem.");
                    setConsoleOutput("Status: Accepted ✅\nAll test cases passed!");
                    return true;
                } else {
                    toast.error("Wrong Answer! Please check your code.");
                    setConsoleOutput(`Status: Wrong Answer ❌\n\nExpected Output:\n${response.data.expectedOutput}\n\nYour Output:\n${response.data.actualOutput}`);
                    return false;
                }
            } else {
                toast.error("Failed to submit code");
                return false;
            }
        } catch (error) {
            console.error("Coding Submit Error:", error);
            toast.error("Error submitting code");
            return false;
        }
    };

    const handleSaveAndNext = async () => {
        let shouldAdvance = true;

        if (activeProblem.type === 'MCQ' && mcqAnswer) {
            await handleSubmitMcq();
        } else if (activeProblem.type !== 'MCQ' && code) {
            shouldAdvance = await handleSubmitCoding();
        }
        
        if (shouldAdvance) {
            if (selectedProblemIndex < problems.length - 1) {
                setDirection(1);
                setSelectedProblemIndex(selectedProblemIndex + 1);
                setMcqAnswer('');
                setConsoleOutput('');
            } else {
                toast.success("All questions reviewed! You can submit the test using 'End Test'.");
            }
        }
    };

    // Calculate time categories for timer warning pulse and heartbeat
    const getTimerAlertClasses = (timeStr) => {
        if (!timeStr || timeStr === 'Contest Ended') return 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400';
        const parts = timeStr.split(':').map(Number);
        let totalSec = 0;
        if (parts.length === 3) {
            totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            totalSec = parts[0] * 60 + parts[1];
        }
        if (totalSec <= 60) {
            return 'border-red-500/40 bg-red-950/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse scale-105';
        } else if (totalSec <= 300) {
            return 'border-yellow-500/35 bg-yellow-950/10 text-yellow-300 animate-pulse';
        }
        return 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400';
    };

    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? 120 : -120,
            opacity: 0,
            scale: 0.97
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                x: { type: "spring", stiffness: 300, damping: 25 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.3 }
            }
        },
        exit: (dir) => ({
            x: dir > 0 ? -120 : 120,
            opacity: 0,
            scale: 0.97,
            transition: {
                x: { type: "spring", stiffness: 300, damping: 25 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
            }
        })
    };

    if (loading) {
        return (
            <div className="h-screen w-screen bg-[#08080C] flex flex-col items-center justify-center text-white overflow-hidden relative">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EAFF20]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
                
                <motion.div 
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#EAFF20] to-transparent shadow-[0_0_15px_#EAFF20] opacity-30 pointer-events-none"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center space-y-6 z-10"
                >
                    <div className="relative flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 rounded-full border-2 border-transparent border-t-[#EAFF20] border-b-emerald-500"
                        />
                        <div className="absolute w-14 h-14 rounded-full bg-[#121217] flex items-center justify-center border border-white/5">
                            <span className="text-[10px] font-bold text-richblack-300 font-mono animate-pulse">AXI</span>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <motion.h3
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xs font-bold font-mono tracking-[0.2em] text-white"
                        >
                            ESTABLISHING SECURE CONNECTION
                        </motion.h3>
                        <p className="text-[10px] text-richblack-400 font-mono">
                            Decrypting workspace environments...
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!contest) return null;

    const themeStyles = {
        light: {
            bg: 'bg-[#F8F9FA] text-[#1E293B]',
            header: 'bg-[#FFFFFF] border-b border-[#E2E8F0] text-[#1E293B]',
            sidebar: 'bg-[#FFFFFF] border-r border-[#E2E8F0] text-[#1E293B]',
            sidebarCardSelected: 'bg-[#EFF6FF] text-[#1E293B] border-[#3B82F6] shadow-sm',
            sidebarCardUnselected: 'bg-[#FFFFFF] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#475569]',
            cardPanel: 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#1E293B]',
            optPillSelected: 'border-emerald-500 bg-emerald-50/50 text-[#1E293B] shadow-sm',
            optPillUnselected: 'border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#1E293B]',
            optDotSelected: 'bg-emerald-500 text-white',
            optDotUnselected: 'bg-slate-100 text-slate-500 hover:bg-slate-200',
            detailsPanel: 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569]',
            detailsPanelLabel: 'text-[#64748B]',
            detailsPanelVal: 'bg-[#E2E8F0] text-[#1E293B]',
            btnPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm',
            console: 'bg-[#0F172A] text-emerald-400 border-t border-[#E2E8F0]',
            divider: 'bg-[#E2E8F0]',
            btnBack: 'hover:bg-[#F1F5F9] text-[#475569] hover:text-black',
            txtMuted: 'text-[#64748B]',
            editorBorder: 'border-r border-[#E2E8F0]',
            sideBg: 'bg-[#FAFBFD] border-l border-[#E2E8F0]',
            cardBg: 'bg-[#FFFFFF] border-[#E2E8F0]',
            txtTitle: 'text-richblack-900',
            txtBody: 'text-[#475569]',
            hintBtn: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200',
            notesArea: 'text-[#1E293B] placeholder-slate-400'
        },
        dark: {
            bg: 'bg-[#0D0E12] text-white',
            header: 'bg-[#0F1015]/80 border-b border-[#1F212A] text-white',
            sidebar: 'bg-[#0F1015] border-r border-[#1F212A] text-white',
            sidebarCardSelected: 'bg-[#FCD34D] text-black border-[#FCD34D] shadow-[0_0_12px_rgba(252,211,77,0.3)]',
            sidebarCardUnselected: 'bg-[#181920] hover:bg-[#1F212A] border-[#1F212A] text-richblack-200',
            cardPanel: 'bg-[#16171E] border border-[#1F212A] text-white',
            optPillSelected: 'border-white bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.12)] text-white',
            optPillUnselected: 'border-[#1F212A] bg-[#16171E]/40 hover:border-richblack-700 hover:bg-[#181920]/45 text-white',
            optDotSelected: 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.5)]',
            optDotUnselected: 'bg-[#181920] text-richblack-400 group-hover:bg-[#1F212A]',
            detailsPanel: 'bg-[#16171E] border border-[#1F212A] text-richblack-400',
            detailsPanelLabel: 'text-richblack-400',
            detailsPanelVal: 'bg-[#181920] text-white',
            btnPrimary: 'bg-gradient-to-r from-white to-[#E2E8F0] hover:bg-white text-[#0D0E12] font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]',
            console: 'bg-[#08080B] text-emerald-400 border-t border-[#1F212A]',
            divider: 'bg-[#1F212A]',
            btnBack: 'hover:bg-[#181920] text-richblack-300 hover:text-white',
            txtMuted: 'text-[#FCD34D]',
            editorBorder: 'border-r border-[#1F212A]',
            sideBg: 'bg-[#0B0C0E] border-l border-[#1F212A]',
            cardBg: 'bg-[#121319] border border-[#1F212A]',
            txtTitle: 'text-white',
            txtBody: 'text-richblack-300',
            hintBtn: 'bg-white/5 hover:bg-white/10 text-white border-white/20',
            notesArea: 'text-white placeholder-richblack-600'
        },
        colorful: {
            bg: 'bg-[#08080C] text-white',
            header: 'bg-[#0D0D12]/80 border-b border-[#EAFF20]/25 text-white',
            sidebar: 'bg-[#0D0D12] border-r border-[#EAFF20]/25 text-white',
            sidebarCardSelected: 'bg-[#EAFF20] text-black border-[#EAFF20] shadow-[0_0_15px_rgba(234,255,32,0.35)]',
            sidebarCardUnselected: 'bg-[#15151B] hover:bg-[#1E1E26] border-[#EAFF20]/15 text-richblack-200',
            cardPanel: 'bg-[#121217] border border-[#EAFF20]/25 text-white',
            optPillSelected: 'border-[#EAFF20] bg-[#EAFF20]/10 shadow-[0_0_15px_rgba(234,255,32,0.2)] text-white',
            optPillUnselected: 'border-white/10 bg-[#121217]/50 hover:border-[#EAFF20]/50 hover:bg-[#15151B]/50 text-white',
            optDotSelected: 'bg-[#EAFF20] text-black shadow-[0_0_10px_rgba(234,255,32,0.5)]',
            optDotUnselected: 'bg-[#1E1E26] text-richblack-400 group-hover:bg-[#252530]',
            detailsPanel: 'bg-[#121217] border border-[#EAFF20]/25 text-richblack-300',
            detailsPanelLabel: 'text-richblack-400',
            detailsPanelVal: 'bg-[#15151B] text-white',
            btnPrimary: 'bg-[#EAFF20] hover:bg-[#d5eb1b] text-black font-extrabold shadow-[0_0_15px_rgba(234,255,32,0.35)]',
            console: 'bg-[#050508] text-[#EAFF20] border-t border-[#EAFF20]/25',
            divider: 'bg-[#EAFF20]/20',
            btnBack: 'hover:bg-[#1E1E26] text-richblack-300 hover:text-white',
            txtMuted: 'text-[#EAFF20]',
            editorBorder: 'border-r border-[#EAFF20]/25',
            sideBg: 'bg-[#0B0B0F] border-l border-[#EAFF20]/25',
            cardBg: 'bg-[#121217] border border-[#EAFF20]/20',
            txtTitle: 'text-white',
            txtBody: 'text-richblack-300',
            hintBtn: 'bg-[#EAFF20]/10 hover:bg-[#EAFF20]/20 text-[#EAFF20] border-[#EAFF20]/30',
            notesArea: 'text-white placeholder-[#EAFF20]/20'
        }
    };

    const currentStyle = themeStyles[theme];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={`h-screen w-screen flex flex-col font-inter overflow-hidden select-none transition-colors duration-300 relative ${currentStyle.bg}`}
        >
            {/* Dynamic space environment particles background */}
            <SpaceBackground />
            
            {/* Top Workspace Header */}
            <header className={`h-14 backdrop-blur-md flex items-center justify-between px-6 z-50 transition-colors duration-300 ${currentStyle.header}`}>
                <div className="flex items-center gap-6 flex-1 max-w-xl relative z-10">
                    <button 
                        onClick={() => navigate(`/contests/${contestId}`)}
                        className={`p-2 rounded-lg transition-colors ${currentStyle.btnBack}`}
                        title="Back to Contests"
                    >
                        <VscChevronLeft size={20} />
                    </button>
                    
                    <span className="font-bold font-mono text-sm tracking-wider shrink-0 select-none">
                        Q. {selectedProblemIndex + 1} of {problems.length}
                    </span>

                    {/* Progress Bar Container */}
                    <div className="flex-1 flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-richblack-800 rounded-full overflow-hidden border border-white/[0.04]">
                            <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${Math.round(((selectedProblemIndex + 1) / problems.length) * 100)}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono font-bold text-richblack-400">
                            {Math.round(((selectedProblemIndex + 1) / problems.length) * 100)}%
                        </span>
                    </div>
                </div>

                {/* Theme switch triggers & secure countdown timer */}
                <div className="flex items-center gap-6 relative z-10">
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`p-1.5 rounded-lg border transition-all text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 ${
                            showSidebar 
                                ? 'bg-[#EAFF20]/10 text-white border-[#EAFF20]/35 shadow-[0_0_8px_rgba(234,255,32,0.08)]' 
                                : 'bg-white/5 border-white/10 text-richblack-300 hover:text-white'
                        }`}
                    >
                        <FaRegStickyNote size={11} />
                        <span>Notes {showSidebar ? 'On' : 'Off'}</span>
                    </button>

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
                            className={`p-1.5 rounded-md transition-all ${theme === 'colorful' ? 'bg-[#EAFF20] text-black shadow-sm' : 'text-richblack-400 hover:text-white'}`}
                            title="Neon Theme"
                        >
                            <FaPalette size={12} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 font-mono font-bold text-sm px-3 py-1.5 rounded-lg border transition-all duration-300 tracking-wider ${getTimerAlertClasses(timeLeft)}`}>
                            <FaClock size={12} className="animate-pulse" />
                            <span>{timeLeft}</span>
                        </div>
                        <button
                            onClick={handleCompleteContest}
                            disabled={submitting}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all uppercase tracking-wider"
                        >
                            End Test
                        </button>
                    </div>
                </div>
            </header>

            {/* Split layout */}
            <div className="flex-1 flex overflow-hidden relative z-10">
                
                {/* Left Sidebar - Question index switcher */}
                <div className={`w-64 flex flex-col p-4 space-y-4 transition-colors duration-300 ${currentStyle.sidebar}`}>
                    <span className="text-[10px] font-bold tracking-wider text-richblack-400 uppercase">
                        Question ({problems.length})
                    </span>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {problems.map((prob, i) => {
                            const isSelected = selectedProblemIndex === i;
                            const isMarked = markedForReview[prob._id];
                            return (
                                <motion.button
                                    key={prob._id}
                                    whileHover={{ x: 3 }}
                                    onClick={() => {
                                        setDirection(selectedProblemIndex < i ? 1 : -1);
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
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {isMarked && <FaBookmark size={10} className="text-yellow-50" />}
                                        {isSelected && <VscArrowRight size={14} className="ml-2 shrink-0" />}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Right panel: content area */}
                <div className="flex-1 flex overflow-hidden">
                    {activeProblem ? (
                        <>
                            {/* MCQ Workspace View */}
                            {activeProblem.type === 'MCQ' ? (
                                <div className={`${showSidebar ? 'w-[62%]' : 'w-full'} overflow-hidden relative flex flex-col transition-all duration-300`}>
                                    <AnimatePresence mode="wait" custom={direction}>
                                        <motion.div
                                            key={selectedProblemIndex}
                                            custom={direction}
                                            variants={slideVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            className="absolute inset-0 overflow-y-auto p-8 flex flex-col justify-between"
                                        >
                                            <div className="space-y-6 max-w-3xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20">
                                                        {activeProblem.difficulty || 'Easy'}
                                                    </span>
                                                    <button className="text-richblack-400 hover:text-white transition-colors">
                                                        <VscSymbolMethod size={16} />
                                                    </button>
                                                </div>

                                                <h2 className="text-2xl font-bold font-mono tracking-tight text-white leading-tight">
                                                    {selectedProblemIndex + 1}. {activeProblem.title}
                                                </h2>

                                                <p className="text-sm text-richblack-400 font-medium">
                                                    Choose the most appropriate answer from the options given below.
                                                </p>

                                                <div className="flex items-center gap-1.5 text-xs text-richblack-400 bg-richblack-900 border border-richblack-800 px-3 py-1.5 rounded-lg w-max select-none">
                                                    <VscSymbolMethod size={12} />
                                                    <span>Multiple Choice</span>
                                                </div>

                                                {/* Choice List Container with OptionCard animations */}
                                                <div className="space-y-3.5">
                                                    {activeProblem.options?.map((opt, i) => {
                                                        const isSelected = mcqAnswer === opt;
                                                        const optionLetter = ['A', 'B', 'C', 'D'][i] || String(i + 1);
                                                        return (
                                                            <OptionCard
                                                                key={i}
                                                                opt={opt}
                                                                isSelected={isSelected}
                                                                optionLetter={optionLetter}
                                                                onSelect={() => setMcqAnswer(opt)}
                                                                currentStyle={currentStyle}
                                                            />
                                                        );
                                                    })}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-6">
                                                    <div className={`flex justify-between items-center p-4 rounded-xl text-xs font-semibold ${currentStyle.detailsPanel}`}>
                                                        <span className={currentStyle.detailsPanelLabel}>Estimation time</span>
                                                        <span className={`font-mono px-2.5 py-1 rounded-md text-[10px] ${currentStyle.detailsPanelVal}`}>2 Mins</span>
                                                    </div>
                                                    <div className={`flex justify-between items-center p-4 rounded-xl text-xs font-semibold ${currentStyle.detailsPanel}`}>
                                                        <span className={currentStyle.detailsPanelLabel}>Mark as point</span>
                                                        <span className={`font-mono px-2.5 py-1 rounded-md text-[10px] ${currentStyle.detailsPanelVal}`}>{activeProblem.marks || 1} Points</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-8 border-t border-richblack-800/40 mt-8 max-w-3xl">
                                                <button
                                                    onClick={handlePrevious}
                                                    disabled={selectedProblemIndex === 0}
                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-richblack-800 text-richblack-300 hover:bg-richblack-800 transition-all font-semibold text-xs disabled:opacity-30 disabled:pointer-events-none`}
                                                >
                                                    <span>← Previous</span>
                                                </button>

                                                <button
                                                    onClick={() => toggleMarkForReview(activeProblem._id)}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-richblack-300 hover:text-white transition-all font-semibold text-xs"
                                                >
                                                    {markedForReview[activeProblem._id] ? (
                                                        <>
                                                            <FaBookmark className="text-yellow-50" size={12} />
                                                            <span className="text-yellow-50 font-bold">Marked</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaRegBookmark size={12} />
                                                            <span>Mark for Review</span>
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={handleSaveAndNext}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#EAFF20] text-black hover:bg-[#d5eb1b] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(234,255,32,0.3)] text-xs"
                                                >
                                                    <span>Save & Next →</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            ) : (
                                /* Coding Workspace View */
                                <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'fixed inset-0 z-[100] bg-richblack-950' : ''}`}>
                                    {/* Left: Problem details panel */}
                                    <div className={`${isFullscreen ? 'hidden' : 'w-1/2'} overflow-y-auto border-r border-richblack-800 transition-all duration-300 bg-richblack-900`}>
                                        <AnimatePresence mode="wait" custom={direction}>
                                            <motion.div 
                                                key={selectedProblemIndex}
                                                custom={direction}
                                                variants={slideVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                className="p-6 space-y-6"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="bg-yellow-25/10 text-yellow-50 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-25/20 uppercase">
                                                        {activeProblem.difficulty || 'Easy'}
                                                    </span>
                                                </div>
                                                <h2 className="text-2xl font-extrabold text-white">{activeProblem.title}</h2>

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
                                                            <pre className="mt-3 font-mono text-sm bg-richblack-950 p-3 rounded-lg border border-richblack-800">{activeProblem.constraints}</pre>
                                                        </div>
                                                    )}
                                                    {activeProblem.examples && (
                                                        <div>
                                                            <h3 className="text-white font-bold border-b border-richblack-800 pb-2">Examples</h3>
                                                            <pre className="mt-3 font-mono text-sm bg-richblack-950 p-4 rounded-lg border border-richblack-800 overflow-x-auto whitespace-pre-wrap">{activeProblem.examples}</pre>
                                                        </div>
                                                    )}
                                                    {activeProblem.editorial && (
                                                        <div>
                                                            <h3 className="text-white font-bold border-b border-richblack-800 pb-2">Explanation</h3>
                                                            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{activeProblem.editorial}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Right: Coding Editor & Test Cases */}
                                    <div className={`${isFullscreen ? 'w-full' : 'w-1/2'} flex flex-col overflow-hidden bg-richblack-950 transition-all duration-300`}>
                                        {/* Action Bar */}
                                        <div className="h-12 border-b border-richblack-800 bg-richblack-900/40 flex justify-between items-center px-4 shrink-0">
                                            <div className="flex items-center gap-4">
                                                <select
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    className="bg-richblack-800 text-white text-xs p-1.5 px-3 rounded-lg outline-none border border-richblack-700 font-bold"
                                                >
                                                    <option value="cpp">C++17</option>
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="java">Java</option>
                                                </select>
                                                <div className="flex bg-richblack-800 rounded-lg p-0.5">
                                                    <button 
                                                        onClick={() => setFontSize(f => Math.max(10, f - 2))}
                                                        className="px-2 py-1 text-richblack-300 hover:text-white transition-colors"
                                                        title="Decrease Font Size"
                                                    >
                                                        A-
                                                    </button>
                                                    <div className="w-px bg-richblack-700 my-1"></div>
                                                    <button 
                                                        onClick={() => setFontSize(f => Math.min(24, f + 2))}
                                                        className="px-2 py-1 text-richblack-300 hover:text-white transition-colors"
                                                        title="Increase Font Size"
                                                    >
                                                        A+
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-3 items-center">
                                                <button 
                                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                                    className="text-richblack-300 hover:text-white transition-colors p-1.5"
                                                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                                >
                                                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Monaco Editor */}
                                        <div className="flex-1 relative">
                                            <Editor
                                                height="100%"
                                                language={language}
                                                theme="vs-dark"
                                                value={code}
                                                onChange={(val) => setCode(val || '')}
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: fontSize,
                                                    fontFamily: 'Fira Code, monospace',
                                                    automaticLayout: true,
                                                    padding: { top: 16 },
                                                    lineNumbers: 'on',
                                                    autoIndent: 'full',
                                                    matchBrackets: 'always',
                                                    folding: true
                                                }}
                                            />
                                        </div>

                                        {/* Test Cases & Console Panel */}
                                        <div className="h-64 border-t border-richblack-800 bg-richblack-900/60 flex flex-col shrink-0">
                                            <div className="flex items-center justify-between px-4 bg-richblack-900 border-b border-richblack-800">
                                                <div className="flex gap-4">
                                                    <button 
                                                        onClick={() => setActiveConsoleTab('testcases')}
                                                        className={`py-2 text-xs font-bold border-b-2 transition-colors ${activeConsoleTab === 'testcases' ? 'border-[#EAFF20] text-[#EAFF20]' : 'border-transparent text-richblack-400 hover:text-white'}`}
                                                    >
                                                        Test Cases
                                                    </button>
                                                    <button 
                                                        onClick={() => setActiveConsoleTab('console')}
                                                        className={`py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeConsoleTab === 'console' ? 'border-[#EAFF20] text-[#EAFF20]' : 'border-transparent text-richblack-400 hover:text-white'}`}
                                                    >
                                                        <FaTerminal size={10} /> Test Result
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 py-1.5">
                                                    <button 
                                                        onClick={handleRunCode} 
                                                        className="bg-richblack-800 border border-richblack-700 hover:bg-richblack-700 text-[11px] px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-white shadow-sm"
                                                    >
                                                        <VscPlay /> Run Code
                                                    </button>
                                                    <button 
                                                        onClick={handleSaveAndNext}
                                                        className="bg-[#EAFF20] hover:bg-[#d5eb1b] text-black text-[11px] px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(234,255,32,0.2)]"
                                                    >
                                                        <VscCheck /> Submit Solution
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                                {activeConsoleTab === 'testcases' ? (
                                                    <div className="flex flex-col h-full gap-2">
                                                        <label className="text-xs font-bold text-richblack-300">Custom Input</label>
                                                        <textarea 
                                                            value={customInput}
                                                            onChange={(e) => setCustomInput(e.target.value)}
                                                            className="flex-1 bg-richblack-950 border border-richblack-800 rounded-lg p-3 text-sm font-mono text-white resize-none outline-none focus:border-[#EAFF20]/50 transition-colors"
                                                            placeholder="Enter custom input to test your code..."
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col h-full gap-2">
                                                        {consoleOutput === 'Executing test cases...' ? (
                                                            <div className="flex items-center gap-3 text-richblack-300 text-sm p-2">
                                                                <div className="w-4 h-4 border-2 border-richblack-600 border-t-[#EAFF20] rounded-full animate-spin"></div>
                                                                Running against test cases...
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <label className="text-xs font-bold text-richblack-300">Execution Output</label>
                                                                <pre className={`bg-richblack-950 border border-richblack-800 rounded-lg p-3 text-sm font-mono flex-1 overflow-auto ${consoleOutput.includes('Error') || consoleOutput.includes('failed') ? 'text-pink-400' : 'text-caribbeangreen-200'}`}>
                                                                    {consoleOutput || 'Click "Run Code" to compile and execute your solution.'}
                                                                </pre>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dynamic Right Sidebar - Notes Only */}
                            {showSidebar && activeProblem.type === 'MCQ' && (
                                <div className={`w-[38%] flex flex-col p-6 space-y-6 overflow-y-auto shrink-0 transition-colors duration-300 ${currentStyle.sideBg}`}>
                                    
                                    {/* Personal Notes Card Section */}
                                    <div className="space-y-4 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 text-xs font-bold text-richblack-300">
                                            <FaRegStickyNote />
                                            <span>PERSONAL NOTES</span>
                                        </div>
                                        <div className={`p-4 rounded-xl border flex-1 flex flex-col relative ${currentStyle.cardBg}`}>
                                            <textarea
                                                placeholder="Write your notes here..."
                                                value={notes[activeProblem._id] || ""}
                                                onChange={(e) => handleNoteChange(activeProblem._id, e.target.value)}
                                                className={`w-full flex-1 bg-transparent text-[11px] border-0 outline-none resize-none leading-relaxed ${currentStyle.notesArea}`}
                                            />
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-richblack-800/40 text-[9px] text-richblack-500">
                                                <span>Auto-saved locally</span>
                                                <VscSymbolMethod />
                                            </div>
                                        </div>
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
        </motion.div>
    );
};

export default ContestWorkspace;
