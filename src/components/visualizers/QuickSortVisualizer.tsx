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
    pivotCell: {
        backgroundColor: tokens.colorPaletteGoldBackground2,
        ...shorthands.borderColor(tokens.colorPaletteMarigoldBorder2),
        color: tokens.colorPaletteMarigoldForeground1,
        transform: "scale(1.1)",
        zIndex: 5,
    },
    compareCell: {
        ...shorthands.borderColor(tokens.colorBrandStroke1),
        backgroundColor: tokens.colorBrandBackground2,
    },
    sortedCell: {
        backgroundColor: tokens.colorPaletteGreenBackground2,
        ...shorthands.borderColor(tokens.colorPaletteGreenBorder2),
        opacity: 0.8,
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

interface QuickSortVisualizerProps {
    data?: number[];
}

interface Snapshot {
    nums: number[];
    msg: string;
    pivotIdx: number;
    compareIndices: number[]; // [i, j]
    range: number[]; // [low, high]
    sortedIndices: number[];
}

export const QuickSortVisualizer = ({
    data = [8, 3, 1, 7, 0, 10, 2],
}: QuickSortVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    const snapshots = useMemo(() => {
        const snaps: Snapshot[] = [];
        const nums = [...data];
        const sortedIndices: number[] = [];

        // Helper to push snapshot
        const pushSnap = (msg: string, pivotIdx: number, compareIndices: number[], range: number[]) => {
            snaps.push({
                nums: [...nums],
                msg,
                pivotIdx,
                compareIndices,
                range,
                sortedIndices: [...sortedIndices]
            });
        };

        const partition = (low: number, high: number) => {
            const pivot = nums[high];
            pushSnap(`Choosing pivot: ${pivot} (at index ${high})`, high, [], [low, high]);

            let i = low - 1;

            for (let j = low; j < high; j++) {
                pushSnap(`Comparing ${nums[j]} < ${pivot}?`, high, [j], [low, high]);

                if (nums[j] < pivot) {
                    i++;
                    pushSnap(`${nums[j]} is smaller than pivot. Swap index ${i} and ${j}.`, high, [i, j], [low, high]);
                    [nums[i], nums[j]] = [nums[j], nums[i]];
                }
            }

            // Swap pivot to correct position
            pushSnap(`Moving pivot to sorted position ${i + 1}`, high, [i + 1, high], [low, high]);
            [nums[i + 1], nums[high]] = [nums[high], nums[i + 1]];

            return i + 1;
        };

        const quickSort = (low: number, high: number) => {
            if (low < high) {
                const pi = partition(low, high);
                sortedIndices.push(pi);
                pushSnap(`${nums[pi]} is now in its sorted position.`, -1, [], [low, high]);

                quickSort(low, pi - 1);
                quickSort(pi + 1, high);
            } else if (low === high) {
                sortedIndices.push(low);
                pushSnap(`Single element ${nums[low]} is sorted.`, -1, [], [low, high]);
            }
        };

        pushSnap("Initial Array", -1, [], [0, nums.length - 1]);
        quickSort(0, nums.length - 1);

        // Mark all as sorted at end just in case
        for (let k = 0; k < nums.length; k++) {
            if (!sortedIndices.includes(k)) sortedIndices.push(k);
        }

        pushSnap("Array is fully sorted!", -1, [], []);

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
            <Text className={styles.title}>Quick Sort Visualizer</Text>

            <div className={styles.arrayContainer}>
                {currentSnap.nums.map((val, idx) => {
                    const isPivot = idx === currentSnap.pivotIdx;
                    const isComparing = currentSnap.compareIndices.includes(idx);
                    const isSorted = currentSnap.sortedIndices.includes(idx);

                    // In current range?
                    let isInRange = true;
                    if (currentSnap.range.length === 2) {
                        isInRange = idx >= currentSnap.range[0] && idx <= currentSnap.range[1];
                    }

                    let classes = styles.cell;
                    if (isSorted) classes = `${styles.cell} ${styles.sortedCell}`;
                    else if (isPivot) classes = `${styles.cell} ${styles.pivotCell}`;
                    else if (isComparing) classes = `${styles.cell} ${styles.compareCell}`;
                    else if (!isInRange && !isSorted) classes = `${styles.cell} ${styles.inactiveCell}`;

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
