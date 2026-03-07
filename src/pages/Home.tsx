import {
    makeStyles,
    shorthands,
    tokens,
    Card,
    CardHeader,
    CardFooter,
    Text,
    Button,
    Subtitle1,
    Body1,
    Title1,
} from "@fluentui/react-components";
import { FolderRegular, ArrowRightRegular, CalculatorRegular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";

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
        textAlign: "center",
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
    cardHeader: {
        marginBottom: "12px",
    },
    icon: {
        fontSize: "32px",
        color: tokens.colorBrandForeground1,
        marginBottom: "12px",
    },
    featuredCard: {
        ...shorthands.padding("24px"),
        background: `linear-gradient(135deg, #5b2c8e 0%, #1a1a3e 100%)`,
        color: "white",
        borderRadius: "16px",
        cursor: "pointer",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        ":hover": {
            transform: "translateY(-4px) scale(1.01)",
            boxShadow: tokens.shadow28,
        },
    },
});

interface Topic {
    id: string;
    title: string;
    path: string;
}

import { useQuery } from "@tanstack/react-query";

// ... (existing imports)

export const Home = () => {
    const styles = useStyles();
    const navigate = useNavigate();

    const { data: topics = [] } = useQuery<Topic[]>({
        queryKey: ['topics'],
        queryFn: () => fetch(`${import.meta.env.BASE_URL}topics.json`).then((res) => res.json())
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Title1>Preparation Topics</Title1>
                <Subtitle1>Select a topic to start learning</Subtitle1>
            </div>

            {/* Featured: Back of Envelope Estimation */}
            <Card className={styles.featuredCard} onClick={() => navigate("/estimation")}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                    <CalculatorRegular style={{ fontSize: 36, color: "#c4b5fd" }} />
                    <div>
                        <Text weight="bold" size={600} style={{ color: "white" }}>📐 Back of the Envelope Estimation</Text>
                        <br />
                        <Text size={300} style={{ color: "rgba(255,255,255,0.8)" }}>
                            Interactive calculator — input your system parameters and get instant capacity estimates with detailed breakdowns &amp; charts
                        </Text>
                    </div>
                    <ArrowRightRegular style={{ fontSize: 24, color: "#c4b5fd", marginLeft: "auto" }} />
                </div>
            </Card>

            <div className={styles.grid}>
                {topics.map((topic) => (
                    <Card key={topic.id} className={styles.card}>
                        <CardHeader
                            header={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FolderRegular className={styles.icon} />
                                    <Text weight="semibold" size={500}>{topic.title}</Text>
                                </div>
                            }
                        />

                        <div style={{ flex: 1, marginBottom: '20px' }}>
                            <Body1>
                                Explore concepts and patterns related to {topic.title}.
                            </Body1>
                        </div>

                        <CardFooter>
                            <Button
                                appearance="primary"
                                icon={<ArrowRightRegular />}
                                iconPosition="after"
                                onClick={() => navigate(`/topic/${topic.id}`)}
                            >
                                Start Learning
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};
