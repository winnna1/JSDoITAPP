import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useCallback,
    useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import type { Priority } from "../components/CalendarView";
import { apiGetAuth, apiPutAuth, apiDeleteAuth } from "../lib/api";

/** Task 타입 정의 */
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

/** Context 타입 정의 */
type TasksContextType = {
    tasks: Task[];
    tasksByDate: Record<string, Task[]>;
    reloadTasks: () => Promise<void>;
    getTaskById: (id: string) => Task | undefined;
    updateTask: (id: string, data: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
};

/** Context 생성 */
const TasksCtx = createContext<TasksContextType | null>(null);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    /**
     * 로그인 여부 확인
     * accessToken이 있으면 로그인된 상태로 간주
     */
    const checkLogin = useCallback(async () => {
        const token = await AsyncStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        checkLogin();
    }, [checkLogin]);

    /**
     * Task 불러오기 (로그인된 경우에만 실행)
     */
    const reloadTasks = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) {
                console.log("🔒 로그인 안 됨 → Task 불러오기 스킵");
                return;
            }

            const data = await apiGetAuth<Task[]>("/api/v1/task/day/tasks");
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Task load error:", err);
        }
    }, []);

    /**
     * 로그인 상태가 true일 때만 Task 로드
     */
    useEffect(() => {
        if (isLoggedIn) {
            reloadTasks();
        }
    }, [isLoggedIn, reloadTasks]);

    /**
     * Task 수정
     */
    const updateTask = useCallback(
        async (id: string, data: Partial<Task>) => {
            try {
                await apiPutAuth(`/api/v1/task/${id}`, data);
                await reloadTasks();
            } catch (err: any) {
                Alert.alert("업데이트 실패", err.message || "Task 수정 중 오류 발생");
            }
        },
        [reloadTasks]
    );

    /**
      Task 삭제
     */
    const deleteTask = useCallback(
        async (id: string) => {
            try {
                await apiDeleteAuth(`/api/v1/task/${id}`);
                await reloadTasks();
            } catch (err: any) {
                Alert.alert("삭제 실패", err.message || "Task 삭제 중 오류 발생");
            }
        },
        [reloadTasks]
    );

    /**
     * Task ID로 찾기
     */
    const getTaskById = (id: string) => tasks.find((t) => t.id === id);

    /**
     * 날짜별 Task 그룹화
     */
    const tasksByDate = useMemo(() => {
        const grouped: Record<string, Task[]> = {};
        for (const t of tasks) {
            (grouped[t.date] ||= []).push(t);
        }
        return grouped;
    }, [tasks]);

    /**
     * Context 반환
     */
    return (
        <TasksCtx.Provider
            value={{
                tasks,
                tasksByDate,
                reloadTasks,
                getTaskById,
                updateTask,
                deleteTask,
            }}
        >
            {children}
        </TasksCtx.Provider>
    );
};

/**
 * Context 훅
 */
export const useTasks = () => {
    const ctx = useContext(TasksCtx);
    if (!ctx) throw new Error("useTasks는 TasksProvider 내부에서만 사용할 수 있습니다.");
    return ctx;
};

/**
 * 날짜 키 변환 (YYYY-MM-DD)
 */
export function toKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;
}
