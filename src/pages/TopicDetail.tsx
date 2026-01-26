import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    makeStyles,
    shorthands,
    tokens,
    Text,
    Button,
    Title1,
    Card,
    CardHeader,
    CardFooter,
    Body1,
    Subtitle1,
} from "@fluentui/react-components";
import { ArrowLeftRegular, DocumentRegular, ArrowRightRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
    container: {
        ...shorthands.padding("16px"),
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
    },
    header: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "20px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
    },
    card: {
        ...shorthands.padding("16px"),
        height: "100%",
        backgroundColor: tokens.colorNeutralBackground1,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ":hover": {
            transform: "translateY(-4px)",
            boxShadow: tokens.shadow16,
        },
    },
    icon: {
        fontSize: "24px",
        color: tokens.colorBrandForeground1,
    },
});

interface TopicItem {
    title: string;
    path: string;
}

interface Topic {
    id: string;
    title: string;
    path: string;
    items?: TopicItem[];
}

export const TopicDetail = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const styles = useStyles();

    const { data: topic, isLoading } = useQuery({
        queryKey: ['topics'], // Using same key to leverage cache from Home
        queryFn: () => fetch(`${import.meta.env.BASE_URL}topics.json`).then((res) => res.json()),
        select: (data: Topic[]) => data.find((t) => t.id === topicId) || null
    });

    if (isLoading) {
        return <div className={styles.container}><Text>Loading...</Text></div>;
    }

    if (!topic) {
        return (
            <div className={styles.container}>
                <Title1>Topic not found</Title1>
                <Button icon={<ArrowLeftRegular />} onClick={() => navigate("/")}>
                    Back to Home
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button
                    appearance="subtle"
                    icon={<ArrowLeftRegular />}
                    onClick={() => navigate("/")}
                    style={{ alignSelf: 'flex-start' }}
                >
                    Back
                </Button>
                <Title1>{topic.title}</Title1>
                <Subtitle1>Select a guide to read</Subtitle1>
            </div>

            <div className={styles.grid}>
                {topic.items?.map((item, index) => (
                    <Card key={index} className={styles.card}>
                        <CardHeader
                            header={
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <DocumentRegular className={styles.icon} />
                                    <Text weight="semibold" size={400}>
                                        {item.title}
                                    </Text>
                                </div>
                            }
                        />
                        <div style={{ flex: 1 }}>
                            <Body1>Read about {item.title}</Body1>
                        </div>
                        <CardFooter>
                            <Button
                                appearance="secondary"
                                icon={<ArrowRightRegular />}
                                iconPosition="after"
                                onClick={() => {
                                    // Extract filename from path: /prep/14patterns/sliding_window.md -> sliding_window.md
                                    const filename = item.path.split('/').pop();
                                    navigate(`/read/${topicId}/${filename}`);
                                }}
                            >
                                Read
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {(!topic.items || topic.items.length === 0) && (
                    <Text>No content available yet for this topic.</Text>
                )}
            </div>
        </div>
    );
};
