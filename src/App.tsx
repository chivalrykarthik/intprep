import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { FluentProvider, Button, tokens, makeStyles, shorthands, Title3, Link } from "@fluentui/react-components";
import { WeatherMoonRegular, WeatherSunnyRegular } from "@fluentui/react-icons";
import { darkTheme, lightTheme } from "./theme";
import { Home } from "./pages/Home";
import { TopicDetail } from "./pages/TopicDetail";
import { ContentReader } from "./pages/ContentReader";

const useStyles = makeStyles({
  appContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...shorthands.padding("16px", "24px"),
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  content: {
    flex: 1,
    ...shorthands.padding("24px"),
    overflowY: "auto",
  },
  logoLink: {
    textDecorationLine: 'none',
    color: tokens.colorNeutralForeground1,
    ':hover': {
      color: tokens.colorBrandForeground1
    }
  }
});

function Layout({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className={classes.appContainer}
      style={{
        backgroundColor: isDark
          ? darkTheme.colorNeutralBackground2
          : lightTheme.colorNeutralBackground2,
      }}
    >
      <header className={classes.header}>
        <Link className={classes.logoLink} onClick={() => navigate('/')} as="button">
          <Title3>Interview Prep</Title3>
        </Link>
        <Button
          appearance="subtle"
          icon={isDark ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        />
      </header>

      <main
        className={classes.content}
        style={location.pathname.includes("/read/") ? { padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" } : {}}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topic/:topicId" element={<TopicDetail />} />
          <Route path="/read/:topicId/:fileId" element={<ContentReader />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const currentTheme = isDark ? darkTheme : lightTheme;

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={currentTheme}>
        <HashRouter>
          <Layout isDark={isDark} toggleTheme={toggleTheme} />
        </HashRouter>
      </FluentProvider>
    </QueryClientProvider>
  );
}

export default App;
