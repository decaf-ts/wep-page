async function loadLocale(localePath = 'locales/en_us.json') {
  const res = await fetch(localePath, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load locale file: ${localePath}`);
  const dict = await res.json();
  return dict;
}

function getByKey(dict, key) {
  const parts = key.split('.');
  let cur = dict;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p];
    } else {
      throw new Error(`Missing locale key: ${key}`);
    }
  }
  if (typeof cur !== 'string') {
    throw new Error(`Locale key is not a string: ${key}`);
  }
  return cur;
}

function applyLocale(dict) {
  // Elements with data-locale -> textContent replacement
  document.querySelectorAll('[data-locale]').forEach((el) => {
    const key = el.getAttribute('data-locale');
    el.textContent = getByKey(dict, key);
  });

  // Elements with data-locale-html -> innerHTML replacement
  document.querySelectorAll('[data-locale-html]').forEach((el) => {
    const key = el.getAttribute('data-locale-html');
    el.innerHTML = getByKey(dict, key);
  });

  // Attribute localization: data-locale-attr="attrName:key"
  document.querySelectorAll('[data-locale-attr]').forEach((el) => {
    const spec = el.getAttribute('data-locale-attr');
    // Support multiple, comma-separated
    spec.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (!attr || !key) return;
      el.setAttribute(attr, getByKey(dict, key));
    });
  });

  // Document title
  const titleKey = document.documentElement.getAttribute('data-locale-title');
  if (titleKey) {
    document.title = getByKey(dict, titleKey);
  }
}

(async function initLocale() {
  try {
    const dict = await loadLocale();
    applyLocale(dict);
    // Expose for dynamic usage if needed
    window.DecafLocale = {
      dict,
      t: (key) => getByKey(dict, key),
      apply: () => applyLocale(dict),
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
})();

