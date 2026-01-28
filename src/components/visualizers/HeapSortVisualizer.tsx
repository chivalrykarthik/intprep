import { useState, useMemo } from "react";
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
    arrayContainer: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: "20px 0",
    },
    cellWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
    },
    indexLabel: {
        fontSize: "10px",
        color: tokens.colorNeutralForeground3,
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
        fontSize: "14px",
        transition: "all 0.3s ease",
        position: "relative",
    },
    heapRootCell: {
        backgroundColor: tokens.colorPaletteBerryBackground2,
        ...shorthands.borderColor(tokens.colorPaletteBerryBorder2),
        color: tokens.colorPaletteBerryForeground1,
        transform: "scale(1.1)",
        zIndex: 5,
    },
    compareCell: {
        backgroundColor: tokens.colorPaletteGoldBackground2,
        ...shorthands.borderColor(tokens.colorPaletteGoldBorder2),
    },
    sortedCell: {
        backgroundColor: tokens.colorPaletteGreenBackground2,
        ...shorthands.borderColor(tokens.colorPaletteGreenBorder2),
        opacity: 0.8,
    },
    activeHeapCell: {
        ...shorthands.borderColor(tokens.colorBrandStroke1),
        backgroundColor: tokens.colorBrandBackground2,
    },
    inactiveCell: {
        opacity: 0.3,
    },
    controls: {
        display: "flex",
        gap: "12px",
        justifyContent: "center",
    },
    status: {
        textAlign: "center",
        minHeight: "40px",
        fontStyle: "italic",
        color: tokens.colorNeutralForeground2,
    },
});

interface HeapSortVisualizerProps {
    data?: number[];
}

interface Snapshot {
    nums: number[];
    msg: string;
    heapSize: number;
    comparing: number[]; // indices being compared
    sortedIndices: number[]; // indices explicitly sorted (at the end)
    rootIdx: number; // current root being sifted
}

export const HeapSortVisualizer = ({
    data = [4, 10, 3, 5, 1],
}: HeapSortVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    const snapshots = useMemo(() => {
        const snaps: Snapshot[] = [];
        // Work on a copy
        const nums = [...data];
        const sortedIndices: number[] = [];

        const pushSnap = (msg: string, heapSize: number, comparing: number[] = [], rootIdx: number = -1) => {
            snaps.push({
                nums: [...nums],
                msg,
                heapSize,
                comparing,
                sortedIndices: [...sortedIndices],
                rootIdx
            });
        };

        const heapify = (n: number, i: number) => {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            pushSnap(`Heapify at index ${i}. Checking children L:${left} and R:${right}`, n, [i], i);

            if (left < n) {
                pushSnap(`Comparing parent ${nums[largest]} with Left Child ${nums[left]}`, n, [largest, left], i);
                if (nums[left] > nums[largest]) {
                    largest = left;
                }
            }

            if (right < n) {
                pushSnap(`Comparing current largest (${nums[largest]}) with Right Child ${nums[right]}`, n, [largest, right], i);
                if (nums[right] > nums[largest]) {
                    largest = right;
                }
            }

            if (largest !== i) {
                pushSnap(`Swapping ${nums[i]} with ${nums[largest]}`, n, [i, largest], i);
                [nums[i], nums[largest]] = [nums[largest], nums[i]];

                // Recursively heapify the affected sub-tree
                heapify(n, largest);
            }
        };

        // 1. Build Heap (rearrange array)
        const N = nums.length;
        pushSnap("Building Max Heap...", N);
        for (let i = Math.floor(N / 2) - 1; i >= 0; i--) {
            heapify(N, i);
        }
        pushSnap("Max Heap Built!", N);

        // 2. Extract elements one by one
        for (let i = N - 1; i > 0; i--) {
            pushSnap(`Move current root ${nums[0]} to end (index ${i})`, i + 1, [0, i]);
            [nums[0], nums[i]] = [nums[i], nums[0]];

            sortedIndices.push(i); // i is now sorted
            pushSnap(`${nums[i]} is now sorted. Reduce heap size.`, i);

            // call max heapify on the reduced heap
            heapify(i, 0);
        }

        sortedIndices.push(0); // The last remaining element is sorted
        pushSnap("Array is fully sorted!", 0);

        return snaps;
    }, [data]);

    const currentSnap = snapshots[step];

    const nextStep = () => {
        if (step < snapshots.length - 1) setStep(s => s + 1);
    };

    const reset = () => {
        setStep(0);
    };

    return (
        <div className={styles.container}>
            <Text className={styles.title}>Heap Sort Visualizer</Text>

            <div className={styles.arrayContainer}>
                {currentSnap.nums.map((val, idx) => {
                    const isSorted = currentSnap.sortedIndices.includes(idx);
                    const isComparing = currentSnap.comparing.includes(idx);
                    const isRoot = idx === currentSnap.rootIdx;
                    const inHeap = idx < currentSnap.heapSize;

                    let classes = styles.cell;

                    if (isSorted) {
                        classes = `${styles.cell} ${styles.sortedCell}`;
                    } else if (isComparing) {
                        classes = `${styles.cell} ${styles.compareCell}`;
                    } else if (isRoot) {
                        classes = `${styles.cell} ${styles.heapRootCell}`;
                    } else if (inHeap) {
                        classes = `${styles.cell} ${styles.activeHeapCell}`;
                    } else {
                        // Shouldn't happen often in this logic unless logic has gap, or fully sorted
                        classes = styles.cell;
                    }

                    if (step === snapshots.length - 1) classes = `${styles.cell} ${styles.sortedCell}`;

                    return (
                        <div key={idx} className={styles.cellWrapper}>
                            <div className={classes}>
                                {val}
                            </div>
                            <Text className={styles.indexLabel}>{idx}</Text>
                        </div>
                    );
                })}
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
