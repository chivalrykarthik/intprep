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
        minHeight: "200px",
        position: "relative",
    },
    heapContainer: {
        display: "flex",
        flexDirection: "column-reverse", // Show as stack? Or horizontal? 
        // Let's do horizontal queue for MinHeap visualization as a "VIP Area"
        gap: "8px",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60px",
        padding: "10px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "8px",
        width: "100%",
        maxWidth: "400px",
        border: `2px dashed ${tokens.colorNeutralStroke2}`,
        transition: "all 0.3s ease",
    },
    fullHeap: {
        ...shorthands.borderColor(tokens.colorBrandStroke1),
        backgroundColor: tokens.colorBrandBackground2, // Slight tint when full
    },
    heapItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        backgroundColor: tokens.colorPaletteBlueBackground2,
        color: "white",
        borderRadius: "8px",
        fontWeight: "bold",
        fontSize: "14px",
        boxShadow: tokens.shadow4,
        position: "relative",
    },
    minItem: {
        // Highlight the minimum (root) differently as it's the one to be evicted
        backgroundColor: tokens.colorPaletteRedBackground2,
        border: `2px solid ${tokens.colorPaletteRedBorderActive}`,
    },
    incomingItem: {
        width: "40px",
        height: "40px",
        backgroundColor: tokens.colorNeutralBackground1,
        border: `2px solid ${tokens.colorBrandStroke1}`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        marginBottom: "10px",
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
    label: {
        fontSize: "12px",
        fontWeight: "bold",
        color: tokens.colorNeutralForeground3,
        marginBottom: "4px",
    }
});

interface TopKVisualizerProps {
    data?: number[];
    k?: number;
}

export const TopKVisualizer = ({
    data = [10, 5, 20, 8, 25, 30, 2, 100],
    k = 3
}: TopKVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    const getSimulationState = () => {
        const snapshots = [];

        // Simulating Min Heap for Top K Largest
        // We keep size K. Smallest is at index 0 (if sorted) for visualization simplicity.
        // In real heap, root is min.
        let heap: number[] = [];

        snapshots.push({
            msg: `Start. Want Top ${k} Largest.`,
            heap: [],
            incoming: null as number | null
        });

        for (const num of data) {
            snapshots.push({
                msg: `New number arrived: ${num}.`,
                heap: [...heap],
                incoming: num
            });

            if (heap.length < k) {
                heap.push(num);
                heap.sort((a, b) => a - b); // Keep sorted to visualize Min at start
                snapshots.push({
                    msg: `Heap not full. Added ${num}.`,
                    heap: [...heap],
                    incoming: null
                });
            } else {
                // Heap is full. Compare with Min (heap[0])
                const min = heap[0];
                if (num > min) {
                    snapshots.push({
                        msg: `${num} > Min(${min}). Evict ${min}.`,
                        heap: [...heap],
                        incoming: num // visualization of swap pending
                    });

                    heap.shift(); // Remove min
                    heap.push(num);
                    heap.sort((a, b) => a - b);

                    snapshots.push({
                        msg: `Added ${num}. New Top ${k} locked in.`,
                        heap: [...heap],
                        incoming: null
                    });
                } else {
                    snapshots.push({
                        msg: `${num} < Min(${min}). Reject ${num}.`,
                        heap: [...heap],
                        incoming: null
                    });
                }
            }
        }

        snapshots.push({
            msg: `Finished! The Top ${k} are: [${heap.join(", ")}].`,
            heap: [...heap],
            incoming: null
        });

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
            <Text className={styles.title}>Top K Elements (Min Heap)</Text>

            <div className={styles.visualizerArea}>
                {currentSnap.incoming !== null && (
                    <div className={styles.incomingItem}>
                        {currentSnap.incoming}
                    </div>
                )}

                <Text className={styles.label}>Top {k} VIP List (Sorted for view, Left is Smallest/Root)</Text>

                <div className={`${styles.heapContainer} ${currentSnap.heap.length === k ? styles.fullHeap : ''}`}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {currentSnap.heap.map((val, idx) => {
                            // index 0 is the logical "Root" of our sorted array representation of MinHeap
                            const isMin = idx === 0;
                            let classes = styles.heapItem;
                            if (isMin && currentSnap.heap.length === k) classes += ` ${styles.minItem}`;

                            return (
                                <div key={`${val}-${idx}`} className={classes}>
                                    {val}
                                    {isMin && <div style={{ position: 'absolute', bottom: '-15px', fontSize: '8px', color: 'black' }}>MIN</div>}
                                </div>
                            );
                        })}
                        {currentSnap.heap.length === 0 && <Text style={{ fontSize: '12px', color: '#999' }}>Empty</Text>}
                    </div>
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
