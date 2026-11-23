/* ANEMO — catalogue, reviews, FAQ. Demo data: prices, ratings and reviews are placeholders. */
(function () {
  const realms = [
    { id: 'lily', name: 'Blood Lily', jp: '華', place: 'Higanbana Realm', color: '#E5482A', ink: '#140A07', tee: '#1b1b1e', img: 'realm-lily.png',
      blurb: 'A field of red under a crescent moon. Beautiful, and a little dangerous.', sfx: 'WHOOSH' },
    { id: 'cosmic', name: 'Cosmic', jp: '宙', place: 'Galaxy Realm', color: '#8B6BFF', ink: '#0A0620', tee: '#17171c', img: 'realm-cosmic.png',
      blurb: 'Two moons, a violet nebula, and nothing but quiet between the stars.', sfx: 'ZAP!' },
    { id: 'celestial', name: 'Celestial', jp: '天', place: 'Crystal Realm', color: '#4FD1C5', ink: '#06222A', tee: '#efe9dc', img: 'realm-celestial.webp',
      blurb: 'Towers of glass light in a forest that has never seen winter.', sfx: 'KIIIN' },
    { id: 'cloudy', name: 'Cloudy', jp: '雲', place: 'Sky Realm', color: '#8EC5FF', ink: '#10223F', tee: '#f6f6f4', img: 'realm-cloudy.webp',
      blurb: 'Mountains floating above a sea of cloud. Calm surface, long horizon.', sfx: 'FWOOSH' }
  ];
  // one design per realm; "lines" keeps the colour/name lookups used by the UI
  const lines = realms.map(r => ({ id: r.id, name: r.name, jp: r.jp, place: r.place, color: r.color, ink: r.ink, tee: r.tee, blurb: r.blurb, sfx: r.sfx }));

  const types = { limited: { label: 'Limited', price: 1999, mrp: 2599 } };

  const meta = {
    lily:      { name: 'Higanbana Night Tee',  photo: 'tee-lily.jpg',      base: 'Washed black',  scribbles: ['red lilies, hand-lit at night', 'print melts into the cotton', 'moonlit, never flat'], rating: 4.8, reviews: 214, stock: 18 },
    cosmic:    { name: 'Cosmic Drift Tee',     photo: 'tee-cosmic.jpg',    base: 'Jet black',     scribbles: ['nebula in violet + blue', 'fades out like deep space', 'two moons, one quiet sky'], rating: 4.9, reviews: 261, stock: 24 },
    celestial: { name: 'Crystal Grove Tee',    photo: 'tee-celestial.jpg', base: 'Ivory',         scribbles: ['watercolour wash, dyed in', 'turquoise glow in the crystals', 'soft edges, no hard box'], rating: 4.7, reviews: 148, stock: 15 },
    cloudy:    { name: 'Cloud Peaks Tee',      photo: 'tee-cloudy.jpg',    base: 'Optic white',   scribbles: ['pastel peaks above the clouds', 'airy fade into the fabric', 'light as a morning sky'], rating: 4.8, reviews: 189, stock: 30 }
  };

  const products = realms.map(r => {
    const m = meta[r.id], T = types.limited;
    return {
      id: r.id + '-tee', realm: r.id, line: r.id, type: 'limited',
      name: m.name, short: r.place + ' · Limited', price: T.price, mrp: T.mrp,
      rating: m.rating, reviews: m.reviews, stock: m.stock, tag: 'Limited drop',
      photo: '../assets/' + m.photo, view: 'front', placement: 'front, full', printSize: '30 × 36 cm',
      desc: r.blurb + ' One of only four designs, printed so it blends into the fabric.',
      scribbles: m.scribbles, sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      specs: ['280 GSM combed cotton · ' + m.base, 'Oversized drop-shoulder fit', 'Soft-hand print that blends into the fabric', 'Ships in the Anemo crate']
    };
  });

  const reviews = [
    { n: 'Aarav M.', city: 'Pune', stars: 5, realm: 'cosmic', text: 'The nebula print fades into the black cotton like it was always there. Properly oversized fit too.' },
    { n: 'Sana K.', city: 'Mumbai', stars: 5, realm: 'cloudy', text: 'Unboxing felt like opening a gift in a manga. Print is crisp and the cotton is soft.' },
    { n: 'Rohan D.', city: 'Bengaluru', stars: 4, realm: 'cloudy', text: 'Love the blues. Ordered L, wanted a little more length but the drop shoulder is perfect.' },
    { n: 'Ishita P.', city: 'Delhi', stars: 5, realm: 'lily', text: 'The lilies look lit from inside. Print has not cracked or faded after three washes.' },
    { n: 'Kabir S.', city: 'Jaipur', stars: 5, realm: 'celestial', text: 'Clean design. Finally an anime tee that does not look like a cheap poster.' },
    { n: 'Meera T.', city: 'Kolkata', stars: 4, realm: 'cloudy', text: 'Packaging is the best part. Tee quality is great too. Shipping took 4 days.' }
  ];

  const faqs = [
    { q: 'What sizes do you have?', a: 'S to XXL. All tees are oversized with a drop shoulder, so most people stay true to size. Between sizes? Go down for a snug look, stay for relaxed.' },
    { q: 'What is the fabric?', a: '280 GSM combed cotton. Heavy, soft, and it holds its shape after washing.' },
    { q: 'How are the designs printed?', a: 'Soft-hand prints that blend into the fabric instead of sitting on top of it, so there is no stiff plastic patch. Only four designs exist, one per realm.' },
    { q: 'How long does delivery take?', a: 'Metro cities 3–5 days, rest of India 5–8 days. You get tracking as soon as it ships.' },
    { q: 'Can I return or exchange?', a: 'Yes. Size exchanges within 7 days of delivery, as long as the tee is unworn with tags. Print defects get a free replacement.' },
    { q: 'Do I need an account to order?', a: 'No, but with an account your cart, wishlist and the realms you explored are saved, and you can pick up where you left off on any device.' },
    { q: 'What is the Anemo crate?', a: 'Every tee ships in a black crate with a pink hemp-leaf lining, a leather strap, a bamboo charm and a handwritten note. Scroll to the packaging chapter to see it open.' }
  ];

  window.ANEMO = { realms, lines, types, products, reviews, faqs,
    realm: id => realms.find(r => r.id === id),
    line: id => lines.find(r => r.id === id),
    product: id => products.find(p => p.id === id) };
})();
