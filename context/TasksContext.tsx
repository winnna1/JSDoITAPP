import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useCallback,
    useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Alert } from "react-native";
import type { Priority } from "../components/CalendarView";

const BASE_URL =
    Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

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
    updateTask: (id: string, data: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
};

const TasksCtx = createContext<TasksContextType | null>(null);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [token, setToken] = useState<string | null>(null);

    // accessToken 주기적으로 확인
    useEffect(() => {
        const checkStoredToken = async () => {
            const stored = await AsyncStorage.getItem("accessToken");
            if (stored && stored !== token) {
                setToken(stored);
                console.log("새로운 토큰 로드됨");
            }
        };
        checkStoredToken();

        const interval = setInterval(checkStoredToken, 5000);
        return () => clearInterval(interval);
    }, [token]);

    // Task 목록 재로딩
    const reloadTasks = useCallback(async () => {
        const currentToken = await AsyncStorage.getItem("accessToken");
        if (!currentToken) {
            console.log("토큰 없음 — 로그인 후 실행 필요");
            return;
        }

        try {
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

    // Task 수정
    const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
        try {
            const currentToken = await AsyncStorage.getItem("accessToken");
            if (!currentToken) throw new Error("토큰 없음");

            const res = await fetch(`${BASE_URL}/api/v1/task/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(`수정 실패 (${res.status}): ${msg}`);
            }

            await reloadTasks();
            console.log(`Task(${id}) 업데이트 성공`);
        } catch (err: any) {
            console.error("updateTask error:", err);
            Alert.alert("업데이트 실패", err.message || "Task 수정 중 오류 발생");
        }
    }, [reloadTasks]);

    // Task 삭제
    const deleteTask = useCallback(async (id: string) => {
        try {
            const currentToken = await AsyncStorage.getItem("accessToken");
            if (!currentToken) throw new Error("토큰 없음");

            const res = await fetch(`${BASE_URL}/api/v1/task/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${currentToken}` },
            });

            if (!res.ok) throw new Error("삭제 실패");

            await reloadTasks();
            console.log(`Task(${id}) 삭제 완료`);
        } catch (err: any) {
            console.error("deleteTask error:", err);
            Alert.alert("삭제 실패", err.message || "Task 삭제 중 오류 발생");
        }
    }, [reloadTasks]);

    // 토큰 감지 시 자동 로드
    useEffect(() => {
        if (token) {
            console.log("토큰 감지됨 — Task 로드 시작");
            reloadTasks();
        }
    }, [token, reloadTasks]);

    // ID로 Task 찾기
    const getTaskById = (id: string) => tasks.find((t) => t.id === id);

    // 날짜별 그룹화
    const tasksByDate = useMemo(() => {
        const grouped: Record<string, Task[]> = {};
        for (const t of tasks) (grouped[t.date] ||= []).push(t);
        return grouped;
    }, [tasks]);

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

export const useTasks = () => {
    const ctx = useContext(TasksCtx);
    if (!ctx) throw new Error("useTasks는 TasksProvider 내부에서 사용해야 합니다.");
    return ctx;
};

// 날짜 포맷
export function toKey(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}