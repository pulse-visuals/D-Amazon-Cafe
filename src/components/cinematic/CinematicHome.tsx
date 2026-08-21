"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import "./cinematic.css";
import { initJungleTable } from "./jungle-table-engine";

export function CinematicHome({ currentYear }: { currentYear: number }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const teardown = initJungleTable(rootRef.current);
    return teardown;
  }, []);

  return (
    <div className="jt-page" ref={rootRef}>
      <div className="grain" />

      <div id="loader">
        <img className="mark" alt="" src="/images/logo.png" />
        <div className="pct" id="loader-pct">00</div>
        <div className="bar"><i id="loader-bar" /></div>
        <div className="label" id="loader-label">Initializing Experience</div>
        <div className="sub">D&rsquo;Amazon Cafe &mdash; Sungai Long, Cheras</div>
      </div>

      <nav id="nav">
        <a className="brand" href="#hero">
          <img src="/images/logo.png" alt="D'Amazon Cafe" />
          <span>D&rsquo;AMAZON <em>CAFE</em></span>
        </a>
        <div className="links">
          <a href="#hero" data-nav="true">01 Taste</a>
          <a href="#specs" data-nav="true">02 Heat</a>
          <a href="#build" data-nav="true">03 Build</a>
          <a href="#visit" data-nav="true">04 Visit</a>
        </div>
        <Link className="cta" href="/order">Order Online</Link>
        <button className="burger" id="burger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div id="mobile-menu">
        <div>
          <div className="u-label">Navigate</div>
          <a href="#hero" data-nav-m="true">Taste</a>
        </div>
        <a href="#specs" data-nav-m="true">Heat</a>
        <a href="#build" data-nav-m="true">Build</a>
        <a href="#visit" data-nav-m="true">Visit</a>
        <Link className="cta mcta" href="/order">Order Online &rarr;</Link>
      </div>

      <div id="rail">
        <div className="idx" id="rail-idx">00 / 06</div>
        <div className="track"><i id="rail-fill" /></div>
      </div>

      <main id="smooth-root">
        <section id="hero">
          <div className="pin-stage">
            <canvas className="scrub-canvas" id="cv-hero" />
            <img className="static-fallback" src="/images/cinematic/nasi-lemak-ayam-berempah.webp" alt="Nasi Lemak at D'Amazon Cafe" />
            <div className="stage-veil" />
            <div className="stage-content">
              <div className="eyebrow"><i></i><span className="u-label">D&rsquo;Amazon Cafe &mdash; Sungai Long, Cheras</span></div>
              <h1>
                <span className="line"><span>Taste the Flavours</span></span>
                <span className="line"><span>of <em>Malaysia,</em></span></span>
                <span className="line"><span>Surrounded by Nature</span></span>
              </h1>
              <p className="sub">Nasi lemak, hand-pounded sambal and rainforest air &mdash; freshly made every morning beneath the canopy of Monkeys Canopy Resort.</p>
              <div className="hero-meta">
                <div><strong>05:00</strong><span>Kitchen Opens</span></div>
                <div><strong>15+</strong><span>Signature Plates</span></div>
                <div><strong>2&ndash;5</strong><span>Cili Padi Scale</span></div>
              </div>
            </div>
            <div className="scrollcue"><span className="dot" /><span className="u-label">Scroll to Enter</span></div>
          </div>
        </section>

        <section id="specs">
          <div className="spec" id="spec-01">
            <div className="pin-stage">
              <canvas className="scrub-canvas" id="cv-spec1" />
              <img className="static-fallback" src="/images/cinematic/nasi-ayam-masak-lemak-cili-padi.webp" alt="Cili padi sambal dishes" />
              <div className="stage-veil" />
              <div className="stage-content">
                <div className="spec-grid">
                  <div>
                    <span className="u-label">Specifications // 01</span>
                    <h2>The Sambal</h2>
                    <p>Cili padi, hand-pounded to order &mdash; no shortcuts, no bottled paste. Every plate is finished with sambal made fresh that morning.</p>
                  </div>
                  <div className="stat">
                    <div className="num" id="stat-spec1">2<small>&nbsp;cili padi</small></div>
                    <div className="cap">Heat Scale &mdash; Mild to Fiery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="spec" id="spec-02">
            <div className="pin-stage">
              <canvas className="scrub-canvas" id="cv-spec2" />
              <img className="static-fallback" src="/images/cinematic/ayam-rendang.webp" alt="Slow-cooked rendang" />
              <div className="stage-veil" />
              <div className="stage-content">
                <div className="spec-grid">
                  <div>
                    <span className="u-label">Specifications // 02</span>
                    <h2>The Rendang</h2>
                    <p>Chicken and beef simmered low and slow in coconut milk and toasted spice, until the gravy clings to every grain of rice.</p>
                  </div>
                  <div className="stat">
                    <div className="num" id="stat-spec2">45<small>&nbsp;min</small></div>
                    <div className="cap">Simmer Time &mdash; Low &amp; Slow</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="spec" id="spec-03">
            <div className="pin-stage">
              <canvas className="scrub-canvas" id="cv-spec3" />
              <img className="static-fallback" src="/images/cinematic/butter-croissant.webp" alt="Fresh morning bakes" />
              <div className="stage-veil" />
              <div className="stage-content">
                <div className="spec-grid">
                  <div>
                    <span className="u-label">Specifications // 03</span>
                    <h2>The Morning Bake</h2>
                    <p>Butter croissants, chocolate danish and muffins, baked in small batches so the case never sits full for long.</p>
                  </div>
                  <div className="stat">
                    <div className="num" id="stat-spec3">05<small>:00</small></div>
                    <div className="cap">First Batch &mdash; Out of the Oven</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="assembly">
          <div className="pin-stage">
            <div className="assembly-wrap">
              <div className="heading">
                <span>Built</span><span>From</span><span>The</span><span><em>Jungle</em></span>
              </div>
              <div className="plate-area" id="plate-area">
                <div className="base-plate"><img src="/images/cinematic/nasi-lemak-ayam-berempah.webp" alt="Nasi lemak base" /></div>
                <div className="chip" id="chip-1" style={{ left: "6%", top: "12%" }}><img src="/images/cinematic/ayam-rendang.webp" alt="Ayam rendang" /><span className="tag">Ayam Rendang</span></div>
                <div className="chip" id="chip-2" style={{ right: "2%", top: "8%" }}><img src="/images/cinematic/nasi-ikan-tenggiri-asam-pedas.webp" alt="Ikan tenggiri" /><span className="tag">Ikan Tenggiri</span></div>
                <div className="chip" id="chip-3" style={{ left: "0%", bottom: "10%" }}><img src="/images/cinematic/nasi-daging-masak-hitam.webp" alt="Daging masak hitam" /><span className="tag">Daging Hitam</span></div>
                <div className="chip" id="chip-4" style={{ right: "4%", bottom: "6%" }}><img src="/images/cinematic/nasi-kari-ayam.webp" alt="Kari ayam" /><span className="tag">Kari Ayam</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="build">
          <div id="configurator">
            <div className="cfg-head">
              <span className="u-label">Section 04 &mdash; Interactive</span>
              <h2>Build Your Nasi Lemak</h2>
            </div>
            <div className="cfg-wrap">
              <div className="cfg-visual">
                <div className="cfg-frame" id="cfg-frame">
                  <img data-key="berempah" className="active" src="/images/cinematic/nasi-lemak-ayam-berempah.webp" alt="Ayam Berempah" />
                  <img data-key="rendang" src="/images/cinematic/ayam-rendang.webp" alt="Ayam Rendang" />
                  <img data-key="daging" src="/images/cinematic/daging-rendang.webp" alt="Daging Rendang" />
                  <img data-key="ikan" src="/images/cinematic/nasi-ikan-tenggiri-asam-pedas.webp" alt="Ikan Tenggiri" />
                </div>
                <div className="cfg-price">
                  <div className="amt" id="cfg-amt">RM12.90</div>
                  <div className="note">Indicative pricing &mdash; see live menu for exact totals &amp; availability</div>
                </div>
              </div>
              <div>
                <div className="cfg-group">
                  <div className="glabel"><span className="n">Option 01</span><span className="t">Protein</span></div>
                  <div className="opt-list" id="group-protein">
                    <button className="opt selected" data-group="protein" data-key="berempah" data-price="12.90">
                      <span className="ol"><span className="ring" /><span className="nm">Ayam Berempah<span className="desc">Spiced fried chicken</span></span></span>
                      <span className="pr">RM12.90</span>
                    </button>
                    <button className="opt" data-group="protein" data-key="rendang" data-price="14.90">
                      <span className="ol"><span className="ring" /><span className="nm">Ayam Rendang<span className="desc">Slow-cooked chicken rendang</span></span></span>
                      <span className="pr">RM14.90</span>
                    </button>
                    <button className="opt" data-group="protein" data-key="daging" data-price="16.90">
                      <span className="ol"><span className="ring" /><span className="nm">Daging Rendang<span className="desc">Slow-cooked beef rendang</span></span></span>
                      <span className="pr">RM16.90</span>
                    </button>
                    <button className="opt" data-group="protein" data-key="ikan" data-price="15.90">
                      <span className="ol"><span className="ring" /><span className="nm">Ikan Tenggiri Asam Pedas<span className="desc">Spicy-sour mackerel</span></span></span>
                      <span className="pr">RM15.90</span>
                    </button>
                  </div>
                </div>
                <div className="cfg-group">
                  <div className="glabel"><span className="n">Option 02</span><span className="t">Sambal Level</span></div>
                  <div className="opt-list" id="group-spice">
                    <button className="opt selected" data-group="spice" data-key="original" data-price="0">
                      <span className="ol"><span className="ring" /><span className="nm">Original Sambal<span className="desc">2 cili padi</span></span></span>
                      <span className="pr">Included</span>
                    </button>
                    <button className="opt" data-group="spice" data-key="mild" data-price="0">
                      <span className="ol"><span className="ring" /><span className="nm">Mild<span className="desc">On the side</span></span></span>
                      <span className="pr">Included</span>
                    </button>
                    <button className="opt" data-group="spice" data-key="extra" data-price="0.50">
                      <span className="ol"><span className="ring" /><span className="nm">Extra Cili Padi<span className="desc">5 cili padi</span></span></span>
                      <span className="pr">+RM0.50</span>
                    </button>
                  </div>
                </div>
                <div className="cfg-group">
                  <div className="glabel"><span className="n">Option 03</span><span className="t">Extras</span></div>
                  <div className="opt-list" id="group-extra">
                    <button className="opt" data-group="extra" data-key="egg" data-price="1.50" data-toggle="1">
                      <span className="ol"><span className="ring" /><span className="nm">Fried Egg<span className="desc">Sunny side up</span></span></span>
                      <span className="pr">+RM1.50</span>
                    </button>
                    <button className="opt" data-group="extra" data-key="anchovy" data-price="1.00" data-toggle="1">
                      <span className="ol"><span className="ring" /><span className="nm">Extra Anchovies<span className="desc">Crispy ikan bilis</span></span></span>
                      <span className="pr">+RM1.00</span>
                    </button>
                    <button className="opt" data-group="extra" data-key="papadom" data-price="0.80" data-toggle="1">
                      <span className="ol"><span className="ring" /><span className="nm">Papadom<span className="desc">x2 crackers</span></span></span>
                      <span className="pr">+RM0.80</span>
                    </button>
                  </div>
                </div>
                <div className="cfg-summary">
                  <div className="row"><span id="sum-protein">Ayam Berempah</span><span id="sum-protein-p">RM12.90</span></div>
                  <div className="row"><span id="sum-spice">Original Sambal</span><span id="sum-spice-p">&mdash;</span></div>
                  <div className="row" id="sum-extra-row" style={{ display: "none" }}><span id="sum-extra">Extras</span><span id="sum-extra-p" /></div>
                  <div className="row total"><span>Total</span><span id="sum-total">RM12.90</span></div>
                </div>
                <div className="cfg-actions">
                  <Link className="btn-primary" href="/menu/nasi-lemak">Order the Real Thing &rarr;</Link>
                  <button className="btn-ghost" id="cfg-reset">Reset</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="climax">
          <div className="pin-stage">
            <canvas className="scrub-canvas" id="cv-climax" />
            <img className="static-fallback" src="/images/cinematic/combo-special.webp" alt="D'Amazon Cafe combo" />
            <div className="stage-veil" />
            <div className="grain-heavy" />
            <div className="stage-content">
              <span className="u-label">The Jungle Table</span>
              <h2>Good Food.<br />
                <em>Great Coffee.</em><br />
                Tropical Vibes.</h2>
              <p>Freshly made in Sungai Long, Cheras &mdash; every plate, every cup, every morning.</p>
            </div>
          </div>
        </section>

        <footer id="visit">
          <div className="fgrid">
            <div>
              <div className="fbrand"><img src="/images/logo.png" alt="D'Amazon Cafe" /><span>D&rsquo;Amazon <em>Cafe</em></span></div>
              <p className="ftag">Nasi Lemak, coffee, tea, pastries and Western favourites &mdash; freshly made beneath the rainforest canopy of Sungai Long.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                <li><a href="#hero">Taste</a></li>
                <li><a href="#specs">Heat</a></li>
                <li><a href="#build">Build Your Plate</a></li>
                <li><Link href="/order">Full Menu &amp; Order Online</Link></li>
              </ul>
            </div>
            <div>
              <h4>Visit</h4>
              <address className="faddr">
                Shop No. R03, Lot.683,<br />
                Monkeys Canopy Resort,<br />
                Jalan Persiaran Bukit Enggang SG Long Hill,<br />
                Sungai Long, Cheras, Selangor
              </address>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="tel:+60123456789">+60 12-345 6789</a></li>
                <li><a href="mailto:hello@damazoncafe.my">hello@damazoncafe.my</a></li>
                <li><a href="https://wa.me/60123456789" target="_blank" rel="noopener">WhatsApp Us</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="fbottom">
            <p>&copy; {currentYear} D&rsquo;Amazon Cafe, Sungai Long. All rights reserved.</p>
            <div className="flegal">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </footer>
      </main>

      <div id="jt-cursor" aria-hidden="true">
        <div className="wrap">
          <img src="/images/logo.png" alt="" />
        </div>
        <span className="trail" />
      </div>
    </div>
  );
}
