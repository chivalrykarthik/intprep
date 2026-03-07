import { useState } from "react";
import {
    makeStyles,
    shorthands,
    tokens,
    Card,
    Text,
    Button,
    Title1,
    Title2,
    Title3,
    Subtitle1,
    Subtitle2,
    Body1,
    Input,
    Select,
    Switch,
    Divider,
    Badge,
    Tooltip,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    TabList,
    Tab,
    type SelectTabData,
    type SelectTabEvent,
} from "@fluentui/react-components";
import {
    ArrowLeftRegular,
    CalculatorRegular,
    DatabaseRegular,
    ServerRegular,
    ArrowRightRegular,
    InfoRegular,
    StorageRegular,
    GlobeRegular,
    PeopleRegular,
    ImageRegular,
    VideoRegular,
    LightbulbRegular,
    BookRegular,
    ClockRegular,
    ArrowSwapRegular,
    DocumentBulletListRegular,
    DismissRegular,
    SaveRegular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";

// ─── Styles ──────────────────────────────────────────────────────────
const useStyles = makeStyles({
    container: {
        ...shorthands.padding("16px"),
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        paddingBottom: "60px",
    },
    header: { display: "flex", flexDirection: "column", gap: "8px" },
    heroCard: {
        ...shorthands.padding("32px"),
        background: `linear-gradient(135deg, #5b2c8e 0%, #1a1a3e 100%)`,
        color: "white",
        borderRadius: "16px",
        textAlign: "center",
    },
    tabBar: {
        ...shorthands.padding("8px", "40px"),
        ...shorthands.margin("0", "-16px"),
        backgroundColor: tokens.colorNeutralBackground2,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        boxShadow: tokens.shadow4,
        position: "sticky" as const,
        top: 0,
        zIndex: 10,
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
    },
    formCard: {
        ...shorthands.padding("20px"),
        backgroundColor: tokens.colorNeutralBackground1,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        borderRadius: "12px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ":hover": { transform: "translateY(-2px)", boxShadow: tokens.shadow8 },
    },
    fieldLabel: { display: "flex", alignItems: "center", gap: "6px" },
    submitBtn: {
        alignSelf: "center",
        minWidth: "240px",
        height: "48px",
        fontSize: "16px",
        borderRadius: "24px",
    },
    resultsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "16px",
    },
    resultCard: {
        ...shorthands.padding("20px"),
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "transform 0.25s ease",
        animationName: {
            from: { opacity: 0, transform: "translateY(20px)" },
            to: { opacity: 1, transform: "translateY(0)" },
        },
        animationDuration: "0.5s",
        animationFillMode: "forwards",
    },
    metricValue: {
        fontSize: "28px",
        fontWeight: "700",
        color: tokens.colorBrandForeground1,
        letterSpacing: "-0.5px",
    },
    explanationCard: {
        ...shorthands.padding("24px"),
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        borderLeft: `4px solid ${tokens.colorBrandStroke1}`,
    },
    formula: {
        ...shorthands.padding("12px", "16px"),
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "8px",
        fontFamily: "'Cascadia Code', 'Fira Code', monospace",
        fontSize: "13px",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
    },
    chartContainer: {
        ...shorthands.padding("24px"),
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: "12px",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "auto",
    },
    summaryRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        ...shorthands.padding("8px", "0"),
    },
    refTableGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "8px",
    },
    refTableCell: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        ...shorthands.padding("10px", "14px"),
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "8px",
        fontSize: "13px",
    },
    presetGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "10px",
    },
    presetCard: {
        ...shorthands.padding("14px"),
        borderRadius: "10px",
        cursor: "pointer",
        textAlign: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ":hover": { transform: "translateY(-3px)", boxShadow: tokens.shadow16 },
    },
    compareTable: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
    },
    compareHeader: {
        ...shorthands.padding("12px", "16px"),
        textAlign: "left" as const,
        fontWeight: "600",
        borderBottom: `2px solid ${tokens.colorBrandStroke1}`,
        backgroundColor: tokens.colorNeutralBackground3,
    },
    compareCell: {
        ...shorthands.padding("10px", "16px"),
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    compareDelta: {
        fontSize: "12px",
        fontWeight: "600",
    },
    cheatGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "12px",
    },
    cheatItem: {
        ...shorthands.padding("16px"),
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    savedScenarioBanner: {
        ...shorthands.padding("12px", "20px"),
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        border: `2px solid ${tokens.colorBrandStroke1}`,
    },
});

// ─── Types ───────────────────────────────────────────────────────────
interface FormData {
    totalUsers: number;
    dauPercent: number;
    appType: string;
    imageSupport: boolean;
    avgImageSizeKB: number;
    imagesPerUserPerDay: number;
    videoSupport: boolean;
    avgVideoSizeMB: number;
    videosPerUserPerDay: number;
    avgTextDataKB: number;
    readWriteRatio: number;
    retentionYears: number;
    peakMultiplier: number;
    replicationFactor: number;
}

interface EstimationResult {
    dau: number;
    writeQPS: number;
    readQPS: number;
    peakWriteQPS: number;
    peakReadQPS: number;
    dailyStorageGB: number;
    yearlyStorageTB: number;
    totalStorageTB: number;
    totalStorageWithReplicationTB: number;
    dailyBandwidthIngressGB: number;
    dailyBandwidthEgressGB: number;
    peakBandwidthMbps: number;
    cacheMemoryGB: number;
    estimatedServers: number;
    dbConnections: number;
}

interface SavedScenario {
    name: string;
    form: FormData;
    result: EstimationResult;
}

// ─── Constants ───────────────────────────────────────────────────────
const APP_TYPE_LABELS: Record<string, string> = {
    "social-media": "Social Media",
    "e-commerce": "E-Commerce",
    "streaming": "Video Streaming",
    "messaging": "Messaging / Chat",
    "saas": "SaaS / General",
};

const APP_TYPE_DEFAULTS: Record<string, { dau: number; rw: number; avgReq: number; text: number; img: boolean; imgSize: number; imgCount: number; vid: boolean; vidSize: number; vidCount: number }> = {
    "social-media": { dau: 30, rw: 10, avgReq: 20, text: 5, img: true, imgSize: 200, imgCount: 2, vid: false, vidSize: 50, vidCount: 0.1 },
    "e-commerce": { dau: 15, rw: 100, avgReq: 8, text: 3, img: true, imgSize: 150, imgCount: 0.5, vid: false, vidSize: 50, vidCount: 0 },
    "streaming": { dau: 35, rw: 200, avgReq: 5, text: 1, img: false, imgSize: 100, imgCount: 0, vid: true, vidSize: 200, vidCount: 1 },
    "messaging": { dau: 70, rw: 5, avgReq: 40, text: 2, img: true, imgSize: 100, imgCount: 3, vid: false, vidSize: 30, vidCount: 0.05 },
    "saas": { dau: 25, rw: 5, avgReq: 10, text: 5, img: false, imgSize: 200, imgCount: 0, vid: false, vidSize: 50, vidCount: 0 },
};

interface Preset {
    name: string;
    emoji: string;
    desc: string;
    color: string;
    form: Partial<FormData>;
}

const PRESETS: Preset[] = [
    {
        name: "Design Twitter", emoji: "🐦", desc: "300M users, read-heavy", color: "#1d9bf0",
        form: { totalUsers: 300_000_000, dauPercent: 50, appType: "social-media", imageSupport: true, avgImageSizeKB: 200, imagesPerUserPerDay: 1, videoSupport: false, avgTextDataKB: 2, readWriteRatio: 100, retentionYears: 5, peakMultiplier: 3, replicationFactor: 3 }
    },
    {
        name: "Design YouTube", emoji: "📺", desc: "2B users, video-heavy", color: "#ff0000",
        form: { totalUsers: 2_000_000_000, dauPercent: 30, appType: "streaming", imageSupport: true, avgImageSizeKB: 50, imagesPerUserPerDay: 0, videoSupport: true, avgVideoSizeMB: 300, videosPerUserPerDay: 0.01, avgTextDataKB: 1, readWriteRatio: 200, retentionYears: 10, peakMultiplier: 3, replicationFactor: 3 }
    },
    {
        name: "Design WhatsApp", emoji: "💬", desc: "2B users, messaging", color: "#25d366",
        form: { totalUsers: 2_000_000_000, dauPercent: 75, appType: "messaging", imageSupport: true, avgImageSizeKB: 100, imagesPerUserPerDay: 2, videoSupport: false, avgTextDataKB: 3, readWriteRatio: 1, retentionYears: 1, peakMultiplier: 5, replicationFactor: 3 }
    },
    {
        name: "Design Uber", emoji: "🚗", desc: "100M users, location‐heavy", color: "#000000",
        form: { totalUsers: 100_000_000, dauPercent: 20, appType: "saas", imageSupport: false, avgImageSizeKB: 0, imagesPerUserPerDay: 0, videoSupport: false, avgTextDataKB: 10, readWriteRatio: 5, retentionYears: 3, peakMultiplier: 5, replicationFactor: 3 }
    },
];

const POWER_OF_2_TABLE = [
    { power: "10", value: "1 Thousand", bytes: "1 KB" },
    { power: "20", value: "1 Million", bytes: "1 MB" },
    { power: "30", value: "1 Billion", bytes: "1 GB" },
    { power: "40", value: "1 Trillion", bytes: "1 TB" },
    { power: "50", value: "1 Quadrillion", bytes: "1 PB" },
];

const LATENCY_NUMBERS = [
    { op: "L1 cache reference", time: "0.5 ns" },
    { op: "L2 cache reference", time: "7 ns" },
    { op: "Main memory reference", time: "100 ns" },
    { op: "Compress 1K bytes (Zippy)", time: "10 μs" },
    { op: "Read 1 MB from memory", time: "250 μs" },
    { op: "Round trip within datacenter", time: "500 μs" },
    { op: "SSD random read", time: "100 μs" },
    { op: "Read 1 MB from SSD", time: "1 ms" },
    { op: "HDD disk seek", time: "10 ms" },
    { op: "Read 1 MB from HDD", time: "30 ms" },
    { op: "Send packet CA→NL→CA", time: "150 ms" },
];

const AVAILABILITY_TABLE = [
    { nines: "99%", downtime: "3.65 days/year" },
    { nines: "99.9%", downtime: "8.77 hours/year" },
    { nines: "99.99%", downtime: "52.6 min/year" },
    { nines: "99.999%", downtime: "5.26 min/year" },
    { nines: "99.9999%", downtime: "31.56 sec/year" },
];

// ─── Helpers ─────────────────────────────────────────────────────────
const fmt = (n: number, d = 2): string => {
    if (n >= 1e12) return (n / 1e12).toFixed(d) + " T";
    if (n >= 1e9) return (n / 1e9).toFixed(d) + " B";
    if (n >= 1e6) return (n / 1e6).toFixed(d) + " M";
    if (n >= 1e3) return (n / 1e3).toFixed(d) + " K";
    return n.toFixed(d);
};

const fmtBytes = (gb: number): string => {
    if (gb >= 1024 * 1024) return (gb / (1024 * 1024)).toFixed(2) + " PB";
    if (gb >= 1024) return (gb / 1024).toFixed(2) + " TB";
    if (gb >= 1) return gb.toFixed(2) + " GB";
    if (gb >= 1 / 1024) return (gb * 1024).toFixed(2) + " MB";
    return (gb * 1024 * 1024).toFixed(2) + " KB";
};

const SECONDS_IN_DAY = 86400;

function calculate(f: FormData): EstimationResult {
    const dau = f.totalUsers * (f.dauPercent / 100);
    const avgRequestsPerUser = APP_TYPE_DEFAULTS[f.appType]?.avgReq ?? 10;
    const totalDailyRequests = dau * avgRequestsPerUser;
    const writeRatio = 1 / (1 + f.readWriteRatio);
    const readRatio = f.readWriteRatio / (1 + f.readWriteRatio);
    const writeQPS = (totalDailyRequests * writeRatio) / SECONDS_IN_DAY;
    const readQPS = (totalDailyRequests * readRatio) / SECONDS_IN_DAY;
    const peakWriteQPS = writeQPS * f.peakMultiplier;
    const peakReadQPS = readQPS * f.peakMultiplier;

    const textPerDayGB = (dau * f.avgTextDataKB) / (1024 * 1024);
    const imgPerDayGB = f.imageSupport ? (dau * f.imagesPerUserPerDay * f.avgImageSizeKB) / (1024 * 1024) : 0;
    const vidPerDayGB = f.videoSupport ? (dau * f.videosPerUserPerDay * f.avgVideoSizeMB) / 1024 : 0;
    const dailyStorageGB = textPerDayGB + imgPerDayGB + vidPerDayGB;
    const yearlyStorageTB = (dailyStorageGB * 365) / 1024;
    const totalStorageTB = yearlyStorageTB * f.retentionYears;
    const totalStorageWithReplicationTB = totalStorageTB * f.replicationFactor;

    const dailyBandwidthIngressGB = dailyStorageGB;
    const dailyBandwidthEgressGB = dailyBandwidthIngressGB * f.readWriteRatio;
    const peakBandwidthMbps = ((dailyBandwidthEgressGB * 1024 * 8) / SECONDS_IN_DAY) * f.peakMultiplier;

    const dailyReadRequests = totalDailyRequests * readRatio;
    const cacheSizePerReqKB = 2;
    const cacheMemoryGB = (dailyReadRequests * 0.2 * cacheSizePerReqKB * 0.8) / (1024 * 1024);

    const qpsPerServer = 1000;
    const estimatedServers = Math.max(1, Math.ceil((peakReadQPS + peakWriteQPS) / qpsPerServer));
    const dbConnections = estimatedServers * 20;

    return {
        dau, writeQPS, readQPS, peakWriteQPS, peakReadQPS,
        dailyStorageGB, yearlyStorageTB, totalStorageTB, totalStorageWithReplicationTB,
        dailyBandwidthIngressGB, dailyBandwidthEgressGB, peakBandwidthMbps,
        cacheMemoryGB, estimatedServers, dbConnections,
    };
}

// ─── Bar Chart (SVG) ─────────────────────────────────────────────────
function HBarChart({ items, unit }: { items: { label: string; value: number; color: string }[]; unit?: string }) {
    const maxVal = Math.max(...items.map((i) => i.value), 1);
    const barH = 32, gap = 12, labelW = 160, chartW = 500, valueW = 120;
    const totalH = items.length * (barH + gap);
    return (
        <svg width="100%" viewBox={`0 0 ${labelW + chartW + valueW} ${totalH + 10}`} style={{ maxWidth: 800 }}>
            {items.map((item, idx) => {
                const y = idx * (barH + gap) + 5;
                const barWidth = Math.max((item.value / maxVal) * chartW, 4);
                const displayVal = item.value < 0.01 ? item.value.toExponential(1) : item.value >= 1000 ? fmt(item.value, 1) : item.value.toFixed(2);
                return (
                    <g key={idx}>
                        <text x={labelW - 8} y={y + barH / 2 + 5} textAnchor="end" fontSize="12" fill="currentColor">{item.label}</text>
                        <rect x={labelW} y={y} width={barWidth} height={barH} rx={6} fill={item.color} opacity={0.85}>
                            <animate attributeName="width" from="0" to={barWidth} dur="0.7s" fill="freeze" />
                        </rect>
                        <text x={labelW + barWidth + 8} y={y + barH / 2 + 5} fontSize="12" fill="currentColor" fontWeight="600">{displayVal}{unit ? ` ${unit}` : ""}</text>
                    </g>
                );
            })}
        </svg>
    );
}

// ─── Donut Chart (SVG) ───────────────────────────────────────────────
function DonutChart({ slices, centerLabel }: { slices: { label: string; value: number; color: string }[]; centerLabel?: string }) {
    const total = slices.reduce((s, i) => s + i.value, 0) || 1;
    const r = 70, cx = 100, cy = 100, strokeW = 28;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
                {slices.map((s, i) => {
                    const pct = s.value / total;
                    const dash = pct * circumference;
                    const el = (
                        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeW}
                            strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset}
                            transform={`rotate(-90 ${cx} ${cy})`} opacity={0.85}>
                            <animate attributeName="stroke-dashoffset" from={-offset + dash} to={-offset} dur="0.8s" fill="freeze" />
                        </circle>
                    );
                    offset += dash;
                    return el;
                })}
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="700">{centerLabel ?? "Total"}</text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fill="currentColor">{fmtBytes(total)}</text>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {slices.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: s.color, flexShrink: 0 }} />
                        <Text size={200}>{s.label}: <strong>{fmtBytes(s.value)}</strong> ({((s.value / total) * 100).toFixed(1)}%)</Text>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Explanation Sections ────────────────────────────────────────────
function Explanations({ form, result }: { form: FormData; result: EstimationResult }) {
    const styles = useStyles();
    const dau = result.dau;
    const avgReqPerUser = APP_TYPE_DEFAULTS[form.appType]?.avgReq ?? 10;
    const totalDaily = dau * avgReqPerUser;
    const writeRatio = 1 / (1 + form.readWriteRatio);
    const readRatio = form.readWriteRatio / (1 + form.readWriteRatio);

    const textPerDayGB = (dau * form.avgTextDataKB) / (1024 * 1024);
    const imgPerDayGB = form.imageSupport ? (dau * form.imagesPerUserPerDay * form.avgImageSizeKB) / (1024 * 1024) : 0;
    const vidPerDayGB = form.videoSupport ? (dau * form.videosPerUserPerDay * form.avgVideoSizeMB) / 1024 : 0;

    const sections = [
        {
            title: "📊 Daily Active Users (DAU)",
            badge: fmt(dau, 0),
            formula: `DAU = Total Users × DAU%\nDAU = ${fmt(form.totalUsers, 0)} × ${form.dauPercent}%\nDAU = ${fmt(dau, 0)}`,
            explanation: `Industry standard DAU percentages vary by app type: social media ~30-50%, e-commerce ~10-20%, messaging ~70-80%, streaming ~30-40%. Your configuration uses ${form.dauPercent}% for ${APP_TYPE_LABELS[form.appType]}.`,
        },
        {
            title: "⚡ Queries Per Second (QPS)",
            badge: `R: ${fmt(result.readQPS)} / W: ${fmt(result.writeQPS)}`,
            formula: `Avg requests/user/day (${APP_TYPE_LABELS[form.appType]}) = ${avgReqPerUser}\nTotal daily requests = DAU × avgReq = ${fmt(dau, 0)} × ${avgReqPerUser} = ${fmt(totalDaily, 0)}\n\nRead:Write ratio = ${form.readWriteRatio}:1\nWrite fraction = 1/${1 + form.readWriteRatio} ≈ ${(writeRatio * 100).toFixed(1)}%\nRead fraction  = ${form.readWriteRatio}/${1 + form.readWriteRatio} ≈ ${(readRatio * 100).toFixed(1)}%\n\nWrite QPS = (${fmt(totalDaily, 0)} × ${(writeRatio * 100).toFixed(1)}%) / 86,400 ≈ ${result.writeQPS.toFixed(1)}\nRead QPS  = (${fmt(totalDaily, 0)} × ${(readRatio * 100).toFixed(1)}%) / 86,400 ≈ ${result.readQPS.toFixed(1)}\n\nPeak Write QPS = ${result.writeQPS.toFixed(1)} × ${form.peakMultiplier} = ${result.peakWriteQPS.toFixed(1)}\nPeak Read QPS  = ${result.readQPS.toFixed(1)} × ${form.peakMultiplier} = ${result.peakReadQPS.toFixed(1)}`,
            explanation: `QPS is calculated by dividing total daily requests by 86,400 (seconds in a day). The peak multiplier (${form.peakMultiplier}x) accounts for burst traffic during peak hours — for example, evenings for social media or lunch rush for food delivery. The read:write ratio of ${form.readWriteRatio}:1 is typical for ${APP_TYPE_LABELS[form.appType]} applications.`,
        },
        {
            title: "💾 Storage Estimation",
            badge: fmtBytes(result.totalStorageWithReplicationTB * 1024),
            formula: `── Per Day (raw) ──\nText/day  = DAU × ${form.avgTextDataKB} KB = ${textPerDayGB.toFixed(4)} GB\n${form.imageSupport ? `Image/day = DAU × ${form.imagesPerUserPerDay} imgs × ${form.avgImageSizeKB} KB = ${imgPerDayGB.toFixed(4)} GB` : "Image: disabled"}\n${form.videoSupport ? `Video/day = DAU × ${form.videosPerUserPerDay} vids × ${form.avgVideoSizeMB} MB = ${vidPerDayGB.toFixed(4)} GB` : "Video: disabled"}\n\nDaily total  = ${result.dailyStorageGB.toFixed(4)} GB\nYearly total = ${result.dailyStorageGB.toFixed(4)} GB × 365 / 1024 = ${result.yearlyStorageTB.toFixed(4)} TB\n\n── With Retention ──\nRaw storage (${form.retentionYears}y) = ${result.yearlyStorageTB.toFixed(4)} × ${form.retentionYears} = ${result.totalStorageTB.toFixed(4)} TB\n\n── With Replication (×${form.replicationFactor}) ──\nTotal = ${result.totalStorageTB.toFixed(4)} TB × ${form.replicationFactor} = ${result.totalStorageWithReplicationTB.toFixed(4)} TB ≈ ${fmtBytes(result.totalStorageWithReplicationTB * 1024)}`,
            explanation: `Storage grows linearly with users and time. The replication factor of ${form.replicationFactor}× accounts for data redundancy (e.g., primary + ${form.replicationFactor - 1} replicas). Videos typically dominate storage — consider tiered storage: hot data on SSD, warm on HDD, cold on object storage (S3/GCS). Also reserve 20-30% buffer for indexes, logs, and operational overhead.`,
        },
        {
            title: "🌐 Bandwidth Estimation",
            badge: `${result.peakBandwidthMbps >= 1000 ? (result.peakBandwidthMbps / 1000).toFixed(2) + " Gbps" : result.peakBandwidthMbps.toFixed(1) + " Mbps"} peak`,
            formula: `Ingress (upload/writes) ≈ Daily new data = ${fmtBytes(result.dailyBandwidthIngressGB)}/day\nEgress (download/reads) = Ingress × read:write ratio\n                        = ${fmtBytes(result.dailyBandwidthIngressGB)} × ${form.readWriteRatio} = ${fmtBytes(result.dailyBandwidthEgressGB)}/day\n\nPeak egress bandwidth = (Egress/day in GB × 1024 × 8 bits) / 86,400 × peak_mult\n                      = (${result.dailyBandwidthEgressGB.toFixed(2)} × 1024 × 8) / 86,400 × ${form.peakMultiplier}\n                      = ${result.peakBandwidthMbps.toFixed(1)} Mbps${result.peakBandwidthMbps >= 1000 ? " ≈ " + (result.peakBandwidthMbps / 1000).toFixed(2) + " Gbps" : ""}`,
            explanation: "Bandwidth is asymmetric: egress (reads/downloads) is usually much higher than ingress for read-heavy apps. CDNs can offload 60-80% of egress traffic for static assets like images and videos. Consider separate edge caching for media content.",
        },
        {
            title: "🗄️ Cache Estimation (80/20 Rule)",
            badge: fmtBytes(result.cacheMemoryGB),
            formula: `Daily read requests = ${fmt(totalDaily * readRatio, 0)}\nUnique requests (Pareto: 20%) = ${fmt(totalDaily * readRatio * 0.2, 0)}\nAvg cache entry size ≈ 2 KB\nTarget hit ratio = 80%\n\nCache memory = unique_requests × 2 KB × 0.8 / (1024²)\n             = ${fmt(totalDaily * readRatio * 0.2, 0)} × 2 KB × 0.8 / 1,048,576\n             = ${result.cacheMemoryGB.toFixed(2)} GB ≈ ${fmtBytes(result.cacheMemoryGB)}`,
            explanation: "The Pareto principle (80/20 rule) suggests 20% of data accounts for 80% of requests. By caching this hot 20%, you achieve an 80% hit ratio and dramatically reduce database load. Use Redis or Memcached clusters. For very large caches, consider consistent hashing to distribute across multiple cache nodes.",
        },
        {
            title: "🖥️ Server & Infrastructure",
            badge: `${result.estimatedServers} servers`,
            formula: `Peak QPS (total) = Peak Read + Peak Write\n                 = ${result.peakReadQPS.toFixed(1)} + ${result.peakWriteQPS.toFixed(1)}\n                 = ${(result.peakReadQPS + result.peakWriteQPS).toFixed(1)}\n\nCapacity per server ≈ 1,000 QPS (web server baseline)\nServers needed = ⌈${(result.peakReadQPS + result.peakWriteQPS).toFixed(1)} / 1,000⌉ = ${result.estimatedServers}\n\nDB connection pool = ${result.estimatedServers} servers × 20 connections/server = ${result.dbConnections}`,
            explanation: `Server capacity depends on workload type: CPU-bound tasks ~200-500 QPS, I/O-bound ~1,000-2,000 QPS per server. This estimate uses 1,000 QPS as a conservative baseline. In practice, use auto-scaling groups with min/max bounds. Add ~30% safety buffer. Each server maintains a connection pool to the database — ${result.dbConnections} total connections is ${result.dbConnections > 500 ? "high; consider connection pooling with PgBouncer or ProxySQL" : "manageable for most database configurations"}.`,
        },
    ];

    return (
        <>
            <Title2>📖 Detailed Calculations & Justifications</Title2>
            {sections.map((s, i) => (
                <Card key={i} className={styles.explanationCard} style={{ animationDelay: `${i * 0.1}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <Title3>{s.title}</Title3>
                        <Badge appearance="filled" color="brand" size="large">{s.badge}</Badge>
                    </div>
                    <div className={styles.formula}>{s.formula}</div>
                    <Body1 style={{ color: tokens.colorNeutralForeground2, lineHeight: 1.7 }}>{s.explanation}</Body1>
                </Card>
            ))}
        </>
    );
}

// ─── Reference Tables Component ──────────────────────────────────────
function ReferenceTables() {
    const styles = useStyles();

    return (
        <>
            <Title2>📚 Essential Reference Tables</Title2>
            <Body1 style={{ color: tokens.colorNeutralForeground2, marginTop: -12 }}>
                Memorise these numbers — they&apos;re expected in every system design interview
            </Body1>

            {/* Power of 2 */}
            <Card className={styles.chartContainer}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <BookRegular style={{ fontSize: 20, color: tokens.colorBrandForeground1 }} />
                    <Title3>Power of 2 — Data Volume</Title3>
                </div>
                <div className={styles.refTableGrid}>
                    {POWER_OF_2_TABLE.map((row, i) => (
                        <div key={i} className={styles.refTableCell}>
                            <Text size={200}><strong>2<sup>{row.power}</sup></strong></Text>
                            <Text size={200}>{row.value}</Text>
                            <Badge appearance="tint" color="brand" size="small">{row.bytes}</Badge>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Latency Numbers */}
            <Card className={styles.chartContainer}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <ClockRegular style={{ fontSize: 20, color: tokens.colorBrandForeground1 }} />
                    <Title3>Latency Numbers Every Developer Should Know</Title3>
                </div>
                {LATENCY_NUMBERS.map((row, i) => (
                    <div key={i} className={styles.summaryRow} style={{ borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                        <Body1>{row.op}</Body1>
                        <Badge appearance="tint" color={
                            row.time.includes("ns") ? "success" :
                                row.time.includes("μs") ? "informative" :
                                    row.time.includes("ms") && parseInt(row.time) <= 1 ? "warning" : "danger"
                        } size="medium">{row.time}</Badge>
                    </div>
                ))}
                <Text style={{ color: tokens.colorNeutralForeground3, marginTop: 12, fontSize: 12 }}>
                    🟢 ns = nanoseconds (billionths) &nbsp; 🔵 μs = microseconds (millionths) &nbsp; 🟡 ms = milliseconds (thousandths)
                </Text>
            </Card>

            {/* Availability */}
            <Card className={styles.chartContainer}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <LightbulbRegular style={{ fontSize: 20, color: tokens.colorBrandForeground1 }} />
                    <Title3>Availability SLA Reference</Title3>
                </div>
                <div className={styles.refTableGrid}>
                    {AVAILABILITY_TABLE.map((row, i) => (
                        <div key={i} className={styles.refTableCell}>
                            <Text size={200} weight="bold">{row.nines}</Text>
                            <Text size={200}>{row.downtime}</Text>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
}

// ─── Cheat Sheet Component ───────────────────────────────────────────
const CHEAT_SHEET_ITEMS = [
    { title: "⏱️ Time Conversions", formula: "1 day  = 86,400 sec ≈ ~10⁵ sec\n1 year = 365 days  ≈ 31.5 × 10⁶ sec\n1 month ≈ 2.5 × 10⁶ sec", tip: "Round 86,400 to 100K for quick math" },
    { title: "📊 QPS Formula", formula: "QPS = DAU × avg_queries_per_user / 86,400\nPeak QPS = QPS × 2~5 (peak factor)\nRead QPS = QPS × R/(R+1)\nWrite QPS = QPS × 1/(R+1)", tip: "R = read:write ratio. Social media R=10, streaming R=200" },
    { title: "💾 Storage Formula", formula: "Daily = users × data_per_user\nMonthly = Daily × 30\nYearly = Daily × 365\nTotal = Yearly × retention × replication", tip: "Always multiply by replication factor (usually 3×)" },
    { title: "🌐 Bandwidth Formula", formula: "Ingress = Daily new data / 86,400 (bytes/sec)\nEgress = Ingress × read:write ratio\nPeak = Average × peak_factor\nConvert: bytes/sec × 8 = bits/sec", tip: "CDNs can offload 60-80% of egress for static content" },
    { title: "🗄️ Cache (80/20 Rule)", formula: "Cache size = 20% of daily read requests\n           × avg response size\nHit ratio target = 80%\nMemory = requests × 0.2 × size × 0.8", tip: "Pareto: 20% of data serves 80% of reads. Use Redis/Memcached." },
    { title: "🖥️ Server Estimation", formula: "Servers = ⌈Peak QPS / QPS_per_server⌉\nBaseline: 1 server ≈ 500-2,000 QPS\nCPU-bound: ~500 QPS\nI/O-bound: ~2,000 QPS", tip: "Add 30% buffer. Use auto-scaling with min/max bounds." },
    { title: "🔢 Quick Size References", formula: "1 char (ASCII) = 1 byte\n1 char (UTF-8)  = 1-4 bytes\nUser metadata   ≈ 1 KB\nA tweet         ≈ 140 bytes (text)\nImage (thumb)   ≈ 10-50 KB\nImage (full)    ≈ 200 KB - 2 MB\nShort video     ≈ 50-200 MB", tip: "Use these as baseline sizes in interviews" },
    { title: "📐 Common Ratios", formula: "Social Media   → R:W = 10:1,  DAU ~30%\nE-Commerce     → R:W = 100:1, DAU ~15%\nStreaming       → R:W = 200:1, DAU ~35%\nMessaging       → R:W = 1:1,   DAU ~70%\nSaaS/General   → R:W = 5:1,   DAU ~25%", tip: "Read:Write ratio (R:W) drives bandwidth and cache sizing" },
    { title: "🛢️ DB Connection Pool", formula: "Pool size = servers × connections_per_server\nTypical: 10-30 connections per server\nMax connections (PostgreSQL): ~500\nMax connections (MySQL): ~1,000", tip: "If pool > 500, use PgBouncer or ProxySQL for pooling" },
    { title: "📡 Load Balancer Rule of Thumb", formula: "1 LB ≈ 100K concurrent connections\nRound-robin for stateless\nLeast-connections for stateful\nConsistent hashing for cache", tip: "Use multiple LBs with DNS round-robin for HA" },
];

function CheatSheet() {
    const styles = useStyles();
    return (
        <>
            <Title2>📝 Cheat Sheet — Formulas & Rules of Thumb</Title2>
            <Body1 style={{ color: tokens.colorNeutralForeground2, marginTop: -12 }}>
                Quick-reference formulas you can use in any system design interview
            </Body1>
            <div className={styles.cheatGrid}>
                {CHEAT_SHEET_ITEMS.map((item, i) => (
                    <div key={i} className={styles.cheatItem}>
                        <Subtitle2>{item.title}</Subtitle2>
                        <div className={styles.formula}>{item.formula}</div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                            <LightbulbRegular style={{ color: "#f59e0b", fontSize: 16, flexShrink: 0, marginTop: 2 }} />
                            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{item.tip}</Text>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

// ─── Comparison View Component ───────────────────────────────────────
function ComparisonView({ scenarioA, scenarioB, onClear }: {
    scenarioA: SavedScenario;
    scenarioB: { form: FormData; result: EstimationResult };
    onClear: () => void;
}) {
    const styles = useStyles();

    const fmtBw = (mbps: number) => mbps >= 1000 ? (mbps / 1000).toFixed(2) + " Gbps" : mbps.toFixed(1) + " Mbps";

    const delta = (a: number, b: number): { text: string; color: string } => {
        if (a === 0 && b === 0) return { text: "—", color: tokens.colorNeutralForeground3 };
        const pct = a === 0 ? 100 : ((b - a) / a) * 100;
        if (Math.abs(pct) < 0.1) return { text: "≈ same", color: tokens.colorNeutralForeground3 };
        const sign = pct > 0 ? "▲" : "▼";
        return {
            text: `${sign} ${Math.abs(pct).toFixed(1)}%`,
            color: pct > 0 ? "#ef4444" : "#10b981",
        };
    };

    const rows: { label: string; a: string; b: string; aNum: number; bNum: number }[] = [
        { label: "Total Users", a: fmt(scenarioA.form.totalUsers, 0), b: fmt(scenarioB.form.totalUsers, 0), aNum: scenarioA.form.totalUsers, bNum: scenarioB.form.totalUsers },
        { label: "DAU", a: fmt(scenarioA.result.dau, 0), b: fmt(scenarioB.result.dau, 0), aNum: scenarioA.result.dau, bNum: scenarioB.result.dau },
        { label: "App Type", a: APP_TYPE_LABELS[scenarioA.form.appType] ?? scenarioA.form.appType, b: APP_TYPE_LABELS[scenarioB.form.appType] ?? scenarioB.form.appType, aNum: 0, bNum: 0 },
        { label: "Write QPS", a: scenarioA.result.writeQPS.toFixed(1), b: scenarioB.result.writeQPS.toFixed(1), aNum: scenarioA.result.writeQPS, bNum: scenarioB.result.writeQPS },
        { label: "Read QPS", a: scenarioA.result.readQPS.toFixed(1), b: scenarioB.result.readQPS.toFixed(1), aNum: scenarioA.result.readQPS, bNum: scenarioB.result.readQPS },
        { label: "Peak QPS (total)", a: fmt(scenarioA.result.peakReadQPS + scenarioA.result.peakWriteQPS, 1), b: fmt(scenarioB.result.peakReadQPS + scenarioB.result.peakWriteQPS, 1), aNum: scenarioA.result.peakReadQPS + scenarioA.result.peakWriteQPS, bNum: scenarioB.result.peakReadQPS + scenarioB.result.peakWriteQPS },
        { label: "Daily Storage", a: fmtBytes(scenarioA.result.dailyStorageGB), b: fmtBytes(scenarioB.result.dailyStorageGB), aNum: scenarioA.result.dailyStorageGB, bNum: scenarioB.result.dailyStorageGB },
        { label: "Total Storage (w/ replication)", a: fmtBytes(scenarioA.result.totalStorageWithReplicationTB * 1024), b: fmtBytes(scenarioB.result.totalStorageWithReplicationTB * 1024), aNum: scenarioA.result.totalStorageWithReplicationTB, bNum: scenarioB.result.totalStorageWithReplicationTB },
        { label: "Peak Bandwidth", a: fmtBw(scenarioA.result.peakBandwidthMbps), b: fmtBw(scenarioB.result.peakBandwidthMbps), aNum: scenarioA.result.peakBandwidthMbps, bNum: scenarioB.result.peakBandwidthMbps },
        { label: "Cache Memory", a: fmtBytes(scenarioA.result.cacheMemoryGB), b: fmtBytes(scenarioB.result.cacheMemoryGB), aNum: scenarioA.result.cacheMemoryGB, bNum: scenarioB.result.cacheMemoryGB },
        { label: "Servers Needed", a: String(scenarioA.result.estimatedServers), b: String(scenarioB.result.estimatedServers), aNum: scenarioA.result.estimatedServers, bNum: scenarioB.result.estimatedServers },
        { label: "DB Connections", a: String(scenarioA.result.dbConnections), b: String(scenarioB.result.dbConnections), aNum: scenarioA.result.dbConnections, bNum: scenarioB.result.dbConnections },
    ];

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ArrowSwapRegular style={{ fontSize: 24, color: tokens.colorBrandForeground1 }} />
                    <Title2 style={{ margin: 0 }}>⚖️ Side-by-Side Comparison</Title2>
                </div>
                <Button appearance="subtle" icon={<DismissRegular />} onClick={onClear}>Clear Comparison</Button>
            </div>
            <Card className={styles.chartContainer}>
                <table className={styles.compareTable}>
                    <thead>
                        <tr>
                            <th className={styles.compareHeader} style={{ minWidth: 180 }}>Metric</th>
                            <th className={styles.compareHeader} style={{ minWidth: 140 }}>
                                <Badge appearance="filled" color="brand" size="small">A</Badge> {scenarioA.name}
                            </th>
                            <th className={styles.compareHeader} style={{ minWidth: 140 }}>
                                <Badge appearance="filled" color="informative" size="small">B</Badge> Current
                            </th>
                            <th className={styles.compareHeader} style={{ minWidth: 100 }}>Delta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => {
                            const d = row.label === "App Type" ? { text: row.a === row.b ? "same" : "different", color: tokens.colorNeutralForeground3 } : delta(row.aNum, row.bNum);
                            return (
                                <tr key={i}>
                                    <td className={styles.compareCell}><Text weight="semibold">{row.label}</Text></td>
                                    <td className={styles.compareCell}><Text>{row.a}</Text></td>
                                    <td className={styles.compareCell}><Text>{row.b}</Text></td>
                                    <td className={styles.compareCell}>
                                        <span className={styles.compareDelta} style={{ color: d.color }}>{d.text}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </>
    );
}

// ─── Main Component ──────────────────────────────────────────────────
export const BackOfEnvelopeEstimation = () => {
    const styles = useStyles();
    const navigate = useNavigate();

    const [form, setForm] = useState<FormData>({
        totalUsers: 10_000_000,
        dauPercent: 30,
        appType: "social-media",
        imageSupport: true,
        avgImageSizeKB: 200,
        imagesPerUserPerDay: 2,
        videoSupport: false,
        avgVideoSizeMB: 50,
        videosPerUserPerDay: 0.1,
        avgTextDataKB: 5,
        readWriteRatio: 10,
        retentionYears: 5,
        peakMultiplier: 3,
        replicationFactor: 3,
    });

    const [result, setResult] = useState<EstimationResult | null>(null);
    const [savedScenario, setSavedScenario] = useState<SavedScenario | null>(null);
    const [activeTab, setActiveTab] = useState<string>("calculator");

    const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
        setActiveTab(data.value as string);
    };

    const upd = <K extends keyof FormData>(key: K, val: FormData[K]) => setForm((p) => ({ ...p, [key]: val }));

    const applyPreset = (preset: Preset) => {
        setForm((prev) => ({ ...prev, ...preset.form }));
        setResult(null);
    };

    const handleAppTypeChange = (appType: string) => {
        const defaults = APP_TYPE_DEFAULTS[appType];
        if (defaults) {
            setForm((prev) => ({
                ...prev,
                appType,
                dauPercent: defaults.dau,
                readWriteRatio: defaults.rw,
                avgTextDataKB: defaults.text,
                imageSupport: defaults.img,
                avgImageSizeKB: defaults.imgSize,
                imagesPerUserPerDay: defaults.imgCount,
                videoSupport: defaults.vid,
                avgVideoSizeMB: defaults.vidSize,
                videosPerUserPerDay: defaults.vidCount,
            }));
        }
    };

    const handleSubmit = () => {
        if (form.totalUsers <= 0) return;
        setResult(calculate(form));
    };

    const handleSaveScenario = () => {
        if (!result) return;
        const name = APP_TYPE_LABELS[form.appType] + " (" + fmt(form.totalUsers, 0) + " users)";
        setSavedScenario({ name, form: { ...form }, result: { ...result } });
    };

    const hasValidation = form.totalUsers <= 0;
    const canCompare = savedScenario !== null && result !== null;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => navigate("/")} style={{ alignSelf: "flex-start" }}>Back</Button>
            </div>

            <Card className={styles.heroCard}>
                <Title1 style={{ color: "white", marginBottom: 8 }}>📐 Back of the Envelope Estimation</Title1>
                <Subtitle1 style={{ color: "rgba(255,255,255,0.85)" }}>
                    Configure your system parameters below and get instant capacity estimates with full calculation breakdowns
                </Subtitle1>
            </Card>

            {/* ── Tab Navigation ── */}
            <div className={styles.tabBar}>
                <TabList selectedValue={activeTab} onTabSelect={onTabSelect} size="large" appearance="subtle">
                    <Tab value="reference" icon={<BookRegular />}>📚 Reference Tables</Tab>
                    <Tab value="cheatsheet" icon={<DocumentBulletListRegular />}>📝 Cheat Sheet</Tab>
                    <Tab value="calculator" icon={<CalculatorRegular />}>🧮 Calculator</Tab>
                </TabList>
            </div>

            {/* ── Tab: Reference Tables ── */}
            {activeTab === "reference" && <ReferenceTables />}

            {/* ── Tab: Cheat Sheet ── */}
            {activeTab === "cheatsheet" && <CheatSheet />}

            {/* ── Tab: Calculator ── */}
            {activeTab !== "calculator" ? null : (<>

                {/* ── Saved Scenario Banner ── */}
                {savedScenario && (
                    <div className={styles.savedScenarioBanner}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <SaveRegular style={{ color: tokens.colorBrandForeground1, fontSize: 20 }} />
                            <div>
                                <Text weight="semibold">Scenario A saved: </Text>
                                <Badge appearance="filled" color="brand" size="small">{savedScenario.name}</Badge>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                Modify parameters & calculate again to compare side-by-side
                            </Text>
                            <Button appearance="subtle" size="small" icon={<DismissRegular />} onClick={() => setSavedScenario(null)}>Clear</Button>
                        </div>
                    </div>
                )}

                {/* ── Presets ── */}
                <Title2>🚀 Quick Start — Pick a System Design</Title2>
                <Body1 style={{ color: tokens.colorNeutralForeground2, marginTop: -12 }}>
                    Select a popular design question to auto-fill realistic parameters, then customize as needed
                </Body1>
                <div className={styles.presetGrid}>
                    {PRESETS.map((p, i) => (
                        <Card key={i} className={styles.presetCard} onClick={() => applyPreset(p)}
                            style={{ border: `2px solid ${p.color}22`, background: `${p.color}08` }}>
                            <Text size={600}>{p.emoji}</Text>
                            <br />
                            <Text weight="bold" size={300}>{p.name}</Text>
                            <br />
                            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{p.desc}</Text>
                        </Card>
                    ))}
                </div>

                {/* ── Input Form ── */}
                <Title2>🔧 System Parameters</Title2>

                {hasValidation && (
                    <MessageBar intent="warning">
                        <MessageBarBody>
                            <MessageBarTitle>Invalid Input</MessageBarTitle>
                            Total users must be greater than 0 to calculate estimations.
                        </MessageBarBody>
                    </MessageBar>
                )}

                <div className={styles.formGrid}>
                    {/* Users */}
                    <Card className={styles.formCard}>
                        <div className={styles.fieldLabel}><PeopleRegular style={{ color: tokens.colorBrandForeground1, fontSize: 20 }} /><Subtitle2>Total Users</Subtitle2></div>
                        <Input type="number" value={String(form.totalUsers)} onChange={(_, d) => upd("totalUsers", Number(d.value) || 0)} />
                        <div className={styles.fieldLabel}><Subtitle2>DAU %</Subtitle2>
                            <Tooltip content="Percentage of total users active daily. Varies by app type." relationship="description"><InfoRegular style={{ fontSize: 14, cursor: "help" }} /></Tooltip>
                        </div>
                        <Input type="number" min={1} max={100} value={String(form.dauPercent)} onChange={(_, d) => upd("dauPercent", Math.min(100, Math.max(1, Number(d.value) || 1)))} />
                    </Card>

                    {/* App Type */}
                    <Card className={styles.formCard}>
                        <div className={styles.fieldLabel}><GlobeRegular style={{ color: tokens.colorBrandForeground1, fontSize: 20 }} /><Subtitle2>Application Type</Subtitle2></div>
                        <Select value={form.appType} onChange={(_, d) => handleAppTypeChange(d.value)}>
                            <option value="social-media">Social Media</option>
                            <option value="e-commerce">E-Commerce</option>
                            <option value="streaming">Video Streaming</option>
                            <option value="messaging">Messaging / Chat</option>
                            <option value="saas">SaaS / General</option>
                        </Select>
                        <Body1 size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                            Auto-adjusts DAU%, read:write ratio, and media defaults
                        </Body1>
                    </Card>

                    {/* Text & Ratios */}
                    <Card className={styles.formCard}>
                        <div className={styles.fieldLabel}><DatabaseRegular style={{ color: tokens.colorBrandForeground1, fontSize: 20 }} /><Subtitle2>Avg Text Data / User / Day</Subtitle2></div>
                        <Input type="number" value={String(form.avgTextDataKB)} onChange={(_, d) => upd("avgTextDataKB", Number(d.value) || 0)} contentAfter={<Text size={200}>KB</Text>} />
                        <div className={styles.fieldLabel}><Subtitle2>Read : Write Ratio</Subtitle2>
                            <Tooltip content="How many reads per write. Social media: ~10:1, Streaming: ~200:1" relationship="description"><InfoRegular style={{ fontSize: 14, cursor: "help" }} /></Tooltip>
                        </div>
                        <Input type="number" min={1} value={String(form.readWriteRatio)} onChange={(_, d) => upd("readWriteRatio", Number(d.value) || 1)} contentAfter={<Text size={200}>: 1</Text>} />
                    </Card>

                    {/* Images */}
                    <Card className={styles.formCard}>
                        <div className={styles.fieldLabel}><ImageRegular style={{ color: tokens.colorBrandForeground1, fontSize: 20 }} /><Subtitle2>Image Support</Subtitle2></div>
                        <Switch checked={form.imageSupport} onChange={(_, d) => upd("imageSupport", d.checked)} label={form.imageSupport ? "Enabled" : "Disabled"} />
                        {form.imageSupport && (
                            <>
                                <Input type="number" value={String(form.avgImageSizeKB)} onChange={(_, d) => upd("avgImageSizeKB", Number(d.value) || 0)} contentAfter={<Text size={200}>KB avg</Text>} />
                                <Input type="number" value={String(form.imagesPerUserPerDay)} onChange={(_, d) => upd("imagesPerUserPerDay", Number(d.value) || 0)} contentAfter={<Text size={200}>imgs/user/day</Text>} />
                            </>
                        )}
                    </Card>

                    {/* Videos */}
                    <Card className={styles.formCard}>
                        <div className={styles.fieldLabel}><VideoRegular style={{ color: tokens.colorBrandForeground1, fontSize: 20 }} /><Subtitle2>Video Support</Subtitle2></div>
                        <Switch checked={form.videoSupport} onChange={(_, d) => upd("videoSupport", d.checked)} label={form.videoSupport ? "Enabled" : "Disabled"} />
                        {form.videoSupport && (
                            <>
                                <Input type="number" value={String(form.avgVideoSizeMB)} onChange={(_, d) => upd("avgVideoSizeMB", Number(d.value) || 0)} contentAfter={<Text size={200}>MB avg</Text>} />
                                <Input type="number" step={0.1} value={String(form.videosPerUserPerDay)} onChange={(_, d) => upd("videosPerUserPerDay", Number(d.value) || 0)} contentAfter={<Text size={200}>vids/user/day</Text>} />
                            </>
                        )}
                    </Card>

                    {/* Scale & Replication */}
                    <Card className={styles.formCard}>
                        <div className={styles.fieldLabel}><ServerRegular style={{ color: tokens.colorBrandForeground1, fontSize: 20 }} /><Subtitle2>Scale & Redundancy</Subtitle2></div>
                        <div className={styles.fieldLabel}><Subtitle2>Peak Multiplier</Subtitle2>
                            <Tooltip content="Burst traffic during peak hours (2-5x typical)" relationship="description"><InfoRegular style={{ fontSize: 14, cursor: "help" }} /></Tooltip>
                        </div>
                        <Input type="number" min={1} max={10} value={String(form.peakMultiplier)} onChange={(_, d) => upd("peakMultiplier", Number(d.value) || 1)} contentAfter={<Text size={200}>×</Text>} />
                        <div className={styles.fieldLabel}><StorageRegular style={{ color: tokens.colorBrandForeground1, fontSize: 20 }} /><Subtitle2>Retention Period</Subtitle2></div>
                        <Input type="number" min={1} value={String(form.retentionYears)} onChange={(_, d) => upd("retentionYears", Number(d.value) || 1)} contentAfter={<Text size={200}>years</Text>} />
                        <div className={styles.fieldLabel}><Subtitle2>Replication Factor</Subtitle2>
                            <Tooltip content="Number of data copies (1 primary + N-1 replicas). Standard is 3." relationship="description"><InfoRegular style={{ fontSize: 14, cursor: "help" }} /></Tooltip>
                        </div>
                        <Input type="number" min={1} max={5} value={String(form.replicationFactor)} onChange={(_, d) => upd("replicationFactor", Math.min(5, Math.max(1, Number(d.value) || 1)))} contentAfter={<Text size={200}>copies</Text>} />
                    </Card>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <Button className={styles.submitBtn} appearance="primary" icon={<CalculatorRegular />} iconPosition="before" onClick={handleSubmit} size="large" disabled={hasValidation}>
                        Calculate Estimation
                    </Button>
                    {result && !savedScenario && (
                        <Button appearance="secondary" icon={<SaveRegular />} iconPosition="before" onClick={handleSaveScenario} size="large" style={{ borderRadius: 24, minWidth: 200, height: 48 }}>
                            Save as Scenario A
                        </Button>
                    )}
                </div>

                {/* ── Comparison View ── */}
                {canCompare && (
                    <>
                        <Divider style={{ margin: "8px 0" }}><Badge appearance="tint" color="severe" size="large">Comparison</Badge></Divider>
                        <ComparisonView
                            scenarioA={savedScenario}
                            scenarioB={{ form, result: result! }}
                            onClear={() => setSavedScenario(null)}
                        />
                    </>
                )}

                {/* ── Results ── */}
                {result && (
                    <>
                        <Divider style={{ margin: "8px 0" }}><Badge appearance="tint" color="brand" size="large">{savedScenario ? "Scenario B — Results" : "Results"}</Badge></Divider>

                        <Title2>📈 Estimation Summary</Title2>
                        <div className={styles.resultsGrid}>
                            {([
                                ["Daily Active Users", fmt(result.dau, 0), <PeopleRegular key="p" />],
                                ["Write QPS", result.writeQPS.toFixed(1), <ArrowRightRegular key="w" />],
                                ["Read QPS", result.readQPS.toFixed(1), <ArrowRightRegular key="r" />],
                                ["Peak QPS (total)", fmt(result.peakReadQPS + result.peakWriteQPS, 1), <ArrowRightRegular key="pk" />],
                                ["Daily Storage", fmtBytes(result.dailyStorageGB), <DatabaseRegular key="ds" />],
                                ["Total Storage (" + form.retentionYears + "y, ×" + form.replicationFactor + ")", fmtBytes(result.totalStorageWithReplicationTB * 1024), <StorageRegular key="ts" />],
                                ["Peak Bandwidth", result.peakBandwidthMbps >= 1000 ? (result.peakBandwidthMbps / 1000).toFixed(2) + " Gbps" : result.peakBandwidthMbps.toFixed(1) + " Mbps", <GlobeRegular key="bw" />],
                                ["Cache Memory", fmtBytes(result.cacheMemoryGB), <ServerRegular key="c" />],
                                ["Servers Needed", String(result.estimatedServers), <ServerRegular key="s" />],
                            ] as [string, string, React.ReactNode][]).map(([label, value, icon], i) => (
                                <Card key={i} className={styles.resultCard} style={{ animationDelay: `${i * 0.08}s` }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: tokens.colorBrandForeground1 }}>{icon}<Subtitle2>{label}</Subtitle2></div>
                                    <div className={styles.metricValue}>{value}</div>
                                </Card>
                            ))}
                        </div>

                        {/* ── Charts ── */}
                        <Title2>📊 Visual Breakdown</Title2>

                        <Card className={styles.chartContainer}>
                            <Title3 style={{ marginBottom: 16 }}>Storage Distribution (Daily)</Title3>
                            <DonutChart centerLabel="Daily" slices={[
                                { label: "Text Data", value: (result.dau * form.avgTextDataKB) / (1024 * 1024), color: "#6366f1" },
                                ...(form.imageSupport ? [{ label: "Image Data", value: (result.dau * form.imagesPerUserPerDay * form.avgImageSizeKB) / (1024 * 1024), color: "#f59e0b" }] : []),
                                ...(form.videoSupport ? [{ label: "Video Data", value: (result.dau * form.videosPerUserPerDay * form.avgVideoSizeMB) / 1024, color: "#ef4444" }] : []),
                            ]} />
                        </Card>

                        <Card className={styles.chartContainer}>
                            <Title3 style={{ marginBottom: 16 }}>QPS Comparison</Title3>
                            <HBarChart unit="QPS" items={[
                                { label: "Write QPS", value: result.writeQPS, color: "#6366f1" },
                                { label: "Read QPS", value: result.readQPS, color: "#3b82f6" },
                                { label: "Peak Write QPS", value: result.peakWriteQPS, color: "#f59e0b" },
                                { label: "Peak Read QPS", value: result.peakReadQPS, color: "#ef4444" },
                            ]} />
                        </Card>

                        <Card className={styles.chartContainer}>
                            <Title3 style={{ marginBottom: 16 }}>Bandwidth Breakdown</Title3>
                            <HBarChart unit="GB/day" items={[
                                { label: "Ingress (writes)", value: result.dailyBandwidthIngressGB, color: "#6366f1" },
                                { label: "Egress (reads)", value: result.dailyBandwidthEgressGB, color: "#ef4444" },
                            ]} />
                        </Card>

                        {/* ── Explanations ── */}
                        <Divider style={{ margin: "8px 0" }} />
                        <Explanations form={form} result={result} />

                        {/* Quick Summary Table */}
                        <Card className={styles.chartContainer}>
                            <Title3 style={{ marginBottom: 16 }}>📋 Quick Reference Summary</Title3>
                            {[
                                ["Total Users", fmt(form.totalUsers, 0)],
                                ["DAU", fmt(result.dau, 0)],
                                ["Application Type", APP_TYPE_LABELS[form.appType] ?? form.appType],
                                ["Read:Write Ratio", `${form.readWriteRatio}:1`],
                                ["Write QPS / Peak", `${result.writeQPS.toFixed(1)} / ${result.peakWriteQPS.toFixed(1)}`],
                                ["Read QPS / Peak", `${result.readQPS.toFixed(1)} / ${result.peakReadQPS.toFixed(1)}`],
                                ["Daily New Data", fmtBytes(result.dailyStorageGB)],
                                ["Raw Storage (" + form.retentionYears + "y)", fmtBytes(result.totalStorageTB * 1024)],
                                ["With Replication (×" + form.replicationFactor + ")", fmtBytes(result.totalStorageWithReplicationTB * 1024)],
                                ["Peak Bandwidth", result.peakBandwidthMbps >= 1000 ? (result.peakBandwidthMbps / 1000).toFixed(2) + " Gbps" : result.peakBandwidthMbps.toFixed(1) + " Mbps"],
                                ["Cache Memory", fmtBytes(result.cacheMemoryGB)],
                                ["Application Servers", String(result.estimatedServers)],
                                ["DB Connection Pool", String(result.dbConnections)],
                            ].map(([label, val], i) => (
                                <div key={i} className={styles.summaryRow} style={{ borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                                    <Body1 style={{ fontWeight: 600 }}>{label}</Body1>
                                    <Badge appearance="tint" color="informative" size="medium">{val}</Badge>
                                </div>
                            ))}
                        </Card>
                    </>
                )}
            </>)}
        </div>
    );
};
