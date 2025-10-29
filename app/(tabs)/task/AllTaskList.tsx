import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressCard from "@/components/ProgressCard";

const BASE_URL =
    Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

export default function AllTaskListScreen() {
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("accessToken");
                if (!token) throw new Error("토큰이 없습니다.");

                const res = await fetch(`${BASE_URL}/api/v1/task/today-tomorrow`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error("서버 요청 실패");
                const data = await res.json();
                setTasks(data);
            } catch (err) {
                console.error("작업 불러오기 실패:", err);
                Alert.alert("오류", "작업 목록을 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, []);

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const todayTasks = tasks.filter((t) => t.date === today);
    const tomorrowTasks = tasks.filter((t) => t.date === tomorrow);
    const totalTasks = todayTasks.length + tomorrowTasks.length;
    const doneCount = tasks.filter((t) => t.done).length;
    const progress = totalTasks ? doneCount / totalTasks : 0;

    const handleProfile = () => router.push("/(tabs)/task/profile");

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    You have {totalTasks} tasks{"\n"}to complete
                </Text>

                <TouchableOpacity onPress={handleProfile}>
                    <View style={styles.avatar}></View>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <Text style={styles.sectionTitle}>Progress</Text>
                <ProgressCard
                    title="Daily Task Progress"
                    progress={progress}
                    description={`${doneCount}/${totalTasks} completed`}
                />

                <Text style={styles.sectionTitle}>Today’s Tasks</Text>
                {todayTasks.length === 0 ? (
                    <Text style={styles.emptyText}>No tasks for today.</Text>
                ) : (
                    todayTasks.map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            style={styles.taskCard}
                            onPress={() =>
                                router.push({ pathname: "/(tabs)/task/edit", params: { id: t.id } })
                            }
                        >
                            <View
                                style={[
                                    styles.colorBar,
                                    { backgroundColor: getPriorityColor(t.priority) },
                                ]}
                            />
                            <View style={styles.taskInfo}>
                                <Text style={styles.taskTitle}>{t.title}</Text>
                                <Text style={styles.taskDate}>📅 {t.date}</Text>
                            </View>
                            <Text style={styles.checkmark}>{t.done ? "✅" : "○"}</Text>
                        </TouchableOpacity>
                    ))
                )}

                <Text style={styles.sectionTitle}>Tomorrow’s Tasks</Text>
                {tomorrowTasks.length === 0 ? (
                    <Text style={styles.emptyText}>No tasks for tomorrow.</Text>
                ) : (
                    tomorrowTasks.map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            style={styles.taskCard}
                            onPress={() =>
                                router.push({ pathname: "/(tabs)/task/edit", params: { id: t.id } })
                            }
                        >
                            <View
                                style={[
                                    styles.colorBar,
                                    { backgroundColor: getPriorityColor(t.priority) },
                                ]}
                            />
                            <View style={styles.taskInfo}>
                                <Text style={styles.taskTitle}>{t.title}</Text>
                                <Text style={styles.taskDate}>📅 {t.date}</Text>
                            </View>
                            <Text style={styles.checkmark}>{t.done ? "✅" : "○"}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const getPriorityColor = (priority: string) =>
    priority === "High"
        ? "#f87171"
        : priority === "Medium"
            ? "#a78bfa"
            : "#4ade80";

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
    taskTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
    taskDate: { color: "#a5a5b0", fontSize: 12, marginTop: 4 },
    checkmark: { color: "#a78bfa", fontSize: 22, marginLeft: 8 },
    emptyText: { color: "#777", textAlign: "center", marginBottom: 10 },
});
