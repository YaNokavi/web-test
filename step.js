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

const courseData = JSON.parse(localStorage.getItem(`courseData`));
const modulesData = courseData.courseModuleList;
const submoduleLength = modulesData[moduleId - 1].submoduleList;
const stepInfo =
  modulesData[moduleId - 1].submoduleList[submoduleId - 1].stepList;
let stepProgres = stepInfo[stepId - 1];

var urlContent = stepInfo[stepId - 1].contentUrl;
var isTest = stepInfo[stepId - 1].test;

steps.innerHTML = `${stepId} из ${stepInfo.length}`;

let progress = {
  userId: Number(userId),
  completedStepId: 0,
};

function addStepProgress() {
  document.getElementById("preloader").style.display = "none";
  if (stepProgres.completed === false) {
    progress.completedStepId = stepProgres.id;
    console.log("Добавляем прогресс: ", progress);
    sendProgress();
    stepProgres.completed = true;
    localStorage.setItem("courseData", JSON.stringify(courseData));
  } else {
    const stepComplete = document.createElement("div");
    stepComplete.classList.add("step-complete");
    stepComplete.innerText = "Шаг пройден!";
    document.getElementById("blockContent").append(stepComplete);
    console.log("Шаг завершен");
  }
}

async function getCourseContent() {
  try {
    const response = await fetch(urlContent);
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    const content = await response.text(); // Сохраняем данные в переменной
    displayContent(content);
  } catch (error) {
    console.error("Ошибка при получении контента:", error);
  }
}
getCourseContent();

let testArray;

function displayContent(content) {
  if (isTest === false) {
    mediaContent.innerHTML = content;
    addStepProgress();
  } else {
    const jsonObject = JSON.parse(content);

    testArray = {
      question: jsonObject.question,
      options: jsonObject.options,
      answer: jsonObject.answer,
    };
    displayTest();
  }
}

const testDiv = document.getElementById("test");
const submitButton = document.getElementById("submit-button");
const resultContainer = document.getElementById("result-container");
const resultSvgCorrect = document.getElementById("result-svg-correct");
const resultSvgIncorrect = document.getElementById("result-svg-incorrect");
const retryButton = document.getElementById("retry-button");
const nextButton = document.getElementById("next-button");

const handleSubmit = () => {
  const inputs = document.querySelectorAll('input[name="question"]');
  inputs.forEach((input) => {
    input.disabled = true; // Отключаем каждый элемент ввода
  });
  let selectedOptions;
  const isMultipleChoice = testArray.answer.length > 1;
  if (isMultipleChoice) {
    selectedOptions = Array.from(inputs)
      .filter((input) => input.checked)
      .map((input) => input.value);
  } else {
    const selectedOption = document.querySelector(
      `input[name="question"]:checked`
    );
    selectedOptions = selectedOption ? [selectedOption.value] : [];
  }

  handleAnswer(selectedOptions, isMultipleChoice);
};

const handleRetry = () => {
  displayTest();
};

submitButton.addEventListener("click", handleSubmit);
retryButton.addEventListener("click", handleRetry);

// if (selectedOption && selectedOption.value === testContent.answer) {
//   score++;
// }
// resultContainer.innerText = `Вы набрали ${score} баллов.`;

function displayTest() {
  retryButton.style.display = "none";
  testDiv.style.display = "flex";
  submitButton.style.display = "flex";
  submitButton.disabled = "true";
  resultContainer.style.display = "flex";

  const isMultipleChoice = testArray.answer.length > 1;

  testDiv.innerHTML = `<h2 style="margin-bottom: 10px">${
    testArray.question
  }</h2>
    <p style="margin-bottom: 5px">Выберите ${
      isMultipleChoice ? "один или несколько" : "один"
    } вариант${isMultipleChoice ? "ов" : ""} ответа</p>`;

  testArray.options.forEach((option, index) => {
    const label = document.createElement("label");
    label.innerHTML = `
          <input type="${
            isMultipleChoice ? "checkbox" : "radio"
          }" name="question" id="optionTest${index + 1}" value="${option}">
          ${option}
      `;
    if (stepProgres.completed === true) {
      if (testArray.answer.includes(option)) {
        label.querySelector("input").checked = true;
      } else {
        label.querySelector("input").disabled = true;
      }
    }

    testDiv.append(label);
  });

  resultContainer.innerText = "";
  resultSvgCorrect.style.display = "none";
  resultSvgIncorrect.style.display = "none";
  retryButton.style.display = "none";

  // Отключите кнопку отправки по умолчанию
  submitButton.classList.add("disabled");

  const inputs = document.querySelectorAll('input[name="question"]');

  // Если тест пройден, отключите радиокнопки
  if (stepProgres.completed === true) {
    const stepComplete = document.createElement("div");
    stepComplete.classList.add("step-complete");
    stepComplete.innerText = "Шаг пройден!";
    document.getElementById("blockContent").append(stepComplete);
    submitButton.style.display = "none";
    // submitButton.style.animation = "none";
    nextButton.style.display = "flex";
    // retryButton.style.display = "flex"
    updateNextButtonHref();
    resultContainer.innerText = "Правильно!";
    resultSvgCorrect.style.display = "flex";
    // nextButton.style.animation = "fadeIn 0.2s ease";
    inputs.forEach((input) => {
      input.disabled = true; // Отключить радиокнопки
    });
  } else {
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        submitButton.classList.remove("disabled");
        submitButton.disabled = false;
      });
    });
  }
  document.getElementById("preloader").style.display = "none";
}

function handleAnswer(selectedValue, isMultipleChoice) {
  if (!isMultipleChoice) {
    if (selectedValue[0] === testArray.answer[0]) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
  } else if (isMultipleChoice) {
    const answersAsString = JSON.stringify(testArray.answer);
    const selectedValueAsString = JSON.stringify(selectedValue); // Оборачиваем в массив для сравнения
    if (answersAsString.includes(selectedValueAsString)) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer();
    }
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
    resultSvgCorrect.style.display = "flex";
    resultContainer.style.animation = "fadeIn 0.2s ease";
    resultSvgCorrect.style.animation = "fadeIn 0.2s ease";

    setTimeout(() => {
      nextButton.style.animation = "none";
      resultContainer.style.animation = "none";
      resultSvgCorrect.style.animation = "none";
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
    resultSvgIncorrect.style.display = "flex";
    resultSvgCorrect.style.animation = "fadeIn 0.2s ease";
    resultSvgIncorrect.style.animation = "fadeIn 0.2s ease";

    setTimeout(() => {
      resultContainer.style.animation = "none";
      retryButton.style.animation = "none";
      resultSvgIncorrect.style.animation = "none";
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
  // title.innerText = "Мои курсы";
  setupTab(favorTab);
} else if (refer == "catalog.html") {
  // title.innerText = "Каталог";
  setupTab(catalogTab);
}

if (stepId != 1 || link == "stepId=2") {
  title.style.animation = "none";
  switc.style.animation = "none";
}

function displayNotification() {
  const notification = document.getElementById("notification");
  setTimeout(() => {
    notification.classList.add("show"); // Добавляем класс для анимации появления
    setTimeout(() => {
      tg.HapticFeedback.notificationOccurred("success");
    }, 350);
    // Убираем уведомление через пару секунд
    setTimeout(() => {
      notification.classList.remove("show"); // Убираем класс для анимации исчезновения
    }, 2000); // Уведомление будет видимо в течение 3 секунд
  }, 1000);
}

async function sendProgress() {
  const response = await fetchData(
    "https://cryptuna-anderm.amvera.io/v1/submodule-step/user-completed-steps",
    "POST",
    progress,
    false
  );

  console.log(response);
  displayNotification();
}

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
