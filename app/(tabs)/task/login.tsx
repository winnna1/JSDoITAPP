import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const BASE_URL =
    Platform.OS === "android" ? "http://192.168.45.191:8080" : "http://localhost:8080";

/** 공통 fetch 유틸 */
async function apiRequest(url: string, options: RequestInit, router?: any) {
    const token = await AsyncStorage.getItem("accessToken");

    // JWT 토큰 자동 포함
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
    const text = await res.text();

    let data: any = {};
    try {
        data = JSON.parse(text);
    } catch {
        data = { message: text };
    }

    // 401 또는 403 ⇒ 자동 로그아웃 처리
    if (res.status === 401 || res.status === 403) {
        console.warn("JWT 인증 실패 → 자동 로그아웃");

        // 저장된 토큰 삭제
        await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);

        // 로그인 화면으로 이동
        if (router) {
            router.replace("/(tabs)/task/login"); // 경로에 맞게 수정
        }

        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }

    if (!res.ok) {
        console.log("API 실패:", res.status, data);
        throw new Error(data.message || "서버 요청 실패");
    }

    return data;
}

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = useCallback(async () => {
        const emailTrim = email.trim();
        const passwordTrim = password.trim();

        if (!emailTrim || !passwordTrim) {
            Alert.alert("로그인 실패", "이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }

        try {
            setLoading(true);

            // 로그인 요청
            const loginData = await apiRequest(`${BASE_URL}/oauth/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            console.log("로그인 응답:", loginData);

            const token =
                loginData.data?.accessToken ||
                loginData.accessToken ||
                loginData.token ||
                null;
            const refresh =
                loginData.data?.refreshToken || loginData.refreshToken || null;

            if (!token) throw new Error("서버에서 accessToken을 받지 못했습니다.");

            await AsyncStorage.multiSet([
                ["accessToken", token],
                ["refreshToken", refresh ?? ""],
            ]);

            router.replace("/(tabs)/home");
        } catch (err: any) {
            console.error("로그인 실패:", err);
            Alert.alert("로그인 실패", err.message || "서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [email, password]);

    const handleRegister = useCallback(() => {
        router.push("/(tabs)/task/signup");
    }, [router]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerText}>Login</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Loading..." : "Login"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerText}>회원가입</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
        padding: 20,
        justifyContent: "center",
    },
    header: { alignItems: "center", marginBottom: 30 },
    headerText: { color: "#fff", fontSize: 26, fontWeight: "bold" },
    form: { backgroundColor: "#16161a", borderRadius: 16, padding: 20 },
    label: { color: "#a5a5b0", fontSize: 14, marginTop: 10 },
    input: {
        backgroundColor: "#1e1e24",
        color: "#fff",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#2d2d35",
        marginTop: 4,
    },
    button: {
        backgroundColor: "#a78bfa",
        borderRadius: 10,
        paddingVertical: 14,
        marginTop: 25,
        alignItems: "center",
    },
    buttonDisabled: { backgroundColor: "#4b4b5a" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    registerButton: { marginTop: 14, alignItems: "center" },
    registerText: { color: "#a78bfa", fontSize: 14 },
});