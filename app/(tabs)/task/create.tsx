import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // 추가됨
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import CalendarView from "../../../components/CalendarView";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 여기에 알림 기능 구현

const BASE_URL =
    Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

export default function CreateTaskScreen() {
    const router = useRouter();
    const { date } = useLocalSearchParams(); // 전달받은 날짜

    // 전달받은 date가 있으면 그걸 초기값으로, 없으면 오늘
    const [selectedDate, setSelectedDate] = useState(() => {
        if (date) return new Date(date as string);
        return new Date();
    });

    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [alertEnabled, setAlertEnabled] = useState(false);

    const [startTime, setStartTime] = useState<Date>(() => {
        const d = new Date();
        d.setHours(18, 0, 0, 0);
        return d;
    });
    const [endTime, setEndTime] = useState<Date>(() => {
        const d = new Date();
        d.setHours(21, 0, 0, 0);
        return d;
    });

    const [showPicker, setShowPicker] = useState<null | "start" | "end">(null);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const onChangeTime = (_e: DateTimePickerEvent, date?: Date) => {
        if (Platform.OS === "android") setShowPicker(null);
        if (!date) return;

        if (showPicker === "start") {
            setStartTime(date);
            if (date.getTime() >= endTime.getTime()) {
                const e = new Date(date);
                e.setHours(date.getHours() + 1);
                setEndTime(e);
            }
        } else if (showPicker === "end") {
            setEndTime(date);
            if (date.getTime() <= startTime.getTime()) {
                Alert.alert("시간 확인", "End Time은 Start Time 이후여야 합니다.");
            }
        }
    };

    // 한국 시간 기준으로 날짜 포맷팅
    const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleCreate = async () => {
        if (!name.trim()) return Alert.alert("입력 오류", "이름을 입력하세요.");

        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return Alert.alert("로그인 필요", "로그인 후 이용하세요.");

        const newTask = {
            title: name,
            content: content,
            date: formatLocalDate(selectedDate), // 클릭한 날짜 그대로 저장
            priority,
            alertEnabled,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        };

        try {
            const res = await fetch(`${BASE_URL}/api/v1/task`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newTask),
            });

            if (!res.ok) throw new Error("작업 생성 실패");

            Alert.alert("Task Created!", `"${name}"이 추가되었습니다.`, [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err) {
            console.error("Task 생성 오류:", err);
            Alert.alert("실패", "작업을 생성할 수 없습니다.");
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.back}>←</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>Create New Task</Text>

                    {/* 선택된 날짜 표시 */}
                    <Text style={styles.dateDisplay}>
                        {formatLocalDate(selectedDate)}
                    </Text>

                    {/* 캘린더 */}
                    <CalendarView selected={selectedDate} onDateSelect={setSelectedDate} />

                    {/* 입력 */}
                    <TextInput
                        style={styles.input}
                        placeholder="Task Name"
                        placeholderTextColor="#888"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={[styles.input, { height: 80 }]}
                        placeholder="Description"
                        placeholderTextColor="#888"
                        value={content}
                        onChangeText={setContent}
                        multiline
                    />

                    {/* 시간 선택 */}
                    <Text style={styles.label}>Time</Text>
                    <View style={styles.timeRow}>
                        <TouchableOpacity style={styles.timeBox} onPress={() => setShowPicker("start")}>
                            <Text style={styles.timeLabel}>Start</Text>
                            <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.timeBox} onPress={() => setShowPicker("end")}>
                            <Text style={styles.timeLabel}>End</Text>
                            <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
                        </TouchableOpacity>
                    </View>

                    {showPicker && (
                        <DateTimePicker
                            value={showPicker === "start" ? startTime : endTime}
                            mode="time"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={onChangeTime}
                            is24Hour={false}
                        />
                    )}

                    {/* 우선순위 */}
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.priorityRow}>
                        {["High", "Medium", "Low"].map((p) => (
                            <TouchableOpacity
                                key={p}
                                style={[
                                    styles.priorityBtn,
                                    priority === p && { backgroundColor: getPriorityColor(p) },
                                ]}
                                onPress={() => setPriority(p)}
                            >
                                <Text style={styles.priorityText}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 알림 */}
                    <View style={styles.alertRow}>
                        <Text style={styles.alertText}>Alert</Text>
                        <Switch value={alertEnabled} onValueChange={setAlertEnabled} />
                    </View>

                    {/* 버튼 */}
                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                        <Text style={styles.createText}>Create Task</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const getPriorityColor = (p: string) =>
    p === "High" ? "#f87171" : p === "Medium" ? "#a78bfa" : "#4ade80";

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 20 },
    back: { color: "#fff", fontSize: 22 },
    title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginVertical: 10 },
    dateDisplay: { color: "#a78bfa", fontSize: 16, marginBottom: 10 },
    input: {
        backgroundColor: "#16161a",
        color: "#fff",
        borderRadius: 10,
        padding: 12,
        marginVertical: 6,
    },
    label: { color: "#fff", fontSize: 16, marginTop: 12 },
    timeRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
    timeBox: {
        flex: 1,
        backgroundColor: "#16161a",
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 4,
    },
    timeLabel: { color: "#aaa", fontSize: 12 },
    timeValue: { color: "#fff", fontSize: 16, fontWeight: "600" },
    priorityRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
    priorityBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#555",
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 4,
        padding: 10,
    },
    priorityText: { color: "#fff" },
    alertRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    alertText: { color: "#fff", fontSize: 16 },
    createBtn: {
        marginTop: 30,
        backgroundColor: "#a78bfa",
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: "center",
    },
    createText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
