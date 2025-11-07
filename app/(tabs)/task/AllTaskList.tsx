import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressCard from "@/components/ProgressCard";
import { BASE_URL } from "../../../config/config";

export default function AllTaskListScreen() {
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [userImage, setUserImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [grass, setGrass] = useState<{ date: string; count: number }[]>([]);
    const [total, setTotal] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

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

    // 잔디 데이터 불러오기
    const loadGrass = async () => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) return;
            const res = await fetch(`${BASE_URL}/api/v1/task/grass`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("잔디 요청 실패");
            const data = await res.json();
            setGrass(data);
            setTotal(data.reduce((sum: number, g: { count: number }) => sum + g.count, 0));
        } catch (err) {
            console.error("잔디 불러오기 실패:", err);
        }
    };

    // 초기 로드
    useEffect(() => {
        loadUserProfile();
        loadTasks();
        loadGrass();
    }, []);

    // 완료 상태 토글 (잔디 반영)
    const toggleDone = async (id: string) => {
        try {
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
            );

            const token = await AsyncStorage.getItem("accessToken");
            if (!token) return;

            const task = tasks.find((t) => t.id === id);
            if (!task) return;

            await fetch(`${BASE_URL}/api/v1/task/${id}/done?done=${!task.done}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log(`Task(${id}) 완료 상태 변경됨 → ${!task.done}`);

            // 잔디 즉시 갱신
            await loadGrass();
        } catch (err) {
            console.error("완료 상태 변경 실패:", err);
            Alert.alert("오류", "Task 완료 상태 변경 실패");
        }
    };

    // 날짜 계산
    const getLocalDate = (offsetDays = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        return date.toLocaleDateString("sv-SE"); // YYYY-MM-DD
    };

    const today = getLocalDate(0);
    const tomorrow = getLocalDate(1);

    const todayTasks = tasks.filter((t) => t.date === today);
    const tomorrowTasks = tasks.filter((t) => t.date === tomorrow);

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

    // 한국 시간 기준 오늘
    const now = new Date();
    const todayKST = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    // 최근 1년 + 내일(오늘+1일)
    const days: Date[] = [];
    for (let i = -1; i < 365; i++) {
        const d = new Date(todayKST);
        d.setDate(todayKST.getDate() - i);
        days.unshift(d);
    }

    // 데이터 매핑
    const dataMap = new Map(grass.map((g) => [g.date, g.count]));

    // 주 단위 그룹화
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

    // 월 표시
    const monthLabels: { index: number; month: string }[] = [];
    let prevMonth = "";
    weeks.forEach((w, i) => {
        const firstDay = w[0];
        const monthName = firstDay.toLocaleString("default", { month: "short" });
        if (monthName !== prevMonth) {
            monthLabels.push({ index: i, month: monthName });
            prevMonth = monthName;
        }
    });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#a78bfa" />
            </View>
        );
    }

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

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={async () => {
                            setRefreshing(true);
                            await loadTasks();
                            await loadGrass();
                            setRefreshing(false);
                        }}
                    />
                }
            >
                {/* Progress Section */}
                <Text style={styles.sectionTitle}>Progress</Text>
                <ProgressCard
                    title="Daily Task Progress"
                    progress={progress}
                    description={`${doneCount}/${totalTasks} completed`}
                />

                {/* Grass Section */}
                <View style={styles.grassContainer}>
                    <Text style={styles.grassHeader}>
                        {`${total} contributions in the last year`}
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                            <View style={styles.monthHeader}>
                                {monthLabels.map((m) => (
                                    <Text
                                        key={m.index}
                                        style={[styles.monthLabel, { left: m.index * 10.5 }]}
                                    >
                                        {m.month}
                                    </Text>
                                ))}
                            </View>

                            <View style={styles.chartContainer}>
                                <View style={styles.weekLabels}>
                                    <Text style={styles.weekLabel}>Mon</Text>
                                    <Text style={styles.weekLabel}>Wed</Text>
                                    <Text style={styles.weekLabel}>Fri</Text>
                                </View>

                                <View style={styles.grid}>
                                    {weeks.map((week, wIdx) => (
                                        <View key={wIdx} style={styles.column}>
                                            {week.map((day, dIdx) => {
                                                const key = day.toISOString().slice(0, 10);
                                                const count = dataMap.get(key) || 0;
                                                return (
                                                    <View
                                                        key={dIdx}
                                                        style={[
                                                            styles.cell,
                                                            { backgroundColor: getColorByCount(count) },
                                                        ]}
                                                    />
                                                );
                                            })}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Task Section */}
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

const getColorByCount = (count: number) => {
    if (count >= 5) return "#16a34a";
    if (count >= 3) return "#22c55e";
    if (count >= 2) return "#4ade80";
    if (count >= 1) return "#86efac";
    return "#27272a";
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b0b0f", padding: 20 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 50,
        borderWidth: 2.5,
        borderColor: "#a78bfa",
    },
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
    grassContainer: { marginTop: 25 },
    grassHeader: { color: "#ccc", fontSize: 13, marginBottom: 8, fontWeight: "500" },
    monthHeader: { position: "relative", height: 16, marginLeft: 30 },
    monthLabel: { position: "absolute", color: "#aaa", fontSize: 9 },
    chartContainer: { flexDirection: "row", alignItems: "flex-start" },
    weekLabels: { marginRight: 4, justifyContent: "space-between", height: 72, paddingVertical: 2 },
    weekLabel: { color: "#888", fontSize: 9 },
    grid: { flexDirection: "row", flexWrap: "nowrap" },
    column: { flexDirection: "column", marginRight: 1.3 },
    cell: { width: 9, height: 9, marginVertical: 0.7, borderRadius: 2 },
});
