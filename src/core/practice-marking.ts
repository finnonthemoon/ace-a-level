import type { SingleChoiceQuestion } from "@/content/practice-content";

export interface SingleChoiceMark {
  correct: boolean;
  explanation: string;
  correctAnswerId: string;
}

export function markSingleChoice(question: SingleChoiceQuestion, submittedAnswerId: string): SingleChoiceMark {
  return {
    correct: submittedAnswerId === question.correctAnswerId,
    explanation: question.explanation,
    correctAnswerId: question.correctAnswerId,
  };
}
