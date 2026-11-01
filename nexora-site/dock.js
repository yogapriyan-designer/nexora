/* Dock (vanilla port of the React Bits Dock). Builds a magnifying icon dock from the
   links already in <nav id="nav"> and highlights the section you are reading.
   If anything fails, the original nav simply stays as it was. */
(function() {
    'use strict';

    const EDGE = 12,
        HOP = 0.4,
        HOP_TIME = 0.38;
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    const icon = p => `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

    const ICONS = {
        top: icon('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
        services: icon('<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12.5l9 5 9-5"/><path d="M3 17l9 5 9-5"/>'),
        work: icon('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
        process: icon('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5"/>'),
        patent: icon('<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
        contact: icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>')
    };

    function create(items, userOpts) {
        const o = Object.assign({
            base: 50,
            magnification: 70,
            panelHeight: 68,
            gap: 10,
            distance: 200,
            roundness: 0.5,
            mass: 0.1,
            stiffness: 150,
            damping: 12,
            bounce: true
        }, userOpts);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const canHover = window.matchMedia('(hover: hover)').matches;
        const rawBase = Math.max(16, o.base);
        const rawPeak = canHover ? Math.max(rawBase, o.magnification) : rawBase; // no magnify on touch
        const rawThick = Math.max(rawBase, o.panelHeight);
        const rawGap = Math.max(0, o.gap);

        const root = document.createElement('nav');
        root.className = 'dock';
        const topMq = window.matchMedia('(min-width: 1100px)');
        const placeDock = () => {
            root.classList.toggle('dock--top', topMq.matches);
            root.classList.toggle('dock--bottom', !topMq.matches);
            document.documentElement.classList.toggle('dock-top', topMq.matches);
        };
        placeDock();
        root.setAttribute('aria-label', 'Sections');
        const nodes = [];
        items.forEach((it, i) => {
            if (it.separator) {
                const s = document.createElement('span');
                s.className = 'dock-separator';
                s.setAttribute('aria-hidden', 'true');
                root.appendChild(s);
                nodes[i] = null;
                return;
            }
            const a = document.createElement('a');
            a.className = 'dock-item';
            a.href = it.href;
            a.setAttribute('aria-label', it.label);
            a.dataset.id = it.id || '';
            a.innerHTML = `<span class="dock-tile"><span class="dock-face">${it.icon}</span></span><span class="dock-dot" aria-hidden="true"></span><span class="dock-label" aria-hidden="true">${it.label}</span>`;
            root.appendChild(a);
            nodes[i] = a;
        });
        document.body.appendChild(root);

        const length = items.reduce((sum, it) => sum + (it.separator ? 1 : rawBase), 0) +
            rawGap * Math.max(0, items.length - 1) + rawThick - rawBase + (rawPeak - rawBase);
        const S = { base: rawBase, peak: rawPeak, thickness: rawThick, gap: rawGap, distance: o.distance };
        let fit = 1;

        function measure() {
            const room = document.documentElement.clientWidth - EDGE * 2;
            fit = Math.round(clamp(room / length, 0.4, 1) * 1000) / 1000;
            S.base = rawBase * fit;
            S.peak = rawPeak * fit;
            S.thickness = rawThick * fit;
            S.gap = rawGap * fit;
            S.distance = Math.max(1, o.distance) * fit;
            root.style.setProperty('--dock-base', S.base + 'px');
            root.style.setProperty('--dock-thickness', S.thickness + 'px');
            root.style.setProperty('--dock-gap', S.gap + 'px');
            root.style.setProperty('--dock-pad', (S.thickness - S.base) / 2 + 'px');
            root.style.setProperty('--dock-reach', S.peak - S.base + 'px');
            root.style.setProperty('--dock-round', clamp(o.roundness, 0, 1));
            wake();
        }

        const motion = new Map();
        const pointer = { x: 0, inside: false };
        let focused = -1,
            raf = 0,
            last = 0,
            lastBase = S.base;

        const entry = i => {
            let st = motion.get(i);
            if (!st) {
                st = { size: S.base, velocity: 0, lift: 0, rise: 0, launch: 0, gravity: 0, hopping: false, drawn: '' };
                motion.set(i, st);
            }
            return st;
        };

        function tick(now) {
            raf = 0;
            const dt = Math.min(1 / 30, Math.max(0.001, (now - last) / 1000));
            last = now;
            if (S.base !== lastBase) {
                const ratio = S.base / lastBase;
                motion.forEach(st => {
                    st.size *= ratio;
                    st.velocity *= ratio;
                });
                lastBase = S.base;
            }
            const rect = root.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            const spans = items.map(it => (it.separator ? 1 : S.base));
            let cursor = -(spans.reduce((a, b) => a + b, 0) + S.gap * Math.max(0, spans.length - 1)) / 2;
            const rest = spans.map(span => {
                const mid = cursor + span / 2;
                cursor += span + S.gap;
                return mid;
            });
            let focus = null;
            if (pointer.inside) focus = pointer.x - center;
            else if (rest[focused] !== undefined) focus = rest[focused];

            const steps = Math.max(1, Math.ceil(dt * 240));
            const h = dt / steps;
            const k = o.stiffness / Math.max(0.01, o.mass);
            const c = o.damping / Math.max(0.01, o.mass);
            let moving = false;

            items.forEach((it, i) => {
                const node = nodes[i];
                if (!node) return;
                const st = entry(i);
                const reach = focus === null ? 1 : Math.abs(focus - rest[i]) / S.distance;
                const target = S.base + (S.peak - S.base) * (reach < 1 ? Math.cos((reach * Math.PI) / 2) ** 2 : 0);
                if (reduce) {
                    st.size = target;
                    st.velocity = 0;
                } else {
                    for (let n = 0; n < steps; n++) {
                        st.velocity = (st.velocity + h * k * (target - st.size)) / (1 + h * c + h * h * k);
                        st.size += st.velocity * h;
                        if (!st.hopping) continue;
                        st.rise -= st.gravity * h;
                        st.lift += st.rise * h;
                        if (st.lift > 0) continue;
                        st.lift = 0;
                        st.rise *= -0.36;
                        if (st.rise < st.launch * 0.2) {
                            st.rise = 0;
                            st.hopping = false;
                            node.removeAttribute('data-hop');
                        }
                    }
                }
                if (Math.abs(st.velocity) < 0.01 && Math.abs(target - st.size) < 0.01) {
                    st.size = target;
                    st.velocity = 0;
                } else moving = true;
                if (st.hopping) moving = true;
                const size = Math.max(1, st.size);
                const drawn = size.toFixed(2) + ' ' + st.lift.toFixed(2);
                if (drawn === st.drawn) return;
                st.drawn = drawn;
                node.style.width = size + 'px';
                node.style.height = size + 'px';
                node.firstElementChild.style.transform = `translate(0, ${root.classList.contains('dock--top') ? st.lift : -st.lift}px) scale(${size / S.base})`;
            });
            if (moving) raf = requestAnimationFrame(tick);
        }

        function wake() {
            if (!raf) {
                last = performance.now();
                raf = requestAnimationFrame(tick);
            }
        }

        function hop(i) {
            if (reduce || !o.bounce || !nodes[i]) return;
            const st = entry(i);
            if (st.hopping) return;
            const height = st.size * HOP;
            st.gravity = (8 * height) / (HOP_TIME * HOP_TIME);
            st.launch = (st.gravity * HOP_TIME) / 2;
            st.rise = st.launch;
            st.hopping = true;
            nodes[i].setAttribute('data-hop', '');
            wake();
        }

        root.addEventListener('pointermove', e => {
            if (e.pointerType === 'touch') return;
            pointer.x = e.clientX;
            pointer.inside = true;
            wake();
        });
        root.addEventListener('pointerleave', () => {
            pointer.inside = false;
            wake();
        });
        root.addEventListener('pointercancel', () => {
            pointer.inside = false;
            wake();
        });

        const order = nodes.map((n, i) => (n ? i : -1)).filter(i => i >= 0);
        nodes.forEach((a, i) => {
            if (!a) return;
            a.addEventListener('click', () => {
                hop(i);
                setCurrent(a.dataset.id);
            });
            a.addEventListener('focus', () => {
                if (a.matches(':focus-visible')) {
                    focused = i;
                    wake();
                }
            });
            a.addEventListener('blur', () => {
                focused = -1;
                wake();
            });
            a.addEventListener('keydown', e => {
                const at = order.indexOf(i);
                let next;
                if (e.key === 'ArrowLeft') next = order[(at - 1 + order.length) % order.length];
                else if (e.key === 'ArrowRight') next = order[(at + 1) % order.length];
                else if (e.key === 'Home') next = order[0];
                else if (e.key === 'End') next = order[order.length - 1];
                if (next === undefined) return;
                e.preventDefault();
                nodes[next].focus();
            });
        });

        function setCurrent(id) {
            nodes.forEach(a => {
                if (a) {
                    if (a.dataset.id === id) a.setAttribute('aria-current', 'true');
                    else a.removeAttribute('aria-current');
                }
            });
        }

        /* scroll-spy: mark the section being read */
        const ids = items.filter(it => !it.separator).map(it => it.id);
        let spyQueued = false;

        function spy() {
            spyQueued = false;
            const line = window.innerHeight * 0.35;
            let cur = ids[0];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el && id !== 'top' && el.getBoundingClientRect().top <= line) cur = id;
            });
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = ids[ids.length - 1];
            setCurrent(cur);
        }
        const queueSpy = () => {
            if (!spyQueued) {
                spyQueued = true;
                requestAnimationFrame(spy);
            }
        };
        window.addEventListener('scroll', queueSpy, { passive: true });
        window.addEventListener('resize', () => {
            measure();
            queueSpy();
        });

        measure();
        spy();
        return root;
    }

    function init() {
        try {
            const nav = document.getElementById('nav');
            if (!nav) return;
            const items = [{ id: 'top', href: '#top', label: 'Home', icon: ICONS.top }];
            let cta = null;
            nav.querySelectorAll('a').forEach(a => {
                const id = (a.getAttribute('href') || '').replace('#', '');
                if (!id || !ICONS[id]) return;
                const entry = { id, href: '#' + id, label: a.textContent.trim(), icon: ICONS[id] };
                if (a.classList.contains('btn')) cta = entry;
                else items.push(entry);
            });
            if (cta) {
                items.push({ separator: true });
                items.push(cta);
            }
            create(items);
            document.documentElement.classList.add('dock-on');
        } catch (e) {
            console.warn('Dock could not start; keeping the normal nav.', e);
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();