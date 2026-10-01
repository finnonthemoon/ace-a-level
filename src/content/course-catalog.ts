import courseData from "@/content/course-catalog-data.json";
import { canViewStage, type QualificationLevel, type QualificationStage } from "@/product/qualification";

export type ContentStatus = "ready" | "planned";

export interface CourseLessonDefinition {
  id: string;
  title: string;
  description: string;
  scope?: readonly string[];
  durationMinutes?: number;
  stage: QualificationStage;
  specificationRefs: readonly string[];
  contentStatus: ContentStatus;
}

export interface CourseTopic {
  id: string;
  contentId?: string;
  title: string;
  summary: string;
  lessons: readonly CourseLessonDefinition[];
  practiceSetIds: readonly string[];
  readiness: ContentStatus;
}

export interface CourseTopicGroup {
  id: string;
  title: string;
  topics: readonly CourseTopic[];
}

export interface CourseTopicArea {
  id: string;
  title: string;
  summary: string;
  topicGroups: readonly CourseTopicGroup[];
}

export interface CourseSpecification {
  id: string;
  version: string;
  qualification: {
    id: string;
    title: string;
    specifications: readonly { level: QualificationLevel; code: string; title: string }[];
  };
  subject: { id: string; title: string };
  examBoard: { id: string; title: string };
  title: string;
  topicAreas: readonly CourseTopicArea[];
  crossLinkedSpecificationRefs: readonly {
    reference: string;
    areaId: string;
    topicGroupId: string;
    topicId: string;
    lessonId: string;
    reason: string;
  }[];
}

export const QUADRATICS_TOPIC_CONTENT_ID = "a-level:mathematics:ocr-mei-mathematics-b:pure:algebra-and-functions:quadratics";

export const COURSE_CATALOG: readonly CourseSpecification[] = [courseData as CourseSpecification];

export function getTopicStages(topic: CourseTopic): QualificationStage[] {
  const stages: QualificationStage[] = [];
  if (topic.lessons.some((lesson) => lesson.stage === "as")) stages.push("as");
  if (topic.lessons.some((lesson) => lesson.stage === "a-level")) stages.push("a-level");
  return stages;
}

export function getVisibleLessons(topic: CourseTopic, qualification: QualificationLevel) {
  return topic.lessons.filter((lesson) => canViewStage(qualification, lesson.stage));
}

export function getVisibleTopics(group: CourseTopicGroup, qualification: QualificationLevel) {
  return group.topics.filter((topic) => getVisibleLessons(topic, qualification).length > 0);
}

export function getVisibleAreaTopics(area: CourseTopicArea, qualification: QualificationLevel) {
  return area.topicGroups.flatMap((group) => getVisibleTopics(group, qualification).map((topic) => ({ group, topic })));
}

export function countAreaLessons(area: CourseTopicArea, qualification: QualificationLevel) {
  return getVisibleAreaTopics(area, qualification).reduce(
    (total, { topic }) => total + getVisibleLessons(topic, qualification).length,
    0,
  );
}

export function findSpecification(subjectId: string, topicAreaId?: string) {
  return COURSE_CATALOG.find((specification) =>
    specification.subject.id === subjectId &&
    (!topicAreaId || specification.topicAreas.some((area) => area.id === topicAreaId)),
  ) ?? null;
}

export function findTopicArea(specification: CourseSpecification, topicAreaId: string) {
  return specification.topicAreas.find((area) => area.id === topicAreaId) ?? null;
}

export function findCourseTopic(topicId: string, specification: CourseSpecification = COURSE_CATALOG[0]) {
  for (const area of specification.topicAreas) {
    for (const group of area.topicGroups) {
      const topic = group.topics.find((candidate) => candidate.id === topicId);
      if (topic) return { specification, area, group, topic };
    }
  }
  return null;
}

export function getTopicProgressId(
  specification: CourseSpecification,
  area: CourseTopicArea,
  group: CourseTopicGroup,
  topic: CourseTopic,
) {
  return topic.contentId ?? `${specification.id}:${area.id}:${group.id}:${topic.id}`;
}

export function findCourseLesson(lessonId: string, specification: CourseSpecification = COURSE_CATALOG[0]) {
  for (const area of specification.topicAreas) {
    for (const group of area.topicGroups) {
      for (const topic of group.topics) {
        const lesson = topic.lessons.find((candidate) => candidate.id === lessonId);
        if (lesson) {
          return {
            ...lesson,
            topicId: getTopicProgressId(specification, area, group, topic),
            topicTitle: topic.title,
            areaTitle: area.title,
          };
        }
      }
    }
  }
  return null;
}

export function resolveCoursePath(
  subjectId: string,
  path: readonly string[],
  qualification: QualificationLevel = "a-level",
) {
  if (path.length === 0) return null;
  const specification = findSpecification(subjectId, path[0]);
  const area = specification ? findTopicArea(specification, path[0]) : null;
  if (!specification || !area) return null;

  if (path.length === 1) return { specification, area, selectedGroup: null, selectedTopic: null, children: [] as readonly CourseTopic[] };

  const legacyGroupIds: Record<string, string> = {
    "graphs-and-transformations": "graphs",
    differentiation: "calculus",
    integration: "calculus",
  };
  const legacyTopicIds: Record<string, string> = {
    "indices-and-surds": "surds-and-indices",
    "simultaneous-equations": "algebraic-language-and-equations",
    inequalities: "linear-inequalities",
    polynomials: "polynomials-and-the-factor-theorem",
    functions: "functions-composites-and-inverses",
    "function-notation": "functions-composites-and-inverses",
    "composite-and-inverse-functions": "functions-composites-and-inverses",
    "graph-sketching": "graphs-and-curve-sketching",
    "graph-transformations": "graph-transformations",
    "stationary-points": "applications-of-differentiation",
    "differentiation-rules": "differentiation-fundamentals",
    "tangents-and-normals": "applications-of-differentiation",
    "indefinite-integration": "integration-fundamentals",
    "definite-integration": "integration-fundamentals",
    "sign-change": "numerical-root-finding",
    "fixed-point-iteration": "numerical-root-finding",
    "arithmetic-sequences": "arithmetic-and-geometric-series",
    "geometric-sequences": "arithmetic-and-geometric-series",
    "binomial-expansion": "binomial-expansion",
    "trigonometric-functions": "trigonometric-functions-and-exact-values",
    "trigonometric-identities": "trigonometric-identities-and-equations",
    "trigonometric-equations": "trigonometric-identities-and-equations",
    "exponential-functions": "exponentials-and-logarithms",
    logarithms: "exponentials-and-logarithms",
    "proof-by-deduction": "mathematical-proof",
    "proof-by-exhaustion": "mathematical-proof",
    "proof-by-counterexample": "mathematical-proof",
  };
  const segment = legacyGroupIds[path[1]] ?? path[1];
  const selectedGroup = area.topicGroups.find((candidate) => candidate.id === segment) ?? null;
  if (selectedGroup) {
    if (path.length === 2) {
      return {
        specification,
        area,
        selectedGroup,
        selectedTopic: null,
        children: getVisibleTopics(selectedGroup, qualification),
      };
    }
    const legacyTopicId = legacyTopicIds[path[2]] ?? path[2];
    const selectedTopic = selectedGroup.topics.find((candidate) => candidate.id === legacyTopicId)
      ?? area.topicGroups.flatMap((group) => group.topics).find((candidate) => candidate.id === legacyTopicId)
      ?? null;
    if (!selectedTopic || getVisibleLessons(selectedTopic, qualification).length === 0) return null;
    return { specification, area, selectedGroup, selectedTopic, children: [] as readonly CourseTopic[] };
  }

  // Compatibility for existing links that point directly to a topic beneath an area.
  const topicId = legacyTopicIds[segment] ?? segment;
  const match = area.topicGroups.flatMap((group) => group.topics.map((topic) => ({ group, topic })))
    .find(({ topic }) => topic.id === topicId);
  if (!match || getVisibleLessons(match.topic, qualification).length === 0) return null;
  return { specification, area, selectedGroup: match.group, selectedTopic: match.topic, children: [] as readonly CourseTopic[] };
}
