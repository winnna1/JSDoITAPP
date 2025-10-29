// app/(tabs)/task/AllTaskList.tsx
import React, { useMemo } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import ProgressCard from "@/components/ProgressCard";
import { useTasks, toKey } from "../../context/TasksContext";
import { Priority } from "../../../components/CalendarView";

export default function AllTaskListScreen() {
    const router = useRouter();
    const { tasksByDate, updateTask } = useTasks();

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayKey = toKey(today);
    const tomorrowKey = toKey(tomorrow);

    const todayTasks = tasksByDate[todayKey] ?? [];
    const tomorrowTasks = tasksByDate[tomorrowKey] ?? [];

    const totalTasks = todayTasks.length + tomorrowTasks.length;
    const doneCount =
        todayTasks.filter((t) => t.done).length +
        tomorrowTasks.filter((t) => t.done).length;
    const progress = totalTasks ? doneCount / totalTasks : 0;

    const handleTitleChange = (id: string, newTitle: string) => {
        updateTask(id, { title: newTitle });
    };

    const toggleDone = (id: string, done: boolean) => {
        updateTask(id, { done });
    };

    // ✅ 프로필 클릭 → 프로필 설정 페이지 이동
    const handleProfile = () => {
        router.push("/(tabs)/task/profile");
    };

    const renderTaskCard = (task: any) => (
        <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            activeOpacity={0.8}
            onPress={() =>
                router.push({
                    pathname: "/(tabs)/task/edit",
                    params: { id: task.id },
                })
            }
        >
            <View
                style={[
                    styles.colorBar,
                    {
                        backgroundColor:
                            task.priority === "High"
                                ? "#f87171"
                                : task.priority === "Medium"
                                    ? "#a78bfa"
                                    : "#4ade80",
                    },
                ]}
            />
            <View style={styles.taskInfo}>
                <TextInput
                    style={styles.taskTitle}
                    value={task.title}
                    onChangeText={(text) => handleTitleChange(task.id, text)}
                />
                <Text style={styles.taskDate}>📅 {task.date}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleDone(task.id, !task.done)}>
                <Text style={styles.checkmark}>{task.done ? "✅" : "○"}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    You have {totalTasks} tasks{"\n"}in total to complete
                </Text>

                {/* ✅ 프로필 클릭 */}
                <TouchableOpacity onPress={handleProfile}>
                    <View style={styles.avatar}></View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{doneCount}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Progress</Text>
                <ProgressCard
                    title="Daily Task Progress"
                    progress={progress}
                    description={`${doneCount}/${totalTasks} Task Completed\nKeep going!`}
                />

                <Text style={styles.sectionTitle}>Today&#39;s Tasks</Text>
                {todayTasks.length === 0
                    ? <Text style={styles.emptyText}>No tasks for today.</Text>
                    : todayTasks.map(renderTaskCard)}

                <Text style={styles.sectionTitle}>Tomorrow&#39;s Tasks</Text>
                {tomorrowTasks.length === 0
                    ? <Text style={styles.emptyText}>No tasks for tomorrow.</Text>
                    : tomorrowTasks.map(renderTaskCard)}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b0b0f", padding: 20 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 40,
    },
    backArrow: { color: "#fff", fontSize: 22 },
    headerText: { color: "#fff", fontSize: 20, fontWeight: "bold", flex: 1, marginLeft: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#3f3f46" },
    badge: {
        position: "absolute",
        right: -2,
        top: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#a78bfa",
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
    sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
    taskCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#16161a",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    colorBar: { width: 6, height: "100%", borderRadius: 4, marginRight: 10 },
    taskInfo: { flex: 1 },
    taskTitle: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        borderBottomWidth: 1,
        borderBottomColor: "#2d2d35",
        paddingVertical: 0,
    },
    taskDate: { color: "#a5a5b0", fontSize: 12, marginTop: 4 },
    checkmark: { color: "#a78bfa", fontSize: 22, marginLeft: 8 },
    emptyText: { color: "#777", textAlign: "center", marginBottom: 10 },
});
