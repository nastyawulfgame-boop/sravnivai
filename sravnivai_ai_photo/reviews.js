/* Отзывы сайта: демонстрационное хранение на устройстве пользователя. */
(() => {
  const KEY = 'sravnivaiSiteReviews_v1';
  const $ = id => document.getElementById(id);
  const form = $('review-form');
  if (!form) return;
  const nameField = $('review-name'), textField = $('review-text'), status = $('review-status');
  function load() {
    try { const rows = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(rows) ? rows.filter(x => x && typeof x.text === 'string' && Number(x.rating) >= 1 && Number(x.rating) <= 5) : []; }
    catch { return []; }
  }
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
  function render() {
    const reviews = load(), count = reviews.length;
    const avg = count ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count : 0;
    $('average-rating').textContent = count ? avg.toFixed(1).replace('.', ',') : '—';
    $('average-stars').textContent = count ? stars(Math.round(avg)) : '☆☆☆☆☆';
    $('review-count').textContent = count === 0 ? 'Пока нет отзывов' : `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'отзыв' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'отзыва' : 'отзывов'}`;
    $('reviews-total-badge').textContent = String(count);
    const list = $('reviews-list'); list.replaceChildren();
    if (!count) { const empty=document.createElement('p'); empty.className='reviews-empty'; empty.textContent='Пока отзывов нет. Будьте первым!'; list.append(empty); return; }
    reviews.slice().reverse().forEach(review => {
      const card=document.createElement('article'); card.className='review-card';
      const top=document.createElement('div'); top.className='review-card-top';
      const author=document.createElement('strong'); author.className='review-author'; author.textContent=review.name || 'Пользователь';
      const score=document.createElement('span'); score.className='review-card-stars'; score.textContent=stars(Number(review.rating)); score.setAttribute('aria-label',`Оценка: ${review.rating} из 5`);
      top.append(author,score);
      const date=document.createElement('time'); date.className='review-date'; date.textContent=review.createdAt ? new Date(review.createdAt).toLocaleDateString('ru-RU') : '';
      const body=document.createElement('p'); body.className='review-card-text'; body.textContent=review.text;
      card.append(top,date,body); list.append(card);
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name=nameField.value.trim(), text=textField.value.trim(), rating=Number(form.querySelector('input[name="rating"]:checked')?.value);
    if (name.length < 2) { status.textContent='Введите имя или ник (минимум 2 символа).'; return; }
    if (!rating || text.length < 3) { status.textContent='Поставьте оценку и напишите отзыв.'; return; }
    const reviews=load();
    reviews.push({id:Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),name:name.slice(0,40),rating,text:text.slice(0,700),createdAt:new Date().toISOString()});
    try { localStorage.setItem(KEY,JSON.stringify(reviews)); form.reset(); status.textContent='Спасибо! Ваш отзыв добавлен.'; render(); }
    catch { status.textContent='Не удалось сохранить отзыв: хранилище браузера недоступно.'; }
  });
  render();
})();
