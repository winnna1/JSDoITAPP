import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function CalendarView() {
    const [selected, setSelected] = useState<number | null>(9);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <View style={styles.calendar}>
            <Text style={styles.month}>OCTOBER 2025</Text>
            <View style={styles.row}>
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                    <Text key={day} style={[styles.dayLabel, day === "SUN" && styles.sun]}>
                        {day}
                    </Text>
                ))}
            </View>

            <View style={styles.grid}>
                {days.map((day) => (
                    <TouchableOpacity
                        key={day}
                        onPress={() => setSelected(day)}
                        style={[
                            styles.dayBox,
                            selected === day && styles.selectedBox,
                        ]}
                    >
                        <Text
                            style={[
                                styles.dayText,
                                selected === day && styles.selectedText,
                            ]}
                        >
                            {day}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    calendar: { alignItems: "center" },
    month: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    dayLabel: {
        color: "#aaa",
        width: 40,
        textAlign: "center",
        fontSize: 12,
    },
    sun: { color: "#ff5555" },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    dayBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        margin: 4,
    },
    selectedBox: { backgroundColor: "#a78bfa" },
    dayText: { color: "#fff" },
    selectedText: { color: "#000", fontWeight: "bold" },
});
