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
        minHeight: "150px",
        position: "relative",
    },
    arrayContainer: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: "10px",
    },
    cellWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
    },
    cell: {
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "14px",
        transition: "all 0.3s ease",
        color: tokens.colorNeutralForeground1,
        backgroundColor: tokens.colorNeutralBackground1,
    },
    activeCell: {
        borderColor: tokens.colorBrandStroke1,
        backgroundColor: tokens.colorBrandBackground2,
        transform: "scale(1.1)",
        zIndex: 1,
        boxShadow: tokens.shadow4,
    },
    discardedCell: {
        opacity: 0.3,
        backgroundColor: tokens.colorNeutralBackground3,
    },
    foundCell: {
        backgroundColor: tokens.colorPaletteGreenBackground2,
        borderColor: tokens.colorPaletteGreenBorder2,
        color: tokens.colorPaletteGreenForeground1,
    },
    pointer: {
        fontSize: "10px",
        fontWeight: "bold",
        height: "14px", // Fixed height to prevent layout shift
    },
    leftPointer: { color: tokens.colorPaletteBlueForeground2 },
    rightPointer: { color: tokens.colorPaletteRedForeground2 },
    midPointer: { color: tokens.colorPaletteGoldForeground2 },

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
    targetBox: {
        padding: "8px 16px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "4px",
        fontWeight: "bold",
        marginBottom: "10px",
        fontSize: "14px",
    }
});

interface BinarySearchVisualizerProps {
    data?: number[];
    target?: number;
}

export const BinarySearchVisualizer = ({
    data = [1, 3, 5, 8, 12, 15, 19, 22, 28, 33],
    target = 15
}: BinarySearchVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    const getSimulationState = () => {
        const snapshots = [];

        let left = 0;
        let right = data.length - 1;

        snapshots.push({
            msg: "Initial searching range: Entire array.",
            left, right, mid: -1, found: false
        });

        // Loop limit for safety
        let safety = 0;

        while (left <= right && safety < 20) {
            safety++;
            const mid = Math.floor(left + (right - left) / 2);

            snapshots.push({
                msg: `Calculate Mid: (${left} + ${right}) / 2 = ${mid}. Value is ${data[mid]}.`,
                left, right, mid, found: false
            });

            if (data[mid] === target) {
                snapshots.push({
                    msg: `Found match! ${data[mid]} equals target ${target}.`,
                    left, right, mid, found: true
                });
                return snapshots; // Finish
            }

            if (data[mid] < target) {
                // Target is right
                snapshots.push({
                    msg: `${data[mid]} < ${target}. Target is in RIGHT half. Discard Left.`,
                    left, right, mid, found: false
                });
                left = mid + 1;
            } else {
                // Target is left
                snapshots.push({
                    msg: `${data[mid]} > ${target}. Target is in LEFT half. Discard Right.`,
                    left, right, mid, found: false
                });
                right = mid - 1;
            }
        }

        snapshots.push({
            msg: "Target not found in array.",
            left: -1, right: -1, mid: -1, found: false
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

    // Helper to determine cell style
    const getCellStyle = (idx: number) => {
        if (currentSnap.found && idx === currentSnap.mid) return `${styles.cell} ${styles.foundCell}`;

        // If searching and outside current range, discard
        // But only if we have valid range pointers (not initial state or end state)
        if (currentSnap.left !== -1 && (idx < currentSnap.left || idx > currentSnap.right)) {
            return `${styles.cell} ${styles.discardedCell}`;
        }

        if (idx === currentSnap.mid) return `${styles.cell} ${styles.activeCell}`;

        return styles.cell;
    }

    return (
        <div className={styles.container}>
            <Text className={styles.title}>Binary Search</Text>

            <div className={styles.visualizerArea}>
                <div className={styles.targetBox}>Target: {target}</div>

                <div className={styles.arrayContainer}>
                    {data.map((val, idx) => (
                        <div key={idx} className={styles.cellWrapper}>
                            {/* Pointers above */}
                            <div className={styles.pointer}>
                                {idx === currentSnap.left && <span className={styles.leftPointer}>L</span>}
                                {idx === currentSnap.mid && <span className={styles.midPointer}> M</span>}
                                {idx === currentSnap.right && <span className={styles.rightPointer}> R</span>}
                            </div>

                            <div className={getCellStyle(idx)}>
                                {val}
                            </div>

                            <Text style={{ fontSize: '10px', color: tokens.colorNeutralForeground4 }}>{idx}</Text>
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
