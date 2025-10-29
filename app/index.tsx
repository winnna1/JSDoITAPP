// app/index.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function IndexScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/(tabs)/task/login"); // 로그인 페이지로 이동
        }, 1500); // 1.5초 스플래시 후 이동

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>JSDoIT</Text>
            <ActivityIndicator size="large" color="#a78bfa" style={{ marginTop: 20 }} />
            <Text style={styles.subText}>Loading...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
        justifyContent: "center",
        alignItems: "center",
    },
    logo: { color: "#a78bfa", fontSize: 32, fontWeight: "bold" },
    subText: { color: "#888", fontSize: 14, marginTop: 10 },
});
