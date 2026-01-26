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
        minHeight: "300px",
        position: "relative",
    },
    treeContainer: {
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        // Helper to center the absolute madness of tree layout
        height: "200px",
    },
    node: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.colorNeutralBackground1,
        border: `2px solid ${tokens.colorNeutralStroke1}`,
        fontWeight: "bold",
        position: "absolute",
        transition: "all 0.5s ease",
        zIndex: 2,
    },
    activeNode: {
        backgroundColor: tokens.colorBrandBackground2,
        borderColor: tokens.colorBrandStroke1,
        transform: "scale(1.1)",
        boxShadow: tokens.shadow4,
    },
    processedNode: {
        backgroundColor: tokens.colorPaletteGreenBackground2,
        borderColor: tokens.colorPaletteGreenBorder2,
        color: tokens.colorPaletteGreenForeground1,
    },
    visitedNode: {
        // In queue but not processed
        borderColor: tokens.colorPaletteGoldBorderActive,
        borderStyle: "dashed",
    },
    queueContainer: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        marginTop: "20px",
        padding: "10px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "8px",
        minWidth: "200px",
        minHeight: "50px",
    },
    queueLabel: {
        fontWeight: "bold",
        marginRight: "8px",
        fontSize: "12px",
    },
    queueItem: {
        padding: "4px 8px",
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: "4px",
        fontSize: "12px",
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
    // SVG lines
    svgContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
    }
});

// interface TreeNodeData {
//     val: number;
//     left?: TreeNodeData;
//     right?: TreeNodeData;
//     x?: number; // Calculated positions
//     y?: number;
// }

// interface TreeBFSVisualizerProps {
//     data?: TreeNodeData;
// }

export const TreeBFSVisualizer = ({ }: any) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    // 1. Flatten tree and calculate positions for rendering
    // Simple static layout for 3 levels
    // Root: (50%, 0)
    // L2: (25%, 50), (75%, 50)
    // L3: (12.5%, 100), (37.5%, 100), (62.5%, 100), (87.5%, 100)

    // We map values to positions directly since `data` structure is static for this visualizer essentially
    const positionMap: Record<number, { left: string, top: string }> = {
        1: { left: "50%", top: "10%" },
        2: { left: "25%", top: "35%" },
        3: { left: "75%", top: "35%" },
        4: { left: "12.5%", top: "60%" },
        5: { left: "37.5%", top: "60%" },
        6: { left: "62.5%", top: "60%" },
        7: { left: "87.5%", top: "60%" },
    };

    const getSimulationState = () => {
        const snapshots = [];

        // Initial
        const queue = [1];
        const processed: number[] = [];

        snapshots.push({
            msg: "Initial State. Root (1) is in Queue.",
            queue: [...queue],
            processed: [...processed],
            current: null as number | null
        });

        // Simulating BFS
        // Using a real queue simulation
        // Note: For simplicity in this logic, we use numbers. 
        // In real BFS we traverse nodes. We know the structure.

        // Let's rebuild the graph adj list or just hardcode for this specific tree structure 
        // to simplify the "find children" logic without parsing the recursive object every frame
        const adj: Record<number, number[]> = {
            1: [2, 3],
            2: [4, 5],
            3: [6, 7],
            4: [], 5: [], 6: [], 7: []
        };

        // Deep copy needed for queue simulation across steps? 
        // We will just replay steps
        const simQueue = [1];
        const simProcessed: number[] = [];

        let safeGuard = 0;

        while (simQueue.length > 0 && safeGuard < 20) {
            safeGuard++;

            // Snapshot before dequeue (showing it's about to be popped)
            const currentVal = simQueue[0];

            snapshots.push({
                msg: `Peek Queue. ${currentVal} is next.`,
                queue: [...simQueue],
                processed: [...simProcessed],
                current: currentVal
            });

            // Dequeue
            simQueue.shift();
            simProcessed.push(currentVal);

            snapshots.push({
                msg: `Dequeue ${currentVal}. Process it.`,
                queue: [...simQueue],
                processed: [...simProcessed],
                current: currentVal
            });

            // Enqueue Children
            const children = adj[currentVal] || [];
            if (children.length > 0) {
                children.forEach(child => {
                    simQueue.push(child);
                });

                snapshots.push({
                    msg: `Enqueue children of ${currentVal}: ${children.join(", ")}.`,
                    queue: [...simQueue],
                    processed: [...simProcessed],
                    current: currentVal
                });
            }
        }

        snapshots.push({
            msg: "Queue is empty. Traversal complete.",
            queue: [],
            processed: [...simProcessed],
            current: null
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
            <Text className={styles.title}>Tree Level Order Traversal</Text>

            <div className={styles.visualizerArea}>
                <div className={styles.treeContainer}>
                    {/* Draw lines first so they are behind */}
                    <svg className={styles.svgContainer}>
                        {/* Hardcoded lines for this specific tree topology */}
                        {/* 1 -> 2 */}
                        <line x1="50%" y1="12%" x2="25%" y2="37%" stroke="#ccc" strokeWidth="2" />
                        {/* 1 -> 3 */}
                        <line x1="50%" y1="12%" x2="75%" y2="37%" stroke="#ccc" strokeWidth="2" />
                        {/* 2 -> 4 */}
                        <line x1="25%" y1="37%" x2="12.5%" y2="62%" stroke="#ccc" strokeWidth="2" />
                        {/* 2 -> 5 */}
                        <line x1="25%" y1="37%" x2="37.5%" y2="62%" stroke="#ccc" strokeWidth="2" />
                        {/* 3 -> 6 */}
                        <line x1="75%" y1="37%" x2="62.5%" y2="62%" stroke="#ccc" strokeWidth="2" />
                        {/* 3 -> 7 */}
                        <line x1="75%" y1="37%" x2="87.5%" y2="62%" stroke="#ccc" strokeWidth="2" />
                    </svg>

                    {/* Render Nodes */}
                    {[1, 2, 3, 4, 5, 6, 7].map(val => {
                        const pos = positionMap[val];
                        const isCurrent = currentSnap.current === val;
                        const isProcessed = currentSnap.processed.includes(val);
                        const isInQueue = currentSnap.queue.includes(val);

                        let classes = styles.node;
                        if (isCurrent) classes = `${styles.node} ${styles.activeNode}`;
                        else if (isProcessed) classes = `${styles.node} ${styles.processedNode}`;
                        else if (isInQueue) classes = `${styles.node} ${styles.visitedNode}`;

                        return (
                            <div
                                key={val}
                                className={classes}
                                style={{ left: pos.left, top: pos.top }}
                            >
                                {val}
                            </div>
                        )
                    })}
                </div>

                <div className={styles.queueContainer}>
                    <Text className={styles.queueLabel}>Queue [Front ... Back]:</Text>
                    {currentSnap.queue.length === 0 ? <Text style={{ fontSize: '12px', color: '#999' }}>Empty</Text> : (
                        currentSnap.queue.map((val, idx) => (
                            <div key={`${val}-${idx}`} className={styles.queueItem}>
                                {val}
                            </div>
                        ))
                    )}
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
