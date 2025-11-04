// utils/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// SDK 54 Notification Handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Android 채널 설정
export async function setupNotificationChannel() {
    if (Device.osName === "Android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }
}

// 권한 요청 및 Expo Push Token 등록
export async function registerForPushNotificationsAsync() {
    let token: string | undefined;
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            alert("알림 권한이 필요합니다!");
            return;
        }

        const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
        const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
        token = pushToken.data;
        console.log("📱 Expo Push Token:", token);
    } else {
        alert("실기기에서만 푸시 알림이 동작합니다.");
    }
    return token;
}

/** ---------------------------------------------------------------
 *  Task별 notificationId 저장/조회/취소 유틸
 *  --------------------------------------------------------------- */
const notifKey = (taskId: string | number) => `notif:task:${taskId}`;

async function saveNotificationId(taskId: string | number, id: string) {
    await AsyncStorage.setItem(notifKey(taskId), id);
}

async function loadNotificationId(taskId: string | number) {
    return AsyncStorage.getItem(notifKey(taskId));
}

export async function cancelTaskNotification(taskId: string | number) {
    const id = await loadNotificationId(taskId);
    if (id) {
        try {
            await Notifications.cancelScheduledNotificationAsync(id);
        } catch (e) {
            console.warn("취소 실패(이미 없음 가능):", e);
        }
        await AsyncStorage.removeItem(notifKey(taskId));
    }
}

/** ---------------------------------------------------------------
 *  로컬 알림 (5초 테스트용)
 *  --------------------------------------------------------------- */
export async function scheduleLocalNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "JSDoIT 알림",
            body: "작업이 완료되었습니다!",
            sound: true,
        },
        // Date 기반 트리거 (명시적 타입 추가)
        trigger: {date: new Date(Date.now() + 5 * 1000)} as unknown as Notifications.CalendarTriggerInput,
    });
}

/** ---------------------------------------------------------------
 *  Task 알림 예약 (기본: 시작 1분 전)
 *  - 이미 예약된 게 있으면 취소 후 재예약
 *  - 앱 재시작에도 유지되는 date 트리거 방식
 *  --------------------------------------------------------------- */
type STask = {
    id: string | number;
    title: string;
    startTime?: string; // ISO string
};

export async function scheduleTaskNotification(
    task: STask,
    advanceMinutes = 1
) {
    try {
        if (!task?.startTime) return;

        const now = new Date();
        const start = new Date(task.startTime);

        // 예약 시각: 시작 1분 전
        const triggerDate = new Date(start.getTime() - advanceMinutes * 60 * 1000);

        // 이미 지난 시간이면 예약 안 함
        if (triggerDate.getTime() <= now.getTime() + 5000) {
            console.log("이미 지난/임박 시간 → 알림 예약 안 함");
            await cancelTaskNotification(task.id);
            return;
        }

        // 기존 예약 취소 후 새로 예약
        await cancelTaskNotification(task.id);

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Task 시작 1분 전!",
                body: `${task.title} — 곧 시작할 시간이에요.`,
                sound: true,
            },
            // 명시적 CalendarTriggerInput 사용
            trigger: {date: triggerDate} as unknown as Notifications.CalendarTriggerInput,
        });

        await saveNotificationId(task.id, id);
        console.log(
            `알림 예약 완료: ${triggerDate.toLocaleString()} (taskId=${task.id}, id=${id})`
        );
    } catch (err) {
        console.error("알림 예약 실패:", err);
    }
}
