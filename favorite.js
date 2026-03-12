import fetchData from "./fetch.js";
import FingerprintJS from "./finger.js";
// import FingerprintJS from "https://openfpcdn.io/fingerprintjs/v4";

async function displayNotification(reward) {
  const notification = document.getElementById("notification");
  const notificationBalance = document.getElementById("notification-balance");
  notificationBalance.innerText = `+${reward}`;
  const notificationLogo = document.querySelector(".notification-logo");
  if (!notificationLogo) {
    notification.innerHTML += '<div class="notification-logo"></div>';
  }
  notification.classList.add("show");
  setTimeout(() => {
    tg.HapticFeedback.notificationOccurred("success");
  }, 350);

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

class FavoriteController {
  constructor(userId, tabManager, modalManager, dailyTestManager) {
    this.userId = userId;
    this.tabManager = tabManager;
    this.modalManager = modalManager;
    this.tg = window.Telegram.WebApp;
    this.dailyTestManager = dailyTestManager;

    this.favoriteUI = new FavoriteUI("favorite-courses");
  }

  async getDeviceTag() {
    let deviceFingerprint = "unknown";
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      // alert(result.components.platform.value);
      // alert(result.components.vendor.value);

      deviceFingerprint = result.visitorId;
      console.log("Browser Fingerprint:", deviceFingerprint);
    } catch (e) {
      console.error("Fingerprint error:", e);
      // Фолбэк на случай блокировки скрипта (например, AdBlock)
      // Используем localStorage как "мягкий" идентификатор
      deviceFingerprint = localStorage.getItem("device_unique_tag");

      if (!deviceFingerprint) {
        deviceFingerprint = "DEV-" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("device_unique_tag", deviceFingerprint);
      }
    }

    return deviceFingerprint;
  }

  async getUserIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();

      return data.ip;
    } catch (error) {
      console.error("Ошибка получения IP:", error);
      return null;
    }
  }

  async sendUserInfo() {
    let referallId = JSON.parse(localStorage.getItem("referallId"));

    if (referallId && referallId === this.userId) {
      referallId = null;
    }

    let body = {};

    body = {
      username: username,
      avatarUrl: avatarUrl,
      referrerId: referallId,
    };

    try {
      const [userIp, deviceData] = await Promise.all([
        this.getUserIP(),
        this.getDeviceTag(),
      ]);

      let userTest = await fetchData(
        `user/login-and-daily-test`,
        "POST",
        {
          "X-User-Id": this.userId,
          "X-User-Ip": userIp,
          "X-User-Device-Id": deviceData,
        },
        body,
      );

      if (userTest.historyType !== null) {
        localStorage.setItem("storiesType", userTest.historyType);
        document.getElementById("page").style.display = "flex";

        const event = new Event("storiesReady");
        window.dispatchEvent(event);
      }

      let dailyTestPromise = Promise.resolve();

      if (userTest && userTest.contentUrl && userTest.testStartDate) {
        dailyTestPromise = this.dailyTestManager.startDailyTest(
          userTest.testStartDate,
          userTest.contentUrl,
        );
      } else {
        localStorage.setItem("flagFirstJoin", false);
      }

      this.getFavoriteCourses();

      await dailyTestPromise;

      this.tabManager.enableTabs();
    } catch (error) {
      console.error(error, error.status);
    }
  }

  async getFavoriteCourses() {
    try {
      const courseInfo = await fetchData(`user/favorite-courses`, "GET", {
        "X-User-Id": this.userId,
      });
      courseInfo.length
        ? this.favoriteUI.displayCourses(courseInfo)
        : this.favoriteUI.displayButton();
    } catch (error) {
      console.error(error, error.status);
    }
  }
}

class FavoriteUI {
  constructor(favoriteBlock) {
    this.favoriteBlock = document.getElementById(favoriteBlock);
  }

  displayCourses(courseInfo) {
    document.getElementById("preloader").style.display = "none";

    this.favoriteBlock.innerHTML = "";

    let rating = null;

    courseInfo.forEach((course, index) => {
      rating = course.rating;

      const formattedRating = Number.isInteger(rating)
        ? rating.toString()
        : rating.toFixed(1);
      setTimeout(
        () => {
          const courseElement = document.createElement("a");
          courseElement.href = `courses.html?courseId=${course.id}`;
          courseElement.classList.add("block");
          courseElement.classList.add("courses-block");
          courseElement.innerHTML = `
            <img src="${course.iconUrl}" class="courses-logo" />
            <div class="courses-block-text">
          <div class="courses-block-name">${course.name}</div>
          <div class="courses-block-description">
            ${course.description}
          </div>
          <div class="courses-block-author-rating">
            <div class="courses-block-author">Автор: @${course.author}</div>
            <div class="courses-block-rating">${formattedRating}/5</div>
            <svg
              class="courses-block-rating-star"
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 0L4.69667 4.01794L0.318132 4.49139L3.58216 7.44806L2.6794 11.7586L6.5 9.568L10.3206 11.7586L9.41784 7.44806L12.6819 4.49139L8.30333 4.01794L6.5 0Z"
                fill="#F1D904"
              />
            </svg>
          </div>
        </div>
        `;
          this.favoriteBlock.append(courseElement);
        },
        (index + 1) * 100,
      );
    });
  }

  displayButton() {
    this.favoriteBlock.innerHTML = "";
    const courseButton = document.createElement("div");
    courseButton.classList.add("block");
    courseButton.classList.add("favorite-courses-enable");
    courseButton.innerHTML = `
        <div class="favorite-courses-enable-title">У вас еще нет курсов</div>
        <a href="catalog.html" class="favorite-courses-enable-button">
          <div class="favorite-courses-enable-button-text">Добавить курс</div>
          <svg
            class="favorite-courses-enable-button-icon"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.9998 7V15M6.99959 11H15M21.0003 11C21.0003 16.5228 16.523 21 10.9998 21C5.47666 21 0.999268 16.5228 0.999268 11C0.999268 5.47715 5.47666 1 10.9998 1C16.523 1 21.0003 5.47715 21.0003 11Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>

        `;
    this.favoriteBlock.append(courseButton);
    document.getElementById("preloader").style.display = "none";
  }
}

class TabManager {
  constructor(tabElements) {
    this.tabs = Array.from(tabElements);
  }

  disableTabs() {
    this.tabs.forEach((tab) => {
      tab.style.pointerEvents = "none";
    });
  }

  enableTabs() {
    this.tabs.forEach((tab) => {
      tab.style.pointerEvents = "auto";
    });
    const tab = document.getElementById("active");
    tab.style.pointerEvents = "none";
  }
}

class DailyTestManager {
  constructor(userId, modalManager) {
    this.userId = userId;
    this.modalManager = modalManager;
  }

  startDailyTest(testStartDate, contentUrl) {
    return new Promise(async (resolve) => {
      try {
        // Сначала показываем модальное окно с базовой загрузкой (до получения JSON)
        this._renderSkeleton();
        this.modalManager.show();

        // Загружаем JSON теста
        const response = await fetch(contentUrl);
        if (!response.ok) throw new Error("Ошибка загрузки");
        const content = await response.text();
        const testData = JSON.parse(content);

        // Устанавливаем коллбэк для таймаута
        this.modalManager.onTimeoutCallback = () => {
          this._checkAnswer(
            [],
            testData,
            testData.answer.length > 1,
            testStartDate,
            resolve,
            true,
          );
        };

        // Запускаем предзагрузку изображений и перерисовку контента
        this._loadContentAndStart(testData, testStartDate, resolve);
      } catch (error) {
        console.error("Ошибка теста:", error);
        resolve();
      }
    });
  }

  // Метод для отрисовки пустых пульсирующих блоков
  _renderSkeleton() {
    const html = `
      <div id="daily-test-wrapper" style="display: flex; flex-direction: column; width: 100%;">
        <!-- Скелет заголовка -->
        <h2 class="wallet-loader" style="height: 32px; width: 100%; border-radius: 8px; margin-top: 0; margin-bottom: 10px;"></h2>
        
        <!-- Скелет картинки (прячем по умолчанию, пока не узнаем, есть ли она в JSON) -->
        <div id="skeleton-image" class="wallet-loader" style="display: none; height: 150px; width: 150px; align-self: center; border-radius: 8px; margin-bottom: 10px;"></div>
        
        <!-- Скелет подзаголовка -->
        <p class="wallet-loader" style="height: 20px; width: 70%; border-radius: 8px; margin-bottom: 15px;"></p>
        
        <!-- Скелет вариантов ответов -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="wallet-loader" style="height: 30px; width: 100%; border-radius: 8px;"></div>
          <div class="wallet-loader" style="height: 30px; width: 100%; border-radius: 8px;"></div>
          <div class="wallet-loader" style="height: 30px; width: 100%; border-radius: 8px;"></div>
          <div class="wallet-loader" style="height: 30px; width: 100%; border-radius: 8px;"></div>
        </div>

        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <button class="step-block-button disabled" disabled>Ответить</button>
        </div>
      </div>
    `;

    this.modalManager.setContent(html);

    // Сбрасываем заголовок
    const modalHeader = document.querySelector(".modal-header");
    if (modalHeader) modalHeader.innerText = "Ежедневный тест!";
  }

  // Загружаем картинку и после этого рендерим настоящий тест
  async _loadContentAndStart(testData, testStartDate, resolveCallback) {
    const promises = [];

    // Если в JSON есть картинка, показываем для неё скелет и начинаем загрузку
    if (testData.image && testData.image.url) {
      const skeletonImage = document.getElementById("skeleton-image");
      if (skeletonImage) {
        skeletonImage.style.display = "block";
        // Подгоняем скелет под реальные размеры будущей картинки
        skeletonImage.style.height = `${testData.image.height}px`;
        skeletonImage.style.width = `${testData.image.width}px`;
      }

      const loadPromise = new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // Резолвим даже при ошибке, чтобы тест не завис
        img.src = testData.image.url;
      });
      promises.push(loadPromise);
    }

    const pageElement = document.getElementById("page");
    const areStoriesOpen =
      pageElement && window.getComputedStyle(pageElement).display !== "none";

    if (areStoriesOpen) {
      const storiesPromise = new Promise((resolve) => {
        const onStoriesClosed = () => {
          window.removeEventListener("storiesClosed", onStoriesClosed);
          resolve();
        };
        window.addEventListener("storiesClosed", onStoriesClosed);
      });
      promises.push(storiesPromise);
    }

    await Promise.allSettled(promises);

    await new Promise((resolve) => setTimeout(resolve, 500));

    this._renderActualTest(testData, testStartDate, resolveCallback);
    this.modalManager.startTimer();
  }

  // Отрисовка настоящего контента (ваш текущий renderTest, переименованный)
  _renderActualTest(testData, testStartDate, resolveCallback) {
    const isMultipleChoice = testData.answer.length > 1;

    let optionsHtml = testData.options
      .map(
        (option) => `
      <label class="test-option">
        <input type="${isMultipleChoice ? "checkbox" : "radio"}" name="daily-question" value="${option}">
        ${option}
      </label>
    `,
      )
      .join("");

    const html = `
      <div id="daily-test-wrapper" style="display: flex; flex-direction: column; width: 100%; flex: 1 1 auto; min-height: 0; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;">
        
        
        <div >
          <h2 style="margin-top: 0; margin-bottom: 10px; line-height: 28px; font-size: 18px;">${testData.question}</h2>
          ${
            testData.image && testData.image.url
              ? `
          <div style="display: flex; justify-content: center; margin-bottom: 15px;">
            
            <img 
              src="${testData.image.url}" 
              class="iview-image" 
              data-iview="" 
              draggable="false"
              style="max-height: ${testData.image.height}px; max-width: 100%; object-fit: contain;"
            >
          </div>`
              : ""
          }
          <p style="margin-bottom: 15px; font-size: 13px; color: var(--theme-text-hint-color);">
            Выберите ${isMultipleChoice ? "один или несколько вариантов" : "один вариант"}
          </p>
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${optionsHtml}
          </div>
        </div>
        
          <div class="result" id="daily-result-wrapper" style="display: none; justify-content: center; margin-bottom: 10px; height: 24px;">
            <div id="daily-result-text" style="font-weight: 600; font-size: 14px;"></div>
            <svg id="daily-svg-correct" style="display: none; margin-left: 5px;" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 0.25C7.26942 0.25 5.57769 0.763179 4.13876 1.72464C2.69983 2.6861 1.57832 4.05267 0.916058 5.65152C0.253791 7.25037 0.0805121 9.00971 0.418133 10.707C0.755753 12.4044 1.58911 13.9635 2.81282 15.1872C4.03653 16.4109 5.59563 17.2443 7.29296 17.5819C8.9903 17.9195 10.7496 17.7462 12.3485 17.0839C13.9473 16.4217 15.3139 15.3002 16.2754 13.8612C17.2368 12.4223 17.75 10.7306 17.75 9C17.75 6.67936 16.8281 4.45376 15.1872 2.81282C13.5462 1.17187 11.3206 0.25 9 0.25ZM7.75 12.4938L4.625 9.36875L5.61875 8.375L7.75 10.5062L12.3813 5.875L13.3788 6.86625L7.75 12.4938Z" fill="#43A047"/>
            </svg>
            <svg id="daily-svg-incorrect" style="display: none; margin-left: 5px;" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M2.63604 2.63604C0.948212 4.32387 0 6.61305 0 9C0 11.3869 0.948212 13.6761 2.63604 15.364C4.32387 17.0518 6.61305 18 9 18C11.3869 18 13.6761 17.0518 15.364 15.364C17.0518 13.6761 18 11.3869 18 9C18 6.61305 17.0518 4.32387 15.364 2.63604C13.6761 0.948212 11.3869 0 9 0C6.61305 0 4.32387 0.948212 2.63604 2.63604ZM3.54888 3.54888C4.99461 2.10316 6.95543 1.29096 9 1.29096C11.0446 1.29096 13.0054 2.10316 14.4511 3.54888C15.8968 4.99461 16.709 6.95543 16.709 9C16.709 11.0446 15.8968 13.0054 14.4511 14.4511C13.0054 15.8968 11.0446 16.709 9 16.709C6.95543 16.709 4.99461 15.8968 3.54888 14.4511C2.10316 13.0054 1.29096 11.0446 1.29096 9C1.29096 6.95543 2.10316 4.99461 3.54888 3.54888Z" fill="#E53232"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9 1.29096C6.95543 1.29096 4.99461 2.10316 3.54888 3.54888C2.10316 4.99461 1.29096 6.95543 1.29096 9C1.29096 11.0446 2.10316 13.0054 3.54888 14.4511C4.99461 15.8968 6.95543 16.709 9 16.709C11.0446 16.709 13.0054 15.8968 14.4511 14.4511C15.8968 13.0054 16.709 11.0446 16.709 9C16.709 6.95543 15.8968 4.99461 14.4511 3.54888C13.0054 2.10316 11.0446 1.29096 9 1.29096ZM12.3978 6.28288C12.3978 6.10271 12.3262 5.92992 12.1989 5.80251C12.1357 5.73923 12.0608 5.68767 11.9782 5.65342C11.8957 5.61916 11.8072 5.60153 11.7178 5.60153C11.6284 5.60153 11.5399 5.61916 11.4574 5.65342C11.3748 5.68767 11.2999 5.73787 11.2368 5.80115L9 8.03926L6.76325 5.80115C6.63567 5.67357 6.46263 5.60189 6.2822 5.60189C6.10177 5.60189 5.92873 5.67357 5.80115 5.80115C5.67357 5.92873 5.60189 6.10177 5.60189 6.2822C5.60189 6.46263 5.67357 6.63567 5.80115 6.76325L8.03926 9L5.80115 11.2368C5.73798 11.2999 5.68786 11.3749 5.65367 11.4575C5.61949 11.54 5.60189 11.6285 5.60189 11.7178C5.60189 11.8071 5.61949 11.8956 5.65367 11.9781C5.68786 12.0607 5.73798 12.1357 5.80115 12.1989C5.86432 12.262 5.93932 12.3121 6.02186 12.3463C6.10439 12.3805 6.19286 12.3981 6.2822 12.3981C6.37154 12.3981 6.46 12.3805 6.54254 12.3463C6.62508 12.3121 6.70008 12.262 6.76325 12.1989L9 9.96074L11.2368 12.1989C11.3643 12.3264 11.5374 12.3981 11.7178 12.3981C11.8982 12.3981 12.0713 12.3264 12.1989 12.1989C12.3264 12.0713 12.3981 11.8982 12.3981 11.7178C12.3981 11.5374 12.3264 11.3643 12.1989 11.2368L9.96074 9L12.1989 6.76325C12.3262 6.63583 12.3978 6.46304 12.3978 6.28288Z" fill="#E53232"/>
            </svg>
          </div>

          <div style="display: flex; justify-content: center;">
            <button id="daily-submit-button" class="step-block-button disabled" disabled>Ответить</button>
          </div>
        
      </div>
    `;

    this.modalManager.setContent(html);
    this._bindEvents(
      testData,
      testStartDate,
      isMultipleChoice,
      resolveCallback,
    );
  }

  _bindEvents(testData, testStartDate, isMultipleChoice, resolveCallback) {
    const submitBtn = document.getElementById("daily-submit-button");
    const inputs = document.querySelectorAll('input[name="daily-question"]');

    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        submitBtn.classList.remove("disabled");
        submitBtn.disabled = false;
      });
    });

    submitBtn.addEventListener("click", () => {
      submitBtn.disabled = true;
      inputs.forEach((i) => (i.disabled = true));

      const selectedOptions = Array.from(inputs)
        .filter((input) => input.checked)
        .map((input) => input.value);

      this._checkAnswer(
        selectedOptions,
        testData,
        isMultipleChoice,
        testStartDate,
        resolveCallback,
      );
    });
  }

  async _checkAnswer(
    selectedOptions,
    testData,
    isMultipleChoice,
    testStartDate,
    resolveCallback,
    isTimeout = false,
  ) {
    if (!isTimeout) {
      this.modalManager.pauseProgress();
    }

    let isCorrect = false;

    if (!isTimeout) {
      isCorrect = isMultipleChoice
        ? JSON.stringify(selectedOptions.sort()) ===
          JSON.stringify(testData.answer.sort())
        : selectedOptions[0] === testData.answer[0];
    }

    const resultWrapper = document.getElementById("daily-result-wrapper");
    const resultText = document.getElementById("daily-result-text");
    const svgCorrect = document.getElementById("daily-svg-correct");
    const svgIncorrect = document.getElementById("daily-svg-incorrect");
    const submitBtn = document.getElementById("daily-submit-button");
    const inputs = document.querySelectorAll('input[name="daily-question"]');

    submitBtn.style.display = "none";
    inputs.forEach((i) => (i.disabled = true));

    resultWrapper.style.display = "flex";

    // Крутилка загрузки (можно использовать вашу иконку лоадера)
    const loaderHtml = `<div class="load-task-animation" style="width: 25px; height: 25px; border-width: 3px;"></div>`;
    resultWrapper.insertAdjacentHTML(
      "beforeend",
      `<div id="daily-submit-loader">${loaderHtml}</div>`,
    );

    try {
      // Пытаемся отправить данные на сервер
      const [rewardAmount] = await Promise.all([
        this.sendTestProgress(testStartDate, isCorrect),
        new Promise((res) => setTimeout(res, 1000)), // Минимальная задержка для плавности UI
      ]);

      const loader = document.getElementById("daily-submit-loader");
      if (loader) loader.remove();

      if (isCorrect) {
        resultText.innerText = "Правильно!";
        resultText.style.color = "#43A047";
        svgCorrect.style.display = "block";
      } else {
        resultText.innerText = isTimeout ? "Время вышло" : "Неправильно!";
        resultText.style.color = "#E53232";
        svgIncorrect.style.display = "block";
      }

      const testBlock = document.getElementById("test");

      if (rewardAmount !== null && testBlock) {
        displayNotification(rewardAmount);
      }

      this.modalManager.enableClose();

      setTimeout(() => {
        if (this.modalManager.modal.style.display !== "none") {
          this.modalManager.hide();
        }
        resolveCallback();
      }, 2500);
    } catch (error) {
      console.error("Ошибка сохранения теста:", error);

      this._showErrorState();

      this.modalManager.enableClose();

      resolveCallback();
    }
  }

  // Метод для визуализации ошибки в модалке
  _showErrorState() {
    const resultWrapper = document.getElementById("daily-result-wrapper");
    const testWrapper = document.getElementById("daily-test-wrapper");

    if (resultWrapper) resultWrapper.style.display = "none";

    // Очищаем контент теста и показываем сообщение об ошибке
    if (testWrapper) {
      testWrapper.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 15px; padding: 10px 0;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E53232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 style="margin: 0; color: var(--theme-text-color); font-size: 18px;">Ошибка соединения</h3>
          <p style="margin: 0; color: var(--theme-text-hint-color); font-size: 14px; line-height: 20px;">
            Не удалось сохранить результат. Пожалуйста, проверьте подключение к интернету и попробуйте позже.
          </p>
          <button id="daily-error-close" class="step-block-button" style="margin-top: 10px; align-self: center;">Закрыть</button>
        </div>
      `;

      // Привязываем закрытие к кнопке
      const closeBtn = document.getElementById("daily-error-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          this.modalManager.hide();
        });
      }
    }
  }

  async sendTestProgress(testStartDate, isSuccess) {
    const body = {
      isSuccess: isSuccess,
      testStartDate: testStartDate,
    };

    try {
      const response = await fetchData(
        `user/daily-test-result`,
        "POST",
        { "X-User-Id": this.userId },
        body,
      );

      console.log("Результат теста отправлен", response);

      return response;
    } catch (error) {
      console.error("Ошибка сохранения Daily Test:", error);
      return null;
    }
  }
}

class ModalManager {
  constructor() {
    this.modal = document.getElementById("modal");
    this.borderProgress = document.getElementById("modalBorderProgress");
    this.testContent = document.getElementById("test");
    this.timerElement = document.getElementById("timer");

    this._rafId = null;
    this._duration = 200000;

    this._startTime = 0;
    this._elapsed = 0;
    this._isPaused = false;

    this.isClosable = false;

    this._bindEvents();
  }

  _bindEvents() {
    this.modal.addEventListener("click", (event) => {
      if (this.isClosable && event.target === this.modal) {
        this.hide();
      }
    });
  }

  enableClose() {
    this.isClosable = true;
  }

  pauseProgress() {
    if (!this._isPaused) {
      this._isPaused = true;

      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }

      if (this.borderProgress) {
        this.borderProgress.classList.add("paused");
      }
    }
  }

  resumeProgress() {
    if (this._isPaused) {
      this._isPaused = false;

      this._startTime = performance.now() - this._elapsed;

      if (this.borderProgress) {
        this.borderProgress.classList.remove("paused");
      }

      this._loop();
    }
  }

  startTimer() {
    if (!this.borderProgress) return;

    this._isPaused = false;
    this._elapsed = 0;
    this._startTime = performance.now();

    this.borderProgress.classList.remove("paused", "blink");

    this._updateTimerText(this._duration);

    this._loop();
  }

  _updateTimerText(timeLeftMs) {
    if (!this.timerElement) return;

    const seconds = Math.ceil(timeLeftMs / 1000);

    const displaySeconds = Math.max(0, seconds);

    this.timerElement.innerText = `${displaySeconds}с`;
  }

  _loop() {
    if (this._isPaused) return;

    const now = performance.now();

    this._elapsed = now - this._startTime;

    const timeLeft = this._duration - this._elapsed;
    this._updateTimerText(timeLeft);

    const progress = Math.min(this._elapsed / this._duration, 1);

    this.borderProgress.style.setProperty("--progress", progress);

    if (progress > 0.6) {
      this.borderProgress.style.setProperty("--arc-red-opacity", 1);
    } else {
      this.borderProgress.style.setProperty("--arc-red-opacity", 0);
    }

    if (progress > 0.75) {
      this.borderProgress.style.background = `conic-gradient(
        from 0deg,
        var(--theme-block-border-color) 0deg,
        var(--theme-block-border-color) 360deg
      )`;
    } else {
      //TODO нужно ли
      this.borderProgress.style.background = "";
    }

    if (progress > 0.8) {
      this.borderProgress.classList.add("blink");
      if (this.timerElement) this.timerElement.style.color = "#E53232";
    } else {
      this.borderProgress.classList.remove("blink");
      if (this.timerElement) this.timerElement.style.color = "";
    }

    if (progress < 1) {
      this._rafId = requestAnimationFrame(() => this._loop());
    } else {
      this._stopProgress();
      if (this.onTimeoutCallback) {
        this.onTimeoutCallback();
      } else {
        this.hide();
      }
    }
  }

  _stopProgress() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._isPaused = false;
    this._elapsed = 0;

    if (this.borderProgress) {
      this.borderProgress.style.setProperty("--progress", 0);
      this.borderProgress.classList.remove("blink", "paused");
      //TODO нужно ли
      this.borderProgress.style.background = "";
    }

    if (this.timerElement) {
      this.timerElement.style.color = "";
    }
  }

  setContent(html) {
    if (this.testContent) {
      this.testContent.innerHTML = html;
    }
  }

  clearContent() {
    if (this.testContent) {
      this.testContent.innerHTML = "";
    }
  }

  show() {
    this.isClosable = false;
    this.modal.style.display = "flex";

    // Возвращаем видимость бордеру при новом показе
    if (this.borderProgress) {
      this.borderProgress.style.transition = "none";
      this.borderProgress.style.opacity = "1";
    }

    // Возвращаем видимость таймеру при новом показе
    if (this.timerElement) {
      this.timerElement.style.transition = "none";
      this.timerElement.style.opacity = "1";
      // Ставим начальный текст ДО запуска таймера, чтобы не было пустоты
      this._updateTimerText(this._duration);
    }

    // ВАЖНО: Убираем отсюда this._startProgress();
    // Теперь таймер будет запускаться извне
  }

  hide() {
    this._stopProgress();
    this.modal.style.display = "none";
  }
}

const tg = window.Telegram.WebApp;
const avatarUrl =
  tg.initDataUnsafe?.user?.photo_url ?? "tg.initDataUnsafe.user.photo_url";
const userId = tg.initDataUnsafe?.user?.id ?? 2;
const rawUsername = tg.initDataUnsafe?.user?.username;
const username = rawUsername ? DOMPurify.sanitize(rawUsername) : "User";

const flagFirstJoin = JSON.parse(localStorage.getItem("flagFirstJoin"));
document.addEventListener("DOMContentLoaded", () => {
  const tabBar = document.querySelectorAll(".tab-item");
  const tabManager = new TabManager(tabBar);
  const modalManager = new ModalManager();
  const dailyTestManager = new DailyTestManager(userId, modalManager);
  const favoriteController = new FavoriteController(
    userId,
    tabManager,
    modalManager,
    dailyTestManager,
  );

  if (flagFirstJoin) {
    tabManager.disableTabs();
    favoriteController.sendUserInfo();
  } else {
    favoriteController.getFavoriteCourses();
  }
});
