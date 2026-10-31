import { useEffect, useMemo, useRef, useState } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
// plotly.js-dist-min keeps the bundle far smaller than the full plotly.js.
import Plotly from "plotly.js-dist-min";
import type { Data, Layout, Config } from "plotly.js";
import type { Chart } from "@/types/api";
import { buildChartView } from "@/features/chat/chartView";

const Plot = createPlotlyComponent(Plotly);

interface PlotlyFigure {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
}

/** Below this container width, switch to a mobile-friendly layout. */
const NARROW_PX = 480;

/**
 * Renders one chart. THE single render path for both live `chart` SSE frames and
 * stored `charts[]` from history — they share the `{ plotly_json, rtl }` shape
 * (Constitution Principle II). `rtl:true` flows the chart right-to-left via the
 * container `dir`. Sizing and the mobile overrides live in `buildChartView`.
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
      <div className="mb-sm p-sm rounded-lg border border-outline-variant bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant">
        Unable to render chart.
      </div>
    );
  }

  const { layout, heading, plotStyle, scrolls } = buildChartView(figure.layout, narrow);

  return (
    <div
      ref={containerRef}
      dir={chart.rtl ? "rtl" : "ltr"}
      className="mb-sm w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest"
    >
      {heading ? (
        <p className="px-sm pt-sm text-center font-body-md text-body-md font-bold text-on-surface text-balance">
          {heading}
        </p>
      ) : null}
      {/* Scrolls here, not on the outer box, so the heading stays put. Always
          rendered so a narrow/wide change never remounts the plot. */}
      <div className={scrolls ? "overflow-x-auto" : undefined}>
        <Plot
          data={figure.data}
          layout={layout}
          config={{
            displayModeBar: false,
            responsive: true,
            ...figure.config,
          }}
          style={plotStyle}
          useResizeHandler
        />
      </div>
    </div>
  );
}
