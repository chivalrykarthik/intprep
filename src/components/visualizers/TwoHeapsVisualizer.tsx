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
    visualizerArea: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        gap: "20px",
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: "8px",
        position: "relative",
    },
    heapsContainer: {
        display: "flex",
        justifyContent: "space-around",
        width: "100%",
        gap: "20px",
    },
    heapSection: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        flex: 1,
        padding: "10px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "8px",
        minHeight: "150px",
    },
    heapTitle: {
        fontWeight: "bold",
        fontSize: "14px",
        color: tokens.colorNeutralForeground2,
    },
    nodeStack: {
        display: "flex",
        flexDirection: "column-reverse", // Bottom is root? Or Top is root? 
        // Heaps are trees, but for median finding we care about the TOP.
        // Let's visualize as a vertical stack where the top element is the Heap Root.
        gap: "4px",
        width: "100%",
        alignItems: "center",
    },
    node: {
        width: "80%",
        padding: "8px",
        textAlign: "center",
        backgroundColor: tokens.colorBrandBackground2,
        border: `1px solid ${tokens.colorBrandStroke1}`,
        borderRadius: "4px",
        fontWeight: "bold",
        transition: "all 0.3s ease",
    },
    medianBox: {
        padding: "12px 24px",
        backgroundColor: tokens.colorPaletteRoyalBlueBackground2,
        color: "white",
        borderRadius: "8px",
        fontWeight: "bold",
        fontSize: "18px",
        marginTop: "10px",
    },
    status: {
        textAlign: "center",
        minHeight: "40px",
        fontStyle: "italic",
        color: tokens.colorNeutralForeground2,
    },
    controls: {
        display: "flex",
        gap: "12px",
        justifyContent: "center",
    },
});

interface TwoHeapsVisualizerProps {
    data?: number[];
}

export const TwoHeapsVisualizer = ({
    data = [5, 2, 8, 1, 9],
}: TwoHeapsVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    const getSimulationState = () => {
        const snapshots = [];

        let minHeap: number[] = []; // Top is smallest (Stores larger half)
        let maxHeap: number[] = []; // Top is largest (Stores smaller half)

        // Helper to mimic Priority Queue (inefficiently for sim)
        const addToMax = (val: number) => {
            maxHeap.push(val);
            maxHeap.sort((a, b) => b - a); // Descending, index 0 is max
        };
        const removeMax = () => maxHeap.shift();

        const addToMin = (val: number) => {
            minHeap.push(val);
            minHeap.sort((a, b) => a - b); // Ascending, index 0 is min
        };
        const removeMin = () => minHeap.shift();

        // Initial State
        snapshots.push({
            msg: "Start with empty heaps.",
            maxHeap: [],
            minHeap: [],
            median: 0,
            incoming: null as number | null
        });

        for (const num of data) {
            snapshots.push({
                msg: `Incoming number: ${num}`,
                maxHeap: [...maxHeap],
                minHeap: [...minHeap],
                median: null,
                incoming: num
            });

            // 1. Add to Max Heap
            addToMax(num);
            snapshots.push({
                msg: `Push ${num} to Max Heap (Smaller Half).`,
                maxHeap: [...maxHeap],
                minHeap: [...minHeap],
                median: null,
                incoming: null
            });

            // 2. Move largest of Max to Min
            const moved = removeMax()!;
            addToMin(moved);
            snapshots.push({
                msg: `Balance: Move largest of Max (${moved}) to Min Heap.`,
                maxHeap: [...maxHeap],
                minHeap: [...minHeap],
                median: null,
                incoming: null
            });

            // 3. Balance Sizes
            if (minHeap.length > maxHeap.length) {
                const back = removeMin()!;
                addToMax(back);
                snapshots.push({
                    msg: `Balance: Min Heap is bigger. Move smallest (${back}) back to Max Heap.`,
                    maxHeap: [...maxHeap],
                    minHeap: [...minHeap],
                    median: null,
                    incoming: null
                });
            }

            // Calc Median
            let median = 0;
            if (maxHeap.length > minHeap.length) median = maxHeap[0];
            else median = (maxHeap[0] + minHeap[0]) / 2;

            snapshots.push({
                msg: `Balanced! Median is ${median}.`,
                maxHeap: [...maxHeap],
                minHeap: [...minHeap],
                median: median,
                incoming: null
            });
        }

        return snapshots;
    };

    const snapshots = getSimulationState();
    const currentSnap = snapshots[step];

    const nextStep = () => {
        if (step < snapshots.length - 1) setStep(s => s + 1);
    };

    const reset = () => {
        setStep(0);
    };

    return (
        <div className={styles.container}>
            <Text className={styles.title}>Two Heaps Median Finder</Text>

            <div className={styles.visualizerArea}>
                {/* Incoming Box */}
                <div style={{ height: '30px', fontWeight: 'bold', color: tokens.colorBrandForeground1 }}>
                    {currentSnap.incoming !== null ? `Adding: ${currentSnap.incoming}` : ""}
                </div>

                <div className={styles.heapsContainer}>
                    <div className={styles.heapSection}>
                        <Text className={styles.heapTitle}>Max Heap (Small Half)</Text>
                        <Text style={{ fontSize: '10px' }}>(Top is Largest)</Text>
                        <div className={styles.nodeStack}>
                            {currentSnap.maxHeap.map((val, idx) => (
                                <div key={`max-${idx}`} className={styles.node}>
                                    {val}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.heapSection}>
                        <Text className={styles.heapTitle}>Min Heap (Large Half)</Text>
                        <Text style={{ fontSize: '10px' }}>(Top is Smallest)</Text>
                        <div className={styles.nodeStack}>
                            {currentSnap.minHeap.map((val, idx) => (
                                <div key={`min-${idx}`} className={styles.node} style={{ backgroundColor: tokens.colorPaletteGreenBackground2, borderColor: tokens.colorPaletteGreenBorder2 }}>
                                    {val}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.medianBox}>
                    Median: {currentSnap.median !== null ? currentSnap.median : "?"}
                </div>
            </div>

            <div className={styles.status}>
                {currentSnap.msg}
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
                    Next
                </Button>
            </div>
        </div>
    );
};
