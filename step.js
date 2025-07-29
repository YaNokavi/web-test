import fetchData from "./fetch.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const submoduleId = Number(urlParams.get("submoduleId"));
const stepNumber = Number(urlParams.get("stepNumber"));
const courseId = Number(urlParams.get("courseId"));

const buttonBack = document.getElementById("button-back");
const buttonForward = document.getElementById("button-forward");
const button = document.getElementById("button-next-step");
const nextButton = document.getElementById("next-button");

const buttonsArray = [
  {
    buttonHtml: buttonBack,
    buttonType: "BACK",
  },
  {
    buttonHtml: buttonForward,
    buttonType: "FORWARD",
  },
  {
    buttonHtml: button,
    buttonType: "FORWARD",
  },
  {
    buttonHtml: nextButton,
    buttonType: "FORWARD",
  },
];

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id ?? 1;

const mediaContent = document.getElementById("content");

async function getSteps() {
  let stepsData = null;
  const storedData = JSON.parse(localStorage.getItem("stepsData")) || [];
  if (
    storedData &&
    storedData.currentSubmoduleId === submoduleId &&
    Date.now() - storedData.storedTime < 3_600_000
  ) {
    stepsData = storedData;
  } else {
    stepsData = await fetchData(`submodule/${submoduleId}/steps`, "GET", {
      "X-User-Id": userId,
    });

    stepsData.currentSubmoduleId = submoduleId;
    stepsData.storedTime = Date.now();
    localStorage.setItem("stepsData", JSON.stringify(stepsData));
  }

  displayStepInfo(stepsData.steps.length);
  createNavigationMenu(stepsData.steps);
  getCourseContent(stepsData.steps);
  setButtonHref(buttonsArray, stepsData);
}

getSteps();

function displayStepInfo(stepsDataLength) {
  const stepsCount = document.getElementById("steps-count");
  stepsCount.innerText = `${stepNumber} из ${stepsDataLength}`;
  const navigationBlock = document.getElementById("navigation");
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
}

function createNavigationMenu(stepsData) {
  const navigationList = document.getElementById("navigation-list");
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
  stepsData.forEach((step) => {
    const listStepItem = document.createElement("li");

    if (step.completed == true) {
      listStepItem.classList.add("complete");
    }
    if (step.test === true) {
      listStepItem.innerText = "?";
    }
    if (step.number === stepNumber) {
      listStepItem.classList.add("active");

      listStepItem.append(svgActive);
    } else {
      listStepItem.addEventListener("click", function () {
        window.location.href = `step.html?v=103&courseId=${courseId}&submoduleId=${submoduleId}&stepNumber=${step.number}`;
      });
    }
    navigationList.append(listStepItem);
  });
  const navigationBlock = document.getElementById("navigation");
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

async function fixImages(images) {
  images.forEach((img) => {
    const width = img.width;
    const height = img.height;

    if (height >= 55 || width >= 100) {
      const newImg = document.createElement("img");
      newImg.src = img.src;
      newImg.classList.add("iview-image");
      newImg.dataset.iview = "";
      newImg.style.height = `${img.height}px`;
      newImg.style.width = `${img.width}px`;
      newImg.style.alignSelf = "center";
      newImg.style.marginTop = "1em";

      if (img.parentNode.tagName === "P") {
        img.parentNode.parentNode.replaceChild(newImg, img.parentNode);
      } else {
        img.parentNode.replaceChild(newImg, img);
      }
    } else {
      img.style.verticalAlign = "middle";
      img.style.margin = "0 5px";
    }
  });
}

async function trackImageLoad() {
  const imgElements = document.querySelectorAll("img");
  const promises = Array.from(imgElements).map((img) => {
    return new Promise((resolve) => {
      if (img.complete) resolve(img.src);
      img.onload = () => resolve(img.src);
      img.onerror = () => resolve(null);
    });
  });
  await Promise.all(promises);
  fixImages(imgElements);
  document.getElementById("preloader").style.display = "none";
}

async function getCourseContent(stepsData) {
  const urlContent = stepsData.find(
    (step) => step.number === stepNumber
  ).contentUrl;

  const isTest = stepsData.find((step) => step.number === stepNumber).test;

  const isComplete = stepsData.find(
    (step) => step.number === stepNumber
  ).completed;

  const stepId = stepsData.find((step) => step.number === stepNumber).id;

  try {
    const response = await fetch(urlContent);
    if (!response.ok) {
      throw new Error(
        `Ошибка загрузки контента: ${response.status} - ${response.statusText}`
      );
    }
    const content = await response.text();
    displayContent(content, stepId, isTest, isComplete);
  } catch (error) {
    console.error(`Ошибка в getCourseContent: ${error.message}`);
    alert("Произошла ошибка при загрузке шага. Попробуйте позже.");
  }
}

async function displayComplete() {
  const stepComplete = document.createElement("div");
  stepComplete.classList.add("step-complete");
  stepComplete.innerText = "Шаг пройден!";
  document.getElementById("blockContent").append(stepComplete);
}

function displayContent(content, stepId, isTest, isComplete) {
  if (isTest === false) {
    mediaContent.innerHTML = content;
    trackImageLoad();
    sendProgressText(stepId);

    if (isComplete) {
      displayComplete();
    }
  } else {
    const jsonObject = JSON.parse(content);
    const testData = {
      question: jsonObject.question,
      image: jsonObject.image,
      options: jsonObject.options,
      answer: jsonObject.answer,
    };

    displayTest(stepId, isComplete, testData, jsonObject.options.length);
  }
}

const testDiv = document.getElementById("test");
const submitButton = document.getElementById("submit-button");
const resultContainer = document.getElementById("result-container");
const resultSvgCorrect = document.getElementById("result-svg-correct");
const resultSvgIncorrect = document.getElementById("result-svg-incorrect");
const retryButton = document.getElementById("retry-button");

function handleSubmit(stepId, testData, optionsCount) {
  submitButton.disabled = true;
  const inputs = document.querySelectorAll('input[name="question"]');

  inputs.forEach((input) => {
    input.disabled = true;
  });
  let selectedOptions;
  const isMultipleChoice = testData.answer.length > 1;
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

  handleAnswer(
    selectedOptions,
    isMultipleChoice,
    stepId,
    testData,
    optionsCount
  );
}

function displayTest(stepId, isComplete, testData, optionsCount) {
  trackImageLoad();
  retryButton.style.display = "none";
  testDiv.style.display = "flex";
  submitButton.style.display = "flex";
  submitButton.disabled = "true";
  resultContainer.style.display = "flex";

  const isMultipleChoice = testData.answer.length > 1;

  testDiv.innerHTML = `<h2 style="margin-bottom: 10px; line-height: 32px;">${testData.question}</h2>`;

  if (testData.image && testData.image.url) {
    testDiv.innerHTML += `
      <img src="${testData.image.url}" height="${testData.image.height}" width="${testData.image.width}" style="align-self: center">
    `;
  }

  testDiv.innerHTML += `
    <p style="margin-bottom: 5px">Выберите ${
      isMultipleChoice ? "один или несколько" : "один"
    } вариант${isMultipleChoice ? "ов" : ""} ответа</p>
  `;

  testData.options.forEach((option, index) => {
    const label = document.createElement("label");
    label.innerHTML = `
          <input type="${
            isMultipleChoice ? "checkbox" : "radio"
          }" name="question" id="optionTest${index + 1}" value="${option}">
          ${option}
      `;
    if (isComplete === true) {
      if (testData.answer.includes(option)) {
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

  if (retryButton._handler) {
    retryButton.removeEventListener("click", retryButton._handler);
  }
  if (submitButton._handler) {
    submitButton.removeEventListener("click", submitButton._handler);
  }

  // Создаём новые обработчики с замыканием на локальные переменные
  retryButton._handler = () =>
    displayTest(stepId, isComplete, testData, optionsCount);
  submitButton._handler = () => handleSubmit(stepId, testData, optionsCount);

  // Добавляем обработчики
  retryButton.addEventListener("click", retryButton._handler);
  submitButton.addEventListener("click", submitButton._handler);

  submitButton.classList.add("disabled");

  const inputs = document.querySelectorAll('input[name="question"]');

  if (isComplete === true) {
    displayComplete();
    submitButton.style.display = "none";

    nextButton.style.display = "flex";

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

function handleAnswer(
  selectedValue,
  isMultipleChoice,
  stepId,
  testData,
  optionsCount
) {
  if (!isMultipleChoice) {
    if (selectedValue[0] === testData.answer[0]) {
      handleCorrectAnswer(stepId, optionsCount);
    } else {
      handleIncorrectAnswer();
    }
  } else if (isMultipleChoice) {
    const answersAsString = JSON.stringify(testData.answer);
    const selectedValueAsString = JSON.stringify(selectedValue);
    if (answersAsString.includes(selectedValueAsString)) {
      handleCorrectAnswer(stepId, optionsCount);
    } else {
      handleIncorrectAnswer();
    }
  }
}

async function handleCorrectAnswer(stepId, optionsCount) {
  const sendTest = {
    incorrectAnswersNumber: incorrectAnswers,
    answersNumber: optionsCount,
  };
  const responce = await sendProgressTest(stepId, sendTest);

  if (responce !== 200) {
    alert("Нет соединения с сервером. Повторите попытку позже");
  } else {
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
  }
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

function setButtonHref(buttons, stepsData) {
  let href = null;
  let stepsLength = stepsData.steps.length;
  let nextSubmoduleId = stepsData.nextSubmoduleId;
  let previousSubmoduleId = stepsData.previousSubmoduleId;

  buttons.forEach((button) => {
    if (button.buttonType === "BACK") {
      if (stepNumber !== 1) {
        href = `step.html?v=103&courseId=${courseId}&submoduleId=${submoduleId}&stepNumber=${
          stepNumber - 1
        }`;
      } else if (previousSubmoduleId !== null) {
        href = `step.html?v=103&courseId=${courseId}&submoduleId=${previousSubmoduleId}&stepNumber=1`;
      }
    } else if (button.buttonType === "FORWARD") {
      if (stepNumber !== stepsLength) {
        href = `step.html?v=103&courseId=${courseId}&submoduleId=${submoduleId}&stepNumber=${
          stepNumber + 1
        }`;
      } else if (nextSubmoduleId !== null) {
        href = `step.html?v=103&courseId=${courseId}&submoduleId=${nextSubmoduleId}&stepNumber=1`;
      } else if (nextSubmoduleId === null) {
        href = `syllabus.html?v=103&id=${courseId}`;
      }
    }

    if (href) {
      button.buttonHtml.href = href;
    } else {
      button.buttonHtml.removeAttribute("href");
    }
  });
}

const refer = localStorage.getItem("refer");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");
let link = document.referrer.split("/").pop();
link = link.split("&").pop();

const switc = document.getElementById("switc");

favorTab.style.animation = "none";
catalogTab.style.animation = "none";
function setupTab(tab) {
  tab.style.color = "#ffffff";
}

if (refer.endsWith("favorite.html")) {
  setupTab(favorTab);
} else if (refer.endsWith("catalog.html")) {
  setupTab(catalogTab);
}

if (stepNumber != 1 || link === "stepNumber=2") {
  switc.style.animation = "none";
}

async function displayNotification(numberBalance) {
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

function changeStorage(stepId) {
  const storedData = JSON.parse(localStorage.getItem("stepsData"));
  const stepsArray = storedData.steps;
  const step = stepsArray.find((step) => step.id === stepId);
  if (step) {
    step.completed = true;
  } else {
    console.warn(`Шаг с id=${stepId} не найден`);
  }
  storedData.steps = stepsArray;

  localStorage.setItem("stepsData", JSON.stringify(storedData));
}

async function sendProgressText(stepId) {
  try {
    const response = await fetchData(
      `submodule-step/${stepId}/user-completed-step`,
      "POST",
      { "X-User-Id": userId },
      null,
      false
    );
    if (response !== 200) {
      throw Error;
    } else {
      changeStorage(stepId);
    }
  } catch (error) {
    console.error("Ошибка отправки прогресса:", error, error.status);
  }
}

async function sendProgressTest(stepId, sendTest) {
  try {
    const response = await fetchData(
      `submodule-step/${stepId}/user-completed-test`,
      "POST",
      { "X-User-Id": userId },
      sendTest
    );
    if (response) {
      displayNotification(response);
      changeStorage(stepId);
      return 200;
    } else {
      throw Error;
    }
  } catch (error) {
    console.error(error, error.status);
    return error.status;
  }
}
