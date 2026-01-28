import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, ghcolors } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    makeStyles,
    shorthands,
    tokens,
    Button,
    Text,
} from "@fluentui/react-components";
import { ArrowLeftRegular } from "@fluentui/react-icons";
import { Mermaid } from "../components/Mermaid";
import { SlidingWindowVisualizer } from "../components/visualizers/SlidingWindowVisualizer";
import { TwoPointerVisualizer } from "../components/visualizers/TwoPointerVisualizer";
import { IntervalVisualizer } from "../components/visualizers/IntervalVisualizer";
import { CyclicSortVisualizer } from "../components/visualizers/CyclicSortVisualizer";
import { LinkedListVisualizer } from "../components/visualizers/LinkedListVisualizer";
import { TreeBFSVisualizer } from "../components/visualizers/TreeBFSVisualizer";
import { TreeDFSVisualizer } from "../components/visualizers/TreeDFSVisualizer";
import { TwoHeapsVisualizer } from "../components/visualizers/TwoHeapsVisualizer";
import { SubsetsVisualizer } from "../components/visualizers/SubsetsVisualizer";
import { BinarySearchVisualizer } from "../components/visualizers/BinarySearchVisualizer";
import { TopKVisualizer } from "../components/visualizers/TopKVisualizer";
import { KWayMergeVisualizer } from "../components/visualizers/KWayMergeVisualizer";
import { CodePlayground } from "../components/CodePlayground";
import { TopologicalSortVisualizer } from "../components/visualizers/TopologicalSortVisualizer";
import { QuickSortVisualizer } from "../components/visualizers/QuickSortVisualizer";
import { MergeSortVisualizer } from "../components/visualizers/MergeSortVisualizer";
import { HeapSortVisualizer } from "../components/visualizers/HeapSortVisualizer";

// Styles for the reader
const useStyles = makeStyles({
    pageContainer: {
        display: "flex",
        flexDirection: "column",
        height: "100%", // Fill available space in parent, not viewport
        overflow: "hidden",
        backgroundColor: tokens.colorNeutralBackground2, // Match parent bg
    },
    headerWrapper: {
        flex: "0 0 auto",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: tokens.colorNeutralBackground1, // Ensure header has bg
        zIndex: 10,
        boxShadow: tokens.shadow2, // subtle shadow for separation
    },
    headerContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...shorthands.padding("16px", "20px"),
    },
    scrollContainer: {
        flex: "1 1 auto",
        overflowY: "auto",
        width: "100%",
        display: "flex", // To center the inner content column
        flexDirection: "column",
        alignItems: "center",
        scrollBehavior: "smooth",
    },
    contentInner: {
        width: "100%",
        maxWidth: "800px",
        ...shorthands.padding("20px", "20px", "60px", "20px"), // Bottom padding for scrolling space
        lineHeight: "1.6",
        color: tokens.colorNeutralForeground1,
    },
    // Markdown Content Styles
    markdown: {
        "& h1": { display: "none" }, // Hide title as it's in header
        "& h2": {
            fontSize: "24px",
            fontWeight: "600",
            marginTop: "32px",
            marginBottom: "12px",
            paddingBottom: "8px",
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
            color: tokens.colorNeutralForeground1,
        },
        "& h3": {
            fontSize: "20px",
            fontWeight: "600",
            marginTop: "24px",
            marginBottom: "8px",
            color: tokens.colorNeutralForeground1,
        },
        "& p": {
            fontSize: "16px",
            marginBottom: "16px",
            color: tokens.colorNeutralForeground1,
        },
        "& ul, & ol": {
            marginBottom: "16px",
            paddingLeft: "24px",
        },
        "& li": {
            marginBottom: "8px",
        },
        "& blockquote": {
            borderLeft: `4px solid ${tokens.colorBrandStroke1}`,
            paddingLeft: "16px",
            marginLeft: "0",
            fontStyle: "italic",
            color: tokens.colorNeutralForeground2,
        },
        "& code": {
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            fontSize: "14px",
            backgroundColor: tokens.colorNeutralBackground3,
            ...shorthands.padding("2px", "4px"),
            borderRadius: "4px",
        },
        "& pre": {
            ...shorthands.padding("0"),
            backgroundColor: "transparent",
        },
        "& pre code": {
            backgroundColor: "transparent",
            ...shorthands.padding("0"),
        },
        "& table": {
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "24px",
        },
        "& th": {
            textAlign: "left",
            ...shorthands.padding("12px"),
            borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
            fontWeight: "600",
        },
        "& td": {
            ...shorthands.padding("12px"),
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        }
    },
});

export const ContentReader = () => {
    const { topicId, fileId } = useParams();
    const navigate = useNavigate();
    const styles = useStyles();

    // We need to know current theme for syntax highlighter
    const isDark = document.body.style.backgroundColor !== tokens.colorNeutralBackground2;

    const { data: rawContent = "", isLoading } = useQuery({
        queryKey: ['content', topicId, fileId],
        queryFn: async () => {
            const path = `${import.meta.env.BASE_URL}prep/${topicId}/${fileId}`;
            const res = await fetch(path);
            if (!res.ok) throw new Error("File not found");
            return res.text();
        }
    });

    // Extract Title (First H1)
    const titleMatch = rawContent.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : "Topic Details";

    // Remove title from content so it doesn't duplicate
    const content = rawContent.replace(/^#\s+.*$/m, '');

    if (isLoading) {
        return <div className={styles.pageContainer} style={{ padding: 20 }}><Text>Loading content...</Text></div>;
    }

    return (
        <div className={styles.pageContainer}>
            {/* Rigid Header Area */}
            <div className={styles.headerWrapper}>
                <div className={styles.headerContent}>
                    <Text size={600} weight="semibold" style={{ margin: 0 }}>
                        {title}
                    </Text>
                    <Button
                        appearance="subtle"
                        icon={<ArrowLeftRegular />}
                        iconPosition="after"
                        onClick={() => navigate(`/topic/${topicId}`)}
                        style={{ minWidth: "fit-content" }}
                    >
                        Back
                    </Button>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className={styles.scrollContainer}>
                <div className={styles.contentInner}>
                    <div className={styles.markdown}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    const language = match ? match[1] : '';

                                    if (!inline && language === 'mermaid') {
                                        return <Mermaid chart={String(children)} />;
                                    }

                                    if (!inline && language === 'visualizer') {
                                        try {
                                            const config = JSON.parse(String(children));
                                            if (config.type === 'sliding-window') {
                                                return <SlidingWindowVisualizer data={config.data} k={config.k} />;
                                            }
                                            if (config.type === 'two-pointer') {
                                                return <TwoPointerVisualizer data={config.data} speeds={config.speeds} />;
                                            }
                                            if (config.type === 'intervals') {
                                                return <IntervalVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'cyclic-sort') {
                                                return <CyclicSortVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'linked-list') {
                                                return <LinkedListVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'tree-bfs') {
                                                return <TreeBFSVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'tree-dfs') {
                                                return <TreeDFSVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'two-heaps') {
                                                return <TwoHeapsVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'subsets') {
                                                return <SubsetsVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'binary-search') {
                                                return <BinarySearchVisualizer data={config.data} target={config.target} />;
                                            }
                                            if (config.type === 'top-k') {
                                                return <TopKVisualizer data={config.data} k={config.k} />;
                                            }
                                            if (config.type === 'k-way-merge') {
                                                return <KWayMergeVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'topological-sort') {
                                                return <TopologicalSortVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'quick-sort') {
                                                return <QuickSortVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'merge-sort') {
                                                return <MergeSortVisualizer data={config.data} />;
                                            }
                                            if (config.type === 'heap-sort') {
                                                return <HeapSortVisualizer data={config.data} />;
                                            }
                                        } catch (e) {
                                            return <div style={{ color: 'red' }}>Invalid Visualizer Config</div>;
                                        }
                                    }


                                    if (!inline && (language === 'typescript' || language === 'javascript' || language === 'js' || language === 'ts')) {
                                        return (
                                            <CodePlayground
                                                initialCode={String(children)}
                                                language={language}
                                            />
                                        );
                                    }

                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            {...props}
                                            style={isDark ? vscDarkPlus : ghcolors}
                                            language={language}
                                            PreTag="div"
                                            customStyle={{
                                                borderRadius: '8px',
                                                padding: '20px',
                                                margin: '20px 0',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                boxShadow: tokens.shadow4
                                            }}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};
