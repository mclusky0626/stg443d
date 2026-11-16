import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { createStage } from './three/stage.js';
import { LABELS, DIMS } from './three/parts.js';
import { HERO, CHAPTERS, ROUNDS, SPECS, LEGACY, OUTRO, NAV, WORDS, SIDES, CREDIT } from './content.js';

function Head({ no, kicker, title, lede, id }) {
  return (
    <header className="head">
      <p className="kicker">
        <span>{no}</span>
        {kicker}
      </p>
      <h2 id={`${id}-title`}>{title}</h2>
      <p className="lede">{lede}</p>
    </header>
  );
}

function Facts({ rows, label }) {
  return (
    <dl className="facts" aria-label={label}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

// Three cartridges in profile, drawn from their real dimensions at one scale.
function roundShape(r) {
  const hb = r.base / 2, hn = r.neck / 2, hu = r.bullet / 2, c = r.case, n = r.total - r.case;
  const body = r.shoulder
    ? `M0 ${-hb}L${r.shoulder[0]} ${-r.shoulder[1] / 2}L${r.shoulder[2]} ${-hn}L${c} ${-hn}L${c} ${hn}L${r.shoulder[2]} ${hn}L${r.shoulder[0]} ${r.shoulder[1] / 2}L0 ${hb}Z`
    : `M0 ${-hb}L${c} ${-hn}L${c} ${hn}L0 ${hb}Z`;
  const bullet = r.nose === 'round'
    ? `M${c} ${-hu}L${c + n * 0.3} ${-hu}Q${r.total} ${-hu} ${r.total} 0Q${r.total} ${hu} ${c + n * 0.3} ${hu}L${c} ${hu}Z`
    : `M${c} ${-hu}L${c + n * 0.2} ${-hu}Q${c + n * 0.72} ${-hu * 0.86} ${r.total} 0Q${c + n * 0.72} ${hu * 0.86} ${c + n * 0.2} ${hu}L${c} ${hu}Z`;
  return { body, bullet };
}

function Rounds() {
  const top = Math.max(...ROUNDS.map((r) => r.energy));
  return (
    <figure className="rounds">
      <figcaption>Three cartridges, drawn to the same scale</figcaption>
      {ROUNDS.map((r) => {
        const { body, bullet } = roundShape(r);
        return (
          <div key={r.id} className={`round${r.hero ? ' is-hero' : ''}`}>
            <svg viewBox="-0.6 -6.6 82 13.2" role="img" aria-label={`${r.name} cartridge, ${r.total} millimetres long`}>
              <path className={`round__case${r.steel ? ' is-steel' : ''}`} d={body} />
              <path className="round__groove" d={`M1.5 ${-r.base / 2}V${r.base / 2}`} />
              <path className="round__bullet" d={bullet} />
            </svg>
            <p className="round__name">
              <b>{r.name}</b>
              <span>{r.use}</span>
            </p>
            <p className="round__data">
              <span>
                {r.mass} · {r.speed}
              </span>
              <i style={{ '--e': r.energy / top }} />
              <b>{r.energy.toLocaleString('en-GB')} J</b>
            </p>
          </div>
        );
      })}
    </figure>
  );
}

// The touch: the visitor works the rifle's own controls.
function Controls({ stage, active }) {
  const [safe, setSafe] = useState(false);
  const [auto, setAuto] = useState(false);
  const [range, setRange] = useState(100);
  const [magOut, setMagOut] = useState(false);
  const [note, setNote] = useState('Safety off, selector at E, a full magazine fitted.');

  useEffect(() => {
    stage.current?.set({ safe: safe ? 1 : 0, sel: auto ? 1 : 0, sight: (range - 100) / 700, mag: active && magOut ? 1 : 0 });
  }, [stage, safe, auto, range, magOut, active]);

  const trigger = () => {
    if (safe) return setNote('Safe. The trigger is blocked.');
    stage.current?.pull();
    if (magOut) return setNote('No magazine. The hammer falls on an empty chamber.');
    if (auto) {
      stage.current?.cycle(3, 0.11);
      return setNote('Three rounds in a third of a second. Held down, it would empty the magazine in about three seconds.');
    }
    stage.current?.cycle(1, 0.24);
    return setNote('One shot. The trigger has to be let go before the next.');
  };
  const cock = () => {
    stage.current?.cycle(1, 0.95);
    setNote(magOut ? 'With no magazine the bolt closes on an empty chamber.' : 'Handle back and let go: the bolt takes a round off the magazine and locks.');
  };
  const magazine = () => {
    stage.current?.press();
    setMagOut((v) => !v);
    setNote(magOut ? 'Magazine in, rocked up until the catch clicks.' : 'Catch pressed. The magazine draws straight out.');
  };

  return (
    <div className="panel">
      <div className="panel__row">
        <span className="panel__label">Safety</span>
        <div className="seg" role="group" aria-label="Safety">
          <button type="button" aria-pressed={safe} onClick={() => { setSafe(true); setNote('Lever up: safe.'); }}>
            <b>S</b> Safe
          </button>
          <button type="button" aria-pressed={!safe} onClick={() => { setSafe(false); setNote('Lever down: ready to fire.'); }}>
            <b>F</b> Fire
          </button>
        </div>
      </div>
      <div className="panel__row">
        <span className="panel__label">Selector</span>
        <div className="seg" role="group" aria-label="Fire selector">
          <button type="button" aria-pressed={!auto} onClick={() => { setAuto(false); setNote('E stands proud on the left: single shots.'); }}>
            <b>E</b> Single
          </button>
          <button type="button" aria-pressed={auto} onClick={() => { setAuto(true); setNote('Pushed through to D: automatic fire.'); }}>
            <b>D</b> Automatic
          </button>
        </div>
      </div>
      <div className="panel__row">
        <label className="panel__label" htmlFor="sight-range">
          Rear sight
        </label>
        <div className="slider">
          <input id="sight-range" type="range" min="100" max="800" step="100" value={range} onChange={(e) => { setRange(Number(e.target.value)); setNote('The slider runs up the ramp and lifts the leaf.'); }} />
          <output htmlFor="sight-range">{range} m</output>
        </div>
      </div>
      <div className="panel__acts">
        <button type="button" onClick={cock}>
          Cock it
        </button>
        <button type="button" onClick={trigger}>
          Squeeze the trigger
        </button>
        <button type="button" onClick={magazine}>
          {magOut ? 'Fit the magazine' : 'Release the magazine'}
        </button>
      </div>
      <p className="panel__note" role="status">
        {note}
      </p>
    </div>
  );
}

export default function App() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const lenisRef = useRef(null);
  const [chapter, setChapter] = useState('hero');
  const [status, setStatus] = useState('loading'); // loading | ready | failed
  const [loaded, setLoaded] = useState(0);
  const [strip, setStrip] = useState(0);
  const [clean, setClean] = useState(false);
  const [auto, setAuto] = useState(false);
  const [poster, setPoster] = useState(() => window.scrollY < 60);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // smooth wheel scrolling on desktop; touch scrolling stays native
    const lenis = reduced ? null : new Lenis({ autoRaf: false, lerp: 0.1, wheelMultiplier: 0.85 });
    lenisRef.current = lenis;

    const stage = createStage({
      canvas: canvasRef.current,
      lenis,
      reducedMotion: reduced,
      onChapter: (id) => id && setChapter(id),
      onLoad: setLoaded,
      onReady: () => setStatus('ready'),
      onFail: () => setStatus('failed'),
    });
    stageRef.current = stage;
    if (import.meta.env.DEV) { window.__stage = stage; window.__lenis = lenis; }

    let raf = 0;
    if (!stage && lenis) {
      const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      stage?.dispose();
      lenis?.destroy();
    };
  }, []);

  const goTo = useCallback((id) => {
    const el = document.getElementById(`${id}-title`) || document.getElementById(id);
    if (!el) return;
    const offset = id === 'hero' ? 0 : -window.innerHeight * 0.22;
    if (lenisRef.current) lenisRef.current.scrollTo(id === 'hero' ? 0 : el, { offset, duration: 1.6 });
    else window.scrollTo({ top: id === 'hero' ? 0 : el.getBoundingClientRect().top + window.scrollY + offset });
  }, []);

  // filming aids: C hides the interface, A scrolls the whole page on rails
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'c' || e.key === 'C') setClean((v) => !v);
      if (e.key === 'a' || e.key === 'A') setAuto((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis || !auto) return undefined;
    const end = document.documentElement.scrollHeight - window.innerHeight;
    const left = Math.max(0, end - window.scrollY);
    lenis.scrollTo(end, { duration: Math.max(4, left / 190), easing: (t) => t, onComplete: () => setAuto(false) });
    const stop = () => setAuto(false);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('pointerdown', stop);
    return () => {
      window.removeEventListener('wheel', stop);
      window.removeEventListener('pointerdown', stop);
      lenis.scrollTo(window.scrollY, { immediate: true });
    };
  }, [auto]);

  // the outro's slider strips the rifle; it lets go when you scroll away
  useEffect(() => {
    stageRef.current?.set({ strip: chapter === 'outro' ? strip : 0 });
  }, [strip, chapter, status]);

  useEffect(() => {
    document.body.dataset.side = SIDES[chapter] || 'none';
    document.body.dataset.chapter = chapter;
  }, [chapter]);

  useEffect(() => {
    document.body.classList.toggle('is-clean', clean);
  }, [clean]);

  const words = [...new Set(Object.values(WORDS))];

  return (
    <>
      {/* the page colour is the backdrop; the canvas above it is transparent */}
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop__glow" />
        {words.map((w) => (
          <span key={w} className={`backdrop__word${WORDS[chapter] === w ? ' is-on' : ''}`} data-len={w.length > 5 ? 'long' : 'short'}>
            {w}
          </span>
        ))}
      </div>

      <canvas ref={canvasRef} className={`stage${status === 'ready' ? ' is-ready' : ''}`} aria-label="Interactive 3D model of a Sturmgewehr 44 rifle. Drag to turn it." />
      {poster && (
        <img
          className={`poster${status === 'ready' ? ' is-gone' : ''}`}
          src={`${import.meta.env.BASE_URL}poster.webp`}
          alt="A Sturmgewehr 44 seen from the front right"
          onError={() => setPoster(false)}
          onTransitionEnd={() => status === 'ready' && setPoster(false)}
        />
      )}

      <div className="scrim scrim--l" aria-hidden="true" />
      <div className="scrim scrim--r" aria-hidden="true" />

      <div className="dims" aria-hidden="true">
        {DIMS.map((d, i) => (
          <div key={i} className={`dim${d.axis ? ' dim--axis' : ''}`} data-dim>
            <i />
            {!d.axis && (
              <>
                <i />
                <i />
                <i />
                <i />
              </>
            )}
            <span className="dim__label">
              {d.value && <b>{d.value}</b>}
              <em>{d.note}</em>
            </span>
          </div>
        ))}
      </div>

      <div className="callouts" aria-hidden="true">
        {LABELS.map((l, i) => (
          <div key={i} className="callout" data-callout>
            <i className="callout__dot" />
            <i className="callout__stem" />
            <i className="callout__elbow" />
            <span className="callout__plate">
              <b>{l.title}</b>
              {l.note && <em>{l.note}</em>}
            </span>
          </div>
        ))}
      </div>

      <header className="topbar">
        <a
          className="brand"
          href="#hero"
          onClick={(e) => { e.preventDefault(); goTo('hero'); }}
        >
          <strong>StG 44</strong>
          <span>Sturmgewehr · 7.92 × 33</span>
        </a>
        <nav aria-label="Chapters">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={chapter === n.id ? 'is-on' : ''}
              aria-current={chapter === n.id ? 'true' : undefined}
              onClick={(e) => { e.preventDefault(); goTo(n.id); }}
            >
              <span>{n.no}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <i className="topbar__progress" />
      </header>

      <main className="story">
        <section id="hero" data-cue="hero" className="sec sec--hero">
          <div className="hero">
            <p className="kicker">{HERO.eyebrow}</p>
            <h1>{HERO.title}</h1>
            <p className="hero__lede">{HERO.lede}</p>
            <ul className="stats">
              {HERO.stats.map((s) => (
                <li key={s.label}>
                  <strong>
                    {s.value}
                    {s.unit && <small>{s.unit}</small>}
                  </strong>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="hint">
            <span>Scroll to walk round it</span>
            <span>Drag to turn it</span>
          </p>
        </section>

        {CHAPTERS.map((c) => (
          <section key={c.id} id={c.id} data-cue={c.id} className={`sec sec--${c.side}`} aria-labelledby={`${c.id}-title`}>
            <div className="col">
              <Head {...c} />
              {c.steps && (
                <ol className="steps">
                  {c.steps.map(([name, text]) => (
                    <li key={name}>
                      <b>{name}</b>
                      <span>{text}</span>
                    </li>
                  ))}
                </ol>
              )}
              {c.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {c.cartridges && <Rounds />}
              {c.controls && <Controls stage={stageRef} active={chapter === c.id} />}
              {c.timeline && (
                <ol className="timeline">
                  {c.timeline.map(([when, what]) => (
                    <li key={when}>
                      <time>{when}</time>
                      <span>{what}</span>
                    </li>
                  ))}
                </ol>
              )}
              {c.facts && <Facts rows={c.facts} label={`${c.kicker} figures`} />}
            </div>
          </section>
        ))}

        <section id="specs" data-cue="specs" className="sec sec--l" aria-labelledby="specs-title">
          <div className="col col--plate">
            <Head {...SPECS} />
            {SPECS.groups.map((g) => (
              <table className="spec" key={g.name}>
                <caption>{g.name}</caption>
                <tbody>
                  {g.rows.map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row">{k}</th>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </section>

        <section id="legacy" data-cue="legacy" className="sec sec--r" aria-labelledby="legacy-title">
          <div className="col">
            <Head {...LEGACY} />
            {LEGACY.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <aside className="feature">
              <p className="kicker">{LEGACY.feature.label}</p>
              <h3>{LEGACY.feature.title}</h3>
              <p>{LEGACY.feature.text}</p>
            </aside>
          </div>
        </section>

        <section id="outro" data-cue="outro" className="sec sec--outro" aria-labelledby="outro-title">
          <div className="outro">
            <h2 id="outro-title">{OUTRO.title}</h2>
            <p>{OUTRO.text}</p>
            <div className="stripper">
              <label htmlFor="strip-slider">Assembled</label>
              <input id="strip-slider" type="range" min="0" max="1" step="0.005" value={strip} onChange={(e) => setStrip(Number(e.target.value))} aria-label="Field strip the rifle" />
              <span>Stripped</span>
            </div>
            <button type="button" className="again" onClick={() => { setStrip(0); goTo('hero'); }}>
              Back to the start
            </button>
          </div>
          <footer className="foot">
            <p>
              3D model: “{CREDIT.title}” by{' '}
              <a href={CREDIT.source} target="_blank" rel="noreferrer">
                {CREDIT.author} on Sketchfab
              </a>
              , licensed{' '}
              <a href={CREDIT.licenseUrl} target="_blank" rel="noreferrer">
                {CREDIT.license}
              </a>
              . Changed for this page: stood upright on its bore axis, scaled to 940 mm, split into 23 moving parts, textures compressed. A historical and technical study; figures are the commonly published ones.
            </p>
            <p>
              Built with three.js, React, Vite and Lenis, following The Interactive 3D Website Guide by @designedby.russ. Keys: <kbd>C</kbd> hides the interface, <kbd>A</kbd> plays the page on rails.
            </p>
          </footer>
        </section>
      </main>

      <div className={`status${status === 'loading' ? ' is-on' : ''}`} role="status">
        {status === 'loading' && `Loading the model${loaded > 0 ? ` · ${Math.round(loaded * 100)}%` : ''}`}
      </div>
      {status === 'failed' && (
        <p className="nogl" role="note">
          This browser could not start WebGL, so the rifle is shown as a still. Everything written here is complete.
        </p>
      )}
      {auto && <div className="rails">Playing · scroll to stop</div>}
    </>
  );
}
