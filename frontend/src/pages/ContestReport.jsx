import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { contestEndpoints } from '../services/apis';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { VscChevronLeft, VscCloudDownload, VscVerified } from 'react-icons/vsc';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const ContestReport = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await apiConnector(
                    "GET",
                    `${contestEndpoints.GET_REPORT_API}${contestId}/report`,
                    null,
                    { Authorization: `Bearer ${token}` }
                );
                if (response?.data?.success) {
                    setReport(response.data.data);
                }
            } catch (error) {
                console.error("Fetch Report Error:", error);
                toast.error("Failed to load your performance report");
                navigate(-1);
            }
            setLoading(false);
        };
        fetchReport();
    }, [contestId]);

    const handleDownloadPDF = () => {
        const element = certificateRef.current;
        const opt = {
            margin:       0,
            filename:     `Axiora_Certificate_${report.contestTitle.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 3, // higher scale for crisp high-res printing
                useCORS: true, 
                backgroundColor: '#ffffff',
                logging: false,
                letterRendering: true
            },
            jsPDF:        { 
                unit: 'px', 
                format: [1000, 700], // matching landscape aspect ratio
                orientation: 'landscape' 
            }
        };

        const toastId = toast.loading("Downloading certificate...");
        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                toast.dismiss(toastId);
                toast.success("Certificate downloaded successfully!");
            })
            .catch((err) => {
                toast.dismiss(toastId);
                console.error("PDF generation failed:", err);
                toast.error("Could not download certificate");
            });
    };

    if (loading) {
        return <div className="text-white text-center mt-20">Generating your customized certificate...</div>;
    }

    if (!report) return null;

    return (
        <div className="w-11/12 max-w-4xl mx-auto text-white mt-10 p-6 min-h-screen">
            {/* Control Panel (Hidden on Print) */}
            <div className="flex justify-between items-center mb-8 no-print">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 bg-richblack-800 rounded-lg hover:bg-richblack-700 transition-colors flex items-center gap-2"
                >
                    <VscChevronLeft size={20} /> Back
                </button>
                <button 
                    onClick={handleDownloadPDF}
                    className="bg-yellow-50 text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-yellow-100 transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                    <VscCloudDownload size={20} /> Download PDF
                </button>
            </div>

            {/* Printable Certificate Template */}
            <motion.div 
                ref={certificateRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white text-black p-12 rounded-2xl relative border-8 border-double border-[#D4AF37] shadow-2xl overflow-hidden print-area"
                style={{ fontFamily: 'Georgia, serif' }}
            >
                {/* Watermark in background */}
                <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] font-bold text-center z-0"
                    style={{ fontSize: '7rem', transform: 'rotate(-30deg)', color: '#000000' }}
                >
                    AXIORA ASSESSMENT
                </div>

                {/* Certificate Core Content */}
                <div className="relative z-10 text-center space-y-6">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <VscVerified className="text-[#D4AF37]" size={42} />
                        <span className="text-sm font-sans font-bold tracking-widest text-richblack-600 uppercase">
                            Official Progress Report
                        </span>
                    </div>

                    <h1 className="text-5xl font-extrabold text-richblack-900 tracking-tight" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
                        Certificate of Completion
                    </h1>
                    
                    <p className="text-richblack-600 text-lg italic mt-4">
                        This document dynamically certifies that
                    </p>

                    <h2 className="text-4xl font-bold text-[#b58900] underline my-4" style={{ fontFamily: 'Brush Script MT, cursive, Georgia' }}>
                        {report.studentName}
                    </h2>

                    <p className="max-w-2xl mx-auto text-richblack-600 text-base leading-relaxed">
                        has successfully completed the online assessment and competitive programming challenge titled 
                        <strong className="text-black font-bold block text-xl mt-1 not-italic">"{report.contestTitle}"</strong>
                        held on {new Date(report.contestDate).toLocaleDateString()} under supervision of the Axiora Engine.
                    </p>

                    {/* Progress Score Table Card */}
                    <div className="my-8 max-w-xl mx-auto border border-richblack-200 rounded-xl overflow-hidden bg-richblack-5/20 backdrop-blur-sm">
                        <div className="grid grid-cols-3 bg-[#b58900]/10 text-[#b58900] font-sans font-bold text-xs py-3 border-b border-richblack-200 uppercase tracking-wider">
                            <div>Overall Rank</div>
                            <div>Score Earned</div>
                            <div>Questions Solved</div>
                        </div>
                        <div className="grid grid-cols-3 font-sans font-extrabold text-2xl py-4 text-richblack-900">
                            <div>#{report.rank}</div>
                            <div>{report.score}</div>
                            <div>{report.solvedCount} / {report.totalQuestions}</div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-16 pt-8 border-t border-richblack-100 max-w-2xl mx-auto">
                        <div className="text-left">
                            <span className="block font-sans text-xs font-bold text-richblack-400 uppercase">Verification ID</span>
                            <span className="font-mono text-xs text-richblack-600">AX-{contestId.slice(-6).toUpperCase()}-{report.studentName.slice(0,3).toUpperCase()}</span>
                        </div>
                        <div className="text-right">
                            <div className="w-40 border-b border-richblack-400 mx-auto"></div>
                            <span className="block font-sans text-xs font-bold text-richblack-600 uppercase mt-2">Axiora Evaluator</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Custom Print Media Styling */}
            <style dangerouslySetInnerHTML={{__html: `
                @page {
                    size: landscape;
                    margin: 0;
                }
                @media print {
                    nav, header, footer, .no-print, button {
                        display: none !important;
                    }
                    body, html {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100% !important;
                        width: 100% !important;
                    }
                    .print-area {
                        border: 8px border-double border-[#D4AF37] !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        padding: 40px !important;
                        margin: 1.5cm !important;
                        width: calc(100vw - 3cm) !important;
                        height: calc(100vh - 3cm) !important;
                        box-sizing: border-box !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important;
                        page-break-inside: avoid !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                    }
                }
            `}} />
        </div>
    );
};

export default ContestReport;
