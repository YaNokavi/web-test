const page = document.getElementById("page");
//генерить хтмл по-другому
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

const storiesNewUser = {
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

const storiesNewUpdate = {
  first: {
    pageColor: "linear-gradient(90deg, #09518b 0%, #002f52 100%)",
    header: "Обновление 1.0.4 уже здесь!",
    description:
      "В приложении появились истории, пользовательские оценки курсов, а также иконки курсов от Cryptuna!",
    gifURL: "gif/octopus(miidle)_compressed.gif",
  },
  second: {
    pageColor: "linear-gradient(90deg, #002F52 0%, #075FA0 100%)",
    header: "Истории",
    description:
      "Теперь в приложении есть истории, в которых мы будем кратко рассказывать о нововведениях!",
    gifURL: "gif/test/loch.gif",
  },
  third: {
    pageColor: "linear-gradient(90deg, #075FA0 0%, #004375 100%)",
    header: "Оценка курсов",
    description:
      "Мы добавили возможность оставлять оценки и комментарии к курсам, чтобы каждый мог оставить свое мнение, а также ознакомиться с мнением других!",
    gifURL: "gif/test/star.gif",
  },
  fourth: {
    pageColor: "linear-gradient(90deg, #004475 0%, #00182A 100%)",
    header: "Новые иконки",
    description:
      "Теперь на наших курсах есть красивые иконки.<br><br> Чего же ты ждешь, беги скорее смотреть обновление!",
    gifURL: "gif/test/gold.gif",
  },
};

let currentIndex = 0;
let currentLoadingIndex = null;
let storyKeys = null;
let storyList = null;

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
  console.log(index);
  const story = storyList[storyKeys[index]];
  page.style.background = story.pageColor;
  textHeader.innerText = story.header;
  textBottom.innerHTML = story.description;
  storyGif.src = story.gifURL;

  currentLoadingIndex = index;

  updateStatusBar(index);
}

window.addEventListener("storiesReady", function () {
  const storiesType = localStorage.getItem("storiesType");

  if (storiesType) {
    if (storiesType === "WELCOME") {
      storyKeys = Object.keys(storiesNewUser);
      storyList = storiesNewUser;
    } else if (storiesType === "UPDATE") {
      storyKeys = Object.keys(storiesNewUpdate);
      storyList = storiesNewUpdate;
    }
  }

  displayStory(currentIndex);
});

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
    nextButton.disabled = false;
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

page.addEventListener("click", function (event) {
  const clickX = event.clientX;
  const screenWidth = window.innerWidth;


  if (
    clickX > screenWidth / 2 &&
    event.target !== skipButton &&
    event.target !== nextButton
  ) {
    goNext();
  } else {
    goPrev();
  }

});
