import { findCourseLesson, type CourseLessonDefinition } from "@/content/course-catalog";

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

interface LessonBodyDefinition {
  id: string;
  blocks: readonly LessonBlock[];
}

export type LessonDefinition = CourseLessonDefinition & {
  topicId: string;
  topicTitle: string;
  areaTitle: string;
  courseLabel: string;
  blocks: readonly LessonBlock[];
};

export const LESSONS: readonly LessonBodyDefinition[] = [
  {
    id: "quadratics-solving-equations",
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
    ]
  },
  {
    id: "quadratics-solving-factorising",
    blocks: [
      { type: "section-heading", text: "Use factors to find roots" },
      { type: "text", content: String.raw`Write the quadratic as a product of linear factors. If the product is zero, at least one factor must be zero.` },
      { type: "math", expression: String.raw`\((x+p)(x+q)=0\quad\Longrightarrow\quad x=-p\text{ or }x=-q\)` },
      { type: "worked-example", title: "Factorise and solve", question: String.raw`Solve \(x^2+x-12=0\).`, steps: [String.raw`Find two numbers with product \(-12\) and sum \(1\): \(4\) and \(-3\).`, String.raw`Factorise: \((x+4)(x-3)=0\).`, String.raw`Set each factor to zero.`], answer: String.raw`\(x=-4\) or \(x=3\).` },
      { type: "section-heading", text: "Check your solutions" },
      { type: "callout", title: "Remember", content: "Expand the factors to check the factorisation, then substitute each root into the original equation." },
    ]
  },
  {
    id: "quadratics-completing-square",
    blocks: [
      { type: "section-heading", text: "Build a square" },
      { type: "text", content: String.raw`For \(x^2+bx+c\), take half the coefficient of \(x\), square it, and compensate to keep the expression unchanged.` },
      { type: "math", expression: String.raw`x^2+bx+c=\left(x+\frac b2\right)^2+c-\left(\frac b2\right)^2` },
      { type: "worked-example", title: "Rewrite and solve", question: String.raw`Solve \(x^2+6x+5=0\) by completing the square.`, steps: [String.raw`\(x^2+6x+5=(x+3)^2-4\).`, String.raw`Set \((x+3)^2=4\).`, String.raw`Take both square roots: \(x+3=\pm2\).`], answer: String.raw`\(x=-1\) or \(x=-5\).` },
      { type: "section-heading", text: "Use the form" },
      { type: "callout", title: "Vertex form", content: String.raw`The form \(a(x-h)^2+k\) also makes the turning point and minimum or maximum value visible.` },
    ]
  },
  {
    id: "quadratics-formula",
    blocks: [
      { type: "section-heading", text: "Apply the formula" },
      { type: "text", content: "When a quadratic does not factorise conveniently, identify its coefficients in standard form and substitute them carefully." },
      { type: "math", expression: String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}` },
      { type: "worked-example", title: "Solve exactly", question: String.raw`Solve \(x^2-3x-1=0\).`, steps: [String.raw`\(a=1,\ b=-3,\ c=-1\).`, String.raw`\(x=\frac{3\pm\sqrt{9+4}}{2}\).`, String.raw`Simplify the surd.`], answer: String.raw`\(x=\frac{3\pm\sqrt{13}}{2}\).` },
      { type: "section-heading", text: "Check your substitution" },
      { type: "callout", title: "Signs matter", content: "Use the signed values of b and c, and keep the entire denominator as 2a." },
    ]
  },
  {
    id: "quadratics-discriminant",
    blocks: [
      { type: "section-heading", text: "Read the discriminant" },
      { type: "text", content: String.raw`The expression under the square root in the quadratic formula is the discriminant. Its sign tells you how many real roots the equation has.` },
      { type: "math", expression: String.raw`\Delta=b^2-4ac` },
      { type: "callout", title: "Number of real roots", content: String.raw`If \(\Delta>0\), there are two distinct real roots. If \(\Delta=0\), there is one repeated real root. If \(\Delta<0\), there are no real roots.` },
      { type: "section-heading", text: "Connect roots and graphs" },
      { type: "text", content: String.raw`The same result describes where the parabola meets the \(x\)-axis: twice, once at a tangent, or not at all.` },
    ]
  },
  {
    id: "quadratics-function-substitution",
    blocks: [
      { type: "section-heading", text: "Choose a substitution" },
      { type: "text", content: String.raw`Some equations become quadratic when a repeated expression is treated as one variable. Solve the quadratic in the new variable, then return to the original variable.` },
      { type: "worked-example", title: "Substitute and solve", question: String.raw`Solve \(x^4-5x^2+4=0\).`, steps: [String.raw`Let \(u=x^2\), giving \(u^2-5u+4=0\).`, String.raw`Factorise: \((u-1)(u-4)=0\), so \(u=1\) or \(u=4\).`, String.raw`Return to \(x\): \(x^2=1\) or \(x^2=4\).`], answer: String.raw`\(x=\pm1\) or \(x=\pm2\).` },
      { type: "section-heading", text: "Check the original domain" },
      { type: "callout", title: "Substitute back", content: "A solution for the substituted variable is not yet a solution for x. Solve each resulting equation and check in the original." },
    ]
  },
  {
    id: "quadratics-simultaneous-intersections",
    blocks: [
      { type: "section-heading", text: "Substitute the linear equation" },
      { type: "text", content: "Rearrange the linear equation to make one variable the subject, then substitute into the quadratic. The resulting quadratic gives the possible coordinates." },
      { type: "worked-example", title: "Find the intersections", question: String.raw`Solve \(y=x+1\) and \(y=x^2-3x+1\).`, steps: [String.raw`Set the expressions for \(y\) equal: \(x+1=x^2-3x+1\).`, String.raw`Rearrange: \(x^2-4x=0\), so \(x=0\) or \(x=4\).`, String.raw`Use \(y=x+1\) to find \(y\).`], answer: String.raw`The intersections are \((0,1)\) and \((4,5)\).` },
      { type: "section-heading", text: "Interpret the solutions" },
      { type: "callout", title: "Graph connection", content: "Each simultaneous solution is a point where the line and the curve intersect. A repeated root represents a tangent contact." },
    ]
  },
  {
    id: "quadratics-inequalities",
    blocks: [
      { type: "section-heading", text: "Use the roots and sign" },
      { type: "text", content: "Find the roots first. They split the number line into intervals where the quadratic is positive or negative. Test one value in each interval." },
      { type: "worked-example", title: "Solve an inequality", question: String.raw`Solve \(x^2-x-6\leq0\).`, steps: [String.raw`Factorise: \((x-3)(x+2)\leq0\), with roots \(-2\) and \(3\).`, String.raw`The parabola opens upwards, so it is at or below zero between the roots.`, String.raw`Include the roots because equality is allowed.`], answer: String.raw`\(-2\leq x\leq3\).` },
      { type: "section-heading", text: "State the solution region" },
      { type: "callout", title: "Be precise", content: "Use and/or or set notation clearly, and show whether boundary values are included. On a graph, identify the required region." },
    ]
  }
];

export function findLesson(lessonId: string) {
  const definition = findCourseLesson(lessonId);
  if (!definition) return null;
  const content = LESSONS.find((lesson) => lesson.id === lessonId);
  return {
    ...definition,
    courseLabel: definition.areaTitle,
    blocks: content?.blocks ?? [],
  } satisfies LessonDefinition;
}
