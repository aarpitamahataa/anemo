/* ANEMO shared UI: tee renderer, header, bottom nav, cart drawer, toast, helpers. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const stars = r => { const f = Math.round(r); let s = ''; for (let i = 1; i <= 5; i++) s += i <= f ? '★' : '☆'; return s; };

  /* Tee drawing. The print art is the real design file placed per its spec (left chest / front low / front / back). */
  function tee(p, opts) {
    opts = opts || {};
    const r = ANEMO.line(p.line);
    if (p.photo) return `<img class="tee photo" src="${p.photo}" alt="${p.name}">`;
    const back = (opts.view || p.view) === 'back';
    const col = opts.color || r.tee;
    const id = 'g' + Math.random().toString(36).slice(2, 7);
    const path = 'M205 70 L148 92 L52 152 L94 218 L150 188 L150 532 L450 532 L450 188 L506 218 L548 152 L452 92 L395 70 ' + (back ? 'Q300 100 205 70' : 'Q300 150 205 70') + ' Z';
    let art = '';
    const href = p.art;
    if (p.type === 'basic') art = `<image href="${href}" x="316" y="176" width="86" height="86"/>`;
    else if (p.type === 'noticeable') art = `<image href="${href}" x="170" y="236" width="260" height="260"/>`;
    else if (p.type === 'funky') art = `<image href="${href}" x="160" y="170" width="280" height="280"/>`;
    else art = `<image href="${href}" x="150" y="130" width="300" height="300"/>`;
    if (opts.view === 'front' && p.type === 'limited') art = '';
    if (opts.view === 'back' && p.type !== 'limited') art = '';
    const collar = back
      ? `<path d="M205 70 Q300 100 395 70" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="7" stroke-linecap="round"/>`
      : `<path d="M205 70 Q300 150 395 70" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="9" stroke-linecap="round"/><path d="M215 76 Q300 140 385 76" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="4"/>`;
    return `<svg class="tee" viewBox="0 0 600 600" role="img" aria-label="${p.name}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".10"/><stop offset=".35" stop-color="#fff" stop-opacity=".12"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>
      <ellipse cx="300" cy="566" rx="170" ry="14" fill="rgba(0,0,0,.14)"/>
      <path d="${path}" fill="${col}" stroke="rgba(0,0,0,.22)" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="${path}" fill="url(#${id})"/>
      <path d="M150 188 Q165 150 148 92 M450 188 Q435 150 452 92" fill="none" stroke="rgba(0,0,0,.1)" stroke-width="2"/>
      <path d="M150 520 H450" stroke="rgba(0,0,0,.12)" stroke-width="2"/>
      ${collar}${art}</svg>`;
  }

  function card(p) {
    const r = ANEMO.line(p.line), rm = ANEMO.realm(p.realm);
    const off = Math.round((1 - p.price / p.mrp) * 100);
    return `<article class="pcard" data-id="${p.id}" style="--realm:${r.color}">
      <a class="pimg" href="product.html?p=${p.id}" aria-label="${p.name}">
        ${p.tag ? `<span class="ptag">${p.tag}</span>` : ''}${tee(p)}
      </a>
      <button class="wish ${Store.isWished(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Save to wishlist">♥</button>
      <div class="pbody">
        <span class="pk">${rm.name} realm</span>
        <a class="ptitle" href="product.html?p=${p.id}">${p.name}</a>
        <div class="pprice"><b>${inr(p.price)}</b> <s>${inr(p.mrp)}</s> <em>${off}% off</em></div>
        <div class="prate"><span class="stars" aria-label="${p.rating} out of 5">${stars(p.rating)}</span> <a href="product.html?p=${p.id}#reviews">${p.reviews}</a>${p.stock <= 20 ? ` <span class="low">· only ${p.stock} left</span>` : ''}</div>
        <div class="pbtns"><button class="btn red" data-add="${p.id}">Add to cart</button><button class="btn line" data-buy="${p.id}">Buy now</button></div>
      </div></article>`;
  }

  /* toast */
  function toast(msg) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* chrome */
  const ICON = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/></svg>',
    shop: '<svg viewBox="0 0 24 24"><path d="M4 7h16l-1.5 13h-13zM8 7a4 4 0 018 0"/></svg>',
    cart: '<svg viewBox="0 0 24 24"><path d="M3 4h3l2.5 11h10l2-8H7M10 20a1 1 0 100 .01M17 20a1 1 0 100 .01"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2"/></svg>',
    dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>'
  };

  function mount(active, opts) {
    opts = opts || {};
    const h = document.createElement('header'); h.id = 'top';
    h.innerHTML = `<div class="hwrap">
      <div class="hleft">
        <button class="ibtn only-m" id="sBtn2" aria-label="Search">${ICON.search}</button>
        <a href="shop.html" class="${active === 'shop' ? 'on' : ''}">Loadout</a><a href="index.html#realms">Realms</a>
      </div>
      <a class="logo" href="index.html" aria-label="Anemo home"><span class="logo-k">風</span><span class="logo-t">ANEMO</span></a>
      <div class="hright">
        <button class="ibtn" id="sBtn" aria-label="Search">${ICON.search}</button>
        <button class="ibtn cartbtn" id="cartBtn" aria-label="Open cart">${ICON.bag}<span class="count" id="cartCount">0</span></button>
        <button class="ibtn" id="menuBtn" aria-label="Menu" aria-expanded="false">${ICON.dots}</button>
      </div></div>
      <div class="sbar" id="sbar"><form class="hsearch" id="hsearch" role="search" action="shop.html" method="get"><input id="q" name="q" type="search" placeholder="Search tees or realms" aria-label="Search"><button aria-label="Search">${ICON.search}</button></form></div>
      <nav class="menu" id="menu" aria-label="More"><a href="index.html">Story</a><a href="index.html#realms">Realms</a><a href="index.html#packaging">The crate</a><a href="index.html#reviews">Reviews</a><a href="index.html#faq">FAQ</a><a href="account.html">${'Account'}</a><a class="go" href="shop.html">Order now</a></nav>`;
    document.body.prepend(h);
    const sb = $('#sbar'), mn = $('#menu');
    const toggleS = () => { sb.classList.toggle('open'); mn.classList.remove('open'); if (sb.classList.contains('open')) $('#q').focus(); };
    $('#sBtn').onclick = toggleS; $('#sBtn2').onclick = toggleS;
    $('#menuBtn').onclick = e => { e.stopPropagation(); mn.classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', mn.classList.contains('open')); };
    document.addEventListener('click', e => { if (!e.target.closest('#menu')) mn.classList.remove('open'); });
    if (opts.search && new URLSearchParams(location.search).get('q')) sb.classList.add('open');

    const nav = document.createElement('nav'); nav.id = 'bnav'; nav.setAttribute('aria-label', 'Primary');
    nav.innerHTML = `<a href="index.html" class="${active === 'home' ? 'on' : ''}">${ICON.home}<span>Story</span></a>
      <a href="shop.html" class="${active === 'shop' ? 'on' : ''}">${ICON.shop}<span>Shop</span></a>
      <button id="bCart">${ICON.cart}<span class="count" id="cartCount2">0</span><span>Cart</span></button>
      <a href="account.html" class="${active === 'account' ? 'on' : ''}">${ICON.user}<span>Account</span></a>`;
    document.body.appendChild(nav);

    const dr = document.createElement('aside'); dr.id = 'drawer'; dr.setAttribute('aria-hidden', 'true');
    dr.innerHTML = `<div class="dback" data-close></div><div class="dpanel" role="dialog" aria-label="Cart">
      <div class="dhead"><b>Your cart</b><button data-close aria-label="Close">✕</button></div>
      <div class="dbody" id="dbody"></div>
      <div class="dfoot"><div class="dtot"><span>Subtotal</span><b id="dtot">₹0</b></div>
      <button class="btn solid wide" id="checkout">Place order</button><p class="dnote">Demo checkout, no payment taken.</p></div></div>`;
    document.body.appendChild(dr);

    $('#cartBtn').onclick = openDrawer; $('#bCart').onclick = openDrawer;
    $$('[data-close]', dr).forEach(b => b.onclick = closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    $('#checkout').onclick = async () => {
      if (!Store.user) { location.href = 'account.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); return; }
      try { const o = await Store.placeOrder(); toast('Order placed · ' + inr(o.total)); closeDrawer(); } catch (e) { toast(e.message); }
    };
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-add]'); const b = e.target.closest('[data-buy]'); const w = e.target.closest('[data-wish]');
      if (a) { Store.addToCart(a.dataset.add, sizePick(a), 1); toast('Added to cart'); }
      if (b) { Store.addToCart(b.dataset.buy, sizePick(b), 1); openDrawer(); }
      if (w) { Store.toggleWish(w.dataset.wish); w.classList.toggle('on', Store.isWished(w.dataset.wish)); toast(Store.isWished(w.dataset.wish) ? 'Saved to wishlist' : 'Removed from wishlist'); }
    });
    Store.onChange(refresh);
    refresh();
  }
  function sizePick(el) { const s = document.querySelector('.sizes input:checked'); return el.closest('.pcard') || !s ? 'M' : s.value; }
  function openDrawer() { $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden', 'false'); }
  function closeDrawer() { $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); }

  function refresh() {
    const n = Store.cartCount();
    ['cartCount', 'cartCount2'].forEach(i => { const e = $('#' + i); if (e) { e.textContent = n; e.classList.toggle('on', n > 0); } });
    const body = $('#dbody'); if (!body) return;
    if (!Store.data.cart.length) body.innerHTML = '<p class="empty">Your cart is empty.<br>Pick a realm and start your story.</p>';
    else body.innerHTML = Store.data.cart.map(i => { const p = ANEMO.product(i.id); if (!p) return '';
      return `<div class="citem"><div class="cth">${tee(p)}</div><div class="cinfo"><b>${p.name}</b><span>Size ${i.size} · ${inr(p.price)}</span>
        <div class="qty"><button data-q="-1" data-id="${i.id}" data-s="${i.size}">−</button><span>${i.qty}</span><button data-q="1" data-id="${i.id}" data-s="${i.size}">+</button></div></div></div>`; }).join('');
    $$('#dbody [data-q]').forEach(b => b.onclick = () => { const it = Store.data.cart.find(x => x.id === b.dataset.id && x.size === b.dataset.s); Store.setQty(b.dataset.id, b.dataset.s, it.qty + (+b.dataset.q)); });
    $('#dtot').textContent = inr(Store.cartTotal());
  }

  window.UI = { $, $$, inr, stars, tee, card, toast, mount, openDrawer, closeDrawer };
})();
