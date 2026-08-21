// @ts-nocheck
// The Jungle Table — cinematic scroll-scrub engine.
//
// This is intentionally imperative (getElementById / querySelectorAll)
// rather than idiomatic React state, ported from the original standalone
// artifact build. It is scoped to run once per mount of <CinematicHome/>,
// and everything it wires up (global listeners, GSAP tickers, ScrollTrigger
// instances, the Lenis instance) is torn down by the returned cleanup
// function so remounting (client-side navigation away and back) never
// stacks up duplicate listeners.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const SRC: Record<string, string> = {
  logo: "/images/logo.png",
  berempah: "/images/cinematic/nasi-lemak-ayam-berempah.webp",
  rendangAyam: "/images/cinematic/ayam-rendang.webp",
  masakMerah: "/images/cinematic/nasi-ayam-masak-merah.webp",
  ayamCiliPadi: "/images/cinematic/nasi-ayam-masak-lemak-cili-padi.webp",
  kariAyam: "/images/cinematic/nasi-kari-ayam.webp",
  rendangDaging: "/images/cinematic/daging-rendang.webp",
  dagingHitam: "/images/cinematic/nasi-daging-masak-hitam.webp",
  dagingCiliPadi: "/images/cinematic/nasi-daging-masak-lemak-cili-padi.webp",
  ikanTenggiri: "/images/cinematic/nasi-ikan-tenggiri-asam-pedas.webp",
  croissant: "/images/cinematic/butter-croissant.webp",
  danish: "/images/cinematic/chocolate-roll-danish.webp",
  muffinChoc: "/images/cinematic/double-chocolate-muffin.webp",
  donut: "/images/cinematic/chocolate-donut.webp",
  muffinButterscotch: "/images/cinematic/butter-scotch-muffin.webp",
  combo: "/images/cinematic/combo-special.webp",
};

const CRITICAL = ["logo", "berempah", "rendangAyam", "kariAyam", "ikanTenggiri", "rendangDaging", "combo"];
const REST = Object.keys(SRC).filter((k) => CRITICAL.indexOf(k) === -1);
const SECTIONS = ["hero", "spec-01", "spec-02", "spec-03", "assembly", "build", "climax"];

function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, dx: number, dy: number, dw: number, dh: number) {
  if (!img) return;
  const ir = img.width / img.height;
  const cr = dw / dh;
  let sx, sy, sw, sh;
  if (ir > cr) { sh = img.height; sw = sh * cr; sx = (img.width - sw) / 2; sy = 0; }
  else { sw = img.width; sh = sw / cr; sx = 0; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

class Scrub {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  keys: string[];
  progress: number;
  pad: number;
  dpr: number;
  loaded: Record<string, HTMLImageElement>;
  private _resize: () => void;

  constructor(canvasId: string, keys: string[], loaded: Record<string, HTMLImageElement>, opts?: { pad?: number }) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.keys = keys;
    this.progress = 0;
    this.pad = opts?.pad || 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.loaded = loaded;
    this._resize = this.resize.bind(this);
    if (this.canvas) {
      this.resize();
      window.addEventListener("resize", this._resize);
    }
  }
  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * this.dpr));
    this.render();
  }
  set(p: number) {
    this.progress = Math.max(0, Math.min(1, p));
    this.render();
  }
  render() {
    if (!this.ctx || !this.canvas) return;
    const imgs = this.keys.map((k) => this.loaded[k]).filter(Boolean);
    if (!imgs.length) return;
    const cw = this.canvas.width, ch = this.canvas.height;
    this.ctx.clearRect(0, 0, cw, ch);
    const padX = cw * this.pad, padY = ch * this.pad;
    const dx = padX, dy = padY, dw = cw - padX * 2, dh = ch - padY * 2;
    const pos = this.progress * (imgs.length - 1);
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = imgs[idx];
    const b = imgs[Math.min(idx + 1, imgs.length - 1)];
    const scaleA = 1 + 0.05 * frac;
    const cx = dx + dw / 2, cy = dy + dh / 2;
    this.ctx.save();
    this.ctx.translate(cx, cy); this.ctx.scale(scaleA, scaleA); this.ctx.translate(-cx, -cy);
    coverDraw(this.ctx, a, dx, dy, dw, dh);
    this.ctx.restore();
    if (frac > 0.002) {
      this.ctx.save();
      this.ctx.globalAlpha = frac;
      coverDraw(this.ctx, b, dx, dy, dw, dh);
      this.ctx.restore();
    }
  }
  destroy() {
    window.removeEventListener("resize", this._resize);
  }
}

export function initJungleTable(root: HTMLElement): () => void {
  const cleanupFns: Array<() => void> = [];
  const on = (target: EventTarget, type: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    cleanupFns.push(() => target.removeEventListener(type, fn, opts));
  };

  const REDUCED = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const q = <T extends Element>(sel: string) => root.querySelector(sel) as T | null;
  const qa = <T extends Element>(sel: string) => Array.from(root.querySelectorAll(sel)) as T[];

  /* ---------------- image preload ---------------- */
  const LOADED: Record<string, HTMLImageElement> = {};
  function loadImage(key: string) {
    return new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (img.decode) {
          img.decode().then(() => { LOADED[key] = img; resolve(img); }).catch(() => { LOADED[key] = img; resolve(img); });
        } else {
          LOADED[key] = img; resolve(img);
        }
      };
      img.onerror = () => resolve(null);
      img.src = SRC[key];
    });
  }

  const pctEl = q<HTMLElement>("#loader-pct");
  const barEl = q<HTMLElement>("#loader-bar");
  const labelEl = q<HTMLElement>("#loader-label");
  const loaderEl = q<HTMLElement>("#loader");

  let loadedCount = 0;
  const totalCount = CRITICAL.length;
  function bump() {
    loadedCount++;
    const pct = Math.round((loadedCount / totalCount) * 100);
    if (pctEl) pctEl.textContent = String(pct).padStart(2, "0");
    if (barEl) barEl.style.width = pct + "%";
  }

  let cancelled = false;
  const loaderTimeouts: number[] = [];

  Promise.all(CRITICAL.map((k) => loadImage(k).then(bump))).then(() => {
    if (cancelled) return;
    if (labelEl) labelEl.textContent = "Ready";
    const t1 = window.setTimeout(() => {
      if (cancelled || !loaderEl) return;
      loaderEl.style.transition = "opacity .8s ease";
      loaderEl.style.opacity = "0";
      const t2 = window.setTimeout(() => {
        if (cancelled) return;
        loaderEl.style.display = "none";
        startExperience();
      }, 820);
      loaderTimeouts.push(t2);
    }, 220);
    loaderTimeouts.push(t1);
    REST.forEach((k) => loadImage(k));
  });
  cleanupFns.push(() => {
    cancelled = true;
    loaderTimeouts.forEach((t) => window.clearTimeout(t));
  });

  /* ---------------- lenis + gsap ---------------- */
  gsap.registerPlugin(ScrollTrigger);
  let lenis: Lenis | null = null;
  let raf: ((time: number) => void) | null = null;
  // The rest of the app relies on the CSS `scroll-behavior: smooth` set on
  // <html> globally; that fights Lenis's own smoothing (double-smoothed,
  // janky scroll-to calls), so swap it out for the duration of this page.
  const prevScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  cleanupFns.push(() => { document.documentElement.style.scrollBehavior = prevScrollBehavior; });
  if (!REDUCED) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);
    raf = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToId(id: string) {
    const el = document.querySelector(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth" });
  }

  /* ---------------- nav ---------------- */
  const nav = q<HTMLElement>("#nav");
  const burger = q<HTMLElement>("#burger");
  const mobileMenu = q<HTMLElement>("#mobile-menu");
  let mmOpen = false;

  const navSolidTrigger = ScrollTrigger.create({
    start: 80, end: 99999,
    onUpdate: (self) => nav?.classList.toggle("solid", self.scroll() > 80),
  });

  qa<HTMLAnchorElement>("[data-nav],[data-nav-m]").forEach((a) => {
    const handler = (e: Event) => {
      e.preventDefault();
      closeMobile();
      scrollToId(a.getAttribute("href") || "");
    };
    a.addEventListener("click", handler);
    cleanupFns.push(() => a.removeEventListener("click", handler));
  });

  function openMobile() {
    if (!nav || !burger || !mobileMenu) return;
    mmOpen = true; nav.classList.add("open"); burger.setAttribute("aria-expanded", "true");
    mobileMenu.style.visibility = "visible";
    gsap.to(mobileMenu, { yPercent: 100, duration: .55, ease: "power3.out" });
    gsap.fromTo(mobileMenu.querySelectorAll("a,.u-label"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, stagger: .05, delay: .15 });
  }
  function closeMobile() {
    if (!mmOpen || !nav || !burger || !mobileMenu) return;
    mmOpen = false; nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
    gsap.to(mobileMenu, { yPercent: 0, duration: .45, ease: "power3.in", onComplete: () => { mobileMenu.style.visibility = "hidden"; } });
  }
  if (mobileMenu) {
    mobileMenu.style.transform = "translateY(-100%)";
    gsap.set(mobileMenu, { yPercent: 0 });
  }
  if (burger) {
    const burgerHandler = () => (mmOpen ? closeMobile() : openMobile());
    burger.addEventListener("click", burgerHandler);
    cleanupFns.push(() => burger.removeEventListener("click", burgerHandler));
  }

  /* ---------------- scroll rail ---------------- */
  const railEl = q<HTMLElement>("#rail");
  const railFill = q<HTMLElement>("#rail-fill");
  const railIdx = q<HTMLElement>("#rail-idx");

  const scrubs: Scrub[] = [];

  function startExperience() {
    railEl?.classList.add("show");

    const scrubHero = new Scrub("cv-hero", ["berempah", "rendangAyam", "kariAyam", "ikanTenggiri", "rendangDaging", "combo"], LOADED, { pad: 0.14 });
    const scrubSpec1 = new Scrub("cv-spec1", ["ayamCiliPadi", "dagingCiliPadi", "ikanTenggiri"], LOADED);
    const scrubSpec2 = new Scrub("cv-spec2", ["rendangAyam", "rendangDaging", "masakMerah"], LOADED);
    const scrubSpec3 = new Scrub("cv-spec3", ["croissant", "danish", "muffinChoc", "donut", "muffinButterscotch"], LOADED);
    const scrubClimax = new Scrub("cv-climax", ["combo", "rendangAyam", "kariAyam", "dagingHitam", "berempah"], LOADED);
    scrubs.push(scrubHero, scrubSpec1, scrubSpec2, scrubSpec3, scrubClimax);

    if (REDUCED) {
      scrubs.forEach((s) => { if (s.canvas) s.canvas.style.display = "none"; });
      gsap.set("#hero h1 .line span, #hero .sub, #hero .hero-meta, #hero .eyebrow, #hero .scrollcue", { opacity: 1, y: 0 });
      gsap.set(".chip", { opacity: 1 });
      initConfigurator();
      return;
    }

    function pad(n: number) { return String(n).padStart(2, "0"); }
    const sectionEls = SECTIONS.map((id) => document.getElementById(id));
    const navIds = ["hero", "specs", "build", "visit"];
    const navEls = navIds.map((id) => document.getElementById(id));
    const navLinks = navIds.map((id) => root.querySelector(`#nav .links a[href="#${id}"]`));

    function updateActiveMarkers() {
      const centerY = window.innerHeight / 2;
      let activeSectionIdx = 0;
      for (let i = 0; i < sectionEls.length; i++) {
        const el = sectionEls[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= centerY) activeSectionIdx = i;
      }
      if (railIdx) railIdx.textContent = `${pad(activeSectionIdx + 1)} / ${pad(SECTIONS.length)}`;

      let activeNavIdx = -1;
      for (let j = 0; j < navEls.length; j++) {
        const nel = navEls[j];
        if (!nel) continue;
        const nr = nel.getBoundingClientRect();
        if (nr.top <= centerY && nr.bottom >= centerY) activeNavIdx = j;
      }
      navLinks.forEach((link, k) => link?.classList.toggle("active", k === activeNavIdx));
    }

    function railAndMarkers() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const prog = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (railFill) railFill.style.height = prog * 100 + "%";
      updateActiveMarkers();
    }
    on(window, "scroll", railAndMarkers, { passive: true });
    railAndMarkers();

    /* ================= HERO ================= */
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero", start: "top top", end: "+=180%", scrub: .6, pin: true, anticipatePin: 1,
        onUpdate: (self) => scrubHero.set(self.progress),
      },
    });
    heroTl.to("#hero .eyebrow", { opacity: 1, y: 0, duration: .5 }, 0.02)
      .to("#hero h1 .line:nth-child(1) span", { y: "0%", duration: .5, ease: "power3.out" }, 0.06)
      .to("#hero h1 .line:nth-child(2) span", { y: "0%", duration: .5, ease: "power3.out" }, 0.12)
      .to("#hero h1 .line:nth-child(3) span", { y: "0%", duration: .5, ease: "power3.out" }, 0.18)
      .to("#hero .sub", { opacity: 1, y: 0, duration: .5 }, 0.24)
      .to("#hero .hero-meta", { opacity: 1, y: 0, duration: .5 }, 0.30)
      .to("#hero .scrollcue", { opacity: 1, duration: .4 }, 0.10)
      .to("#hero .scrollcue", { opacity: 0, duration: .3 }, 0.55)
      .to("#hero h1, #hero .sub, #hero .hero-meta, #hero .eyebrow", { opacity: 0, y: -40, duration: .4 }, 0.82);

    /* ================= SPEC SECTIONS ================= */
    function specSection(id: string, scrub: Scrub, statEl: HTMLElement | null, from: number, to: number, decimals: number) {
      if (!statEl) return;
      gsap.timeline({
        scrollTrigger: {
          trigger: "#" + id, start: "top top", end: "+=120%", scrub: .6, pin: true, anticipatePin: 1,
          onUpdate: (self) => {
            scrub.set(self.progress);
            const val = gsap.utils.interpolate(from, to, Math.min(1, self.progress * 1.3));
            const text = decimals ? val.toFixed(decimals) : String(Math.round(val));
            if (statEl.childNodes[0]) statEl.childNodes[0].nodeValue = text;
          },
        },
      })
        .from("#" + id + " .u-label", { opacity: 0, y: 16, duration: .4 }, 0)
        .from("#" + id + " h2", { opacity: 0, y: 24, duration: .5 }, 0.05)
        .from("#" + id + " p", { opacity: 0, y: 16, duration: .5 }, 0.12)
        .from("#" + id + " .stat", { opacity: 0, y: 16, duration: .5 }, 0.15);
    }
    specSection("spec-01", scrubSpec1, document.getElementById("stat-spec1"), 2, 5, 0);
    specSection("spec-02", scrubSpec2, document.getElementById("stat-spec2"), 45, 180, 0);
    specSection("spec-03", scrubSpec3, document.getElementById("stat-spec3"), 5, 8, 0);

    /* ================= ASSEMBLY ================= */
    gsap.timeline({
      scrollTrigger: { trigger: "#assembly", start: "top top", end: "+=140%", scrub: .6, pin: true, anticipatePin: 1 },
    })
      .from("#assembly .heading span", { opacity: 0, y: 26, stagger: .08, duration: .5 }, 0)
      .fromTo("#chip-1", { opacity: 0, x: -120, y: -60, rotate: -18, scale: .6 }, { opacity: 1, x: 0, y: 0, rotate: -6, scale: 1, duration: .6 }, .15)
      .fromTo("#chip-2", { opacity: 0, x: 120, y: -70, rotate: 16, scale: .6 }, { opacity: 1, x: 0, y: 0, rotate: 7, scale: 1, duration: .6 }, .28)
      .fromTo("#chip-3", { opacity: 0, x: -110, y: 80, rotate: -14, scale: .6 }, { opacity: 1, x: 0, y: 0, rotate: -5, scale: 1, duration: .6 }, .41)
      .fromTo("#chip-4", { opacity: 0, x: 110, y: 70, rotate: 14, scale: .6 }, { opacity: 1, x: 0, y: 0, rotate: 6, scale: 1, duration: .6 }, .54)
      .to(".base-plate", { scale: 1.03, duration: .4 }, .7)
      .to(".base-plate", { scale: 1, duration: .4 }, .9);

    /* ================= CLIMAX ================= */
    gsap.timeline({
      scrollTrigger: {
        trigger: "#climax", start: "top top", end: "+=160%", scrub: .6, pin: true, anticipatePin: 1,
        onUpdate: (self) => scrubClimax.set(self.progress),
      },
    })
      .from("#climax .u-label", { opacity: 0, y: 16, duration: .4 }, 0.05)
      .from("#climax h2", { opacity: 0, scale: .92, filter: "blur(6px)", duration: .6 }, 0.12)
      .from("#climax p", { opacity: 0, y: 16, duration: .5 }, 0.3)
      .to("#climax .stage-content", { opacity: 1, duration: .2 }, .8);

    ScrollTrigger.refresh();
    initConfigurator();
  }

  /* ---------------- configurator ---------------- */
  function initConfigurator() {
    const state: { protein: string; spice: string; extras: Record<string, boolean> } = { protein: "berempah", spice: "original", extras: {} };
    const PROTEIN_LABEL: Record<string, string> = { berempah: "Ayam Berempah", rendang: "Ayam Rendang", daging: "Daging Rendang", ikan: "Ikan Tenggiri Asam Pedas" };
    const SPICE_LABEL: Record<string, string> = { original: "Original Sambal", mild: "Mild", extra: "Extra Cili Padi" };
    const EXTRA_LABEL: Record<string, string> = { egg: "Fried Egg", anchovy: "Extra Anchovies", papadom: "Papadom" };

    function fmt(n: number) { return "RM" + n.toFixed(2); }

    function render() {
      qa<HTMLImageElement>(".cfg-frame img").forEach((img) => {
        img.classList.toggle("active", img.getAttribute("data-key") === state.protein);
      });
      const proteinBtn = root.querySelector(`.opt[data-group="protein"][data-key="${state.protein}"]`);
      const proteinPrice = parseFloat(proteinBtn?.getAttribute("data-price") || "0");
      const spiceBtn = root.querySelector(`.opt[data-group="spice"][data-key="${state.spice}"]`);
      const spicePrice = parseFloat(spiceBtn?.getAttribute("data-price") || "0");

      let extraTotal = 0;
      const extraNames: string[] = [];
      Object.keys(state.extras).forEach((k) => {
        if (state.extras[k]) {
          const btn = root.querySelector(`.opt[data-group="extra"][data-key="${k}"]`);
          extraTotal += parseFloat(btn?.getAttribute("data-price") || "0");
          extraNames.push(EXTRA_LABEL[k]);
        }
      });

      const total = proteinPrice + spicePrice + extraTotal;
      const set = (id: string, text: string) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      set("cfg-amt", fmt(total));
      set("sum-protein", PROTEIN_LABEL[state.protein]);
      set("sum-protein-p", fmt(proteinPrice));
      set("sum-spice", SPICE_LABEL[state.spice]);
      set("sum-spice-p", spicePrice > 0 ? "+" + fmt(spicePrice) : "Included");
      const extraRow = document.getElementById("sum-extra-row");
      if (extraNames.length) {
        if (extraRow) extraRow.style.display = "flex";
        set("sum-extra", extraNames.join(", "));
        set("sum-extra-p", "+" + fmt(extraTotal));
      } else if (extraRow) {
        extraRow.style.display = "none";
      }
      set("sum-total", fmt(total));

      qa<HTMLButtonElement>(".opt").forEach((btn) => {
        const group = btn.getAttribute("data-group") || "";
        const key = btn.getAttribute("data-key") || "";
        if (group === "extra") btn.classList.toggle("selected", !!state.extras[key]);
        else btn.classList.toggle("selected", (state as any)[group] === key);
      });
    }

    qa<HTMLButtonElement>(".opt").forEach((btn) => {
      const handler = () => {
        const group = btn.getAttribute("data-group") || "";
        const key = btn.getAttribute("data-key") || "";
        if (group === "extra") state.extras[key] = !state.extras[key];
        else (state as any)[group] = key;
        render();
      };
      btn.addEventListener("click", handler);
      cleanupFns.push(() => btn.removeEventListener("click", handler));
    });

    const resetBtn = document.getElementById("cfg-reset");
    if (resetBtn) {
      const resetHandler = () => {
        state.protein = "berempah"; state.spice = "original"; state.extras = {};
        render();
      };
      resetBtn.addEventListener("click", resetHandler);
      cleanupFns.push(() => resetBtn.removeEventListener("click", resetHandler));
    }

    render();

    if (!REDUCED) {
      gsap.from("#configurator .cfg-head, #configurator .cfg-visual, #configurator .cfg-group", {
        scrollTrigger: { trigger: "#configurator", start: "top 75%" },
        opacity: 0, y: 30, stagger: .08, duration: .6, ease: "power2.out",
      });
    }
  }

  /* ---------------- custom cursor: D'Amazon toucan, dives on scroll ---------------- */
  const cursorEl = document.getElementById("jt-cursor");
  const cursorWrap = cursorEl?.querySelector<HTMLElement>(".wrap") || null;
  const cursorTrail = cursorEl?.querySelector<HTMLElement>(".trail") || null;
  const finePointer = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!REDUCED && finePointer && cursorEl && cursorWrap) {
    root.classList.add("has-custom-cursor");

    const setX = gsap.quickTo(cursorEl, "x", { duration: 0.35, ease: "power3" });
    const setY = gsap.quickTo(cursorEl, "y", { duration: 0.45, ease: "power3" });
    const setRot = gsap.quickTo(cursorWrap, "rotation", { duration: 0.55, ease: "power2.out" });
    const setScaleY = gsap.quickTo(cursorWrap, "scaleY", { duration: 0.4, ease: "power2.out" });
    const setTrail = cursorTrail ? gsap.quickTo(cursorTrail, "scaleY", { duration: 0.3, ease: "power2.out" }) : null;

    let shown = false;
    const onMove = (e: PointerEvent) => {
      setX(e.clientX);
      setY(e.clientY);
      if (!shown) { shown = true; cursorEl.classList.add("show"); }
    };
    on(window, "pointermove", onMove as EventListener);

    let lastY = window.scrollY;
    let idleTimer: number | null = null;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      const dive = Math.max(-1, Math.min(1, delta / 40));
      setRot(dive * 34);
      setScaleY(1 - Math.abs(dive) * 0.16);
      setTrail?.(Math.min(1, Math.abs(delta) / 26));
      cursorEl.classList.toggle("diving", Math.abs(delta) > 2);
      if (idleTimer) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setRot(0);
        setScaleY(1);
        cursorEl.classList.remove("diving");
      }, 220);
    };
    on(window, "scroll", onScroll, { passive: true });
    cleanupFns.push(() => { if (idleTimer) window.clearTimeout(idleTimer); });

    const hoverables = qa<HTMLElement>('a, button, .opt, [data-nav], [data-nav-m]');
    hoverables.forEach((el) => {
      const enter = () => cursorEl.classList.add("pointer");
      const leave = () => cursorEl.classList.remove("pointer");
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      cleanupFns.push(() => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    });

    cleanupFns.push(() => root.classList.remove("has-custom-cursor"));
  }

  /* ---------------- teardown ---------------- */
  return function teardown() {
    cleanupFns.forEach((fn) => fn());
    scrubs.forEach((s) => s.destroy());
    navSolidTrigger.kill();
    ScrollTrigger.getAll().forEach((st) => st.kill());
    if (raf) gsap.ticker.remove(raf);
    lenis?.destroy();
  };
}
