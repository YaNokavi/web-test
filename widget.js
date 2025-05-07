const button1 = document.getElementById("widget-button-first");
const button2 = document.getElementById("widget-button-second");
const widgetBlock = document.querySelector(".widget-block");
const buttons = widgetBlock.querySelectorAll(".widget-button");
const contentSlider = document.querySelector(".content-slider");
const modal = document.getElementById("modal");

let activeIndex = 0; // индекс активной кнопки (0 или 1)
let isDragging = false;
let startX = null;
let startPseudoX = 0;

function isModalOpen() {
  return modal.style.display === "block";
}

// Функция для установки позиции псевдоэлемента и переключения классов
function setActivePosition(index) {
  const translatePercent = index * 100; // 0% или 100%
  widgetBlock.style.setProperty("--pseudo-x", `${translatePercent}%`);
  activeIndex = index;

  buttons.forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });

  const translatePercentSlider = -50 * index;
  contentSlider.style.transform = `translateX(${translatePercentSlider}%)`;
}

// Инициализация
setActivePosition(activeIndex);

// Обработчики кликов с вашей изначальной логикой (с задержкой)
button1.addEventListener("click", function () {
  if (button2.classList.contains("active")) {
    button2.classList.remove("active");
    widgetBlock.style.setProperty("--active-pos", "0%");
    widgetBlock.classList.remove("active-second");
    setActivePosition(0); // Обновляем позицию и классы
    setTimeout(() => {
      button1.classList.add("active");
    }, 150);
  }
});

button2.addEventListener("click", function () {
  if (button1.classList.contains("active")) {
    button1.classList.remove("active");
    widgetBlock.style.setProperty("--active-pos", "50%");
    widgetBlock.classList.add("active-second");
    setActivePosition(1); // Обновляем позицию и классы
    setTimeout(() => {
      button2.classList.add("active");
    }, 150);
  }
});

function onStart(x) {
  if (isModalOpen()) return;
  startX = x;
  isDragging = true;
  startPseudoX = parseFloat(
    widgetBlock.style.getPropertyValue("--pseudo-x").replace("%", "")
  );

  widgetBlock.classList.add("dragging");
}

function onMove(x) {
  if (isModalOpen()) return;
  if (!isDragging) return;

  const rect = widgetBlock.getBoundingClientRect();
  const diff = startX - x;
  let newPseudoX = startPseudoX + (diff / rect.width) * 100;
  newPseudoX = Math.max(0, Math.min(100, newPseudoX));

  // Контент двигается в сторону свайпа
  const translatePercent = -0.5 * newPseudoX;

  widgetBlock.style.setProperty("--pseudo-x", `${newPseudoX}%`);
  contentSlider.style.transform = `translateX(${translatePercent}%)`;
  contentSlider.style.transition = "none";
}

function onEnd() {
  if (isModalOpen()) return;
  if (!isDragging) return;

  isDragging = false;
  widgetBlock.classList.remove("dragging");

  const pseudoX = parseFloat(
    widgetBlock.style.getPropertyValue("--pseudo-x").replace("%", "")
  );

  if (pseudoX < 90 && activeIndex === 1) {
    setActivePosition(0);
  } else if (pseudoX > 10 && activeIndex === 0) {
    setActivePosition(1);
  } else {
    setActivePosition(activeIndex);
  }

  contentSlider.style.transition = "";
  widgetBlock.style.transition = "";
}

let startY = 0;

document.addEventListener(
  "touchstart",
  (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    onStart(startX);
  },
  { passive: false }
);

document.addEventListener(
  "touchmove",
  (e) => {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      onMove(e.touches[0].clientX);
    }
  },
  { passive: false }
);

document.addEventListener(
  "touchend",
  (e) => {
    onEnd();
  },
  { passive: false }
);

document.addEventListener("mousedown", (e) => {
  onStart(e.clientX);
});

document.addEventListener("mousemove", (e) => {
  e.preventDefault();
  onMove(e.clientX);
});

document.addEventListener("mouseup", (e) => {
  onEnd();
});
