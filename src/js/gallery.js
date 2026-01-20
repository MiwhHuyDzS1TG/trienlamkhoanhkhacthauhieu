// src/js/gallery.js
// Upgraded gallery: card-style, filter, search, pdf thumbnail + preload, lightbox with nav (prev/next)
// Requires pdf.js loaded on page (we assume pdf.min.js is included in the HTML)

(function () {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  if (!items.length) return;

  /* -----------------------------
     Build lightbox container
  ------------------------------*/
  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.className = "fixed inset-0 bg-black/90 hidden items-center justify-center z-50 p-4";
  lb.innerHTML = `
    <div class="absolute top-6 right-6 z-50">
      <button id="lb-close" class="text-white text-2xl">✕</button>
    </div>

    <button id="lb-prev" aria-label="Previous" class="absolute left-4 top-1/2 -translate-y-1/2 text-white z-50 text-3xl">‹</button>
    <button id="lb-next" aria-label="Next" class="absolute right-4 top-1/2 -translate-y-1/2 text-white z-50 text-3xl">›</button>

    <div id="lb-view" class="max-w-[92%] max-h-[86%] flex items-center justify-center"></div>
    <div id="lb-caption" class="text-white mt-4 text-center text-sm max-w-[92%]"></div>
  `;
  document.body.appendChild(lb);

  const lbView = document.getElementById("lb-view");
  const lbCaption = document.getElementById("lb-caption");
  const lbClose = document.getElementById("lb-close");
  const lbPrev = document.getElementById("lb-prev");
  const lbNext = document.getElementById("lb-next");

  let currentIndex = -1;
  const visibleItems = () => Array.from(document.querySelectorAll(".gallery-item")).filter(el => !el.classList.contains('hidden-by-filter'));

  function showLightboxAt(index) {
    const list = visibleItems();
    if (!list.length) return;
    index = (index + list.length) % list.length;
    const el = list[index];
    if (!el) return;
    currentIndex = index;
    openItem(el);
  }

  function openItem(el) {
    const type = el.dataset.type || "image";
    const title = el.dataset.title || el.querySelector("strong")?.textContent || "";
    const author = el.dataset.author || el.querySelector("span")?.textContent || "";
    lbCaption.textContent = title + (author ? ` — ${author}` : "");

    if (type === "pdf") {
      // open embed viewer
      const url = el.dataset.pdf;
      lbView.innerHTML = `<embed src="${url}" type="application/pdf" class="w-full h-[80vh] rounded-lg bg-white" />`;
      lb.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    } else {
      // image -> preload to fix preview glitches
      const src = el.dataset.full || el.querySelector("img")?.src;
      if (!src) return;
      lbView.innerHTML = `<div class="loader">Đang tải…</div>`;
      lb.classList.remove("hidden");
      document.body.style.overflow = "hidden";

      const img = new Image();
      img.src = src;
      img.alt = title;
      img.className = "max-w-full max-h-[80vh] rounded-lg shadow-xl";
      img.onload = () => {
        lbView.innerHTML = "";
        lbView.appendChild(img);
      };
      img.onerror = () => {
        lbView.innerHTML = `<div class="text-white">Không thể tải ảnh.</div>`;
      };
    }
  }

  lbClose.addEventListener("click", () => {
    lb.classList.add("hidden");
    document.body.style.overflow = "";
  });

  lbPrev.addEventListener("click", () => { showLightboxAt(currentIndex - 1); });
  lbNext.addEventListener("click", () => { showLightboxAt(currentIndex + 1); });

  lb.addEventListener("click", (e) => {
    if (e.target === lb) {
      lb.classList.add("hidden");
      document.body.style.overflow = "";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (lb.classList.contains("hidden")) return;
    if (e.key === "Escape") { lb.classList.add("hidden"); document.body.style.overflow = ""; }
    if (e.key === "ArrowLeft") showLightboxAt(currentIndex - 1);
    if (e.key === "ArrowRight") showLightboxAt(currentIndex + 1);
  });

  /* -----------------------------
     PDF THUMBNAIL RENDER
     - render first page to canvas
     - mark element with data-rendered when done
  ------------------------------*/
  const pdfjsLib = window["pdfjs-dist/build/pdf"];
  if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const pdfItems = Array.from(document.querySelectorAll('[data-type="pdf"]'));
    pdfItems.forEach(async (el) => {
      const url = el.dataset.pdf;
      const canvas = el.querySelector('.pdf-thumb');
      if (!canvas) return;
      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);
        // scale -> fit width ~ 380px equivalent
        const viewport = page.getViewport({ scale: 1.0 });
        // compute scale to make canvas width ~ element width
        const targetWidth = canvas.clientWidth || 380;
        const scale = targetWidth / viewport.width;
        const vp = page.getViewport({ scale });
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        el.dataset.rendered = "true";
      } catch (err) {
        console.error("PDF render fail", err);
        // fallback: show simple box
        canvas.style.background = "#f3f0ec";
        canvas.style.display = "flex";
        canvas.style.alignItems = "center";
        canvas.style.justifyContent = "center";
        canvas.outerHTML = `<div class="w-full h-[160px] rounded-lg flex items-center justify-center text-textmuted bg-bordermuted/10">PDF</div>`;
        el.dataset.rendered = "error";
      }
    });
  }

  /* -----------------------------
     CLICK HANDLER FOR CARDS
     - for PDF: wait until rendered
  ------------------------------*/
  function findIndexInVisible(el) {
    return visibleItems().indexOf(el);
  }

  items.forEach((el) => {
    el.addEventListener("click", (e) => {
      // if PDF, ensure rendered before open
      if (el.dataset.type === "pdf" && el.dataset.rendered !== "true") {
        // simple feedback if still rendering
        const badge = el.querySelector('.pdf-badge');
        if (badge) {
          badge.textContent = 'Đang xử lý…';
          setTimeout(() => { badge.textContent = 'PDF'; }, 900);
        }
        // small delay to allow render to finish (render happens async)
        setTimeout(() => {
          const idx = findIndexInVisible(el);
          if (idx >= 0) showLightboxAt(idx);
        }, 450);
      } else {
        const idx = findIndexInVisible(el);
        if (idx >= 0) showLightboxAt(idx);
      }
    });
  });

  /* -----------------------------
     FILTER + SEARCH
  ------------------------------*/
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const searchInput = document.getElementById('gallerySearch');

  function applyFilter(type) {
    items.forEach(el => {
      el.classList.remove('hidden-by-filter');
      if (type === 'image' && el.dataset.type !== 'image') el.classList.add('hidden-by-filter');
      if (type === 'pdf' && el.dataset.type !== 'pdf') el.classList.add('hidden-by-filter');
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('btn-active'));
      btn.classList.add('btn-active');
      const f = btn.dataset.filter;
      applyFilter(f);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      items.forEach(el => {
        const title = (el.dataset.title || '').toLowerCase();
        const author = "";
        const match = (!q) || title.includes(q) || author.includes(q);
        if (!match) el.classList.add('hidden-by-filter');
        else el.classList.remove('hidden-by-filter');
      });
    });
  }

  /* -----------------------------
     Responsive: ensure canvas resized on window resize (pdf thumbs)
  ------------------------------*/
  window.addEventListener('resize', () => {
    // re-rendering pdf thumbnails is heavy; skip automatic re-render
    // but if needed, we could re-init thumbnails here.
  });
})();
