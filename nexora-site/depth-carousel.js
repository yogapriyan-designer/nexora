/* DepthCarousel (vanilla port). Cards stack back into depth; drag, swipe, arrow keys,
   buttons and horizontal wheel all move it. Items are HTML strings (escape them first).
   Usage: const dc = DepthCarousel.create(element, { ...options }); dc.setItems([html, html]); */
(function (global) {
  'use strict';

  const DEFAULTS = {
    depth: 220, spread: 90, tilt: 22, tiltDirection: 'right', perspective: 1400,
    visibleCards: 4, falloff: 0.2, blur: 6, duration: 700,
    autoplay: false, autoplayDelay: 3200, loop: true,
    cardWidth: 300, cardHeight: 380, radius: 18, tint: '#05060a',
    showControls: true, showIndicators: true,
    dotsMax: 12, // above this many items, show a "03 / 27" counter instead of dots
    label: 'Carousel', onChange: null
  };

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const make = (tag, cls, attrs) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
    return n;
  };
  const ARROW = d => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function create(root, userOpts) {
    const o = Object.assign({}, DEFAULTS, userOpts);
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    root.classList.add('depth-carousel');
    root.style.setProperty('--dc-perspective', o.perspective + 'px');
    root.setAttribute('role', 'group');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', o.label);
    root.tabIndex = 0;
    root.textContent = '';

    const stage = make('div', 'depth-carousel__stage');
    const status = make('div', 'depth-carousel__status', { role: 'status', 'aria-live': 'polite' });
    root.append(stage, status);

    let prevBtn = null, nextBtn = null, dotsBox = null, counter = null;
    if (o.showControls) {
      prevBtn = make('button', 'depth-carousel__arrow depth-carousel__arrow--prev', { type: 'button', 'aria-label': 'Previous slide' });
      prevBtn.innerHTML = ARROW('M15 5l-7 7 7 7');
      nextBtn = make('button', 'depth-carousel__arrow depth-carousel__arrow--next', { type: 'button', 'aria-label': 'Next slide' });
      nextBtn.innerHTML = ARROW('M9 5l7 7-7 7');
      root.append(prevBtn, nextBtn);
      prevBtn.addEventListener('click', () => step(-1));
      nextBtn.addEventListener('click', () => step(1));
    }
    if (o.showIndicators) {
      dotsBox = make('div', 'depth-carousel__dots');
      root.append(dotsBox);
    }

    let cards = [], tints = [], dots = [], items = [];
    let n = 0, pos = 0, focus = 0, scale = 1, raf = 0, wheelTimer = 0, autoTimer = 0, drag = null, justDragged = false;

    function layout(p) {
      const dir = o.tiltDirection === 'left' ? -1 : 1;
      for (let i = 0; i < n; i++) {
        const el = cards[i];
        let d = i - p;
        if (o.loop && n > 1) {
          d = ((d % n) + n) % n;
          if (d > n / 2) d -= n;
        }
        const back = Math.max(0, d);
        const shown = Math.abs(d) <= o.visibleCards + 0.5;
        const tz = -o.depth * d;
        const tx = dir * o.spread * d;
        const ry = dir * o.tilt * clamp(d, 0, 1);
        let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
        if (!shown) opacity = 0;
        const brightness = Math.max(0.15, 1 - back * o.falloff);
        const blurPx = o.blur > 0 ? Math.min(o.blur, (back / Math.max(1, o.visibleCards)) * o.blur) : 0;

        el.style.transform = `translate(-50%, -50%) scale(${scale}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
        el.style.zIndex = String(Math.round(2000 - d * 20));
        el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';
        tints[i].style.opacity = clamp(back * o.falloff * 1.25, 0, 0.86).toFixed(3);
      }
    }

    function cancelTween() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    function tweenTo(target, animate) {
      cancelTween();
      const from = pos;
      const dur = animate && !reduceMq.matches ? o.duration : 0;
      if (!dur || from === target) {
        pos = n ? ((target % n) + n) % n : 0;
        layout(pos);
        return;
      }
      const t0 = performance.now();
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3); // power3.out
        pos = from + (target - from) * e;
        layout(pos);
        if (k < 1) raf = requestAnimationFrame(tick);
        else { raf = 0; pos = ((pos % n) + n) % n; layout(pos); }
      };
      raf = requestAnimationFrame(tick);
    }

    function notify() {
      cards.forEach((c, i) => c.setAttribute('aria-hidden', i === focus ? 'false' : 'true'));
      dots.forEach((d, i) => { d.classList.toggle('is-active', i === focus); d.setAttribute('aria-selected', i === focus); });
      if (counter) counter.textContent = `${String(focus + 1).padStart(2, '0')} / ${n}`;
      status.textContent = n ? `Slide ${focus + 1} of ${n}` : '';
      if (typeof o.onChange === 'function') o.onChange(focus, items[focus]);
    }

    function setFocus(raw, animate) {
      if (!n) return;
      const idx = o.loop ? ((raw % n) + n) % n : clamp(raw, 0, n - 1);
      let delta = idx - pos;
      if (o.loop && n > 1) {
        delta = ((delta % n) + n) % n;
        if (delta > n / 2) delta -= n;
      }
      tweenTo(pos + delta, animate !== false);
      if (idx !== focus) { focus = idx; notify(); }
    }
    function step(s) { setFocus(focus + s, true); }

    function setItems(list) {
      cancelTween();
      items = Array.isArray(list) ? list : [];
      n = items.length;
      stage.textContent = '';
      cards = []; tints = [];
      items.forEach((html, i) => {
        const card = make('div', 'depth-carousel__card', { 'aria-roledescription': 'slide', 'aria-label': `${i + 1} of ${n}` });
        card.style.width = o.cardWidth + 'px';
        card.style.height = o.cardHeight + 'px';
        card.style.borderRadius = o.radius + 'px';
        const body = make('div', 'depth-carousel__body');
        body.innerHTML = html;
        const tint = make('span', 'depth-carousel__tint');
        tint.style.background = o.tint;
        card.append(body, tint);
        card.addEventListener('click', () => { if (!justDragged) setFocus(i, true); });
        stage.append(card);
        cards.push(card); tints.push(tint);
      });

      if (dotsBox) {
        dotsBox.textContent = ''; dots = []; counter = null;
        dotsBox.hidden = n < 2;
        if (n > o.dotsMax) {
          counter = make('span', 'depth-carousel__counter');
          dotsBox.append(counter);
        } else {
          dotsBox.setAttribute('role', 'tablist');
          dotsBox.setAttribute('aria-label', 'Slides');
          for (let i = 0; i < n; i++) {
            const b = make('button', 'depth-carousel__dot', { type: 'button', role: 'tab', 'aria-label': `Go to slide ${i + 1}` });
            b.addEventListener('click', () => setFocus(i, true));
            dotsBox.append(b); dots.push(b);
          }
        }
      }
      if (prevBtn) { prevBtn.hidden = nextBtn.hidden = n < 2; }
      pos = 0; focus = 0;
      layout(0);
      notify();
    }

    /* scale the whole stack down on narrow containers */
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (!w) return;
      scale = clamp(w / (o.cardWidth + o.spread * 1.2 + 40), 0.7, 1);
      layout(pos);
    });
    ro.observe(root);

    /* horizontal wheel / trackpad only, so normal vertical page scrolling is never hijacked */
    root.addEventListener('wheel', e => {
      if (n < 2 || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      cancelTween();
      const raw = e.deltaMode === 1 ? e.deltaX * 24 : e.deltaX;
      pos += clamp(raw / (o.cardWidth * 0.9), -0.6, 0.6);
      layout(pos);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => setFocus(Math.round(pos), true), 130);
    }, { passive: false });

    const stepPx = () => Math.max(o.cardWidth * 0.55 * scale, 40);
    root.addEventListener('pointerdown', e => {
      if (n < 2 || (e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('button')) return;
      cancelTween();
      drag = { x: e.clientX, startPos: pos, lastX: e.clientX, lastT: performance.now(), v: 0, moved: false, id: e.pointerId };
    });
    root.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; try { root.setPointerCapture(drag.id); } catch (err) { /* ignore */ } }
      if (!drag.moved) return;
      const now = performance.now();
      drag.v = (e.clientX - drag.lastX) / Math.max(now - drag.lastT, 1);
      drag.lastX = e.clientX; drag.lastT = now;
      pos = drag.startPos - dx / stepPx();
      layout(pos);
    });
    const endDrag = () => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) return;
      justDragged = true; setTimeout(() => { justDragged = false; }, 0);
      setFocus(Math.round(pos - (d.v * 180) / stepPx()), true);
    };
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);

    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });

    if (o.autoplay && !reduceMq.matches) {
      let hovered = false, focused = false;
      root.addEventListener('mouseenter', () => { hovered = true; });
      root.addEventListener('mouseleave', () => { hovered = false; });
      root.addEventListener('focusin', () => { focused = true; });
      root.addEventListener('focusout', () => { focused = false; });
      autoTimer = setInterval(() => { if (!hovered && !focused && n > 1) step(1); }, Math.max(o.autoplayDelay, 600));
    }

    function destroy() {
      cancelTween(); clearTimeout(wheelTimer); clearInterval(autoTimer); ro.disconnect();
      root.textContent = '';
      root.classList.remove('depth-carousel');
    }

    setItems([]);
    return { setItems, next: () => step(1), prev: () => step(-1), goTo: i => setFocus(i, true), destroy };
  }

  global.DepthCarousel = { create };
})(window);
