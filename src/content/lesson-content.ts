import { ALGEBRAIC_VOCABULARY_TOPIC_CONTENT_ID, QUADRATICS_TOPIC_CONTENT_ID } from "@/content/course-catalog";

export type LessonBlock =
  | { type: "section-heading"; text: string }
  | { type: "text"; content: string }
  | { type: "math"; expression: string }
  | { type: "callout"; title: string; content: string }
  | { type: "warning"; title: string; content: string }
  | { type: "worked-example"; title: string; question: string; steps: readonly string[]; answer: string }
  | {
      type: "check";
      id: string;
      prompt: string;
      options: readonly { id: string; content: string }[];
      correctOptionId: string;
      explanation: string;
    };

export interface LessonDefinition {
  id: string;
  topicId: string;
  courseLabel: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  blocks: readonly LessonBlock[];
}

export const LESSONS: readonly LessonDefinition[] = [
  {
    id: "algebraic-vocabulary-notation",
    topicId: ALGEBRAIC_VOCABULARY_TOPIC_CONTENT_ID,
    courseLabel: "Pure Mathematics",
    title: "Algebraic vocabulary & notation",
    description: "Read, write and interpret algebraic expressions with confidence.",
    estimatedMinutes: 6,
    blocks: [
      { type: "section-heading", text: "Expressions, terms and factors" },
      { type: "text", content: String.raw`An algebraic expression combines numbers, variables and operations. A variable is a letter that represents a number. Terms are separated by addition or subtraction, while factors are multiplied together.` },
      { type: "math", expression: String.raw`3x^2-5x+2` },
      { type: "callout", title: "Read the structure", content: "The expression above has three terms: \\(3x^2\\), \\(-5x\\) and \\(2\\). In the first term, the factors are \\(3\\), \\(x\\) and \\(x\\)." },

      { type: "section-heading", text: "Coefficients and like terms" },
      { type: "text", content: "A coefficient is the numerical factor multiplying a variable. In \\(-4y\\), the coefficient is \\(-4\\); in \\(y\\), it is \\(1\\). Like terms have the same variable part, including the same powers, so only like terms can be collected." },
      { type: "worked-example", title: "Collect like terms", question: "Simplify \\(4a+3b-2a+5b\\).", steps: ["Group matching variable parts: \\(4a-2a+3b+5b\\).", "Add the coefficients of each group: \\((4-2)a+(3+5)b\\)."], answer: "\\(2a+8b\\)" },
      { type: "warning", title: "Keep unlike terms separate", content: "\\(2a+3b\\) cannot be simplified to \\(5ab\\). Addition does not turn different variables into a product." },

      { type: "section-heading", text: "Writing and evaluating expressions" },
      { type: "text", content: "In algebra, multiplication signs are often omitted: \\(4\\times x\\) is written \\(4x\\), and \\(a\\times b\\) is written \\(ab\\). Powers show repeated multiplication, so \\(x^3=x\\times x\\times x\\). To evaluate an expression, substitute the given value everywhere the variable appears, then follow the order of operations." },
      { type: "worked-example", title: "Substitute carefully", question: "Evaluate \\(2x^2-3x\\) when \\(x=-2\\).", steps: ["Replace every \\(x\\) with \\(-2\\): \\(2(-2)^2-3(-2)\\).", "Evaluate the power first: \\(2(4)+6\\)."], answer: "\\(14\\)" },

      { type: "section-heading", text: "Quick checks" },
      { type: "check", id: "algebraic-vocabulary-notation-check-01", prompt: "What is the coefficient of \\(x\\) in \\(7-3x+2x^2\\)?", options: [{ id: "a", content: "\\(3\\)" }, { id: "b", content: "\\(-3\\)" }, { id: "c", content: "\\(2\\)" }], correctOptionId: "b", explanation: "The \\(x\\)-term is \\(-3x\\), so its coefficient is \\(-3\\)." },
      { type: "check", id: "algebraic-vocabulary-notation-check-02", prompt: "Which pair are like terms?", options: [{ id: "a", content: "\\(4m\\) and \\(4m^2\\)" }, { id: "b", content: "\\(3p\\) and \\(-8p\\)" }, { id: "c", content: "\\(2x\\) and \\(2y\\)" }], correctOptionId: "b", explanation: "Both terms have exactly the same variable part, \\(p\\), to the same power." },
      { type: "check", id: "algebraic-vocabulary-notation-check-03", prompt: "Evaluate \\(x^2+2x\\) when \\(x=-3\\).", options: [{ id: "a", content: "\\(3\\)" }, { id: "b", content: "\\(15\\)" }, { id: "c", content: "\\(-3\\)" }], correctOptionId: "a", explanation: "\\((-3)^2+2(-3)=9-6=3\\). Remember to square the negative value using brackets." },
      { type: "callout", title: "Key ideas", content: "Terms are joined by \\(+\\) or \\(-\\); coefficients multiply variables; collect only like terms; and use brackets when substituting a negative value." },
    ],
  },
  {
    id: "quadratics-solving-equations",
    topicId: QUADRATICS_TOPIC_CONTENT_ID,
    courseLabel: "Pure Mathematics",
    title: "Solving quadratic equations",
    description: "Solve quadratic equations and understand what their roots tell you.",
    estimatedMinutes: 8,
    blocks: [
      { type: "section-heading", text: "What is a quadratic equation?" },
      {
        type: "text",
        content: String.raw`A quadratic equation has a highest power of 2. In standard form it is \(ax^2+bx+c=0\), where \(a\ne0\). Solving means finding the value or values of \(x\) that make the equation true.`,
      },
      { type: "math", expression: String.raw`ax^2+bx+c=0,\qquad a\ne0` },

      { type: "section-heading", text: "Solving by factorisation" },
      {
        type: "text",
        content: String.raw`If the quadratic factorises, use the zero-product rule: if two factors multiply to zero, at least one factor must be zero.`,
      },
      {
        type: "worked-example",
        title: "Factorise and solve",
        question: String.raw`Solve \(x^2-5x+6=0\).`,
        steps: [
          String.raw`Find two numbers that multiply to \(6\) and add to \(-5\): \(-2\) and \(-3\).`,
          String.raw`Factorise: \((x-2)(x-3)=0\).`,
          String.raw`Set each factor to zero: \(x-2=0\) or \(x-3=0\).`,
        ],
        answer: String.raw`The roots are \(x=2\) and \(x=3\).`,
      },

      { type: "section-heading", text: "When factorisation does not work" },
      {
        type: "text",
        content: String.raw`Some quadratics do not factorise neatly. Write the equation in standard form, then use the quadratic formula. The discriminant \(b^2-4ac\) helps predict the number of real roots.`,
      },
      {
        type: "warning",
        title: "Watch the signs",
        content: String.raw`In \(ax^2+bx+c=0\), \(b\) includes its sign. For example, in \(x^2-5x+6=0\), \(b=-5\).`,
      },

      { type: "section-heading", text: "Using the quadratic formula" },
      {
        type: "text",
        content: String.raw`Identify \(a\), \(b\), and \(c\) in standard form, then substitute them carefully.`,
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

      { type: "section-heading", text: "Interpreting the roots" },
      {
        type: "text",
        content: String.raw`The roots are the solutions to the equation and the \(x\)-coordinates where its graph meets the \(x\)-axis. The discriminant tells you how many real roots to expect.`,
      },
      {
        type: "callout",
        title: "The discriminant and the roots",
        content: String.raw`If \(b^2-4ac>0\), there are two real roots. If \(b^2-4ac=0\), there is one repeated real root. If \(b^2-4ac<0\), there are no real roots.`,
      },

      { type: "section-heading", text: "Quick check and summary" },
      {
        type: "check",
        id: "quadratics-solving-equations-check-01",
        prompt: String.raw`Solve \(x^2-7x+12=0\). Choose the pair of roots.`,
        options: [
          { id: "a", content: String.raw`\(x=3,\ 4\)` },
          { id: "b", content: String.raw`\(x=-3,\ -4\)` },
          { id: "c", content: String.raw`\(x=2,\ 6\)` },
        ],
        correctOptionId: "a",
        explanation: String.raw`\(x^2-7x+12=(x-3)(x-4)\). Setting each factor to zero gives \(x=3\) or \(x=4\).`,
      },
      {
        type: "callout",
        title: "Remember",
        content: "Set the equation equal to zero, choose a suitable method, and check that each root satisfies the original equation.",
      },
    ],
  },
];

export function findLesson(lessonId: string) {
  return LESSONS.find((lesson) => lesson.id === lessonId) ?? null;
}
