import {
    webDarkTheme,
    webLightTheme,
    type Theme,
} from "@fluentui/react-components";

// Custom "Interesting" Theme Overrides
// We can extend the standard web themes to add more vibrancy if needed
// For now, we will use the standard high-quality Fluent Web themes
// but prepared for customization.

export const lightTheme: Theme = {
    ...webLightTheme,
};

export const darkTheme: Theme = {
    ...webDarkTheme,
    colorBrandBackground: "#5f48bb", // Example override for a deep purple brand
    colorBrandBackgroundHover: "#4f3daa",
    colorBrandBackgroundPressed: "#3e2f88",
    colorBrandStroke1: "#5f48bb",
};
