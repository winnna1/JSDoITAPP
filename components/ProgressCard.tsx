import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProgressCard({ title, progress, description }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.desc}>{description}</Text>

            <View style={styles.barContainer}>
                <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#16161a",
        borderRadius: 10,
        padding: 16,
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    desc: {
        color: "#ccc",
        fontSize: 13,
        marginBottom: 10,
    },
    barContainer: {
        width: "100%",
        height: 10,
        borderRadius: 5,
        backgroundColor: "#333",
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        backgroundColor: "#a78bfa",
    },
    percent: {
        textAlign: "right",
        color: "#fff",
        fontWeight: "600",
        marginTop: 4,
    },
});
