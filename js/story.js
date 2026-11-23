/* ANEMO story page engine (shared by both demos). Markup hooks: #hero #realms #detail #packaging #reviews #faq #final */
(async function () {
  const { $, $$ } = UI;
  await Store.init(); UI.mount('home');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero: realm tees printed on the friends' backs ---------- */
  const decals = [[30.5, 65.4, 'lily'], [44.6, 64.2, 'cosmic'], [52.2, 65.0, 'celestial'], [61.4, 64.2, 'cloudy'], [69.0, 63.2, 'cosmic']];
  const dl = $('#decals');
  if (dl) dl.innerHTML = decals.map(d => `<img class="decal" alt="" src="../assets/${ANEMO.realm(d[2]).img}" style="left:${d[0]}%;top:${d[1]}%">`).join('');

  /* ---------- scroll reveal ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18, rootMargin: '0px 0px -6% 0px' }) : null;
  const watch = () => $$('.fx:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));
  watch();

  /* ---------- chapter tracking (saved with the account) ---------- */
  const chapters = $$('[data-chapter]');
  const pg = $('#pageNo');
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { const c = e.target.dataset.chapter; if (pg) pg.textContent = String(chapters.indexOf(e.target) + 1).padStart(2, '0') + ' / ' + String(chapters.length).padStart(2, '0'); Store.setChapter(c); }
  }), { threshold: .45 });
  chapters.forEach(c => co.observe(c));
  if (location.hash) { const t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) setTimeout(() => t.scrollIntoView(), 50); }

  /* ---------- realms: enter a realm to reveal its tees ---------- */
  const gates = $('#gates'), reveal = $('#reveal');
  gates.innerHTML = ANEMO.realms.map((r, i) => `<button class="gate fx" data-r="${r.id}" style="--c:${r.color};--ink:${r.ink};--i:${i};--img:url(../assets/${r.img})" aria-pressed="false">
      <span class="gk">${r.jp}</span><span class="gn">${r.name}</span><span class="gp">${r.place}</span><span class="gsfx">${r.sfx}</span><span class="gdone" aria-hidden="true">✓</span></button>`).join('');
  watch();
  function refreshGates() { $$('.gate').forEach(g => g.classList.toggle('seen', Store.data.realms.includes(g.dataset.r))); }
  function enter(id) {
    const r = ANEMO.realm(id);
    $$('.gate').forEach(g => { const on = g.dataset.r === id; g.classList.toggle('on', on); g.setAttribute('aria-pressed', on); });
    reveal.style.setProperty('--c', r.color); reveal.style.setProperty('--ink', r.ink); reveal.style.setProperty('--img', 'url(../assets/' + r.img + ')');
    reveal.classList.remove('open'); void reveal.offsetWidth;
    reveal.innerHTML = `<div class="rv-head"><div><span class="rv-k">${r.jp}</span><h3>${r.name} Realm</h3><span class="rv-place">${r.place}</span><p>${r.blurb}</p></div></div>
      <div class="rv-grid">${ANEMO.products.filter(p => p.realm === id).map((p, i) => `<div class="rv-item" style="--i:${i}">${UI.card(p)}</div>`).join('')}</div>`;
    reveal.classList.add('open'); reveal.hidden = false;
    Store.markRealm(id); refreshGates();
    setTimeout(() => reveal.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }), 80);
    if (matchMedia('(max-width:860px)').matches) setTimeout(() => reveal.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }
  gates.onclick = e => { const g = e.target.closest('.gate'); if (g) enter(g.dataset.r); };
  Store.onChange(refreshGates); refreshGates();

  /* ---------- detail: scribble notes float in ---------- */
  const dc = $('#dChips'), ds = $('#dStage');
  let cur = 'thunder-noticeable';
  dc.innerHTML = ANEMO.lines.map(r => `<button data-d="${r.id}" style="--c:${r.color}">${r.jp} ${r.name}</button>`).join('');
  const spots = [[1, 10, -4, 0], [62, 24, 3, 1], [3, 68, -2, 0], [60, 80, 2, 1]];
  function drawDetail(rid, type) {
    const p = ANEMO.products.find(x => x.line === rid); const r = ANEMO.line(rid); cur = p.id;
    $$('#dChips button').forEach(b => b.classList.toggle('on', b.dataset.d === rid));
    const notes = p.scribbles.concat([p.placement + ' · ' + p.printSize]);
    ds.style.setProperty('--c', r.color);
    ds.innerHTML = `<div class="d-tee">${UI.tee(p)}</div>` + notes.map((t, i) => { const s = spots[i];
      return `<div class="scr" style="left:${s[0]}%;top:${s[1]}%;--r:${s[2]}deg"><span>${t}</span>
      <svg viewBox="0 0 70 46" style="${s[3] ? 'left:-4px;transform:scaleX(-1)' : 'right:-60px'};top:${i % 2 ? '-36px' : '22px'}"><path d="M4 40 C 20 4, 44 44, 66 8 M58 6 L67 8 L62 16"/></svg></div>`; }).join('') +
      `<a class="btn solid d-cta" href="product.html?p=${p.id}">View ${esc(p.name)} · ${UI.inr(p.price)}</a>`;
    Store.markViewed(p.id);
    $$('.scr', ds).forEach((n, i) => setTimeout(() => n.classList.add('in'), 250 + i * 420));
  }
  dc.onclick = e => { const b = e.target.closest('button'); if (b) drawDetail(b.dataset.d); };
  drawDetail('cosmic');
  // replay the scribbles when the section scrolls into view
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { drawDetail(ANEMO.product(cur).line); o.disconnect(); } }, { threshold: .4 }).observe(ds);

  /* ---------- packaging: scroll drives open + rotate ---------- */
  const pk = $('#packaging');
  if (pk) {
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), ease = t => t * t * (3 - 2 * t);
    let tick = false;
    function frame() {
      tick = false;
      const r = pk.getBoundingClientRect(), vh = innerHeight;
      const p = clamp(-r.top / (r.height - vh), 0, 1);
      const lid = ease(clamp((p - .12) / .3, 0, 1)) * 150;
      const rise = ease(clamp((p - .42) / .42, 0, 1));
      const ph = ease(clamp((p - .86) / .07, 0, 1));
      pk.style.setProperty('--ry', (-34 + p * 100).toFixed(1));
      pk.style.setProperty('--ph', ph.toFixed(3));
      pk.style.setProperty('--rx', (-34 + p * 14).toFixed(1));
      pk.style.setProperty('--lid', lid.toFixed(1));
      pk.style.setProperty('--rise', rise.toFixed(3));
      pk.style.setProperty('--p', p.toFixed(3));
      $$('.pk-step', pk).forEach(s => s.classList.toggle('on', p >= +s.dataset.at && p < +s.dataset.to));
      const bar = $('#pkBar'); if (bar) bar.style.width = (p * 100) + '%';
    }
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', frame); frame();
  }

  /* ---------- reviews ---------- */
  async function drawReviews() {
    const rv = await Store.reviews();
    const avg = (rv.reduce((n, x) => n + x.stars, 0) / rv.length).toFixed(1);
    $('#rAvg').innerHTML = `<b>${avg}</b><span class="stars">${UI.stars(+avg)}</span><small>${rv.length} stories from the community</small>`;
    $('#rList').innerHTML = rv.map((x, i) => { const r = ANEMO.realm(x.realm) || ANEMO.realms[0];
      return `<figure class="rbub fx" style="--c:${r.color};--i:${i % 3}"><div class="stars">${'★'.repeat(x.stars)}${'☆'.repeat(5 - x.stars)}</div>
      <blockquote>${esc(x.text)}</blockquote><figcaption><b>${esc(x.n)}</b> · ${esc(x.city)} · ${r.name} tee</figcaption></figure>`; }).join('');
    watch();
  }
  await drawReviews();
  const rf = $('#rForm');
  function reviewGate() { const on = !!Store.user; $('#rLogin').hidden = on; rf.hidden = !on; }
  reviewGate(); Store.onChange(reviewGate);
  $('#rRealm').innerHTML = ANEMO.realms.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
  rf.onsubmit = async e => {
    e.preventDefault(); const t = $('#rText').value.trim(); if (t.length < 3) return UI.toast('Write a few words first');
    try { await Store.addReview({ stars: +$('#rStars').value, realm: $('#rRealm').value, text: t }); $('#rText').value = ''; UI.toast('Review added. Thank you!'); drawReviews(); } catch (err) { UI.toast(err.message); }
  };

  /* ---------- faq ---------- */
  $('#faqList').innerHTML = ANEMO.faqs.map((f, i) => `<details class="fq fx" style="--i:${i}"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  watch();
  // one open at a time
  $('#faqList').addEventListener('toggle', e => { if (e.target.open) $$('#faqList details').forEach(d => { if (d !== e.target) d.open = false; }); }, true);
})();
