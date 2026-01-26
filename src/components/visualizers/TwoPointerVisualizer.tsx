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
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: "40px 0 20px 0", // Extra top padding for pointers
    },
    cellWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
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
        transition: "all 0.3s ease",
        zIndex: 1,
    },
    pointer: {
        position: "absolute",
        top: "-30px",
        fontWeight: "bold",
        fontSize: "20px",
        transition: "all 0.3s ease",
        width: "100%",
        textAlign: "center",
        display: "flex", // Keep it localized to the wrapper
        justifyContent: "center",
    },
    slowPointer: {
        color: tokens.colorPaletteGreenForeground1,
    },
    fastPointer: {
        color: tokens.colorPaletteRedForeground1,
        top: "-50px", // Stack fast pointer higher if on same cell
    },
    controls: {
        display: "flex",
        gap: "12px",
        justifyContent: "center",
    },
    status: {
        textAlign: "center",
        minHeight: "24px",
        fontStyle: "italic",
        color: tokens.colorNeutralForeground2,
    },
    legend: {
        display: "flex",
        justifyContent: "center",
        gap: "16px",
        marginTop: "8px",
        fontSize: "12px",
        color: tokens.colorNeutralForeground2,
    }
});

interface TwoPointerVisualizerProps {
    data?: number[];
    speeds?: [number, number]; // [slowSpeed, fastSpeed]
}

export const TwoPointerVisualizer = ({
    data = [1, 2, 3, 4, 5, 6, 7],
    speeds = [1, 2],
}: TwoPointerVisualizerProps) => {
    const styles = useStyles();
    const [slow, setSlow] = useState(0);
    const [fast, setFast] = useState(0);
    const [stepCount, setStepCount] = useState(0);

    const [slowSpeed, fastSpeed] = speeds;

    // Simulate cyclic behavior if fast reaches end
    const movePointers = () => {
        setSlow((prev) => (prev + slowSpeed) % data.length);
        setFast((prev) => (prev + fastSpeed) % data.length);
        setStepCount((prev) => prev + 1);
    };

    const reset = () => {
        setSlow(0);
        setFast(0);
        setStepCount(0);
    };

    const isMeeting = slow === fast && stepCount > 0;

    return (
        <div className={styles.container}>
            <Text className={styles.title}>Fast & Slow Pointers (Tortoise & Hare)</Text>

            <div className={styles.arrayContainer}>
                {data.map((val, idx) => {
                    const isSlowHere = idx === slow;
                    const isFastHere = idx === fast;

                    return (
                        <div key={idx} className={styles.cellWrapper}>
                            {isSlowHere && (
                                <div className={`${styles.pointer} ${styles.slowPointer}`}>🐢</div>
                            )}
                            {isFastHere && (
                                <div className={`${styles.pointer} ${styles.fastPointer}`}>🐇</div>
                            )}
                            <div
                                className={styles.cell}
                                style={{
                                    borderColor: isMeeting && isSlowHere ? tokens.colorPaletteGoldBorderActive : undefined,
                                    backgroundColor: isMeeting && isSlowHere ? tokens.colorPaletteGoldBackground2 : undefined
                                }}
                            >
                                {val}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.legend}>
                <span>🐢 Moves {slowSpeed} step</span>
                <span>🐇 Moves {fastSpeed} steps</span>
            </div>

            <div className={styles.status}>
                {stepCount === 0 && "Start the race!"}
                {!isMeeting && stepCount > 0 && "Running..."}
                {isMeeting && "Cycle Detected! They met!"}
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
                    onClick={movePointers}
                    appearance="primary"
                    disabled={isMeeting}
                >
                    Step
                </Button>
            </div>
        </div>
    );
};
