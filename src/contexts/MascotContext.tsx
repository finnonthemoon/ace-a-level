import { createContext, useContext, useState, type PropsWithChildren } from "react";

export const STAR_STAGES = ["red", "orange", "yellow", "white", "blue"] as const;
export type StarStage = (typeof STAR_STAGES)[number];

interface MascotContextValue {
  stage: StarStage;
  setStage: (stage: StarStage) => void;
}

const MascotContext = createContext<MascotContextValue | null>(null);

export function MascotProvider({ children }: PropsWithChildren) {
  // A visual preview until study activity can determine the stage.
  const [stage, setStage] = useState<StarStage>("yellow");
  return <MascotContext.Provider value={{ stage, setStage }}>{children}</MascotContext.Provider>;
}

export function useMascot() {
  const context = useContext(MascotContext);
  if (!context) throw new Error("useMascot must be used within MascotProvider");
  return context;
}
