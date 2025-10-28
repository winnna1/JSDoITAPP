import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
                <Stack screenOptions={{ headerShown: false }} />
                <StatusBar style="light" />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
