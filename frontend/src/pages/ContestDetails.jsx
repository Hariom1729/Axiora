import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../services/operations/authAPI';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
    FaChevronLeft, 
    FaShieldAlt, 
    FaCheck, 
    FaPlus, 
    FaMinus, 
    FaCalendarAlt, 
    FaClock, 
    FaUsers, 
    FaCode, 
    FaAward, 
    FaTrophy,
    FaGamepad,
    FaHourglassHalf
} from 'react-icons/fa';

const MagneticButton = ({ children, onClick, className, disabled }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    
    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        setPosition({ x: x * 0.35, y: y * 0.35 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
        setIsHovered(false);
    };

    return (
        <motion.button
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            disabled={disabled}
            animate={{ x: position.x, y: position.y }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={`relative overflow-hidden ${className}`}
        >
            {isHovered && (
                <motion.div
                    className="absolute pointer-events-none rounded-full bg-white/10 blur-md"
                    style={{
                        width: 120,
                        height: 120,
                        x: position.x * 2.5 - 60,
                        y: position.y * 2.5 - 60,
                        top: '50%',
                        left: '50%'
                    }}
                />
            )}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

const ContestDetails = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    
    const [contest, setContest] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRegistered: 0 });

    const [countdown, setCountdown] = useState({
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
        label: 'CHALLENGE ACTIVE • ENDS IN',
        active: false
    });

    const [openAccordion, setOpenAccordion] = useState(null);

    const fetchContestDetails = async () => {
        setLoading(true);
        try {
            const response = await apiConnector(
                "GET", 
                `${contestEndpoints.GET_CONTEST_DETAILS_API}${contestId}`,
                null,
                token ? { Authorization: `Bearer ${token}` } : null
            );
            if (response?.data?.success) {
                setContest(response.data.data);
                setIsRegistered(response.data.isRegistered);
                setIsCompleted(response.data.isCompleted || false);
                
                try {
                    const lbRes = await apiConnector("GET", `${contestEndpoints.GET_LEADERBOARD_API}${contestId}/leaderboard`);
                    if (lbRes?.data?.success) {
                        setStats({ totalRegistered: lbRes.data.totalRegistered || 0 });
                    }
                } catch (err) {
                    console.error("Failed to load registration counts:", err);
                }
            }
        } catch (error) {
            console.error("Fetch Contest Details Error:", error);
            if (error.response?.status === 401 && token) {
                toast.error("Session expired. Please login again.");
                dispatch(logout(navigate));
            } else {
                toast.error("Failed to load contest details");
            }
        }
        setLoading(false);
    };

    const handleRegister = async () => {
        if (!token) {
            toast.error("Please login to register for contests");
            navigate('/login');
            return;
        }
        try {
            const response = await apiConnector(
                "POST",
                `${contestEndpoints.REGISTER_CONTEST_API}${contestId}`,
                null,
                { Authorization: `Bearer ${token}` }
            );
            if (response?.data?.success) {
                toast.success("Successfully registered!");
                setIsRegistered(true);
                fetchContestDetails();
            } else {
                toast.error(response?.data?.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration Error:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                dispatch(logout(navigate));
            } else {
                toast.error(error.response?.data?.message || "Failed to register");
            }
        }
    };

    useEffect(() => {
        fetchContestDetails();
    }, [contestId]);

    // Countdown Timer logic
    useEffect(() => {
        if (!contest) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(contest.startTime).getTime();
            const end = new Date(contest.endTime).getTime();

            if (now < start) {
                const distance = start - now;
                const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
                const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
                setCountdown({ days, hours, minutes, seconds, label: 'CHALLENGE BEGINS IN', active: false });
            } else if (now >= start && now <= end) {
                const distance = end - now;
                const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
                const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
                setCountdown({ days, hours, minutes, seconds, label: 'CHALLENGE ACTIVE • ENDS IN', active: true });
            } else {
                setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00', label: 'CHALLENGE ENDED', active: false });
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111317] flex flex-col justify-center items-center text-richblack-400 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-300"></div>
                <p className="font-mono text-xs tracking-wider">RESOLVING ARENA CHANNELS...</p>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-[#111317] flex items-center justify-center text-white font-mono text-sm">
                FAILED TO LOCATE ARENA
            </div>
        );
    }

    const isRunning = contest.status === 'Running';
    const isUpcoming = contest.status === 'Upcoming';
    const isEnded = contest.status === 'Ended';

    const accordionData = [
        {
            title: "Platform Access",
            content: "You will join a secure environment linked directly to standard compilers. Accessing compiler rooms requires stable, verified credentials."
        },
        {
            title: "Submission Limits",
            content: "Participants can submit choices up to 3 times per problem. Only the highest score will be recognized for rank calculation."
        },
        {
            title: "Evaluation Criteria",
            content: "Dynamic evaluation evaluates test cases automatically. Score calculations compute total accuracy and final execution latency."
        },
        {
            title: "Code of Conduct",
            content: "Plagiarism, shared compiler access, or code manipulation will result in direct, permanent ban reports compiled by Axiora Guard."
        }
    ];

    return (
        <div className="min-h-screen bg-[#111317] text-white font-sans antialiased p-6 md:p-12 select-none">
            
            {/* Skeuomorphic Style Injections */}
            <style dangerouslySetInnerHTML={{__html: `
                .metal-container {
                    background: linear-gradient(180deg, #1f2228 0%, #111316 100%);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.6);
                }
                .metal-card {
                    background: linear-gradient(180deg, #1a1c21 0%, #0d0f11 100%);
                    border: 1.5px solid #2d3139;
                    box-shadow: inset 0 1px 0px rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0,0,0,0.3);
                }
                .metal-card-active {
                    background: linear-gradient(180deg, #22252c 0%, #15181b 100%);
                    border: 1.5px solid #3f4450;
                    box-shadow: 0 0 12px rgba(255, 255, 255, 0.05);
                }
                .bezel-frame {
                    background: #090a0d;
                    border: 1px solid #23272e;
                    box-shadow: inset 0 2px 5px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05);
                }
                .glowing-digit {
                    background: linear-gradient(180deg, #15181b 0%, #08090a 100%);
                    border: 1.5px solid #2a2e36;
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.8), 0 0 15px rgba(255, 255, 255, 0.04);
                    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
                }
                .glow-btn-primary {
                    background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%) !important;
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0,0,0,0.4);
                    color: #0d0f11 !important;
                }
                .glow-btn-primary:hover {
                    opacity: 0.95;
                    box-shadow: 0 0 25px rgba(255, 255, 255, 0.65), inset 0 2px 4px rgba(255, 255, 255, 0.8);
                }
                .glow-btn-secondary {
                    background: linear-gradient(180deg, #242830 0%, #13151b 100%);
                    border: 1px solid #3f4450;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 8px rgba(0,0,0,0.3);
                }
                .glow-btn-secondary:hover {
                    background: linear-gradient(180deg, #2d323c 0%, #171920 100%);
                    border-color: #555c6c;
                }
            `}} />

            <div className="w-11/12 max-w-6xl mx-auto mt-24">
                
                {/* Back to Arena Link */}
                <button 
                    onClick={() => navigate('/contests')}
                    className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-richblack-400 hover:text-white mb-8 transition-colors"
                >
                    <FaChevronLeft size={10} /> BACK TO ARENA LIST
                </button>

                {/* Grid Split: Main Arena Panel (Left) & Info widgets (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* LEFT MAIN PANEL (3 Columns) */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Header Details */}
                        <div className="space-y-1">
                            <span className="text-[10px] text-richblack-400 font-mono tracking-widest block">UID: 0X{contestId.slice(-4).toUpperCase()}</span>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize leading-tight">
                                {contest.title}
                            </h1>
                        </div>

                        {/* Countdown Bezel Box */}
                        <div className="metal-container rounded-2xl p-6 md:p-8 flex flex-col items-center">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-richblack-400 font-mono mb-4 uppercase">
                                {countdown.label}
                            </span>

                            {/* Bezel Segmented Countdown Cards */}
                            <div className="flex items-center gap-2 md:gap-4 font-mono text-white select-none">
                                <div className="flex flex-col items-center">
                                    <div className="glowing-digit text-3xl md:text-4xl font-extrabold rounded-xl px-4 py-3 min-w-[55px] md:min-w-[65px] text-center">
                                        {countdown.days}
                                    </div>
                                    <span className="text-[8px] text-richblack-500 font-bold uppercase tracking-wider mt-2">Days</span>
                                </div>
                                <span className="text-xl font-bold mb-4 text-richblack-600">:</span>
                                <div className="flex flex-col items-center">
                                    <div className="glowing-digit text-3xl md:text-4xl font-extrabold rounded-xl px-4 py-3 min-w-[55px] md:min-w-[65px] text-center">
                                        {countdown.hours}
                                    </div>
                                    <span className="text-[8px] text-richblack-500 font-bold uppercase tracking-wider mt-2">Hours</span>
                                </div>
                                <span className="text-xl font-bold mb-4 text-richblack-600">:</span>
                                <div className="flex flex-col items-center">
                                    <div className="glowing-digit text-3xl md:text-4xl font-extrabold rounded-xl px-4 py-3 min-w-[55px] md:min-w-[65px] text-center">
                                        {countdown.minutes}
                                    </div>
                                    <span className="text-[8px] text-richblack-500 font-bold uppercase tracking-wider mt-2">Minutes</span>
                                </div>
                                <span className="text-xl font-bold mb-4 text-richblack-600">:</span>
                                <div className="flex flex-col items-center">
                                    <div className="glowing-digit text-3xl md:text-4xl font-extrabold rounded-xl px-4 py-3 min-w-[55px] md:min-w-[65px] text-center">
                                        {countdown.seconds}
                                    </div>
                                    <span className="text-[8px] text-richblack-500 font-bold uppercase tracking-wider mt-2">Seconds</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons (Join / Leaderboard) */}
                        <div className="flex gap-4">
                            {isCompleted ? (
                                <MagneticButton
                                    onClick={() => navigate(`/contests/${contestId}/report`)}
                                    className="glow-btn-primary flex-1 py-3.5 rounded-xl font-bold transition-all text-center text-sm uppercase tracking-wider"
                                >
                                    View Performance Report
                                </MagneticButton>
                            ) : !isRegistered && !isEnded ? (
                                <MagneticButton
                                    onClick={handleRegister}
                                    className="glow-btn-primary flex-1 py-3.5 rounded-xl font-bold transition-all text-center text-sm uppercase tracking-wider"
                                >
                                    Join Challenge
                                </MagneticButton>
                            ) : isRegistered ? (
                                isUpcoming ? (
                                    <button
                                        disabled
                                        className="flex-1 py-3.5 rounded-xl font-bold bg-richblack-800 text-richblack-500 border border-white/[0.04] cursor-not-allowed text-center text-sm uppercase tracking-wider"
                                    >
                                        Joined (Waiting for launch)
                                    </button>
                                ) : isRunning ? (
                                    <MagneticButton
                                        onClick={() => navigate(`/contest-workspace/${contestId}`)}
                                        className="glow-btn-primary flex-1 py-3.5 rounded-xl font-bold transition-all text-center text-sm uppercase tracking-wider"
                                    >
                                        Enter Contest Workspace
                                    </MagneticButton>
                                ) : (
                                    <MagneticButton
                                        onClick={() => navigate(`/contests/${contestId}/report`)}
                                        className="glow-btn-primary flex-1 py-3.5 rounded-xl font-bold transition-all text-center text-sm uppercase tracking-wider"
                                    >
                                        View Performance Report
                                    </MagneticButton>
                                )
                            ) : (
                                <button
                                    disabled
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-richblack-800 text-richblack-500 border border-white/[0.04] cursor-not-allowed text-center text-sm uppercase tracking-wider"
                                >
                                    Challenge Closed
                                </button>
                            )}

                            <button
                                onClick={() => navigate(`/contests/${contestId}/leaderboard`)}
                                className="glow-btn-secondary py-3.5 px-6 rounded-xl font-bold text-white transition-all text-center text-sm uppercase tracking-wider font-mono"
                            >
                                Global Leaderboard
                            </button>
                        </div>

                        {/* Grid Parameters Row */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                            <div className="metal-card p-4 rounded-xl flex flex-col justify-between">
                                <span className="block text-[8px] text-richblack-400 font-bold uppercase tracking-wider font-mono">Start Time</span>
                                <span className="text-[10px] font-bold text-white mt-1.5 leading-snug">{new Date(contest.startTime).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
                            </div>
                            <div className="metal-card p-4 rounded-xl flex flex-col justify-between">
                                <span className="block text-[8px] text-richblack-400 font-bold uppercase tracking-wider font-mono">End Time</span>
                                <span className="text-[10px] font-bold text-white mt-1.5 leading-snug">{new Date(contest.endTime).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
                            </div>
                            <div className="metal-card p-4 rounded-xl flex flex-col justify-between">
                                <span className="block text-[8px] text-richblack-400 font-bold uppercase tracking-wider font-mono">Duration</span>
                                <span className="text-[10px] font-bold text-white mt-1.5 leading-snug">{contest.duration} Min</span>
                            </div>
                            <div className="metal-card p-4 rounded-xl flex flex-col justify-between">
                                <span className="block text-[8px] text-richblack-400 font-bold uppercase tracking-wider font-mono">Participants</span>
                                <span className="text-[10px] font-bold text-white mt-1.5 leading-snug">{stats.totalRegistered} Active</span>
                            </div>
                            <div className="metal-card p-4 rounded-xl flex flex-col justify-between">
                                <span className="block text-[8px] text-richblack-400 font-bold uppercase tracking-wider font-mono">Problems</span>
                                <span className="text-[10px] font-bold text-white mt-1.5 leading-snug">{contest.problems?.length || 0} Task{contest.problems?.length === 1 ? '' : 's'}</span>
                            </div>
                            <div className="metal-card p-4 rounded-xl flex flex-col justify-between">
                                <span className="block text-[8px] text-richblack-400 font-bold uppercase tracking-wider font-mono">Prize Pool</span>
                                <span className="text-[10px] font-bold text-yellow-100 mt-1.5 leading-snug">Badges & XP</span>
                            </div>
                        </div>

                        {/* Guidelines Accordion */}
                        <div className="metal-container rounded-2xl overflow-hidden">
                            <div className="p-5 border-b border-white/[0.06] bg-white/[0.02]">
                                <span className="text-xs font-mono text-richblack-300 font-bold uppercase tracking-wider">Guidelines</span>
                            </div>
                            <div className="divide-y divide-[#23272e]">
                                {accordionData.map((item, idx) => {
                                    const isOpen = openAccordion === idx;
                                    return (
                                        <div key={idx} className="w-full">
                                            <button
                                                onClick={() => toggleAccordion(idx)}
                                                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.01] transition-colors focus:outline-none"
                                            >
                                                <span className="text-sm font-semibold text-richblack-100">{item.title}</span>
                                                {isOpen ? <FaMinus size={10} className="text-richblack-300" /> : <FaPlus size={10} className="text-richblack-500" />}
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-5 pb-5 text-sm text-richblack-400 leading-relaxed font-sans font-medium">
                                                            {item.content}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Platform Integrity Card */}
                        <div className="metal-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#0d0f11] border border-[#2d3139] text-[#FF5A5F] rounded-xl flex items-center justify-center">
                                    <FaShieldAlt size={22} />
                                </div>
                                <div>
                                    <span className="block text-xs font-mono font-bold tracking-widest text-[#FF5A5F] uppercase">Platform Integrity</span>
                                    <span className="block text-xs text-richblack-400 mt-1 leading-relaxed max-w-md">
                                        AXIORA GUARD ensures secure execution and plagiarism detection under compliance parameters.
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] font-mono text-richblack-400 border-t md:border-t-0 border-white/[0.06] pt-4 md:pt-0">
                                <div className="flex items-center gap-2">
                                    <FaCheck className="text-emerald-400" size={10} />
                                    <span>Real-time Monitoring</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCheck className="text-emerald-400" size={10} />
                                    <span>Global Sync</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCheck className="text-emerald-400" size={10} />
                                    <span>Submission Validation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCheck className="text-emerald-400" size={10} />
                                    <span>Cheating Prevention</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (1 Column) - Widget Stack */}
                    <div className="space-y-6">
                        
                        {/* Widget 1: Challenges summary card */}
                        <div className="metal-container p-6 rounded-2xl flex flex-col justify-between h-[150px] relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-extrabold text-white font-mono">{contest.problems?.length || 0} Challenges</h3>
                                    <span className="text-[10px] text-richblack-400 font-bold uppercase tracking-wider block mt-1.5 font-mono">
                                        {contest.problems?.length > 1 ? 'Multi-tiered tasks' : 'Single assessment'}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-richblack-900 border border-white/[0.05] text-[#12D8FA]">
                                    <FaGamepad size={20} />
                                </div>
                            </div>
                            <div className="text-[11px] text-richblack-400 font-medium font-mono pt-4 border-t border-white/[0.04]">
                                Evaluated dynamically on-the-fly.
                            </div>
                        </div>

                        {/* Widget 2: Teams/Participants summary card */}
                        <div className="metal-container p-6 rounded-2xl flex flex-col justify-between h-[150px] relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-extrabold text-white font-mono">{stats.totalRegistered} Registered</h3>
                                    <span className="text-[10px] text-richblack-400 font-bold uppercase tracking-wider block mt-1.5 font-mono">
                                        Active Developers
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-richblack-900 border border-white/[0.05] text-[#10b981]">
                                    <FaUsers size={20} />
                                </div>
                            </div>
                            <div className="text-[11px] text-richblack-400 font-medium font-mono pt-4 border-t border-white/[0.04]">
                                Real-time leaderboard compilation.
                            </div>
                        </div>

                        {/* Widget 3: Prize / Certification Reward Glow card */}
                        <div className="metal-container p-6 rounded-2xl border-2 border-yellow-50/20 shadow-[0_0_20px_rgba(255,214,10,0.03)] flex flex-col justify-between h-[180px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 opacity-[0.02] rounded-full blur-2xl pointer-events-none" />
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-xl bg-[#090a0d] border border-yellow-50/10 text-yellow-50">
                                    <FaTrophy size={20} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold font-mono tracking-widest text-yellow-50 uppercase">Exclusive Reward</h4>
                                <p className="text-sm font-extrabold text-white mt-1 uppercase leading-snug">
                                    Official Progress Certificate & Badge
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default ContestDetails;
