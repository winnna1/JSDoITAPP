import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from "react-native";
import { apiGetAuth } from "../lib/api"; // 공통 API 유틸 가져오기

type GrassCell = { date: string; count: number };

export default function GrassView() {
    const [grass, setGrass] = useState<GrassCell[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [total, setTotal] = useState(0);

    //  잔디 데이터 요청 (apiGetAuth 사용)
    const fetchGrass = async () => {
        try {
            const data = await apiGetAuth<GrassCell[]>("/api/v1/task/grass");
            setGrass(data);
            setTotal(data.reduce((sum, g) => sum + g.count, 0));
        } catch (err) {
            console.error("잔디 로드 실패:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGrass();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#a78bfa" />
            </View>
        );
    }

    // 한국 시간 기준 오늘 날짜
    const today = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);

    // 최근 1년 + 내일(오늘 기준 +1일)
    const days: Date[] = [];
    for (let i = -1; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.unshift(d);
    }

    // 서버 데이터 매핑
    const dataMap = new Map(grass.map((g) => [g.date, g.count]));

    // 주 단위 그룹화
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    // 월 헤더 표시
    const monthLabels: { index: number; month: string }[] = [];
    let prevMonth = "";
    weeks.forEach((w, i) => {
        const firstDay = w[0];
        const monthName = firstDay.toLocaleString("default", { month: "short" });
        if (monthName !== prevMonth) {
            monthLabels.push({ index: i, month: monthName });
            prevMonth = monthName;
        }
    });

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>
                {`${total} contributions in the last year`}
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchGrass}
                        tintColor="#a78bfa"
                    />
                }
            >
                <View>
                    {/* 월 헤더 */}
                    <View style={styles.monthHeader}>
                        {monthLabels.map((m) => (
                            <Text
                                key={m.index}
                                style={[styles.monthLabel, { left: m.index * 10.5 }]}
                            >
                                {m.month}
                            </Text>
                        ))}
                    </View>

                    {/* 잔디 본체 */}
                    <View style={styles.chartContainer}>
                        <View style={styles.weekLabels}>
                            <Text style={styles.weekLabel}>Mon</Text>
                            <Text style={styles.weekLabel}>Wed</Text>
                            <Text style={styles.weekLabel}>Fri</Text>
                        </View>

                        <View style={styles.grid}>
                            {weeks.map((week, wIdx) => (
                                <View key={wIdx} style={styles.column}>
                                    {week.map((day, dIdx) => {
                                        const key = day.toISOString().slice(0, 10);
                                        const count = dataMap.get(key) || 0;

                                        return (
                                            <View
                                                key={dIdx}
                                                style={[
                                                    styles.cell,
                                                    { backgroundColor: getColorByCount(count) },
                                                ]}
                                            />
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* 색상 범례 */}
                    <View style={styles.legend}>
                        <Text style={styles.legendText}>Less</Text>
                        {[0, 1, 3, 5].map((v, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.legendBox,
                                    { backgroundColor: getColorByCount(v) },
                                ]}
                            />
                        ))}
                        <Text style={styles.legendText}>More</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// 색상 단계별 설정
const getColorByCount = (count: number) => {
    if (count >= 10) return "#16a34a";
    if (count >= 5) return "#22c55e";
    if (count >= 3) return "#4ade80";
    if (count >= 1) return "#86efac";
    return "#27272a";
};

// 스타일 그대로 유지
const styles = StyleSheet.create({
    container: { marginTop: 25 },
    headerText: {
        color: "#ccc",
        fontSize: 13,
        marginBottom: 8,
        fontWeight: "500",
    },
    monthHeader: {
        position: "relative",
        height: 16,
        marginLeft: 30,
    },
    monthLabel: {
        position: "absolute",
        color: "#aaa",
        fontSize: 9,
    },
    chartContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    weekLabels: {
        marginRight: 4,
        justifyContent: "space-between",
        height: 72,
        paddingVertical: 2,
    },
    weekLabel: { color: "#888", fontSize: 9 },
    grid: {
        flexDirection: "row",
        flexWrap: "nowrap",
    },
    column: { flexDirection: "column", marginRight: 1.3 },
    cell: {
        width: 9,
        height: 9,
        marginVertical: 0.7,
        borderRadius: 2,
    },
    legend: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 3,
    },
    legendBox: { width: 10, height: 10, borderRadius: 2 },
    legendText: { color: "#aaa", fontSize: 9 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
