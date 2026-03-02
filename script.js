// 0) Подключаем плагины (нам ScrollTrigger позже, но пусть будет)
gsap.registerPlugin(ScrollTrigger);

// 1) Забираем элементы со страницы в переменные
const loader = document.getElementById("loader");
const startBtn = document.getElementById("startBtn");
const loaderText = document.getElementById("loaderText");
const revealText = document.getElementById("revealText");
const logoBig = document.getElementById("logoBig");
const logoSlot = document.getElementById("logoSlot");
const machine = document.getElementById("machine");
document.body.classList.add("is-locked");
const burger = document.getElementById("burger");

// 2) Утилита: удобный cubic-bezier как в Figma
// Figma: (0.9, 0, 0.25, 1) и (0.8, 0, 0.2, 0.9)
const easeIntro = "cubic-bezier(0.9, 0, 0.25, 1)";
const easeToPage = "cubic-bezier(0.8, 0, 0.2, 0.9)";

const logoHeight = logoBig.getBoundingClientRect().height;

window.__modalOpen = false;

// вычисляем ккординаты машинки, чтоб без магии с четкими координатами
function getMachineLeftX(extraLeft = 0, leftPadding = 40, rightPadding = 40){
  const inner = document.querySelector(".header-inner");
  const innerRect = inner.getBoundingClientRect();
  const mRect = machine.getBoundingClientRect();

  // где машинка сейчас, когда x = 0 (она якорится right:40px)
  const currentLeft = innerRect.right - rightPadding - mRect.width;

  // где хотим её видеть: слева с padding, И ЕЩЁ левее на extraLeft
  const desiredLeft = innerRect.left + leftPadding - extraLeft;

  // разница и есть нужный x (будет отрицательнее при росте extraLeft)
  return desiredLeft - currentLeft;
}

//словить положение бургера для перемещения туда машинки
function getMachineToBurgerX(){
  const mRect = machine.getBoundingClientRect();
  const bRect = burger.getBoundingClientRect();
  // текущий центр машинки -> центр бургера
  const mCenter = mRect.left + mRect.width / 2;
  const bCenter = bRect.left + bRect.width / 2;
  return bCenter - mCenter;
}
//словить размер бургера для уменьшения машинки
function getMachineToBurgerScale(){
  const mRect = machine.getBoundingClientRect();
  const bRect = burger.getBoundingClientRect();
  // масштаб по ширине (обычно достаточно)
  return bRect.width / mRect.width;
}

//управление смены цветов и движение при скролле
function initSceneSystem(){

  const root = document.documentElement;
  const bgMachine = document.getElementById("bgMachine");
  const bgThreads = document.getElementById("bgThreads");

  const headerST = []; // <-- сюда соберём триггеры, которые “скрабят” header

  // --- стартовые состояния ---
  gsap.set(bgMachine, {
    autoAlpha: 0,
    y: 0
  });

  gsap.set(bgThreads, {
    autoAlpha: 0
  });

  // --- сцены ---
  const scenes = [
    {
      trigger: ".scene--tshirt",
      bg: ["#C5B39F", "#F2E9DE"],
      header: ["#F2E9DE","#CDBDA9", "#C5B39F"],
      ink: "#8E7A66",
      burger: "#f2e9de",
      machineY: 0
    },
    {
      trigger: ".scene--dress",
      bg: ["#F7BAB7", "#E85553"],
      header: ["#F29897", "#D55453", "#AE1E1E"],
      ink: "#7F0F0D",
      burger: "#D55453",
      machineY: -160
    },
    {
      trigger: ".scene--suit",
      bg: ["#C5DBE3", "#6B7F8E"],
      header: ["#D9E8ED", "#96BECB", "#3B647A"],
      ink: "#4F5E66",
      burger: "#96BECB",
      machineY: -320
    },
    {
      trigger: ".scene--dog-suit",
      bg: ["#C5E3D8", "#328060"],
      header: ["#D5FBD3", "#96CBB3", "#42924B"],
      ink: "#297332",
      burger: "#96CBB3",
      machineY: -480
    }
  ];

  scenes.forEach(s => {

    const el = document.querySelector(s.trigger);
    if (!el) return;

    // --- смена цветов ---
    gsap.to(root, {
      "--bg-start": s.bg[0],
      "--bg-end": s.bg[1],

      "--header-a": s.header[0],
      "--header-b": s.header[1],
      "--header-c": s.header[2],

      "--brand-ink": s.ink,
      "--burger-col": s.burger,

      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: el,
        start: "top 70%",
        end: "bottom 30%",
        scrub: 0.3
      }
    });

     // HEADER отдельно — и сохраняем scrollTrigger
    const headerTween = gsap.to(root, {
      "--header-a": s.header[0],
      "--header-b": s.header[1],
      "--header-c": s.header[2],
      "--brand-ink": s.ink,
      "--burger-col": s.burger,
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: el,
        start: "top 70%",
        end: "bottom 30%",
        scrub: 0.3
      }
    });

    headerST.push(headerTween.scrollTrigger);

    // --- движение машинки ---
    gsap.to(bgMachine, {
      y: s.machineY,
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: el,
        start: "top 70%",
        end: "bottom 30%",
        scrub: 0.3
      }
    });
  });

    // --- FOOTER: моментальное переключение + отключаем scrub хедера ---
  // --- FOOTER: моментальное переключение + отключаем scrub хедера ---
  const footerEl = document.querySelector('.scene--footer[data-theme="dark"]') || document.querySelector(".scene--footer");
  if (footerEl) {
    ScrollTrigger.create({
      trigger: footerEl,
      start: "top top",
      end: "bottom center",

      onEnter: () => {
        header.setAttribute("data-theme", "dark");

        headerST.forEach(st => st.disable()); // перестаём скрабить header
        gsap.to(root, {
          "--header-a": "#9C886E",
          "--header-b": "#9C886E",
          "--header-c": "#9C886E",
          "--brand-ink": "#C1B3A3",
          "--burger-col": "#C1B3A3",
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto"
        });
      },

      onEnterBack: () => {
        header.setAttribute("data-theme", "dark");
      },

      onLeave: () => {
        header.removeAttribute("data-theme");
      },

      onLeaveBack: () => {
        header.removeAttribute("data-theme");

        headerST.forEach(st => st.enable()); // возвращаем скраб
        ScrollTrigger.refresh();
      }
    });
  }

  // --- машинка появляется один раз ---
  ScrollTrigger.create({
    trigger: ".scene--tshirt",
    start: "top 80%",
    once: true,
    onEnter: () => {
      gsap.to(bgMachine, {
        autoAlpha: 0.08,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  });

  // --- нитки живут от tshirt до footer ---
  ScrollTrigger.create({
    trigger: ".scene--tshirt",
    start: "top 80%",
    endTrigger: ".scene--footer",
    end: "bottom 20%",

    onEnter: () => {
      gsap.to(bgThreads, {
        autoAlpha: 0.35,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto"
      });
    },

    onLeaveBack: () => {
      gsap.to(bgThreads, {
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto"
      });
    }
  });

}

//вращение ниток
function initThreadsScrollSpin(){
  const t = document.getElementById("bgThreads");
  if (!t) return;

  gsap.to(t, {
    rotation: 720,
    ease: "none",
    scrollTrigger: {
      trigger: ".page",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4
    }
  });
}

//функция для движения бургера
  function initNeedlesBreath(){
  const burger = document.getElementById("burger");
  if (!burger) return;

  const rows = burger.querySelectorAll(".needle-row");
  if (!rows.length) return;

  window.__needlesBreathTween = gsap.to(rows, {
    y: (i) => (i === 1 ? 1 : -1),
    rotation: (i) => (i === 1 ? "+=5.2" : "+=-5.2"),
    scaleX: 1.07,
    scaleY: 1.1,
    duration: 1.8,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });
}

//параллакс от движения мыши
function initMouseParallax(){

  const m = document.getElementById("bgMachine");
  const t = document.getElementById("bgThreads");

  if (!m && !t) return;

  let targetX = 0;
  let targetY = 0;

  let currentX = 0;
  let currentY = 0;

  const ease = 0.08;

  // глубина слоёв
  const machineStrength = 20;  // слабее
  const threadsStrengthX = 32; // сильнее
  const threadsStrengthY = 24;

  window.addEventListener("mousemove", (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1..1
    const ny = (e.clientY / window.innerHeight) * 2 - 1;

    targetX = nx;
    targetY = ny;
  });

  gsap.ticker.add(() => {
    if (window.__modalOpen) return;
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    // машинка — только X
    if (m) {
      gsap.set(m, {
        x: currentX * machineStrength
      });
    }

    // нитки — X + Y
    if (t) {
      gsap.set(t, {
        x: currentX * threadsStrengthX,
        y: currentY * threadsStrengthY
      });
    }

  });
}

//параллакс для одежды
function initClothesParallax(){
  const items = document.querySelectorAll(".cloth-card__media");
  if (!items.length) return;

  const sceneStrength = {
    tshirt:     { x: 22, y: 14, tilt: 3 },
    dress:      { x: 18, y: 12, tilt: 4 },
    suit:       { x: 16, y: 10, tilt: 3 },
    "dog-suit": { x: 24, y: 16, tilt: 3 }
  };

  const inwardOffset = 10; // px
  const shadowFactor = 0.55; // насколько слабее двигается тень (0..1)

  const targets = [...items].map(el => {
    const scene = el.closest(".scene");
    const key = scene?.dataset?.scene || "";
    const s = sceneStrength[key] || { x: 18, y: 12, tilt: 6 };

    const isLeft = scene?.classList.contains("scene--img-left");
    const inwardX = isLeft ? +inwardOffset : -inwardOffset;

    // сеттеры позиции + tilt
    const setX  = gsap.quickSetter(el, "x", "px");
    const setY  = gsap.quickSetter(el, "y", "px");
    const setRX = gsap.quickSetter(el, "rotationX", "deg");
    const setRY = gsap.quickSetter(el, "rotationY", "deg");
    const setRZ = gsap.quickSetter(el, "rotationZ", "deg"); // очень мягко

    gsap.set(el, { transformPerspective: 900, transformStyle: "preserve-3d" });


    return {
      setX, setY, setRX, setRY, setRZ,
      sx: s.x, sy: s.y, tilt: s.tilt, inwardX
    };
  });

  let tx = 0, ty = 0;
  let cx = 0, cy = 0;
  const ease = 0.085;

  window.addEventListener("mousemove", (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;

    // инверсия
    tx = -nx;
    ty = -ny;
  });

  gsap.ticker.add(() => {
    if (window.__modalOpen) return;
    cx += (tx - cx) * ease;
    cy += (ty - cy) * ease;

    // амплитуда 0..1 (для “дыхания” тени)
    const amp = Math.min(1, Math.abs(cx) + Math.abs(cy));

    targets.forEach(t => {
      const x = cx * t.sx + t.inwardX;
      const y = cy * t.sy;

      const rotY = cx * t.tilt;
      const rotX = -cy * t.tilt;

      t.setX(x);
      t.setY(y);
      t.setRY(rotY);
      t.setRX(rotX);

      // супер-легкий "twist" для живости (можешь убрать)
      t.setRZ(cx * 0.25);
    });
  });
}
//появление одежды
function initClothesReveal(){

  document.querySelectorAll(".scene").forEach(scene => {

    const card = scene.querySelector(".cloth-card");
    const text = scene.querySelector(".scene__text");

    if (!card || !text) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: "top 70%"
      }
    });

    tl.from(text, {
      y: 60,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out"
    });

    tl.from(card, {
      y: 80,
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: "power4.out"
    }, "-=0.6");
  });
}

//появление заголовков
function initTitleAnimations(){

  const titles = document.querySelectorAll(".scene__title");

  titles.forEach(title => {

    gsap.fromTo(title,
      {
        x: 120,
        autoAlpha: 0
      },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: title,
          start: "top 80%",
          once: true
        }
      }
    );

  });

}

//появление текста и дыхание
function initTextRevealAndBreath(){
  const scenes = document.querySelectorAll(".scene");

  scenes.forEach(scene => {
    const textBlock = scene.querySelector(".scene__text") || scene.querySelector(".scene__body");
    const lines = scene.querySelectorAll(".scene__body p");
    if (!textBlock || !lines.length) return;

    // появление строк — позже и точнее
    gsap.to(lines, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "power2.out",
      stagger: 0.25,
      scrollTrigger: {
        trigger: textBlock,
        start: "top 78%",   // 👈 позже (можно 80% если надо ещё позже)
        once: true
      }
    });

    // дыхание — только когда текстовый блок в зоне
    const breathTl = gsap.timeline({ paused: true });
    breathTl.to(lines, {
      y: "+=4",
      duration: 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.05
    });

    ScrollTrigger.create({
      trigger: textBlock,
      start: "top 70%",
      end: "bottom 35%",
      onEnter: () => breathTl.play(),
      onLeave: () => breathTl.pause(0),
      onEnterBack: () => breathTl.play(),
      onLeaveBack: () => breathTl.pause(0)
    });
  });
}

//модальные карусели с картинками
function initModal(){
  const modal    = document.getElementById("modal");
  const overlay  = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalClose");
  const prevBtn  = document.querySelector(".modal__prev");
  const nextBtn  = document.querySelector(".modal__next");
  const carousel = document.getElementById("modalCarousel");

  if (!modal || !overlay || !closeBtn || !carousel) {
    console.warn("[modal] markup missing");
    return;
  }

  const cards = document.querySelectorAll(".cloth-card");
  if (!cards.length) return;

  // карта галерей 
  async function loadGallery(type, max = 12){
    const out = [];
    const exts = ["jpg","png","webp"];

      for (let i = 1; i <= max; i++){
      const candidates = exts.map(ext => `gallery/${type}/${i}.${ext}`);
      const results = await Promise.all(candidates.map(url => probeImage(url)));
      const foundIndex = results.findIndex(Boolean);

      if (foundIndex !== -1) {
        out.push(candidates[foundIndex]);
      } else if (i >= 3) {
        break;
      }
    }
    return out;
  }

  function probeImage(url){
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  function makeAtLeastFive(list){
    if (list.length >= 5) return list;
    if (!list.length) return list;
    const out = [];
    while (out.length < 5) out.push(list[out.length % list.length]);
    return out;
  }

  let images = [];
  let index = 0;
  let track = null;
  let flyEl = null;
  let activeCard = null;
  let activeSceneText = null;

  const galleryCache = new Map(); // type -> [urls]

  function buildCarousel(imgs){
    carousel.innerHTML = "";
    track = document.createElement("div");
    track.className = "modal__track";
    carousel.appendChild(track);

    imgs.forEach(src => {
      const slide = document.createElement("div");
      slide.className = "modal__slide";
      gsap.set(slide, { xPercent: -50, yPercent: -50 });
      const img = document.createElement("img");
      img.src = src;
      slide.appendChild(img);
      track.appendChild(slide);
    });
  }

  async function waitImages(){
    const imgs = [...track.querySelectorAll("img")];
    // ✅ чтобы не было "пусто при первом открытии"
    await Promise.all(imgs.map(img => (img.decode ? img.decode().catch(()=>{}) : new Promise(res => { img.onload=res; img.onerror=res; }))));
  }

  function applyState(animate = true){
  const slides = [...track.children];
  const total = slides.length;
  if (!total) return;

  const duration = animate ? 0.55 : 0;
  const step = 240; // расстояние между центрами

  slides.forEach((slide, i) => {

    let dist = i - index;

    // циклическая коррекция
    if (dist > total / 2) dist -= total;
    if (dist < -total / 2) dist += total;

    const abs = Math.abs(dist);

    const x = dist * step;

    const scale =
      abs === 0 ? 1.3 :
      abs === 1 ? 1 :
      abs === 2 ? 0.7 :
      0.5;

    const alpha =
      abs === 0 ? 1 :
      abs === 1 ? 0.65 :
      abs === 2 ? 0.35 :
      0;

    const blur =
      abs === 0 ? 0 :
      abs === 1 ? 1 :
      abs === 2 ? 2.5 :
      5;

     const z =
      abs === 0 ? 5 :
      abs === 1 ? 4 :
      abs === 2 ? 3 :
      1;

    gsap.to(slide, {
      x,
      scale,
      autoAlpha: alpha,
      zIndex: z,
      filter: `blur(${blur}px)`,
      duration,
      ease: "power3.out"
    });
  });
  }

  function createFlyFromCard(card){
    const img = card.querySelector(".cloth-card__img");
    if (!img) return null;

    const r = img.getBoundingClientRect();
    const clone = img.cloneNode(true);

    Object.assign(clone.style, {
      position: "fixed",
      left: r.left + "px",
      top: r.top + "px",
      width: r.width + "px",
      height: r.height + "px",
      margin: "0",
      zIndex: "290",           // ✅ под модалкой (modal 300, inner выше)
      pointerEvents: "none",
      transformOrigin: "50% 50%",
      filter: "none"           // ✅ чтобы не висел blur/фильтры
    });

    document.body.appendChild(clone);
    return clone;
  }

  function openModal(card, imgs){
    const root = document.documentElement;
    const cs = getComputedStyle(root);

    const ink = cs.getPropertyValue("--brand-ink").trim() || "#3D2B14";
    const bgStart = cs.getPropertyValue("--bg-start").trim() || "#F4ECE2";
    
    const scrollY = window.scrollY;

    document.body.dataset.scrollY = scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    // мягкий “стеклянный” цвет из сцены
    gsap.set(root, {
      "--modal-ink": ink,
      "--modal-bg": `color-mix(in srgb, ${bgStart} 22%, rgba(255,255,255,0) 18%)`,
      "--modal-btn-bg": "rgba(255,255,255,.68)",
      "--modal-btn-border": "rgba(0,0,0,.10)"
    });
    window.__modalOpen = true;

    activeCard = card;
    activeSceneText = card.closest(".scene")?.querySelector(".scene__text") || null;
    if (activeSceneText) gsap.to(activeSceneText, { autoAlpha: 0, duration: 0.25, ease: "power2.out" });

    // клон одежды
    flyEl = createFlyFromCard(card);
    gsap.set(card, { autoAlpha: 0 });

    // модалка
    modal.classList.add("is-open");
    gsap.to(modal, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(".modal__inner", { y: 40, scale: 0.94 }, { y: 0, scale: 1, duration: 0.55, ease: "power3.out" });

    // карусель
    images = makeAtLeastFive(imgs);
    index = 0;

    if (images.length) {
      buildCarousel(images);
      waitImages().then(() => {
        gsap.set(track.children, { autoAlpha: 1, scale: 1, filter: "blur(0px)" });
        applyState(false);
      });
    } else {
      carousel.innerHTML = ""; // пусто, пока грузим
    }

    // “одежда в центр над модалкой” (но не поверх)
    if (flyEl){
      const inner = document.querySelector(".modal__inner").getBoundingClientRect();
      const targetLeft = (window.innerWidth / 2) - (flyEl.getBoundingClientRect().width / 2);
      const targetTop  = Math.max(10, inner.top - flyEl.getBoundingClientRect().height * 0.62);

      gsap.to(flyEl, {
        left: targetLeft,
        top: targetTop,
        scale: 2.0,
        duration: 0.65,
        ease: "power3.out"
      });
    }
  }

  function closeModal(){

    const scrollY = document.body.dataset.scrollY || 0;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      window.scrollTo(0, parseInt(scrollY));
      
    // вернуть текст
    if (activeSceneText) gsap.to(activeSceneText, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });

    // вернуть карточку
    if (activeCard) gsap.to(activeCard, { autoAlpha: 1, duration: 0.2, ease: "power2.out", delay: 0.15 });

    // убрать клон
    if (flyEl) {
      gsap.to(flyEl, { autoAlpha: 0, duration: 0.2, ease: "power2.out", onComplete: () => flyEl.remove() });
      flyEl = null;
    }

    gsap.to(".modal__inner", { y: 40, scale: 0.94, duration: 0.35, ease: "power2.inOut" });
    gsap.to(modal, { opacity: 0, duration: 0.35, ease: "power2.inOut", delay: 0.05, onComplete: () => {
      modal.classList.remove("is-open");
      //modal.style.pointerEvents = "none";
      carousel.innerHTML = "";
      track = null;
    }});

    activeCard = null;
    activeSceneText = null;

    window.__modalOpen = false;
  }

  function next(){ if (!images.length) return; index = (index + 1) % images.length; applyState(true); }
  function prev(){ if (!images.length) return; index = (index - 1 + images.length) % images.length; applyState(true); }

  // ✅ закрытие: крестик / оверлей / esc
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && window.__modalOpen) closeModal(); });

  //  стрелки
  nextBtn?.addEventListener("click", next);
  prevBtn?.addEventListener("click", prev);

  //  открытие по клику
  /*cards.forEach(card => {
  card.addEventListener("click", async () => {
    const type = card.dataset.cloth; // tshirt / dress / suit / dog-suit

    const imgsRaw = await loadGallery(type, 12);

    if (!imgsRaw.length){
      console.warn("[modal] no images in", `gallery/${type}/`);
      return;
    }

    const imgs = makeAtLeastFive(imgsRaw);
    openModal(card, imgs);
  });
  });*/
    cards.forEach(card => {
    card.addEventListener("click", async () => {
      const type = card.dataset.cloth;

      // 1) мгновенно показываем модалку (без карусели пока)
      openModal(card, []); // откроется, а карусель догрузим ниже

      // 2) берем из кэша или грузим
      let imgsRaw = galleryCache.get(type);
      if (!imgsRaw) {
        imgsRaw = await loadGallery(type, 12);
        galleryCache.set(type, imgsRaw);
      }

      if (!imgsRaw.length){
        console.warn("[modal] no images in", `gallery/${type}/`);
        closeModal();
        return;
      }

      // 3) перестраиваем карусель уже с картинками
      images = makeAtLeastFive(imgsRaw);
      index = 0;
      buildCarousel(images);

      await waitImages();
      gsap.set(track.children, { autoAlpha: 1, scale: 1, filter: "blur(0px)" });
      applyState(false);
    });
  });
}

function initMenu(){
  const burger = document.getElementById("burgerHit");
  const menu = document.getElementById("menu");
  if (!burger || !menu) return;
  const pop = document.getElementById("contactPop");
  const popBody = document.getElementById("contactPopBody");
  const popClose = pop?.querySelector(".contact-pop__close");
  const burgerIcon = document.getElementById("burger");
  const row1 = burgerIcon?.querySelector(".needle-row--1");
  const row2 = burgerIcon?.querySelector(".needle-row--2");
  const row3 = burgerIcon?.querySelector(".needle-row--3");

  if (!burger || !menu) return;

  let burgerXTL;

  function buildBurgerXTL() {
    if (!row1 || !row2 || !row3) return null;

    // сброс на всякий
    gsap.set([row1, row2, row3], { transformOrigin: "50% 50%" });

    const tl = gsap.timeline({ paused: true, defaults: { overwrite: "auto" } });

    // 1) короткий "сбор" к центру (дорого выглядит)
    tl.to([row1, row3], {
      scaleX: 1.10,
      scaleY: 1.06,
      duration: 0.12,
      ease: "power2.out"
    }, 0);

    // 2) средняя игла — исчезает с лёгким сжатием
    tl.to(row2, {
      autoAlpha: 0,
      scaleX: 0.15,
      duration: 0.16,
      ease: "power2.inOut"
    }, 0.02);

    // 3) верх/низ сходятся и поворачиваются в X с overshoot
    tl.to(row1, {
      y: 15,
      rotation: 48,      // чуть больше 45 для overshoot
      duration: 0.24,
      ease: "back.out(2.2)"
    }, 0.06);

    tl.to(row3, {
      y: -15,
      rotation: -48,
      duration: 0.24,
      ease: "back.out(2.2)"
    }, 0.06);

    // 4) микрокоррекция обратно в идеальные 45°
    tl.to([row1, row3], {
      rotation: (i) => (i === 0 ? 45 : -45),
      duration: 0.10,
      ease: "power2.out"
    }, 0.28);

    // 5) лёгкое "дораскрытие" (чтобы X не был сплюснут)
    tl.to([row1, row3], {
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 0.12,
      ease: "sine.out"
    }, 0.30);

    return tl;
  }

  burgerXTL = buildBurgerXTL();

  const openMenu = () => {
    menu.classList.add("is-open");
    gsap.fromTo(menu, { y: 10, scale: 0.98 }, { y: 0, scale: 1, duration: 0.35, ease: "power3.out" });

    // --- burger -> X ---
    window.__needlesBreathTween?.pause();
    burgerXTL?.play(0);
  };

  const closeMenu = () => {
    menu.classList.remove("is-open");

    burgerXTL?.reverse();

      gsap.delayedCall(0.34, () => {
        // вернём среднюю иглу наверняка (на случай быстрого клика туда-сюда)
        if (row2) gsap.set(row2, { autoAlpha: 1, scaleX: 1 });

        // возвращаем дыхание чуть позже, чтобы не дёрнуло обратно посреди анимации
        gsap.delayedCall(0.26, () => window.__needlesBreathTween?.resume());
      });
  };

  const toggleMenu = () => {
    menu.classList.contains("is-open") ? closeMenu() : openMenu();
  };

  // бургер кликабельный только когда видим (после трансформации)
  burger.style.pointerEvents = "auto";
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // закрывать кликом вне
  window.addEventListener("click", (e) => {
    if (menu.classList.contains("is-open") && !menu.contains(e.target) && e.target !== burger) closeMenu();
    if (pop?.classList.contains("is-open") && !pop.contains(e.target)) pop.classList.remove("is-open");
  });

  // закрывать по ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape"){
      closeMenu();
      pop?.classList.remove("is-open");
    }
  });

  // плавные якоря + учитываем высоту headerMin
  menu.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;

      closeMenu();

      const y = target.getBoundingClientRect().top + window.pageYOffset - 140; // ~ header min + воздух
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // === контакты (замени на свои) ===
  const CONTACTS = {
    phone: {
      title: "Телефон",
      html: `<h4>Телефон</h4><a href="tel:+380000000000">+38 (068) 460-59-67</a>`
    },
    tg: {
      title: "Telegram",
      html: `<h4>Telegram</h4><a href="https://t.me/username" target="_blank" rel="noopener">t.me/username</a>`
    },
    viber: {
      title: "Viber",
      html: `<h4>Viber</h4><a href="viber://chat?number=%2B380684605967">Написати у Viber</a>`
    }
  };

  menu.querySelectorAll(".contact-circle").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const key = btn.dataset.contact;
      const data = CONTACTS[key];
      if (!data || !pop || !popBody) return;

      popBody.innerHTML = data.html;

      pop.classList.add("is-open");
      gsap.fromTo(pop, { y: 10, scale: 0.98 }, { y: 0, scale: 1, duration: 0.35, ease: "power3.out" });
    });
  });

  popClose?.addEventListener("click", () => pop.classList.remove("is-open"));
}

// 3) Сразу спрячем reveal-текст (на всякий)
gsap.set(revealText, { autoAlpha: 0, y: -140 });
gsap.set(loaderText, { autoAlpha: 1, y: 0 });

//инициализация машинки
gsap.set(machine, { x: 300, autoAlpha: 0 });

//инициализация бургера
gsap.set(burger, { autoAlpha: 0, scale: 0.9 });

// 4) При клике запускаем главный таймлайн
startBtn.addEventListener("click", () => {
  startBtn.disabled = true; // защита от двойного клика

  // 4.1) Создаем "летящую копию" логотипа (клон)
  const fly = logoBig.cloneNode(true);
  fly.id = "logoFly"; // просто чтобы было понятно в DevTools
  document.body.appendChild(fly);

  // 4.2) Берем стартовую позицию лого в лоадере
  const from = logoBig.getBoundingClientRect();

  // 4.3) Ставим клон поверх всех и ровно в стартовую позицию
  gsap.set(fly, {
    position: "fixed",
    left: from.left,
    top: from.top,
    width: from.width,
    height: from.height,
    margin: 0,
    zIndex: 9999,
    transformOrigin: "center center",
  });

  // 4.4) Прячем оригинальный логотип в лоадере (чтобы был только клон)
  gsap.set(logoBig, { autoAlpha: 0 });

  // 4.5) На всякий: скрываем логотип в хедере (его там пока нет)
  // (мы вставим его туда в конце)

  // 4.6) Создаем таймлайн всей интро-анимации
  const tl = gsap.timeline();

  // A) первый переход (Smart animate 800ms, bezier 0.9,0,0.25,1)
  tl.to(loader, { backgroundColor: "#756248", duration: 0.8, ease: easeIntro }, 0);

  tl.to(startBtn, { autoAlpha: 0, duration: 0.25, ease: easeIntro }, 0);

  tl.to(fly, {
    scale: 1.5,
    color: "#ffffff",     // <-- это поменяет цвет SVG (через currentColor)
    duration: 0.8,
    ease: easeIntro
  }, 0);

  tl.to(loaderText, {
  autoAlpha: 0,
  y: 8,
  duration: 0.8,
  ease: easeIntro
  }, 0);
  
  // B) появляется верхний текст под логотипом (выскакивает сверху)
 tl.fromTo(
  revealText,
  { autoAlpha: 0, y: -logoHeight * 0.6 },
  { autoAlpha: 1, y: 0, duration: 0.8, ease: easeIntro },
  0
  );


  // C) пауза (delay 2500ms как в макете)
 // tl.to({}, { duration: 2 });

  tl.to({}, { duration: 2.5 });

// D) перелёт в хедер
// Перед перелётом создаем статичный логотип в хедере (но пока прячем)
let headerLogo;
tl.add(() => {
  if (!headerLogo) {
    headerLogo = logoBig.querySelector("svg").cloneNode(true); // клонируем ТОЛЬКО svg
    headerLogo.classList.add("header-logo");                   // дадим класс для стилей
    gsap.set(headerLogo, { autoAlpha: 0 });                    // спрятали
    logoSlot.appendChild(headerLogo);                          // вставили в хедер
  }
});

// ВАЖНО: перелёт делаем как шаг TIMELINE, тогда мы можем синхронизировать текст
tl.to(fly, {
  left: () => logoSlot.getBoundingClientRect().left,
  top: () => logoSlot.getBoundingClientRect().top,
  width: () => logoSlot.getBoundingClientRect().width,
  height: () => logoSlot.getBoundingClientRect().height,
  scale: 1,
  duration: 0.95,
  ease: easeToPage,
  onComplete: () => {
    const headerLogo = logoSlot.firstElementChild;
    if (headerLogo) headerLogo.style.opacity = "1";
    fly.remove();
    gsap.to(loader, { autoAlpha: 0, duration: 0.25 });
  }
}, ">");

// И ВОТ ТУТ — твоя цель:
// текст начинает пропадать В ТОТ ЖЕ МОМЕНТ, когда логотип начал улетать
tl.to(revealText, {
  autoAlpha: 0,
  y: -80,
  duration: 0.45,
  ease: "power2.out"
}, "<");

tl.add(() => {
  if (headerLogo) gsap.set(headerLogo, { autoAlpha: 1 });
  fly.remove();
}, ">+0.35");

  tl.add(() => {
    // берём позицию точки назначения (logoSlot)
    const to = logoSlot.getBoundingClientRect();

    // анимируем "клон" в нужную позицию и размер
    gsap.to(fly, {
      left: to.left,
      top: to.top,
      width: to.width,
      height: to.height,
      scale: 1,           // scale сбросим, т.к. теперь управляем width/height
      duration: 0.95,
      ease: easeToPage,
      onComplete: () => {
        // показать статичный логотип в хедере
       // if (headerLogo) gsap.set(headerLogo, { autoAlpha: 1 });

        // удалить летящую копию
        fly.remove();

        // спрятать лоадер
        //gsap.to(loader, { autoAlpha: 0, duration: 0.05 });
      }
    });
  });

  // E) выезд машинки (после прилёта, можно чуть с задержкой)
  tl.to(machine, {
  x: () => getMachineLeftX(100), // 80px ДОПОЛНИТЕЛЬНО ВЛЕВО
  autoAlpha: 0.15,
  duration: 0.95,
  ease: easeToPage
}, ">-0.25");

  tl.to(loader, {
  autoAlpha: 0,
  duration: 0.5,
  ease: "power2.out",
  onComplete: () => {
    document.body.classList.remove("is-locked");
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }
}, "<"); // "<" = старт одновременно с машинкой

tl.add(() => {
  initScrollHeader();
  initSceneSystem();
  initThreadsScrollSpin();
  initMouseParallax();
  initNeedlesBreath();
  initClothesReveal();
  initTitleAnimations();
  initClothesParallax();
  initTextRevealAndBreath();
  initModal();
  initMenu();
});
  //анимация кнопок модалки
  document.querySelectorAll('.modal__nav button').forEach(btn => {
  btn.addEventListener('pointerdown', () => {
    btn.classList.add('is-pressed');
  });

  btn.addEventListener('pointerup', () => {
    btn.classList.remove('is-pressed');
  });

  btn.addEventListener('pointerleave', () => {
    btn.classList.remove('is-pressed');
  });
});

});
//при скролле уменьшаем хєдєр и перемещаем машинку в бургер
function initScrollHeader(){
  const header = document.getElementById("header");
  const inner = header.querySelector(".header-inner");
  const logoSlot = document.getElementById("logoSlot");
  const machine = document.getElementById("machine");
  const burger  = document.getElementById("burger");

  const headerTriggerScene = document.querySelector(".scene--header-trigger");

  gsap.killTweensOf(machine);

  // чтобы у бургера был реальный размер для замеров
  gsap.set(burger, { autoAlpha: 0, scale: 1 });
  gsap.set(machine, { transformOrigin: "center" });

  // ⚠️ замеряем ОДИН РАЗ
  const mRect0 = machine.getBoundingClientRect();
  const bRect0 = burger.getBoundingClientRect();

  const mCenter0 = mRect0.left + mRect0.width / 2;
  const bCenter0 = bRect0.left + bRect0.width / 2;

  const deltaX = bCenter0 - mCenter0;

  const startX = gsap.getProperty(machine, "x") || 0;
  const startScale = gsap.getProperty(machine, "scale") || 1;

  const endX = startX + deltaX;
  const endScale = startScale * (bRect0.width / mRect0.width);

  ScrollTrigger.refresh();

  const tlScroll = gsap.timeline({
  scrollTrigger: {
    trigger: headerTriggerScene,
    start: "top top",
    end: "+=650",
    toggleActions: "play none none none"
  }
});

  // header shrink / logo move 
  tlScroll.to(header, { height: "120px", ease: "none" }, 0);

  tlScroll.to(logoSlot, {
    xPercent: 0,
    yPercent: -50,
    x: () => {
      const innerRect = inner.getBoundingClientRect();
      const slotRect  = logoSlot.getBoundingClientRect();
      const desiredLeft = innerRect.left - 140; // твой -140
      return desiredLeft - slotRect.left;
    },
    scale: 0.55,
    ease: "none"
  }, 0);

  //  машинка ТОЧНО в бургер
  tlScroll.to(machine, {
    x: endX,
    scale: endScale,
    ease: "none"
  }, 0);

  // перетекание
  tlScroll.to(burger, { autoAlpha: 1, ease: "none" }, 0.80);
  tlScroll.to(machine, { autoAlpha: 0, ease: "none" }, 0.85);
}

