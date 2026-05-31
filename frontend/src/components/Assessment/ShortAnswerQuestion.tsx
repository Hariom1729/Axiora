import React from 'react';
import { ShortAnswerQuestion, useAssessmentStore } from '../../store/assessmentStore';

interface Props {
  question: ShortAnswerQuestion;
}

const ShortAnswerQuestionComponent: React.FC<Props> = ({ question }) => {
  const { answers, setAnswer } = useAssessmentStore();
  const currentAnswer = answers[question.id] || '';
  const MAX_CHARS = 100;

  return (
    <div className="flex flex-col h-full bg-richblack-900 text-richblack-25 p-6 md:p-10 rounded-xl border border-richblack-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-4xl mx-auto w-full">
      <div className="mb-8 border-b border-richblack-800 pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{question.title}</h2>
        <div className="prose prose-invert max-w-none text-richblack-300" dangerouslySetInnerHTML={{ __html: question.statement }} />
      </div>

      <div className="flex flex-col mt-4 relative">
        <label htmlFor={`short-answer-${question.id}`} className="text-richblack-100 mb-2 font-medium">
          Your Answer:
        </label>
        <input
          id={`short-answer-${question.id}`}
          type="text"
          value={currentAnswer}
          maxLength={MAX_CHARS}
          onChange={(e) => setAnswer(question.id, e.target.value)}
          placeholder="Type your short answer here..."
          className="w-full bg-richblack-950 border border-richblack-700 rounded-xl px-4 py-4 text-richblack-5 focus:outline-none focus:border-[#EAFF20] focus:ring-1 focus:ring-[#EAFF20] transition-colors"
        />
        <div className={`text-xs mt-2 text-right ${currentAnswer.length >= MAX_CHARS ? 'text-pink-400' : 'text-richblack-400'}`}>
          {currentAnswer.length} / {MAX_CHARS} characters
        </div>
      </div>
    </div>
  );
};

export default ShortAnswerQuestionComponent;
