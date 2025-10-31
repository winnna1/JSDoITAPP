import React, { useMemo, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CalendarView, { Priority } from "../../components/CalendarView";
import ProgressCard from "../../components/ProgressCard";
import FloatingButton from "../../components/FloatingButton";
import { useTasks, toKey } from "../../context/TasksContext";

const BASE_URL =
    Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

export default function HomeScreen() {
    const router = useRouter();
    const { tasksByDate, reloadTasks } = useTasks();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // 프로필 이미지 로드
    useEffect(() => {
        const loadProfileImage = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    if (user.imageUrl) setProfileImage(`${BASE_URL}${user.imageUrl}`);
                }
            } catch (err) {
                console.error("프로필 이미지 로드 실패:", err);
            }
        };
        loadProfileImage();
    }, []);

    // 일정 및 날짜 로드
    useFocusEffect(
        React.useCallback(() => {
            // 홈 화면이 다시 포커스될 때마다
            reloadTasks();
            setSelectedDate(new Date()); // 현재 날짜로 리셋
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
                {/* 상단 헤더: 선택된 날짜 + 프로필 이미지 */}
                <View style={styles.topHeader}>
                    <Text style={styles.dateText}>
                        {`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`}
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push("/(tabs)/task/profile")}
                        style={styles.profileWrapper}
                    >
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, { backgroundColor: "#444" }]} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* 달력 */}
                <CalendarView
                    selected={selectedDate}
                    onDateSelect={(date) => setSelectedDate(date)} // 클릭한 날짜 반영
                    markers={markers}
                />

                {/* 일정 섹션 */}
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

                {/* Progress */}
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

    // 상단 헤더
    topHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 10,
    },
    profileWrapper: {
        position: "relative",
        alignSelf: "flex-end",
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 50,
        marginRight: 20,
        borderWidth: 2,
        borderColor: "#a78bfa",
    },
    dateText: {
        flex: 1,
        textAlign: "center",
        marginRight: -70,
        fontSize: 25,
        fontWeight: "bold",
        color: "#fff",
    },

    // 기존 스타일 유지
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
