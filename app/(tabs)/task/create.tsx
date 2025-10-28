// app/(tabs)/task/create.tsx
import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Switch, StyleSheet,
    ScrollView, Alert, ViewStyle,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CalendarView from "../../../components/CalendarView";
import { useTasks, toKey } from "../../context/TasksContext";
import type { Priority } from "../../../components/CalendarView";

export default function CreateTaskScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ date?: string }>();
    const { addTask } = useTasks();

    const initialDate = params.date
        ? new Date(params.date)
        : new Date();

    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [priority, setPriority] = useState<Priority>("Medium");
    const [alertEnabled, setAlertEnabled] = useState(false);

    const handleCreate = () => {
        if (!name.trim()) {
            Alert.alert("⚠️ Missing name", "Please enter a task name.");
            return;
        }
        const dateKey = toKey(selectedDate);
        addTask({ title: name, desc, date: dateKey, priority });

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
    priorityRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
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
    alertRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
    alertText: { color: "#fff", fontSize: 16 },
    createBtn: {
        marginTop: 30,
        backgroundColor: "#a78bfa",
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: "center",
    },
    createText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
