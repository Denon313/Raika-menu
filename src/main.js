import '../styles/main.css';

const STORAGE_KEY = 'rayka_menu_products_v2';
const LOG_KEY = 'rayka_menu_logs_v2';

const DEFAULT_PRODUCTS = [
  {
    id: crypto.randomUUID(),
    name: 'پیتزا پپرونی',
    category: 'فست‌فود',
    section: 'پیتزا',
    description: 'سوسیس پپرونی تند، پنیر پیتزا، فلفل دلمه، قارچ و سس مخصوص رایکا',
    price: 285000,
    stock: 12,
    available: true,
    image: ''
  },
  {
    id: crypto.randomUUID(),
    name: 'چیکن آلفردو',
    category: 'غذای اصلی',
    section: 'پاستا',
    description: 'پاستا، فیله مرغ، سس آلفردو، قارچ و پنیر پارمزان',
    price: 320000,
    stock: 8,
    available: true,
    image: ''
  },
  {
    id: crypto.randomUUID(),
    name: 'کباب مخصوص رایکا',
    category: 'کباب',
    section: 'کباب',
    description: 'کباب مخصوص سرآشپز، برنج ایرانی، گوجه کبابی و کره',
    price: 420000,
    stock: 5,
    available: true,
    image: ''
  },
  {
    id: crypto.randomUUID(),
    name: 'برگر ویژه رایکا',
    category: 'فست‌فود',
    section: 'برگر',
    description: 'گوشت گریل‌شده، پنیر چدار، قارچ، کاهو، گوجه و سس مخصوص',
    price: 310000,
    stock: 0,
    available: false,
    image: ''
  },
  {
    id: crypto.randomUUID(),
    name: 'نوشابه',
    category: 'نوشیدنی',
    section: 'نوشیدنی',
    description: 'نوشیدنی خنک',
    price: 45000,
    stock: 24,
    available: true,
    image: ''
  },
  {
    id: crypto.randomUUID(),
    name: 'آب معدنی',
    category: 'نوشیدنی',
    section: 'نوشیدنی',
    description: 'آب معدنی خنک',
    price: 25000,
    stock: 30,
    available: true,
    image: ''
  }
];

const CATEGORIES = [
  'همه',
  'غذای اصلی',
  'فست‌فود',
  'کباب',
  'نوشیدنی',
  'پاستا',
  'برگر',
  'پیتزا'
];

let products = loadProducts();
let logs = loadLogs();
let selectedCategory = 'همه';
let adminMode = false;

const app = document.querySelector('#app');

function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLogs() {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

function addLog(action, productName, details = '') {
  logs.unshift({
    id: crypto.randomUUID(),
    action,
    productName,
    details,
    time: new Date().toLocaleString('fa-IR')
  });

  logs = logs.slice(0, 300);
  saveLogs();
}

function money(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0)) + ' تومان';
}

function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function fallbackImage() {
  return `
    <div class="image-fallback">
      <span>R</span>
      <small>RAYKA</small>
    </div>
  `;
}

function imageHTML(product) {
  if (!product.image) return fallbackImage();

  return `
    <img
      src="${product.image}"
      alt="${escapeHTML(product.name)}"
      class="product-image"
      loading="lazy"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
    >
    <div class="image-fallback image-fallback-hidden">
      <span>R</span>
      <small>RAYKA</small>
    </div>
  `;
}

function getFilteredProducts() {
  if (selectedCategory === 'همه') return products;

  return products.filter(
    product =>
      product.category === selectedCategory ||
      product.section === selectedCategory
  );
}

function productCard(product) {
  const available = product.available && product.stock > 0;

  return `
    <article class="product-card ${available ? '' : 'is-unavailable'}">

      <div class="product-media">
        ${imageHTML(product)}

        <div class="availability-badge ${available ? 'available' : 'unavailable'}">
          <span class="status-dot"></span>
          <span>${available ? 'موجود' : 'ناموجود'}</span>
        </div>

        <span class="product-section-badge">
          ${escapeHTML(product.section || product.category)}
        </span>
      </div>

      <div class="product-info">

        <h3>${escapeHTML(product.name)}</h3>

        <p class="product-description">
          ${escapeHTML(product.description)}
        </p>

        <div class="product-meta">
          <strong class="product-price">${money(product.price)}</strong>

          <span class="stock-label ${available ? 'available-text' : 'unavailable-text'}">
            ${available ? 'موجود' : 'ناموجود'}
          </span>
        </div>

        ${
          adminMode
            ? `
              <div class="card-admin-actions">
                <button class="small-btn edit-product" data-id="${product.id}">
                  ویرایش
                </button>

                <button
                  class="small-btn stock-minus"
                  data-id="${product.id}"
                  ${product.stock <= 0 ? 'disabled' : ''}
                >−</button>

                <button class="small-btn stock-plus" data-id="${product.id}">
                  +
                </button>
              </div>
            `
            : ''
        }

      </div>
    </article>
  `;
}

function renderCategories() {
  const categories = document.querySelector('#categories');

  categories.innerHTML = CATEGORIES.map(category => `
    <button
      type="button"
      class="category-btn ${selectedCategory === category ? 'active' : ''}"
      data-category="${category}"
    >
      ${category}
    </button>
  `).join('');

  categories.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function renderProducts() {
  const container = document.querySelector('#products');
  const items = getFilteredProducts();

  container.innerHTML = items.length
    ? items.map(productCard).join('')
    : `
      <div class="empty-state">
        <div>🍽️</div>
        <h3>محصولی پیدا نشد</h3>
        <p>در این دسته هنوز محصولی ثبت نشده است.</p>
      </div>
    `;

  bindProductActions();
}

function bindProductActions() {
  document.querySelectorAll('.edit-product').forEach(button => {
    button.addEventListener('click', () => {
      const product = products.find(p => p.id === button.dataset.id);
      if (product) openProductModal(product);
    });
  });

  document.querySelectorAll('.stock-plus').forEach(button => {
    button.addEventListener('click', () => {
      const product = products.find(p => p.id === button.dataset.id);
      if (!product) return;

      product.stock++;
      if (product.stock > 0) product.available = true;

      addLog('افزایش موجودی', product.name, `موجودی جدید: ${product.stock}`);
      saveProducts();
      renderProducts();
    });
  });

  document.querySelectorAll('.stock-minus').forEach(button => {
    button.addEventListener('click', () => {
      const product = products.find(p => p.id === button.dataset.id);
      if (!product || product.stock <= 0) return;

      product.stock--;

      if (product.stock === 0) {
        product.available = false;
      }

      addLog('کاهش موجودی', product.name, `موجودی جدید: ${product.stock}`);
      saveProducts();
      renderProducts();
    });
  });
}

function openProductModal(product = null) {
  const editing = Boolean(product);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  modal.innerHTML = `
    <div class="modal product-modal">

      <div class="modal-header">
        <div>
          <span class="modal-eyebrow">
            ${editing ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
          </span>

          <h2>
            ${editing ? 'ویرایش محصول' : 'افزودن محصول'}
          </h2>
        </div>

        <button class="modal-close" type="button">×</button>
      </div>

      <form id="product-form">

        <label>
          نام محصول
          <input
            name="name"
            required
            maxlength="80"
            value="${editing ? escapeHTML(product.name) : ''}"
            placeholder="مثلاً پاستای مخصوص رایکا"
          >
        </label>

        <div class="form-grid">

          <label>
            دسته‌بندی
            <select name="category">
              ${CATEGORIES
                .filter(c => c !== 'همه')
                .map(c => `
                  <option
                    value="${c}"
                    ${editing && product.category === c ? 'selected' : ''}
                  >${c}</option>
                `)
                .join('')}
            </select>
          </label>

          <label>
            بخش
            <input
              name="section"
              maxlength="50"
              value="${editing ? escapeHTML(product.section) : ''}"
              placeholder="مثلاً پاستا"
            >
          </label>

        </div>

        <label>
          توضیحات
          <textarea
            name="description"
            maxlength="220"
            rows="4"
            placeholder="مواد اولیه و توضیح کوتاه محصول..."
          >${editing ? escapeHTML(product.description) : ''}</textarea>
        </label>

        <div class="form-grid">

          <label>
            قیمت
            <input
              name="price"
              type="number"
              min="0"
              step="1000"
              required
              value="${editing ? product.price : ''}"
              placeholder="قیمت به تومان"
            >
          </label>

          <label>
            موجودی
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              required
              value="${editing ? product.stock : '0'}"
            >
          </label>

        </div>

        <label class="switch-row">
          <span>
            <strong>وضعیت محصول</strong>
            <small>اگر خاموش باشد محصول ناموجود نمایش داده می‌شود.</small>
          </span>

          <input
            name="available"
            type="checkbox"
            ${editing ? (product.available ? 'checked' : '') : 'checked'}
          >

          <span class="switch"></span>
        </label>

        <label class="upload-box">
          <input id="product-image-input" type="file" accept="image/jpeg,image/png,image/webp,image/avif">

          <span class="upload-icon">🖼️</span>
          <strong>انتخاب عکس محصول</strong>
          <small>JPG / PNG / WEBP / AVIF — حداکثر 3MB</small>
        </label>

        <div id="image-preview" class="image-preview">
          ${
            editing && product.image
              ? `<img src="${product.image}" alt="preview">`
              : fallbackImage()
          }
        </div>

        <div class="modal-actions">

          ${
            editing
              ? `
                <button
                  type="button"
                  class="danger-btn"
                  id="delete-product"
                >
                  حذف محصول
                </button>
              `
              : ''
          }

          <button type="button" class="secondary-btn modal-cancel">
            انصراف
          </button>

          <button type="submit" class="primary-btn">
            ${editing ? 'ذخیره تغییرات' : 'افزودن محصول'}
          </button>

        </div>

      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();

  modal.querySelector('.modal-close').onclick = close;
  modal.querySelector('.modal-cancel').onclick = close;

  const imageInput = modal.querySelector('#product-image-input');
  const preview = modal.querySelector('#image-preview');

  let imageData = editing ? product.image : '';

  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('حجم عکس نباید بیشتر از 3 مگابایت باشد.');
      imageInput.value = '';
      return;
    }

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif'
    ];

    if (!allowed.includes(file.type)) {
      alert('فرمت عکس مجاز نیست.');
      imageInput.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      imageData = event.target.result;

      preview.innerHTML = `
        <img src="${imageData}" alt="preview">
      `;
    };

    reader.readAsDataURL(file);
  });

  modal.querySelector('#product-form').addEventListener('submit', event => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const name = String(form.get('name') || '').trim();
    const category = String(form.get('category') || '').trim();
    const section = String(form.get('section') || '').trim() || category;
    const description = String(form.get('description') || '').trim();
    const price = Number(form.get('price'));
    const stock = Math.max(0, Number(form.get('stock')));
    const available = form.get('available') === 'on';

    if (!name) {
      alert('نام محصول را وارد کن.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      alert('قیمت محصول صحیح نیست.');
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      alert('موجودی محصول صحیح نیست.');
      return;
    }

    const finalAvailable = available && stock > 0;

    if (editing) {
      Object.assign(product, {
        name,
        category,
        section,
        description,
        price,
        stock,
        available: finalAvailable,
        image: imageData
      });

      addLog(
        'ویرایش محصول',
        name,
        'اطلاعات محصول ویرایش شد.'
      );
    } else {
      const newProduct = {
        id: crypto.randomUUID(),
        name,
        category,
        section,
        description,
        price,
        stock,
        available: finalAvailable,
        image: imageData
      };

      products.push(newProduct);

      addLog(
        'افزودن محصول',
        name,
        'محصول جدید ثبت شد.'
      );
    }

    saveProducts();
    renderCategories();
    renderProducts();
    close();
  });

  const deleteButton = modal.querySelector('#delete-product');

  if (deleteButton) {
    deleteButton.onclick = () => {
      const confirmed = confirm(
        `آیا مطمئنی «${product.name}» حذف شود؟`
      );

      if (!confirmed) return;

      products = products.filter(p => p.id !== product.id);

      addLog(
        'حذف محصول',
        product.name,
        'محصول حذف شد.'
      );

      saveProducts();
      renderCategories();
      renderProducts();
      close();
    };
  }
}

function openLogsModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  modal.innerHTML = `
    <div class="modal logs-modal">

      <div class="modal-header">
        <div>
          <span class="modal-eyebrow">ACTIVITY LOG</span>
          <h2>گزارش فعالیت‌ها</h2>
        </div>

        <button class="modal-close" type="button">×</button>
      </div>

      <div class="logs-list">

        ${
          logs.length
            ? logs
                .map(
                  log => `
                    <div class="log-item">
                      <div class="log-icon">✓</div>
                      <div>
                        <strong>${escapeHTML(log.action)}</strong>
                        <span>${escapeHTML(log.productName)}</span>
                        <small>${escapeHTML(log.details)}</small>
                        <time>${escapeHTML(log.time)}</time>
                      </div>
                    </div>
                  `
                )
                .join('')
            : `
              <div class="empty-state">
                <div>📝</div>
                <h3>هنوز فعالیتی ثبت نشده</h3>
              </div>
            `
        }

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').onclick = () => modal.remove();
}

function openAboutModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  modal.innerHTML = `
    <div class="modal about-modal">

      <button class="modal-close about-close" type="button">×</button>

      <div class="about-logo">R</div>

      <span class="modal-eyebrow">ABOUT RAYKA</span>

      <h2>درباره رایکا</h2>

      <p>
        رایکا با عشق آماده می‌شود تا تجربه‌ای متفاوت،
        خوش‌طعم و به‌یادماندنی برای شما بسازد.
      </p>

      <div class="about-line"></div>

      <span>RAYKA RESTAURANT</span>

    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').onclick = () => modal.remove();
}

function openAdminPanel() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  const available = products.filter(
    p => p.available && p.stock > 0
  ).length;

  const unavailable = products.length - available;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  modal.innerHTML = `
    <div class="modal admin-modal">

      <div class="modal-header">
        <div>
          <span class="modal-eyebrow">RAYKA CONTROL</span>
          <h2>مدیریت رایکا</h2>
        </div>

        <button class="modal-close" type="button">×</button>
      </div>

      <div class="stats-grid">

        <div class="stat-card">
          <span>محصولات</span>
          <strong>${products.length}</strong>
        </div>

        <div class="stat-card">
          <span>موجود</span>
          <strong>${available}</strong>
        </div>

        <div class="stat-card">
          <span>ناموجود</span>
          <strong>${unavailable}</strong>
        </div>

        <div class="stat-card">
          <span>کل موجودی</span>
          <strong>${totalStock}</strong>
        </div>

      </div>

      <div class="admin-actions-grid">

        <button class="admin-action" id="add-product">
          <span>＋</span>
          <strong>افزودن محصول</strong>
          <small>ساخت محصول جدید</small>
        </button>

        <button class="admin-action" id="view-logs">
          <span>◷</span>
          <strong>گزارش فعالیت</strong>
          <small>مشاهده تغییرات</small>
        </button>

      </div>

      <div class="admin-products">

        <h3>محصولات</h3>

        ${products
          .map(
            product => `
              <div class="admin-product-row">

                <div>
                  <strong>${escapeHTML(product.name)}</strong>
                  <small>
                    ${escapeHTML(product.category)}
                    · موجودی ${product.stock}
                  </small>
                </div>

                <button
                  class="small-btn edit-from-admin"
                  data-id="${product.id}"
                >
                  ویرایش
                </button>

              </div>
            `
          )
          .join('')}

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').onclick = () => modal.remove();

  modal.querySelector('#add-product').onclick = () => {
    modal.remove();
    openProductModal();
  };

  modal.querySelector('#view-logs').onclick = () => {
    modal.remove();
    openLogsModal();
  };

  modal.querySelectorAll('.edit-from-admin').forEach(button => {
    button.onclick = () => {
      const product = products.find(p => p.id === button.dataset.id);

      modal.remove();

      if (product) openProductModal(product);
    };
  });
}

function renderApp() {
  app.innerHTML = `
    <main class="rayka-shell">

      <section class="welcome-screen" id="welcome-screen">

        <button
          class="welcome-close"
          id="welcome-close"
          type="button"
          aria-label="بستن"
        >
          ×
        </button>

        <div class="welcome-glow"></div>

        <div class="welcome-content">

          <div class="welcome-mark">
            <span>R</span>
          </div>

          <span class="welcome-eyebrow">
            RAYKA RESTAURANT
          </span>

          <h1>به رایکا خوش آمدید</h1>

          <p>
            خوشحالیم که ما را انتخاب کردید ❤️
          </p>

        </div>

      </section>

      <section class="menu-screen">

        <header class="menu-header">

          <div class="brand-block">

            <span class="eyebrow">
              RAYKA RESTAURANT
            </span>

            <h1>منوی رایکا</h1>

            <p>
              طعم خوب، حال خوب.
            </p>

          </div>

          <button
            class="admin-button"
            id="admin-button"
            type="button"
          >
            <span>⚙</span>
            مدیریت
          </button>

        </header>

        <section class="category-area">

          <div class="section-heading">
            <span>MENU</span>
            <h2>انتخاب کن، لذت ببر</h2>
          </div>

          <nav
            class="categories"
            id="categories"
            aria-label="دسته‌بندی محصولات"
          ></nav>

        </section>

        <section class="products-section">

          <div class="products-heading">

            <div>
              <span class="heading-kicker">RAYKA SPECIAL</span>
              <h2>پیشنهادهای رایکا</h2>
            </div>

            <span class="product-count" id="product-count"></span>

          </div>

          <div
            class="products-grid"
            id="products"
          ></div>

        </section>

        <section class="about-section">

          <div class="about-card">

            <span class="about-kicker">RAYKA</span>

            <h2>یک تجربه متفاوت</h2>

            <p>
              جایی برای غذاهای خوش‌طعم، فضای خوب
              و لحظه‌هایی که ارزش به خاطر سپردن دارند.
            </p>

            <button
              type="button"
              id="about-button"
            >
              درباره ما
              <span>←</span>
            </button>

          </div>

        </section>

        <footer class="menu-footer">

          <span>RAYKA RESTAURANT</span>

          <small>
            ساخته شده با عشق ❤️
          </small>

        </footer>

      </section>

    </main>
  `;

  document.querySelector('#welcome-close').onclick = () => {
    document.querySelector('#welcome-screen')?.remove();
  };

  document.querySelector('#admin-button').onclick = () => {
    adminMode = !adminMode;

    document.querySelector('#admin-button').classList.toggle(
      'active',
      adminMode
    );

    renderProducts();
  };

  document.querySelector('#about-button').onclick =
    openAboutModal;

  renderCategories();
  renderProducts();
  updateProductCount();

  setTimeout(() => {
    document.querySelector('#welcome-screen')?.classList.add('hide');
  }, 3000);
}

function updateProductCount() {
  const count = document.querySelector('#product-count');

  if (!count) return;

  const amount = getFilteredProducts().length;

  count.textContent =
    `${new Intl.NumberFormat('fa-IR').format(amount)} محصول`;
}

const originalRenderProducts = renderProducts;

renderApp();

const observer = new MutationObserver(() => {
  updateProductCount();
});

observer.observe(document.querySelector('#products'), {
  childList: true
});
