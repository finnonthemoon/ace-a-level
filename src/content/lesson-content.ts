import { QUADRATICS_TOPIC_CONTENT_ID } from "@/content/course-catalog";

export type LessonBlock =
  | { type: "heading"; text: string }
  | { type: "text"; content: string }
  | { type: "math"; expression: string }
  | { type: "callout"; title: string; content: string }
  | { type: "worked-example"; title: string; question: string; steps: readonly string[]; answer: string }
  | { type: "check"; prompt: string; options: readonly { id: string; content: string }[]; correctOptionId: string; explanation: string };

export interface LessonDefinition {
  id: string;
  topicId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  blocks: readonly LessonBlock[];
}

export const LESSONS: readonly LessonDefinition[] = [
  {
    id: "quadratics-solving-equations",
    topicId: QUADRATICS_TOPIC_CONTENT_ID,
    title: "Solving quadratic equations",
    description: "Learn what roots mean and solve quadratics by factorisation and the quadratic formula.",
    estimatedMinutes: 8,
    blocks: [
      { type: "heading", text: "What is a quadratic?" },
      {
        type: "text",
        content: String.raw`A quadratic equation has a highest power of 2. In standard form it is \(ax^2+bx+c=0\), where \(a\ne0\). Solving means finding the value or values of \(x\) that make the equation true.`,
      },
      { type: "math", expression: String.raw`ax^2+bx+c=0,\qquad a\ne0` },
      {
        type: "callout",
        title: "Roots are x-intercepts",
        content: "A solution, or root, is an x-value where the corresponding graph y = ax² + bx + c meets the x-axis.",
      },
      { type: "heading", text: "Solve by factorisation" },
      {
        type: "text",
        content: "When a quadratic factorises, use the zero-product rule: if two factors multiply to zero, at least one factor must be zero.",
      },
      {
        type: "worked-example",
        title: "Factorise and solve",
        question: String.raw`Solve \(x^2-5x+6=0\).`,
        steps: [
          String.raw`Find two numbers that multiply to \(6\) and add to \(-5\): they are \(-2\) and \(-3\).`,
          String.raw`Factorise: \((x-2)(x-3)=0\).`,
          String.raw`Set each factor to zero: \(x-2=0\) or \(x-3=0\).`,
        ],
        answer: String.raw`So the roots are \(x=2\) and \(x=3\).`,
      },
      { type: "heading", text: "Use the quadratic formula" },
      {
        type: "text",
        content: String.raw`If a quadratic does not factorise easily, identify \(a\), \(b\), and \(c\) in standard form and substitute them into the formula.`,
      },
      { type: "math", expression: String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}` },
      {
        type: "worked-example",
        title: "Apply the formula",
        question: String.raw`Solve \(2x^2+x-3=0\).`,
        steps: [
          String.raw`Here \(a=2\), \(b=1\), and \(c=-3\).`,
          String.raw`Substitute: \(x=\frac{-1\pm\sqrt{1^2-4(2)(-3)}}{2(2)}\).`,
          String.raw`Simplify: \(x=\frac{-1\pm5}{4}\).`,
        ],
        answer: String.raw`The roots are \(x=1\) and \(x=-\frac{3}{2}\).`,
      },
      {
        type: "check",
        prompt: String.raw`For \((x-4)(x+1)=0\), which pair gives the roots?`,
        options: [
          { id: "a", content: String.raw`\(4,\ -1\)` },
          { id: "b", content: String.raw`\(-4,\ 1\)` },
          { id: "c", content: String.raw`\(4,\ 1\)` },
        ],
        correctOptionId: "a",
        explanation: "Set each factor equal to zero: x − 4 = 0 gives x = 4, and x + 1 = 0 gives x = −1.",
      },
      {
        type: "callout",
        title: "Check your roots",
        content: "Substitute each solution back into the original equation. A root should make the left-hand side equal zero.",
      },
    ],
  },
];

export function findLesson(lessonId: string) {
  return LESSONS.find((lesson) => lesson.id === lessonId) ?? null;
}

