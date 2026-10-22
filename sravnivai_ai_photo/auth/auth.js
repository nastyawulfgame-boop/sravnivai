/* Демонстрационная авторизация для статического сайта.
 * Данные хранятся только в localStorage текущего браузера.
 * Пароль сохраняется как SHA-256 хеш, не в открытом виде.
 * Для настоящего публичного сервиса нужен сервер и серверная проверка пароля.
 */
(() => {
  const $ = id => document.getElementById(id);
  const USERS_KEY = 'sravnivaiUsers_v1';
  const SESSION_KEY = 'sravnivaiSession_v1';
  const onAuthPage = Boolean($('authForm'));

  function readUsers() {
    try { const value = JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; }
    catch { return {}; }
  }
  function writeUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
  async function hashPassword(password) {
    if (!window.crypto?.subtle) throw new Error('Для безопасного сохранения пароля откройте сайт через HTTPS (например, GitHub Pages).');
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  function normalizedLogin(value) { return String(value || '').trim().toLowerCase(); }

  if (!onAuthPage) {
    const logout = document.querySelector('.topbar nav a[href="login.html"]');
    if (logout && localStorage.getItem(SESSION_KEY)) {
      logout.textContent = 'Выйти';
      logout.addEventListener('click', event => { event.preventDefault(); localStorage.removeItem(SESSION_KEY); location.href = 'index.html'; });
    }
    return;
  }

  const loginTab = $('loginTab'), registerTab = $('registerTab'), authForm = $('authForm');
  const submitBtn = $('submitBtn'), formTitle = $('formTitle'), toggleFooter = $('toggleFooter');
  const nameInput = $('name'), emailInput = $('email'), passwordInput = $('password'), confirmInput = $('confirmPassword');
  const nameGroup = $('nameGroup'), confirmGroup = $('confirmGroup');
  let isLoginMode = true;

  function setError(id, message) {
    const input = $(id), box = $(({name:'nameError',email:'emailError',password:'passwordError',confirmPassword:'confirmError'})[id]);
    if (input) input.style.borderColor = message ? '#e74c3c' : '#e1e8ed';
    if (box) { box.textContent = message || ''; box.classList.toggle('active', Boolean(message)); }
  }
  function clearErrors() { ['name','email','password','confirmPassword'].forEach(id => setError(id, '')); }
  function setMode(login) {
    isLoginMode = login;
    loginTab.classList.toggle('active', login); registerTab.classList.toggle('active', !login);
    formTitle.textContent = login ? 'Вход в аккаунт' : 'Создание аккаунта';
    submitBtn.textContent = login ? 'Войти' : 'Создать аккаунт';
    nameGroup.style.display = login ? 'none' : 'block';
    confirmGroup.style.display = login ? 'none' : 'block';
    nameInput.required = !login; confirmInput.required = !login;
    toggleFooter.innerHTML = login
      ? 'Нет аккаунта? <a href="#" id="switchLink">Создать аккаунт</a>'
      : 'Уже есть аккаунт? <a href="#" id="switchLink">Войти</a>';
    $('switchLink').addEventListener('click', e => { e.preventDefault(); setMode(!isLoginMode); });
    clearErrors();
  }
  loginTab.addEventListener('click', () => setMode(true));
  registerTab.addEventListener('click', () => setMode(false));

  authForm.addEventListener('submit', async event => {
    event.preventDefault(); clearErrors();
    const login = normalizedLogin(emailInput.value), password = passwordInput.value;
    let valid = true;
    if (!isLoginMode && nameInput.value.trim().length < 2) { setError('name', 'Имя должно содержать не менее 2 символов'); valid = false; }
    if (login.length < 3) { setError('email', 'Введите логин или email (не менее 3 символов)'); valid = false; }
    if (password.length < 6) { setError('password', 'Пароль должен содержать не менее 6 символов'); valid = false; }
    if (!isLoginMode && confirmInput.value !== password) { setError('confirmPassword', 'Пароли не совпадают'); valid = false; }
    if (!valid) return;

    submitBtn.disabled = true; submitBtn.textContent = isLoginMode ? 'Проверка…' : 'Создание…';
    try {
      const users = readUsers();
      const digest = await hashPassword(password);
      if (isLoginMode) {
        const user = users[login];
        if (!user || user.passwordHash !== digest) {
          setError('password', 'Неверный логин или пароль. Если аккаунта нет, зарегистрируйтесь.');
          return;
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify({login, name:user.name, signedInAt:Date.now()}));
        location.href = 'tovari.html';
      } else {
        if (users[login]) { setError('email', 'Такой логин уже зарегистрирован. Войдите или выберите другой.'); return; }
        users[login] = {login, name:nameInput.value.trim(), passwordHash:digest, createdAt:Date.now()};
        writeUsers(users);
        localStorage.setItem(SESSION_KEY, JSON.stringify({login, name:users[login].name, signedInAt:Date.now()}));
        alert('Аккаунт создан! Логин сохранён в этом браузере.');
        location.href = 'tovari.html';
      }
    } catch (error) {
      setError('password', error.message || 'Не удалось сохранить данные. Попробуйте открыть сайт через HTTPS.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isLoginMode ? 'Войти' : 'Создать аккаунт';
    }
  });
  [nameInput,emailInput,passwordInput,confirmInput].forEach(input => input.addEventListener('input', () => {
    const map = {name:'name',email:'email',password:'password',confirmPassword:'confirmPassword'};
    setError(map[input.id], '');
  }));
  if (new URLSearchParams(location.search).get('mode') === 'register') setMode(false);
  else setMode(true);
})();
