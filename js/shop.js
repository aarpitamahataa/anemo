(async function () {
  const { $, $$ } = UI;
  await Store.init(); UI.mount('shop', { search: true });
  const P = new URLSearchParams(location.search);
  const state = { realms: new Set(ANEMO.realm(P.get('realm')) ? [P.get('realm')] : []), types: new Set(), price: '', rate: '', low: false, q: P.get('q') || '', sort: 'feat' };
  $('#q').value = state.q;

  const rb = $('#realmbar');
  rb.innerHTML = '<button data-r="">All</button>' + ANEMO.realms.map(r => `<button data-r="${r.id}">${r.name}</button>`).join('');

  function banner() {
    const b = $('#rbanner');
    if (state.realms.size === 1) { const r = ANEMO.realm([...state.realms][0]); b.hidden = false; b.style.setProperty('--img', 'url(../assets/' + r.img + ')'); b.innerHTML = `<b>${r.name} Realm</b><span>${r.blurb}</span>`; }
    else b.hidden = true;
  }
  function sync() {
    $$('#realmbar button').forEach(b => b.classList.toggle('on', b.dataset.r ? (state.realms.size === 1 && state.realms.has(b.dataset.r)) : state.realms.size === 0));
  }
  function run() {
    let list = ANEMO.products.filter(p => {
      if (state.realms.size && !state.realms.has(p.realm)) return false;
      if (state.types.size && !state.types.has(p.type)) return false;
      if (state.price) { const [a, b] = state.price.split('-').map(Number); if (p.price < a || p.price > b) return false; }
      if (state.rate && p.rating < +state.rate) return false;
      if (state.low && p.stock > 20) return false;
      if (state.q) { const s = (p.name + ' ' + ANEMO.realm(p.realm).name + ' ' + p.type + ' ' + ANEMO.realm(p.realm).place).toLowerCase(); if (!state.q.toLowerCase().split(/\s+/).every(w => s.includes(w))) return false; }
      return true;
    });
    const s = state.sort;
    if (s === 'pl') list.sort((a, b) => a.price - b.price); else if (s === 'ph') list.sort((a, b) => b.price - a.price); else if (s === 'rate') list.sort((a, b) => b.rating - a.rating);
    $('#count').innerHTML = `<b>${list.length}</b> tee${list.length === 1 ? '' : 's'}${state.q ? ` for “<b>${state.q.replace(/</g, '&lt;')}</b>”` : ''}`;
    $('#grid').innerHTML = list.length ? list.map(UI.card).join('') : '<p class="noresult">No tees match these filters.<br><button class="link" id="reset">Clear filters</button></p>';
    const r = $('#reset'); if (r) r.onclick = clearAll;
    sync(); banner();
  }
  function clearAll() {
    state.realms.clear(); state.types.clear(); state.price = ''; state.rate = ''; state.low = false; state.q = ''; $('#q').value = '';
    run();
  }
  rb.onclick = e => { const b = e.target.closest('button'); if (!b) return; state.realms.clear(); if (b.dataset.r) state.realms.add(b.dataset.r); run(); };
  $('#filters').onchange = e => {
    const t = e.target;
    if (t.dataset.type) t.checked ? state.types.add(t.dataset.type) : state.types.delete(t.dataset.type);
    if (t.name === 'price') state.price = t.value; if (t.name === 'rate') state.rate = t.value; if (t.id === 'fLow') state.low = t.checked;
    if (t.id === 'sort') state.sort = t.value;
    run();
  };
  $('#clear').onclick = clearAll;
  $('#hsearch').onsubmit = e => { e.preventDefault(); state.q = $('#q').value.trim(); run(); };
  run();
})();
