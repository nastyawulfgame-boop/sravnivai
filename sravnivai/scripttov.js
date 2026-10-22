(() => {
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
      title:String(p.title || 'Без названия'), description:String(p.description || ''), price:String(p.price || '0 ₽')
    })) : []
  }));
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
    list.products.push({title:title.trim(),description:description.trim(),price:price.trim() || '0 ₽'});
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
      const visual=document.createElement('div'); visual.className='product-image'; visual.textContent='✳';
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
        catalogData=imported.map((l,i)=>({id:String(l.id||('import_'+Date.now()+'_'+i)),name:l.name,products:l.products.map(p=>({title:String(p.title||'Без названия'),description:String(p.description||''),price:String(p.price||'0 ₽')}))}));
        activeListId=catalogData[0]?.id||null; save(); render(); alert('Каталог импортирован.');
      } catch { alert('Не удалось импортировать файл. Проверьте формат JSON.'); }
      e.target.value='';
    };
    reader.readAsText(file,'UTF-8');
  });
  save(); render();
})();