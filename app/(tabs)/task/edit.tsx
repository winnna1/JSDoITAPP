// app/(tabs)/task/edit.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    Alert,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import CalendarView, { Priority } from "../../../components/CalendarView";
import { useTasks, toKey } from "@/context/TasksContext";
import {
    cancelTaskNotification,
    scheduleTaskNotification,
} from "../../../utils/notifications";

export default function EditTaskScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    // @ts-ignore
    const { getTaskById, updateTask } = useTasks();

    const task = useMemo(() => (id ? getTaskById(id) : undefined), [id, getTaskById]);

    useEffect(() => {
        if (!task) {
            Alert.alert("Not found", "Task not found.", [{ text: "OK", onPress: () => router.back() }]);
        }
    }, [task]);

    if (!task) return null;

    // 상태
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(task.date));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [name, setName] = useState(task.title);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [content, setContent] = useState(task.content ?? "");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [priority, setPriority] = useState<Priority>(task.priority as Priority);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [alertEnabled, setAlertEnabled] = useState<boolean>(!!task.alertEnabled);

    const toDateOr = (iso?: string, h = 18, m = 0) => {
        if (iso) return new Date(iso);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [startTime, setStartTime] = useState<Date>(toDateOr(task.startTime, 18, 0));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [endTime, setEndTime] = useState<Date>(toDateOr(task.endTime, 21, 0));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [showPicker, setShowPicker] = useState<null | "start" | "end">(null);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });

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

    /** 수정 저장 */
    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("입력 확인", "이름을 입력해 주세요.");
            return;
        }
        if (endTime.getTime() <= startTime.getTime()) {
            Alert.alert("시간 확인", "End Time은 Start Time 이후여야 합니다.");
            return;
        }

        try {
            // Task 업데이트
            updateTask(task.id, {
                title: name,
                content: content,
                date: toKey(selectedDate),
                priority,
                alertEnabled,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            });

            // 알림 처리
            if (alertEnabled) {
                // 새 시간으로 1분 전 예약
                await scheduleTaskNotification(
                    {
                        id: task.id,
                        title: name,
                        startTime: startTime.toISOString(),
                    },
                    1 // 시작 1분 전
                );
            } else {
                // OFF일 경우 기존 예약 취소
                await cancelTaskNotification(task.id);
            }

            Alert.alert("Saved", "Task updated.", [{ text: "OK", onPress: () => router.back() }]);
        } catch (err) {
            console.error("Task 저장/알림 오류:", err);
            Alert.alert("에러", "저장 중 문제가 발생했습니다.");
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Edit Task</Text>

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
                value={content}
                onChangeText={setContent}
            />

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

            {showPicker && (
                <DateTimePicker
                    value={showPicker === "start" ? startTime : endTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "default" : "default"}
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

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const getPriorityStyle = (p: Priority) => ({
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

    timeRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 4 },
    timeBox: { flex: 1, backgroundColor: "#16161a", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
    timeLabel: { color: "#ccc", marginBottom: 6, fontSize: 12 },
    timeValue: { color: "#fff", fontWeight: "600", fontSize: 16, textAlign: "left" },

    priorityRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, marginTop: 8 },
    priorityButton: {
        flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#555",
        marginHorizontal: 4, alignItems: "center",
    },
    priorityText: { color: "#ccc" },
    priorityTextActive: { color: "#fff", fontWeight: "bold" },

    alertRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
    alertText: { color: "#fff", fontSize: 16 },

    saveBtn: { marginTop: 30, backgroundColor: "#a78bfa", borderRadius: 10, paddingVertical: 15, alignItems: "center" },
    saveText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
