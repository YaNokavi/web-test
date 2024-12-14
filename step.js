import fetchData from "./fetch.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const syllabusId = urlParams.get("syllabusId");
const moduleId = Number(urlParams.get("moduleId"));
const submoduleId = Number(urlParams.get("submoduleId"));
const stepId = Number(urlParams.get("stepId"));

const buttonBack = document.getElementById("button-back");
const buttonForward = document.getElementById("button-forward");
const button = document.getElementById("button-next-step");

const userId = localStorage.getItem("userIdData");

const title = document.getElementById("title");
const steps = document.getElementById("steps-number");
const mediaContent = document.getElementById("content");
let stepProgres

async function getContent() {
  const contentGet = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/course/${syllabusId}/content?userId=${userId}`
  );
  stepProgres = contentGet[submoduleId - 1].stepList[stepId - 1];
  return stepProgres
  // console.log(contentGet[submoduleId - 1].stepList[stepId - 1]);
  // modulesWithSteps(contentGet);
}
getContent();

const modulesData = JSON.parse(
  localStorage.getItem(`courseData`)
).courseModuleList;
const submoduleLength = modulesData[moduleId - 1].submoduleList;
const stepInfo =
  modulesData[moduleId - 1].submoduleList[submoduleId - 1].stepList;
// const stepProgres = stepInfo[stepId - 1];
// console.log(stepProgres)
var urlContent = stepInfo[stepId - 1].textContentUrl;
var testContent = stepInfo[stepId - 1].testUrl;
// console.log(urlContent, testContent)
if (urlContent && !urlContent.includes("http") && !testContent) {
  urlContent =
    "https://raw.githubusercontent.com/AndreyErmol/CunaEduFiles/refs/heads/main/courses/technicalAnalysis/content.txt";
}
// console.log(urlContent)
// let urlContent;

// const testContent = stepInfo[stepId - 1].test;
// let testContent =
//   "https://raw.githubusercontent.com/AndreyErmol/CunaEduFiles/refs/heads/main/test";

urlContent ? addContent() : getTest();
steps.innerHTML = `${stepId} из ${stepInfo.length}`;

let progress = {
  userId: Number(userId),
  completedStepList: [],
};
// var progress = JSON.parse(localStorage.getItem("completedSteps"));
// console.log(progress, JSON.stringify(progress))

async function addStepProgress() {
  const stepProgres = await getContent();
  if (stepProgres.completed === false) {
    // Если массив пустой или шаг еще не добавлен
    if (
      progress.completedStepList.length === 0 ||
      !progress.completedStepList.includes(stepProgres.id)
    ) {
      // Добавляем stepIdProgress
      progress.completedStepList.push(stepProgres.id);
      console.log("Добавляем прогресс: ", progress);
      //localStorage.setItem("completedSteps", JSON.stringify(progress));
      sendProgress();
    } else {
      console.log("Шаг уже завершен");
    }
  } else {
    console.log("Шаг завершен");
  }
}

async function addContent() {
  try {
    const response = await fetch(urlContent);
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    const content = await response.text(); // Сохраняем данные в переменной
    mediaContent.innerHTML = content;
    addStepProgress();
  } catch (error) {
    console.error("Ошибка при получении курсов:", error);
  } finally {
    document.getElementById("preloader").style.display = "none";
  }
}

const testDiv = document.getElementById("test");
const submitButton = document.getElementById("submit-button");
const resultContainer = document.getElementById("result-container");
const retryButton = document.getElementById("retry-button");
const nextButton = document.getElementById("next-button");
let testArray;
async function getTest() {
  try {
    const response = await fetch(testContent);
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const text = await response.text();

    const jsonObject = JSON.parse(text);

    testArray = {
      question: jsonObject.question,
      options: jsonObject.options,
      answer: jsonObject.answer,
    };
    document.getElementById("preloader").style.display = "none";
    displayTest();
  } catch (error) {
    console.error("Произошла ошибка:", error);
  }
}

function displayTest() {
  testDiv.style.display = "flex";
  submitButton.style.display = "flex";
  resultContainer.style.display = "flex";
  testDiv.innerHTML = `<h2 style="margin-bottom: 10px">${testArray.question}</h2>
  <p style="margin-bottom: 5px">Выберите один вариант ответа</p>`;

  testArray.options.forEach((option) => {
    const label = document.createElement("label");
    label.innerHTML = `
        <input type="radio" name="question" value="${option}">
        ${option}
    `;
    testDiv.append(label);
  });

  resultContainer.innerText = "";
  retryButton.style.display = "none";
  submitButton.classList.add("disabled");

  const inputs = document.querySelectorAll('input[name="question"]');
  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      submitButton.classList.remove("disabled");
      submitButton.disabled = false; // Разблокировать кнопку после выбора ответа
    });
  });

  submitButton.addEventListener("click", () => {
    const selectedOption = document.querySelector(
      `input[name="question"]:checked`
    );
    if (selectedOption) {
      handleAnswer(selectedOption.value);
    } else {
      submitButton.disabled = true;
    }
  });

  retryButton.addEventListener("click", () => {
    displayTest();
    submitButton.style.display = "flex";
    submitButton.disabled = false; // Разблокировать кнопку после повторной

    // if (selectedOption && selectedOption.value === testContent.answer) {
    //   score++;
    // }
    // resultContainer.innerText = `Вы набрали ${score} баллов.`;
  });
}

function handleAnswer(selectedValue) {
  if (selectedValue === testArray.answer) {
    handleCorrectAnswer();
  } else {
    handleIncorrectAnswer();
  }
}

function handleCorrectAnswer() {
  addStepProgress();
  submitButton.style.animation = "fadeOut 0.2s ease";

  setTimeout(() => {
    submitButton.style.display = "none";
    submitButton.style.animation = "none";
    nextButton.style.display = "flex";
    nextButton.style.animation = "fadeIn 0.2s ease";

    resultContainer.innerText = "Правильно!";
    resultContainer.style.animation = "fadeIn 0.2s ease";

    setTimeout(() => {
      nextButton.style.animation = "none";
      resultContainer.style.animation = "none";
    }, 200);
  }, 200);

  updateNextButtonHref();
}

function handleIncorrectAnswer() {
  submitButton.style.animation = "fadeOut 0.2s ease";

  setTimeout(() => {
    submitButton.style.display = "none";
    submitButton.style.animation = "none";

    retryButton.style.display = "flex";
    retryButton.style.animation = "fadeIn 0.2s ease";

    resultContainer.innerText = "Неправильно!";
    resultContainer.style.animation = "fadeIn 0.2s ease";

    setTimeout(() => {
      resultContainer.style.animation = "none";
      retryButton.style.animation = "none";
    }, 200);
  }, 200);
}

const totalSteps = Object.keys(stepInfo).length;
const totalSubmodules = Object.keys(submoduleLength).length;
const totalModules = Object.keys(modulesData).length;

function updateNextButtonHref() {
  if (stepId == totalSteps && submoduleId != totalSubmodules) {
    nextButton.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${
      submoduleId + 1
    }&stepId=1`;
  } else if (submoduleId == totalSubmodules && moduleId != totalModules) {
    nextButton.href = `step.html?syllabusId=${syllabusId}&moduleId=${
      moduleId + 1
    }&submoduleId=1&stepId=1`;
  } else if (
    moduleId == totalModules &&
    submoduleId == totalSubmodules &&
    stepId == totalSteps
  ) {
    nextButton.removeAttribute("href");
    nextButton.addEventListener("click", function () {
      alert("HUY");
    });
  } else {
    nextButton.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
      stepId + 1
    }`;
  }
}

function setButtonHref(button, href) {
  if (href) button.href = href;
  else button.removeAttribute("href");
}
// Обработка кнопки "Назад"
setButtonHref(
  buttonBack,
  stepId == 1
    ? null
    : `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
        stepId - 1
      }`
);
// Обработка кнопки "Вперед"
setButtonHref(
  buttonForward,
  stepId == totalSteps
    ? null
    : `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
        stepId + 1
      }`
);

// Обработка кнопки "Следующий шаг"
if (stepId == totalSteps) {
  if (submoduleId < totalSubmodules) {
    setButtonHref(
      button,
      `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${
        submoduleId + 1
      }&stepId=1`
    );
  } else if (moduleId < totalModules) {
    setButtonHref(
      button,
      `step.html?syllabusId=${syllabusId}&moduleId=${
        moduleId + 1
      }&submoduleId=1&stepId=1`
    );
  } else {
    setButtonHref(button, null);
    button.addEventListener("click", function () {
      alert("HUY");
    });
  }
} else {
  setButtonHref(
    button,
    `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
      stepId + 1
    }`
  );
}

const refer = localStorage.getItem("refer");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");
var link = document.referrer.split("/").pop();
link = link.split("&").pop();
const switc = document.getElementById("switc");

// sessionStorage.setItem("currentTab", refer);
// sessionStorage.setItem("currentLink", window.location.href);

function setupTab(tab) {
  tab.style.animation = "none";
  tab.style.color = "#ffffff";
  // tab.addEventListener("click", function () {
  //   sessionStorage.removeItem("currentTab");
  //   sessionStorage.removeItem("currentLink");
  // });
}

if (refer == "favorite.html") {
  title.innerText = "Мои курсы";
  setupTab(favorTab);
} else if (refer == "catalog.html") {
  title.innerText = "Каталог";
  setupTab(catalogTab);
}

if (stepId != 1 || link == "stepId=2") {
  title.style.animation = "none";
  switc.style.animation = "none";
}

let startX;
const swipeDistance = 100; // Минимальное расстояние для свайпа

document.addEventListener("touchstart", function (e) {
  // Сохраняем начальную позицию касания
  startX = e.touches[0].clientX;
});

document.addEventListener("touchmove", function (e) {
  const moveX = e.touches[0].clientX;

  // Проверяем, что свайп начался с левой части экрана и расстояние превышает заданное
  if (startX <= 15 && moveX - startX > swipeDistance) {
    // sessionStorage.removeItem("currentTab");
    // sessionStorage.removeItem("currentLink");
    window.location.href = `syllabus.html?id=${syllabusId}`; // Переход по ссылке
  }
});

async function sendProgress() {
  const response = await fetchData(
    "https://cryptuna-anderm.amvera.io/v1/submodule-step/user-completed-steps",
    //userId
    "POST",
    progress,
    false
  );

  // console.log(response);
}

// window.onload = function () {

// };

// function getLocalStorageSize() {
//   let total = 0;
//   for (let key in localStorage) {
//     if (localStorage.hasOwnProperty(key)) {
//       total += (localStorage[key].length + key.length) * 2; // Учитываем размер в UTF-16
//     }
//   }
//   return (total / 1024).toFixed(2); // Возвращаем размер в КБ
// }

// console.log(
//   "Используемая память localStorage: " + getLocalStorageSize() + " KB"
// );

// function getItemSize(key) {
//   const value = localStorage.getItem(key);
//   if (value) {
//     // Учитываем размер ключа и значения в байтах (UTF-16)
//     const size = (key.length + value.length) * 2;
//     return (size / 1024).toFixed(2); // Возвращаем размер в КБ
//   }
//   return 0; // Если элемент не найден
// }

// const key = "coursesData"; // Замените на ваш ключ
// console.log(`Размер элемента '${key}': ${getItemSize(key)} KB`);
