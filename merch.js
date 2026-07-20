(() => {
  "use strict";

  const LOW_STOCK = 3;
  const CATEGORY_LABELS = { tshirt:"Tシャツ", sticker:"ステッカー", badge:"缶バッジ", cd:"CD・音源", other:"その他" };
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
  let products = [];
  let sales = [];

  const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const yen = value => `¥${Math.max(0, Number(value) || 0).toLocaleString("ja-JP")}`;
  const normalizeNumber = value => Math.max(0, Math.floor(Number(value) || 0));
  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => toast.classList.remove("show"), 1900);
  };
  const applyData = data => {
    products = Array.isArray(data?.products) ? data.products : [];
    sales = Array.isArray(data?.sales) ? data.sales : [];
    renderAll();
  };

  const renderSummary = () => {
    const stock = products.reduce((total, item) => total + normalizeNumber(item.stock), 0);
    const low = products.filter(item => normalizeNumber(item.stock) <= LOW_STOCK).length;
    const total = sales.reduce((sum, sale) => sum + normalizeNumber(sale.quantity) * normalizeNumber(sale.unitPrice), 0);
    document.querySelector(".summary-products").textContent = products.length.toLocaleString("ja-JP");
    document.querySelector(".summary-stock").textContent = stock.toLocaleString("ja-JP");
    document.querySelector(".summary-low").textContent = low.toLocaleString("ja-JP");
    document.querySelector(".summary-sales").textContent = yen(total);
  };
  const renderProducts = () => {
    const query = searchInput.value.trim().toLocaleLowerCase("ja-JP");
    const category = categoryFilter.value;
    const visible = products
      .filter(item => category === "all" || item.category === category)
      .filter(item => `${item.name} ${item.details}`.toLocaleLowerCase("ja-JP").includes(query))
      .sort((a, b) => Object.keys(CATEGORY_LABELS).indexOf(a.category) - Object.keys(CATEGORY_LABELS).indexOf(b.category) || a.name.localeCompare(b.name, "ja"));
    productCount.textContent = `${visible.length}商品を表示`;
    productList.innerHTML = visible.map(item => {
      const stock = normalizeNumber(item.stock);
      const stateClass = stock === 0 ? "sold-out" : stock <= LOW_STOCK ? "low" : "";
      const stockClass = stock === 0 ? "zero" : stock <= LOW_STOCK ? "low" : "";
      const image = item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : `<span class="no-image">NO IMAGE</span>`;
      return `<article class="product-card ${stateClass}" data-id="${escapeHtml(item.id)}">
        <div class="product-image">${image}<span class="stock-label ${stockClass}">${stock === 0 ? "在庫切れ" : `在庫 ${stock}`}</span></div>
        <div class="product-copy"><div class="product-topline">
          <span class="category-badge ${escapeHtml(item.category)}">${escapeHtml(CATEGORY_LABELS[item.category] || "その他")}</span>
          <button class="edit-product" data-action="edit" type="button">編集</button></div>
          <h3>${escapeHtml(item.name)}</h3><span class="product-details">${escapeHtml(item.details || "　")}</span>
          <strong class="product-price">${yen(item.price)}</strong>
          <div class="stock-controls" aria-label="${escapeHtml(item.name)}の在庫調整">
            <button data-action="stock" data-delta="-1" type="button" aria-label="在庫を1減らす">−</button>
            <strong>${stock}</strong><button data-action="stock" data-delta="1" type="button" aria-label="在庫を1増やす">＋</button>
          </div><button class="sale-product-button" data-action="sale" type="button" ${stock === 0 ? "disabled" : ""}>販売を記録</button>
        </div></article>`;
    }).join("") || `<div class="empty-state"><div><strong>該当する商品がありません</strong><span>検索条件を変更するか、商品を登録してください。</span></div></div>`;
  };
  const formatSaleDate = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("ja-JP", { month:"numeric", day:"numeric", hour:"2-digit", minute:"2-digit" }).format(date);
  };
  const renderSales = () => {
    const recent = [...sales].sort((a, b) => String(b.soldAt).localeCompare(String(a.soldAt))).slice(0, 50);
    document.querySelector(".sales-count").textContent = `${sales.length}件`;
    salesList.innerHTML = recent.map(sale => `<article class="sale-entry" data-sale-id="${escapeHtml(sale.id)}">
      <time datetime="${escapeHtml(sale.soldAt)}">${escapeHtml(formatSaleDate(sale.soldAt))}</time>
      <strong>${escapeHtml(sale.productName)} × ${normalizeNumber(sale.quantity)}</strong>
      <span>${yen(normalizeNumber(sale.quantity) * normalizeNumber(sale.unitPrice))}</span>
      <button class="undo-sale" data-action="undo-sale" type="button">取消</button></article>`).join("")
      || `<div class="empty-state"><div><strong>販売履歴はありません</strong><span>商品を販売すると、ここに記録されます。</span></div></div>`;
  };
  const renderAll = () => { renderSummary(); renderProducts(); renderSales(); };
  const setModal = (dialog, open) => {
    dialog.hidden = !open;
    dialog.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("modal-open", open);
  };

  document.querySelector("#product-image").innerHTML = IMAGE_OPTIONS.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
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
  const updateSaleTotal = () => {
    const quantity = normalizeNumber(document.querySelector("#sale-quantity").value);
    const price = normalizeNumber(document.querySelector("#sale-price").value);
    document.querySelector(".sale-total strong").textContent = yen(quantity * price);
  };
  const openSaleForm = item => {
    saleForm.reset();
    document.querySelector("#sale-product-id").value = item.id;
    document.querySelector(".sale-product-name").textContent = item.name;
    document.querySelector(".sale-current-stock").textContent = `現在庫 ${normalizeNumber(item.stock)}点`;
    const image = document.querySelector(".sale-product-image");
    image.src = item.image || ""; image.alt = item.name; image.hidden = !item.image;
    const quantity = document.querySelector("#sale-quantity");
    quantity.value = "1"; quantity.max = String(normalizeNumber(item.stock));
    document.querySelector("#sale-price").value = normalizeNumber(item.price);
    updateSaleTotal();
    setModal(saleDialog, true);
    quantity.focus();
  };

  searchInput.addEventListener("input", renderProducts);
  categoryFilter.addEventListener("change", renderProducts);
  document.querySelector(".add-product").addEventListener("click", () => openProductForm(null));
  productList.addEventListener("click", async event => {
    const action = event.target.closest("[data-action]");
    const card = event.target.closest(".product-card");
    if (!action || !card) return;
    const item = products.find(product => product.id === card.dataset.id);
    if (!item) return;
    if (action.dataset.action === "edit") return openProductForm(item);
    if (action.dataset.action === "sale" && normalizeNumber(item.stock) > 0) return openSaleForm(item);
    if (action.dataset.action === "stock") {
      const delta = Number(action.dataset.delta) || 0;
      if (normalizeNumber(item.stock) === 0 && delta < 0) return;
      try {
        const data = await NK.save("product.adjustStock", { id:item.id, delta });
        applyData(data);
        const updated = products.find(product => product.id === item.id);
        notify(`在庫を${normalizeNumber(updated?.stock)}点に変更しました`);
      } catch (error) { notify(error.message); }
    }
  });
  productForm.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const id = String(formData.get("id") || "");
    const item = {
      id:id || `product-${Date.now()}`, name:String(formData.get("name") || "").trim(),
      category:CATEGORY_LABELS[formData.get("category")] ? String(formData.get("category")) : "other",
      details:String(formData.get("details") || "").trim(), price:normalizeNumber(formData.get("price")),
      stock:normalizeNumber(formData.get("stock")), image:String(formData.get("image") || "")
    };
    if (!item.name) return;
    try {
      applyData(await NK.save("product.save", { item }));
      setModal(productDialog, false);
      notify(id ? "商品を更新しました" : "商品を共有しました");
    } catch (error) { notify(error.message); }
  });
  document.querySelector(".delete-product").addEventListener("click", async () => {
    const id = document.querySelector("#product-id").value;
    const item = products.find(product => product.id === id);
    if (!item || !window.confirm(`${item.name}を削除しますか？`)) return;
    try {
      applyData(await NK.save("product.delete", { id }));
      setModal(productDialog, false);
      notify("商品を削除しました");
    } catch (error) { notify(error.message); }
  });
  saleForm.addEventListener("input", updateSaleTotal);
  saleForm.addEventListener("submit", async event => {
    event.preventDefault();
    const productId = document.querySelector("#sale-product-id").value;
    const quantity = normalizeNumber(document.querySelector("#sale-quantity").value);
    const unitPrice = normalizeNumber(document.querySelector("#sale-price").value);
    if (quantity < 1) return notify("販売数を入力してください");
    try {
      const data = await NK.save("sale.record", {
        id:globalThis.crypto?.randomUUID?.() || `sale-${Date.now()}`,
        productId, quantity, unitPrice, soldAt:new Date().toISOString()
      });
      applyData(data);
      setModal(saleDialog, false);
      notify("販売を記録し、在庫を共有しました");
    } catch (error) {
      notify(error.message);
      if (error.status === 409) applyData(await NK.load());
    }
  });
  salesList.addEventListener("click", async event => {
    const entry = event.target.closest(".sale-entry");
    if (!event.target.closest('[data-action="undo-sale"]') || !entry || !window.confirm("この販売記録を取り消しますか？")) return;
    try {
      applyData(await NK.save("sale.undo", { id:entry.dataset.saleId }));
      notify("販売記録を取り消し、在庫を戻しました");
    } catch (error) { notify(error.message); }
  });
  document.querySelectorAll(".product-dialog .modal-close,.cancel-product").forEach(button => button.addEventListener("click", () => setModal(productDialog, false)));
  document.querySelector(".sale-dialog .modal-close").addEventListener("click", () => setModal(saleDialog, false));
  document.querySelector(".cancel-sale").addEventListener("click", () => setModal(saleDialog, false));
  [productDialog, saleDialog].forEach(dialog => dialog.addEventListener("click", event => { if (event.target === dialog) setModal(dialog, false); }));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { setModal(productDialog, false); setModal(saleDialog, false); }
  });

  NK.start(async () => {
    applyData(await NK.load());
    window.setInterval(async () => {
      if (document.visibilityState === "visible" && productDialog.hidden && saleDialog.hidden) {
        try { applyData(await NK.load()); } catch { /* api.jsが接続状態を表示する */ }
      }
    }, 8000);
  }).catch(error => NK.showError(error.message));
})();
