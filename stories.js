const page = document.getElementById("page");
const htmlForStory = `
      <div class="status-bar">
        <div class="status-bar-element active"></div>
        <div class="status-bar-element"></div>
        <div class="status-bar-element"></div>
        <div class="status-bar-element"></div>
      </div>
      <div class="main-content">
        <div class="text-content">
          <div class="text-header" id="text-header"></div>
          <div class="text-bottom" id="text-bottom">
            
          </div>
        </div>
        <div class="gif-buttons-content">
          <img id="story-gif" style="width: 120px; height: 120px;" src="" />
          <div class="buttons">
            <div class="button skip" id="button-skip">Пропустить</div>
            <div class="button next" id="button-next">Далее</div>
          </div>
        </div>
      </div>
    `;
page.innerHTML = htmlForStory;

const textHeader = document.getElementById("text-header");
const textBottom = document.getElementById("text-bottom");
const storyGif = document.getElementById("story-gif");

const skipButton = document.getElementById("button-skip");
const nextButton = document.getElementById("button-next");

const statusBarElements = document.querySelectorAll(".status-bar-element");

const stories = {
  first: {
    pageColor: "linear-gradient(90deg, #09518b 0%, #002f52 100%)",
    header: "Добро пожаловать в CunaEdu!",
    description:
      "В этом приложении ты сможешь получить новые знания, а также заработать на этом!",
    gifURL: "gif/octopus(miidle)_compressed.gif",
  },
  second: {
    pageColor: "linear-gradient(90deg, #002F52 0%, #075FA0 100%)",
    header: "Мы задаем новые тренды!",
    description:
      "Проходя курсы в приложении ты получаешь Cuna-токены. Тем самым участвуешь в “Гонке знатоков”, реальном соревновании с другими пользователями за денежные призы!",
    gifURL: "gif/test/loch.gif",
  },
  third: {
    pageColor: "linear-gradient(90deg, #075FA0 0%, #004375 100%)",
    header: "Брось вызов другим!",
    description:
      "Также в приложении ты можешь состязаться с пользователями, приглашая своих друзей в приложение! Чьи друзья заработают больше Cuna-токенов, те и выиграют денежные призы в “Гонке рефералов”!",
    gifURL: "gif/test/gold.gif",
  },
  fourth: {
    pageColor: "linear-gradient(90deg, #004475 0%, #00182A 100%)",
    header: "Открываем горизонты!",
    description:
      "Наша задача научить людей чему-то новому, а чтобы это было еще и весело, мы запустили крутые соревнования.<br><br> Чего же ты ждешь, беги проходить курсы!",
    gifURL: "gif/test/star.gif",
  },
};

const storyKeys = Object.keys(stories);
let currentIndex = 0;
let currentLoadingIndex = null;

function updateStatusBar(activeIndex) {
  statusBarElements.forEach((el, i) => {
    if (i === activeIndex) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

function displayStory(index) {
  const story = stories[storyKeys[index]];
  page.style.background = story.pageColor;
  textHeader.innerText = story.header;
  textBottom.innerHTML = story.description;
  // storyGif.src = story.gifURL;

  currentLoadingIndex = index;

  // 1. Сначала показываем плейсхолдер или скрываем GIF
  storyGif.style.visibility = "hidden";

  // 2. Создаем новое изображение для предзагрузки
  const img = new Image();
  img.src = story.gifURL;

  img.onload = () => {
    // Проверяем, актуальна ли загрузка для текущего индекса
    if (currentLoadingIndex === index) {
      storyGif.src = story.gifURL;
      storyGif.style.visibility = "visible";
    }
  };

  img.onerror = () => {
    if (currentLoadingIndex === index) {
      // Обработка ошибок (можно показать заглушку)
      storyGif.style.visibility = "visible";
    }
  };

  updateStatusBar(index);
}

displayStory(currentIndex);

function goNext() {
  if (currentIndex < storyKeys.length - 1) {
    currentIndex++;
    displayStory(currentIndex);
    nextButton.disabled = false; // если кнопка была заблокирована
  } else {
    // Можно зациклить:
    // currentIndex = 0;
    // displayStory(currentIndex);
    // Или заблокировать кнопку:
    // nextButton.disabled = true;
  }
}

function goPrev() {
  if (currentIndex > 0) {
    currentIndex--;
    displayStory(currentIndex);
    nextButton.disabled = false; // разблокируем кнопку next, если была заблокирована
  }
  // else {
  //   currentIndex = storyKeys.length - 1;
  //   displayStory(currentIndex);
  // }
}

nextButton.addEventListener("click", (event) => {
  event.stopPropagation();
  if (currentIndex === storyKeys.length - 1) {
    page.style.display = "none";
  } else {
    goNext();
  }
});

skipButton.addEventListener("click", (event) => {
  event.stopPropagation();
  page.style.display = "none";
});

document.addEventListener("click", function (event) {
  // event.stopPropagation();
  // if (event.target === skipButton) {
  //   event.stopPropagation();
  //   page.style.display = "none";
  // }

  // if (event.target === nextButton) {
  //   event.stopPropagation();
  //   if (currentIndex === storyKeys.length - 1) {
  //     page.style.display = "none";
  //   } else {
  //     goNext();
  //   }
  // }

  const clickX = event.clientX;
  const screenWidth = window.innerWidth;

  if (
    clickX > screenWidth / 2 &&
    target !== skipButton &&
    target !== nextButton
  ) {
    goNext();
  } else {
    goPrev();
  }
});
