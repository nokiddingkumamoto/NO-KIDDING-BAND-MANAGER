(() => {
  "use strict";

  const PRODUCTS_KEY = "no-kidding-merch-products-v1";
  const SALES_KEY = "no-kidding-merch-sales-v1";
  const LOW_STOCK = 3;

  const CATEGORY_LABELS = {
    tshirt: "Tシャツ",
    sticker: "ステッカー",
    badge: "缶バッジ",
    cd: "CD・音源",
    other: "その他"
  };

  const IMAGE_OPTIONS = [
    ["", "画像なし"],
    ["merch-images/tshirt-logo-white-front.jpg", "LOGO T-SHIRT WHITE（前）"],
    ["merch-images/tshirt-logo-white-back.jpg", "LOGO T-SHIRT WHITE（後）"],
    ["merch-images/tshirt-logo-gray.jpg", "LOGO T-SHIRT GRAY"],
    ["merch-images/tshirt-logo-blue.png", "LOGO T-SHIRT BLUE"],
    ["merch-images/tshirt-logo-purple.png", "LOGO T-SHIRT PURPLE"],
    ["merch-images/tshirt-zombie-black-green.png", "SK8 ZOMBIE BLACK×GREEN"],
    ["merch-images/tshirt-zombie-purple-green.png", "SK8 ZOMBIE PURPLE×GREEN"],
    ["merch-images/tshirt-zombie-black-yellow.png", "SK8 ZOMBIE BLACK×YELLOW"],
    ["merch-images/tshirt-zombie-purple-yellow.png", "SK8 ZOMBIE PURPLE×YELLOW"],
    ["merch-images/tshirt-zombie-green-yellow.png", "SK8 ZOMBIE GREEN×YELLOW"],
    ["merch-images/sticker-logo.jpg", "ステッカー ロゴ"],
    ["merch-images/sticker-character.jpg", "ステッカー キャラクター"],
    ["merch-images/sticker-oni.png", "ステッカー 鬼"],
    ["merch-images/sticker-sign-large.jpg", "看板風ステッカー 大"],
    ["merch-images/sticker-sign-medium.jpg", "看板風ステッカー 中"]
  ];

  const DEFAULT_PRODUCTS = [
    { id:"logo-white", name:"LOGO T-SHIRT (WHITE)", category:"tshirt", details:"WHITE / BLACK PRINT / XL", price:1000, stock:0, image:"merch-images/tshirt-logo-white-front.jpg" },
    { id:"logo-gray", name:"LOGO T-SHIRT (GRAY)", category:"tshirt", details:"GRAY / BLACK PRINT / XL", price:1000, stock:0, image:"merch-images/tshirt-logo-gray.jpg" },
    { id:"logo-blue", name:"LOGO T-SHIRT (BLUE)", category:"tshirt", details:"BLUE / WHITE PRINT / S", price:500, stock:0, image:"merch-images/tshirt-logo-blue.png" },
    { id:"logo-purple", name:"LOGO T-SHIRT (PURPLE)", category:"tshirt", details:"PURPLE / GREEN PRINT / S", price:500, stock:0, image:"merch-images/tshirt-logo-purple.png" },
    { id:"zombie-black-green", name:"SK8 ZOMBIE T-SHIRT (BLACK×GREEN)", category:"tshirt", details:"BLACK / GREEN PRINT / S", price:500, stock:0, image:"merch-images/tshirt-zombie-black-green.png" },
    { id:"zombie-purple-green", name:"SK8 ZOMBIE T-SHIRT (PURPLE×GREEN)", category:"tshirt", details:"PURPLE / GREEN PRINT / S", price:500, stock:0, image:"merch-images/tshirt-zombie-purple-green.png" },
    { id:"zombie-black-yellow", name:"SK8 ZOMBIE T-SHIRT (BLACK×YELLOW)", category:"tshirt", details:"BLACK / YELLOW PRINT / S", price:500, stock:0, image:"merch-images/tshirt-zombie-black-yellow.png" },
    { id:"zombie-purple-yellow", name:"SK8 ZOMBIE T-SHIRT (PURPLE×YELLOW)", category:"tshirt", details:"PURPLE / YELLOW PRINT / S", price:500, stock:0, image:"merch-images/tshirt-zombie-purple-yellow.png" },
    { id:"zombie-green-yellow", name:"SK8 ZOMBIE T-SHIRT (GREEN×YELLOW)", category:"tshirt", details:"GREEN / YELLOW PRINT / S", price:500, stock:0, image:"merch-images/tshirt-zombie-green-yellow.png" },
    { id:"sticker-logo", name:"ステッカー（ロゴ）", category:"sticker", details:"", price:100, stock:0, image:"merch-images/sticker-logo.jpg" },
    { id:"sticker-character", name:"ステッカー（キャラクター）", category:"sticker", details:"", price:100, stock:0, image:"merch-images/sticker-character.jpg" },
    { id:"sticker-oni", name:"ステッカー（鬼）", category:"sticker", details:"", price:100, stock:0, image:"merch-images/sticker-oni.png" },
    { id:"sticker-sign-large", name:"看板風 ステッカー大", category:"sticker", details:"大サイズ", price:700, stock:0, image:"merch-images/sticker-sign-large.jpg" },
    { id:"sticker-sign-medium", name:"看板風 ステッカー中", category:"sticker", details:"中サイズ", price:500, stock:0, image:"merch-images/sticker-sign-medium.jpg" }
  ];

  const productList = document.querySelector(".product-list");
  const productCount = document.querySelector(".product-count");
  const salesList = document.querySelector(".sales-list");
  const searchInput = document.querySelector(".product-search");
  const categoryFilter = document.querySelector(".category-filter");
  const productDialog = document.querySelector(".product-dialog");
  const productForm = document.querySelector(".product-form");
  const saleDialog = document.querySelector(".sale-dialog");
  const saleForm = document.querySelector(".sale-form");
  const toast = document.querySelector(".toast");

  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const clone = value => JSON.parse(JSON.stringify(value));

  let products = read(PRODUCTS_KEY, null);
  if (!Array.isArray(products)) {
    products = clone(DEFAULT_PRODUCTS);
    write(PRODUCTS_KEY, products);
  }
  let sales = read(SALES_KEY, []);
  if (!Array.isArray(sales)) sales = [];

  const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const yen = value => `¥${Math.max(0, Number(value) || 0).toLocaleString("ja-JP")}`;
  const normalizeNumber = value => Math.max(0, Math.floor(Number(value) || 0));
  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  };
  const saveProducts = () => {
    write(PRODUCTS_KEY, products);
    renderAll();
  };
  const saveSales = () => {
    write(SALES_KEY, sales);
    renderAll();
  };

  const renderSummary = () => {
    const stock = products.reduce((total, item) => total + normalizeNumber(item.stock), 0);
    const low = products.filter(item => normalizeNumber(item.stock) <= LOW_STOCK).length;
    const salesTotal = sales.reduce((total, sale) => total + normalizeNumber(sale.quantity) * normalizeNumber(sale.unitPrice), 0);
    document.querySelector(".summary-products").textContent = products.length.toLocaleString("ja-JP");
    document.querySelector(".summary-stock").textContent = stock.toLocaleString("ja-JP");
    document.querySelector(".summary-low").textContent = low.toLocaleString("ja-JP");
    document.querySelector(".summary-sales").textContent = yen(salesTotal);
  };

  const renderProducts = () => {
    const query = searchInput.value.trim().toLocaleLowerCase("ja-JP");
    const category = categoryFilter.value;
    const visible = products
      .filter(item => category === "all" || item.category === category)
      .filter(item => `${item.name} ${item.details}`.toLocaleLowerCase("ja-JP").includes(query))
      .sort((a, b) => {
        const categoryOrder = Object.keys(CATEGORY_LABELS);
        const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        return categoryDiff || a.name.localeCompare(b.name, "ja");
      });

    productCount.textContent = `${visible.length}商品を表示`;
    productList.innerHTML = visible.map(item => {
      const stock = normalizeNumber(item.stock);
      const stateClass = stock === 0 ? "sold-out" : stock <= LOW_STOCK ? "low" : "";
      const stockClass = stock === 0 ? "zero" : stock <= LOW_STOCK ? "low" : "";
      const image = item.image
        ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">`
        : `<span class="no-image">NO IMAGE</span>`;
      return `<article class="product-card ${stateClass}" data-id="${escapeHtml(item.id)}">
        <div class="product-image">
          ${image}
          <span class="stock-label ${stockClass}">${stock === 0 ? "在庫切れ" : `在庫 ${stock}`}</span>
        </div>
        <div class="product-copy">
          <div class="product-topline">
            <span class="category-badge ${escapeHtml(item.category)}">${escapeHtml(CATEGORY_LABELS[item.category] || "その他")}</span>
            <button class="edit-product" data-action="edit" type="button">編集</button>
          </div>
          <h3>${escapeHtml(item.name)}</h3>
          <span class="product-details">${escapeHtml(item.details || "　")}</span>
          <strong class="product-price">${yen(item.price)}</strong>
          <div class="stock-controls" aria-label="${escapeHtml(item.name)}の在庫調整">
            <button data-action="stock" data-delta="-1" type="button" aria-label="在庫を1減らす">−</button>
            <strong>${stock}</strong>
            <button data-action="stock" data-delta="1" type="button" aria-label="在庫を1増やす">＋</button>
          </div>
          <button class="sale-product-button" data-action="sale" type="button" ${stock === 0 ? "disabled" : ""}>販売を記録</button>
        </div>
      </article>`;
    }).join("") || `<div class="empty-state">
      <div><strong>該当する商品がありません</strong><span>検索条件を変更するか、商品を登録してください。</span></div>
    </div>`;
  };

  const formatSaleDate = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ja-JP", {
      month:"numeric", day:"numeric", hour:"2-digit", minute:"2-digit"
    }).format(date);
  };

  const renderSales = () => {
    const recent = [...sales].sort((a, b) => String(b.soldAt).localeCompare(String(a.soldAt))).slice(0, 50);
    document.querySelector(".sales-count").textContent = `${sales.length}件`;
    salesList.innerHTML = recent.map(sale => {
      const total = normalizeNumber(sale.quantity) * normalizeNumber(sale.unitPrice);
      return `<article class="sale-entry" data-sale-id="${escapeHtml(sale.id)}">
        <time datetime="${escapeHtml(sale.soldAt)}">${escapeHtml(formatSaleDate(sale.soldAt))}</time>
        <strong>${escapeHtml(sale.productName)} × ${normalizeNumber(sale.quantity)}</strong>
        <span>${yen(total)}</span>
        <button class="undo-sale" data-action="undo-sale" type="button">取消</button>
      </article>`;
    }).join("") || `<div class="empty-state"><div><strong>販売履歴はありません</strong><span>商品を販売すると、ここに記録されます。</span></div></div>`;
  };

  const renderAll = () => {
    renderSummary();
    renderProducts();
    renderSales();
  };

  const setModal = (dialog, open) => {
    dialog.hidden = !open;
    dialog.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("modal-open", open);
  };

  document.querySelector("#product-image").innerHTML = IMAGE_OPTIONS
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("");

  const openProductForm = item => {
    productForm.reset();
    document.querySelector("#product-form-title").textContent = item ? "商品を編集" : "商品を登録";
    document.querySelector("#product-id").value = item?.id || "";
    document.querySelector("#product-name").value = item?.name || "";
    document.querySelector("#product-category").value = item?.category || "tshirt";
    document.querySelector("#product-price").value = normalizeNumber(item?.price);
    document.querySelector("#product-stock").value = normalizeNumber(item?.stock);
    document.querySelector("#product-details").value = item?.details || "";
    document.querySelector("#product-image").value = item?.image || "";
    document.querySelector(".delete-product").hidden = !item;
    setModal(productDialog, true);
    document.querySelector("#product-name").focus();
  };

  const openSaleForm = item => {
    saleForm.reset();
    document.querySelector("#sale-product-id").value = item.id;
    document.querySelector(".sale-product-name").textContent = item.name;
    document.querySelector(".sale-current-stock").textContent = `現在庫 ${normalizeNumber(item.stock)}点`;
    const image = document.querySelector(".sale-product-image");
    image.src = item.image || "";
    image.alt = item.name;
    image.hidden = !item.image;
    const quantity = document.querySelector("#sale-quantity");
    quantity.value = "1";
    quantity.max = String(normalizeNumber(item.stock));
    document.querySelector("#sale-price").value = normalizeNumber(item.price);
    updateSaleTotal();
    setModal(saleDialog, true);
    quantity.focus();
  };

  const updateSaleTotal = () => {
    const quantity = normalizeNumber(document.querySelector("#sale-quantity").value);
    const price = normalizeNumber(document.querySelector("#sale-price").value);
    document.querySelector(".sale-total strong").textContent = yen(quantity * price);
  };

  searchInput.addEventListener("input", renderProducts);
  categoryFilter.addEventListener("change", renderProducts);
  document.querySelector(".add-product").addEventListener("click", () => openProductForm(null));

  productList.addEventListener("click", event => {
    const action = event.target.closest("[data-action]");
    const card = event.target.closest(".product-card");
    if (!action || !card) return;
    const item = products.find(product => product.id === card.dataset.id);
    if (!item) return;

    if (action.dataset.action === "edit") {
      openProductForm(item);
      return;
    }
    if (action.dataset.action === "stock") {
      const delta = Number(action.dataset.delta) || 0;
      const next = Math.max(0, normalizeNumber(item.stock) + delta);
      if (next === normalizeNumber(item.stock) && delta < 0) return;
      item.stock = next;
      item.updatedAt = new Date().toISOString();
      saveProducts();
      notify(`在庫を${next}点に変更しました`);
      return;
    }
    if (action.dataset.action === "sale" && normalizeNumber(item.stock) > 0) {
      openSaleForm(item);
    }
  });

  productForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(productForm);
    const id = String(data.get("id") || "");
    const item = {
      id: id || `product-${Date.now()}`,
      name: String(data.get("name") || "").trim(),
      category: CATEGORY_LABELS[data.get("category")] ? String(data.get("category")) : "other",
      details: String(data.get("details") || "").trim(),
      price: normalizeNumber(data.get("price")),
      stock: normalizeNumber(data.get("stock")),
      image: String(data.get("image") || ""),
      updatedAt: new Date().toISOString()
    };
    if (!item.name) return;
    const index = products.findIndex(product => product.id === id);
    if (index >= 0) products[index] = item;
    else products.push(item);
    write(PRODUCTS_KEY, products);
    setModal(productDialog, false);
    renderAll();
    notify(index >= 0 ? "商品を更新しました" : "商品を登録しました");
  });

  document.querySelector(".delete-product").addEventListener("click", () => {
    const id = document.querySelector("#product-id").value;
    const item = products.find(product => product.id === id);
    if (!item || !window.confirm(`${item.name}を削除しますか？`)) return;
    products = products.filter(product => product.id !== id);
    write(PRODUCTS_KEY, products);
    setModal(productDialog, false);
    renderAll();
    notify("商品を削除しました");
  });

  saleForm.addEventListener("input", updateSaleTotal);
  saleForm.addEventListener("submit", event => {
    event.preventDefault();
    const id = document.querySelector("#sale-product-id").value;
    const item = products.find(product => product.id === id);
    if (!item) return;
    const quantity = normalizeNumber(document.querySelector("#sale-quantity").value);
    const unitPrice = normalizeNumber(document.querySelector("#sale-price").value);
    if (quantity < 1) {
      notify("販売数を入力してください");
      return;
    }
    if (quantity > normalizeNumber(item.stock)) {
      notify("在庫数を超えています");
      return;
    }
    item.stock = normalizeNumber(item.stock) - quantity;
    item.updatedAt = new Date().toISOString();
    sales.push({
      id:`sale-${Date.now()}`,
      productId:item.id,
      productName:item.name,
      quantity,
      unitPrice,
      soldAt:new Date().toISOString()
    });
    write(PRODUCTS_KEY, products);
    write(SALES_KEY, sales);
    setModal(saleDialog, false);
    renderAll();
    notify(`${item.name}を${quantity}点販売しました`);
  });

  salesList.addEventListener("click", event => {
    const button = event.target.closest('[data-action="undo-sale"]');
    const entry = event.target.closest(".sale-entry");
    if (!button || !entry) return;
    const sale = sales.find(item => item.id === entry.dataset.saleId);
    if (!sale || !window.confirm("この販売記録を取り消しますか？")) return;
    const product = products.find(item => item.id === sale.productId);
    if (product) product.stock = normalizeNumber(product.stock) + normalizeNumber(sale.quantity);
    sales = sales.filter(item => item.id !== sale.id);
    write(PRODUCTS_KEY, products);
    write(SALES_KEY, sales);
    renderAll();
    notify("販売記録を取り消しました");
  });

  document.querySelectorAll(".product-dialog .modal-close,.cancel-product").forEach(button => {
    button.addEventListener("click", () => setModal(productDialog, false));
  });
  document.querySelector(".sale-dialog .modal-close").addEventListener("click", () => setModal(saleDialog, false));
  document.querySelector(".cancel-sale").addEventListener("click", () => setModal(saleDialog, false));
  [productDialog, saleDialog].forEach(dialog => {
    dialog.addEventListener("click", event => {
      if (event.target === dialog) setModal(dialog, false);
    });
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    setModal(productDialog, false);
    setModal(saleDialog, false);
  });
  window.addEventListener("storage", event => {
    if (event.key === PRODUCTS_KEY) products = read(PRODUCTS_KEY, []);
    if (event.key === SALES_KEY) sales = read(SALES_KEY, []);
    if (event.key === PRODUCTS_KEY || event.key === SALES_KEY) renderAll();
  });

  renderAll();
})();
