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
        minHeight: "350px",
        position: "relative",
    },
    graphContainer: {
        position: "relative",
        width: "100%",
        height: "250px",
        ...shorthands.border("1px", "dashed", tokens.colorNeutralStroke2),
        borderRadius: "8px",
        overflow: "hidden"
    },
    node: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.colorNeutralBackground1,
        ...shorthands.border("2px", "solid", tokens.colorNeutralStroke1),
        fontWeight: "bold",
        position: "absolute",
        transition: "all 0.5s ease",
        zIndex: 2,
    },
    zeroInDegreeNode: {
        ...shorthands.borderColor(tokens.colorPaletteGreenBorderActive),
        backgroundColor: tokens.colorPaletteGreenBackground1,
        boxShadow: `0 0 10px ${tokens.colorPaletteGreenBorderActive}`,
    },
    processedNode: {
        backgroundColor: tokens.colorNeutralBackground4,
        color: tokens.colorNeutralForeground4,
        ...shorthands.borderColor(tokens.colorNeutralStroke1),
        transform: "scale(0.9)",
    },
    inQueueNode: {
        ...shorthands.borderColor(tokens.colorPaletteGoldBorderActive),
    },
    degreeBadge: {
        position: "absolute",
        top: "-10px",
        right: "-10px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: tokens.colorBrandBackground2,
        color: "white",
        fontSize: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...shorthands.border("1px", "solid", tokens.colorBrandStroke1)
    },
    svgContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
    },
    queueContainer: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        marginTop: "10px",
        padding: "8px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "6px",
        minWidth: "150px",
        minHeight: "40px",
    },
    resultContainer: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: "10px",
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
});

interface TopologicalSortVisualizerProps {
    data?: {
        numCourses: number;
        prerequisites: number[][];
    };
}

export const TopologicalSortVisualizer = ({
    data = {
        numCourses: 4,
        prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]]
    }
}: TopologicalSortVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    // Node Positions (Static for simplicity, arranging in layers)
    const nodePositions: Record<number, { left: string, top: string }> = {
        0: { left: "10%", top: "50%" },
        1: { left: "40%", top: "30%" },
        2: { left: "40%", top: "70%" },
        3: { left: "80%", top: "50%" },
    };

    const getSimulationState = () => {
        const snapshots = [];

        // 1. Build Graph & In-Degree
        const inDegree = new Array(data.numCourses).fill(0);
        const adj: Record<number, number[]> = {};

        data.prerequisites.forEach(([course, pre]) => {
            if (!adj[pre]) adj[pre] = [];
            adj[pre].push(course);
            inDegree[course]++;
        });

        let queue: number[] = [];

        // Initial Snapshot
        snapshots.push({
            msg: "Calculate In-Degrees (Dependencies).",
            inDegree: [...inDegree],
            queue: [],
            result: [],
            current: null as number | null
        });

        // 2. Find sources
        for (let i = 0; i < data.numCourses; i++) {
            if (inDegree[i] === 0) queue.push(i);
        }

        snapshots.push({
            msg: `Nodes with 0 In-Degree (${queue.join(", ")}) added to Queue.`,
            inDegree: [...inDegree],
            queue: [...queue],
            result: [],
            current: null
        });

        // 3. Process
        let safety = 0;
        let simQueue = [...queue];
        let simInDegree = [...inDegree];
        let simResult: number[] = [];

        while (simQueue.length > 0 && safety < 20) {
            safety++;
            const node = simQueue.shift()!;

            snapshots.push({
                msg: `Pop ${node}. Add to Result. Decrement neighbors' in-degree.`,
                inDegree: [...simInDegree],
                queue: [...simQueue],
                result: [...simResult],
                current: node
            });

            simResult.push(node);

            // Neighbors
            const neighbors = adj[node] || [];
            let newUnlocks: number[] = [];

            for (const neighbor of neighbors) {
                simInDegree[neighbor]--;
                if (simInDegree[neighbor] === 0) {
                    simQueue.push(neighbor);
                    newUnlocks.push(neighbor);
                }
            }

            snapshots.push({
                msg: `Processed ${node}. ${newUnlocks.length > 0 ? `Unlocked: ${newUnlocks.join(", ")}!` : "No new unlocks."}`,
                inDegree: [...simInDegree],
                queue: [...simQueue],
                result: [...simResult],
                current: node
            });
        }

        snapshots.push({
            msg: "Queue empty. Sort complete.",
            inDegree: [...simInDegree],
            queue: [],
            result: [...simResult],
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

    const renderEdge = (from: number, to: number, key: string) => {
        const start = nodePositions[from];
        const end = nodePositions[to];
        return (
            <line
                key={key}
                x1={start.left} y1={start.top}
                x2={end.left} y2={end.top}
                stroke={tokens.colorNeutralStroke1}
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
            />
        )
    };

    return (
        <div className={styles.container}>
            <Text className={styles.title}>Topological Sort (Kahn's Algo)</Text>

            <div className={styles.visualizerArea}>
                <div className={styles.graphContainer}>
                    <svg className={styles.svgContainer}>
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                refX="28" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill={tokens.colorNeutralStroke1} />
                            </marker>
                        </defs>
                        {data.prerequisites.map(([to, from], idx) => renderEdge(from, to, `edge-${idx}`))}
                    </svg>

                    {[0, 1, 2, 3].map(node => {
                        const deg = currentSnap.inDegree[node];
                        const isCurrent = currentSnap.current === node;
                        const isProcessed = currentSnap.result.includes(node);
                        const isInQueue = currentSnap.queue.includes(node);

                        let classes = styles.node;
                        if (isCurrent) classes = `${styles.node} ${styles.zeroInDegreeNode}`;
                        else if (isProcessed) classes = `${styles.node} ${styles.processedNode}`;
                        else if (deg === 0 && !isProcessed) classes = `${styles.node} ${styles.zeroInDegreeNode}`;
                        else if (isInQueue) classes = `${styles.node} ${styles.inQueueNode}`;

                        return (
                            <div key={node} className={classes} style={{ left: nodePositions[node].left, top: nodePositions[node].top }}>
                                {node}
                                <div className={styles.degreeBadge}>{deg}</div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.queueContainer}>
                    <Text style={{ fontSize: '12px', fontWeight: 'bold', marginRight: '8px' }}>Queue:</Text>
                    {currentSnap.queue.map((q, i) => (
                        <div key={i} className={styles.node} style={{ position: 'static', width: '30px', height: '30px', fontSize: '12px' }}>
                            {q}
                        </div>
                    ))}
                    {currentSnap.queue.length === 0 && <Text style={{ fontSize: '11px', color: '#999' }}>Empty</Text>}
                </div>

                <div className={styles.resultContainer}>
                    <Text style={{ fontSize: '12px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>Result Order:</Text>
                    {currentSnap.result.map((r, i) => (
                        <div key={`res-${i}`} style={{ display: 'flex', alignItems: 'center' }}>
                            <div className={styles.node} style={{ position: 'static', width: '30px', height: '30px', fontSize: '12px', backgroundColor: tokens.colorPaletteGreenBackground2, borderColor: tokens.colorPaletteGreenBorder2 }}>
                                {r}
                            </div>
                            {i < currentSnap.result.length - 1 && <ArrowRightRegular style={{ margin: '0 4px', color: tokens.colorNeutralForeground3 }} />}
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
