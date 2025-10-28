// app/context/TasksContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import type { Priority } from "../../components/CalendarView";

export type Task = {
    id: string;
    title: string;
    desc?: string;
    date: string;            // "YYYY-MM-DD"
    priority: Priority;
    done?: boolean;

    // 시간/알림(옵션)
    startTime?: string;      // ISO
    endTime?: string;        // ISO
    alertEnabled?: boolean;
};

type TasksContextType = {
    tasks: Task[];
    tasksByDate: Record<string, Task[]>;
    addTask: (t: Omit<Task, "id">) => void;
    updateTask: (id: string, patch: Partial<Task>) => void;
    getTaskById: (id: string) => Task | undefined;
};

const TasksCtx = createContext<TasksContextType | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);

    const addTask: TasksContextType["addTask"] = (t) => {
        const id = Math.random().toString(36).slice(2);
        setTasks((prev) => [...prev, { id, ...t }]);
    };

    const updateTask: TasksContextType["updateTask"] = (id, patch) => {
        setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    };

    const getTaskById = (id: string) => tasks.find((t) => t.id === id);

    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        for (const t of tasks) {
            (map[t.date] ||= []).push(t);
        }
        return map;
    }, [tasks]);

    return (
        <TasksCtx.Provider value={{ tasks, tasksByDate, addTask, updateTask, getTaskById }}>
            {children}
        </TasksCtx.Provider>
    );
}

export function useTasks() {
    const ctx = useContext(TasksCtx);
    if (!ctx) throw new Error("useTasks must be used within TasksProvider");
    return ctx;
}

// 유틸: Date → "YYYY-MM-DD"
export function toKey(d: Date) {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${dd}`;
}
