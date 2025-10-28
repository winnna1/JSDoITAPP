// app/(tabs)/home.tsx
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import CalendarView, { Priority } from "../../components/CalendarView";
import ProgressCard from "../../components/ProgressCard";
import FloatingButton from "../../components/FloatingButton";
import { useTasks, toKey } from "../context/TasksContext";

export default function HomeScreen() {
    const router = useRouter();
    const { tasks, tasksByDate } = useTasks();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // 달력 마커용: 날짜별 우선순위 배열 만들기
    const markers = useMemo<Record<string, Priority[]>>(() => {
        const m: Record<string, Priority[]> = {};
        for (const [dateKey, arr] of Object.entries(tasksByDate)) {
            m[dateKey] = arr.map((t) => t.priority as Priority);
        }
        return m;
    }, [tasksByDate]);

    const dayKey = toKey(selectedDate);
    const dayTasks = tasksByDate[dayKey] ?? [];

    const completed = dayTasks.filter((t) => (t as any).done).length; // done 필드가 있다면 활용
    const progress = dayTasks.length ? completed / dayTasks.length : 0;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <CalendarView
                    selected={selectedDate}
                    onDateSelect={setSelectedDate}
                    markers={markers}
                />

                {/* 캘린더 아래 섹션: 선택 날짜 일정 */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {dayKey} 일정 ({dayTasks.length})
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/(tabs)/task/create",
                                params: { date: dayKey },
                            })
                        }
                    >
                        <Text style={styles.link}>새로 추가</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.taskList}>
                    {dayTasks.length === 0 ? (
                        <Text style={{ color: "#aaa", textAlign: "center", padding: 12 }}>
                            이 날짜에는 일정이 없어요.
                        </Text>
                    ) : (
                        dayTasks.map((t) => (
                            <View key={t.id} style={[styles.taskItem]}>
                                <Text style={styles.taskTitle}>{t.title}</Text>
                                <Text style={styles.taskTime}>{t.priority}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Progress (선택 날짜 기준) */}
                <View style={styles.progressHeader}>
                    <Text style={styles.sectionTitle}>Progress</Text>
                    <TouchableOpacity onPress={() => {}}>
                        <Text style={styles.link}>See All</Text>
                    </TouchableOpacity>
                </View>
                <ProgressCard
                    title="Daily Task"
                    progress={progress}
                    description={`${completed}/${dayTasks.length} Task Completed\nYou are almost done, go ahead!`}
                />
            </ScrollView>

            <FloatingButton
                onPress={() =>
                    router.push({
                        pathname: "/(tabs)/task/create",
                        params: { date: dayKey },
                    })
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b0b0f", padding: 20 },
    sectionHeader: {
        marginTop: 16,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    progressHeader: {
        marginTop: 18,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    sectionTitle: { fontSize: 20, color: "#fff", fontWeight: "bold" },
    link: { color: "#a78bfa", fontSize: 14 },
    taskList: {
        backgroundColor: "#16161a",
        borderRadius: 10,
        padding: 8,
    },
    taskItem: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: "#1e1e24",
        marginBottom: 8,
    },
    taskTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
    taskTime: { color: "#a5a5b0", marginTop: 4, fontSize: 12 },
});
