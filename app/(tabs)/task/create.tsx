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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // 새 SafeAreaView
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import CalendarView from "../../../components/CalendarView";
import { scheduleTaskNotification } from "../../../utils/notifications";
import { apiPostAuth } from "../../../lib/api"; // 통합된 API 유틸 사용

// Task 타입 정의
type STask = {
    id: string;
    title: string;
    content?: string;
    date: string;
    startTime: string;
    endTime: string;
    priority: "High" | "Medium" | "Low";
    alertEnabled?: boolean;
    userId?: string;
    username?: string;
};

export default function CreateTaskScreen() {
    const router = useRouter();
    const { date } = useLocalSearchParams();

    const [selectedDate, setSelectedDate] = useState(
        date ? new Date(date as string) : new Date()
    );
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
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

    /** 시간 포맷 */
    const formatTime = (d: Date) =>
        d.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    /** 시간 선택 변경 */
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

    /** YYYY-MM-DD 포맷 */
    const formatLocalDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    /** Task 생성 */
    const handleCreate = async () => {
        if (!name.trim()) return Alert.alert("입력 오류", "Task 이름을 입력하세요.");

        const newTask = {
            title: name,
            content,
            date: formatLocalDate(selectedDate),
            priority,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            alertEnabled,
        };

        try {
            // 서버에 Task 생성 요청
            const createdTask = await apiPostAuth<STask>("/api/v1/task", newTask);

            // 알림 설정이 켜져 있으면 예약
            if (alertEnabled) {
                await scheduleTaskNotification(createdTask);
            }

            Alert.alert("Task Created!", `"${name}"이 추가되었습니다.`, [
                { text: "OK", onPress: () => router.replace("/(tabs)/home") },
            ]);
        } catch (err: any) {
            console.error("Task 생성 오류:", err);
            Alert.alert("실패", err.message || "작업을 생성할 수 없습니다.");
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
                    <Text style={styles.dateDisplay}>{formatLocalDate(selectedDate)}</Text>

                    <CalendarView selected={selectedDate} onDateSelect={setSelectedDate} />

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

                    <Text style={styles.label}>Time</Text>
                    <View style={styles.timeRow}>
                        <TouchableOpacity
                            style={styles.timeBox}
                            onPress={() => setShowPicker("start")}
                        >
                            <Text style={styles.timeLabel}>Start</Text>
                            <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.timeBox}
                            onPress={() => setShowPicker("end")}
                        >
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

                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.priorityRow}>
                        {["High", "Medium", "Low"].map((p) => (
                            <TouchableOpacity
                                key={p}
                                style={[
                                    styles.priorityBtn,
                                    priority === p && { backgroundColor: getPriorityColor(p) },
                                ]}
                                onPress={() => setPriority(p as "High" | "Medium" | "Low")}
                            >
                                <Text style={styles.priorityText}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.alertRow}>
                        <Text style={styles.alertText}>Alert</Text>
                        <Switch value={alertEnabled} onValueChange={setAlertEnabled} />
                    </View>

                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                        <Text style={styles.createText}>Create Task</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/** 색상 함수 */
const getPriorityColor = (p: string) =>
    p === "High" ? "#f87171" : p === "Medium" ? "#a78bfa" : "#4ade80";

/** 스타일 */
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
