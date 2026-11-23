(async function () {
  const { $, $$, inr } = UI;
  await Store.init(); UI.mount('shop');
  const id = new URLSearchParams(location.search).get('p') || 'thunder-limited';
  const p = ANEMO.product(id) || ANEMO.products[0];
  const r = ANEMO.line(p.line), rm = ANEMO.realm(p.realm);
  document.title = p.name + ' · Anemo';
  Store.markViewed(p.id); Store.markRealm(p.realm);
  const off = Math.round((1 - p.price / p.mrp) * 100);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let view = p.view, size = 'M';

  // scribble notes floating around the tee: [left%, top%, rotate, arrow flip]
  const spots = [[3, 9, -4, 0], [62, 24, 3, 1], [4, 72, -2, 0], [60, 82, 2, 1]];
  const notes = p.scribbles.concat([p.placement + ' · ' + p.printSize]);
  const noteHTML = () => notes.map((t, i) => { const s = spots[i % spots.length];
    return `<div class="note" style="left:${s[0]}%;top:${s[1]}%;--r:${s[2]}deg" data-i="${i}"><u>${esc(t)}</u>
      <svg viewBox="0 0 70 46" style="${s[3] ? 'left:-8px;transform:scaleX(-1)' : 'right:-62px'};top:${i % 2 ? '-34px' : '24px'}"><path d="M4 40 C 20 4, 44 44, 66 8 M58 6 L67 8 L62 16"/></svg></div>`; }).join('');

  const ic = {
    box: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5L12 12l8-4.5M12 12v9"/></svg>',
    card: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>',
    help: '<svg viewBox="0 0 24 24"><path d="M5 8a7 7 0 0114 0v3M4 11h3v5H4zM17 11h3v5h-3zM17 16v2a3 3 0 01-3 3h-2"/></svg>'
  };

  const pdp = $('#pdp'); pdp.style.setProperty('--realm', r.color);
  pdp.innerHTML = `
    <div class="gallery"><div class="stage" id="stage"><div id="teeWrap">${UI.tee(p, { view })}</div>${noteHTML()}</div></div>
    <div class="detail">
      <div class="d-head"><div><p class="kick"><a href="shop.html?realm=${rm.id}">${rm.name} realm</a></p><h1>${esc(p.name)}</h1></div>
        <button class="heart ${Store.isWished(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Save to wishlist">♥</button></div>
      <p class="price">${inr(p.price)} <s>${inr(p.mrp)}</s> <em>${off}% off</em></p>
      <p class="ship">Free shipping across India. Inclusive of all taxes.</p>
      <p class="tagline">${esc(rm.blurb)}</p>
      <div class="sizehead"><span>SIZE: <b id="sizeNow">${size}</b></span><button class="uline" id="chartBtn"><svg viewBox="0 0 24 24"><path d="M4 16L16 4l4 4L8 20zM8 12l2 2M11 9l2 2M14 6l2 2"/></svg> SIZE CHART</button></div>
      <div class="guide"><p>Order your regular size (M = M).</p><p>Do not size up — the T-shirts are already oversized.</p><p>For a more boxy fit, we recommend going one size down.</p></div>
      <div class="sizes" role="radiogroup" aria-label="Size">${p.sizes.map(s => `<label><input type="radio" name="size" value="${s}" ${s === size ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div>
      <div class="cta" id="cta"><button class="btn red" data-add="${p.id}">Add to Cart</button><button class="btn line" data-buy="${p.id}">Buy Now</button></div>
      <p class="stock ${p.stock <= 20 ? 'low' : ''}">${p.stock <= 20 ? 'Only ' + p.stock + ' left · numbered drop' : 'In stock · ships in 24 hours'}</p>
      <ul class="perks">
        <li>${ic.box}<div><b>280 GSM heavyweight build</b><span>Dense feel with lasting comfort</span></div></li>
        <li>${ic.card}<div><b>Flexible payments</b><span>UPI, cards and netbanking</span></div></li>
        <li>${ic.truck}<div><b>Delivery</b><span>3–5 days metro · 5–8 days rest of India</span></div></li>
        <li>${ic.help}<div><b>Need help with an order?</b><span>Size exchange within 7 days</span></div></li>
      </ul>
      <details class="more-info" open><summary>Details</summary><p>${esc(p.desc)}</p><ul>${p.specs.map(s => `<li>${s}</li>`).join('')}<li>Print: ${p.placement}, ${p.printSize}</li></ul></details>
    </div>`;

  // sticky buy bar
  const sticky = $('#sticky');
  sticky.innerHTML = `<div class="sb-in"><span class="sb-name">${esc(p.name)} <i>/ <em id="sbSize">${size}</em></i></span><span class="sb-price">${inr(p.price)}</span>
    <div class="sb-btns"><button class="btn red" data-add="${p.id}">Add to Cart</button><button class="btn line" data-buy="${p.id}">Buy Now</button></div></div>`;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { const out = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; sticky.classList.toggle('show', out); }, { threshold: 0 }).observe($('#cta'));

  $$('input[name=size]').forEach(i => i.onchange = () => { size = i.value; $('#sizeNow').textContent = size; $('#sbSize').textContent = size; });

  // size chart
  $('#chartBtn').onclick = () => { $('#chart').hidden = false; };
  $('#chartX').onclick = () => { $('#chart').hidden = true; };
  $('#chart').onclick = e => { if (e.target.id === 'chart') $('#chart').hidden = true; };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#chart').hidden = true; });

  // scribble notes float in when the stage enters view
  const stage = $('#stage');
  const reveal = () => $$('.note', stage).forEach((n, i) => setTimeout(() => n.classList.add('in'), 350 + i * 450));
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { reveal(); io.disconnect(); } }, { threshold: .35 }); io.observe(stage); } else reveal();
  stage.onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return;
    $$('[data-v]', stage).forEach(x => x.classList.toggle('on', x === b)); $('#teeWrap').innerHTML = UI.tee(p, { view: b.dataset.v }); };

  $('#more').innerHTML = ANEMO.products.filter(x => x.realm === p.realm && x.id !== p.id).slice(0, 4).map(UI.card).join('');
  const rv = (await Store.reviews()).filter(x => x.realm === p.realm).slice(0, 4);
  $('#rlist').innerHTML = (rv.length ? rv : (await Store.reviews()).slice(0, 3)).map(x => `<div class="rv"><div><b>${esc(x.n)}</b> <span class="stars">${'★'.repeat(x.stars)}${'☆'.repeat(5 - x.stars)}</span></div><p>${esc(x.text)}</p><small>Verified buyer · ${esc(x.city)}</small></div>`).join('');
})();
