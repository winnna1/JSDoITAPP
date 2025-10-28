// app/(tabs)/task/AllTaskList.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import ProgressCard from "@/components/ProgressCard";
import { useTasks, toKey } from "../../context/TasksContext"; // ⬅️ context 연결
import { Priority } from "../../../components/CalendarView";

export default function AllTaskListScreen() {
    const router = useRouter();
    const { tasksByDate, updateTask } = useTasks(); // ⬅️ task 데이터 전역에서 불러옴

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayKey = toKey(today);
    const tomorrowKey = toKey(tomorrow);

    // ⬅️ context에서 오늘/내일 task 가져오기
    const todayTasks = tasksByDate[todayKey] ?? [];
    const tomorrowTasks = tasksByDate[tomorrowKey] ?? [];

    // 완료된 task 비율 계산
    const totalTasks = todayTasks.length + tomorrowTasks.length;
    const doneCount =
        todayTasks.filter((t) => t.done).length + tomorrowTasks.filter((t) => t.done).length;
    const progress = totalTasks ? doneCount / totalTasks : 0;

    // ✅ 제목 변경 핸들러 (즉시 업데이트)
    const handleTitleChange = (id: string, newTitle: string) => {
        updateTask(id, { title: newTitle });
    };

    // ✅ 완료 토글
    const toggleDone = (id: string, done: boolean) => {
        updateTask(id, { done });
    };

    const renderTaskCard = (task: any) => (
        <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            activeOpacity={0.8}
            onPress={() =>
                router.push({
                    pathname: "/(tabs)/task/edit", // ⬅️ 클릭 시 수정 화면 이동
                    params: { id: task.id },
                })
            }
        >
            {/* 우선순위 색상 표시 */}
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

            {/* 완료 버튼 */}
            <TouchableOpacity onPress={() => toggleDone(task.id, !task.done)}>
                <Text style={styles.checkmark}>{task.done ? "✅" : "○"}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    You have {totalTasks} tasks{"\n"}in total to complete
                </Text>
                <View style={styles.profileBadge}>
                    <View style={styles.avatar}></View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{doneCount}</Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Progress Section */}
                <Text style={styles.sectionTitle}>Progress</Text>
                <ProgressCard
                    title="Daily Task Progress"
                    progress={progress}
                    description={`${doneCount}/${totalTasks} Task Completed\nKeep going!`}
                />

                {/* 오늘의 일정 */}
                <Text style={styles.sectionTitle}>Today's Tasks</Text>
                {todayTasks.length === 0 ? (
                    <Text style={styles.emptyText}>No tasks for today.</Text>
                ) : (
                    todayTasks.map(renderTaskCard)
                )}

                {/* 내일 일정 */}
                <Text style={styles.sectionTitle}>Tomorrow's Tasks</Text>
                {tomorrowTasks.length === 0 ? (
                    <Text style={styles.emptyText}>No tasks for tomorrow.</Text>
                ) : (
                    tomorrowTasks.map(renderTaskCard)
                )}
            </ScrollView>

            {/* Floating Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push("/(tabs)/task/create")}
            >
                <Text style={styles.fabIcon}>＋</Text>
            </TouchableOpacity>
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
    profileBadge: { position: "relative" },
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
    fab: {
        position: "absolute",
        right: 20,
        bottom: 30,
        backgroundColor: "#a78bfa",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#a78bfa",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
    },
    fabIcon: { color: "#fff", fontSize: 30, fontWeight: "bold", marginTop: -2 },
    emptyText: { color: "#777", textAlign: "center", marginBottom: 10 },
});
