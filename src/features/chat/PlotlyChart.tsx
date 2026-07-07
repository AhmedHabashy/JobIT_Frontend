import { lazy, Suspense } from "react";
import type { Chart } from "@/types/api";

// Plotly is large (~4 MB). Lazy-load it so it is only fetched when a chart
// actually renders, keeping it out of the main bundle. THE single render path
// for both live `chart` frames and stored `charts[]` (Constitution Principle II).
const PlotlyChartImpl = lazy(() => import("@/features/chat/PlotlyChartImpl"));

export function PlotlyChart({ chart }: { chart: Chart }) {
  return (
    <Suspense
      fallback={
        <div className="mt-sm h-[320px] w-full rounded-lg border border-outline-variant bg-surface-container-low flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-on-surface-variant">
            progress_activity
          </span>
        </div>
      }
    >
      <PlotlyChartImpl chart={chart} />
    </Suspense>
  );
}
