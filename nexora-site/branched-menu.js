/* Branched Menu (vanilla port of the React Bits BranchedMenu).
   A tree-style menu: sections fold open, and the active item is reached by an
   animated line drawn along the branch. Usage:
     const menu = BranchedMenu.create(containerEl, { items, defaultOpen, defaultActive, onSelect });
   items: [{ label, children: [{ value, label, num }] }] */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const PAD = 6, MARK = 16;

  function create(host, opts) {
    const o = Object.assign({
      items: [], defaultOpen: [0], defaultActive: '', onSelect: null, onToggle: null,
      width: 340, rowHeight: 36, indent: 44, trunk: 14, radius: 10, lineWidth: 1.5, fontSize: 14,
      drawDuration: 400, foldDuration: 300
    }, opts);

    const items = o.items;
    const open = new Set(Array.isArray(o.defaultOpen) ? o.defaultOpen : o.defaultOpen >= 0 ? [o.defaultOpen] : []);
    let active = o.defaultActive;
    if (!active) {
      const first = items.find((it, i) => it.children && open.has(i));
      active = (first && first.children[0] && first.children[0].value) || '';
    }

    const r = Math.min(o.radius, o.rowHeight / 2 - 2);
    const endX = o.indent - 8;
    const rowY = k => PAD + k * o.rowHeight + o.rowHeight / 2;
    const branch = k => `M ${o.trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${o.trunk + r} ${rowY(k)} H ${endX}`;
    const reach = k => `M ${o.trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${o.trunk + r} ${rowY(k)} H ${endX}`;
    const length = k => rowY(k) - r + (Math.PI * r) / 2 + (endX - o.trunk - r);
    const svgEl = (tag, attrs) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    };

    const nav = document.createElement('nav');
    nav.className = 'branched-menu';
    nav.setAttribute('aria-label', o.label || 'Menu');
    const vars = {
      '--bm-w': o.width + 'px', '--bm-font': o.fontSize + 'px', '--bm-row': o.rowHeight + 'px',
      '--bm-indent': o.indent + 'px', '--bm-line-w': o.lineWidth,
      '--bm-draw': o.drawDuration + 'ms', '--bm-fold': o.foldDuration + 'ms'
    };
    for (const k in vars) nav.style.setProperty(k, vars[k]);

    const marker = document.createElement('span');
    marker.className = 'branched-menu__marker';
    marker.setAttribute('aria-hidden', 'true');
    nav.append(marker);

    const heads = [];
    const sections = [];
    const itemBtns = [];   // { btn, value, section, k }
    const reachPaths = []; // { path, value, len }

    items.forEach((item, i) => {
      const kids = item.children || [];
      const sec = document.createElement('div');
      sec.className = 'branched-menu__section';

      const head = document.createElement('button');
      head.type = 'button';
      head.className = 'branched-menu__head';
      head.textContent = item.label;
      head.setAttribute('aria-expanded', String(open.has(i)));
      head.addEventListener('click', () => toggle(i));
      heads[i] = head;
      sec.append(head);

      const bodyH = PAD * 2 + kids.length * o.rowHeight;
      const body = document.createElement('div');
      body.className = 'branched-menu__body';
      const fold = document.createElement('div');
      fold.className = 'branched-menu__fold';
      const tree = document.createElement('div');
      tree.className = 'branched-menu__tree';
      tree.style.height = bodyH + 'px';

      const svg = svgEl('svg', { class: 'branched-menu__lines', width: o.indent, height: bodyH, 'aria-hidden': 'true' });
      svg.append(svgEl('path', { class: 'branched-menu__base', d: `M ${o.trunk} 0 V ${rowY(kids.length - 1) - r}` }));
      kids.forEach((kid, k) => svg.append(svgEl('path', { class: 'branched-menu__base', d: branch(k) })));
      kids.forEach((kid, k) => {
        const p = svgEl('path', { class: 'branched-menu__reach', d: reach(k) });
        p.style.strokeDasharray = length(k);
        reachPaths.push({ path: p, value: kid.value, len: length(k) });
        svg.append(p);
      });
      tree.append(svg);

      kids.forEach((kid, k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'branched-menu__item';
        if (kid.num != null) {
          const n = document.createElement('span');
          n.className = 'branched-menu__num';
          n.setAttribute('aria-hidden', 'true');
          n.textContent = kid.num;
          b.append(n);
        }
        const l = document.createElement('span');
        l.className = 'branched-menu__label';
        l.textContent = kid.label;
        b.append(l);
        b.addEventListener('click', () => select(kid.value, kid));
        itemBtns.push({ btn: b, value: kid.value, section: i });
        tree.append(b);
      });

      fold.append(tree);
      body.append(fold);
      sec.append(body);
      sections[i] = sec;
      nav.append(sec);
    });

    const activeSection = () => items.findIndex(it => it.children && it.children.some(kid => kid.value === active));

    function place(glide) {
      const s = activeSection();
      const head = heads[s];
      const on = s >= 0 && open.has(s) && head;
      if (!glide) marker.style.transition = 'none';
      if (on) marker.style.top = `${head.offsetTop + (head.offsetHeight - MARK) / 2}px`;
      marker.toggleAttribute('data-on', Boolean(on));
      if (!glide) { void marker.offsetHeight; marker.style.transition = ''; }
    }

    function paint() {
      sections.forEach((sec, i) => {
        const isOpen = open.has(i);
        sec.toggleAttribute('data-open', isOpen);
        heads[i].setAttribute('aria-expanded', String(isOpen));
      });
      itemBtns.forEach(x => {
        const isActive = x.value === active;
        x.btn.toggleAttribute('data-active', isActive);
        if (isActive) x.btn.setAttribute('aria-current', 'true'); else x.btn.removeAttribute('aria-current');
        x.btn.tabIndex = open.has(x.section) ? 0 : -1;
      });
      reachPaths.forEach(x => { x.path.style.strokeDashoffset = x.value === active ? 0 : x.len; });
      heads.forEach((h, i) => h.toggleAttribute('data-active', i === activeSection() && open.has(i)));
      place(true);
    }

    function select(value, item) {
      active = value;
      paint();
      if (o.onSelect) o.onSelect(value, item);
    }
    function toggle(i) {
      const isOpen = !open.has(i);
      if (isOpen) open.add(i); else open.delete(i);
      paint();
      if (o.onToggle) o.onToggle(i, isOpen);
    }

    host.replaceChildren(nav);
    paint();

    // keep the marker locked to its heading while sections fold (size changes each frame)
    if ('ResizeObserver' in window) {
      let first = true;
      new ResizeObserver(() => { if (first) { first = false; return; } place(false); }).observe(nav);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(false));

    return { select: v => { const it = items.flatMap(s => s.children || []).find(c => c.value === v); if (it) select(v, it); }, toggle, element: nav };
  }

  window.BranchedMenu = { create };
})();
