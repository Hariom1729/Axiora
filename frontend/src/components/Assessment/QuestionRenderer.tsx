import React from 'react';
import { Question } from '../../store/assessmentStore';
import CodingQuestion from './CodingQuestion';
import MCQSingleQuestion from './MCQSingleQuestion';
import MCQMultipleQuestion from './MCQMultipleQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import EssayQuestion from './EssayQuestion';

interface QuestionRendererProps {
  question: Question;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question }) => {
  switch (question.type) {
    case 'coding':
      return <CodingQuestion question={question as any} />;
    case 'mcq_single':
      return <MCQSingleQuestion question={question as any} />;
    case 'mcq_multiple':
      return <MCQMultipleQuestion question={question as any} />;
    case 'true_false':
      return <TrueFalseQuestion question={question as any} />;
    case 'short_answer':
      return <ShortAnswerQuestion question={question as any} />;
    case 'essay':
      return <EssayQuestion question={question as any} />;
    default:
      return <div className="text-white p-4">Unsupported question type</div>;
  }
};

export default QuestionRenderer;
