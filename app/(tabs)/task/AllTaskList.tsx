import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressCard from "@/components/ProgressCard";

const BASE_URL =
    Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

export default function AllTaskListScreen() {
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [userImage, setUserImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 사용자 프로필 불러오기
    const loadUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) return;

            const cached = await AsyncStorage.getItem("user");
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.imageUrl) {
                    setUserImage(`${BASE_URL}${parsed.imageUrl}`);
                    return;
                }
            }

            const res = await fetch(`${BASE_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("프로필 요청 실패");
            const profile = await res.json();

            if (profile.imageUrl) {
                setUserImage(`${BASE_URL}${profile.imageUrl}`);
                await AsyncStorage.setItem("user", JSON.stringify(profile));
            }
        } catch (err) {
            console.error("프로필 불러오기 실패:", err);
        }
    };

    // Task 불러오기
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
        loadUserProfile();
    }, []);

    // Task 완료 상태 토글 (checkmark 클릭 시)
    const toggleDone = async (id: string) => {
        try {
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
            );

            const token = await AsyncStorage.getItem("accessToken");
            if (!token) return;

            // 서버에 즉시 반영
            const task = tasks.find((t) => t.id === id);
            const updated = { ...task, done: !task?.done };

            await fetch(`${BASE_URL}/api/v1/task/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updated),
            });
        } catch (err) {
            console.error("완료 상태 변경 실패:", err);
            Alert.alert("오류", "Task 완료 상태 변경 실패");
        }
    };

    // 날짜 계산
    const getLocalDate = (offsetDays = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        return date.toLocaleDateString("sv-SE");
    };

    const today = getLocalDate(0);
    const tomorrow = getLocalDate(1);

    const todayTasks = tasks.filter((t) => t.date === today);
    const tomorrowTasks = tasks.filter((t) => t.date === tomorrow);

    // ProgressBar 계산 (checkmark 변경 시 자동 반영)
    const { totalTasks, doneCount, progress } = useMemo(() => {
        const total = todayTasks.length + tomorrowTasks.length;
        const done = tasks.filter((t) => t.done).length;
        return {
            totalTasks: total,
            doneCount: done,
            progress: total ? done / total : 0,
        };
    }, [tasks]);

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
                    {userImage ? (
                        <Image source={{ uri: userImage }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: "#3f3f46" }]} />
                    )}
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
                            onPress={() => toggleDone(t.id)}
                            onLongPress={() =>
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
                            onPress={() => toggleDone(t.id)}
                            onLongPress={() =>
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
    headerText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        flex: 1,
        marginLeft: 12,
    },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    sectionTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 10,
    },
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