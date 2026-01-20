export const style = {
  colors: {
    bgDark: "#121212",
    panelDark: "#1e1e1e",
    border: "#2a2a2a",
    primary: "#6200ee",
    textLight: "#ffffff",
    textDark: "#333333",
    textMuted: "#aaaaaa",
    canvasBg: "#fafafa",
  },

  toolButton: (active) => ({
    padding: "6px 14px",
    background: active ? "#6200ee" : "#2a2a2a",
    color: active ? "#fff" : "#bbb",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  }),

  canvasGrid: {
  backgroundColor: "#2a2a2a",
  color: "#444",
  backgroundImage: `
    linear-gradient(#333 1px, transparent 1px),
    linear-gradient(90deg, #333 1px, transparent 1px)
  `,
  backgroundSize: "20px 20px",
}

};
