// app/(tabs)/task/profile.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
    ScrollView,
    Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const BASE_URL =
    Platform.OS === "android" ? "http://192.168.45.191:8080" : "http://localhost:8080";

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

    if (!res.ok) throw new Error(data.message || "요청 실패");
    return data;
}

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 프로필 불러오기
    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) {
                Alert.alert("로그인이 필요합니다.", "로그인 후 이용해주세요.");
                router.replace("/(tabs)/task/login");
                return;
            }

            const profile = await apiRequest(`${BASE_URL}/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setUser(profile);
            if (profile.imageUrl) {
                setImage(`${BASE_URL}${profile.imageUrl}`);
            }
        } catch (err: any) {
            console.error("프로필 불러오기 실패:", err);
            Alert.alert("오류", err.message || "프로필을 불러올 수 없습니다.");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // 사진 선택기
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            const selected = result.assets[0];
            setImage(selected.uri);
        }
    };

    // 프로필 저장
    const handleSave = useCallback(async () => {
        try {
            setSaving(true);
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) throw new Error("토큰이 없습니다.");

            const formData = new FormData();
            formData.append("username", user.username || "");
            formData.append("nickname", user.nickname || "");
            formData.append("bio", user.bio || "");
            formData.append("location", user.location || "");

            // 새 사진이 선택되었다면 추가
            if (image && image !== `${BASE_URL}${user.imageUrl}`) {
                const filename = image.split("/").pop()!;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append("imageFile", {
                    uri: image,
                    name: filename,
                    type,
                } as any);
            }

            const updated = await apiRequest(`${BASE_URL}/profile/update`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            console.log("업데이트된 프로필:", updated);

            await AsyncStorage.setItem("user", JSON.stringify(updated));
            Alert.alert("저장 완료", "프로필이 업데이트되었습니다.");
            fetchProfile();
        } catch (err: any) {
            console.error("프로필 저장 실패:", err);
            Alert.alert("오류", err.message || "저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    }, [user, image, fetchProfile]);

    if (loading) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color="#a78bfa" />
                <Text style={{ color: "#aaa", marginTop: 10 }}>프로필 불러오는 중...</Text>
            </View>
        );
    }

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
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 60 }}
        >
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={10}>
                    <Text style={styles.backArrow}>←</Text>
                </Pressable>
                <Text style={styles.headerText}>Profile</Text>
                <View style={{ width: 20 }} />
            </View>

            {/* 프로필 섹션 */}
            <View style={styles.profileSection}>
                <TouchableOpacity onPress={pickImage}>
                    <Image
                        source={{
                            uri: image || `${BASE_URL}${user.imageUrl}`,
                        }}
                        style={styles.avatar}
                    />
                    <Text style={styles.changePhoto}>Change Photo</Text>
                </TouchableOpacity>

                <Text style={styles.username}>{user.nickname || "User"}</Text>
                <Text style={styles.email}>{user.email}</Text>
                {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            </View>

            {/* 수정 영역 */}
            <View style={styles.editSection}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    value={user.username || ""}
                    onChangeText={(t) => setUser({ ...user, username: t })}
                    placeholder="실제 이름 입력"
                    placeholderTextColor="#888"
                />

                <Text style={styles.label}>Nickname</Text>
                <TextInput
                    style={styles.input}
                    value={user.nickname || ""}
                    onChangeText={(t) => setUser({ ...user, nickname: t })}
                    placeholder="닉네임 입력"
                    placeholderTextColor="#888"
                />

                <Text style={styles.label}>Location</Text>
                <TextInput
                    style={styles.input}
                    value={user.location || ""}
                    onChangeText={(t) => setUser({ ...user, location: t })}
                    placeholder="예: Seoul, Korea"
                    placeholderTextColor="#888"
                />

                <Text style={styles.label}>Bio</Text>
                <TextInput
                    style={styles.input}
                    value={user.bio || ""}
                    onChangeText={(t) => setUser({ ...user, bio: t })}
                    placeholder="간단한 소개를 입력하세요"
                    placeholderTextColor="#888"
                />

                <TouchableOpacity
                    style={[styles.saveBtn, saving && { backgroundColor: "#4b4b5a" }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b0b0f", padding: 20 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 40,
        marginBottom: 20,
    },
    backArrow: { color: "#fff", fontSize: 22 },
    headerText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
    profileSection: { alignItems: "center", marginBottom: 20 },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: "#a78bfa",
        marginBottom: 6,
    },
    changePhoto: {
        color: "#a78bfa",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 8,
    },
    username: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    email: { color: "#a5a5b0", fontSize: 14, marginTop: 4 },
    bio: {
        color: "#ccc",
        fontSize: 13,
        marginTop: 6,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    editSection: { marginTop: 10 },
    label: { color: "#a5a5b0", fontSize: 14, marginBottom: 6, marginTop: 10 },
    input: {
        backgroundColor: "#16161a",
        color: "#fff",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#2d2d35",
    },
    saveBtn: {
        backgroundColor: "#a78bfa",
        borderRadius: 10,
        paddingVertical: 14,
        marginTop: 25,
        alignItems: "center",
    },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
