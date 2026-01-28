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
    activeRange: {
        backgroundColor: tokens.colorBrandBackground2,
        ...shorthands.borderColor(tokens.colorBrandStroke1),
    },
    compareCell: {
        transform: "scale(1.1)",
        zIndex: 5,
        backgroundColor: tokens.colorPaletteGoldBackground2,
        ...shorthands.borderColor(tokens.colorPaletteMarigoldBorder2),
    },
    sortedCell: {
        backgroundColor: tokens.colorPaletteGreenBackground2,
        ...shorthands.borderColor(tokens.colorPaletteGreenBorder2),
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

interface MergeSortVisualizerProps {
    data?: number[];
}

interface Snapshot {
    nums: number[];
    msg: string;
    range: number[]; // [low, high]
    comparing: number[]; // indices being compared
    sortedIndices: number[]; // indices that are known to be sorted (for color)
}

export const MergeSortVisualizer = ({
    data = [6, 5, 3, 1, 8, 7, 2, 4],
}: MergeSortVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    const snapshots = useMemo(() => {
        const snaps: Snapshot[] = [];
        const nums = [...data];
        let knownSorted = new Set<number>();

        const pushSnap = (msg: string, range: number[], comparing: number[] = []) => {
            snaps.push({
                nums: [...nums],
                msg,
                range,
                comparing,
                sortedIndices: Array.from(knownSorted)
            });
        };

        const merge = (low: number, mid: number, high: number) => {
            pushSnap(`Merging ranges [${low}..${mid}] and [${mid + 1}..${high}]`, [low, high]);

            const leftPart = nums.slice(low, mid + 1);
            const rightPart = nums.slice(mid + 1, high + 1);

            let i = 0, j = 0, k = low;

            while (i < leftPart.length && j < rightPart.length) {
                // Determine original indices for visualization (approximate since array changes)
                // For simplified visualizer, we just highlight the 'k' we are filling
                // and maybe the values we are conceptually looking at.

                pushSnap(`Comparing ${leftPart[i]} and ${rightPart[j]}`, [low, high], [low + i, mid + 1 + j]); // Note: indices are tricky after swaps, this is approximate for visual effect

                if (leftPart[i] <= rightPart[j]) {
                    nums[k] = leftPart[i];
                    pushSnap(`Taking ${leftPart[i]} (smaller)`, [low, high], [k]);
                    i++;
                } else {
                    nums[k] = rightPart[j];
                    pushSnap(`Taking ${rightPart[j]} (smaller)`, [low, high], [k]);
                    j++;
                }
                k++;
            }

            while (i < leftPart.length) {
                nums[k] = leftPart[i];
                pushSnap(`Taking remaining ${leftPart[i]} from left`, [low, high], [k]);
                i++;
                k++;
            }

            while (j < rightPart.length) {
                nums[k] = rightPart[j];
                pushSnap(`Taking remaining ${rightPart[j]} from right`, [low, high], [k]);
                j++;
                k++;
            }

            // Mark range as sorted
            for (let x = low; x <= high; x++) knownSorted.add(x);
            pushSnap(`Range [${low}..${high}] merged and sorted`, [low, high]);
        };

        const mergeSort = (low: number, high: number) => {
            if (low < high) {
                const mid = Math.floor((low + high) / 2);
                pushSnap(`Split [${low}..${high}] into [${low}..${mid}] and [${mid + 1}..${high}]`, [low, high]);

                mergeSort(low, mid);
                mergeSort(mid + 1, high);
                merge(low, mid, high);
            } else {
                pushSnap(`Single element [${low}] is already sorted`, [low, high]);
            }
        };

        pushSnap("Initial Array", [0, nums.length - 1]);
        mergeSort(0, nums.length - 1);
        pushSnap("Array is fully sorted!", []);

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
            <Text className={styles.title}>Merge Sort Visualizer</Text>

            <div className={styles.arrayContainer}>
                {currentSnap.nums.map((val, idx) => {
                    const isInRange = currentSnap.range.length === 2 && idx >= currentSnap.range[0] && idx <= currentSnap.range[1];
                    const isComparing = currentSnap.comparing.includes(idx);
                    // We only show sorted color if it's NOT in the current active range being reworked, 
                    // OR if we are done (range empty).
                    // Actually, if it's in range, it's being worked on, so active color.
                    const isSorted = currentSnap.sortedIndices.includes(idx) && !isInRange;

                    let classes = styles.cell;
                    if (isComparing) classes = `${styles.cell} ${styles.compareCell}`;
                    else if (isInRange) classes = `${styles.cell} ${styles.activeRange}`;
                    else if (isSorted) classes = `${styles.cell} ${styles.sortedCell}`;
                    else classes = `${styles.cell} ${styles.inactiveCell}`;

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
