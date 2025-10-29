// lib/api.ts
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL =
    Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

async function buildHeaders(extra?: HeadersInit) {
    const token = await AsyncStorage.getItem("accessToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    } as HeadersInit;
}

export async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: await buildHeaders(),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        throw new Error(data?.message || `GET ${path} 실패`);
    }
    return data as T;
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: await buildHeaders(),
        body: JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        throw new Error(data?.message || `POST ${path} 실패`);
    }
    return data as T;
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "PUT",
        headers: await buildHeaders(),
        body: JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        throw new Error(data?.message || `PUT ${path} 실패`);
    }
    return data as T;
}

export async function apiDelete(path: string): Promise<void> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        headers: await buildHeaders(),
    });
    if (!res.ok) {
        const text = await res.text();
        let data: any;
        try { data = JSON.parse(text); } catch { data = { message: text }; }
        throw new Error(data?.message || `DELETE ${path} 실패`);
    }
}
