import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type SubjectId =
  | "mathematics"
  | "physics"
  | "biology"
  | "chemistry"
  | "computer-science"
  | "economics";

export type SubjectIcon = ComponentProps<typeof Ionicons>["name"];

export interface SubjectTopic {
  id: string;
  title: string;
  summary: string;
}

export interface SubjectDefinition {
  id: SubjectId;
  title: string;
  shortTitle: string;
  icon: SubjectIcon;
  color: string;
  softColor: string;
  status: "foundation";
  topics: SubjectTopic[];
}

export const SUBJECTS: SubjectDefinition[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    shortTitle: "Maths",
    icon: "calculator-outline",
    color: "#FF6817",
    softColor: "#FFF0D8",
    status: "foundation",
    topics: [
      { id: "pure", title: "Pure Mathematics", summary: "Algebra, functions, trigonometry and calculus." },
      { id: "statistics", title: "Statistics", summary: "Data, probability, distributions and hypothesis testing." },
      { id: "mechanics", title: "Mechanics", summary: "Kinematics, forces, moments and connected particles." },
    ],
  },
  {
    id: "physics",
    title: "Physics",
    shortTitle: "Physics",
    icon: "planet-outline",
    color: "#4F78D1",
    softColor: "#EAF0FF",
    status: "foundation",
    topics: [
      { id: "measurements", title: "Measurements and uncertainties", summary: "Units, errors, practical skills and data handling." },
      { id: "mechanics", title: "Mechanics and materials", summary: "Motion, forces, energy and material behaviour." },
      { id: "electricity", title: "Electricity", summary: "Charge, current, circuits and electrical energy." },
    ],
  },
  {
    id: "biology",
    title: "Biology",
    shortTitle: "Biology",
    icon: "leaf-outline",
    color: "#3C9563",
    softColor: "#E8F7EE",
    status: "foundation",
    topics: [
      { id: "biological-molecules", title: "Biological molecules", summary: "Carbohydrates, lipids, proteins, water and nucleic acids." },
      { id: "cells", title: "Cells", summary: "Cell structure, membranes, transport and immunity." },
      { id: "organisms", title: "Organisms and exchange", summary: "Gas exchange, transport and mass movement." },
    ],
  },
  {
    id: "chemistry",
    title: "Chemistry",
    shortTitle: "Chemistry",
    icon: "flask-outline",
    color: "#8B63C7",
    softColor: "#F2EAFF",
    status: "foundation",
    topics: [
      { id: "physical", title: "Physical chemistry", summary: "Amounts, bonding, energetics, kinetics and equilibria." },
      { id: "inorganic", title: "Inorganic chemistry", summary: "Periodicity, Group 2 and Group 7 chemistry." },
      { id: "organic", title: "Organic chemistry", summary: "Mechanisms, analysis and organic synthesis." },
    ],
  },
  {
    id: "computer-science",
    title: "Computer Science",
    shortTitle: "Computer Science",
    icon: "code-slash-outline",
    color: "#247F91",
    softColor: "#E3F5F7",
    status: "foundation",
    topics: [
      { id: "programming", title: "Programming", summary: "Algorithms, data structures and problem solving." },
      { id: "systems", title: "Computer systems", summary: "Processors, software, data and networks." },
      { id: "theory", title: "Theory of computation", summary: "Logic, languages, complexity and computability." },
    ],
  },
  {
    id: "economics",
    title: "Economics",
    shortTitle: "Economics",
    icon: "trending-up-outline",
    color: "#D18B24",
    softColor: "#FFF3DA",
    status: "foundation",
    topics: [
      { id: "micro", title: "Microeconomics", summary: "Markets, behaviour, firms and market failure." },
      { id: "macro", title: "Macroeconomics", summary: "Growth, inflation, unemployment and policy." },
      { id: "global", title: "The global economy", summary: "Trade, development, exchange rates and globalisation." },
    ],
  },
];

export function findSubject(subjectId: SubjectId | null | undefined) {
  return SUBJECTS.find((subject) => subject.id === subjectId) ?? null;
}
