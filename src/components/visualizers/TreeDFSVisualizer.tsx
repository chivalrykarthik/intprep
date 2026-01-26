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
        overflowX: "auto", // Enable scrolling
    },
    treeContainer: {
        position: "relative",
        width: "100%",
        minWidth: "350px", // Prevent tree from collapsing
        display: "flex",
        justifyContent: "center",
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
        ...shorthands.borderColor(tokens.colorBrandStroke1),
        transform: "scale(1.1)",
        boxShadow: tokens.shadow4,
    },
    processedNode: {
        backgroundColor: tokens.colorPaletteGreenBackground2,
        ...shorthands.borderColor(tokens.colorPaletteGreenBorder2),
        color: tokens.colorPaletteGreenForeground1,
    },
    stackContainer: {
        display: "flex",
        flexDirection: "column-reverse", // Bottom up
        gap: "4px",
        padding: "10px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: "8px",
        width: "150px",
        minHeight: "100px",
        border: `2px solid ${tokens.colorNeutralStroke2}`
    },
    stackItem: {
        padding: "8px",
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorBrandStroke1}`,
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        textAlign: "center",
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
    svgContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
    },
    layoutRow: {
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "flex-start"
    }
});

interface TreeNodeData {
    val: number;
    left?: TreeNodeData;
    right?: TreeNodeData;
}

interface TreeDFSVisualizerProps {
    data?: TreeNodeData;
}

interface TreeNode {
    val: number;
    left?: TreeNode;
    right?: TreeNode;
}

interface TreeDFSVisualizerProps {
    data?: TreeNode;
}

export const TreeDFSVisualizer = ({
    data = {
        val: 1,
        left: {
            val: 2,
            left: { val: 4 },
            right: { val: 5 }
        },
        right: {
            val: 3,
            left: { val: 6 },
            right: { val: 7 }
        }
    }
}: TreeDFSVisualizerProps) => {
    const styles = useStyles();
    const [step, setStep] = useState(0);

    // Use void to suppress unused data warning
    void data;

    // Static positions for the specific 1-7 tree
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
        const snapshots: {
            msg: string;
            current: number | null;
            stack: number[];
            processed: number[];
        }[] = [];
        const processed: number[] = [];
        const stack: number[] = []; // Only for visualization text

        // Push initial state
        snapshots.push({
            msg: "Initial State. Start DFS at Root (1).",
            stack: [],
            processed: [],
            current: null as number | null
        });

        // Simulating DFS Recursion
        function dfs(nodeVal: number) {
            // 1. Enter Node (Push to Stack)
            stack.push(nodeVal);
            snapshots.push({
                msg: `Visiting ${nodeVal}. Pushing to Recursion Stack.`,
                stack: [...stack],
                processed: [...processed],
                current: nodeVal
            });

            // 2. Process (simulated)
            processed.push(nodeVal);

            // 3. Recurse Left
            // Hardcoded relationships for simulation simplicity (as in tree-bfs)
            const childrenDiff = {
                1: [2, 3],
                2: [4, 5],
                3: [6, 7],
                4: [], 5: [], 6: [], 7: []
            };
            const children = childrenDiff[nodeVal as keyof typeof childrenDiff] || [];

            if (children[0]) {
                dfs(children[0]);
                // Return to current node after left child returns
                snapshots.push({
                    msg: `Returned to ${nodeVal}. Now checking Right child.`,
                    stack: [...stack],
                    processed: [...processed],
                    current: nodeVal
                });
            }

            if (children[1]) {
                dfs(children[1]);
                // Return to current node after right child returns
                snapshots.push({
                    msg: `Returned to ${nodeVal}. Done with children.`,
                    stack: [...stack],
                    processed: [...processed],
                    current: nodeVal
                });
            }

            // 4. Leave Node (Pop from Stack)
            stack.pop();
            snapshots.push({
                msg: `Backtracking from ${nodeVal}. Popping from Stack.`,
                stack: [...stack],
                processed: [...processed],
                current: stack.length > 0 ? stack[stack.length - 1] : null
            });
        }

        dfs(1);

        snapshots.push({
            msg: "DFS Complete.",
            stack: [],
            processed: [...processed],
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
            <Text className={styles.title}>DFS (Pre-order) Visualization</Text>

            <div className={styles.visualizerArea}>
                <div className={styles.layoutRow}>
                    <div className={styles.treeContainer}>
                        <svg className={styles.svgContainer}>
                            {/* Hardcoded lines */}
                            <line x1="50%" y1="12%" x2="25%" y2="37%" stroke="#ccc" strokeWidth="2" />
                            <line x1="50%" y1="12%" x2="75%" y2="37%" stroke="#ccc" strokeWidth="2" />
                            <line x1="25%" y1="37%" x2="12.5%" y2="62%" stroke="#ccc" strokeWidth="2" />
                            <line x1="25%" y1="37%" x2="37.5%" y2="62%" stroke="#ccc" strokeWidth="2" />
                            <line x1="75%" y1="37%" x2="62.5%" y2="62%" stroke="#ccc" strokeWidth="2" />
                            <line x1="75%" y1="37%" x2="87.5%" y2="62%" stroke="#ccc" strokeWidth="2" />
                        </svg>

                        {[1, 2, 3, 4, 5, 6, 7].map(val => {
                            const pos = positionMap[val];
                            const isCurrent = currentSnap.current === val;
                            const isProcessed = currentSnap.processed.includes(val);

                            let classes = styles.node;
                            if (isCurrent) classes = `${styles.node} ${styles.activeNode}`;
                            else if (isProcessed) classes = `${styles.node} ${styles.processedNode}`;

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

                    <div>
                        <Text style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Call Stack:</Text>
                        <div className={styles.stackContainer}>
                            {currentSnap.stack.length === 0 ? <Text style={{ fontSize: '11px', color: '#999', margin: 'auto' }}>Empty</Text> : (
                                currentSnap.stack.map((val, idx) => (
                                    <div key={`${val}-${idx}`} className={styles.stackItem}>
                                        dfs({val})
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
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
