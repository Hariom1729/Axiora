import React from 'react';
import { EssayQuestion, useAssessmentStore } from '../../store/assessmentStore';

interface Props {
  question: EssayQuestion;
}

const EssayQuestionComponent: React.FC<Props> = ({ question }) => {
  const { answers, setAnswer } = useAssessmentStore();
  const currentAnswer = answers[question.id] || '';
  
  const wordCount = currentAnswer.trim() === '' ? 0 : currentAnswer.trim().split(/\s+/).length;

  return (
    <div className="flex flex-col h-full bg-richblack-900 text-richblack-25 p-6 md:p-10 rounded-xl border border-richblack-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-4xl mx-auto w-full">
      <div className="mb-6 border-b border-richblack-800 pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{question.title}</h2>
        <div className="prose prose-invert max-w-none text-richblack-300" dangerouslySetInnerHTML={{ __html: question.statement }} />
      </div>

      <div className="flex flex-col flex-1 relative">
        <label htmlFor={`essay-answer-${question.id}`} className="text-richblack-100 mb-2 font-medium flex justify-between">
          <span>Your Answer:</span>
          <span className="text-xs text-richblack-400 font-normal">Auto-saved</span>
        </label>
        <textarea
          id={`essay-answer-${question.id}`}
          value={currentAnswer}
          onChange={(e) => setAnswer(question.id, e.target.value)}
          placeholder="Write your detailed answer here..."
          className="w-full h-64 md:h-80 resize-y bg-richblack-950 border border-richblack-700 rounded-xl p-4 text-richblack-5 focus:outline-none focus:border-[#EAFF20] focus:ring-1 focus:ring-[#EAFF20] transition-colors leading-relaxed"
        />
        <div className="flex justify-between items-center mt-3">
          <div className="text-sm text-richblack-400">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayQuestionComponent;
