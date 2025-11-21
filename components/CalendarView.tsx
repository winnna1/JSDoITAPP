// components/CalendarView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export type Priority = "High" | "Medium" | "Low";
const COLORS: Record<Priority, string> = {
    High: "#f87171",
    Medium: "#a78bfa",
    Low: "#4ade80",
};

type Cell = {
    date: Date;
    inCurrentMonth: boolean;
    isToday: boolean;
};

type Props = {
    selected?: Date;                      // 외부에서 기본 선택값 전달
    onDateSelect?: (d: Date) => void;     // 날짜 클릭 콜백
    markers?: Record<string, Priority[]>; // YYYY-MM-DD
};

function toKey(d: Date) {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${dd}`;
}

function getMonthMatrix(viewDate: Date): Cell[] {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth(); // 0~11
    const today = new Date();

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Cell[] = [];

    // 1 이전 달 패딩
    for (let i = startWeekday; i > 0; i--) {
        const date = new Date(year, month - 1, daysInPrevMonth - i + 1);
        cells.push({ date, inCurrentMonth: false, isToday: isSameDay(date, today) });
    }

    // 2 이번 달
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        cells.push({ date, inCurrentMonth: true, isToday: isSameDay(date, today) });
    }

    // 3 총 주 수 결정
    const needed = startWeekday + daysInMonth;        // 이번 달이 차지하는 칸 수
    const totalWeeks = needed <= 35 ? 5 : 6;          // 35칸이면 5주, 넘으면 6주
    const totalCells = totalWeeks * 7;                // 35 또는 42

    // 4 다음 달 패딩
    let nextDay = 1;
    while (cells.length < totalCells) {
        const date = new Date(year, month + 1, nextDay++);
        cells.push({ date, inCurrentMonth: false, isToday: isSameDay(date, today) });
    }

    return cells;
}


export default function CalendarView({ selected, onDateSelect, markers = {} }: Props) {
    const [viewDate, setViewDate] = useState<Date>(selected ?? new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(selected ?? new Date());

    useEffect(() => {
        if (selected) {
            setViewDate(selected);
            setSelectedDate(selected);
        }
    }, [selected]);

    const matrix = useMemo(() => getMonthMatrix(viewDate), [viewDate]);
    const monthLabel = `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;
    const WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const goPrev = () => {
        const d = new Date(viewDate);
        d.setMonth(viewDate.getMonth() - 1);
        setViewDate(d);
    };
    const goNext = () => {
        const d = new Date(viewDate);
        d.setMonth(viewDate.getMonth() + 1);
        setViewDate(d);
    };

    const onPick = (d: Date) => {
        setSelectedDate(d);
        onDateSelect?.(d);
    };

    const selectedKey = toKey(selectedDate);

    return (
        <View style={styles.wrap}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goPrev} style={styles.arrow}>
                    <Text style={styles.arrowText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.month}>{monthLabel}</Text>
                <TouchableOpacity onPress={goNext} style={styles.arrow}>
                    <Text style={styles.arrowText}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
                {WEEK.map((w) => (
                    <Text key={w} style={[styles.weekText, w === "SAT" && { color: "#ff6b6b" },  w === "SUN" && { color: "#ff6b6b" }]}>
                        {w}
                    </Text>
                ))}
            </View>

            <View style={styles.grid}>
                {matrix.map((cell, idx) => {
                    const k = toKey(cell.date);
                    const isSelected = k === selectedKey;
                    const dots = markers[k] ?? []; // 우선순위 마크들
                    const isDim = !cell.inCurrentMonth;

                    return (
                        <TouchableOpacity
                            key={`${k}_${idx}`}
                            style={[styles.dayBox, isSelected && styles.selBox, cell.isToday && styles.todayRing]}
                            onPress={() => onPick(cell.date)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.dayText, isDim && styles.dimText, isSelected && styles.selText]}>
                                {cell.date.getDate()}
                            </Text>

                            {/* 우선순위 점 표시 (최대 3개) */}
                            <View style={styles.dotsRow}>
                                {dots.length > 0 && (
                                    <View
                                        style={[
                                            styles.dot,
                                            { backgroundColor: COLORS[dots[dots.length - 1]] } // 마지막이 가장 최근
                                        ]}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const BOX = 50;

const styles = StyleSheet.create({
    wrap: { alignItems: "center" },
    header: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    month: { color: "#fff", fontSize: 18, fontWeight: "700" },
    arrow: { paddingHorizontal: 10, paddingVertical: 6 },
    arrowText: { color: "#a78bfa", fontSize: 22, fontWeight: "700" },
    weekRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    weekText: { width: BOX, textAlign: "center", color: "#aaa", fontSize: 12 },
    grid: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    dayBox: {
        width: BOX,
        height: BOX,
        borderRadius: BOX / 2,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 4,
    },
    dayText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    dimText: { color: "#666" },
    selBox: { backgroundColor: "#a78bfa" },
    selText: { color: "#000", fontWeight: "800" },
    todayRing: { borderWidth: 1.5, borderColor: "#a78bfa" },
    dotsRow: {
        position: "absolute",
        bottom: -6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    dot: {
        width: 30,
        height: 4,
        borderRadius: 3,
    },

    moreText: { color: "#ddd", fontSize: 10, marginLeft: 2 },
});
