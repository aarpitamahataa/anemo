/* ANEMO store: auth + saved progress + cart + wishlist + orders + reviews.
   Uses Supabase when anemo/config.js is filled in; otherwise falls back to localStorage demo mode. */
(function () {
  const cfg = window.ANEMO_CONFIG || {};
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const sb = (cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase)
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  // where the confirmation email link should land (the account page of whichever demo was used)
  const redirectUrl = () => /^https?:/.test(location.protocol) ? location.origin + location.pathname.replace(/[^/]*$/, 'account.html') : undefined;
  const emptyData = () => ({ realms: [], viewed: [], chapter: '', cart: [], wishlist: [] });
  let user = null;                      // {id,email,name}
  let data = Object.assign(emptyData(), LS.get('anemo_data', {}));
  const listeners = [];
  let saveTimer = null;

  const emit = () => listeners.forEach(f => { try { f(Store); } catch (e) {} });
  const persistLocal = () => LS.set(user ? 'anemo_data_' + user.id : 'anemo_data', data);
  function persist() {
    persistLocal();
    emit();
    if (sb && user) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        sb.from('user_progress').upsert({ user_id: user.id, name: user.name, data, updated_at: new Date().toISOString() }).then(() => {});
      }, 600);
    }
  }
  async function hash(s) {
    try {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('anemo:' + s));
      return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
    } catch (e) { return btoa(s); }
  }
  function mergeData(remote) {
    const m = emptyData(); const r = Object.assign(emptyData(), remote || {});
    ['realms', 'viewed', 'wishlist'].forEach(k => m[k] = Array.from(new Set([].concat(r[k] || [], data[k] || []))));
    const map = {};
    [].concat(r.cart || [], data.cart || []).forEach(i => { const key = i.id + '|' + i.size; map[key] = map[key] ? Object.assign({}, map[key], { qty: Math.max(map[key].qty, i.qty) }) : i; });
    m.cart = Object.values(map);
    m.chapter = data.chapter || r.chapter || '';
    return m;
  }

  const Store = {
    mode: sb ? 'supabase' : 'local',
    get user() { return user; },
    get data() { return data; },
    onChange(f) { listeners.push(f); },

    async init() {
      if (sb) {
        const { data: s } = await sb.auth.getSession();
        if (s && s.session) await this._loadUser(s.session.user);
        sb.auth.onAuthStateChange((ev, session) => { if (ev === 'SIGNED_OUT') { user = null; data = Object.assign(emptyData(), LS.get('anemo_data', {})); emit(); } });
      } else {
        const cur = LS.get('anemo_session', null);
        if (cur) { user = cur; data = mergeData(LS.get('anemo_data_' + cur.id, {})); }
      }
      emit();
      return Store;
    },
    async _loadUser(u) {
      user = { id: u.id, email: u.email, name: (u.user_metadata && u.user_metadata.name) || u.email.split('@')[0] };
      let remote = {};
      try { const { data: row } = await sb.from('user_progress').select('data').eq('user_id', u.id).maybeSingle(); remote = row ? row.data : {}; } catch (e) {}
      // first login creates the profile row (name from sign-up)
      try { const { data: pr } = await sb.from('anemo_profiles').select('user_id').eq('user_id', u.id).maybeSingle(); if (!pr) await sb.from('anemo_profiles').insert({ user_id: u.id, full_name: user.name }); } catch (e) {}
      data = mergeData(remote); persist();
    },

    async signUp(name, email, password) {
      if (!email || !password || password.length < 6) throw new Error('Use a valid email and a password of at least 6 characters.');
      if (sb) {
        const { data: r, error } = await sb.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: redirectUrl() } });
        if (error) throw error;
        // Supabase returns an obfuscated user with no identities when the email is already registered
        if (r.user && Array.isArray(r.user.identities) && r.user.identities.length === 0) throw new Error('That email is already registered. Try logging in.');
        if (!r.session) return { needsConfirm: true, email };
        await this._loadUser(r.user); return { ok: true };
      }
      const users = LS.get('anemo_users', {});
      if (users[email]) throw new Error('That email is already registered. Try signing in.');
      const id = 'u_' + Date.now().toString(36);
      users[email] = { id, name: name || email.split('@')[0], pw: await hash(password) };
      LS.set('anemo_users', users);
      user = { id, email, name: users[email].name }; LS.set('anemo_session', user);
      data = mergeData({}); persist(); return { ok: true };
    },
    async signIn(email, password) {
      if (sb) {
        const { data: r, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message)) { const e = new Error('Please confirm your email first. Open the link we sent you, then log in.'); e.code = 'unconfirmed'; throw e; }
          throw error;
        }
        await this._loadUser(r.user); return { ok: true };
      }
      const users = LS.get('anemo_users', {}); const u = users[email];
      if (!u || u.pw !== await hash(password)) throw new Error('Email or password is incorrect.');
      user = { id: u.id, email, name: u.name }; LS.set('anemo_session', user);
      data = mergeData(LS.get('anemo_data_' + u.id, {})); persist(); return { ok: true };
    },
    async signOut() {
      if (sb) await sb.auth.signOut();
      LS.set('anemo_session', null); user = null; data = emptyData(); LS.set('anemo_data', {}); emit();
    },

    async resendConfirmation(email) {
      if (!sb) return;
      const { error } = await sb.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectUrl() } });
      if (error) throw error;
    },

    /* profile (name, phone, delivery address) */
    async getProfile() {
      if (!user) return null;
      if (sb) {
        try { const { data: row } = await sb.from('anemo_profiles').select('*').eq('user_id', user.id).maybeSingle(); if (row) return row; } catch (e) {}
        return { user_id: user.id, full_name: user.name, phone: '', address_line: '', city: '', pincode: '' };
      }
      return LS.get('anemo_profile_' + user.id, { full_name: user.name, phone: '', address_line: '', city: '', pincode: '' });
    },
    async saveProfile(p) {
      if (!user) throw new Error('login');
      const row = { full_name: (p.full_name || '').trim().slice(0, 80), phone: (p.phone || '').trim().slice(0, 20), address_line: (p.address_line || '').trim().slice(0, 200), city: (p.city || '').trim().slice(0, 60), pincode: (p.pincode || '').trim().slice(0, 10) };
      if (sb) {
        const { error } = await sb.from('anemo_profiles').upsert(Object.assign({ user_id: user.id, updated_at: new Date().toISOString() }, row));
        if (error) throw error;
      } else {
        LS.set('anemo_profile_' + user.id, row);
        const users = LS.get('anemo_users', {}); if (users[user.email] && row.full_name) { users[user.email].name = row.full_name; LS.set('anemo_users', users); }
      }
      if (row.full_name) { user.name = row.full_name; if (!sb) LS.set('anemo_session', user); }
      emit(); return row;
    },

    /* progress */
    markRealm(id) { if (!data.realms.includes(id)) { data.realms.push(id); persist(); } },
    markViewed(id) { if (!data.viewed.includes(id)) { data.viewed.push(id); persist(); } },
    setChapter(c) { if (data.chapter !== c) { data.chapter = c; persist(); } },

    /* cart + wishlist */
    cartCount() { return data.cart.reduce((n, i) => n + i.qty, 0); },
    cartTotal() { return data.cart.reduce((n, i) => { const p = ANEMO.product(i.id); return n + (p ? p.price * i.qty : 0); }, 0); },
    addToCart(id, size, qty) {
      size = size || 'M'; qty = qty || 1;
      const ex = data.cart.find(i => i.id === id && i.size === size);
      if (ex) ex.qty += qty; else data.cart.push({ id, size, qty });
      persist();
    },
    setQty(id, size, qty) {
      const i = data.cart.find(x => x.id === id && x.size === size); if (!i) return;
      i.qty = qty; if (i.qty <= 0) data.cart = data.cart.filter(x => x !== i); persist();
    },
    toggleWish(id) { const i = data.wishlist.indexOf(id); if (i >= 0) data.wishlist.splice(i, 1); else data.wishlist.push(id); persist(); },
    isWished(id) { return data.wishlist.includes(id); },

    async placeOrder() {
      if (!user) throw new Error('login');
      if (!data.cart.length) throw new Error('Your cart is empty.');
      const order = { items: data.cart.map(i => Object.assign({}, i)), total: Store.cartTotal(), status: 'placed', created_at: new Date().toISOString() };
      if (sb) { const { error } = await sb.from('orders').insert({ user_id: user.id, items: order.items, total: order.total }); if (error) throw error; }
      else { const k = 'anemo_orders_' + user.id; const o = LS.get(k, []); o.unshift(Object.assign({ id: Date.now() }, order)); LS.set(k, o); }
      data.cart = []; persist(); return order;
    },
    async orders() {
      if (!user) return [];
      if (sb) { const { data: rows } = await sb.from('orders').select('*').order('created_at', { ascending: false }); return rows || []; }
      return LS.get('anemo_orders_' + user.id, []);
    },

    /* reviews */
    async reviews() {
      let extra = [];
      if (sb) { try { const { data: rows } = await sb.from('reviews').select('*').order('created_at', { ascending: false }).limit(20); extra = (rows || []).map(r => ({ n: r.name, city: 'Anemo member', stars: r.stars, realm: r.realm, text: r.text })); } catch (e) {} }
      else extra = LS.get('anemo_reviews', []);
      return extra.concat(ANEMO.reviews);
    },
    async addReview(rv) {
      if (!user) throw new Error('login');
      rv = { n: user.name, city: 'Anemo member', stars: rv.stars, realm: rv.realm, text: rv.text };
      if (sb) { const { error } = await sb.from('reviews').insert({ user_id: user.id, name: rv.n, realm: rv.realm, stars: rv.stars, text: rv.text }); if (error) throw error; }
      else { const a = LS.get('anemo_reviews', []); a.unshift(rv); LS.set('anemo_reviews', a); }
      return rv;
    }
  };
  window.Store = Store;
})();
