import fetchData from "./fetch.js";

const mediaContent = document.getElementById("content");

const testDiv = document.getElementById("test");
const submitButton = document.getElementById("submit-button");
const resultContainer = document.getElementById("result-container");
const resultSvgCorrect = document.getElementById("result-svg-correct");
const resultSvgIncorrect = document.getElementById("result-svg-incorrect");
const retryButton = document.getElementById("retry-button");

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

function setButtonHref(
  buttons,
  { steps, nextSubmoduleId, previousSubmoduleId }
) {
  const stepsLength = steps.length;

  buttons.forEach(({ buttonHtml, buttonType }) => {
    let href = null;

    if (buttonType === "BACK") {
      href =
        stepNumber > 1
          ? `step.html?v=1.0.7&courseId=${courseId}&submoduleId=${submoduleId}&stepNumber=${
              stepNumber - 1
            }`
          : previousSubmoduleId
          ? `step.html?v=1.0.7&courseId=${courseId}&submoduleId=${previousSubmoduleId}&stepNumber=1`
          : null;
    } else {
      href =
        stepNumber < stepsLength
          ? `step.html?v=1.0.7&courseId=${courseId}&submoduleId=${submoduleId}&stepNumber=${
              stepNumber + 1
            }`
          : nextSubmoduleId
          ? `step.html?v=1.0.7&courseId=${courseId}&submoduleId=${nextSubmoduleId}&stepNumber=1`
          : `syllabus.html?v=1.0.7&courseId=${courseId}`;
    }

    href ? (buttonHtml.href = href) : buttonHtml.removeAttribute("href");
  });
}

class StepController {
  constructor(userId, submoduleId, stepNumber) {
    this.userId = userId;
    this.submoduleId = submoduleId;
    this.stepNumber = stepNumber;

    this.stepUI = new StepUI(this.userId);
  }

  async getSteps() {
    let stepsData = null;
    const storedData = JSON.parse(localStorage.getItem("stepsData")) || [];
    if (
      storedData &&
      storedData.currentSubmoduleId === this.submoduleId &&
      Date.now() - storedData.storedTime < 3_600_000
    ) {
      stepsData = storedData;
    } else {
      stepsData = await fetchData(
        `submodule/${this.submoduleId}/steps`,
        "GET",
        {
          "X-User-Id": this.userId,
        }
      );

      stepsData.currentSubmoduleId = this.submoduleId;
      stepsData.storedTime = Date.now();
      localStorage.setItem("stepsData", JSON.stringify(stepsData));
    }

    this.stepUI.displayStepInfo(stepsData.steps.length);
    this.stepUI.createNavigationMenu(stepsData.steps);
    this.getCourseContent(stepsData.steps);
    setButtonHref(buttonsArray, stepsData);
  }

  async getCourseContent(stepsData) {
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
      this.stepUI.displayContent(content, stepId, isTest, isComplete);
    } catch (error) {
      console.error(`Ошибка в getCourseContent: ${error.message}`);
      alert("Произошла ошибка при загрузке шага. Попробуйте позже.");
    }
  }
}

class StepProgressController {
  constructor(userId, StepUI) {
    this.userId = userId;
    this.stepUI = StepUI;
  }

  changeStorage(stepId) {
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

  async sendProgressText(stepId) {
    try {
      const response = await fetchData(
        `submodule-step/${stepId}/user-completed-step`,
        "POST",
        { "X-User-Id": this.userId },
        null,
        false
      );
      if (response !== 200) {
        throw Error;
      } else {
        this.changeStorage(stepId);
      }
    } catch (error) {
      console.error("Ошибка отправки прогресса:", error, error.status);
    }
  }

  async sendProgressTest(stepId, sendTest) {
    try {
      const response = await fetchData(
        `submodule-step/${stepId}/user-completed-test`,
        "POST",
        { "X-User-Id": this.userId },
        sendTest
      );

      if (response) {
        this.stepUI.displayNotification(response);
        this.changeStorage(stepId);
        return 200;
      } else {
        throw Error;
      }
    } catch (error) {
      console.error(error, error.status);
      return error.status;
    }
  }
}

class StepImageController {
  constructor() {}

  fixImages(images) {
    images.forEach((img) => {
      const { width, height } = img;
      const isLargeImage = height >= 55 || width >= 100;

      if (isLargeImage) {
        this.replaceWithEnhancedImage(img);
      } else {
        this.applySmallImageStyles(img);
      }
    });
  }

  replaceWithEnhancedImage(img) {
    const newImg = img.cloneNode(true);
    newImg.classList.add("iview-image");
    newImg.dataset.iview = "";
    newImg.style.cssText = `
    height: ${img.height}px;
    width: ${img.width}px;
    align-self: center;
    margin-top: 1em;
  `;

    if (img.parentNode.tagName === "P") {
      img.parentNode.replaceWith(newImg);
    } else {
      img.replaceWith(newImg);
    }
  }

  applySmallImageStyles(img) {
    Object.assign(img.style, {
      verticalAlign: "middle",
      margin: "0 5px",
    });
  }

  async trackImageLoad() {
    const imgElements = document.querySelectorAll("img");
    const promises = Array.from(imgElements).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) resolve(img.src);
        img.onload = () => resolve(img.src);
        img.onerror = () => resolve(null);
      });
    });
    await Promise.all(promises);
    this.fixImages(imgElements);
    document.getElementById("preloader").style.display = "none";
  }
}

class StepTestManager {
  constructor(stepProgressController) {
    this.stepProgressController = stepProgressController;
    this.incorrectAnswers = 0;
  }

  handleSubmit(stepId, testData, optionsCount) {
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

    this.handleAnswer(
      selectedOptions,
      isMultipleChoice,
      stepId,
      testData,
      optionsCount
    );
  }

  handleAnswer(
    selectedValue,
    isMultipleChoice,
    stepId,
    testData,
    optionsCount
  ) {
    if (!isMultipleChoice) {
      if (selectedValue[0] === testData.answer[0]) {
        this.handleCorrectAnswer(stepId, optionsCount);
      } else {
        this.handleIncorrectAnswer();
      }
    } else if (isMultipleChoice) {
      const answersAsString = JSON.stringify(testData.answer);
      const selectedValueAsString = JSON.stringify(selectedValue);
      if (answersAsString.includes(selectedValueAsString)) {
        this.handleCorrectAnswer(stepId, optionsCount);
      } else {
        this.handleIncorrectAnswer();
      }
    }
  }

  async handleCorrectAnswer(stepId, optionsCount) {
    const sendTest = {
      incorrectAnswersNumber: this.incorrectAnswers,
      answersNumber: optionsCount,
    };
    const responce = await this.stepProgressController.sendProgressTest(
      stepId,
      sendTest
    );

    if (responce !== 200) {
      alert("Нет соединения с сервером. Повторите попытку позже");
    } else {
      submitButton.style.animation = "fade-out 0.2s ease";

      setTimeout(() => {
        submitButton.style.display = "none";
        submitButton.style.animation = "none";
        nextButton.style.display = "flex";
        nextButton.style.animation = "fade-in 0.2s ease";

        resultContainer.innerText = "Правильно!";
        resultSvgCorrect.style.display = "flex";
        resultContainer.style.animation = "fade-in 0.2s ease";
        resultSvgCorrect.style.animation = "fade-in 0.2s ease";

        setTimeout(() => {
          nextButton.style.animation = "none";
          resultContainer.style.animation = "none";
          resultSvgCorrect.style.animation = "none";
        }, 200);
      }, 200);
    }
  }

  handleIncorrectAnswer() {
    this.incorrectAnswers++;
    submitButton.style.animation = "fade-out 0.2s ease";

    setTimeout(() => {
      submitButton.style.display = "none";
      submitButton.style.animation = "none";

      retryButton.style.display = "flex";
      retryButton.style.animation = "fade-in 0.2s ease";

      resultContainer.innerText = "Неправильно!";
      resultSvgIncorrect.style.display = "flex";
      resultSvgCorrect.style.animation = "fade-in 0.2s ease";
      resultSvgIncorrect.style.animation = "fade-in 0.2s ease";

      setTimeout(() => {
        resultContainer.style.animation = "none";
        retryButton.style.animation = "none";
        resultSvgIncorrect.style.animation = "none";
      }, 200);
    }, 200);
  }
}

class StepUI {
  constructor(userId) {
    this.userId = userId;

    this.stepImageController = new StepImageController();
    this.stepProgressController = new StepProgressController(this.userId, this);
    this.stepTestManager = new StepTestManager(this.stepProgressController);
  }

  displayNotification(numberBalance) {
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

  displayStepInfo(stepsDataLength) {
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

  createNavigationMenu(stepsData) {
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
          window.location.href = `step.html?v=1.0.7&courseId=${courseId}&submoduleId=${submoduleId}&stepNumber=${step.number}`;
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

  displayComplete() {
    const stepComplete = document.createElement("div");
    stepComplete.classList.add("step-complete");
    stepComplete.innerText = "Шаг пройден!";
    document.getElementById("blockContent").append(stepComplete);
  }

  async displayContent(content, stepId, isTest, isComplete) {
    if (isTest === false) {
      mediaContent.innerHTML = DOMPurify.sanitize(content);
      await this.stepImageController.trackImageLoad();
      this.stepProgressController.sendProgressText(stepId);

      if (isComplete) {
        this.displayComplete();
      }
    } else {
      const jsonObject = JSON.parse(content);
      const testData = {
        question: jsonObject.question,
        image: jsonObject.image,
        options: jsonObject.options,
        answer: jsonObject.answer,
      };

      this.displayTest(stepId, isComplete, testData, jsonObject.options.length);
    }
  }

  displayTest(stepId, isComplete, testData, optionsCount) {
    const { question, image, options, answer } = testData;
    retryButton.style.display = "none";
    testDiv.style.display = "flex";
    submitButton.style.display = "flex";
    submitButton.disabled = "true";
    resultContainer.style.display = "flex";

    const isMultipleChoice = answer.length > 1;

    testDiv.innerHTML = `<h2 style="margin-bottom: 10px; line-height: 32px;">${question}</h2>`;

    if (image && image.url) {
      testDiv.innerHTML += `
      <img src="${image.url}" height="${image.height}" width="${image.width}" style="align-self: center">
    `;
    }

    testDiv.innerHTML += `
    <p style="margin-bottom: 5px">Выберите ${
      isMultipleChoice ? "один или несколько" : "один"
    } вариант${isMultipleChoice ? "ов" : ""} ответа</p>
  `;

    options.forEach((option, index) => {
      const label = document.createElement("label");
      label.innerHTML = `
          <input type="${
            isMultipleChoice ? "checkbox" : "radio"
          }" name="question" id="optionTest${index + 1}" value="${option}">
          ${option}
      `;
      if (isComplete === true) {
        if (answer.includes(option)) {
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
      this.displayTest(stepId, isComplete, testData, optionsCount);
    submitButton._handler = () =>
      this.stepTestManager.handleSubmit(stepId, testData, optionsCount);

    // Добавляем обработчики
    retryButton.addEventListener("click", retryButton._handler);
    submitButton.addEventListener("click", submitButton._handler);

    submitButton.classList.add("disabled");

    const inputs = document.querySelectorAll('input[name="question"]');

    if (isComplete === true) {
      this.displayComplete();
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
}

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id ?? 1;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const submoduleId = Number(urlParams.get("submoduleId"));
const stepNumber = Number(urlParams.get("stepNumber"));
const courseId = Number(urlParams.get("courseId"));

const stepController = new StepController(userId, submoduleId, stepNumber);
stepController.getSteps();

const refer = localStorage.getItem("refer");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");
let link = document.referrer.split("/").pop();
link = link.split("&").pop();

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
