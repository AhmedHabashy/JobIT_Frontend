import { Link } from "react-router-dom";

/** A single bento feature card. */
function Feature({
  icon,
  title,
  children,
  className = "",
  tone = "surface",
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  tone?: "surface" | "primary";
}) {
  const isPrimary = tone === "primary";
  return (
    <div
      className={`rounded-xl p-md border ${
        isPrimary
          ? "bg-primary text-on-primary border-primary"
          : "bg-surface-container-lowest border-outline-variant"
      } ${className}`}
    >
      <div className="flex items-start gap-md">
        <span className={`material-symbols-outlined text-[32px] ${isPrimary ? "" : "text-primary"}`}>
          {icon}
        </span>
        <div>
          <h3 className={`font-title-sm text-title-sm ${isPrimary ? "" : "text-on-surface"}`}>
            {title}
          </h3>
          <p
            className={`font-body-sm text-body-sm mt-xs ${
              isPrimary ? "opacity-90" : "text-on-surface-variant"
            }`}
          >
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Public marketing landing page (US7). Reachable at `/` for anonymous visitors;
 * signed-in users are redirected to `/app` by RedirectIfAuthed. All CTAs lead to
 * the sign-in screen — access is operator-provisioned (no open signup).
 */
export default function Landing() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 border-b border-outline-variant bg-surface-container-lowest">
        <nav className="flex justify-between items-center max-w-max-width-content mx-auto px-margin-mobile h-16">
          <span className="font-headline-md text-headline-md text-primary">Jobit</span>
          <Link
            to="/login"
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-xl pb-lg">
          <div className="max-w-max-width-content mx-auto px-margin-mobile flex flex-col md:flex-row items-center gap-xl">
            <div className="w-full md:w-1/2 space-y-md">
              <div className="inline-flex items-center gap-xs bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span className="font-label-caps text-label-caps">AI-POWERED CAREER INSIGHTS</span>
              </div>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface max-w-xl">
                Navigate the Egyptian Job Market with AI
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
                Expert career guidance based on your CV and real-time labour data. Find the right
                opportunities in Egypt&apos;s evolving landscape.
              </p>
              <div className="flex flex-wrap gap-md pt-base">
                <Link
                  to="/login"
                  className="bg-accent text-on-accent px-xl py-md rounded-lg font-title-sm text-title-sm flex items-center gap-base shadow-sm transition-all hover:brightness-95 hover:shadow-md"
                >
                  Explore Career Coach
                  <span className="material-symbols-outlined">trending_flat</span>
                </Link>
                <Link
                  to="/login"
                  className="border border-outline-variant text-on-surface-variant px-xl py-md rounded-lg font-title-sm text-title-sm hover:bg-surface-container transition-colors"
                >
                  View Market Reports
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
                <div className="flex items-center gap-xs text-primary mb-md">
                  <span className="material-symbols-outlined">trending_up</span>
                  <span className="font-title-sm text-title-sm">Demand Trends</span>
                </div>
                <div className="bg-surface-container rounded-lg p-md min-h-[200px] flex items-end">
                  <div className="flex gap-xs items-end w-full">
                    {[12, 24, 32, 40, 48].map((h) => (
                      <div
                        key={h}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-primary to-accent"
                        style={{ height: `${h * 3}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento features */}
        <section className="py-xl bg-surface-container-low">
          <div className="max-w-max-width-content mx-auto px-margin-mobile">
            <div className="mb-lg space-y-xs">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Egyptian Market Insights
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Data-driven intelligence tailored for the local ecosystem.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <Feature icon="trending_up" title="Demand Trends" className="md:col-span-2">
                Our AI analyzes thousands of daily job postings across Egypt to identify rising
                skills in Fintech, Logistics, and Renewable Energy — with skill-gap analysis and
                regional salary benchmarks.
              </Feature>
              <Feature icon="gavel" title="Labour Law Guidance" tone="primary">
                Understand your rights. Jobit simplifies the Egyptian Labour Law for contracts,
                leave policies, and termination.
              </Feature>
              <Feature icon="description" title="AI CV Optimization">
                Upload your CV and get instant feedback on how to align it with Egyptian enterprise
                standards.
              </Feature>
              <Feature icon="alt_route" title="Career Path Planning">
                Map out your journey based on current hiring trends and economic shifts in the MENA
                region.
              </Feature>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-xl">
          <div className="max-w-max-width-content mx-auto px-margin-mobile">
            <div className="bg-surface-container-highest rounded-xl p-xl text-center flex flex-col items-center space-y-md border border-outline-variant">
              <h2 className="font-display-lg-mobile text-display-lg-mobile md:text-display-lg text-on-surface">
                Ready to find your next step?
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Jobit&apos;s AI Career Coach helps Egyptian professionals land their next role.
                Access is provided by your organization&apos;s administrator.
              </p>
              <Link
                to="/login"
                className="bg-primary text-on-primary px-xl py-md rounded-lg font-title-sm text-title-sm hover:opacity-90 transition-opacity"
              >
                Sign In to Get Started
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant">
        <div className="max-w-max-width-content mx-auto py-lg px-margin-mobile flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex flex-col gap-xs items-center md:items-start">
            <span className="font-title-sm text-on-surface-variant">Jobit</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © 2026 Jobit Egypt. All rights reserved.
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Access is restricted to authorized personnel.
          </span>
        </div>
      </footer>
    </div>
  );
}
