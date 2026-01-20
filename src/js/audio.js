
console.log("audio page loaded");
document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
        BETTER EMOJI THUMBNAIL (High contrast + stroke)
  ===================================================== */
  const thumbStyles = [
    { emoji: "🌿", colors: ["#A8E6CF", "#56C596"] },
    { emoji: "🌅", colors: ["#FF9C6D", "#FFD3A5"] },
    { emoji: "🌊", colors: ["#6ECFFB", "#B0F7FF"] },
    { emoji: "✨", colors: ["#FDE2FD", "#C896FF"] },
    { emoji: "📘", colors: ["#8CCBFF", "#FFF89A"] }
  ];

  function generateThumb(index, size = 500) {
    const c = thumbStyles[index % thumbStyles.length];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    // background
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, c.colors[0]);
    g.addColorStop(1, c.colors[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // emoji
    ctx.font = `${Math.floor(size * 0.50)}px 'Apple Color Emoji','Segoe UI Emoji'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // white glow stroke
    ctx.lineWidth = size * 0.04;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.strokeText(c.emoji, size / 2, size / 2);

    // main emoji
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(c.emoji, size / 2, size / 2);

    return canvas.toDataURL("image/png");
  }


  /* =====================================================
      SELECTORS
  ===================================================== */
  const cards = [...document.querySelectorAll(".premium-card")];
  const audios = cards.map(c => c.querySelector("audio"));
  const titles = cards.map(c => c.querySelector(".premium-title").textContent);
  const subs = cards.map(c => c.querySelector(".premium-sub").textContent);

  const mini = document.getElementById("miniPlayer");
  const miniThumb = document.getElementById("miniThumb");
  const miniTitle = document.getElementById("miniTitle");
  const miniProgress = document.getElementById("miniProgress");
  const miniPlayBtn = document.getElementById("miniPlayBtn");
  const miniPrev = document.getElementById("miniPrev");
  const miniNext = document.getElementById("miniNext");
  const miniBar = document.getElementById("miniBar");

  const expand = document.getElementById("expandPlayer");
  const expandThumb = document.getElementById("expandThumb");
  const expandTitle = document.getElementById("expandTitle");
  const expandSub = document.getElementById("expandSub");
  const expandProgress = document.getElementById("expandProgress");
  const expandPlay = document.getElementById("expandPlay");
  const expandPrev = document.getElementById("expandPrev");
  const expandNext = document.getElementById("expandNext");
  const expandBar = document.getElementById("expandBar");
  const expandClose = document.getElementById("expandClose");

  let current = -1;
  let raf = null;


  /* =====================================================
        AUTO THUMB APPLY
  ===================================================== */
  document.querySelectorAll("[data-thumb]").forEach((el, i) => {
    el.style.backgroundImage = `url(${generateThumb(i)})`;
  });


  /* =====================================================
        ERROR CHECK — Missing audio file
  ===================================================== */
  audios.forEach((a, i) => {
    a.addEventListener("error", () => {
      console.error("Audio load failed:", a.src);
      cards[i].style.opacity = "0.5";
      cards[i].style.pointerEvents = "none";
      cards[i].querySelector(".premium-sub").textContent = "❌ File audio không tồn tại!";
    });
  });


  /* =====================================================
        CORE PLAYER LOGIC
  ===================================================== */
  function playIndex(i) {
    if (i < 0 || i >= audios.length) return;

    audios.forEach((a, k) => { if (k !== i) a.pause(); });
    current = i;

    audios[i].play().catch(err => console.warn("Play error:", err));
    mini.style.display = "flex";
    miniThumb.src = generateThumb(i);
    miniTitle.textContent = titles[i];

    updateButtons();
    if (!raf) tick();
  }

  function updateButtons() {
    miniPlayBtn.textContent = audios[current].paused ? "▶" : "⏸";
    expandPlay.textContent = audios[current].paused ? "▶" : "⏸";
  }

  function tick() {
    const a = audios[current];
    if (!a || isNaN(a.duration)) return;

    miniProgress.style.width = (a.currentTime / a.duration) * 100 + "%";
    expandProgress.style.width = (a.currentTime / a.duration) * 100 + "%";

    raf = requestAnimationFrame(tick);
  }


  /* =====================================================
        CLICK CARDS TO PLAY
  ===================================================== */
  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      if (current === i && !audios[i].paused) {
        openExpand();
      } else {
        playIndex(i);
      }
    });
  });


  /* =====================================================
       MINI PLAYER — PLAY/PAUSE/NEXT/PREV
  ===================================================== */
  miniPlayBtn.onclick = () => {
    const a = audios[current];
    if (a.paused) a.play(); else a.pause();
    updateButtons();
  };

  miniPrev.onclick = () => playIndex((current - 1 + audios.length) % audios.length);
  miniNext.onclick = () => playIndex((current + 1) % audios.length);

  miniBar.onclick = e => {
    const a = audios[current];
    const r = miniBar.getBoundingClientRect();
    const p = (e.clientX - r.left) / r.width;
    a.currentTime = a.duration * p;
  };


  /* =====================================================
       EXPANDED VIEW
  ===================================================== */
  function openExpand() {
    expand.classList.remove("hidden");
    expandThumb.style.backgroundImage = `url(${generateThumb(current)})`;
    expandTitle.textContent = titles[current];
    expandSub.textContent = subs[current];
  }

  expandClose.onclick = () => {
    expand.classList.add("hidden");
  };

  expandPrev.onclick = () => playIndex((current - 1 + audios.length) % audios.length);
  expandNext.onclick = () => playIndex((current + 1) % audios.length);

  expandPlay.onclick = () => {
    const a = audios[current];
    if (a.paused) a.play(); else a.pause();
    updateButtons();
  };

  expandBar.onclick = e => {
    const a = audios[current];
    const r = expandBar.getBoundingClientRect();
    const p = (e.clientX - r.left) / r.width;
    a.currentTime = a.duration * p;
  };
});
