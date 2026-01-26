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
        padding: "40px 20px",
        gap: "40px",
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: "8px",
        overflowX: "auto",
        minHeight: "200px",
    },
    nodesContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px", // space for arrows
        flexWrap: "wrap",
    },
    nodeWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
    },
    nodeCircle: {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.colorBrandBackground2,
        border: `2px solid ${tokens.colorBrandStroke1}`,
        fontWeight: "bold",
        fontSize: "18px",
        zIndex: 2,
        transition: "all 0.3s ease",
    },
    arrow: {
        position: "absolute",
        height: "2px",
        backgroundColor: tokens.colorNeutralForeground2,
        width: "30px", // Approximate distance
        transition: "all 0.5s ease",
        transformOrigin: "center",
        // This is tricky to position absolutely generically, might need SVG
    },
    status: {
        textAlign: "center",
        minHeight: "40px",
        fontStyle: "italic",
        color: tokens.colorNeutralForeground2,
    },
    pointer: {
        marginTop: "8px",
        fontSize: "12px",
        fontWeight: "bold",
        padding: "4px 8px",
        borderRadius: "4px",
        transition: "all 0.3s ease",
    },
    nullNode: {
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px dashed ${tokens.colorNeutralStroke1}`,
        borderRadius: "4px",
        fontSize: "12px",
        color: tokens.colorNeutralForeground3,
    },
    // SVG Connection Lines
    svgContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
    },
    controls: {
        display: "flex",
        gap: "12px",
        justifyContent: "center",
    },
});

interface LinkedListVisualizerProps {
    data?: number[];
}

export const LinkedListVisualizer = ({
    data = [1, 2, 3, 4, 5],
}: LinkedListVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    // Simulation Data
    const getSimulationState = () => {
        const snapshots = [];

        // Initial State
        // Nodes: 1->2->3->4->5->NULL
        // Pointers: Prev(null), Curr(1), Next(null)

        snapshots.push({
            msg: "Initial State. Prev is NULL. Curr is HEAD (1).",
            nodes: data.map(val => ({ val, next: val === 5 ? 'NULL' : val + 1 })), // Simplified ID matching value
            prev: 'NULL',
            curr: data[0],
            next: null
        });

        let prev: any = 'NULL';
        let curr: any = data[0];
        let next: any = null;

        // Clone initial structure to simulate changes on
        // For visualization simplicity, we track the *target* next of each node
        let nodeTargets: Record<number, number | 'NULL'> = {};
        data.forEach((val, idx) => {
            nodeTargets[val] = idx === data.length - 1 ? 'NULL' : data[idx + 1];
        });

        let stepCount = 0;

        while (curr !== 'NULL' && stepCount < 20) {
            stepCount++;

            // 1. Save Next
            next = nodeTargets[curr];
            snapshots.push({
                msg: `1. Save Next. curr(${curr}) points to ${next}, so next = ${next}.`,
                nodes: { ...nodeTargets },
                prev, curr, next
            });

            // 2. Reverse Link
            // let oldTarget = nodeTargets[curr]; // Unused
            nodeTargets[curr] = prev;
            snapshots.push({
                msg: `2. Reverse! Point curr(${curr}) backward to prev(${prev}).`,
                nodes: { ...nodeTargets },
                prev, curr, next
            });

            // 3. Move Prev
            prev = curr;
            snapshots.push({
                msg: `3. Advance Prev. Prev is now ${curr}.`,
                nodes: { ...nodeTargets },
                prev, curr, next
            });

            // 4. Move Curr
            curr = next;
            snapshots.push({
                msg: `4. Advance Curr. Curr is now ${next}.`,
                nodes: { ...nodeTargets },
                prev, curr, next
            });
        }

        snapshots.push({
            msg: "Done! List is reversed. Prev is the new Head.",
            nodes: { ...nodeTargets },
            prev, curr, next
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

    // Helper to render pointer labels
    const renderPointers = (val: number | 'NULL') => {
        const p = [];
        if (currentSnap.prev === val) p.push("Prev");
        if (currentSnap.curr === val) p.push("Curr");
        if (currentSnap.next === val) p.push("Next");

        if (p.length === 0) return null;

        return (
            <div className={styles.pointer} style={{ backgroundColor: tokens.colorPaletteRoyalBlueBackground2, color: "white" }}>
                {p.join(" / ")}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Text className={styles.title}>In-Place Reversal</Text>

            <div className={styles.visualizerArea}>
                <div className={styles.nodesContainer}>
                    {/* Render NULL node (left side for reversed end) */}
                    <div className={styles.nodeWrapper}>
                        <div className={styles.nullNode}>NULL</div>
                        {renderPointers('NULL')}
                    </div>

                    {data.map((val) => {
                        const target = currentSnap.nodes[val] || (step === 0 ? (val === 5 ? 'NULL' : val + 1) : 'NULL');

                        // Determine arrow direction visually? 
                        // This is hard with flexbox. 
                        // Instead, let's just use text arrows or colors for now to indicate "Next"

                        return (
                            <div key={val} className={styles.nodeWrapper}>
                                <div className={styles.nodeCircle}>
                                    {val}
                                </div>
                                {/* Visualize the link */}
                                <div style={{ fontSize: '10px', marginTop: '4px', color: tokens.colorNeutralForeground3 }}>
                                    points to {String(target)}
                                </div>
                                {renderPointers(val)}
                            </div>
                        );
                    })}
                </div>
                <Text style={{ fontSize: '11px', color: tokens.colorNeutralForeground4 }}>(Note: 'points to' shows the <code>next</code> pointer)</Text>
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
