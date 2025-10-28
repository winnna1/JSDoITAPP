import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import CalendarView from "../../components/CalendarView";
import ProgressCard from "../../components/ProgressCard";
import FloatingButton from "../../components/FloatingButton";

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <CalendarView />

            <View style={styles.progressSection}>
                <Text style={styles.sectionTitle}>Progress</Text>
                <TouchableOpacity onPress={() => alert("View all tasks!")}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            <ProgressCard
                title="Daily Task"
                progress={0.66}
                description="2/4 Task Completed\nYou are almost done, go ahead!"
            />

            <FloatingButton onPress={() => router.push("/(tabs)/task/create")} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
        padding: 20,
    },
    progressSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
    },
    seeAll: {
        color: "#a78bfa",
        fontSize: 14,
    },
});
