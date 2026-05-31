import React, { useEffect } from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';
import QuestionRenderer from './QuestionRenderer';

const AssessmentLayout: React.FC = () => {
  const { 
    questions, 
    currentQuestionIndex, 
    nextQuestion, 
    prevQuestion, 
    goToQuestion,
    answers,
    markedForReview,
    toggleMarkForReview,
    timeLeft,
    setTimeLeft,
    isSubmitted,
    submitAssessment
  } = useAssessmentStore();

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(timeLeft > 0 ? timeLeft - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  if (questions.length === 0) {
    return <div className="min-h-screen bg-richblack-900 flex items-center justify-center text-white">Loading Assessment...</div>;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-richblack-900 flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-4xl font-bold text-[#EAFF20] mb-4">Assessment Submitted!</h1>
        <p className="text-richblack-300 text-lg">Thank you. Your responses have been recorded successfully.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#0f1115] font-inter flex flex-col">
      {/* Header */}
      <header className="h-16 bg-richblack-900 border-b border-richblack-800 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-white tracking-wider">LEARNHUB <span className="text-[#EAFF20]">ASSESS</span></div>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-lg font-bold transition-colors ${timeLeft < 300 ? 'bg-pink-600/20 text-pink-400 border border-pink-500/50 animate-pulse' : 'bg-richblack-800 text-richblack-50'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(timeLeft)}
        </div>

        <button 
          onClick={submitAssessment}
          className="bg-pink-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-[0_0_15px_rgba(239,71,111,0.4)]"
        >
          Submit Assessment
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto w-full">
            <h1 className="text-xl font-semibold text-richblack-50">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h1>
            <div className="flex gap-4 items-center text-sm font-medium">
              <span className="text-richblack-300 bg-richblack-800 px-3 py-1 rounded-full border border-richblack-700">
                {currentQuestion.marks} Marks
              </span>
              <span className="text-caribbeangreen-200 bg-caribbeangreen-800/20 px-3 py-1 rounded-full border border-caribbeangreen-800">
                {currentQuestion.type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <QuestionRenderer question={currentQuestion} />
          </div>

          <div className="mt-8 flex justify-between items-center max-w-7xl mx-auto w-full bg-richblack-900 p-4 rounded-xl border border-richblack-800">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2.5 rounded-lg font-medium bg-richblack-800 text-richblack-100 hover:text-white hover:bg-richblack-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            
            <button
              onClick={() => toggleMarkForReview(currentQuestion.id)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                markedForReview[currentQuestion.id] 
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-600/30' 
                  : 'bg-richblack-800 text-richblack-100 hover:text-white hover:bg-richblack-700'
              }`}
            >
              {markedForReview[currentQuestion.id] ? 'Unmark Review' : 'Mark for Review'}
            </button>

            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-8 py-2.5 rounded-lg font-semibold bg-[#EAFF20] text-black hover:bg-[#d6eb1d] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(234,255,32,0.3)]"
            >
              Save & Next
            </button>
          </div>
        </main>

        {/* Right Sidebar: Palette */}
        <aside className="w-80 bg-richblack-900 border-l border-richblack-800 p-6 flex flex-col hidden lg:flex">
          <h3 className="text-lg font-bold text-white mb-6 tracking-wide border-b border-richblack-800 pb-3">Question Palette</h3>
          
          <div className="grid grid-cols-4 gap-3 mb-8">
            {questions.map((q, idx) => {
              const isCurrent = currentQuestionIndex === idx;
              const isAnswered = answers[q.id] && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : String(answers[q.id]).trim() !== '');
              const isMarked = markedForReview[q.id];
              
              let bgColor = 'bg-richblack-800 text-richblack-100 border-richblack-700'; // unattempted
              if (isCurrent) bgColor = 'bg-richblack-50 text-richblack-900 border-white ring-2 ring-white/20'; // active
              else if (isMarked && isAnswered) bgColor = 'bg-yellow-600 text-white border-yellow-500 shadow-[0_0_10px_rgba(202,138,4,0.5)]'; // marked and answered
              else if (isMarked) bgColor = 'bg-yellow-900/40 text-yellow-500 border-yellow-700'; // marked but unattempted
              else if (isAnswered) bgColor = 'bg-caribbeangreen-600 text-white border-caribbeangreen-500 shadow-[0_0_10px_rgba(5,167,130,0.5)]'; // answered

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border transition-all hover:scale-105 ${bgColor}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="space-y-4 mt-auto border-t border-richblack-800 pt-6">
            <div className="flex items-center gap-3 text-sm text-richblack-100 font-medium">
              <div className="w-6 h-6 rounded bg-caribbeangreen-600 border border-caribbeangreen-500"></div>
              Answered
            </div>
            <div className="flex items-center gap-3 text-sm text-richblack-100 font-medium">
              <div className="w-6 h-6 rounded bg-yellow-600 border border-yellow-500"></div>
              Marked for Review
            </div>
            <div className="flex items-center gap-3 text-sm text-richblack-100 font-medium">
              <div className="w-6 h-6 rounded bg-richblack-800 border border-richblack-700"></div>
              Unattempted
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AssessmentLayout;
