// app/context/TasksContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

export type Priority = "High" | "Medium" | "Low";

export type Task = {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    desc?: string;
    priority: Priority;
};

type Ctx = {
    tasks: Task[];
    addTask: (t: Omit<Task, "id">) => void;
    tasksByDate: Record<string, Task[]>;
};

const TasksContext = createContext<Ctx | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);

    const addTask = (t: Omit<Task, "id">) => {
        setTasks((prev) => prev.concat([{ ...t, id: String(Date.now()) }]));
    };

    const tasksByDate = useMemo(() => {
        const m: Record<string, Task[]> = {};
        for (const t of tasks) {
            if (!m[t.date]) m[t.date] = [];
            m[t.date].push(t);
        }
        return m;
    }, [tasks]);

    const value: Ctx = { tasks, addTask, tasksByDate };
    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error("useTasks must be used within TasksProvider");
    return ctx;
}

// 유틸
export function toKey(d: Date) {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${dd}`;
}
