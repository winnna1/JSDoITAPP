// app/(tabs)/task/profile.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            const saved = await AsyncStorage.getItem("user");
            if (saved) setUser(JSON.parse(saved));
        };
        load();
    }, []);

    const handleSave = async () => {
        await AsyncStorage.setItem("user", JSON.stringify(user));
        Alert.alert("Saved", "Profile updated!");
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={{ color: "#fff" }}>No user data found.</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/task/login")}>
                    <Text style={{ color: "#a78bfa", marginTop: 10 }}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile Settings</Text>

            <TextInput
                style={styles.input}
                value={user.nickname}
                onChangeText={(t) => setUser({ ...user, nickname: t })}
                placeholder="Nickname"
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                value={user.email}
                editable={false}
            />
            <TextInput
                style={styles.input}
                value={user.bio || ""}
                onChangeText={(t) => setUser({ ...user, bio: t })}
                placeholder="Bio"
                placeholderTextColor="#888"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b0b0f", padding: 20 },
    title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    input: {
        backgroundColor: "#16161a",
        color: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    saveBtn: {
        backgroundColor: "#a78bfa",
        borderRadius: 10,
        paddingVertical: 14,
        marginTop: 10,
        alignItems: "center",
    },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
