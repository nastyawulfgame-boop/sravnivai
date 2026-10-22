// ==========================================================================
// КОД ДЛЯ СТРАНИЦЫ ТОВАРОВ (ДОБАВИТЬ В ВАШ ВЫДЕЛЕННЫЙ ФАЙЛ СКРИПТОВ)
// ==========================================================================
(function() {
    // Проверяем, есть ли на текущей странице контейнер для каталога товаров.
    // Если его нет (например, открыта страница login), скрипт ничего не делает.
    if (!document.getElementById('lists-container')) return;

    // ДИНАМИЧЕСКОЕ ПОДКЛЮЧЕНИЕ СТИЛЕЙ ИЗ stailestov.css
    // Скрипт сам найдет и загрузит стили, если их забыли подключить в HTML
    if (!document.querySelector('link[href="stailestov.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'stailestov.css';
        document.head.appendChild(link);
    }

    // Изначальный демонстрационный каталог на случай, если localStorage пуст
    const defaultCatalog = [
        {
            id: "list_1",
            name: "Электроника",
            products: [
                { title: "Беспроводные наушники", description: "Качественный звук и шумоподавление.", price: "4 990 ?" },
                { title: "Умные часы", description: "Отслеживание пульса и уведомления.", price: "8 500 ?" }
            ]
        }
    ];

    // Загружаем данные из localStorage ("дата") или берем шаблон
    let catalogData = JSON.parse(localStorage.getItem('myCatalogData')) || defaultCatalog;
    let activeListId = (catalogData && catalogData[0]) ? catalogData[0].id : null;

    // Функция автосохранения всех изменений в память браузера
    function saveToData() {
        localStorage.setItem('myCatalogData', JSON.stringify(catalogData));
    }

    // Привязываем функции к глобальному объекту window, чтобы кнопки в HTML могли их вызывать
    window.selectList = function(id) {
        activeListId = id;
        renderLists();
    };

    window.createNewList = function() {
        const input = document.getElementById('new-list-name');
        if (!input) return;
        const name = input.value.trim();
        if (!name) return;

        const newList = {
            id: "list_" + Date.now(),
            name: name,
            products: []
        };

        catalogData.push(newList);
        activeListId = newList.id; 
        input.value = '';
        
        saveToData();
        renderLists();
    };

    window.deleteList = function(event, id) {
        event.stopPropagation(); // Отменяем клик по самому списку при удалении
        catalogData = catalogData.filter(function(l) { return l.id !== id; });
        if (activeListId === id) {
            activeListId = (catalogData && catalogData[0]) ? catalogData[0].id : null;
        }
        
        saveToData();
        renderLists();
    };

    window.addNewProduct = function() {
        let currentList = null;
        for (let i = 0; i < catalogData.length; i++) {
            if (catalogData[i].id === activeListId) {
                currentList = catalogData[i];
                break;
            }
        }
        if (!currentList) return;

        const title = prompt("Введите название товара:", "Новый товар");
        if (!title) return;
        const description = prompt("Введите описание товара:", "Описание товара");
        const price = prompt("Введите цену товара:", "1 000 ?");

        currentList.products.push({
            title: title,
            description: description || "",
            price: price || "0 ?"
        });

        saveToData();
        renderLists(); 
    };

    window.deleteProduct = function(index) {
        let currentList = null;
        for (let i = 0; i < catalogData.length; i++) {
            if (catalogData[i].id === activeListId) {
                currentList = catalogData[i];
                break;
            }
        }
        if (!currentList) return;

        currentList.products.splice(index, 1);
        
        saveToData();
        renderLists();
    };

    window.downloadCatalog = function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(catalogData, null, 4));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "my_catalog.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    function renderLists() {
        const container = document.getElementById('lists-container');
        if (!container) return;
        container.innerHTML = '';

        catalogData.forEach(list => {
            const li = document.createElement('li');
            li.className = 'list-item' + (list.id === activeListId ? ' active' : '');
            li.onclick = function() { selectList(list.id); };

            li.innerHTML = '<span>' + list.name + ' (' + list.products.length + ')</span>' +
                           '<button class="btn btn-delete" onclick="deleteList(event, \'' + list.id + '\')">Удалить</button>';
            container.appendChild(li);
        });

        renderProducts();
    }

    function renderProducts() {
        const container = document.getElementById('products-container');
        const titleElement = document.getElementById('current-list-title');
        const addProductBtn = document.getElementById('add-product-btn');
        
        if (!container) return;
        container.innerHTML = '';

        let currentList = null;
        for (let i = 0; i < catalogData.length; i++) {
            if (catalogData[i].id === activeListId) {
                currentList = catalogData[i];
                break;
            }
        }

        if (!currentList) {
            if (titleElement) titleElement.innerText = "Выберите или создайте список слева";
            if (addProductBtn) addProductBtn.style.display = 'none';
            container.innerHTML = '<p style="color:#7f8c8d;">Нет активного списка</p>';
            return;
        }

        if (titleElement) titleElement.innerText = currentList.name;
        if (addProductBtn) addProductBtn.style.display = 'block';

        if (currentList.products.length === 0) {
            container.innerHTML = '<p style="grid-column:1/-1; color:#7f8c8d;">В этом списке пока нет товаров.</p>';
            return;
        }

        currentList.products.forEach(function(product, index) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = '<div class="product-image">Изображение</div>' +
                '<div class="product-info">' +
                    '<h3 class="product-title">' + product.title + '</h3>' +
                    '<p class="product-description">' + product.description + '</p>' +
                    '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">' +
                        '<span class="product-price">' + product.price + '</span>' +
                        '<button class="btn btn-delete" onclick="deleteProduct(' + index + ')">Удалить</button>' +
                    '</div>' +
                '</div>';
            container.appendChild(card);
        });
    }

    // Слушатель загрузки внешних файлов (импорт каталога)
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files; 
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const uploadedData = JSON.parse(e.target.result);
                    if (Array.isArray(uploadedData)) {
                        catalogData = uploadedData;
                        activeListId = (catalogData && catalogData[0]) ? catalogData[0].id : null;
                        
                        saveToData();
                        renderLists();
                        alert('Каталог успешно импортирован в память!');
                    } else {
                        alert('Ошибка: Файл должен содержать массив списков.');
                    }
                } catch (err) {
                    alert('Ошибка чтения .json файла.');
                }
            };
            // Читаем как utf-8, чтобы русский текст из сохраненного файла не превращался в знаки вопроса
            reader.readAsText(file, "utf-8"); 
        });
    }

    // Первый запуск отображения каталога
    renderLists();
})();
