/**
 * Course outlines are specification data, kept separate from their screens.
 * The initial OCR MEI Mathematics B entries are UI scaffolding and should be
 * checked against the selected specification before publishing lesson content.
 */
export type ContentReadiness = "available" | "planned" | "coming-soon";

export interface CourseTopic {
  id: string;
  contentId?: string;
  title: string;
  summary: string;
  readiness: ContentReadiness;
  topics?: readonly CourseTopic[];
  lessonIds: readonly string[];
  practiceSetIds: readonly string[];
}

export const QUADRATICS_TOPIC_CONTENT_ID = "a-level:mathematics:ocr-mei-mathematics-b:pure:algebra-and-functions:quadratics";

export interface CourseTopicArea {
  id: string;
  title: string;
  summary: string;
  readiness: ContentReadiness;
  topics: readonly CourseTopic[];
}

export interface CourseSpecification {
  id: string;
  qualification: { id: string; title: string };
  subject: { id: string; title: string };
  examBoard: { id: string; title: string };
  title: string;
  topicAreas: readonly CourseTopicArea[];
}

export const COURSE_CATALOG: readonly CourseSpecification[] = [
  {
    id: "ocr-mei-mathematics-b",
    qualification: { id: "a-level", title: "A Level" },
    subject: { id: "mathematics", title: "Mathematics" },
    examBoard: { id: "ocr-mei", title: "OCR MEI" },
    title: "Mathematics B",
    topicAreas: [
      {
        id: "pure",
        title: "Pure Mathematics",
        summary: "Build fluency in algebra, functions, geometry and calculus.",
        readiness: "available",
        topics: [
          { id: "proof", title: "Proof", summary: "Methods of mathematical proof.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
          {
            id: "algebra-and-functions",
            title: "Algebra and Functions",
            summary: "Expressions, equations, functions and their graphs.",
            readiness: "available",
            topics: [
              { id: "indices-and-surds", title: "Indices and surds", summary: "Laws of indices and exact surd manipulation.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
              {
                id: "quadratics",
                contentId: QUADRATICS_TOPIC_CONTENT_ID,
                title: "Quadratics",
                summary: "Understand quadratic equations, find their roots and interpret their graphs.",
                readiness: "available",
                lessonIds: ["quadratics-solving-equations"],
                practiceSetIds: ["quadratics-foundations"],
              },
              { id: "simultaneous-equations", title: "Simultaneous equations", summary: "Solve pairs of equations algebraically and graphically.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
              { id: "inequalities", title: "Inequalities", summary: "Solve and represent linear and quadratic inequalities.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
              { id: "polynomials", title: "Polynomials", summary: "Manipulate, factorise and solve polynomial expressions.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
              { id: "functions", title: "Functions", summary: "Function notation, domains, ranges and composition.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
              { id: "graphs-and-transformations", title: "Graphs and transformations", summary: "Sketch graphs and describe transformations.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
              { id: "partial-fractions", title: "Partial fractions", summary: "Decompose rational expressions into simpler terms.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
            ],
            lessonIds: [],
            practiceSetIds: [],
          },
          { id: "coordinate-geometry", title: "Coordinate Geometry", summary: "Lines, curves and their geometric properties.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
          { id: "sequences-and-series", title: "Sequences and Series", summary: "Patterns, sequences and summation.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
          { id: "trigonometry", title: "Trigonometry", summary: "Trigonometric relationships, identities and equations.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
          { id: "exponentials-and-logarithms", title: "Exponentials and Logarithms", summary: "Exponential and logarithmic functions and models.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
          { id: "differentiation", title: "Differentiation", summary: "Rates of change, gradients and stationary points.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
          { id: "integration", title: "Integration", summary: "Antiderivatives, areas and accumulation.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
          { id: "numerical-methods", title: "Numerical Methods", summary: "Approximate solutions using numerical techniques.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
          { id: "vectors", title: "Vectors", summary: "Represent and solve geometric problems with vectors.", readiness: "coming-soon", lessonIds: [], practiceSetIds: [] },
        ],
      },
    ],
  },
];

export function findSpecification(subjectId: string, topicAreaId?: string) {
  return COURSE_CATALOG.find((specification) =>
    specification.subject.id === subjectId &&
    (!topicAreaId || specification.topicAreas.some((area) => area.id === topicAreaId)),
  ) ?? null;
}

export function findTopicArea(specification: CourseSpecification, topicAreaId: string) {
  return specification.topicAreas.find((area) => area.id === topicAreaId) ?? null;
}

