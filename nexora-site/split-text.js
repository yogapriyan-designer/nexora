/* Split Text: every letter of the matching headings rises in one by one
   when it scrolls into view. No GSAP needed. */
(function() {
    'use strict';

    const OPTIONS = {
        selector: 'h2, h3.sub', // which elements get the animation
        delay: 35, // ms between each letter
        duration: 900, // ms for one letter to finish
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px'
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function splitNode(node, counter) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'split-word';
            word.setAttribute('aria-hidden', 'true');
            for (const ch of Array.from(part)) {
                const c = document.createElement('span');
                c.className = 'split-char';
                c.style.setProperty('--i', counter.n++);
                c.textContent = ch;
                word.append(c);
            }
            frag.append(word);
        });
        node.replaceWith(frag);
    }

    function split(el) {
        if (el.dataset.splitDone) return;
        el.dataset.splitDone = '1';
        el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
        const counter = { n: 0 };
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(n => { if (n.textContent.trim()) splitNode(n, counter); });
        el.classList.add('split-parent');
        el.style.setProperty('--split-delay', OPTIONS.delay + 'ms');
        el.style.setProperty('--split-duration', OPTIONS.duration + 'ms');
        el._splitTotal = counter.n;
    }

    function init() {
        const els = Array.from(document.querySelectorAll(OPTIONS.selector));
        if (!els.length || !('IntersectionObserver' in window)) return;
        els.forEach(split);
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                io.unobserve(el);
                el.classList.add('split-in');
                setTimeout(() => el.classList.add('split-done'),
                    OPTIONS.duration + (el._splitTotal || 0) * OPTIONS.delay + 60);
            });
        }, { threshold: OPTIONS.threshold, rootMargin: OPTIONS.rootMargin });
        els.forEach(el => io.observe(el));
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();