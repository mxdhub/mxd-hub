// hub-fetch.js — nối UI với Worker: đổ dữ liệu vào #auto-products theo chuẩn "meta link" MXD
(function () {
  const cfg = (window.HUB_CONFIG || {});
  const W = (cfg.WORKER_URL || "").replace(/\/+$/, "");
  const KEY = (cfg.X_KEY || "");

  if (!W) {
    console.warn("[hub-fetch] WORKER_URL chưa được cấu hình trong hub-config.js");
    return;
  }

  // Tìm các vùng cần nạp sản phẩm
  document.addEventListener("DOMContentLoaded", () => {
    const lists = document.querySelectorAll("#auto-products");
    lists.forEach(loadIntoList);
  });

  async function loadIntoList(listEl) {
    try {
      const source = (listEl.dataset.source || "shopee").toLowerCase();   // "shopee" | "lazada"
      const mode   = (listEl.dataset.mode   || "keyword").toLowerCase(); // "keyword" | "category" | "shop"
      const q      = (listEl.dataset.q      || "may cat").trim();        // từ khóa
      const limit  = parseInt(listEl.dataset.limit || "6", 10);

      const url = new URL(`${W}/crawler/${source}/top`);
      url.searchParams.set("mode", mode);
      url.searchParams.set("q", q);
      url.searchParams.set("limit", String(limit));

      const headers = {};
      if (KEY) headers["x-key"] = KEY;

      const res = await fetch(url.toString(), { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data || !Array.isArray(data.items)) {
        console.warn("[hub-fetch] payload lạ:", data);
        return;
      }

      // Xóa placeholder cũ (nếu có)
      clearChildren(listEl);

      // Tạo meta link + buy links theo chuẩn MXD (Rule 44)
      data.items.forEach(item => {
        const sku = item.id ? slugify(item.id) : slugify(item.name || "item");
        const meta = document.createElement("a");
        meta.className = "product-meta";
        meta.href = item.origin_url || "#";
        meta.textContent = item.name || "Sản phẩm";
        meta.setAttribute("data-merchant", source);
        meta.setAttribute("data-sku", sku);
        // Cho phép ảnh tuyệt đối; renderer fallback vẫn dùng /assets/img/products/<sku>.webp nếu thiếu
        if (item.image_url) meta.setAttribute("data-img", item.image_url);
        if (item.price_vnd) meta.setAttribute("data-price", String(item.price_vnd));

        listEl.appendChild(meta);

        // Tối thiểu 1 buy link
        const buy = document.createElement("a");
        buy.className = "buy";
        buy.href = item.origin_url || "#";
        buy.textContent = "Xem sản phẩm";
        listEl.appendChild(buy);
      });
    } catch (err) {
      console.error("[hub-fetch] lỗi nạp:", err);
      const p = document.createElement("p");
      p.textContent = "Không tải được danh sách sản phẩm lúc này.";
      listEl.appendChild(p);
    }
  }

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function slugify(s) {
    s = String(s).toLowerCase();
    // bỏ dấu tiếng Việt cơ bản
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s || "item";
  }
})();
