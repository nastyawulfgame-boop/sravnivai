const form = document.getElementById('ai-photo-form');
const input = document.getElementById('ai-photo-input');
const preview = document.getElementById('ai-photo-preview');
const submit = document.getElementById('ai-analyze-btn');
const status = document.getElementById('ai-photo-status');
const result = document.getElementById('ai-photo-result');
const resultText = document.getElementById('ai-photo-result-text');
const searchBtn = document.getElementById('ai-search-catalog');
const matchesBox = document.getElementById('ai-catalog-matches');
let selectedFile = null;
let lastAnalysis = null;
let classifierPromise = null;

// CLIP — модель распознавания изображений, запускаемая в браузере пользователя.
// Она скачивается с публичного CDN/репозитория модели при первом использовании.
const candidates = [
  ['smartphone', 'смартфон', ['телефон', 'мобильный телефон', 'смартфон']],
  ['wireless headphones', 'беспроводные наушники', ['наушники', 'гарнитура', 'airpods']],
  ['smart watch', 'умные часы', ['часы', 'смарт-часы', 'фитнес-браслет']],
  ['laptop computer', 'ноутбук', ['ноутбук', 'лэптоп', 'компьютер']],
  ['tablet computer', 'планшет', ['планшет', 'ipad']],
  ['desktop computer monitor', 'монитор', ['монитор', 'экран']],
  ['computer keyboard', 'клавиатура', ['клавиатура']],
  ['computer mouse', 'компьютерная мышь', ['мышь', 'компьютерная мышь']],
  ['camera', 'фотоаппарат', ['камера', 'фотоаппарат']],
  ['television', 'телевизор', ['телевизор', 'тв']],
  ['video game controller', 'игровой контроллер', ['геймпад', 'контроллер']],
  ['speaker', 'колонка', ['колонка', 'динамик']],
  ['printer', 'принтер', ['принтер']],
  ['sneakers', 'кроссовки', ['кроссовки', 'обувь', 'кеды']],
  ['boots', 'ботинки', ['ботинки', 'сапоги', 'обувь']],
  ['dress', 'платье', ['платье', 'одежда']],
  ['coat', 'пальто', ['пальто', 'верхняя одежда']],
  ['jacket', 'куртка', ['куртка', 'ветровка', 'одежда']],
  ['t-shirt', 'футболка', ['футболка', 'одежда']],
  ['jeans', 'джинсы', ['джинсы', 'брюки', 'одежда']],
  ['handbag', 'сумка', ['сумка', 'дамская сумка']],
  ['backpack', 'рюкзак', ['рюкзак', 'сумка']],
  ['sunglasses', 'солнцезащитные очки', ['очки', 'солнцезащитные очки']],
  ['wristwatch', 'наручные часы', ['часы', 'наручные часы']],
  ['perfume bottle', 'флакон духов', ['духи', 'парфюм', 'аромат']],
  ['cosmetics makeup', 'косметика', ['косметика', 'макияж', 'помада']],
  ['skincare bottle', 'средство для ухода за кожей', ['крем', 'уход', 'косметика']],
  ['ring jewelry', 'кольцо', ['кольцо', 'украшение', 'ювелирное']],
  ['necklace jewelry', 'ожерелье', ['ожерелье', 'цепочка', 'украшение']],
  ['chair', 'стул', ['стул', 'мебель']],
  ['sofa couch', 'диван', ['диван', 'мебель']],
  ['table desk', 'стол', ['стол', 'мебель']],
  ['lamp', 'лампа', ['лампа', 'светильник']],
  ['mug cup', 'кружка', ['кружка', 'чашка']],
  ['water bottle', 'бутылка', ['бутылка', 'термос']],
  ['book', 'книга', ['книга']],
  ['suitcase luggage', 'чемодан', ['чемодан', 'багаж']],
  ['bicycle', 'велосипед', ['велосипед', 'байк']],
  ['motorcycle', 'мотоцикл', ['мотоцикл', 'мото', 'эндуро']],
  ['motorcycle helmet', 'мотоциклетный шлем', ['шлем', 'мотоциклетный шлем']],
  ['car', 'автомобиль', ['автомобиль', 'машина', 'авто']],
  ['cat', 'кошка', ['кошка', 'кот']],
  ['dog', 'собака', ['собака', 'пёс']],
  ['plant in a pot', 'растение в горшке', ['растение', 'цветок']],
  ['toy', 'игрушка', ['игрушка']],
  ['refrigerator', 'холодильник', ['холодильник', 'бытовая техника']],
  ['vacuum cleaner', 'пылесос', ['пылесос', 'бытовая техника']],
  ['power drill tool', 'электроинструмент', ['дрель', 'инструмент']],
  ['food package', 'упаковка продукта питания', ['еда', 'продукт', 'упаковка']]
];
const candidateByEnglish = new Map(candidates.map(item => [item[0], item]));

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

async function getClassifier() {
  if (!classifierPromise) {
    classifierPromise = import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2')
      .then(({ pipeline, env }) => {
        env.allowLocalModels = false;
        return pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
          progress_callback: info => {
            if (info && info.status === 'progress' && Number.isFinite(info.progress)) {
              setStatus(`Загружается модель ИИ: ${Math.round(info.progress)}%… При первом запуске загрузка может занять время.`);
            } else if (info && info.status === 'downloading') {
              setStatus('Скачиваю модель распознавания. Это нужно только при первом запуске…');
            }
          }
        });
      })
      .catch(error => {
        classifierPromise = null;
        throw new Error('Не удалось загрузить бесплатную модель ИИ. Проверь подключение к интернету и попробуй снова.');
      });
  }
  return classifierPromise;
}

input.addEventListener('change', () => {
  selectedFile = input.files?.[0] || null;
  result.hidden = true;
  matchesBox.hidden = true;
  lastAnalysis = null;
  if (!selectedFile) {
    preview.hidden = true;
    preview.removeAttribute('src');
    submit.disabled = true;
    setStatus('');
    return;
  }
  if (!selectedFile.type.startsWith('image/')) {
    selectedFile = null;
    input.value = '';
    submit.disabled = true;
    preview.hidden = true;
    setStatus('Это не изображение. Выбери фотографию товара.', true);
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
  preview.hidden = true;
  submit.disabled = true;
  setStatus('Открываю фотографию…');
  const objectUrl = URL.createObjectURL(selectedFile);
  preview.onload = () => {
    preview.hidden = false;
    submit.disabled = false;
    setStatus('Фото прикреплено. Нажми «Распознать товар». Бесплатно, без API-ключа.');
    URL.revokeObjectURL(objectUrl);
  };
  preview.onerror = () => {
    preview.hidden = true;
    submit.disabled = true;
    setStatus('Не удалось открыть этот формат фото. Попробуй сохранить изображение как JPG или PNG и прикрепить снова.', true);
    URL.revokeObjectURL(objectUrl);
  };
  preview.src = objectUrl;
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!selectedFile) return;
  submit.disabled = true;
  submit.textContent = 'Загружаю ИИ…';
  result.hidden = true;
  matchesBox.hidden = true;
  try {
    setStatus('Подготавливаю бесплатную модель распознавания… При первом запуске потребуется скачать её из интернета.');
    const classifier = await getClassifier();
    submit.textContent = 'Распознаю фото…';
    setStatus('Рассматриваю фотографию…');
    const predictions = await classifier(preview, candidates.map(item => `a photo of ${item[0]}`), { top_k: 5 });
    const normalized = (Array.isArray(predictions) ? predictions : [predictions])
      .map(item => {
        const raw = String(item.label || '').replace(/^a photo of /i, '');
        const candidate = candidateByEnglish.get(raw);
        return candidate ? { label: candidate[1], aliases: candidate[2], score: Number(item.score || 0) } : null;
      }).filter(Boolean);
    if (!normalized.length) throw new Error('Не удалось определить предмет на фото. Попробуй другое изображение.');
    lastAnalysis = { predictions: normalized };
    resultText.replaceChildren();
    const intro = document.createElement('p');
    intro.textContent = `Похоже, на фото: ${normalized[0].label}.`;
    resultText.append(intro);
    const list = document.createElement('ul');
    normalized.slice(0, 5).forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.label} — уверенность модели около ${Math.round(item.score * 100)}%`;
      list.append(li);
    });
    resultText.append(list);
    const note = document.createElement('p');
    note.className = 'ai-note';
    note.textContent = 'Это распознавание категории, а не точная идентификация бренда или модели. Результат может ошибаться.';
    resultText.append(note);
    result.hidden = false;
    setStatus('Готово! Теперь можно поискать похожие товары во всех твоих списках.');
  } catch (error) {
    setStatus(error.message || 'Ошибка при распознавании. Попробуй ещё раз.', true);
  } finally {
    submit.disabled = !selectedFile;
    submit.textContent = 'Распознать товар ✨';
  }
});

searchBtn.addEventListener('click', () => {
  if (!lastAnalysis) return;
  const terms = [...new Set(lastAnalysis.predictions.flatMap(item => [item.label, ...item.aliases])
    .map(term => term.toLocaleLowerCase('ru').trim()).filter(term => term.length > 2))];
  const allProducts = typeof window.getAllCatalogProducts === 'function' ? window.getAllCatalogProducts() : [];
  const matches = allProducts.map(product => {
    const haystack = `${product.title} ${product.description}`.toLocaleLowerCase('ru');
    const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? (term.length > 7 ? 2 : 1) : 0), 0);
    return { ...product, score };
  }).filter(product => product.score > 0).sort((a, b) => b.score - a.score);
  matchesBox.replaceChildren();
  const heading = document.createElement('h4');
  heading.textContent = matches.length ? `Найдены похожие товары (${matches.length})` : 'Товара нет в каталоге';
  matchesBox.append(heading);
  if (!matches.length) {
    const message = document.createElement('p');
    message.className = 'ai-no-product';
    message.textContent = allProducts.length
      ? 'Товара нет в каталоге. Среди сохранённых товаров похожий не найден. Добавь его в список или попробуй фото другого ракурса.'
      : 'Товара нет в каталоге: пока ни в одном списке нет сохранённых товаров. Сначала создай список и добавь товары, затем повтори поиск.';
    matchesBox.append(message);
  } else {
    const list = document.createElement('ul');
    matches.slice(0, 20).forEach(product => {
      const li = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = product.title;
      const details = document.createElement('span');
      details.textContent = ` — ${product.price || 'цена не указана'} · список «${product.listName}»`;
      li.append(name, details);
      list.append(li);
    });
    matchesBox.append(list);
  }
  matchesBox.hidden = false;
  matchesBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
