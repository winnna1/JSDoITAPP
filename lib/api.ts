import AsyncStorage from "@react-native-async-storage/async-storage";

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { API_BASE_URL } from "@env";

export const BASE_URL = API_BASE_URL;

// 공통 헤더
async function buildHeaders(extra?: HeadersInit) {
    const token = await AsyncStorage.getItem("accessToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    } as HeadersInit;
}

// 기본 GET/POST/PUT/DELETE
export async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: await buildHeaders(),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || `GET ${path} 실패`);
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
    if (!res.ok) throw new Error(data?.message || `POST ${path} 실패`);
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
    if (!res.ok) throw new Error(data?.message || `PUT ${path} 실패`);
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

// 인증 버전 (토큰 필수)
async function authHeaders(extra?: HeadersInit) {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("로그인이 필요합니다.");
    return {
        ...(await buildHeaders(extra)),
        Authorization: `Bearer ${token}`,
    };
}

export async function apiGetAuth<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: await authHeaders(),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || `GET ${path} 실패`);
    return data as T;
}

export async function apiPostAuth<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || `POST ${path} 실패`);
    return data as T;
}

export async function apiPutAuth<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "PUT",
        headers: await authHeaders(),
        body: JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || `PUT ${path} 실패`);
    return data as T;
}

export async function apiDeleteAuth(path: string): Promise<void> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        headers: await authHeaders(),
    });
    if (!res.ok) {
        const text = await res.text();
        let data: any;
        try { data = JSON.parse(text); } catch { data = { message: text }; }
        throw new Error(data?.message || `DELETE ${path} 실패`);
    }
}

// 파일 업로드용
export async function apiUploadAuth<T>(path: string, formData: FormData): Promise<T> {
    const headers = await authHeaders();
    delete (headers as any)["Content-Type"];
    const res = await fetch(`${BASE_URL}${path}`, { method: "PUT", headers, body: formData });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || `UPLOAD ${path} 실패`);
    return data as T;
}

// 이미지 경로
export function imgUrl(path?: string | null) {
    if (!path) return null;
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}
