import { useMemo } from "react";
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

/**
 * Renders one chart. THE single render path for both live `chart` SSE frames and
 * stored `charts[]` from history — they share the `{ plotly_json, rtl }` shape
 * (Constitution Principle II). `rtl:true` flows the chart right-to-left via the
 * container `dir` (safe: it doesn't reverse data-bearing axes), letting Plotly
 * lay out titles/legends/tick text for Arabic; the backend figure is otherwise
 * honored as-is.
 */
export default function PlotlyChartImpl({ chart }: { chart: Chart }) {
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
    margin: { t: 32, r: 16, b: 40, l: 48 },
    // On-palette defaults (Nile lapis / Egyptian gold / palm green); a backend
    // figure that sets its own colours or backgrounds still wins via the spread.
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    colorway: ["#123a5a", "#c6892b", "#2e7d5b", "#1e5687", "#8a5e15"],
    ...figure.layout,
    font: { family: "Geist, system-ui, sans-serif", color: "#1e2a32", ...figure.layout?.font },
  };

  return (
    <div dir={chart.rtl ? "rtl" : "ltr"} className="mt-sm w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
      <Plot
        data={figure.data}
        layout={layout}
        config={{ displaylogo: false, responsive: true, ...figure.config }}
        style={{ width: "100%", height: "320px" }}
        useResizeHandler
      />
    </div>
  );
}
