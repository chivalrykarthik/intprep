import { useState, useEffect } from "react";
import {
    makeStyles,
    shorthands,
    tokens,
    Button,
} from "@fluentui/react-components";
import { PlayRegular, ArrowCounterclockwiseRegular, EditRegular, CodeRegular } from "@fluentui/react-icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import * as Babel from "@babel/standalone";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        margin: "24px 0",
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: "8px",
        ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
        overflow: "hidden",
        boxShadow: tokens.shadow4,
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    title: {
        fontWeight: "600",
        fontFamily: tokens.fontFamilyMonospace,
        fontSize: "12px",
        color: tokens.colorNeutralForeground2,
    },
    editorContainer: {
        position: "relative",
        minHeight: "100px",
    },
    textarea: {
        width: "100%",
        minHeight: "200px",
        padding: "16px",
        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        fontSize: "14px",
        lineHeight: "1.5",
        border: "none",
        resize: "vertical",
        backgroundColor: tokens.colorNeutralBackground1,
        color: tokens.colorNeutralForeground1,
        outline: "none",
        boxSizing: "border-box",
    },
    outputContainer: {
        padding: "16px",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
        fontFamily: tokens.fontFamilyMonospace,
        fontSize: "13px",
        maxHeight: "200px",
        overflowY: "auto",
        whiteSpace: "pre-wrap",
    },
    outputLabel: {
        fontSize: "11px",
        textTransform: "uppercase",
        color: "#888",
        marginBottom: "4px",
        display: "block",
    },
    controls: {
        display: "flex",
        gap: "8px",
    },
    error: {
        color: "#f48771",
    }
});

interface CodePlaygroundProps {
    initialCode: string;
    language: string;
}

export const CodePlayground = ({ initialCode, language }: CodePlaygroundProps) => {
    const styles = useStyles();
    const [code, setCode] = useState(initialCode.replace(/\n$/, ""));
    const [output, setOutput] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setCode(initialCode.replace(/\n$/, ""));
        setOutput([]);
        setHasError(false);
    }, [initialCode]);

    const handleRun = () => {
        setHasError(false);
        const logs: string[] = [];

        const mockConsole = {
            log: (...args: any[]) => {
                logs.push(args.map(a =>
                    typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                ).join(" "));
            },
            error: (...args: any[]) => {
                logs.push("ERROR: " + args.join(" "));
                setHasError(true);
            },
            warn: (...args: any[]) => {
                logs.push("WARN: " + args.join(" "));
            }
        };

        try {
            // Transpile TS -> JS using Babel
            const transpiled = Babel.transform(code, {
                presets: ["typescript"],
                filename: "repl.ts",
            }).code;

            // Transpiled code typically runs in strict mode and might need to treat top-level vars carefully.
            // Since we're using "new Function", we need to wrap the code to allow top-level variable usage without collisions
            // and correct return.
            // But usually for valid "script" execution in function body, direct code is fine.

            // Note: Babel might add "use strict";

            const runUserCode = new Function("console", transpiled || "");

            runUserCode(mockConsole);

            if (logs.length === 0) {
                logs.push("Code executed successfully (no output). \nTip: Use console.log() to see results.");
            }
            setOutput(logs);

        } catch (e: any) {
            setHasError(true);
            setOutput([`System Error: ${e.message}`]);
        }
    };

    const handleReset = () => {
        setCode(initialCode.replace(/\n$/, ""));
        setOutput([]);
        setHasError(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>{language.toUpperCase()} PLAYGROUND</span>
                <div className={styles.controls}>
                    <Button
                        size="small"
                        icon={isEditing ? <CodeRegular /> : <EditRegular />}
                        appearance="subtle"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "View" : "Edit"}
                    </Button>
                    <Button
                        size="small"
                        icon={<ArrowCounterclockwiseRegular />}
                        appearance="subtle"
                        onClick={handleReset}
                        title="Reset Code"
                    />
                    <Button
                        size="small"
                        icon={<PlayRegular />}
                        appearance="primary"
                        onClick={handleRun}
                    >
                        Run
                    </Button>
                </div>
            </div>

            <div className={styles.editorContainer}>
                {isEditing ? (
                    <textarea
                        className={styles.textarea}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                    />
                ) : (
                    <SyntaxHighlighter
                        language={language}
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            padding: "16px",
                            borderRadius: 0,
                            fontSize: "14px",
                            lineHeight: "1.5",
                        }}
                    >
                        {code}
                    </SyntaxHighlighter>
                )}
            </div>

            {output.length > 0 && (
                <div className={styles.outputContainer}>
                    <span className={styles.outputLabel}>Console Output</span>
                    <div className={hasError ? styles.error : ""}>
                        {output.join("\n")}
                    </div>
                </div>
            )}
        </div>
    );
};
