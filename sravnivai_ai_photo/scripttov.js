(() => {
  const imageForTitle = title => {
    const t = String(title || '').toLocaleLowerCase('ru');
    const rules = [
      [/наушник|гарнитур/, 'headphones.jpg'], [/смартфон|чехол/, 'smartphone.jpg'], [/ноутбук|клавиатур|мышь|планшет/, 'laptop.jpg'], [/часы/, 'watch.jpg'],
      [/пальто|куртк|футболк|джинс/, 'clothing.jpg'], [/кроссовк|обув|сумк|рюкзак|кошелёк|очки/, 'fashion.jpg'],
      [/ламп|кружк|плед|органайзер|постельн/, 'home.jpg'], [/крем|тушь|бальзам|парфюм|расчёск/, 'beauty.jpg'],
      [/коврик|бутылк|скакалк|фитнес|резинк/, 'fitness.jpg']
    ];
    const match = rules.find(([re]) => re.test(t));
    return 'products/images/' + (match ? match[1] : 'accessories.jpg');
  };
  const STORAGE_KEY = 'myCatalogData';
  const defaults = [{id:'list_1',name:'Избранное',products:[
    {title:'Беспроводные наушники',description:'Качественный звук и активное шумоподавление.',price:'4 990 ₽'},
    {title:'Умные часы',description:'Отслеживание активности и уведомления со смартфона.',price:'8 500 ₽'}
  ]}];
  let catalogData;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    catalogData = Array.isArray(saved) ? saved : defaults;
  } catch { catalogData = defaults; }
  catalogData = catalogData.map((l,i) => ({
    id: String(l.id || ('list_'+Date.now()+'_'+i)),
    name: String(l.name || 'Новый список'),
    products: Array.isArray(l.products) ? l.products.map(p=>({
      title:String(p.title || 'Без названия'), description:String(p.description || ''), price:String(p.price || '0 ₽'), image:String(p.image || imageForTitle(p.title || ''))
    })) : []
  }));

  // Демонстрационные списки добавляются один раз и не дублируются при следующих посещениях.
  // В уже существующем каталоге пользовательские списки и товары сохраняются.
  const DEMO_SEED_KEY = 'myCatalogDemoSeed_v2';
  const demoLists = [
    { name:'Электроника', products:[
      {title:'Смартфон Samsung Galaxy A55',description:'Смартфон с ярким экраном и камерой высокого разрешения.',price:'34 990 ₽'},
      {title:'Ноутбук Lenovo IdeaPad Slim 3',description:'Ноутбук для учёбы, работы и повседневных задач.',price:'49 990 ₽'},
      {title:'Планшет Xiaomi Redmi Pad SE',description:'Планшет для видео, чтения и учёбы.',price:'17 990 ₽'},
      {title:'Игровая мышь Logitech G102',description:'Проводная мышь с настраиваемой подсветкой.',price:'2 490 ₽'},
      {title:'Механическая клавиатура Redragon Kumara',description:'Компактная клавиатура для игр и набора текста.',price:'3 990 ₽'}
    ]},
    { name:'Одежда и обувь', products:[
      {title:'Однотонное пальто прямого кроя',description:'Базовое демисезонное пальто в минималистичном стиле.',price:'5 990 ₽'},
      {title:'Белая базовая футболка',description:'Хлопковая футболка свободного кроя.',price:'990 ₽'},
      {title:'Прямые синие джинсы',description:'Повседневные джинсы с высокой посадкой.',price:'2 790 ₽'},
      {title:'Чёрные кроссовки',description:'Универсальные кроссовки для прогулок.',price:'3 490 ₽'},
      {title:'Кожаная куртка-косуха',description:'Куртка в байкерском стиле с металлической фурнитурой.',price:'6 990 ₽'}
    ]},
    { name:'Дом и уют', products:[
      {title:'Настольная LED-лампа',description:'Лампа с регулировкой яркости для рабочего стола.',price:'1 790 ₽'},
      {title:'Керамическая кружка 350 мл',description:'Глазурованная кружка для чая и кофе.',price:'490 ₽'},
      {title:'Мягкий плед',description:'Уютный плед для дивана или кровати.',price:'1 290 ₽'},
      {title:'Органайзер для косметики',description:'Настольный органайзер с несколькими отделениями.',price:'890 ₽'},
      {title:'Комплект постельного белья',description:'Комплект из приятной к телу ткани для двуспальной кровати.',price:'3 490 ₽'}
    ]},
    { name:'Красота и уход', products:[
      {title:'Увлажняющий крем для лица',description:'Крем для ежедневного ухода за кожей.',price:'1 190 ₽'},
      {title:'Тушь для ресниц',description:'Тушь для объёма и разделения ресниц.',price:'790 ₽'},
      {title:'Увлажняющий бальзам для губ',description:'Бальзам для ежедневного ухода за губами.',price:'350 ₽'},
      {title:'Парфюмированный спрей',description:'Лёгкий аромат для повседневного использования.',price:'1 490 ₽'},
      {title:'Расчёска для волос',description:'Расчёска для бережного распутывания волос.',price:'590 ₽'}
    ]},
    { name:'Спорт и отдых', products:[
      {title:'Йога-коврик',description:'Нескользящий коврик для растяжки и домашних тренировок.',price:'1 590 ₽'},
      {title:'Бутылка для воды 750 мл',description:'Многоразовая бутылка для тренировок и прогулок.',price:'690 ₽'},
      {title:'Рюкзак городской',description:'Вместительный рюкзак для учёбы и коротких поездок.',price:'2 490 ₽'},
      {title:'Скакалка спортивная',description:'Скакалка с регулируемой длиной для кардиотренировок.',price:'390 ₽'},
      {title:'Фитнес-резинки набор',description:'Набор эластичных лент для домашних упражнений.',price:'790 ₽'}
    ]},
    { name:'Аксессуары', products:[
      {title:'Солнцезащитные очки',description:'Очки в универсальной оправе для солнечной погоды.',price:'1 490 ₽'},
      {title:'Наручные часы классические',description:'Лаконичные часы на каждый день.',price:'2 990 ₽'},
      {title:'Сумка через плечо',description:'Компактная сумка для телефона, ключей и мелочей.',price:'1 790 ₽'},
      {title:'Кошелёк компактный',description:'Небольшой кошелёк с отделениями для карт.',price:'990 ₽'},
      {title:'Чехол для смартфона',description:'Защитный чехол с нескользящей поверхностью.',price:'590 ₽'}
    ]}
  ];
  try {
    if (!localStorage.getItem(DEMO_SEED_KEY)) {
      demoLists.forEach((demo, index) => {
        let existing = catalogData.find(list => list.name.toLocaleLowerCase('ru') === demo.name.toLocaleLowerCase('ru'));
        if (!existing) {
          existing = { id:'demo_'+(index+1), name:demo.name, products:[] };
          catalogData.push(existing);
        }
        demo.products.forEach(product => {
          if (!existing.products.some(item => item.title.toLocaleLowerCase('ru') === product.title.toLocaleLowerCase('ru'))) {
            existing.products.push({...product, image:imageForTitle(product.title)});
          }
        });
      });
      localStorage.setItem(DEMO_SEED_KEY, '1');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(catalogData));
    }
  } catch { /* Каталог продолжит работать даже при недоступном localStorage. */ }

  let activeListId = catalogData[0]?.id || null;
  const $ = id => document.getElementById(id);
  const escapeText = value => String(value ?? '');
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(catalogData)); } catch { alert('Не удалось сохранить данные в браузере.'); } }
  function currentList() { return catalogData.find(list => list.id === activeListId) || null; }
  function makeButton(text, className, action, label) {
    const button = document.createElement('button'); button.type='button'; button.className=className; button.textContent=text;
    if(label) button.setAttribute('aria-label',label);
    button.addEventListener('click', action); return button;
  }
  // Доступ для поиска распознанного объекта по всем сохранённым спискам.
  window.getAllCatalogProducts = () => catalogData.flatMap(list => list.products.map(product => ({
    ...product, listName: list.name, listId: list.id
  })));
  window.selectList = id => { activeListId=id; render(); };
  window.createNewList = () => {
    const input=$('new-list-name'), name=input.value.trim(); if(!name) { input.focus(); return; }
    const list={id:'list_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),name,products:[]};
    catalogData.push(list); activeListId=list.id; input.value=''; save(); render();
  };
  window.deleteList = id => {
    const list=catalogData.find(l=>l.id===id); if(!list) return;
    if(!confirm(`Удалить список «${list.name}» и все товары в нём?`)) return;
    catalogData=catalogData.filter(l=>l.id!==id);
    if(activeListId===id) activeListId=catalogData[0]?.id || null;
    save(); render();
  };
  window.addNewProduct = () => {
    const list=currentList(); if(!list) return;
    const title=prompt('Название товара:'); if(title===null || !title.trim()) return;
    const description=prompt('Описание товара (необязательно):','') ?? '';
    const price=prompt('Цена товара:','0 ₽'); if(price===null) return;
    list.products.push({title:title.trim(),description:description.trim(),price:price.trim() || '0 ₽',image:imageForTitle(title.trim())});
    save(); render();
  };
  window.deleteProduct = index => {
    const list=currentList(); if(!list || !list.products[index]) return;
    if(!confirm(`Удалить товар «${list.products[index].title}»?`)) return;
    list.products.splice(index,1); save(); render();
  };
  window.downloadCatalog = () => {
    const blob=new Blob([JSON.stringify(catalogData,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob), a=document.createElement('a');
    // Название скачиваемого файла соответствует названию выбранного списка.
    const catalogName = (currentList()?.name || 'Каталог товаров')
      .replace(/[\\\\/:*?\\"<>|]/g, '')
      .trim() || 'Каталог товаров';
    a.href=url; a.download=`${catalogName}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  function renderLists() {
    const container=$('lists-container'); container.replaceChildren();
    $('lists-count').textContent=String(catalogData.length);
    catalogData.forEach(list=>{
      const li=document.createElement('li'); li.className='list-item'+(list.id===activeListId?' active':'');
      const select=makeButton('', 'list-select', ()=>{activeListId=list.id;render();});
      const name=document.createElement('span'); name.className='list-name'; name.textContent=list.name;
      const count=document.createElement('span'); count.className='list-count'; count.textContent=String(list.products.length);
      select.append(name,count);
      const del=makeButton('×','list-delete',()=>window.deleteList(list.id),'Удалить список '+list.name);
      li.append(select,del); container.appendChild(li);
    });
  }
  function renderProducts() {
    const container=$('products-container'); container.replaceChildren();
    const list=currentList(), add=$('add-product-btn');
    if(!list) {
      $('current-list-title').textContent='Создайте свой первый список';
      $('products-summary').textContent='Списки помогут разделить покупки по категориям.';
      add.style.display='none';
      const empty=document.createElement('div'); empty.className='empty-state'; empty.textContent='Нажмите «+» слева, чтобы создать список товаров.'; container.append(empty); return;
    }
    $('current-list-title').textContent=list.name;
    $('products-summary').textContent=`${list.products.length} ${list.products.length===1?'товар':list.products.length>1 && list.products.length<5?'товара':'товаров'} в списке`;
    add.style.display='inline-flex';
    if(!list.products.length) { const empty=document.createElement('div'); empty.className='empty-state'; empty.textContent='В этом списке пока нет товаров. Нажмите «Добавить товар», чтобы начать.'; container.append(empty); return; }
    list.products.forEach((product,index)=>{
      const card=document.createElement('article'); card.className='product-card';
      const visual=document.createElement('div'); visual.className='product-image'; const photo=document.createElement('img'); photo.src=product.image || imageForTitle(product.title); photo.alt=escapeText(product.title); photo.loading='lazy'; photo.onerror=()=>{photo.onerror=null;photo.src='products/images/accessories.jpg';}; visual.append(photo);
      const info=document.createElement('div'); info.className='product-info';
      const title=document.createElement('h3'); title.className='product-title'; title.textContent=escapeText(product.title);
      const desc=document.createElement('p'); desc.className='product-description'; desc.textContent=escapeText(product.description || 'Описание не добавлено.');
      const footer=document.createElement('div'); footer.className='product-footer';
      const price=document.createElement('span'); price.className='product-price'; price.textContent=escapeText(product.price);
      footer.append(price,makeButton('Удалить','btn btn-delete',()=>window.deleteProduct(index)));
      info.append(title,desc,footer); card.append(visual,info); container.append(card);
    });
  }
  function render() { renderLists(); renderProducts(); }
  $('add-list-form').addEventListener('submit',e=>{e.preventDefault();window.createNewList();});
  $('file-input').addEventListener('change',e=>{
    const file=e.target.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      try {
        const imported=JSON.parse(reader.result);
        if(!Array.isArray(imported) || imported.some(l=>!l || typeof l.name!=='string' || !Array.isArray(l.products))) throw Error();
        catalogData=imported.map((l,i)=>({id:String(l.id||('import_'+Date.now()+'_'+i)),name:l.name,products:l.products.map(p=>({title:String(p.title||'Без названия'),description:String(p.description||''),price:String(p.price||'0 ₽'),image:String(p.image||imageForTitle(p.title||''))}))}));
        activeListId=catalogData[0]?.id||null; save(); render(); alert('Каталог импортирован.');
      } catch { alert('Не удалось импортировать файл. Проверьте формат JSON.'); }
      e.target.value='';
    };
    reader.readAsText(file,'UTF-8');
  });
  save(); render();
})();