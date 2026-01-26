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
    setsContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        justifyContent: "center",
        width: "100%",
        padding: "10px",
    },
    setCard: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 12px",
        backgroundColor: tokens.colorNeutralBackground3,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: "16px",
        minWidth: "40px",
        minHeight: "30px",
        transition: "all 0.5s ease",
    },
    newItem: {
        backgroundColor: tokens.colorBrandBackground2,
        borderColor: tokens.colorBrandStroke1,
        boxShadow: tokens.shadow4,
        animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
    sourceItem: {
        borderColor: tokens.colorPaletteGoldBorderActive,
        backgroundColor: tokens.colorPaletteGoldBackground2,
    },
    emptySetSymbol: {
        color: tokens.colorNeutralForeground4,
        fontSize: "16px",
    },
    number: {
        fontWeight: "bold",
        fontSize: "14px",
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
    divider: {
        width: "100%",
        height: "1px",
        backgroundColor: tokens.colorNeutralStroke2,
        margin: "10px 0"
    }
});

interface SubsetsVisualizerProps {
    data?: number[];
}

export const SubsetsVisualizer = ({
    data = [1, 2, 3],
}: SubsetsVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    const getSimulationState = () => {
        const snapshots = [];

        // Initial
        let subsets: number[][] = [[]];
        snapshots.push({
            msg: "Start with an empty set [].",
            subsets: JSON.parse(JSON.stringify(subsets)),
            currentNum: null as number | null,
            newIndices: [] as number[], // Indices of newly added sets
            sourceIndices: [] as number[] // Indices of sets being copied from
        });

        for (const num of data) {
            snapshots.push({
                msg: `Process number: ${num}. Take all existing sets...`,
                subsets: JSON.parse(JSON.stringify(subsets)),
                currentNum: num,
                newIndices: [],
                sourceIndices: []
            });

            const originalLength = subsets.length;
            const newAddedIndices = [];

            // We can break this down: Highlight sources, then spawn new ones
            const sourceIndices = Array.from({ length: originalLength }, (_, i) => i);

            snapshots.push({
                msg: `Copy existing ${originalLength} sets...`,
                subsets: JSON.parse(JSON.stringify(subsets)),
                currentNum: num,
                newIndices: [],
                sourceIndices: sourceIndices // Highlight all existing
            });

            // Perform the "doubling"
            for (let i = 0; i < originalLength; i++) {
                const copy = [...subsets[i], num];
                subsets.push(copy);
                newAddedIndices.push(subsets.length - 1);
            }

            snapshots.push({
                msg: `...and add ${num} to the copies. Result doubled!`,
                subsets: JSON.parse(JSON.stringify(subsets)),
                currentNum: num,
                newIndices: newAddedIndices,
                sourceIndices: sourceIndices
            });
        }

        snapshots.push({
            msg: `Done! Total subsets: ${subsets.length} (2^${data.length}).`,
            subsets: JSON.parse(JSON.stringify(subsets)),
            currentNum: null,
            newIndices: [],
            sourceIndices: []
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
            <Text className={styles.title}>Iterative Subsets (Power Set)</Text>

            <div className={styles.visualizerArea}>
                <div style={{ fontWeight: 'bold', color: tokens.colorBrandForeground1, height: '24px' }}>
                    {currentSnap.currentNum !== null ? `Current Number: ${currentSnap.currentNum}` : "Finished"}
                </div>

                <div className={styles.setsContainer}>
                    {currentSnap.subsets.map((subset: number[], idx: number) => {
                        const isNew = currentSnap.newIndices.includes(idx);
                        const isSource = currentSnap.sourceIndices.includes(idx);

                        let classes = styles.setCard;
                        if (isNew) classes = `${styles.setCard} ${styles.newItem}`;
                        if (isSource) classes = `${classes} ${styles.sourceItem}`;

                        return (
                            <div key={idx} className={classes}>
                                {subset.length === 0 ? (
                                    <span className={styles.emptySetSymbol}>∅</span>
                                ) : (
                                    <span className={styles.number}>
                                        [{subset.join(", ")}]
                                    </span>
                                )}
                            </div>
                        );
                    })}
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
