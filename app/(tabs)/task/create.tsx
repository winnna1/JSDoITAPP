// app/(tabs)/task/create.tsx
import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Switch, StyleSheet,
    ScrollView, Alert, ViewStyle, Platform
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import CalendarView from "../../../components/CalendarView";
import { useTasks, toKey } from "../../context/TasksContext";
import type { Priority } from "../../../components/CalendarView";

export default function CreateTaskScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ date?: string }>();
    const { addTask } = useTasks();

    const initialDate = params.date ? new Date(params.date) : new Date();

    // 날짜 / 입력값
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [priority, setPriority] = useState<Priority>("Medium");
    const [alertEnabled, setAlertEnabled] = useState(false);

    // 시간 (Date 객체로 관리)
    const [startTime, setStartTime] = useState<Date>(() => {
        const d = new Date(); d.setHours(18, 0, 0, 0); return d; // 06:00 PM
    });
    const [endTime, setEndTime] = useState<Date>(() => {
        const d = new Date(); d.setHours(21, 0, 0, 0); return d; // 09:00 PM
    });

    // 어떤 피커를 띄울지
    const [showPicker, setShowPicker] = useState<null | "start" | "end">(null);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });

    const onChangeTime = (event: DateTimePickerEvent, date?: Date) => {
        // 안드로이드는 선택/취소 시 자동으로 닫히므로 여기서 닫아줌
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

    const handleCreate = () => {
        if (!name.trim()) {
            Alert.alert("⚠️ Missing name", "Please enter a task name.");
            return;
        }
        if (endTime.getTime() <= startTime.getTime()) {
            Alert.alert("시간 확인", "End Time은 Start Time 이후여야 합니다.");
            return;
        }

        const dateKey = toKey(selectedDate);

        addTask({
            title: name,
            desc,
            date: dateKey,
            priority,
            alertEnabled,                         // 토글 값 그대로
            startTime: startTime.toISOString(),   // ✅ ISO로 저장
            endTime: endTime.toISOString(),       // ✅ ISO로 저장
        });

        Alert.alert("✅ Task Created!", `"${name}" on ${dateKey}`, [
            { text: "OK", onPress: () => router.back() },
        ]);
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create new task</Text>

            {/* 선택 유지되는 달력 */}
            <CalendarView selected={selectedDate} onDateSelect={setSelectedDate} />

            <Text style={styles.sectionTitle}>Schedule</Text>

            <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description"
                placeholderTextColor="#888"
                multiline
                value={desc}
                onChangeText={setDesc}
            />

            {/* Time Row */}
            <View style={styles.timeRow}>
                <TouchableOpacity style={styles.timeBox} onPress={() => setShowPicker("start")}>
                    <Text style={styles.timeLabel}>Start Time</Text>
                    <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.timeBox} onPress={() => setShowPicker("end")}>
                    <Text style={styles.timeLabel}>End Time</Text>
                    <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
            </View>

            {/* iOS/Android 네이티브 시간 피커 */}
            {showPicker && (
                <DateTimePicker
                    value={showPicker === "start" ? startTime : endTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "default" : "default"}         // ⬅︎ 변경: 호환 안전
                    is24Hour={false}
                    onChange={onChangeTime}
                />
            )}

            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.priorityRow}>
                {(["High", "Medium", "Low"] as Priority[]).map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.priorityButton, priority === p && getPriorityStyle(p)]}
                        onPress={() => setPriority(p)}
                    >
                        <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
                            {p}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.alertRow}>
                <Text style={styles.alertText}>Get alert for this task</Text>
                <Switch value={alertEnabled} onValueChange={setAlertEnabled} thumbColor="#a78bfa" />
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                <Text style={styles.createText}>Create Task</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const getPriorityStyle = (p: Priority): ViewStyle => ({
    backgroundColor: p === "High" ? "#f87171" : p === "Medium" ? "#a78bfa" : "#4ade80",
    borderColor: "transparent",
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 20 },
    back: { color: "#fff", fontSize: 24, marginBottom: 10 },
    title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 10 },

    sectionTitle: { color: "#fff", fontSize: 18, marginTop: 20, marginBottom: 8 },

    input: {
        backgroundColor: "#16161a",
        borderRadius: 10,
        color: "#fff",
        padding: 12,
        marginBottom: 10,
    },

    // --- Time row ---
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 4,
    },
    timeBox: {
        flex: 1,
        backgroundColor: "#16161a",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    timeLabel: { color: "#ccc", marginBottom: 6, fontSize: 12 },
    timeValue: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
        textAlign: "left",
    },

    // --- Priority ---
    priorityRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        marginTop: 8,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#555",
        marginHorizontal: 4,
        alignItems: "center",
    },
    priorityText: { color: "#ccc" },
    priorityTextActive: { color: "#fff", fontWeight: "bold" },

    // --- Alert toggle ---
    alertRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
    alertText: { color: "#fff", fontSize: 16 },

    // --- Create button ---
    createBtn: {
        marginTop: 30,
        backgroundColor: "#a78bfa",
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: "center",
    },
    createText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
