(() => {
  const form = document.getElementById('ai-photo-form');
  if (!form) return;
  const input = document.getElementById('ai-photo-input');
  const preview = document.getElementById('ai-photo-preview');
  const submit = document.getElementById('ai-analyze-btn');
  const status = document.getElementById('ai-photo-status');
  const result = document.getElementById('ai-photo-result');
  const resultText = document.getElementById('ai-photo-result-text');
  const searchBtn = document.getElementById('ai-search-catalog');
  let selectedFile = null;
  let lastAnalysis = null;

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('error', isError);
  };

  input.addEventListener('change', () => {
    selectedFile = input.files && input.files[0] ? input.files[0] : null;
    result.hidden = true;
    lastAnalysis = null;
    if (!selectedFile) {
      preview.hidden = true;
      preview.removeAttribute('src');
      submit.disabled = true;
      setStatus('');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      selectedFile = null;
      input.value = '';
      submit.disabled = true;
      preview.hidden = true;
      setStatus('Выбери изображение в формате JPG, PNG или WebP.', true);
      return;
    }
    if (selectedFile.size > 8 * 1024 * 1024) {
      selectedFile = null;
      input.value = '';
      submit.disabled = true;
      preview.hidden = true;
      setStatus('Файл больше 8 МБ. Выбери фотографию поменьше.', true);
      return;
    }
    preview.src = URL.createObjectURL(selectedFile);
    preview.hidden = false;
    submit.disabled = false;
    setStatus('Фото готово к распознаванию.');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!selectedFile) return;
    submit.disabled = true;
    submit.textContent = 'Анализирую фото…';
    result.hidden = true;
    setStatus('ИИ рассматривает изображение. Обычно это занимает несколько секунд.');
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
        reader.readAsDataURL(selectedFile);
      });
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Не удалось распознать фотографию.');
      lastAnalysis = payload.analysis;
      const a = lastAnalysis;
      resultText.textContent =
        `Предмет: ${a.name || 'не удалось точно определить'}\n` +
        `Категория: ${a.category || 'не определена'}\n` +
        `Бренд: ${a.brand || 'не удалось определить по фото'}\n` +
        `Описание: ${a.description || 'нет дополнительного описания'}\n` +
        `Видимые детали: ${a.visual_details || 'не указаны'}\n` +
        `Поисковые запросы: ${(Array.isArray(a.search_queries) ? a.search_queries : []).join(', ') || a.name || 'не указаны'}`;
      result.hidden = false;
      setStatus('Готово! Проверь описание: ИИ может ошибаться, особенно с брендами и моделью.');
    } catch (error) {
      setStatus(error.message || 'Ошибка при распознавании. Попробуй ещё раз.', true);
    } finally {
      submit.disabled = !selectedFile;
      submit.textContent = 'Распознать товар ✨';
    }
  });

  searchBtn.addEventListener('click', () => {
    if (!lastAnalysis) return;
    const terms = [lastAnalysis.name, ...(lastAnalysis.search_queries || [])]
      .filter(Boolean).map(v => String(v).toLocaleLowerCase('ru'));
    const cards = Array.from(document.querySelectorAll('#products-container .product-card'));
    let matches = 0;
    cards.forEach(card => {
      const text = card.textContent.toLocaleLowerCase('ru');
      const matched = terms.some(term => term.length > 2 && text.includes(term));
      card.classList.toggle('ai-match', matched);
      if (matched) matches++;
    });
    const container = document.getElementById('products-container');
    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (matches) setStatus(`В твоём текущем списке найдено совпадений: ${matches}. Они выделены рамкой.`);
    else setStatus('В текущем списке точных совпадений не найдено. Попробуй добавить распознанное название вручную.');
  });
})();