import { themes } from "../themes/themes";

export default function ThemeSelector({ currentTheme, onChange }) {
  return (
    <div style={{ padding: 12 }}>
      <h4 style={{ marginBottom: 10 }}>Themes</h4>

      {Object.entries(themes).map(([key, theme]) => (
        <div
          key={key}
          onClick={() => onChange(theme)}
          style={{
            padding: 10,
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 8,
            background:
              currentTheme.name === theme.name
                ? theme.colors.primary
                : "#2a2a2a",
            color:
              currentTheme.name === theme.name ? "#fff" : "#ccc",
            transition: "0.15s"
          }}
        >
          {theme.name}
        </div>
      ))}
    </div>
  );
}
