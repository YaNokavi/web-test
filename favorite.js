import fetchData from "./fetch.js";

class FavoriteController {
  constructor(userId, tabManager, modalManager) {
    this.userId = userId;
    this.tabManager = tabManager;
    this.modalManager = modalManager;

    this.favoriteUI = new FavoriteUI("favorite-courses");
  }

  async getDeviceTag() {
    return new Promise((resolve) => {
      // 1. Проверяем LocalStorage (привязан к браузеру/устройству)
      let localTag = localStorage.getItem("device_unique_tag");

      // Если CloudStorage недоступен (старая версия Telegram), работаем только с LocalStorage
      if (!tg.isVersionAtLeast("6.9")) {
        if (!localTag) {
          localTag = "DEV-" + Math.random().toString(36).substr(2, 9);
          localStorage.setItem("device_unique_tag", localTag);
        }
        return resolve({ tag: localTag, suspect: false });
      }

      console.log(tg.CloudStorage);

      // 2. Проверяем CloudStorage (привязан к аккаунту Telegram)
      tg.CloudStorage.getItem("device_unique_tag", (err, cloudTag) => {
        if (err) {
          console.error("CloudStorage error:", err);
          // В случае ошибки возвращаем то, что есть в локале, или генерим новый
          if (!localTag) {
            localTag = "DEV-" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("device_unique_tag", localTag);
          }
          return resolve({ tag: localTag, suspect: false });
        }

        // --- ЛОГИКА КАПКАНА ---

        // Случай А: Чистый юзер (нет ни там, ни там)
        if (!localTag && !cloudTag) {
          const newTag = "DEV-" + Math.random().toString(36).substr(2, 9);
          localStorage.setItem("device_unique_tag", newTag);
          tg.CloudStorage.setItem("device_unique_tag", newTag);
          return resolve({ tag: newTag, suspect: false });
        }

        // Случай Б: Сменил устройство (есть в облаке, нет в локале)
        if (!localTag && cloudTag) {
          localStorage.setItem("device_unique_tag", cloudTag); // Синхронизируем
          return resolve({ tag: cloudTag, suspect: false });
        }

        // Случай В: Переустановил приложение/очистил облако (есть в локале, нет в облаке)
        if (localTag && !cloudTag) {
          tg.CloudStorage.setItem("device_unique_tag", localTag); // Восстанавливаем в облако
          return resolve({ tag: localTag, suspect: false });
        }

        // Случай Г: МУЛЬТИАККАУНТ (Есть и там, и там, но РАЗНЫЕ)
        // В локале лежит тег от Аккаунта №1, а в облаке тег от Аккаунта №2
        if (localTag && cloudTag && localTag !== cloudTag) {
          // Это срабатывает, когда на одном телефоне зашли с другого Telegram аккаунта

          // ДЕМОНСТРАЦИЯ ДЛЯ ТЕСТА:
          tg.showAlert(
            `⚠️ Обнаружен мультиаккаунтинг!\nУстройство: ${localTag}\nАккаунт: ${cloudTag}`,
          );

          return resolve({ tag: localTag, suspect: true });
        }

        // Если всё совпадает
        return resolve({ tag: localTag, suspect: false });
      });
    });
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
      // const userIp = await this.getUserIP();

      const [userIp, deviceData] = await Promise.all([
        this.getUserIP(),
        this.getDeviceTag(),
      ]);

      tg.showAlert(deviceData.tag);

      const rewards = await fetchData(
        `user/login-and-reward`,
        "POST",
        { "X-User-Id": this.userId, "X-User-Ip": userIp },
        body,
      );

      if (rewards.history !== null) {
        localStorage.setItem("storiesType", rewards.history);
        document.getElementById("page").style.display = "flex";

        const event = new Event("storiesReady");
        window.dispatchEvent(event);
      }

      if (rewards.firstEntryToday === true) {
        this.modalManager.createListRewards(rewards);
      }

      localStorage.setItem("flagFirstJoin", false);
      this.tabManager.enableTabs();
      this.getFavoriteCourses();
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

class ModalManager {
  constructor() {
    this.modal = document.getElementById("modal");
    this.buttonModal = document.getElementById("okButton");

    this._bindEvents();
  }

  _bindEvents() {
    this.buttonModal.addEventListener("click", () => {
      this.hide();
    });

    this.modal.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.hide();
      }
    });
  }

  createListRewards(rewards) {
    const listRewards = document.getElementById("listRewards");
    const divReward = document.getElementById("reward");
    divReward.innerHTML = `+${rewards.userReward} CUNA<div class="modal-coin-logo"></div>
  `;

    rewards.dailyEntryRewardList.forEach((item) => {
      const reward = document.createElement("li");
      if (rewards.userStreakDays >= item.streakDays) {
        reward.classList.add("complete");
      }
      reward.innerText = item.reward;

      listRewards.append(reward);
    });

    this.show();
  }

  show() {
    this.modal.style.display = "flex";
  }

  hide() {
    this.modal.style.display = "none";
  }
}

const tg = window.Telegram.WebApp;
const avatarUrl =
  tg.initDataUnsafe?.user?.photo_url ?? "tg.initDataUnsafe.user.photo_url";
const userId = tg.initDataUnsafe?.user?.id ?? 1;
const rawUsername = tg.initDataUnsafe?.user?.username;
const username = rawUsername ? DOMPurify.sanitize(rawUsername) : "User";

const flagFirstJoin = JSON.parse(localStorage.getItem("flagFirstJoin"));
document.addEventListener("DOMContentLoaded", () => {
  const tabBar = document.querySelectorAll(".tab-item");
  const tabManager = new TabManager(tabBar);
  const modalManager = new ModalManager();
  const favoriteController = new FavoriteController(
    userId,
    tabManager,
    modalManager,
  );

  if (flagFirstJoin) {
    tabManager.disableTabs();
    favoriteController.sendUserInfo();
  } else {
    favoriteController.getFavoriteCourses();
  }
});
