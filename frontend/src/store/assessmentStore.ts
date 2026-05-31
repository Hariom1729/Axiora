import { create } from 'zustand';

export type QuestionType = 'coding' | 'mcq_single' | 'mcq_multiple' | 'true_false' | 'short_answer' | 'essay';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  statement: string;
  marks: number;
}

export interface CodingQuestion extends BaseQuestion {
  type: 'coding';
  constraints: string;
  examples: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq_single' | 'mcq_multiple';
  options: string[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
}

export type Question = CodingQuestion | MCQQuestion | TrueFalseQuestion | ShortAnswerQuestion | EssayQuestion;

interface AssessmentState {
  questions: Question[];
  answers: Record<string, any>;
  markedForReview: Record<string, boolean>;
  currentQuestionIndex: number;
  timeLeft: number;
  isSubmitted: boolean;
  
  setQuestions: (questions: Question[]) => void;
  setAnswer: (questionId: string, answer: any) => void;
  toggleMarkForReview: (questionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  setTimeLeft: (time: number) => void;
  submitAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  questions: [],
  answers: {},
  markedForReview: {},
  currentQuestionIndex: 0,
  timeLeft: 3600, // Default 1 hour
  isSubmitted: false,

  setQuestions: (questions) => set({ questions }),
  
  setAnswer: (questionId, answer) => set((state) => ({
    answers: { ...state.answers, [questionId]: answer }
  })),

  toggleMarkForReview: (questionId) => set((state) => ({
    markedForReview: { ...state.markedForReview, [questionId]: !state.markedForReview[questionId] }
  })),

  nextQuestion: () => set((state) => ({
    currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1)
  })),

  prevQuestion: () => set((state) => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
  })),

  goToQuestion: (index) => set({ currentQuestionIndex: index }),

  setTimeLeft: (timeLeft) => set({ timeLeft }),

  submitAssessment: () => set({ isSubmitted: true }),
}));
