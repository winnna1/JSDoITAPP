import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TasksProvider } from "@/context/TasksContext";
import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";

export default function RootLayout() {
    useEffect(() => {
        const setupNotifications = async () => {
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

                // 포그라운드 알림 리스너 등록
                const sub = Notifications.addNotificationReceivedListener((notification) => {
                    const { title, body } = notification.request.content;
                    Alert.alert(title ?? "알림", body ?? "");
                });

                return () => sub.remove();
            } catch (err) {
                console.error("알림 초기화 실패:", err);
            }
        };

        setupNotifications();
    }, []);

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
