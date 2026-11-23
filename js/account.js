(async function () {
  const { $, $$, inr } = UI;
  await Store.init(); UI.mount('account');
  const next = new URLSearchParams(location.search).get('next');
  const root = $('#acctMain');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function authView(notice) {
    root.innerHTML = `<div class="auth"><div class="panel">
      <h1 style="font-family:var(--f-display);font-size:2rem;letter-spacing:.04em;margin-bottom:.2rem">Join the story</h1>
      <p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">Your cart, wishlist and realm progress are saved to your account.</p>
      <div class="tabs" role="tablist"><button class="on" data-t="in" role="tab">Login</button><button data-t="up" role="tab">Sign up</button></div>
      <form id="af" novalidate>
        <label class="field" id="nameF" hidden>Name<input id="an" autocomplete="name" placeholder="Your name"></label>
        <label class="field">Email<input id="ae" type="email" autocomplete="email" placeholder="you@email.com" required></label>
        <label class="field">Password<input id="ap" type="password" autocomplete="current-password" placeholder="At least 6 characters" required></label>
        <div class="msg" id="am" role="status"></div>
        <button type="button" class="link" id="resend" hidden>Resend confirmation email</button>
        <button class="btn solid wide" id="go">Login</button>
      </form>
      <p class="mode">${Store.mode === 'supabase' ? 'Secured by Supabase Auth. New accounts confirm their email once.' : 'Demo mode: saved in this browser only. Add Supabase keys in config.js to sync across devices.'}</p>
    </div></div>`;
    let tab = 'in';
    const m = $('#am'), say = (cls, t) => { m.className = 'msg ' + cls; m.textContent = t; };
    if (notice) say('ok', notice);
    $$('.tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; $$('.tabs button').forEach(x => x.classList.toggle('on', x === b));
      $('#nameF').hidden = tab !== 'up'; $('#go').textContent = tab === 'up' ? 'Create account' : 'Login'; say('', ''); $('#resend').hidden = true;
      $('#ap').autocomplete = tab === 'up' ? 'new-password' : 'current-password'; });
    $('#resend').onclick = async () => {
      try { await Store.resendConfirmation($('#ae').value.trim()); say('ok', 'Sent again. Check your inbox and spam folder.'); } catch (err) { say('err', err.message || 'Could not resend. Wait a minute and try again.'); }
    };
    $('#af').onsubmit = async e => {
      e.preventDefault(); say('', 'One moment…'); $('#resend').hidden = true;
      try {
        const email = $('#ae').value.trim();
        const r = tab === 'up' ? await Store.signUp($('#an').value.trim(), email, $('#ap').value) : await Store.signIn(email, $('#ap').value);
        if (r.needsConfirm) { say('ok', 'Almost there! We sent a confirmation link to ' + email + '. Open it (check spam too), then come back and log in.'); $('#resend').hidden = false; return; }
        if (next) location.href = next; else dash();
      } catch (err) {
        say('err', err.message || 'Something went wrong.');
        if (err.code === 'unconfirmed') $('#resend').hidden = false;
      }
    };
  }

  async function dash() {
    const d = Store.data, u = Store.user;
    const total = ANEMO.realms.length, seen = d.realms.filter(id => ANEMO.realm(id)), done = seen.length;
    const [orders, prof] = await Promise.all([Store.orders(), Store.getProfile()]);
    const wish = d.wishlist.map(ANEMO.product).filter(Boolean);
    const cart = d.cart.filter(i => ANEMO.product(i.id));
    root.innerHTML = `<div class="dash">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap"><div><h2>Hi, ${esc(u.name)} 👋</h2><p style="color:var(--muted);font-size:.9rem">${esc(u.email)}</p></div><button class="btn ghost" id="out">Log out</button></div>
      <div class="dgrid">
        <div class="box"><h3>Your story progress</h3><b>${done} of ${total} realms explored</b><div class="bar"><i style="width:${done / total * 100}%"></i></div>
          <div class="chips">${ANEMO.realms.map(r => `<span class="chip ${seen.includes(r.id) ? 'got' : ''}" style="--c:${r.color}">${r.jp} ${r.name}</span>`).join('')}</div>
          <p style="margin-top:.8rem;font-size:.85rem;color:var(--muted)">${d.viewed.length} tee${d.viewed.length === 1 ? '' : 's'} viewed${d.chapter ? ' · last chapter: ' + esc(d.chapter) : ''}</p>
          <a class="link" href="index.html${d.chapter ? '#' + encodeURIComponent(d.chapter) : ''}">Continue the story →</a></div>
        <div class="box"><h3>Saved cart (${Store.cartCount()})</h3>${cart.length ? cart.map(i => { const p = ANEMO.product(i.id); return `<div class="olist"><div><span>${esc(p.name)} · ${esc(i.size)} × ${i.qty}</span><b>${inr(p.price * i.qty)}</b></div></div>`; }).join('') + `<p style="margin-top:.6rem"><b>${inr(Store.cartTotal())}</b> · <button class="link" id="openCart">Review &amp; order</button></p>` : '<p style="color:var(--muted)">Nothing here yet. <a class="link" href="shop.html">Browse tees</a></p>'}</div>
        <div class="box"><h3>Wishlist (${wish.length})</h3>${wish.length ? wish.map(p => `<div class="olist"><div><a href="product.html?p=${p.id}">${esc(p.name)}</a><b>${inr(p.price)}</b></div></div>`).join('') : '<p style="color:var(--muted)">Tap ♥ on any tee to save it.</p>'}</div>
      </div>
      <div class="box"><h3>Your profile</h3>
        <form id="pf" class="pform" novalidate>
          <label class="field">Full name<input name="full_name" autocomplete="name" value="${esc(prof.full_name)}"></label>
          <label class="field">Phone<input name="phone" type="tel" autocomplete="tel" value="${esc(prof.phone)}" placeholder="+91 …"></label>
          <label class="field wide2">Delivery address<input name="address_line" autocomplete="street-address" value="${esc(prof.address_line)}" placeholder="House, street, area"></label>
          <label class="field">City<input name="city" autocomplete="address-level2" value="${esc(prof.city)}"></label>
          <label class="field">Pincode<input name="pincode" inputmode="numeric" autocomplete="postal-code" value="${esc(prof.pincode)}"></label>
          <div class="wide2"><button class="btn solid" id="psave">Save profile</button> <span class="msg" id="pmsg" role="status"></span></div>
        </form></div>
      <div class="box"><h3>Orders</h3>${orders.length ? '<div class="olist">' + orders.map(o => `<div><span>${new Date(o.created_at).toLocaleDateString()} · ${o.items.reduce((n, i) => n + i.qty, 0)} item(s) · ${esc(o.status)}</span><b>${inr(o.total)}</b></div>`).join('') + '</div>' : '<p style="color:var(--muted)">No orders yet.</p>'}</div>
    </div>`;
    $('#out').onclick = async () => { await Store.signOut(); authView(); };
    const oc = $('#openCart'); if (oc) oc.onclick = UI.openDrawer;
    $('#pf').onsubmit = async e => {
      e.preventDefault(); const pm = $('#pmsg'); pm.className = 'msg'; pm.textContent = 'Saving…';
      try {
        await Store.saveProfile(Object.fromEntries(new FormData(e.target)));
        pm.className = 'msg ok'; pm.textContent = 'Saved.'; UI.toast('Profile saved');
        const h = $('.dash h2'); if (h) h.textContent = 'Hi, ' + Store.user.name + ' 👋';
      } catch (err) { pm.className = 'msg err'; pm.textContent = err.message || 'Could not save.'; }
    };
  }

  // after clicking the email link Supabase returns here already logged in
  Store.onChange(() => { if (Store.user && !$('#af') && !$('#pf')) dash(); });
  Store.user ? dash() : authView(new URLSearchParams(location.hash.slice(1)).get('error_description') ? 'That link has expired. Log in or request a new one.' : '');
})();
