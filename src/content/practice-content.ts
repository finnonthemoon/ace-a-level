import { QUADRATICS_TOPIC_CONTENT_ID } from "@/content/course-catalog";

export interface SingleChoiceQuestion {
  id: string;
  topicId: string;
  practiceSetId: string;
  prompt: string;
  options: readonly { id: string; content: string }[];
  correctAnswerId: string;
  explanation: string;
}

export interface PracticeSetDefinition {
  id: string;
  topicId: string;
  title: string;
  description: string;
  questionIds: readonly string[];
}

export const PRACTICE_SETS: readonly PracticeSetDefinition[] = [
  {
    id: "quadratics-foundations",
    topicId: QUADRATICS_TOPIC_CONTENT_ID,
    title: "Quadratics foundations",
    description: "Six questions on factorisation, roots and the quadratic formula.",
    questionIds: [
      "quadratics-factorise-roots-01",
      "quadratics-factorise-roots-02",
      "quadratics-roots-03",
      "quadratics-formula-04",
      "quadratics-formula-05",
      "quadratics-formula-06",
    ],
  },
];

export const PRACTICE_QUESTIONS: readonly SingleChoiceQuestion[] = [
  {
    id: "quadratics-factorise-roots-01",
    topicId: QUADRATICS_TOPIC_CONTENT_ID,
    practiceSetId: "quadratics-foundations",
    prompt: String.raw`Solve by factorising: \(x^2-7x+12=0\).`,
    options: [
      { id: "a", content: String.raw`\(x=3,\ 4\)` },
      { id: "b", content: String.raw`\(x=-3,\ -4\)` },
      { id: "c", content: String.raw`\(x=2,\ 6\)` },
      { id: "d", content: String.raw`\(x=-2,\ -6\)` },
    ],
    correctAnswerId: "a",
    explanation: String.raw`\(x^2-7x+12=(x-3)(x-4)\), so the roots are \(3\) and \(4\).`,
  },
  {
    id: "quadratics-factorise-roots-02",
    topicId: QUADRATICS_TOPIC_CONTENT_ID,
    practiceSetId: "quadratics-foundations",
    prompt: String.raw`Solve: \(x^2+x-12=0\).`,
    options: [
      { id: "a", content: String.raw`\(x=4,\ -3\)` },
      { id: "b", content: String.raw`\(x=-4,\ 3\)` },
      { id: "c", content: String.raw`\(x=2,\ -6\)` },
      { id: "d", content: String.raw`\(x=-2,\ 6\)` },
    ],
    correctAnswerId: "b",
    explanation: String.raw`\(x^2+x-12=(x+4)(x-3)\). Setting each factor to zero gives \(x=-4\) or \(x=3\).`,
  },
  {
    id: "quadratics-roots-03",
    topicId: QUADRATICS_TOPIC_CONTENT_ID,
    practiceSetId: "quadratics-foundations",
    prompt: String.raw`Find the roots of \((x-2)(x+5)=0\).`,
    options: [
      { id: "a", content: String.raw`\(x=-2,\ 5\)` },
      { id: "b", content: String.raw`\(x=2,\ 5\)` },
      { id: "c", content: String.raw`\(x=2,\ -5\)` },
      { id: "d", content: String.raw`\(x=-2,\ -5\)` },
    ],
    correctAnswerId: "c",
    explanation: String.raw`The factors give \(x-2=0\) or \(x+5=0\), so the roots are \(2\) and \(-5\).`,
  },
  {
    id: "quadratics-formula-04",
    topicId: QUADRATICS_TOPIC_CONTENT_ID,
    practiceSetId: "quadratics-foundations",
    prompt: String.raw`Use the quadratic formula to solve \(x^2-3x-1=0\).`,
    options: [
      { id: "a", content: String.raw`\(x=\frac{-3\pm\sqrt{13}}{2}\)` },
      { id: "b", content: String.raw`\(x=\frac{3\pm\sqrt{13}}{2}\)` },
      { id: "c", content: String.raw`\(x=\frac{3\pm\sqrt{5}}{2}\)` },
      { id: "d", content: String.raw`\(x=3,\ -1\)` },
    ],
    correctAnswerId: "b",
    explanation: String.raw`Here \(a=1\), \(b=-3\), and \(c=-1\). Thus \(x=\frac{3\pm\sqrt{9+4}}{2}=\frac{3\pm\sqrt{13}}{2}\).`,
  },
  {
    id: "quadratics-formula-05",
    topicId: QUADRATICS_TOPIC_CONTENT_ID,
    practiceSetId: "quadratics-foundations",
    prompt: String.raw`Solve \(2x^2+3x-2=0\) using the quadratic formula.`,
    options: [
      { id: "a", content: String.raw`\(x=2,\ -\frac{1}{2}\)` },
      { id: "b", content: String.raw`\(x=\frac{1}{2},\ -2\)` },
      { id: "c", content: String.raw`\(x=-\frac{1}{2},\ 2\)` },
      { id: "d", content: String.raw`\(x=1,\ -2\)` },
    ],
    correctAnswerId: "b",
    explanation: String.raw`Substitution gives \(x=\frac{-3\pm\sqrt{25}}{4}=\frac{-3\pm5}{4}\), so \(x=\frac{1}{2}\) or \(x=-2\).`,
  },
  {
    id: "quadratics-formula-06",
    topicId: QUADRATICS_TOPIC_CONTENT_ID,
    practiceSetId: "quadratics-foundations",
    prompt: String.raw`Use the quadratic formula to solve \(3x^2-2x-1=0\).`,
    options: [
      { id: "a", content: String.raw`\(x=\frac{1}{3},\ -1\)` },
      { id: "b", content: String.raw`\(x=-1,\ -\frac{1}{3}\)` },
      { id: "c", content: String.raw`\(x=1,\ -\frac{1}{3}\)` },
      { id: "d", content: String.raw`\(x=1,\ \frac{1}{3}\)` },
    ],
    correctAnswerId: "c",
    explanation: String.raw`The discriminant is \((-2)^2-4(3)(-1)=16\). Hence \(x=\frac{2\pm4}{6}\), giving \(x=1\) or \(x=-\frac{1}{3}\).`,
  },
];

export function findPracticeSet(practiceSetId: string) {
  return PRACTICE_SETS.find((practiceSet) => practiceSet.id === practiceSetId) ?? null;
}

export function findQuestions(questionIds: readonly string[]) {
  return questionIds.map((questionId) => PRACTICE_QUESTIONS.find((question) => question.id === questionId))
    .filter((question): question is SingleChoiceQuestion => Boolean(question));
}

