import { useEffect, useMemo, useRef, useState } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
// plotly.js-dist-min keeps the bundle far smaller than the full plotly.js.
import Plotly from "plotly.js-dist-min";
import type { Data, Layout, Config } from "plotly.js";
import type { Chart } from "@/types/api";

const Plot = createPlotlyComponent(Plotly);

interface PlotlyFigure {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
}

/** Below this container width, switch to a mobile-friendly layout. */
const NARROW_PX = 480;

/** Pull the title text out of a Plotly title (string or {text} object). */
function titleText(title: Layout["title"] | undefined): string {
  if (title == null) return "";
  if (typeof title === "string") return title;
  return typeof title.text === "string" ? title.text : "";
}

/**
 * Renders one chart. THE single render path for both live `chart` SSE frames and
 * stored `charts[]` from history — they share the `{ plotly_json, rtl }` shape
 * (Constitution Principle II). `rtl:true` flows the chart right-to-left via the
 * container `dir`. The backend figure is honored as-is on wide screens; on narrow
 * (mobile) screens we override the legend/title/margins so pie legends drop below
 * the plot instead of overlapping the data and titles don't get cut off.
 */
export default function PlotlyChartImpl({ chart }: { chart: Chart }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setNarrow(w < NARROW_PX);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const figure = useMemo<PlotlyFigure | null>(() => {
    try {
      return JSON.parse(chart.plotly_json) as PlotlyFigure;
    } catch {
      return null;
    }
  }, [chart.plotly_json]);

  if (!figure || !Array.isArray(figure.data)) {
    return (
      <div className="mt-sm p-sm rounded-lg border border-outline-variant bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant">
        Unable to render chart.
      </div>
    );
  }

  const layout: Partial<Layout> = {
    autosize: true,
    margin: { t: 40, r: 16, b: 40, l: 48 },
    // On-palette defaults (Nile lapis / Egyptian gold / palm green); a backend
    // figure that sets its own colours or backgrounds still wins via the spread.
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    colorway: ["#123a5a", "#c6892b", "#2e7d5b", "#1e5687", "#8a5e15"],
    ...figure.layout,
    font: { family: "Geist, system-ui, sans-serif", color: "#1e2a32", ...figure.layout?.font },
  };

  // Mobile overrides (applied AFTER the backend spread so they take effect):
  // legend below the plot, tighter side margins, and the title lifted out into an
  // HTML heading above the plot (Plotly won't wrap a long title, so it clips).
  const heading = narrow ? titleText(figure.layout?.title) : "";
  if (narrow) {
    layout.margin = { t: 12, r: 10, b: 10, l: 10 };
    layout.title = { text: "" };
    layout.legend = {
      ...figure.layout?.legend,
      orientation: "h",
      x: 0.5,
      xanchor: "center",
      y: -0.02,
      yanchor: "top",
      font: { size: 11, ...figure.layout?.legend?.font },
    };
  }

  return (
    <div
      ref={containerRef}
      dir={chart.rtl ? "rtl" : "ltr"}
      className="mt-sm w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest"
    >
      {heading ? (
        <p className="px-sm pt-sm text-center font-body-md text-body-md font-bold text-on-surface text-balance">
          {heading}
        </p>
      ) : null}
      <Plot
        data={figure.data}
        layout={layout}
        config={{
          displayModeBar: false,
          responsive: true,
          ...figure.config,
        }}
        style={{ width: "100%", height: narrow ? "420px" : "320px" }}
        useResizeHandler
      />
    </div>
  );
}
