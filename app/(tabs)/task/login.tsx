// app/(tabs)/task/login.tsx
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

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = useCallback(async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("로그인 실패", "이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }

        // ✅ 저장된 유저 불러오기
        const saved = await AsyncStorage.getItem("user");
        if (!saved) {
            Alert.alert("로그인 실패", "등록된 계정이 없습니다. 회원가입을 먼저 해주세요.");
            return;
        }

        const user = JSON.parse(saved);
        if (user.email === email && user.password === password) {
            Alert.alert("로그인 성공", `환영합니다, ${user.nickname || user.email}님!`);
            router.replace("/(tabs)/home"); // ✅ 홈으로 이동
        } else {
            Alert.alert("로그인 실패", "이메일 또는 비밀번호가 올바르지 않습니다.");
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
                    style={[styles.button, !email || !password ? styles.buttonDisabled : null]}
                    onPress={handleLogin}
                    disabled={!email || !password}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerText}>회원가입</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b0b0f", padding: 20, justifyContent: "center" },
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
