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
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

const BASE_URL =
    Platform.OS === "android"
        ? "http://10.0.2.2:8080" // Android 에뮬레이터용 로컬호스트
        : "http://localhost:8080"; // iOS 시뮬레이터용

// 공통 API 유틸
async function apiRequest(url: string, options: RequestInit) {
    const res = await fetch(url, options);
    const text = await res.text();

    let data: any = {};
    try {
        data = JSON.parse(text);
    } catch {
        data = { message: text };
    }

    if (!res.ok) {
        console.log("API 실패:", res.status, data);
        throw new Error(data.message || "서버 요청 실패");
    }

    return data;
}

export default function SignupScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);

    //회원가입 처리
    const handleRegister = useCallback(async () => {
        if (!email || !password || !nickname || !username) {
            Alert.alert("입력 오류", "필수 항목(이메일, 비밀번호, 닉네임, 이름)을 입력해주세요.");
            return;
        }

        try {
            setLoading(true);

            const newUser = {
                email,
                password,
                nickname,
                username,
                phone,
                bio,
                location,
            };

            console.log("회원가입 요청:", newUser);

            const response = await apiRequest(`${BASE_URL}/oauth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8", // 한글 깨짐 방지
                },
                body: JSON.stringify(newUser),
            });

            console.log("서버 응답:", response);

            Alert.alert("회원가입 완료", `${username}님, 환영합니다!`);
            router.replace("/(tabs)/task/login");
        } catch (error: any) {
            console.error("회원가입 실패:", error);
            Alert.alert("회원가입 실패", error.message || "서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [email, password, nickname, username, phone, bio, location]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerText}>회원가입</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <Text style={styles.label}>이메일 *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="이메일을 입력하세요"
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>비밀번호 *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="비밀번호를 입력하세요"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        keyboardType="default" // 한글 입력 가능
                    />

                    <Text style={styles.label}>닉네임 *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="닉네임을 입력하세요"
                        placeholderTextColor="#888"
                        value={nickname}
                        onChangeText={setNickname}
                        keyboardType="default" // 한글 입력 가능
                    />

                    <Text style={styles.label}>이름 *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="이름을 입력하세요"
                        placeholderTextColor="#888"
                        value={username}
                        onChangeText={setUsername}
                        keyboardType="default" // 한글 입력 가능
                    />

                    <Text style={styles.label}>전화번호</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="전화번호를 입력하세요"
                        placeholderTextColor="#888"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />

                    <Text style={styles.label}>소개</Text>
                    <TextInput
                        style={[styles.input, styles.multiline]}
                        placeholder="자기소개를 입력하세요"
                        placeholderTextColor="#888"
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        keyboardType="default" // 한글 입력 가능
                    />

                    <Text style={styles.label}>위치</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="위치를 입력하세요"
                        placeholderTextColor="#888"
                        value={location}
                        onChangeText={setLocation}
                        keyboardType="default" // 한글 입력 가능
                    />

                    <TouchableOpacity
                        style={[
                            styles.button,
                            (!email || !password || !nickname || !username || loading) &&
                            styles.buttonDisabled,
                        ]}
                        onPress={handleRegister}
                        disabled={!email || !password || !nickname || !username || loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "처리 중..." : "회원가입"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b0b0f", padding: 20 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 30,
    },
    backArrow: { color: "#fff", fontSize: 22 },
    headerText: { color: "#fff", fontSize: 22, fontWeight: "bold", marginLeft: 12 },
    form: {
        backgroundColor: "#16161a",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    label: { color: "#a5a5b0", fontSize: 14, marginTop: 10 },
    input: {
        backgroundColor: "#1e1e24",
        color: "#fff",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        borderWidth: 1,
        borderColor: "#2d2d35",
    },
    multiline: { height: 80, textAlignVertical: "top" },
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
