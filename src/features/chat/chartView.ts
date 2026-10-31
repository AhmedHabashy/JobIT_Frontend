import type { CSSProperties } from "react";
import type { Layout } from "plotly.js";

/** Minimum plot width for figures that set a height, on narrow screens. */
const TALL_MIN_WIDTH_PX = 640;

/** Pull the title text out of a Plotly title (string or {text} object). */
function titleText(title: Layout["title"] | undefined): string {
  if (title == null) return "";
  if (typeof title === "string") return title;
  return typeof title.text === "string" ? title.text : "";
}

export interface ChartView {
  layout: Partial<Layout>;
  /** HTML heading shown above the plot; empty when the plot draws its own title. */
  heading: string;
  plotStyle: CSSProperties;
  /** True when the plot is wider than the screen and must scroll horizontally. */
  scrolls: boolean;
}

/**
 * Derives how a figure is displayed. The backend layout is honored as-is on wide
 * screens. On narrow (mobile) screens the title is lifted out into an HTML heading
 * (Plotly won't wrap a long title, so it clips), and figures that do not set a
 * height also drop their legend below the plot with tighter margins.
 *
 * A figure that sets `layout.height` (e.g. a directed graph) is displayed at that
 * height, and on narrow screens is kept legible at a minimum width instead of being
 * shrunk to the screen, keeping its own margin and legend.
 */
export function buildChartView(figureLayout: Partial<Layout> | undefined, narrow: boolean): ChartView {
  const layout: Partial<Layout> = {
    autosize: true,
    margin: { t: 40, r: 16, b: 40, l: 48 },
    // On-palette defaults (Nile lapis / Egyptian gold / palm green); a backend
    // figure that sets its own colours or backgrounds still wins via the spread.
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    colorway: ["#123a5a", "#c6892b", "#2e7d5b", "#1e5687", "#8a5e15"],
    ...figureLayout,
    font: { family: "Geist, system-ui, sans-serif", color: "#1e2a32", ...figureLayout?.font },
  };

  const figureHeight =
    typeof figureLayout?.height === "number" && figureLayout.height > 0 ? figureLayout.height : null;

  const plotStyle: CSSProperties = {
    width: "100%",
    height: `${figureHeight ?? (narrow ? 420 : 320)}px`,
  };

  // Mobile overrides are applied AFTER the backend spread so they take effect.
  const heading = narrow ? titleText(figureLayout?.title) : "";
  if (narrow) {
    layout.title = { text: "" };
    if (figureHeight !== null) {
      plotStyle.minWidth = `${TALL_MIN_WIDTH_PX}px`;
    } else {
      layout.margin = { t: 12, r: 10, b: 10, l: 10 };
      layout.legend = {
        ...figureLayout?.legend,
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: -0.02,
        yanchor: "top",
        font: { size: 11, ...figureLayout?.legend?.font },
      };
    }
  }

  return { layout, heading, plotStyle, scrolls: narrow && figureHeight !== null };
}
