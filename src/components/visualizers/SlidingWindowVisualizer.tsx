import { useState } from "react";
import {
    makeStyles,
    Button,
    Text,
    tokens,
    shorthands,
} from "@fluentui/react-components";
import {
    ArrowLeftRegular,
    ArrowRightRegular,
    ArrowResetRegular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "24px",
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: "12px",
        margin: "24px 0",
        ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
        width: "100%", // Explicitly fill parent width
        boxSizing: "border-box", // Ensure padding is included in width
        maxWidth: "100%", // Prevent expanding beyond parent
    },
    title: {
        fontWeight: "600",
        fontSize: "16px",
        marginBottom: "8px",
    },
    arrayContainer: {
        display: "flex",
        gap: "8px",
        flexWrap: "nowrap",
        justifyContent: "flex-start",
        padding: "20px 0",
        overflowX: "auto",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0, // Allow flex item to shrink
    },
    cell: {
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...shorthands.border("2px", "solid", tokens.colorNeutralStroke1),
        borderRadius: "8px",
        backgroundColor: tokens.colorNeutralBackground1,
        fontWeight: "bold",
        transition: "all 0.3s ease",
        position: "relative",
    },
    activeCell: {
        ...shorthands.borderColor(tokens.colorBrandStroke1),
        backgroundColor: tokens.colorBrandBackground2,
        transform: "scale(1.1)",
        zIndex: 1,
    },
    controls: {
        display: "flex",
        gap: "12px",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    stats: {
        display: "flex",
        justifyContent: "space-around",
        flexWrap: "wrap", // Allow stats to wrap
        gap: "10px", // Add gap when wrapping
        padding: "12px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "8px",
    },
    statItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    label: {
        fontSize: "12px",
        color: tokens.colorNeutralForeground2,
    },
    value: {
        fontWeight: "bold",
        fontSize: "18px",
    },
    explanation: {
        textAlign: "center",
        minHeight: "40px",
        fontStyle: "italic",
        color: tokens.colorNeutralForeground2,
        wordBreak: "break-word",
        maxWidth: "100%",
        padding: "0 8px",
        lineHeight: "1.4",
    },
});

interface SlidingWindowVisualizerProps {
    data?: number[];
    k?: number;
}

export const SlidingWindowVisualizer = ({
    data = [1, 3, 2, 6, -1, 4, 1, 8, 2],
    k = 3,
}: SlidingWindowVisualizerProps) => {
    const styles = useStyles();
    const [windowStart, setWindowStart] = useState(0);

    // Derived state
    const windowEnd = windowStart + k - 1;
    const currentWindow = data.slice(windowStart, windowStart + k);
    const currentSum = currentWindow.reduce((a, b) => a + b, 0);

    const maxPossibleStart = data.length - k;

    const handleNext = () => {
        if (windowStart < maxPossibleStart) {
            setWindowStart((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (windowStart > 0) {
            setWindowStart((prev) => prev - 1);
        }
    };

    const handleReset = () => {
        setWindowStart(0);
    };

    return (
        <div className={styles.container}>
            <Text className={styles.title}>Interactive Sliding Window (k={k})</Text>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <Text className={styles.label}>Window Sum</Text>
                    <Text className={styles.value}>{currentSum}</Text>
                </div>
                <div className={styles.statItem}>
                    <Text className={styles.label}>Left Index</Text>
                    <Text className={styles.value}>{windowStart}</Text>
                </div>
                <div className={styles.statItem}>
                    <Text className={styles.label}>Right Index</Text>
                    <Text className={styles.value}>{windowEnd}</Text>
                </div>
            </div>

            <div className={styles.arrayContainer}>
                {data.map((val, idx) => {
                    const isActive = idx >= windowStart && idx <= windowEnd;
                    return (
                        <div
                            key={idx}
                            className={`${styles.cell} ${isActive ? styles.activeCell : ""}`}
                        >
                            {val}
                        </div>
                    );
                })}
            </div>

            <div className={styles.explanation}>
                {windowStart === 0 ? (
                    <Text>Initial Window: Sum of first {k} elements.</Text>
                ) : (
                    <Text>
                        Slid Right: Subtracted {data[windowStart - 1]} (left), Added {data[windowEnd]} (right).
                    </Text>
                )}
            </div>

            <div className={styles.controls}>
                <Button
                    icon={<ArrowLeftRegular />}
                    onClick={handlePrev}
                    disabled={windowStart === 0}
                >
                    Prev
                </Button>
                <Button
                    icon={<ArrowResetRegular />}
                    onClick={handleReset}
                    appearance="subtle"
                >
                    Reset
                </Button>
                <Button
                    icon={<ArrowRightRegular />}
                    iconPosition="after"
                    onClick={handleNext}
                    disabled={windowStart >= maxPossibleStart}
                    appearance="primary"
                >
                    Next
                </Button>
            </div>
        </div>
    );
};
