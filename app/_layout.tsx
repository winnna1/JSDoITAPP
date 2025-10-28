// app/_layout.tsx (변경점: TasksProvider로 감싸기)
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TasksProvider } from "./context/TasksContext";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
                <TasksProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                    <StatusBar style="light" />
                </TasksProvider>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
