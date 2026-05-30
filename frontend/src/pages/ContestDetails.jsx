import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ContestDetails = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [contest, setContest] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');

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
            }
        } catch (error) {
            console.error("Fetch Contest Details Error:", error);
            toast.error("Failed to load contest details");
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
            toast.error(error.response?.data?.message || "Failed to register");
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
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`Starts in: ${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else if (now >= start && now <= end) {
                const distance = end - now;
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`Contest active! Ends in: ${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft('Contest has ended');
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    if (loading) {
        return <div className="text-white text-center mt-20">Loading contest details dynamically...</div>;
    }

    if (!contest) {
        return <div className="text-white text-center mt-20">Contest not found</div>;
    }

    const isRunning = contest.status === 'Running';
    const isUpcoming = contest.status === 'Upcoming';
    const isEnded = contest.status === 'Ended';

    return (
        <div className="w-11/12 max-w-maxContent mx-auto text-white mt-10 p-6 min-h-[calc(100vh-3.5rem)]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-richblack-800 p-8 rounded-2xl border border-richblack-700 max-w-3xl mx-auto space-y-6"
            >
                <div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase">
                        {contest.type}
                    </span>
                    <h1 className="text-4xl font-bold mt-3 mb-2">{contest.title}</h1>
                    <p className="text-richblack-300 text-lg">{contest.description}</p>
                </div>

                <div className="bg-richblack-900 p-4 rounded-xl border border-richblack-700 text-center">
                    <p className="text-yellow-50 text-xl font-bold tracking-wider font-mono">{timeLeft}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm border-t border-b border-richblack-700 py-6">
                    <div>
                        <p className="text-richblack-400">START TIME</p>
                        <p className="font-semibold mt-1">{new Date(contest.startTime).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-richblack-400">END TIME</p>
                        <p className="font-semibold mt-1">{new Date(contest.endTime).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-richblack-400">DURATION</p>
                        <p className="font-semibold mt-1">{contest.duration} Minutes</p>
                    </div>
                </div>

                {contest.rules && (
                    <div>
                        <h2 className="text-xl font-bold mb-2">Rules & Regulations</h2>
                        <p className="text-richblack-300 whitespace-pre-line">{contest.rules}</p>
                    </div>
                )}

                <div className="pt-4">
                    {isCompleted ? (
                        <button
                            onClick={() => navigate(`/contests/${contestId}/report`)}
                            className="w-full bg-yellow-50 text-black font-bold py-3 rounded-lg hover:bg-yellow-100 transition-all text-center"
                        >
                            View & Download Performance Certificate
                        </button>
                    ) : !isRegistered && !isEnded ? (
                        <button
                            onClick={handleRegister}
                            className="w-full bg-yellow-50 text-black font-bold py-3 rounded-lg hover:bg-yellow-100 transition-all text-center"
                        >
                            Register for Contest
                        </button>
                    ) : isRegistered ? (
                        isUpcoming ? (
                            <button
                                disabled
                                className="w-full bg-richblack-700 text-richblack-300 font-bold py-3 rounded-lg cursor-not-allowed text-center"
                            >
                                Registered (Waiting for start)
                            </button>
                        ) : isRunning ? (
                            <button
                                onClick={() => navigate(`/contest-workspace/${contestId}`)}
                                className="w-full bg-caribbeangreen-400 text-black font-bold py-3 rounded-lg hover:bg-caribbeangreen-300 transition-all text-center"
                            >
                                Enter Contest Workspace
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/contests/${contestId}/report`)}
                                className="w-full bg-yellow-50 text-black font-bold py-3 rounded-lg hover:bg-yellow-100 transition-all text-center"
                            >
                                View & Download Performance Certificate
                            </button>
                        )
                    ) : (
                        <button
                            disabled
                            className="w-full bg-richblack-700 text-richblack-300 font-bold py-3 rounded-lg cursor-not-allowed text-center"
                        >
                            Contest Closed
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ContestDetails;
