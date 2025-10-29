import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useCallback,
    useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { Priority } from "../components/CalendarView";

// 서버 주소 설정
const BASE_URL =
    Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

// Task 타입 정의
export type Task = {
    id: string;
    title: string;
    content?: string;
    date: string;
    priority: Priority;
    startTime?: string;
    endTime?: string;
    done?: boolean;
    alertEnabled?: boolean;
};

type TasksContextType = {
    tasks: Task[];
    tasksByDate: Record<string, Task[]>;
    reloadTasks: () => Promise<void>;
    getTaskById: (id: string) => Task | undefined;
};

// Context 생성
const TasksCtx = createContext<TasksContextType | null>(null);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [token, setToken] = useState<string | null>(null);

    /**
     * 로그인 후 AsyncStorage에 저장된 accessToken을 주기적으로 확인
     * (단, 삭제하거나 체크 API를 호출하지 않음)
     */
    useEffect(() => {
        const checkStoredToken = async () => {
            const stored = await AsyncStorage.getItem("accessToken");
            if (stored && stored !== token) {
                setToken(stored);
                console.log("새로운 토큰 로드됨");
            }
        };
        checkStoredToken();

        // 5초마다 최신 토큰 동기화 (로그아웃 시 반영)
        const interval = setInterval(checkStoredToken, 5000);
        return () => clearInterval(interval);
    }, [token]);

    /**
     * Task 목록 로드
     * 로그인 후 토큰이 존재할 때만 실행됨
     */
    const reloadTasks = useCallback(async () => {
        const currentToken = await AsyncStorage.getItem("accessToken");
        if (!currentToken) {
            console.log("토큰 없음 — 로그인 후 실행 필요");
            return;
        }

        try {
            // 모든 날짜 Task 조회
            const res = await fetch(`${BASE_URL}/api/v1/task/day/tasks`, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });

            if (res.status === 401) {
                console.warn("인증 만료 — 다시 로그인 필요");
                return;
            }

            if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
            console.log("전체 Tasks loaded:", data);
        } catch (err) {
            console.error("Task load error:", err);
        }
    }, []);


    /**
     * 토큰이 생겼을 때 자동으로 Task 로드
     */
    useEffect(() => {
        if (token) {
            console.log("토큰 감지됨 — Task 로드 시작");
            reloadTasks();
        } else {
            console.log("토큰 없음 — 대기 중");
        }
    }, [token, reloadTasks]);

    /**
     * ID로 Task 찾기
     */
    const getTaskById = (id: string) => tasks.find((t) => t.id === id);

    /**
     * 날짜별 그룹화
     */
    const tasksByDate = useMemo(() => {
        const grouped: Record<string, Task[]> = {};
        for (const t of tasks) {
            (grouped[t.date] ||= []).push(t);
        }
        return grouped;
    }, [tasks]);

    return (
        <TasksCtx.Provider value={{ tasks, tasksByDate, reloadTasks, getTaskById }}>
            {children}
        </TasksCtx.Provider>
    );
};

export const useTasks = () => {
    const ctx = useContext(TasksCtx);
    if (!ctx) throw new Error("useTasks는 TasksProvider 내부에서 사용해야 합니다.");
    return ctx;
};

/**
 * 로컬 기준 날짜 문자열 반환 (UTC 밀림 방지)
 */
export function toKey(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
