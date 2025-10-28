// app/modal.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function ModalScreen() {
  const router = useRouter();

  return (
      <View style={styles.container}>
        <Text style={styles.title}>💬 알림창</Text>
        <Text style={styles.desc}>이건 모달(팝업) 화면입니다!</Text>
        <Button title="닫기" onPress={() => router.back()} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  desc: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
  },
});
