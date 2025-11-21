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
import { apiPost } from "../../../lib/api";

type LoginResponse = {
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    data?: {
        accessToken?: string;
        refreshToken?: string;
    };
};

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = useCallback(async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("로그인 실패", "이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }

        try {
            setLoading(true);

            const loginData = await apiPost<LoginResponse>("/oauth/signin", {
                email,
                password,
            });

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
});
