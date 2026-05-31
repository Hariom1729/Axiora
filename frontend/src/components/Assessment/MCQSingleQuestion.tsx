import React from 'react';
import { MCQQuestion, useAssessmentStore } from '../../store/assessmentStore';

interface Props {
  question: MCQQuestion;
}

const MCQSingleQuestion: React.FC<Props> = ({ question }) => {
  const { answers, setAnswer } = useAssessmentStore();
  const currentAnswer = answers[question.id] || '';

  return (
    <div className="flex flex-col h-full bg-richblack-900 text-richblack-25 p-6 md:p-10 rounded-xl border border-richblack-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-4xl mx-auto w-full">
      <div className="mb-8 border-b border-richblack-800 pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{question.title}</h2>
        <div className="prose prose-invert max-w-none text-richblack-300" dangerouslySetInnerHTML={{ __html: question.statement }} />
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {question.options.map((option, idx) => (
          <label 
            key={idx} 
            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
              currentAnswer === option 
                ? 'bg-richblack-800 border-[#EAFF20]/50 shadow-[0_0_15px_rgba(234,255,32,0.1)]' 
                : 'bg-richblack-950 border-richblack-800 hover:bg-richblack-800 hover:border-richblack-700'
            }`}
          >
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-richblack-600">
              <input 
                type="radio" 
                name={`question-${question.id}`} 
                value={option}
                checked={currentAnswer === option}
                onChange={() => setAnswer(question.id, option)}
                className="opacity-0 absolute w-full h-full cursor-pointer"
              />
              {currentAnswer === option && (
                <div className="w-3 h-3 bg-[#EAFF20] rounded-full shadow-[0_0_8px_rgba(234,255,32,0.8)]" />
              )}
            </div>
            <span className={`text-base font-medium ${currentAnswer === option ? 'text-white' : 'text-richblack-100'}`}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default MCQSingleQuestion;
