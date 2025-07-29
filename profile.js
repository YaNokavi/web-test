import fetchData from "./fetch.js";

const walletBlock = document.getElementById("wallet-block");
const walletAddressElement = document.getElementById("wallet-address");
const walletButtonMenu = document.getElementById("wallet-button-menu");
const addressBlock = document.getElementById("address-block");
// const walletBalance = document.getElementById("wallet-balance");
const expandedContent = document.getElementById("expanded-content");
const buttonConnectWallet = document.getElementById("ton-connect");
const buttonDisconnectWallet = document.getElementById("button-disconnect");
const buttonCopyAddress = document.getElementById("button-copy");

const tokenListBlock = document.getElementById("tokens-list-block");

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl:
    "https://gist.githubusercontent.com/YaNokavi/694c772e7931855a1c9afe3e9f1b851b/raw/d99b90f06c7466fde6d6f0a7a1bf5de711a59265/ton.json",
});

let hasWalletInfo = false;

buttonConnectWallet.addEventListener("click", async () => {
  buttonConnectWallet.innerHTML = "";
  buttonConnectWallet.classList.add("load-task-animation");
  buttonConnectWallet.classList.add("load-task");
  let walletInfo = null;
  try {
    const walletInfoTon = await tonConnectUI.connectWallet();
    walletInfo = await connectWallet(walletInfoTon.account.address);
  } catch {
    buttonConnectWallet.innerHTML = `<img src="icons/ton.png" />
            <span id="wallet-address">Подключить кошелек</span>`;
    buttonConnectWallet.classList.remove("load-task-animation");
    buttonConnectWallet.classList.remove("load-task");
  }

  if (walletInfo) {
    displayBaseWalletInfo(walletInfo.address);
    displayDetailedWalletInfo(walletInfo);
    hasWalletInfo = true;
    buttonConnectWallet.innerHTML = `<img src="icons/ton.png" />
            <span id="wallet-address">Подключить кошелек</span>`;
    buttonConnectWallet.classList.remove("load-task-animation");
    buttonConnectWallet.classList.remove("load-task");
  }
});

function displayBaseWalletInfo(address) {
  walletBlock.classList.remove("not-connected");
  buttonConnectWallet.style.display = "none";
  addressBlock.style.display = "flex";
  walletButtonMenu.style.display = "flex";
  expandedContent.style.display = "flex";
  const userFriendlyAddress = address;
  walletAddressElement.textContent = `${userFriendlyAddress.slice(
    0,
    3
  )}...${userFriendlyAddress.slice(-3)}`;

  buttonCopyAddress.addEventListener("click", function (event) {
    event.stopPropagation();
    navigator.clipboard.writeText(userFriendlyAddress);
    displayNotification(null, "COPY");
  });
}

function displayDetailedWalletInfo(walletInfo) {
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
          balanceEl.textContent = `${token.amount.toFixed(2)} ${token.symbol}`;
          balanceEl.classList.remove("loader");
        }

        if (balanceUsdEl) {
          balanceUsdEl.textContent = `${token.amountInUsd}$`;
          balanceUsdEl.classList.remove("loader");
        }
      });
  });
}

async function getWalletInfo() {
  try {
    const walletInfo = await fetchData(`wallet/info`, "GET", {
      "X-User-Id": userId,
    });

    displayDetailedWalletInfo(walletInfo);
    hasWalletInfo = true;
  } catch (error) {
    console.error("Ошибка при получении данных кошелька:", error);
  }
}

walletButtonMenu.addEventListener("click", function () {
  if (
    !this.classList.contains("active") &&
    walletAddress !== null &&
    hasWalletInfo === false
  ) {
    getWalletInfo();
  }
  this.classList.toggle("active");
  expandedContent.classList.toggle("active");
});

async function disconnectWallet() {
  const responce = await fetchData(
    `wallet`,
    "DELETE",
    {
      "X-User-Id": userId,
    },
    null,
    false
  );

  return responce;
}

buttonDisconnectWallet.addEventListener("click", async function (event) {
  event.stopPropagation();
  modal.style.display = "block";
});

const modal = document.getElementById("modal");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

noButton.addEventListener("click", function () {
  modal.style.display = "none";
});

yesButton.addEventListener("click", async function () {
  const responce = await disconnectWallet();
  modal.style.display = "none";
  if (responce === 200) {
    tonConnectUI.disconnect();
    walletBlock.classList.add("not-connected");
    buttonConnectWallet.style.display = "flex";
    addressBlock.style.display = "none";
    walletButtonMenu.style.display = "none";
    expandedContent.style.display = "none";
  } else {
    alert("Не удалось отключить кошелек. Повторите попытку позже");
  }
});

addressBlock.addEventListener("click", function () {
  this.classList.toggle("active");
});

document.addEventListener("click", function (event) {
  if (modal.style.display !== "block") {
    if (!addressBlock.contains(event.target)) {
      addressBlock.classList.remove("active");
    }
  }
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

const popup = document.querySelector(".popup");
const popupBtn = document.getElementById("pop");
const popupBtnSvg = document.getElementById("popu");
const balanceText = document.getElementById("balance");
const userIdProfile = document.querySelector(".profile-userid");
const logoNameProfile = document.querySelector(".profile-logo");
const usernameProfile = document.querySelector(".profile-nickname");
const course = document.getElementById("course-info");

const tg = window.Telegram.WebApp;

const avatarUrl =
  tg.initDataUnsafe?.user?.photo_url ?? "tg.initDataUnsafe.user.photo_url";
const userId = tg.initDataUnsafe?.user?.id ?? 1;
const rawUsername = tg.initDataUnsafe?.user?.username;
const username = rawUsername ? DOMPurify.sanitize(rawUsername) : "User";

userIdProfile.innerText += userId;
logoNameProfile.style.backgroundImage = `url('${avatarUrl}')`;

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
  // usernameProfile.innerText = name;
};

setUserNameProfile(username);

async function connectWallet(address) {
  const body = {
    walletAddress: address,
  };
  try {
    const walletInfo = await fetchData(
      `wallet/connect`,
      "POST",
      {
        "X-User-Id": userId,
      },
      body
    );
    console.log(walletInfo);
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
  }
}

let walletAddress = null;
async function getUserInfo() {
  const userInfo = await fetchData(`user/profile/info`, "GET", {
    "X-User-Id": userId,
  });

  const formattedBalance = Number.isInteger(userInfo.cunaTokenBalance)
    ? userInfo.cunaTokenBalance.toString()
    : userInfo.cunaTokenBalance.toFixed(2);

  balanceText.innerText = formattedBalance;

  document.getElementById(
    "balance-cuna"
  ).innerHTML = `${formattedBalance} CUNA`;

  if (userInfo.walletAddress) {
    walletAddress = userInfo.walletAddress;
    displayBaseWalletInfo(walletAddress);
  }

  if (userInfo.coursesProgress.length != 0) {
    displayProgress(userInfo);
  } else {
    displayNotProgress();
  }
}

async function getTasks() {
  await getUserInfo();
  const tasksInfo = await fetchData(`task/all`, "GET", {
    "X-User-Id": userId,
  });

  tasksInfo.length !== 0 ? displayTasks(tasksInfo) : displayNotTasks();
}

getTasks();

async function checkTask(task) {
  const taskCheckInfo = await fetchData(
    `task/${task.taskId}/completed`,
    "POST",
    { "X-User-Id": userId }
  );

  const buttonTask = document.getElementById(`task${task.taskId}`);
  if (taskCheckInfo) {
    buttonTask.classList.remove("load-task-animation");
    buttonTask.classList.remove("load-task");
    displayNotification(taskCheckInfo.reward, "REWARD");
    balanceText.innerText = taskCheckInfo.newBalance.toFixed(2);
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
}

function taskButtonProcessing(task) {
  const buttonTask = document.getElementById(`task${task.taskId}`);
  if (buttonTask.textContent === "Проверить") {
    buttonTask.textContent = "";
    buttonTask.classList.add("load-task-animation");
    buttonTask.classList.add("load-task");
    checkTask(task);
  } else if (buttonTask.textContent === "Выполнить") {
    if (task.taskUrl) {
      window.open(task.taskUrl, "_blank");
    }
    buttonTask.textContent = "Проверить";
  }
}

const tasksList = document.getElementById("tasks-list");
function displayTasks(tasksInfo) {
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
    button.addEventListener("click", () => taskButtonProcessing(task));
    const buttonBlock = document.createElement("div");
    buttonBlock.classList.add("task-button-block");
    taskItem.innerHTML = `
          <div class="task-item-logo" style="background-image: url('${task.iconUrl}');"></div>
          <div class="task-item-name">${task.header}
              <div class="task-item-description">+ ${task.reward} CUNA</div>
          </div>`;

    taskItem.append(buttonBlock);
    buttonBlock.append(button);
    tasksList.append(taskItem);
    const imageUrl = task.iconUrl;

    const imgLoadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageUrl;

      img.onload = () => {
        resolve(imageUrl);
      };

      img.onerror = () => {
        console.error(`Ошибка загрузки изображения: ${imageUrl}`);
        reject(imageUrl);
      };
    });

    imageLoadPromises.push(imgLoadPromise);
  });

  Promise.all(imageLoadPromises)
    .then(() => {
      document.getElementById("preloader").style.display = "none";
      animateProgress();
    })
    .catch((url) => {
      console.error(
        `Ошибка при загрузке одного или нескольких изображений: ${url}`
      );
    });
}

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

let listProgress = [];
function displayProgress(userInfo) {
  course.innerHTML = "";

  userInfo.coursesProgress.forEach((elem) => {
    const courseHtml = `
    <div class="course-info-name">${elem.courseName}</div>
    <div class="course-info-frame-bar">
      <div class="course-info-bar">
        <div class="course-info-bar-progress" style="width: 0; transition: none;"></div>
      </div>
      <div class="course-info-percent">${elem.progress}%</div>
    </div>
  `;
    listProgress.push(elem.progress);
    course.innerHTML += courseHtml;
  });
}

function animateProgress() {
  let progressBarElements = course.querySelectorAll(
    ".course-info-bar-progress"
  );
  if (document.getElementById("preloader").style.display === "none") {
    requestAnimationFrame(() => {
      progressBarElements.forEach((currentProgressBar, index) => {
        setTimeout(() => {
          currentProgressBar.style.transition = "width 1s ease";
          currentProgressBar.style.width = `${listProgress[index]}%`;
        }, index * 300);
      });
    });
  }
}

function displayNotProgress() {
  course.style.marginLeft = "0";
  const notProgressHtml = `<div class="progress-title-enable-courses">Вы не изучаете ни один курс</div>`;
  course.innerHTML = notProgressHtml;
}

function displayNotTasks() {
  tasksList.style.marginTop = "10px";
  const notTasksHtml = `<div class="progress-title-enable-courses">Вы уже выполнили все задания</div>`;
  tasksList.innerHTML = notTasksHtml;
  document.getElementById("preloader").style.display = "none";
}

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
