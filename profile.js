import fetchData from "./fetch.js";

function displayNotification(reward, type) {
  if (type === "REWARD") {
    if (reward) {
      const notification = document.getElementById("notification");
      const notificationBalance = document.getElementById(
        "notification-balance"
      );
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
    } else {
      const notification = document.getElementById("notification");
      const notificationBalance = document.getElementById(
        "notification-balance"
      );
      notificationBalance.innerText = `Задание еще не выполнено`;
      const notificationLogo = document.querySelector(".notification-logo");
      if (notificationLogo) {
        notificationLogo.remove();
      }
      notification.classList.add("show");
      setTimeout(() => {
        tg.HapticFeedback.notificationOccurred("error");
      }, 350);

      setTimeout(() => {
        notification.classList.remove("show");
      }, 2000);
    }
  } else if (type === "COPY") {
    const notification = document.getElementById("notification");
    const notificationBalance = document.getElementById("notification-balance");
    notificationBalance.innerText = `Адрес успешно скопирован`;
    const notificationLogo = document.querySelector(".notification-logo");
    if (notificationLogo) {
      notificationLogo.remove();
    }
    notification.classList.add("show");
    setTimeout(() => {
      tg.HapticFeedback.notificationOccurred("success");
    }, 350);

    setTimeout(() => {
      notification.classList.remove("show");
    }, 2000);
  }
}

class ProfileController {
  constructor(userId, walletUI) {
    this.userId = userId;
    this.walletUI = walletUI;

    this.balanceText = document.getElementById("balance");

    this.profileUI = new ProfileUI(this);
  }

  async getUserInfo() {
    try {
      const userInfo = await fetchData(`user/profile/info`, "GET", {
        "X-User-Id": this.userId,
      });

      const formattedBalance = Number.isInteger(userInfo.cunaTokenBalance)
        ? userInfo.cunaTokenBalance.toString()
        : userInfo.cunaTokenBalance.toFixed(2);

      this.balanceText.innerText = formattedBalance;

      document.getElementById(
        "balance-cuna"
      ).innerHTML = `${formattedBalance} CUNA`;

      if (userInfo.walletAddress) {
        walletAddress = userInfo.walletAddress;
        this.walletUI.displayBaseWalletInfo(walletAddress);
      }

      if (userInfo.coursesProgress.length != 0) {
        this.profileUI.displayProgress(userInfo);
      } else {
        this.profileUI.displayNotProgress();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getTasks() {
    const tasksInfo = await fetchData(`task/all`, "GET", {
      "X-User-Id": this.userId,
    });

    tasksInfo.length !== 0
      ? this.profileUI.displayTasks(tasksInfo)
      : this.profileUI.displayNotTasks();
  }

  async checkTask(task) {
    try {
      const taskCheckInfo = await fetchData(
        `task/${task.taskId}/completed`,
        "POST",
        { "X-User-Id": this.userId }
      );

      const buttonTask = document.getElementById(`task${task.taskId}`);
      if (taskCheckInfo) {
        buttonTask.classList.remove("load-task-animation");
        buttonTask.classList.remove("load-task");

        displayNotification(taskCheckInfo.reward, "REWARD");
        this.balanceText.innerText = taskCheckInfo.newBalance.toFixed(2);
        buttonTask.classList.add("complete-task");
        buttonTask.textContent = "";
        buttonTask.innerHTML = `
          <svg style="color: var(--theme-button-hint-icon-text-color)" width="16" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M21.5244 4.79211C21.3064 4.79861 21.0995 4.88973 20.9475 5.04616L8.114 17.8797L2.83309 12.5987C2.75576 12.5182 2.66314 12.4539 2.56065 12.4096C2.45817 12.3653 2.34787 12.3419 2.23623 12.3408C2.12458 12.3396 2.01383 12.3608 1.91047 12.403C1.8071 12.4452 1.71319 12.5076 1.63424 12.5866C1.55529 12.6655 1.49289 12.7594 1.45069 12.8628C1.40849 12.9661 1.38734 13.0769 1.38847 13.1885C1.38961 13.3002 1.41301 13.4105 1.4573 13.513C1.5016 13.6155 1.5659 13.7081 1.64644 13.7854L7.52067 19.6596C7.67806 19.8169 7.89147 19.9053 8.114 19.9053C8.33652 19.9053 8.54994 19.8169 8.70732 19.6596L22.1341 6.23281C22.2554 6.11494 22.3382 5.96318 22.3718 5.79742C22.4053 5.63167 22.388 5.45965 22.3221 5.30391C22.2562 5.14817 22.1447 5.01598 22.0024 4.92465C21.8601 4.83333 21.6935 4.78713 21.5244 4.79211Z" fill="#1468b1"
              stroke="currentColor" stroke-width="2"/>
  </svg>
  `;
      } else {
        displayNotification(null, "REWARD");
        buttonTask.classList.remove("load-task-animation");
        buttonTask.classList.remove("load-task");
        if (task.taskUrl !== null) {
          buttonTask.textContent = "Выполнить";
        } else {
          buttonTask.textContent = "Проверить";
        }
      }
    } catch (error) {
      console.error("Не удалось проверить задание");
    }
  }
}

class ProfileUI {
  constructor(profileController) {
    this.profileController = profileController;

    this.tasksList = document.getElementById("tasks-list");
    this.coursesProgressBlock = document.getElementById(
      "courses-progress-block"
    );

    this.listProgress = [];
  }

  displayProgress(userInfo) {
    this.coursesProgressBlock.innerHTML = "";

    userInfo.coursesProgress.forEach((elem) => {
      const courseHtml = `<div >
    <div class="course-info-name">${elem.courseName}</div>
    <div class="course-info-frame-bar">
      <div class="course-info-bar">
        <div class="course-info-bar-progress" style="width: 0; transition: none;"></div>
      </div>
      <div class="course-info-percent">${elem.progress}%</div>
    </div>
    </div>
  `;
      this.listProgress.push(elem.progress);
      this.coursesProgressBlock.innerHTML += courseHtml;
    });
  }

  animateProgress() {
    let progressBarElements = this.coursesProgressBlock.querySelectorAll(
      ".course-info-bar-progress"
    );
    if (document.getElementById("preloader").style.display === "none") {
      requestAnimationFrame(() => {
        progressBarElements.forEach((currentProgressBar, index) => {
          setTimeout(() => {
            currentProgressBar.style.transition = "width 1s ease";
            currentProgressBar.style.width = `${this.listProgress[index]}%`;
          }, index * 300);
        });
      });
    }
  }

  displayNotProgress() {
    this.coursesProgressBlock.style.marginLeft = "0";
    const notProgressHtml = `<div class="progress-title-enable-courses">Вы не изучаете ни один курс</div>`;
    this.coursesProgressBlock.innerHTML = notProgressHtml;
  }

  taskButtonProcessing(task) {
    const buttonTask = document.getElementById(`task${task.taskId}`);
    if (buttonTask.textContent === "Проверить") {
      buttonTask.textContent = "";
      buttonTask.classList.add("load-task-animation");
      buttonTask.classList.add("load-task");
      this.profileController.checkTask(task);
    } else if (buttonTask.textContent === "Выполнить") {
      if (task.taskUrl) {
        window.open(task.taskUrl, "_blank");
      }
      buttonTask.textContent = "Проверить";
    }
  }

  displayTasks(tasksInfo) {
    const imageLoadPromises = [];
    tasksInfo.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");

      const button = document.createElement("div");
      button.classList.add("task-item-button");
      button.id = `task${task.taskId}`;
      if (task.taskUrl !== null) {
        button.textContent = "Выполнить";
      } else {
        button.textContent = "Проверить";
      }
      button.addEventListener("click", () => this.taskButtonProcessing(task));
      const buttonBlock = document.createElement("div");
      buttonBlock.classList.add("task-button-block");
      taskItem.innerHTML = `
          <div class="task-item-logo" style="background-image: url('${task.iconUrl}');"></div>
          <div class="task-item-text">
            <div class="task-item-name">${task.header}</div>
            <div class="task-item-description">+ ${task.reward} CUNA</div>
          </div>`;

      taskItem.append(buttonBlock);
      buttonBlock.append(button);
      this.tasksList.append(taskItem);
      const imageUrl = task.iconUrl;

      const imgLoadPromise = new Promise((resolve) => {
        if (imageUrl) {
          const img = new Image();
          img.src = imageUrl;
          img.onload = () => resolve(imageUrl);
          img.onerror = () => {
            console.error(`Ошибка загрузки изображения: ${imageUrl}`);
            resolve(imageUrl); // resolve даже при ошибке
          };
        } else {
          resolve();
        }
      });

      imageLoadPromises.push(imgLoadPromise);
    });

    Promise.all(imageLoadPromises)
      .then(() => {
        document.getElementById("preloader").style.display = "none";
        this.animateProgress();
      })
      .catch((url) => {
        console.error(
          `Ошибка при загрузке одного или нескольких изображений: ${url}`
        );
      });
  }

  displayNotTasks() {
    this.tasksList.style.marginTop = "10px";
    const notTasksHtml = `<div class="progress-title-enable-courses">Вы уже выполнили все задания</div>`;
    this.tasksList.innerHTML = notTasksHtml;
    document.getElementById("preloader").style.display = "none";
  }
}

class WalletController {
  constructor(userId, walletUI) {
    this.userId = userId;
    this.walletUI = walletUI;

    this.walletButtons = new WalletButtons(this, walletUI);
  }

  async getWalletInfo() {
    try {
      const walletInfo = await fetchData(`wallet/info`, "GET", {
        "X-User-Id": this.userId,
      });

      this.walletUI.displayDetailedWalletInfo(walletInfo);
      hasWalletInfo = true;
    } catch (error) {
      console.error("Ошибка при получении данных кошелька:", error);
    }
  }

  async disconnectWallet() {
    const responce = await fetchData(
      `wallet`,
      "DELETE",
      {
        "X-User-Id": this.userId,
      },
      null,
      false
    );

    return responce;
  }

  async connectWallet(address) {
    const body = {
      walletAddress: address,
    };
    try {
      const walletInfo = await fetchData(
        `wallet/connect`,
        "POST",
        {
          "X-User-Id": this.userId,
        },
        body
      );

      if (walletInfo) {
        return walletInfo;
      } else {
        throw Error;
      }
    } catch (error) {
      console.error(
        "Ошибка получения информации о кошельке:",
        error,
        error.status
      );
      return error.status;
    }
  }
}

class WalletUI {
  constructor() {
    this.walletBlock = document.getElementById("wallet-block");
    this.walletAddressElement = document.getElementById("wallet-address");
  }

  displayBaseWalletInfo(address) {
    this.walletBlock.classList.remove("not-connected");
    buttonConnectWallet.style.display = "none";
    addressBlock.style.display = "flex";
    walletButtonMenu.style.display = "flex";
    expandedContent.style.display = "flex";
    const userFriendlyAddress = address;
    this.walletAddressElement.textContent = `${userFriendlyAddress.slice(
      0,
      3
    )}...${userFriendlyAddress.slice(-3)}`;

    buttonCopyAddress.addEventListener("click", function (event) {
      event.stopPropagation();
      addressBlock.classList.remove("active");
      navigator.clipboard.writeText(userFriendlyAddress);
      displayNotification(null, "COPY");
    });
  }

  displayDetailedWalletInfo(walletInfo) {
    const loadPromises = [];
    const tokenBlocks = [];

    walletInfo.tokens
      .slice()
      .reverse()
      .forEach((token) => {
        const tokenBlock = document.querySelector(
          `.token-block[data-token="${token.name}"]`
        );
        if (!tokenBlock) return;
        tokenBlocks.push(tokenBlock);

        const logo = tokenBlock.querySelector(".token-logo");
        // Не скрываем overlay здесь, только создаём промис загрузки картинки
        if (logo && token.iconUrl) {
          const loadPromise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              logo.src = token.iconUrl;
              resolve();
            };
            img.onerror = () => {
              resolve();
            };
            img.src = token.iconUrl;
          });
          loadPromises.push(loadPromise);
        }
      });

    Promise.allSettled(loadPromises).then(() => {
      tokenBlocks.forEach((block) => {
        const overlay = block.querySelector(".loader-overlay");
        if (overlay) overlay.style.display = "none";
      });

      walletInfo.tokens
        .slice()
        .reverse()
        .forEach((token) => {
          const tokenBlock = document.querySelector(
            `.token-block[data-token="${token.name}"]`
          );
          if (!tokenBlock) return;

          const nameEl = tokenBlock.querySelector(".name");
          const balanceEl = tokenBlock.querySelector(".balance");
          const balanceUsdEl = tokenBlock.querySelector(".total-balance");

          if (nameEl) {
            nameEl.textContent = token.name;
            nameEl.classList.remove("loader");
          }

          if (balanceEl) {
            balanceEl.textContent = `${token.amount.toFixed(2)} ${
              token.symbol
            }`;
            balanceEl.classList.remove("loader");
          }

          if (balanceUsdEl) {
            balanceUsdEl.textContent = `${token.amountInUsd}$`;
            balanceUsdEl.classList.remove("loader");
          }
        });
    });
  }
}

class WalletButtons {
  constructor(walletController, walletUI) {
    this.walletController = walletController;
    this.walletUI = walletUI;

    this.modal = document.getElementById("modal");
    this.yesButton = document.getElementById("yesButton");
    this.noButton = document.getElementById("noButton");

    this._bindEvents();
  }

  _bindEvents() {
    buttonConnectWallet.addEventListener("click", async () => {
      buttonConnectWallet.innerHTML = "";
      buttonConnectWallet.classList.add("load-task-animation");
      buttonConnectWallet.classList.add("load-task");
      let walletInfo = null;
      try {
        const walletInfoTon = await tonConnectUI.connectWallet();
        walletInfo = await this.walletController.connectWallet(
          walletInfoTon.account.address
        );
      } catch {
        buttonConnectWallet.innerHTML = `<img src="icons/ton.png" />
            <span id="wallet-address">Подключить кошелек</span>`;
        buttonConnectWallet.classList.remove("load-task-animation");
        buttonConnectWallet.classList.remove("load-task");
      }

      if (walletInfo) {
        this.walletUI.displayBaseWalletInfo(walletInfo.address);
        this.walletUI.displayDetailedWalletInfo(walletInfo);
        hasWalletInfo = true;
        buttonConnectWallet.innerHTML = `<img src="icons/ton.png" />
            <span id="wallet-address">Подключить кошелек</span>`;
        buttonConnectWallet.classList.remove("load-task-animation");
        buttonConnectWallet.classList.remove("load-task");
      }
    });

    walletButtonMenu.addEventListener("click", () => {
      if (
        !walletButtonMenu.classList.contains("active") &&
        walletAddress !== null &&
        hasWalletInfo === false
      ) {
        this.walletController.getWalletInfo();
      }
      walletButtonMenu.classList.toggle("active");
      expandedContent.classList.toggle("active");
    });

    buttonDisconnectWallet.addEventListener("click", (event) => {
      event.stopPropagation();
      this.modal.style.display = "flex";
    });

    this.noButton.addEventListener("click", (event) => {
      event.stopPropagation();

      this.modal.style.display = "none";
    });

    this.yesButton.addEventListener("click", async () => {
      const responce = await this.walletController.disconnectWallet();
      this.modal.style.display = "none";
      if (responce === 200) {
        tonConnectUI.disconnect();
        this.walletUI.walletBlock.classList.add("not-connected");
        buttonConnectWallet.style.display = "flex";
        addressBlock.style.display = "none";
        walletButtonMenu.style.display = "none";
        expandedContent.style.display = "none";
      } else {
        alert("Не удалось отключить кошелек. Повторите попытку позже");
      }
    });

    addressBlock.addEventListener("click", () => {
      addressBlock.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
      if (this.modal.style.display !== "flex") {
        if (!addressBlock.contains(event.target)) {
          addressBlock.classList.remove("active");
        }
      }
      if (event.target === this.modal) {
        this.modal.style.display = "none";
      }
    });
  }
}

const walletButtonMenu = document.getElementById("wallet-button-menu");
const addressBlock = document.getElementById("address-block");
// const walletBalance = document.getElementById("wallet-balance");
const expandedContent = document.getElementById("expanded-content");
const buttonConnectWallet = document.getElementById("ton-connect");
const buttonDisconnectWallet = document.getElementById("button-disconnect");
const buttonCopyAddress = document.getElementById("button-copy");

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl:
    "https://gist.githubusercontent.com/YaNokavi/65fcf0123841bb4532ba22639d3dc620/raw/c167c5bbb5a4613a723f61ddedd89f025d6857aa/ton1.json",
});

let hasWalletInfo = false;

const popup = document.querySelector(".popup");
const popupBtn = document.getElementById("pop");
const popupBtnSvg = document.getElementById("popu");

const userIdProfile = document.querySelector(".profile-userid");
const logoNameProfile = document.querySelector(".profile-logo");
const usernameProfile = document.querySelector(".profile-nickname");

const tg = window.Telegram.WebApp;

const avatarUrl =
  tg.initDataUnsafe?.user?.photo_url ?? "tg.initDataUnsafe.user.photo_url";
const userId = tg.initDataUnsafe?.user?.id ?? 1;
const rawUsername = tg.initDataUnsafe?.user?.username;
const username = rawUsername ? DOMPurify.sanitize(rawUsername) : "User";

userIdProfile.innerText += userId;
logoNameProfile.style.backgroundImage = `url('${avatarUrl}')`;

const walletUI = new WalletUI();
const walletController = new WalletController(userId, walletUI);

const profileController = new ProfileController(userId, walletUI);
profileController.getUserInfo();
profileController.getTasks();

const setUserNameProfile = (name) => {
  let fontSize;

  if (name.length <= 15) {
    fontSize = "30px";
  } else if (name.length < 19) {
    fontSize = "24px";
  } else {
    name = name.slice(0, -2) + "...";
    fontSize = "23px";
  }

  usernameProfile.style.fontSize = fontSize;
  const sanitizedUserName = DOMPurify.sanitize(name);
  usernameProfile.innerText = sanitizedUserName;
};

setUserNameProfile(username);

let walletAddress = null;

const showPopup = () => {
  popup.style.display = "flex";
};

const hidePopup = () => {
  popup.classList.add("hide-popup");
  setTimeout(() => {
    popup.style.display = "none";
    popup.classList.remove("hide-popup");
  }, 300);
};

popupBtn.addEventListener("click", showPopup);

popupBtnSvg.addEventListener("click", (e) => {
  e.stopPropagation();
  showPopup();
});

document.addEventListener("click", (e) => {
  if (
    e.target !== popup &&
    !popup.contains(e.target) &&
    e.target !== popupBtn
  ) {
    hidePopup();
  }
});
