import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/auth/AuthProvider";
import type { StringKey } from "@/i18n/strings";
import "./Landing.css";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Top in-demand skills, each with a 9-point demand trend (index, 0–100). */
const SKILLS: { key: StringKey; w: number; series: number[] }[] = [
  { key: "landing.skillData", w: 92, series: [40, 48, 55, 60, 68, 74, 82, 88, 92] },
  { key: "landing.skillMarketing", w: 87, series: [45, 50, 54, 60, 63, 70, 76, 82, 87] },
  { key: "landing.skillCloud", w: 80, series: [30, 36, 44, 50, 58, 63, 70, 75, 80] },
  { key: "landing.skillFinance", w: 74, series: [50, 52, 55, 58, 60, 64, 68, 71, 74] },
];

// Plot geometry (viewBox 0 0 480 200).
const N = 9;
const PL = 8;
const PR = 472;
const PT = 14;
const PB = 176;
const BASE = 186;

function xAt(i: number): number {
  return PL + (i / (N - 1)) * (PR - PL);
}
function yAt(v: number): number {
  return PT + (1 - v / 100) * (PB - PT);
}
/** Smooth (horizontal-tangent) cubic path through the series values. */
function linePath(vals: number[]): { d: string; lastX: number; lastY: number } {
  const pts = vals.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const first = pts[0]!;
  let d = `M${first.x.toFixed(1)},${first.y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]!;
    const p1 = pts[i + 1]!;
    const cx = (p0.x + p1.x) / 2;
    d += ` C${cx.toFixed(1)},${p0.y.toFixed(1)} ${cx.toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }
  const last = pts[pts.length - 1]!;
  return { d, lastX: last.x, lastY: last.y };
}

/**
 * The hero's signature: a LIVE skill-demand chart. It auto-cycles through the
 * top skills, redraws with a smooth morph, breathes with subtle ambient motion,
 * and lets the visitor hover/click a skill to explore it. Motion is dropped and
 * the chart stays static (still interactive) under prefers-reduced-motion.
 */
function InteractiveChart() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);

  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const scanRef = useRef<SVGLineElement>(null);
  const valRef = useRef<HTMLDivElement>(null);

  const curRef = useRef<number[]>(SKILLS[0]!.series.slice());
  const tgtRef = useRef<number[]>(SKILLS[0]!.series.slice());
  const idxRef = useRef(0);
  const hoverRef = useRef(false);
  const dispRef = useRef(0);

  useEffect(() => {
    idxRef.current = active;
    tgtRef.current = SKILLS[active]!.series.slice();
  }, [active]);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let raf = 0;
    let auto = 0;
    const t0 = performance.now();

    function draw(now: number) {
      const time = (now - t0) / 1000;
      const cur = curRef.current;
      const tgt = tgtRef.current;
      const k = reduced ? 1 : 0.12;
      const disp: number[] = new Array(N);
      for (let i = 0; i < N; i++) {
        const c = cur[i]!;
        const nv = c + (tgt[i]! - c) * k;
        cur[i] = nv;
        disp[i] = reduced ? nv : nv + Math.sin(time * 1.6 + i * 0.6) * 1.1;
      }
      const { d, lastX, lastY } = linePath(disp);
      lineRef.current?.setAttribute("d", d);
      areaRef.current?.setAttribute("d", `${d} L${PR},${BASE} L${PL},${BASE} Z`);
      if (dotRef.current) {
        dotRef.current.setAttribute("cx", lastX.toFixed(1));
        dotRef.current.setAttribute("cy", lastY.toFixed(1));
      }
      if (pulseRef.current) {
        pulseRef.current.setAttribute("cx", lastX.toFixed(1));
        pulseRef.current.setAttribute("cy", lastY.toFixed(1));
        const ph = reduced ? 0 : Math.sin(time * 2.2) * 0.5 + 0.5;
        pulseRef.current.setAttribute("r", (4 + ph * 9).toFixed(1));
        pulseRef.current.style.opacity = reduced ? "0" : (0.35 * (1 - ph)).toFixed(2);
      }
      if (scanRef.current && !reduced) {
        const sx = PL + (0.5 + 0.5 * Math.sin(time * 0.7)) * (PR - PL);
        scanRef.current.setAttribute("x1", sx.toFixed(1));
        scanRef.current.setAttribute("x2", sx.toFixed(1));
      }
      const target = SKILLS[idxRef.current]!.w;
      dispRef.current += (target - dispRef.current) * k;
      if (valRef.current) valRef.current.textContent = String(Math.round(dispRef.current));
      if (!reduced) raf = requestAnimationFrame(draw);
    }

    draw(performance.now());

    if (!reduced) {
      auto = window.setInterval(() => {
        if (hoverRef.current) return;
        setActive((a) => (a + 1) % SKILLS.length);
      }, 3200);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (auto) clearInterval(auto);
    };
  }, []);

  return (
    <div className="kcard">
      <div className="kcard-head">
        <div>
          <div className="klabel">{t("landing.chartLabel")}</div>
          <div className="kname">{t(SKILLS[active]!.key)}</div>
        </div>
        <div className="kright">
          <div className="kval" ref={valRef}>
            0
          </div>
          <div className="kcap">{t("landing.chartSub")}</div>
        </div>
      </div>

      <div className="kplot">
        <svg viewBox="0 0 480 200" role="img" aria-label={t("landing.chartLabel")}>
          <defs>
            <linearGradient id="jobitKGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f6bff" stopOpacity=".22" />
              <stop offset="100%" stopColor="#0bc5d6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="jobitKStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1f6bff" />
              <stop offset="100%" stopColor="#0bc5d6" />
            </linearGradient>
          </defs>
          <g className="kgrid">
            <line x1="0" y1="48" x2="480" y2="48" />
            <line x1="0" y1="92" x2="480" y2="92" />
            <line x1="0" y1="136" x2="480" y2="136" />
            <line x1="0" y1="180" x2="480" y2="180" />
          </g>
          <line ref={scanRef} className="kscan" x1="240" y1="8" x2="240" y2="182" />
          <path ref={areaRef} className="karea" d="" />
          <path ref={lineRef} className="kline" d="" />
          <circle ref={pulseRef} className="kdotpulse" cx="0" cy="0" r="4" />
          <circle ref={dotRef} className="kdot" cx="0" cy="0" r="4.5" />
        </svg>
      </div>

      <div className="kpills">
        {SKILLS.map((s, i) => (
          <button
            type="button"
            key={s.key}
            className={i === active ? "kpill active" : "kpill"}
            onMouseEnter={() => {
              hoverRef.current = true;
              setActive(i);
            }}
            onMouseLeave={() => {
              hoverRef.current = false;
            }}
            onFocus={() => {
              hoverRef.current = true;
              setActive(i);
            }}
            onBlur={() => {
              hoverRef.current = false;
            }}
            onClick={() => setActive(i)}
          >
            {t(s.key)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Number that counts up from zero the first time it scrolls into view. */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setVal(to);
      return;
    }
    let frame = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || started) return;
          started = true;
          const start = performance.now();
          const dur = 1600;
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * eased));
            if (p < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
          io.disconnect();
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * Public marketing landing page (US7) — "Interactive & Kinetic" redesign.
 * Reachable at `/` for anonymous visitors; signed-in users are redirected to
 * `/app` by RedirectIfAuthed. All CTAs lead to sign-in.
 */
export default function Landing() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const authed = Boolean(user);
  const primaryTo = authed ? "/app" : "/login";
  const rootRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll(".reveal"));
    if (prefersReducedMotion()) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function scrollToHow(e: MouseEvent) {
    e.preventDefault();
    document
      .getElementById("how")
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  const Wordmark = () => (
    <>
      <span className="dotmark" aria-hidden="true" />
      <span className="word">
        Job<b>it</b>
      </span>
    </>
  );

  const INSIGHTS: {
    titleKey: StringKey;
    bodyKey: StringKey;
    cls: string;
    icon: JSX.Element;
  }[] = [
    {
      titleKey: "landing.featDemandTitle",
      bodyKey: "landing.featDemandBody",
      cls: "feat span reveal",
      icon: <path d="M3 3v18h18M7 14l4-4 3 3 5-6" />,
    },
    {
      titleKey: "landing.featPathTitle",
      bodyKey: "landing.featPathBody",
      cls: "feat goldic reveal",
      icon: <path d="M3 21h18M6 21V10M12 21V4M18 21v-7" />,
    },
    {
      titleKey: "landing.featCvTitle",
      bodyKey: "landing.featCvBody",
      cls: "feat cyanic reveal",
      icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 15l2 2 4-4" />,
    },
    {
      titleKey: "landing.featMethodTitle",
      bodyKey: "landing.featMethodBody",
      cls: "feat reveal",
      icon: (
        <>
          <path d="M12 20V10M12 10l-4 4M12 10l4 4" />
          <circle cx="12" cy="5" r="2" />
        </>
      ),
    },
  ];

  return (
    <div className={loaded ? "jobit-landing loaded" : "jobit-landing"} ref={rootRef}>
      <div className="lnav">
        <div className="wrap lnav-inner">
          <Link to="/" className="brand" aria-label="Jobit — home">
            <Wordmark />
          </Link>
          <div className="lnav-right">
            <div className="langtoggle" role="group" aria-label="Language">
              <button
                type="button"
                className={language === "en" ? "active" : ""}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={language === "ar" ? "active" : ""}
                onClick={() => setLanguage("ar")}
              >
                عربي
              </button>
            </div>
            <Link to={primaryTo} className="lbtn lbtn-soft lbtn-sm">
              {authed ? t("landing.goToApp") : t("landing.signIn")}
            </Link>
          </div>
        </div>
      </div>

      <section className="hero">
        <div className="wrap hero-grid">
          <div className="stagger">
            <span className="eyebrow">
              <span className="edot" />
              {t("landing.eyebrow")}
            </span>
            <h1 className="title">{t("landing.heroTitle")}</h1>
            <p className="lede">{t("landing.heroLede")}</p>
            <div className="cta-row">
              <Link to={primaryTo} className="lbtn lbtn-grad">
                {t("landing.ctaExplore")}
              </Link>
              <a href="#how" className="lbtn lbtn-soft" onClick={scrollToHow}>
                {t("landing.ctaHow")}
              </a>
            </div>
            <div className="trust">
              <span className="seal" aria-hidden="true">
                E
              </span>
              {t("landing.trustEces")}
            </div>
          </div>

          <InteractiveChart />
        </div>
      </section>

      <section className="wrap band">
        <div className="statement reveal">
          <div className="kicker">{t("landing.whatKicker")}</div>
          <p>{t("landing.whatBody")}</p>
        </div>

        <div className="stats">
          <div className="stat reveal">
            <div className="n">
              <span className="accent">3</span>
            </div>
            <div className="k">{t("landing.stat1")}</div>
          </div>
          <div className="stat reveal">
            <div className="n">
              <CountUp to={480000} suffix="+" />
            </div>
            <div className="k">{t("landing.stat2")}</div>
          </div>
          <div className="stat reveal">
            <div className="n">
              <CountUp to={260} suffix="+" />
            </div>
            <div className="k">{t("landing.stat3")}</div>
          </div>
        </div>
      </section>

      <section className="wrap sec" id="how">
        <div className="sec-head reveal">
          <h2>{t("landing.insightsTitle")}</h2>
          <p>{t("landing.insightsSub")}</p>
        </div>
        <div className="grid4">
          {INSIGHTS.map((it) => (
            <div className={it.cls} key={it.titleKey}>
              <div className="ic" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {it.icon}
                </svg>
              </div>
              {it.cls.includes("span") ? (
                <div>
                  <h3>{t(it.titleKey)}</h3>
                  <p>{t(it.bodyKey)}</p>
                </div>
              ) : (
                <>
                  <h3>{t(it.titleKey)}</h3>
                  <p>{t(it.bodyKey)}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="wrap">
        <div className="final reveal">
          <h2>{t("landing.ctaTitle")}</h2>
          <p>{t("landing.ctaBody")}</p>
          <Link to={primaryTo} className="lbtn lbtn-light">
            {authed ? t("landing.goToApp") : t("landing.ctaSignIn")}
          </Link>
        </div>
      </section>

      <footer className="lfoot-wrap">
        <div className="wrap lfoot">
          <span className="brand" style={{ cursor: "default" }}>
            <Wordmark />
          </span>
          <span>{t("landing.footerRights")}</span>
          <span>{t("landing.footerAccess")}</span>
        </div>
      </footer>
    </div>
  );
}
