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
    arrayContainer: {
        display: "flex",
        gap: "12px",
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
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...shorthands.border("2px", "solid", tokens.colorNeutralStroke1),
        borderRadius: "8px",
        backgroundColor: tokens.colorNeutralBackground1,
        fontWeight: "bold",
        fontSize: "16px",
        transition: "all 0.4s ease",
        position: "relative",
    },
    correctCell: {
        backgroundColor: tokens.colorPaletteGreenBackground2,
        borderColor: tokens.colorPaletteGreenBorder2,
        color: tokens.colorPaletteGreenForeground1,
    },
    activeCell: {
        borderColor: tokens.colorBrandStroke1,
        boxShadow: tokens.shadow8,
        transform: "scale(1.1)",
        zIndex: 1,
    },
    targetCell: {
        borderColor: tokens.colorPaletteGoldBorderActive,
        borderStyle: "dashed",
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

interface CyclicSortVisualizerProps {
    data?: number[];
}

export const CyclicSortVisualizer = ({
    data = [3, 1, 5, 4, 2],
}: CyclicSortVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    // Simulation State Logic using Re-render compute pattern (similar to IntervalVisualizer)
    const getSimulationState = () => {
        const snapshots = [];
        // Deep copy
        let nums = [...data];
        let i = 0;

        snapshots.push({
            nums: [...nums],
            msg: "Initial Array. We want sorting 1 to N.",
            highlight: -1, // Current index i
            target: -1,    // The swap target index
        });

        let stepCount = 0;
        while (i < nums.length && stepCount < 50) {
            stepCount++;
            const val = nums[i];
            const correctIdx = val - 1; // Assuming 1-based elements [1..N]

            snapshots.push({
                nums: [...nums],
                msg: `Checking index ${i}. Value is ${val}. Should be at index ${correctIdx}.`,
                highlight: i,
                target: correctIdx,
            });

            if (nums[i] !== nums[correctIdx]) {
                // Prepare Swap
                snapshots.push({
                    nums: [...nums],
                    msg: `Swap! ${val} is not at index ${correctIdx}. Moving it home.`,
                    highlight: i,
                    target: correctIdx,
                    swapping: true // Flag to show animation state if we wanted
                });

                // Execute Swap
                [nums[i], nums[correctIdx]] = [nums[correctIdx], nums[i]];

                snapshots.push({
                    nums: [...nums],
                    msg: `Swapped. Now we check index ${i} again.`,
                    highlight: i, // Stay at i
                    target: -1,
                });
            } else {
                // Correct position
                if (i === nums.length - 1 && stepCount > 1) {
                    // optimization to not show "Correct" for last one if redundant
                } else {
                    snapshots.push({
                        nums: [...nums],
                        msg: `${val} is already at index ${i}. Move next.`,
                        highlight: i,
                        target: -1,
                    });
                }
                i++;
            }
        }

        snapshots.push({
            nums: [...nums],
            msg: "Array is sorted!",
            highlight: -1,
            target: -1,
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
            <Text className={styles.title}>Cyclic Sort (1 to N)</Text>

            <div className={styles.arrayContainer}>
                {currentSnap.nums.map((val, idx) => {
                    const isCorrect = val === idx + 1;
                    const isActive = idx === currentSnap.highlight;
                    const isTarget = idx === currentSnap.target;

                    let classes = styles.cell;
                    if (isCorrect) classes = `${styles.cell} ${styles.correctCell}`;
                    if (isActive) classes = `${classes} ${styles.activeCell}`;
                    if (isTarget) classes = `${classes} ${styles.targetCell}`;

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
