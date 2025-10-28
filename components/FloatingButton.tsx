import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";

export default function FloatingButton({ onPress }) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>＋</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "#a78bfa",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    text: {
        color: "#fff",
        fontSize: 32,
        marginTop: -2,
    },
});
