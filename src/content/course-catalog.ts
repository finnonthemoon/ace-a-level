/** Specification outlines are data. Entries marked as scaffolding should be
 * checked against the selected qualification before they are published as content. */
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

interface CourseTopicInput extends Omit<CourseTopic, "readiness" | "lessonIds" | "practiceSetIds"> {
  readiness?: ContentReadiness;
  lessonIds?: readonly string[];
  practiceSetIds?: readonly string[];
}

const topic = (value: CourseTopicInput): CourseTopic => ({
  readiness: "coming-soon",
  lessonIds: [],
  practiceSetIds: [],
  ...value,
});

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
  version: string;
  qualification: { id: string; title: string };
  subject: { id: string; title: string };
  examBoard: { id: string; title: string };
  title: string;
  topicAreas: readonly CourseTopicArea[];
}

const algebraFunctions = topic({
  id: "algebra-and-functions", title: "Algebra and Functions",
  summary: "Expressions, equations, functions and their graphs.", readiness: "available",
  topics: [
    topic({ id: "indices-and-surds", title: "Indices and surds", summary: "Laws of indices and exact surd manipulation." }),
    topic({ id: "quadratics", contentId: QUADRATICS_TOPIC_CONTENT_ID, title: "Quadratics", summary: "Solve quadratic equations and interpret their roots and graphs.", readiness: "available", lessonIds: ["quadratics-solving-equations"], practiceSetIds: ["quadratics-foundations"] }),
    topic({ id: "simultaneous-equations", title: "Simultaneous equations", summary: "Solve pairs of equations algebraically and graphically." }),
    topic({ id: "inequalities", title: "Inequalities", summary: "Solve and represent linear and quadratic inequalities." }),
    topic({ id: "polynomials", title: "Polynomials", summary: "Manipulate, factorise and solve polynomial expressions." }),
    topic({ id: "functions", title: "Functions", summary: "Function notation, domains, ranges and composition.", topics: [
      topic({ id: "function-notation", title: "Function notation", summary: "Use notation, domains and ranges to describe functions." }),
      topic({ id: "composite-and-inverse-functions", title: "Composite and inverse functions", summary: "Compose functions and find inverse functions." }),
    ] }),
    topic({ id: "graphs-and-transformations", title: "Graphs and transformations", summary: "Sketch graphs and describe transformations.", topics: [
      topic({ id: "graph-sketching", title: "Graph sketching", summary: "Use key features to sketch common graphs." }),
      topic({ id: "graph-transformations", title: "Transformations", summary: "Describe translations, stretches and reflections of graphs." }),
    ] }),
    topic({ id: "partial-fractions", title: "Partial fractions", summary: "Decompose rational expressions into simpler terms." }),
  ],
});

const PURE_MATHEMATICS: CourseTopicArea = {
  id: "pure", title: "Pure Mathematics", summary: "Build fluency in algebra, functions, geometry and calculus.", readiness: "available",
  topics: [
    topic({ id: "proof", title: "Proof", summary: "Use clear reasoning to establish mathematical results.", topics: [
      topic({ id: "proof-by-deduction", title: "Proof by deduction", summary: "Build a logical argument from known facts." }),
      topic({ id: "proof-by-exhaustion", title: "Proof by exhaustion", summary: "Check every case in a finite set." }),
      topic({ id: "proof-by-counterexample", title: "Disproof by counterexample", summary: "Test a statement with a counterexample." }),
    ] }),
    algebraFunctions,
    topic({ id: "coordinate-geometry", title: "Coordinate Geometry", summary: "Lines, curves and their geometric properties.", topics: [
      topic({ id: "straight-lines", title: "Straight lines", summary: "Gradients, equations and intersections of lines." }),
      topic({ id: "circles", title: "Circles", summary: "Equations and geometric properties of circles." }),
      topic({ id: "parametric-equations", title: "Parametric equations", summary: "Represent curves using a parameter." }),
    ] }),
    topic({ id: "sequences-and-series", title: "Sequences and Series", summary: "Patterns, sequences and summation.", topics: [
      topic({ id: "arithmetic-sequences", title: "Arithmetic sequences", summary: "Find terms and sums in arithmetic sequences." }),
      topic({ id: "geometric-sequences", title: "Geometric sequences", summary: "Find terms and sums in geometric sequences." }),
      topic({ id: "binomial-expansion", title: "Binomial expansion", summary: "Expand powers using the binomial theorem." }),
    ] }),
    topic({ id: "trigonometry", title: "Trigonometry", summary: "Trigonometric relationships, identities and equations.", topics: [
      topic({ id: "trigonometric-functions", title: "Trigonometric functions", summary: "Explore sine, cosine and tangent graphs." }),
      topic({ id: "trigonometric-identities", title: "Trigonometric identities", summary: "Use identities to simplify and prove results." }),
      topic({ id: "trigonometric-equations", title: "Trigonometric equations", summary: "Solve trigonometric equations over given intervals." }),
    ] }),
    topic({ id: "exponentials-and-logarithms", title: "Exponentials and Logarithms", summary: "Exponential and logarithmic functions and models.", topics: [
      topic({ id: "exponential-functions", title: "Exponential functions", summary: "Work with exponential growth and decay." }),
      topic({ id: "logarithms", title: "Logarithms", summary: "Use logarithms and their laws to solve equations." }),
    ] }),
    topic({ id: "differentiation", title: "Differentiation", summary: "Rates of change, gradients and stationary points.", topics: [
      topic({ id: "differentiation-rules", title: "Differentiation rules", summary: "Differentiate standard functions and combinations." }),
      topic({ id: "stationary-points", title: "Stationary points", summary: "Find and classify stationary points." }),
      topic({ id: "tangents-and-normals", title: "Tangents and normals", summary: "Find equations of tangents and normals to curves." }),
    ] }),
    topic({ id: "integration", title: "Integration", summary: "Antiderivatives, areas and accumulation.", topics: [
      topic({ id: "indefinite-integration", title: "Indefinite integration", summary: "Find antiderivatives and include constants of integration." }),
      topic({ id: "definite-integration", title: "Definite integration", summary: "Evaluate definite integrals and areas." }),
    ] }),
    topic({ id: "numerical-methods", title: "Numerical Methods", summary: "Approximate solutions using numerical techniques.", topics: [
      topic({ id: "sign-change", title: "Sign change", summary: "Locate roots by checking changes in sign." }),
      topic({ id: "fixed-point-iteration", title: "Fixed-point iteration", summary: "Approximate roots using iterative methods." }),
    ] }),
    topic({ id: "vectors", title: "Vectors", summary: "Represent and solve geometric problems with vectors.", topics: [
      topic({ id: "vector-operations", title: "Vector notation and operations", summary: "Represent vectors and calculate with them." }),
      topic({ id: "vector-geometry", title: "Vector geometry", summary: "Use vectors to solve geometric problems." }),
    ] }),
  ],
};

const STATISTICS: CourseTopicArea = {
  id: "statistics", title: "Statistics", summary: "Explore data, probability and statistical models.", readiness: "planned",
  topics: [
    topic({ id: "statistical-sampling", title: "Statistical Sampling", summary: "Plan samples and consider their limitations.", topics: [
      topic({ id: "populations-and-samples", title: "Populations and samples", summary: "Distinguish populations from samples." }),
      topic({ id: "sampling-methods", title: "Sampling methods", summary: "Compare common sampling methods and potential bias." }),
    ] }),
    topic({ id: "data-presentation-and-interpretation", title: "Data Presentation and Interpretation", summary: "Summarise, display and interpret data.", topics: [
      topic({ id: "data-presentation", title: "Presenting data", summary: "Choose and interpret suitable data displays." }),
      topic({ id: "measures-of-location-and-spread", title: "Location and spread", summary: "Summarise data with averages and measures of spread." }),
      topic({ id: "correlation-and-regression", title: "Correlation and regression", summary: "Investigate relationships between paired data." }),
    ] }),
    topic({ id: "probability", title: "Probability", summary: "Represent events and calculate probabilities.", topics: [
      topic({ id: "probability-basics", title: "Probability basics", summary: "Use probabilities, complements and event notation." }),
      topic({ id: "probability-diagrams", title: "Probability diagrams", summary: "Represent events with tree and Venn diagrams." }),
      topic({ id: "conditional-probability", title: "Conditional probability", summary: "Calculate probabilities given that an event has occurred." }),
      topic({ id: "independent-events", title: "Independent events", summary: "Identify and calculate with independent events." }),
    ] }),
    topic({ id: "probability-distributions", title: "Probability Distributions", summary: "Model random variables with probability distributions.", topics: [
      topic({ id: "discrete-random-variables", title: "Discrete random variables", summary: "Describe discrete distributions and their means." }),
      topic({ id: "binomial-distribution", title: "Binomial distribution", summary: "Model repeated independent trials." }),
      topic({ id: "normal-distribution", title: "Normal distribution", summary: "Use the normal distribution to model continuous data." }),
    ] }),
    topic({ id: "statistical-hypothesis-testing", title: "Statistical Hypothesis Testing", summary: "Use statistical tests to evaluate claims.", topics: [
      topic({ id: "hypotheses-and-significance", title: "Hypotheses and significance", summary: "Form hypotheses and interpret significance levels." }),
      topic({ id: "binomial-hypothesis-tests", title: "Binomial hypothesis tests", summary: "Test claims using a binomial model." }),
      topic({ id: "normal-hypothesis-tests", title: "Normal hypothesis tests", summary: "Test claims using a normal model." }),
    ] }),
  ],
};

const MECHANICS: CourseTopicArea = {
  id: "mechanics", title: "Mechanics", summary: "Model motion and forces in physical systems.", readiness: "planned",
  topics: [
    topic({ id: "models-and-quantities", title: "Models and Quantities", summary: "Set up mathematical models of physical situations.", topics: [
      topic({ id: "modelling-assumptions", title: "Modelling assumptions", summary: "Choose assumptions and interpret their effects." }),
      topic({ id: "units-and-quantities", title: "Units and quantities", summary: "Work consistently with physical quantities and units." }),
    ] }),
    topic({ id: "kinematics-in-one-dimension", title: "Kinematics in One Dimension", summary: "Describe motion along a straight line.", topics: [
      topic({ id: "displacement-and-velocity", title: "Displacement and velocity", summary: "Describe position and velocity over time." }),
      topic({ id: "constant-acceleration", title: "Constant acceleration", summary: "Use constant acceleration equations of motion." }),
    ] }),
    topic({ id: "kinematics-in-two-dimensions", title: "Kinematics in Two Dimensions", summary: "Describe motion using components and vectors.", topics: [
      topic({ id: "two-dimensional-motion", title: "Two-dimensional motion", summary: "Resolve motion into perpendicular components." }),
    ] }),
    topic({ id: "projectiles", title: "Projectiles", summary: "Model the motion of projected particles.", topics: [
      topic({ id: "projectile-motion", title: "Projectile motion", summary: "Analyse horizontal and vertical projectile motion." }),
    ] }),
    topic({ id: "forces", title: "Forces", summary: "Resolve forces and model equilibrium or motion.", topics: [
      topic({ id: "force-diagrams", title: "Force diagrams", summary: "Represent forces acting on an object." }),
      topic({ id: "resolving-forces", title: "Resolving forces", summary: "Resolve forces into components." }),
      topic({ id: "friction", title: "Friction", summary: "Model frictional forces between surfaces." }),
      topic({ id: "equilibrium", title: "Equilibrium", summary: "Apply conditions for equilibrium." }),
    ] }),
    topic({ id: "newtons-laws", title: "Newton’s Laws of Motion", summary: "Relate resultant forces to motion.", topics: [
      topic({ id: "newtons-laws-of-motion", title: "Newton’s laws", summary: "Apply Newton’s laws to particles." }),
      topic({ id: "connected-particles", title: "Connected particles", summary: "Model systems of connected particles." }),
      topic({ id: "motion-under-gravity", title: "Motion under gravity", summary: "Analyse motion caused by gravitational force." }),
    ] }),
    topic({ id: "rigid-bodies", title: "Rigid Bodies", summary: "Study moments and rotational equilibrium.", topics: [
      topic({ id: "moments", title: "Moments", summary: "Calculate moments of forces about a point." }),
      topic({ id: "rigid-body-equilibrium", title: "Equilibrium of rigid bodies", summary: "Apply force and moment balance." }),
    ] }),
  ],
};

export const COURSE_CATALOG: readonly CourseSpecification[] = [
  {
    id: "ocr-mei-mathematics-b", version: "3.1",
    qualification: { id: "a-level", title: "A Level" },
    subject: { id: "mathematics", title: "Mathematics" },
    examBoard: { id: "ocr-mei", title: "OCR MEI" },
    title: "Mathematics B", topicAreas: [PURE_MATHEMATICS, STATISTICS, MECHANICS],
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

export function resolveCoursePath(subjectId: string, path: readonly string[]) {
  if (path.length === 0) return null;
  const specification = findSpecification(subjectId, path[0]);
  const area = specification ? findTopicArea(specification, path[0]) : null;
  if (!specification || !area) return null;

  let selectedTopic: CourseTopic | null = null;
  let children: readonly CourseTopic[] = area.topics;
  for (const segment of path.slice(1)) {
    selectedTopic = children.find((candidate) => candidate.id === segment) ?? null;
    if (!selectedTopic) return null;
    children = selectedTopic.topics ?? [];
  }
  return { specification, area, selectedTopic, children };
}
