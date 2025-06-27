import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

export interface ProjectTimerContextType {
  currentMode: number | null;
  setMode: (m: number) => void;
  currentProjectId: number | null;
  setCurrentProjectId: (m: number | null) => void;
  setProjectMode: (projectId: number | null, newMode: number) => Promise<void>;
  timeLeft: number | null;
  startTimer: (duration: number) => void;
  stopTimer: () => void;
  setOnTimeout: (cb: () => void) => void;
}

const ProjectTimerContext = createContext<ProjectTimerContextType | null>(null);

export const useProjectTimer = () => {
  const c = useContext(ProjectTimerContext);
  if (!c)
    throw new Error("useProjectTimer must be used within ProjectTimerProvider");
  return c;
};

export const ProjectTimerProvider = ({ children }: { children: ReactNode }) => {
  const [currentMode, setCurrentMode] = useState<number | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const onTimeoutRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const setMode = (mode: number) => setCurrentMode(mode);

  const setOnTimeout = (cb: () => void) => {
    onTimeoutRef.current = cb;
  };

  const setProjectMode = async (projectId: number | null, newMode: number) => {
    if (projectId != null) {
      await axios.put(`http://localhost:8000/projects/${projectId}`, {
        mode: newMode,
      });
      setCurrentMode(newMode);
    }
  };

  const startTimer = (duration: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const endTime = Date.now() + duration * 1000;

    timerRef.current = window.setInterval(() => {
      const currentTime = Date.now();
      const tl = Math.max(Math.round((endTime - currentTime) / 1000), 0);
      setTimeLeft(tl);

      if (tl <= 0) {
        stopTimer();
        if (onTimeoutRef.current) {
          onTimeoutRef.current();
        }
      }
    }, 1000);

    setTimeLeft(duration);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setTimeLeft(null);
    }
  };

  return (
    <ProjectTimerContext.Provider
      value={{
        currentMode,
        setMode,
        currentProjectId,
        setCurrentProjectId,
        setProjectMode,
        timeLeft,
        startTimer,
        stopTimer,
        setOnTimeout,
      }}
    >
      {children}
    </ProjectTimerContext.Provider>
  );
};
