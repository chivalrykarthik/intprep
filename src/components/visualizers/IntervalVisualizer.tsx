import { useState } from "react";
import {
    makeStyles,
    Button,
    Text,
    tokens,
    shorthands,
} from "@fluentui/react-components";
import {
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
    },
    title: {
        fontWeight: "600",
        fontSize: "16px",
        marginBottom: "8px",
    },
    visualizationArea: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "20px",
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: "8px",
        minHeight: "150px",
        position: "relative",
        overflowX: "auto", // Enable scrolling
    },
    row: {
        display: "flex",
        alignItems: "center",
        height: "40px",
        position: "relative",
        width: "100%",
        minWidth: "500px", // Ensure minimum width to prevent squashing
    },
    rowLabel: {
        width: "80px",
        fontWeight: "600",
        fontSize: "12px",
        color: tokens.colorNeutralForeground2,
    },
    track: {
        flex: 1,
        position: "relative",
        height: "100%",
        display: "flex",
        alignItems: "center",
        // Simple tick marks or grid could go here
        borderBottom: `1px dashed ${tokens.colorNeutralStroke2}`,
    },
    intervalBar: {
        position: "absolute",
        height: "24px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "11px",
        fontWeight: "bold",
        transition: "all 0.5s cubic-bezier(0.33, 1, 0.68, 1)", // Smooth morphing
        boxShadow: tokens.shadow4,
        zIndex: 1,
    },
    controls: {
        display: "flex",
        gap: "12px",
        justifyContent: "center",
    },
    status: {
        textAlign: "center",
        minHeight: "24px",
        fontStyle: "italic",
        color: tokens.colorNeutralForeground2,
    },
});

interface IntervalVisualizerProps {
    data?: number[][]; // [[1,3], [2,6], ...]
}

export const IntervalVisualizer = ({
    data = [[1, 3], [2, 6], [8, 10], [15, 18]],
}: IntervalVisualizerProps) => {
    const styles = useStyles();

    // State
    const [step, setStep] = useState(0);

    // Calculate max value to scale the visualization width
    const maxValue = data.reduce((max, interval) => Math.max(max, interval[1]), 0) + 2;

    // Helper to calculate width percentage
    const getLeft = (val: number) => (val / maxValue) * 100;
    const getWidth = (start: number, end: number) => ((end - start) / maxValue) * 100;

    // Simulation Logic is computed via getSimulationState call below to avoid double state.

    // Re-implementing logic dry-run inside render or Memo to "get" the step data
    // For simplicity, let's just implement the "getStateForStep" logic

    const getSimulationState = () => {
        // Clone deep 
        const currentList: number[][] = JSON.parse(JSON.stringify(data.sort((a, b) => a[0] - b[0])));
        const snapshots: {
            msg: string;
            intervals: number[][];
            highlight: number[];
        }[] = [];

        snapshots.push({
            msg: "Initial sorted intervals.",
            intervals: JSON.parse(JSON.stringify(currentList)),
            highlight: []
        });

        let i = 0;
        let stepCount = 0;

        // Limit iterations to prevent infinite loops in bad logic
        while (i < currentList.length - 1 && stepCount < 20) {
            stepCount++;
            const current = currentList[i];
            const next = currentList[i + 1];

            snapshots.push({
                msg: `Checking overlap: [${current}] vs [${next}]`,
                intervals: JSON.parse(JSON.stringify(currentList)),
                highlight: [i, i + 1]
            });

            if (next[0] <= current[1]) {
                const newEnd = Math.max(current[1], next[1]);
                const merged = [current[0], newEnd];

                currentList[i] = merged;
                currentList.splice(i + 1, 1);

                snapshots.push({
                    msg: `Merged! New range: [${merged}]`,
                    intervals: JSON.parse(JSON.stringify(currentList)),
                    highlight: [i]
                });
            } else {
                i++;
            }
        }

        snapshots.push({
            msg: "Complete!",
            intervals: JSON.parse(JSON.stringify(currentList)),
            highlight: []
        });

        return snapshots;
    };

    const snapshots = getSimulationState();
    const currentSnapshot = snapshots[step];

    const nextStep = () => {
        if (step < snapshots.length - 1) setStep(s => s + 1);
    };

    const reset = () => {
        setStep(0);
    };

    // Color Logic
    const getColor = (idx: number, highlight: number[]) => {
        if (highlight.includes(idx)) {
            // If we are merging (next step has fewer items), show brand color
            // If simple comparison, show warning color
            return tokens.colorPaletteRoyalBlueBackground2; // Active
        }
        return tokens.colorBrandBackground; // Default
    };

    return (
        <div className={styles.container}>
            <Text className={styles.title}>Visualizing Merge Intervals</Text>

            <div className={styles.visualizationArea}>
                <div className={styles.row}>
                    <div className={styles.rowLabel}>Timeline</div>
                    <div className={styles.track}>
                        {/* Render simple timeline axis if needed */}
                        <div style={{ position: 'absolute', left: '0%', bottom: '-15px', fontSize: '10px' }}>0</div>
                        <div style={{ position: 'absolute', right: '0%', bottom: '-15px', fontSize: '10px' }}>{maxValue - 2}</div>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.rowLabel}>Intervals</div>
                    <div className={styles.track}>
                        {currentSnapshot.intervals.map((interval: number[], idx: number) => (
                            <div
                                key={`${interval[0]}-${interval[1]}-${idx}`} // Unstable key effectively forces animation on position change? checking
                                className={styles.intervalBar}
                                style={{
                                    left: `${getLeft(interval[0])}%`,
                                    width: `${getWidth(interval[0], interval[1])}%`,
                                    backgroundColor: getColor(idx, currentSnapshot.highlight || []),
                                    // if it's the second item being merged, maybe make it ghost into the first?
                                }}
                            >
                                [{interval[0]}, {interval[1]}]
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.status}>
                {currentSnapshot.msg}
            </div>

            <div className={styles.controls}>
                <Button
                    icon={<ArrowResetRegular />}
                    onClick={reset}
                    appearance="subtle"
                >
                    Reset
                </Button>
                <Button
                    icon={<ArrowRightRegular />}
                    iconPosition="after"
                    onClick={nextStep}
                    disabled={step >= snapshots.length - 1}
                    appearance="primary"
                >
                    Next Step
                </Button>
            </div>
        </div>
    );
};
