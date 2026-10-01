import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/content/course-catalog-data.json"), "utf8"));
const errors = [];
const routes = new Set();
const topicIds = new Set();
const lessonIds = new Set();
const allLessons = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function canViewStage(qualification, stage) {
  return qualification === "a-level" || stage === "as";
}

function visibleLessons(topic, qualification) {
  return topic.lessons.filter((lesson) => canViewStage(qualification, lesson.stage));
}

function resolveCatalogRoute(path) {
  const [areaId, groupId, topicId] = path;
  const area = catalog.topicAreas.find((candidate) => candidate.id === areaId);
  if (!area) return null;
  if (!groupId) return { area };
  const group = area.topicGroups.find((candidate) => candidate.id === groupId);
  if (!group) return null;
  if (!topicId) return { area, group };
  const topic = group.topics.find((candidate) => candidate.id === topicId);
  return topic ? { area, group, topic } : null;
}

for (const area of catalog.topicAreas) {
  check(area.topicGroups.length > 0, `Area ${area.id} has no topic groups.`);
  for (const group of area.topicGroups) {
    check(group.topics.length > 0, `Topic group ${area.id}/${group.id} is empty.`);
    for (const topic of group.topics) {
      const route = `${area.id}/${group.id}/${topic.id}`;
      check(!routes.has(route), `Duplicate topic route: ${route}`);
      routes.add(route);
      check(resolveCatalogRoute([area.id, group.id, topic.id])?.topic?.id === topic.id, `Topic route does not resolve: ${route}`);
      check(!topicIds.has(topic.id), `Duplicate topic id: ${topic.id}`);
      topicIds.add(topic.id);
      check(topic.lessons.length > 0, `Topic ${route} has no lessons.`);
      check(["ready", "planned"].includes(topic.readiness), `Topic ${route} has invalid content readiness.`);
      const idsInTopic = new Set();
      for (const lesson of topic.lessons) {
        check(!idsInTopic.has(lesson.id), `Duplicate lesson id ${lesson.id} in ${route}.`);
        check(!lessonIds.has(lesson.id), `Duplicate course lesson route id: ${lesson.id}`);
        idsInTopic.add(lesson.id);
        lessonIds.add(lesson.id);
        allLessons.push(lesson);
        check(lesson.specificationRefs.length > 0, `Lesson ${lesson.id} has no specification references.`);
        check(["as", "a-level"].includes(lesson.stage), `Lesson ${lesson.id} has invalid stage ${lesson.stage}.`);
        check(["ready", "planned"].includes(lesson.contentStatus), `Lesson ${lesson.id} has invalid content status.`);
      }
      const asLessons = visibleLessons(topic, "as");
      const aLevelLessons = visibleLessons(topic, "a-level");
      check(asLessons.length === topic.lessons.filter((lesson) => lesson.stage === "as").length, `AS lesson filter mismatch in ${route}.`);
      check(asLessons.every((lesson) => lesson.stage === "as"), `AS qualification can see an A-Level-only lesson in ${route}.`);
      check(aLevelLessons.length === topic.lessons.length, `A Level lesson filter hides content in ${route}.`);
      check(aLevelLessons.length >= asLessons.length, `A Level lesson count is below AS count in ${route}.`);
      check(asLessons.every((lesson) => aLevelLessons.includes(lesson)), `A Level students cannot see all AS lessons in ${route}.`);
      check(aLevelLessons.filter((lesson) => lesson.stage === "a-level").length === topic.lessons.filter((lesson) => lesson.stage === "a-level").length, `A Level-only lessons are lost in ${route}.`);
      check(visibleLessons(topic, "as").length === asLessons.length, `Visible topic lesson denominator mismatch in ${route}.`);
    }
  }
}

const directReferences = new Set(allLessons.flatMap((lesson) => lesson.specificationRefs));
const crossLinks = catalog.crossLinkedSpecificationRefs ?? [];
const allReferences = new Set([...directReferences, ...crossLinks.map((link) => link.reference)]);
for (const link of crossLinks) {
  const area = catalog.topicAreas.find((candidate) => candidate.id === link.areaId);
  const group = area?.topicGroups.find((candidate) => candidate.id === link.topicGroupId);
  const topic = group?.topics.find((candidate) => candidate.id === link.topicId);
  check(Boolean(topic?.lessons.some((lesson) => lesson.id === link.lessonId)), `Cross-link ${link.reference} has an invalid canonical target.`);
  check(Boolean(link.reason), `Cross-link ${link.reference} needs a reason.`);
}
function numbered(prefix, from, to) {
  return Array.from({ length: to - from + 1 }, (_, index) => `${prefix}${from + index}`);
}
const requiredReferenceGroups = {
  "Pure proof": ["Mp1", "p2", "p3"],
  "Pure algebra": ["Ma1", "Ma2", ...numbered("a", 3, 16), "AS-prior-linear-equations", "AS-prior-change-subject"],
  "Pure functions": ["Mf1", ...numbered("f", 2, 8)],
  "Pure graphs": ["MC1", ...numbered("C", 2, 9)],
  "Pure coordinate geometry": ["Mg1", ...numbered("g", 2, 16)],
  "Pure sequences and series": ["Ms1", ...numbered("s", 2, 17)],
  "Pure trigonometry": ["Mt1", ...numbered("t", 2, 21), "AS-exact-trig-values"],
  "Pure exponentials and logarithms": ["ME1", ...numbered("E", 2, 11)],
  "Pure calculus": ["Mc1", ...numbered("c", 2, 33)],
  "Pure numerical methods": ["Me1", ...numbered("e", 2, 6), "Mc34", "c35"],
  "Pure vectors": ["Mv1", ...numbered("v", 2, 7)],
  "Statistics sampling": ["Mp21", ...numbered("p", 22, 25)],
  "Statistics data": ["MD1", ...numbered("D", 2, 14)],
  "Statistics probability": ["Mu1", ...numbered("u", 2, 7), "AS-probability-basics", "AS-expected-frequency", "AS-probability-diagrams"],
  "Statistics distributions": ["MR1", ...numbered("R", 2, 13)],
  "Statistics hypothesis testing": ["MH1", ...numbered("H", 2, 11)],
  "Mechanics models": ["Mp31", ...numbered("p", 32, 35)],
  "Mechanics kinematics": ["Mk1", ...numbered("k", 2, 12)],
  "Mechanics projectiles": ["My1", ...numbered("y", 2, 5)],
  "Mechanics forces": ["MF1", ...numbered("F", 2, 16)],
  "Mechanics Newton's laws": ["Mn1", ...numbered("n", 2, 7)],
};
const missingReferences = [];
for (const [group, references] of Object.entries(requiredReferenceGroups)) {
  for (const reference of references) {
    if (!allReferences.has(reference)) missingReferences.push(`${group}: ${reference}`);
  }
}
check(missingReferences.length === 0, `Missing specification references: ${missingReferences.join(", ")}`);

const quadratics = catalog.topicAreas.flatMap((area) => area.topicGroups.flatMap((group) => group.topics)).find((topic) => topic.id === "quadratics");
check(Boolean(quadratics), "The stable Quadratics topic id is missing.");
check(quadratics?.lessons.length === 8, "Quadratics must retain exactly eight lessons.");
check(quadratics?.lessons.every((lesson) => lesson.stage === "as" && lesson.contentStatus === "ready"), "All Quadratics lessons must be ready AS content.");
check(quadratics?.contentId === "a-level:mathematics:ocr-mei-mathematics-b:pure:algebra-and-functions:quadratics", "Quadratics progress identity changed.");
check(resolveCatalogRoute(["pure", "algebra-and-functions", "quadratics"])?.topic?.id === "quadratics", "The existing Quadratics deep link no longer resolves.");

const stageCounts = Object.fromEntries(["as", "a-level"].map((stage) => [stage, allLessons.filter((lesson) => lesson.stage === stage).length]));
const areaCounts = catalog.topicAreas.map((area) => ({
  area: area.title,
  groups: area.topicGroups.length,
  topics: area.topicGroups.reduce((total, group) => total + group.topics.length, 0),
}));
const counts = {
  areas: catalog.topicAreas.length,
  topicGroups: catalog.topicAreas.reduce((total, area) => total + area.topicGroups.length, 0),
  topics: topicIds.size,
  lessons: allLessons.length,
  stageCounts,
  areaCounts,
  crossLinkedSpecificationRefs: crossLinks.map((link) => ({
    reference: link.reference,
    target: `${link.areaId}/${link.topicGroupId}/${link.topicId}/${link.lessonId}`,
  })),
};

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  console.error(JSON.stringify(counts, null, 2));
  process.exitCode = 1;
} else {
  console.log("Course catalogue validation passed.");
  console.log(JSON.stringify(counts, null, 2));
}
