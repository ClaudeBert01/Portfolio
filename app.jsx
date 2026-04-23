const { useState, useMemo, useEffect, useCallback } = React;

const CATEGORIES = ["All", "Trailer", "Teaser", "Recap", "Episodic", "Experimental"];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "thumbSize": "large",
  "showDivider": true,
  "metaGap": 18
} /*EDITMODE-END*/;

function ytThumb(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function Header({ active, onSelect }) {
  return (
    <header className="site-header" style={{ backgroundColor: "rgb(255, 255, 255)", borderColor: "rgb(0, 0, 0)" }}>
      <a
        className="sig"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelect("All");
          window.scrollTo({ top: 0 });
        }}
        aria-label="Home">
        <img src="assets/signature.png" alt="Signature" style={{ objectFit: "contain", height: "129px", width: "176px", padding: "24px 0px 0px" }} />
      </a>
      <nav className="tabs" style={{ color: "rgb(0, 0, 0)", fontWeight: "400", fontSize: "14px", gap: "23px" }}>
        {CATEGORIES.map((c) =>
          <button
            key={c}
            className={"tab" + (active === c ? " active" : "")}
            onClick={() => onSelect(c)}
            style={{ color: active === c ? undefined : "rgb(59, 95, 182)" }}>
            {c.toUpperCase()}
          </button>
        )}
      </nav>
    </header>
  );
}

function Thumb({ work, onOpen, showDivider }) {
  const src = work.thumbnail || ytThumb(work.youtubeId);
  return (
    <article className="card" onClick={() => onOpen(work)}>
      <div className="thumb">
        <img src={src} alt={work.title} loading="lazy" />
        <div className="hover">
          <span className="play-badge">PLAY</span>
        </div>
      </div>
      <div className={"meta" + (showDivider ? "" : " no-divider")}>
        <h3 className="title">
          <span style={{ fontSize: "13px" }}>{work.title}</span>
          <svg
            className="arrow"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true">
            <path
              d="M3 11L11 3M11 3H4.5M11 3V9.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="square" />
          </svg>
        </h3>
        <div className="type">{work.category.toUpperCase()}</div>
      </div>
    </article>
  );
}

function Grid({ works, onOpen, showDivider }) {
  if (!works.length) {
    return <div className="empty">No work in this category yet.</div>;
  }
  return (
    <div className="grid">
      {works.map((w) =>
        <Thumb key={w.id} work={w} onOpen={onOpen} showDivider={showDivider} />
      )}
    </div>
  );
}

function Footer({ contact }) {
  return (
    <footer className="site-footer" style={{ borderColor: "rgb(0, 0, 0)" }}>
      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
        LINKEDIN
      </a>
    </footer>
  );
}

function VideoModal({ works, index, onClose, onPrev, onNext }) {
  const work = works[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  if (!work) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M4 4L18 18M18 4L4 18"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="square" />
        </svg>
      </button>

      <button
        className="modal-nav prev"
        onClick={onPrev}
        aria-label="Previous video">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M13 3L6 10L13 17"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="square"
            strokeLinejoin="miter" />
        </svg>
      </button>
      <button className="modal-nav next" onClick={onNext} aria-label="Next video">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M7 3L14 10L7 17"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="square"
            strokeLinejoin="miter" />
        </svg>
      </button>

      <div className="modal-inner">
        <div className="video-wrap">
          <iframe
            key={work.id}
            src={`https://www.youtube.com/embed/${work.youtubeId}?rel=0&modestbranding=1`}
            title={work.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen />
        </div>
        <div className="modal-meta">
          <h2 className="modal-title">{work.title}</h2>
          <div className="modal-type">{work.category.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const works = window.PORTFOLIO_WORKS;
  const contact = window.PORTFOLIO_CONTACT;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useState("All");
  const [openIdx, setOpenIdx] = useState(-1);

  const sizeMap = {
    small: { cols: 4, maxW: 1200 },
    medium: { cols: 3, maxW: 1200 },
    large: { cols: 3, maxW: 1500 },
    xlarge: { cols: 2, maxW: 1440 }
  };
  const sz = sizeMap[t.thumbSize] || sizeMap.large;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--grid-cols", sz.cols);
    root.style.setProperty("--max-w", sz.maxW + "px");
    root.style.setProperty("--meta-pad", t.metaGap + "px");
  }, [sz.cols, sz.maxW, t.metaGap]);

  const filtered = useMemo(
    () => active === "All" ? works : works.filter((w) => w.category === active),
    [active, works]
  );

  const openWork = useCallback(
    (work) => {
      const idx = filtered.findIndex((w) => w.id === work.id);
      setOpenIdx(idx);
    },
    [filtered]
  );

  const closeModal = useCallback(() => setOpenIdx(-1), []);
  const prev = useCallback(
    () => setOpenIdx((i) => (i - 1 + filtered.length) % filtered.length),
    [filtered.length]
  );
  const next = useCallback(
    () => setOpenIdx((i) => (i + 1) % filtered.length),
    [filtered.length]
  );

  useEffect(() => {
    if (openIdx >= filtered.length) setOpenIdx(-1);
  }, [filtered, openIdx]);

  return (
    <div className="app">
      <Header active={active} onSelect={setActive} />
      <main className="content">
        <Grid works={filtered} onOpen={openWork} showDivider={t.showDivider} />
      </main>
      <Footer contact={contact} />
      {openIdx >= 0 &&
        <VideoModal
          works={filtered}
          index={openIdx}
          onClose={closeModal}
          onPrev={prev}
          onNext={next} />
      }
      <TweaksPanel title="Tweaks">
        <TweakSection label="Thumbnails" />
        <TweakRadio
          label="Size"
          value={t.thumbSize}
          options={["small", "medium", "large", "xlarge"]}
          onChange={(v) => setTweak("thumbSize", v)} />
        <TweakSection label="Meta" />
        <TweakToggle
          label="Divider line"
          value={t.showDivider}
          onChange={(v) => setTweak("showDivider", v)} />
        <TweakSlider
          label="Spacing"
          value={t.metaGap}
          min={8}
          max={32}
          unit="px"
          onChange={(v) => setTweak("metaGap", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
