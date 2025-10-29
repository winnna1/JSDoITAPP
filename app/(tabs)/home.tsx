import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import CalendarView, { Priority } from "../../components/CalendarView";
import ProgressCard from "../../components/ProgressCard";
import FloatingButton from "../../components/FloatingButton";
import { useTasks, toKey } from "../../context/TasksContext";

export default function HomeScreen() {
    const router = useRouter();
    const { tasksByDate, reloadTasks } = useTasks();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // 화면 들어올 때 토큰이 존재하면 reloadTasks 실행
    useFocusEffect(
        React.useCallback(() => {
            reloadTasks();
        }, [reloadTasks])
    );

    const markers = useMemo<Record<string, Priority[]>>(() => {
        const m: Record<string, Priority[]> = {};
        for (const [dateKey, arr] of Object.entries(tasksByDate)) {
            m[dateKey] = arr.map((t) => t.priority);
        }
        return m;
    }, [tasksByDate]);

    const dayKey = toKey(selectedDate);

    const dayTasks = tasksByDate[dayKey] ?? [];

    const completed = dayTasks.filter((t) => t.done).length;
    const progress = dayTasks.length ? completed / dayTasks.length : 0;

    const ftime = (iso?: string) =>
        iso
            ? new Date(iso).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })
            : "--";

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <CalendarView
                    selected={selectedDate}
                    onDateSelect={setSelectedDate}
                    markers={markers}
                />

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
                        <Text style={styles.emptyText}>이 날짜에는 일정이 없어요.</Text>
                    ) : (
                        dayTasks.map((t) => (
                            <TouchableOpacity
                                key={t.id}
                                style={styles.taskItem}
                                activeOpacity={0.8}
                                onPress={() =>
                                    router.push({
                                        pathname: "/(tabs)/task/edit",
                                        params: { id: t.id },
                                    })
                                }
                            >
                                <Text style={styles.taskTitle}>{t.title}</Text>
                                <Text style={styles.taskTime}>
                                    {ftime(t.startTime)} ~ {ftime(t.endTime)} ({t.priority})
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={styles.progressHeader}>
                    <Text style={styles.sectionTitle}>Progress</Text>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/(tabs)/task/AllTaskList",
                                params: { date: dayKey },
                            })
                        }
                    >
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
    taskList: { backgroundColor: "#16161a", borderRadius: 10, padding: 8 },
    emptyText: { color: "#aaa", textAlign: "center", padding: 12 },
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
