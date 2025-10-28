// app/(tabs)/task/edit.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import CalendarView from "../../../components/CalendarView";

export default function EditTaskScreen() {
    const router = useRouter();
    const [desc, setDesc] = useState("1 hour of exercise, 2 hours of reading per day.");
    const [startTime, setStartTime] = useState("06 : 00 PM");
    const [endTime, setEndTime] = useState("10 : 00 PM");
    const [priority, setPriority] = useState("High");
    const [alert, setAlert] = useState(true);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.back}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Mobile App Research</Text>
            <CalendarView />

            <Text style={styles.sectionTitle}>Schedule</Text>

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
                        <Text
                            style={[
                                styles.priorityText,
                                priority === p && styles.priorityTextActive(p),
                            ]}
                        >
                            {p}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.alertRow}>
                <Text style={styles.alertText}>Get alert for this task</Text>
                <Switch value={alert} onValueChange={setAlert} thumbColor="#a78bfa" />
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#a78bfa" }]}>
                    <Text style={styles.btnText}>Edit Task</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#f87171" }]}>
                    <Text style={styles.btnText}>Delete Task</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    ...require("./create").styles,
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 15,
        marginHorizontal: 5,
        borderRadius: 10,
        alignItems: "center",
    },
    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
