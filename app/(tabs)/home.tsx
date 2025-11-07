import React, { useMemo, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Platform,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CalendarView, { Priority } from "../../components/CalendarView";
import ProgressCard from "../../components/ProgressCard";
import FloatingButton from "../../components/FloatingButton";
import { useTasks, toKey } from "../../context/TasksContext";
import GrassView from "../../components/GrassView";
import { BASE_URL } from "../../config/config"

export default function HomeScreen() {
    const router = useRouter();
    const { tasksByDate, reloadTasks } = useTasks();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    /**프로필 이미지 최초 로드 */
    useEffect(() => {
        const loadProfileImage = async () => {
            try {
                const token = await AsyncStorage.getItem("accessToken");
                if (!token) return;

                // 캐시된 user 데이터 확인
                const cached = await AsyncStorage.getItem("user");
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.imageUrl) {
                        const uri = parsed.imageUrl.startsWith("http")
                            ? parsed.imageUrl
                            : `${BASE_URL}${parsed.imageUrl}`;
                        setProfileImage(`${uri}?t=${Date.now()}`); // 캐시 방지
                        return;
                    }
                }

                // 서버에서 최신 프로필 요청
                const res = await fetch(`${BASE_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error("프로필 요청 실패");

                const profile = await res.json();
                if (profile.imageUrl) {
                    const uri = profile.imageUrl.startsWith("http")
                        ? profile.imageUrl
                        : `${BASE_URL}${profile.imageUrl}`;
                    setProfileImage(`${uri}?t=${Date.now()}`);
                }

                // 캐시 저장
                await AsyncStorage.setItem("user", JSON.stringify(profile));
            } catch (err) {
                console.error("프로필 이미지 로드 실패:", err);
                Alert.alert("오류", "프로필 이미지를 불러오지 못했습니다.");
            }
        };

        loadProfileImage();
    }, []);

    /** 화면 포커스 시 Task 및 프로필 갱신 */
    useFocusEffect(
        React.useCallback(() => {
            reloadTasks();
            setSelectedDate(new Date());
            setRefreshKey((prev) => prev + 1);

            const refreshProfile = async () => {
                try {
                    const token = await AsyncStorage.getItem("accessToken");
                    if (!token) return;

                    const res = await fetch(`${BASE_URL}/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!res.ok) throw new Error("프로필 요청 실패");

                    const profile = await res.json();
                    const uri = profile.imageUrl.startsWith("http")
                        ? profile.imageUrl
                        : `${BASE_URL}${profile.imageUrl}`;
                    setProfileImage(`${uri}?t=${Date.now()}`); // 새로고침 시 최신 이미지

                    await AsyncStorage.setItem("user", JSON.stringify(profile));
                } catch (err) {
                    console.error("프로필 새로고침 실패:", err);
                }
            };

            refreshProfile();
        }, [reloadTasks])
    );

    /** Task 데이터 가공 */
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
                {/* 상단 헤더 */}
                <View style={styles.topHeader}>
                    <Text style={styles.dateText}>
                        {`${selectedDate.getFullYear()}-${String(
                            selectedDate.getMonth() + 1
                        ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(
                            2,
                            "0"
                        )}`}
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push("/(tabs)/task/profile")}
                        style={styles.profileWrapper}
                    >
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.profileImage} />
                        ) : (
                            <View
                                style={[styles.profileImage, { backgroundColor: "#444" }]}
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* 달력 */}
                <CalendarView
                    selected={selectedDate}
                    onDateSelect={(date) => setSelectedDate(date)}
                    markers={markers}
                />

                {/* 일정 목록 */}
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
                                <Text
                                    style={[
                                        styles.taskTitle,
                                        t.done && {
                                            textDecorationLine: "line-through",
                                            color: "#a78bfa",
                                        },
                                    ]}
                                >
                                    {t.title}
                                </Text>
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

                {/* 잔디 */}
                <GrassView key={refreshKey} />
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
        borderWidth: 2.5,
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
