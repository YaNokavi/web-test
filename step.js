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

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user.id;

const title = document.getElementById("title");
const steps = document.getElementById("steps-number");
const mediaContent = document.getElementById("content");

const courseData = JSON.parse(localStorage.getItem(`courseData`));
const modulesData = courseData.courseModuleList;
const submoduleLength = modulesData[moduleId - 1].submoduleList;
const stepInfo =
  modulesData[moduleId - 1].submoduleList[submoduleId - 1].stepList;
let stepProgres = stepInfo[stepId - 1];

const urlContent = stepInfo[stepId - 1].contentUrl;
const isTest = stepInfo[stepId - 1].test;

steps.innerHTML = `<div class="button-navigation" id="button-navigation">
            <svg
            style="color: var(--theme-button-hint-icon-text-color);"
              width="20"
              height="20"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.875 14H24.875"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3.875 7H24.875"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3.875 21H24.875"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>`;
steps.innerHTML += `${stepId} из ${stepInfo.length}`;

const navigationBlock = document.getElementById("navigation");
const navigationList = document.getElementById("navigation-list");
const navigationButton = document.getElementById("button-navigation");
navigationButton.addEventListener("click", function () {
  navigationBlock.classList.toggle("move-right");
  navigationBlock.classList.toggle("disable");
});

document.addEventListener("click", function (event) {
  if (
    !navigationBlock.contains(event.target) &&
    !navigationBlock.classList.contains("disable") &&
    !navigationButton.contains(event.target)
  ) {
    navigationBlock.classList.add("disable");
  }
});

function createNavigationMenu() {
  const svgNS = "http://www.w3.org/2000/svg";

  const svgActive = document.createElementNS(svgNS, "svg");
  svgActive.setAttribute("class", "active-svg");
  svgActive.setAttribute("width", "9");
  svgActive.setAttribute("height", "19");
  svgActive.setAttribute("viewBox", "0 0 9 19");
  svgActive.setAttribute("fill", "none");

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("fill-rule", "evenodd");
  path.setAttribute("clip-rule", "evenodd");
  path.setAttribute(
    "d",
    "M7.6177 10.063L3.37495 14.5414L2.31445 13.422L6.02695 9.50325L2.31445 5.5845L3.37495 4.46509L7.6177 8.94355C7.75831 9.09201 7.83729 9.29333 7.83729 9.50325C7.83729 9.71318 7.75831 9.9145 7.6177 10.063Z"
  );
  path.setAttribute("fill", "currentColor");

  svgActive.appendChild(path);
  stepInfo.forEach((step) => {
    const listStepItem = document.createElement("li");

    if (step.completed == true) {
      listStepItem.classList.add("complete");
    }
    if (step.test === true) {
      listStepItem.innerText = "?";
    }
    if (step.number == stepId) {
      listStepItem.classList.add("active");
      listStepItem.append(svgActive);
    } else {
      listStepItem.addEventListener("click", function () {
        window.location.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${step.number}`;
      });
    }
    navigationList.append(listStepItem);
  });
  navigationList.style.maxHeight = `${navigationBlock.offsetHeight - 30}px`;

  const activeItem = document.querySelector(".active");
  const itemRect = activeItem.getBoundingClientRect();
  const containerRect = navigationBlock.getBoundingClientRect();
  const offset =
    itemRect.top -
    containerRect.top +
    itemRect.height / 2 -
    containerRect.height / 2;

  navigationBlock.scrollTop += offset;
}

createNavigationMenu();

function addStepProgress() {
  if (stepProgres.completed === false) {
    if (isTest) {
      sendProgressTest();
    } else {
      sendProgress();
    }
    stepProgres.completed = true;
    localStorage.setItem("courseData", JSON.stringify(courseData));
  } else {
    const stepComplete = document.createElement("div");
    stepComplete.classList.add("step-complete");
    stepComplete.innerText = "Шаг пройден!";
    document.getElementById("blockContent").append(stepComplete);
  }
}

function trackImageLoad() {
  const imageLoadPromises = [];

  const imgElements = document.querySelectorAll("img");

  imgElements.forEach((img) => {
    const imgLoadPromise = new Promise((resolve, reject) => {
      if (img.complete) {
        resolve(img.src);
      } else {
        img.onload = () => {
          resolve(img.src);
        };
        img.onerror = () => {
          console.error(`Ошибка загрузки изображения: ${img.src}`);
          reject(img.src);
        };
      }
    });

    imageLoadPromises.push(imgLoadPromise);
  });

  Promise.all(imageLoadPromises)
    .then(() => {
      document.getElementById("preloader").style.display = "none";
    })
    .catch((url) => {
      console.error(
        `Ошибка при загрузке одного или нескольких изображений: ${url}`
      );
    });
}

async function getCourseContent() {
  try {
    const response = await fetch(urlContent);
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    const content = await response.text();
    displayContent(content);
  } catch (error) {
    console.error("Ошибка при получении контента:", error);
  }
}
getCourseContent();

let testArray;
let optionsAnswers;
function displayContent(content) {
  if (isTest === false) {
    mediaContent.innerHTML = content;

    trackImageLoad();
    addStepProgress();
  } else {
    const jsonObject = JSON.parse(content);

    testArray = {
      question: jsonObject.question,
      image: jsonObject.image,
      options: jsonObject.options,
      answer: jsonObject.answer,
    };
    optionsAnswers = jsonObject.options.length;
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
    input.disabled = true;
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

function displayTest() {
  retryButton.style.display = "none";
  testDiv.style.display = "flex";
  submitButton.style.display = "flex";
  submitButton.disabled = "true";
  resultContainer.style.display = "flex";

  const isMultipleChoice = testArray.answer.length > 1;

  testDiv.innerHTML = `<h2 style="margin-bottom: 10px; line-height: 15px;">${testArray.question}</h2>`;

  if (testArray.image && testArray.image.url) {
    testDiv.innerHTML += `
      <img src="${testArray.image.url}" height="${testArray.image.height}" width="${testArray.image.width}" style="align-self: center">
    `;
  }

  testDiv.innerHTML += `
    <p style="margin-bottom: 5px">Выберите ${
      isMultipleChoice ? "один или несколько" : "один"
    } вариант${isMultipleChoice ? "ов" : ""} ответа</p>
  `;

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

  submitButton.classList.add("disabled");

  const inputs = document.querySelectorAll('input[name="question"]');

  if (stepProgres.completed === true) {
    const stepComplete = document.createElement("div");
    stepComplete.classList.add("step-complete");
    stepComplete.innerText = "Шаг пройден!";
    document.getElementById("blockContent").append(stepComplete);
    submitButton.style.display = "none";

    nextButton.style.display = "flex";

    updateNextButtonHref();
    resultContainer.innerText = "Правильно!";
    resultSvgCorrect.style.display = "flex";

    inputs.forEach((input) => {
      input.disabled = true;
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
    const selectedValueAsString = JSON.stringify(selectedValue);
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

let incorrectAnswers = 0;
function handleIncorrectAnswer() {
  incorrectAnswers++;
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
  if (stepId == totalSteps) {
    if (submoduleId < totalSubmodules) {
      setButtonHref(
        nextButton,
        `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${
          submoduleId + 1
        }&stepId=1`
      );
    } else if (moduleId < totalModules) {
      setButtonHref(
        nextButton,
        `step.html?syllabusId=${syllabusId}&moduleId=${
          moduleId + 1
        }&submoduleId=1&stepId=1`
      );
    } else {
      setButtonHref(nextButton, null);
      nextButton.addEventListener("click", function () {
        window.location.href = `syllabus.html?id=${syllabusId}`;
      });
    }
  } else {
    setButtonHref(
      nextButton,
      `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
        stepId + 1
      }`
    );
  }
}

function setButtonHref(button, href) {
  if (href) button.href = href;
  else button.removeAttribute("href");
}

setButtonHref(
  buttonBack,
  stepId == 1
    ? null
    : `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
        stepId - 1
      }`
);

setButtonHref(
  buttonForward,
  stepId == totalSteps
    ? null
    : `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
        stepId + 1
      }`
);

if (stepId == totalSteps) {
  if (submoduleId < totalSubmodules) {
    setButtonHref(
      button,
      `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${
        submoduleId + 1
      }&stepId=1`
    );
  } else if (moduleId < totalModules) {
    console.log("123");
    setButtonHref(
      button,
      `step.html?syllabusId=${syllabusId}&moduleId=${
        moduleId + 1
      }&submoduleId=1&stepId=1`
    );
  } else {
    setButtonHref(button, null);
    button.addEventListener("click", function () {
      window.location.href = `syllabus.html?id=${syllabusId}`;
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

function setupTab(tab) {
  tab.style.animation = "none";
  tab.style.color = "#ffffff";
}

if (refer == "favorite.html") {
  setupTab(favorTab);
} else if (refer == "catalog.html") {
  setupTab(catalogTab);
}

if (stepId != 1 || link == "stepId=2") {
  title.style.animation = "none";
  switc.style.animation = "none";
}

function displayNotification(numberBalance) {
  const notification = document.getElementById("notification");
  const notificationBalance = document.getElementById("notification-balance");
  notificationBalance.innerText = `+${numberBalance}`;
  notification.classList.add("show");
  setTimeout(() => {
    tg.HapticFeedback.notificationOccurred("success");
  }, 350);

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

async function sendProgress() {
  await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/submodule-step/${stepProgres.id}/user-completed-step?userId=${userId}`,
    "POST",
    false
  );
}

async function sendProgressTest() {
  const sendTest = {
    userId: userId,
    incorrectAnswersNumber: incorrectAnswers,
    answersNumber: optionsAnswers,
  };
  const response = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/submodule-step/${stepProgres.id}/user-completed-test`,
    "POST",
    sendTest
  );
  if (response) {
    displayNotification(response);
  }
}
