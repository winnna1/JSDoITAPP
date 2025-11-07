// config/config.ts
import Constants from "expo-constants";
import { Platform } from "react-native";


// 현재 연결된 네트워크의 IP주소 값 가져오기
const host = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
const port = 8080;

export const BASE_URL =
  Platform.OS === "android"
    ? `http://${host}:${port}`
    : `http://localhost:${port}`;