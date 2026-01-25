import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { tokens } from "@fluentui/react-components";

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
});

interface MermaidProps {
    chart: string;
}

export const Mermaid = ({ chart }: MermaidProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState("");
    const isDark = document.body.style.backgroundColor !== tokens.colorNeutralBackground2;

    useEffect(() => {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // We can try to re-initialize or configure theme before render
        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            securityLevel: 'loose'
        });

        mermaid.render(id, chart)
            .then((result) => {
                setSvg(result.svg);
            })
            .catch((error) => {
                console.error("Mermaid failed to render:", error);
                setSvg(`<div style="color: red; padding: 10px; border: 1px solid red;">
          <strong>Failed to render diagram</strong><br/>
          ${error instanceof Error ? error.message : String(error)}
        </div>`);
            });
    }, [chart, isDark]);

    return (
        <div
            className="mermaid"
            ref={ref}
            dangerouslySetInnerHTML={{ __html: svg }}
            style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '24px 0',
                backgroundColor: isDark ? 'transparent' : 'white', // Ensure contrast if needed
                padding: '12px',
                borderRadius: '8px'
            }}
        />
    );
};
