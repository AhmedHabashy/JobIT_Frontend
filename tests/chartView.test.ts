import { describe, expect, it } from "vitest";
import type { Layout } from "plotly.js";
import { buildChartView } from "@/features/chat/chartView";

const legend = { orientation: "v" as const, x: 1, font: { size: 14 } };
const margin = { t: 60, r: 30, b: 50, l: 70 };

describe("buildChartView", () => {
  describe("figures without layout.height (unchanged behaviour)", () => {
    // Backend JSON may send a plain-string title, which Plotly's types don't model.
    const figure = { title: "Top skills", margin, legend } as unknown as Partial<Layout>;

    it("uses 320px and keeps the backend layout on wide screens", () => {
      const view = buildChartView(figure, false);
      expect(view.plotStyle).toEqual({ width: "100%", height: "320px" });
      expect(view.scrolls).toBe(false);
      expect(view.heading).toBe("");
      expect(view.layout.margin).toEqual(margin);
      expect(view.layout.legend).toEqual(legend);
      expect(view.layout.title).toBe("Top skills");
    });

    it("uses 420px and the mobile overrides on narrow screens", () => {
      const view = buildChartView(figure, true);
      expect(view.plotStyle).toEqual({ width: "100%", height: "420px" });
      expect(view.scrolls).toBe(false);
      expect(view.heading).toBe("Top skills");
      expect(view.layout.title).toEqual({ text: "" });
      expect(view.layout.margin).toEqual({ t: 12, r: 10, b: 10, l: 10 });
      expect(view.layout.legend).toEqual({
        ...legend,
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: -0.02,
        yanchor: "top",
        font: { size: 14 },
      });
    });

    it("handles a figure with no layout at all", () => {
      expect(buildChartView(undefined, false).plotStyle.height).toBe("320px");
      expect(buildChartView(undefined, true).plotStyle.height).toBe("420px");
    });

    it("treats a non-positive height as unset", () => {
      const view = buildChartView({ height: 0 }, true);
      expect(view.plotStyle).toEqual({ width: "100%", height: "420px" });
      expect(view.scrolls).toBe(false);
    });
  });

  describe("figures with layout.height", () => {
    const figure = { height: 520, title: { text: "Role graph" }, margin, legend };

    it("uses the figure height on wide screens with no scrolling", () => {
      const view = buildChartView(figure, false);
      expect(view.plotStyle).toEqual({ width: "100%", height: "520px" });
      expect(view.scrolls).toBe(false);
      expect(view.heading).toBe("");
      expect(view.layout.height).toBe(520);
    });

    it("keeps the height and a 640px minimum width on narrow screens", () => {
      const view = buildChartView(figure, true);
      expect(view.plotStyle).toEqual({ width: "100%", height: "520px", minWidth: "640px" });
      expect(view.scrolls).toBe(true);
    });

    it("keeps the narrow title behaviour", () => {
      const view = buildChartView(figure, true);
      expect(view.heading).toBe("Role graph");
      expect(view.layout.title).toEqual({ text: "" });
    });

    it("does not override the figure's margin or legend on narrow screens", () => {
      const view = buildChartView(figure, true);
      expect(view.layout.margin).toEqual(margin);
      expect(view.layout.legend).toEqual(legend);
    });
  });
});
