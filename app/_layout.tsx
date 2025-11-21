import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TasksProvider } from "@/context/TasksContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform, Alert, ActivityIndicator, View } from "react-native";

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const setup = async () => {
            // 알림 초기화
            try {
                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: false,
                        shouldShowBanner: true,
                        shouldShowList: true,
                    }),
                });

                const { status } = await Notifications.requestPermissionsAsync();
                if (status !== "granted") console.warn("알림 권한 거부됨");

                if (Platform.OS === "android") {
                    await Notifications.setNotificationChannelAsync("default", {
                        name: "Task Notifications",
                        importance: Notifications.AndroidImportance.HIGH,
                        sound: "default",
                    });
                }

                // 로그인 여부 확인
                const token = await AsyncStorage.getItem("accessToken");
                setIsLoggedIn(!!token);
            } catch (err) {
                console.error("초기화 실패:", err);
            } finally {
                setIsReady(true);
            }
        };

        setup();
    }, []);

    // 아직 초기화 중이면 로딩 스크린
    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
                <ActivityIndicator size="large" color="#a78bfa" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
                {/* 로그인된 경우에만 TasksProvider 활성화 */}
                {isLoggedIn ? (
                    <TasksProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                    </TasksProvider>
                ) : (
                    <Stack screenOptions={{ headerShown: false }} />
                )}
                <StatusBar style="light" />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

