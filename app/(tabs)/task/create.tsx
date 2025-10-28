// app/(tabs)/task/create.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import CalendarView from "../../../components/CalendarView";

export default function CreateTaskScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [startTime, setStartTime] = useState("06 : 00 PM");
    const [endTime, setEndTime] = useState("09 : 00 PM");
    const [priority, setPriority] = useState("Medium");
    const [alert, setAlert] = useState(false);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create new task</Text>
            <CalendarView />

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

            <View style={styles.timeRow}>
                <View style={styles.timeBox}>
                    <Text style={styles.timeLabel}>Start Time</Text>
                    <Text style={styles.timeValue}>{startTime}</Text>
                </View>
                <View style={styles.timeBox}>
                    <Text style={styles.timeLabel}>End Time</Text>
                    <Text style={styles.timeValue}>{endTime}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.priorityRow}>
                {["High", "Medium", "Low"].map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[
                            styles.priorityButton,
                            priority === p && styles.priorityActive(p),
                        ]}
                        onPress={() => setPriority(p)}
                    >
                        <Text style={[
                            styles.priorityText,
                            priority === p && styles.priorityTextActive(p),
                        ]}>
                            {p}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.alertRow}>
                <Text style={styles.alertText}>Get alert for this task</Text>
                <Switch value={alert} onValueChange={setAlert} thumbColor="#a78bfa" />
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={() => alert("Task Created!")}>
                <Text style={styles.createText}>Create Task</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

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
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    timeBox: { alignItems: "center", flex: 1 },
    timeLabel: { color: "#ccc", marginBottom: 4 },
    timeValue: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
        paddingVertical: 6,
        backgroundColor: "#16161a",
        borderRadius: 8,
        width: "90%",
        textAlign: "center",
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
    priorityActive: (p: string) => ({
        backgroundColor: p === "High" ? "#f87171" : p === "Medium" ? "#a78bfa" : "#4ade80",
        borderColor: "transparent",
    }),
    priorityText: { color: "#ccc" },
    priorityTextActive: (p: string) => ({
        color: "#fff",
        fontWeight: "bold",
    }),
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
    createText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
