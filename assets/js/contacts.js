// Канал связи: конфиг, капсула-маяк, голографическая карта, QR-vCard
const CONTACTS = {
  name: 'Valerij Vasiljev',
  email: 'valerij-vasiljev@list.ru',
  telegram: '@valer_vasilev',
  telegramUrl: 'https://t.me/valer_vasilev',
  site: 'https://tvoymagazine.ru',
};

(() => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const btn = document.getElementById('signalBtn');
  const card = document.getElementById('holoCard');
  if (!btn || !card) return;

  const closeBtn = card.querySelector('.holo-card__close');
  const title = card.querySelector('.holo-card__title');
  if (title) title.textContent = CONTACTS.name;
  card.querySelectorAll('[data-copy]').forEach((chip) => {
    chip.textContent = CONTACTS[chip.dataset.copy];
  });
  const links = card.querySelectorAll('.holo-card__links a');
  if (links[0]) { links[0].href = CONTACTS.telegramUrl; links[0].textContent = CONTACTS.telegram; }
  if (links[1]) links[1].href = 'mailto:' + CONTACTS.email;

  // QR-vCard: скан с телефона = контакт сразу в телефонной книге
  const vcard = [
    'BEGIN:VCARD', 'VERSION:3.0',
    'FN:' + CONTACTS.name,
    'EMAIL:' + CONTACTS.email,
    'URL:' + CONTACTS.site,
    'X-SOCIALPROFILE;TYPE=telegram:' + CONTACTS.telegramUrl,
    'END:VCARD',
  ].join('\n');
  const qrWrap = card.querySelector('.holo-card__qr');
  const qr = document.getElementById('qrCanvas');
  if (qr && window.QRCode) {
    QRCode.toCanvas(qr, vcard, {
      width: 220,
      margin: 1,
      color: { dark: '#05101A', light: '#E9EEF2' },
    }).catch(() => { if (qrWrap) qrWrap.hidden = true; });
  } else if (qrWrap) {
    qrWrap.hidden = true; // нет CDN — карта работает без QR, ничего не падает
  }

  // копирование с вспышкой «скопировано»
  card.querySelectorAll('[data-copy]').forEach((chip) => {
    chip.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CONTACTS[chip.dataset.copy]);
        chip.classList.add('is-copied');
        setTimeout(() => chip.classList.remove('is-copied'), 1400);
      } catch (e) { /* браузер не дал буфер — пользователь выделит сам */ }
    });
  });

  // открытие / закрытие с возвратом фокуса
  const open = () => {
    card.hidden = false;
    requestAnimationFrame(() => card.classList.add('is-open'));
    if (closeBtn) closeBtn.focus();
  };
  const close = () => {
    card.classList.remove('is-open');
    setTimeout(() => { card.hidden = true; btn.focus(); }, rm ? 0 : 250);
  };
  btn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  card.addEventListener('click', (e) => { if (e.target === card) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !card.hidden) close(); });
})();