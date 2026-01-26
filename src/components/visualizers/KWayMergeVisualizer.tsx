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
        width: "100%",
        boxSizing: "border-box",
        maxWidth: "100%",
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
        minHeight: "250px",
        position: "relative",
        overflowX: "auto", // Enable scrolling
    },
    listsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
        minWidth: "300px", // Prevent squashing
        alignItems: "center"
    },
    listRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    listLabel: {
        fontWeight: "bold",
        width: "60px",
        textAlign: "right",
        fontSize: "12px",
        color: tokens.colorNeutralForeground3,
    },
    itemsWrapper: {
        display: "flex",
        gap: "4px",
        padding: "4px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "6px",
    },
    cell: {
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        transition: "all 0.3s ease",
    },
    activeCell: {
        ...shorthands.borderColor(tokens.colorBrandStroke1),
        backgroundColor: tokens.colorBrandBackground2,
        transform: "scale(1.1)",
        zIndex: 2,
    },
    processedCell: {
        opacity: 0.3,
        backgroundColor: tokens.colorNeutralBackground4,
    },
    inHeapCell: {
        ...shorthands.borderColor(tokens.colorPaletteGoldBorderActive),
        backgroundColor: tokens.colorPaletteGoldBackground2,
    },
    heapContainer: {
        display: "flex",
        gap: "8px",
        padding: "10px",
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: "8px",
        minHeight: "50px",
        minWidth: "200px",
        justifyContent: "center",
        alignItems: "center",
        ...shorthands.border("1px", "dashed", tokens.colorBrandStroke1)
    },
    resultContainer: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "center",
        paddingTop: "10px",
        ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke1),
        width: "100%",
    },
    resultCell: {
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.colorPaletteGreenBackground2,
        ...shorthands.borderColor(tokens.colorPaletteGreenBorder2),
        ...shorthands.borderStyle("solid"),
        ...shorthands.borderWidth("1px"),
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        animation: "slideIn 0.3s ease",
    },
    status: {
        textAlign: "center",
        minHeight: "40px",
        fontStyle: "italic",
        color: tokens.colorNeutralForeground2,
        wordBreak: "break-word",
        maxWidth: "100%",
        padding: "0 8px",
        lineHeight: "1.4",
    },
    controls: {
        display: "flex",
        gap: "12px",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    arrowDown: {
        fontSize: "20px",
        color: tokens.colorNeutralForeground3,
    }
});

interface KWayMergeVisualizerProps {
    data?: number[][];
}

export const KWayMergeVisualizer = ({
    data = [
        [2, 6, 8],
        [3, 6, 7],
        [1, 3, 4]
    ]
}: KWayMergeVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    const getSimulationState = () => {
        interface HeapItem { val: number, listIndex: number }

        const snapshots: {
            msg: string;
            pointers: number[];
            heap: HeapItem[];
            result: number[];
            highlightList: number;
            highlightIdx: number;
        }[] = [];

        // Setup internal state for simulation
        // Each list has a pointer
        const pointers = new Array(data.length).fill(0);
        const result: number[] = [];

        // Simulating Min Heap behavior
        // Heap stores {val, listIndex}
        const heap: HeapItem[] = [];

        // Initial add
        for (let i = 0; i < data.length; i++) {
            if (data[i].length > 0) {
                heap.push({ val: data[i][0], listIndex: i });
            }
        }
        heap.sort((a, b) => a.val - b.val); // Sort to simulate Min Heap

        snapshots.push({
            msg: "Initial: Add first element of each list to Heap.",
            pointers: [...pointers],
            heap: [...heap],
            result: [...result],
            highlightList: -1,
            highlightIdx: -1
        });

        // Limit iterations
        let guard = 0;

        while (heap.length > 0 && guard < 50) {
            guard++;

            // Pop smallest
            const minItem = heap.shift()!;
            const { val, listIndex } = minItem;

            snapshots.push({
                msg: `Pop min (${val}) from Heap. Address origin (List ${listIndex + 1}).`,
                pointers: [...pointers],
                heap: [minItem, ...heap], // Show it still "in transit" for a frame? No, better show it removed/active
                result: [...result],
                highlightList: listIndex,
                highlightIdx: pointers[listIndex]
            });

            // Add to result
            result.push(val);
            pointers[listIndex]++; // Move pointer in that list

            // Pushing next from same list
            let pushedNew = false;
            if (pointers[listIndex] < data[listIndex].length) {
                const nextVal = data[listIndex][pointers[listIndex]];
                heap.push({ val: nextVal, listIndex });
                heap.sort((a, b) => a.val - b.val);
                pushedNew = true;
            }

            snapshots.push({
                msg: `Add ${val} to Result.${pushedNew ? ` Push next from List ${listIndex + 1} to Heap.` : ` List ${listIndex + 1} exhausted.`}`,
                pointers: [...pointers],
                heap: [...heap],
                result: [...result],
                highlightList: -1,
                highlightIdx: -1
            });
        }

        snapshots.push({
            msg: "Heap empty. Merge complete.",
            pointers: [...pointers],
            heap: [],
            result: [...result],
            highlightList: -1,
            highlightIdx: -1
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
            <Text className={styles.title}>K-way Merge (Min Heap)</Text>

            <div className={styles.visualizerArea}>
                {/* Lists Grid */}
                <div className={styles.listsContainer}>
                    {data.map((list, listIdx) => (
                        <div key={listIdx} className={styles.listRow}>
                            <div className={styles.listLabel}>List {listIdx + 1}</div>
                            <div className={styles.itemsWrapper}>
                                {list.map((val, idx) => {
                                    // Determine Status
                                    // 1. Processed: idx < pointer
                                    // 2. In Heap: idx === pointer (conceptually, though simplified logic) and not processed?
                                    // Actually we need to track exactly which index corresponds to heap items.

                                    const ptr = currentSnap.pointers[listIdx];
                                    const isProcessed = idx < ptr;

                                    // Check if this specific item is in the current heap snapshot
                                    // (Heap stores {val, listIndex}. But values can be duplicate. 
                                    //  Reliably knowing if this exact index is in heap requires tracking index in item. 
                                    //  Our sim logic didn't track index, but since lists are sorted and we pick sequentially:
                                    //  The item AT pointers[listIdx] is effectively the one "in heap" or "candidate"

                                    const isCandidate = idx === ptr;
                                    const isInHeap = currentSnap.heap.some(h => h.listIndex === listIdx && h.val === val);
                                    // Warning: The above 'some' could match a duplicate value later in the list. 
                                    // Correct logic: The item at pointers[listIdx] IS the one in heap.

                                    const isActuallyInHeap = isCandidate && isInHeap;

                                    const isHighlighted = currentSnap.highlightList === listIdx && currentSnap.highlightIdx === idx;

                                    let classes = styles.cell;
                                    if (isHighlighted) classes = `${styles.cell} ${styles.activeCell}`;
                                    else if (isProcessed) classes = `${styles.cell} ${styles.processedCell}`;
                                    else if (isActuallyInHeap) classes = `${styles.cell} ${styles.inHeapCell}`;

                                    return (
                                        <div key={idx} className={classes}>
                                            {val}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.arrowDown}>↓</div>

                {/* Heap Visualization */}
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: tokens.colorNeutralForeground3 }}>
                    MIN HEAP (Candidates)
                </div>
                <div className={styles.heapContainer}>
                    {currentSnap.heap.length === 0 ? <Text style={{ fontSize: '12px', color: '#999' }}>Empty</Text> :
                        currentSnap.heap.map((item, i) => (
                            <div key={i} className={styles.cell} style={{ borderColor: tokens.colorPaletteGoldBorderActive, backgroundColor: tokens.colorPaletteGoldBackground2 }}>
                                {item.val}
                            </div>
                        ))
                    }
                </div>

                <div className={styles.arrowDown}>↓</div>

                {/* Result */}
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: tokens.colorNeutralForeground3 }}>
                    RESULT LIST
                </div>
                <div className={styles.resultContainer}>
                    {currentSnap.result.map((val, idx) => (
                        <div key={idx} className={styles.resultCell}>
                            {val}
                        </div>
                    ))}
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
