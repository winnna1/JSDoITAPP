
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function SignupScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");

    // ✅ 회원가입 처리
    const handleRegister = useCallback(async () => {
        if (!email || !password || !nickname || !username) {
            Alert.alert("입력 오류", "필수 항목(이메일, 비밀번호, 닉네임, 이름)을 입력해주세요.");
            return;
        }

        const newUser = { email, password, nickname, username, phone, bio, location };
        await AsyncStorage.setItem("user", JSON.stringify(newUser)); // ✅ 임시 저장

        Alert.alert("회원가입 완료", `${nickname}님, 환영합니다!`);
        router.replace("/(tabs)/task/login"); // ✅ 로그인 화면으로 이동
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
                <Text style={styles.headerText}>Sign Up</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={styles.label}>Password *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <Text style={styles.label}>Nickname *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your nickname"
                        placeholderTextColor="#888"
                        value={nickname}
                        onChangeText={setNickname}
                    />

                    <Text style={styles.label}>Username *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        placeholderTextColor="#888"
                        value={username}
                        onChangeText={setUsername}
                    />

                    <Text style={styles.label}>Phone</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#888"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />

                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, styles.multiline]}
                        placeholder="Tell us about yourself"
                        placeholderTextColor="#888"
                        value={bio}
                        onChangeText={setBio}
                        multiline
                    />

                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your location"
                        placeholderTextColor="#888"
                        value={location}
                        onChangeText={setLocation}
                    />

                    <TouchableOpacity
                        style={[
                            styles.button,
                            !email || !password || !nickname || !username ? styles.buttonDisabled : null,
                        ]}
                        onPress={handleRegister}
                        disabled={!email || !password || !nickname || !username}
                    >
                        <Text style={styles.buttonText}>Sign Up</Text>
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
