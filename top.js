import fetchData from "./fetch.js";

class TopController {
  constructor(userId) {
    this.userId = userId;

    this.topUI = new TopUI("list", "timer");
  }

  async getTopUsers() {
    try {
      const topUsers = await fetchData(`event/student-competition`, "GET", {
        "X-User-Id": this.userId,
      });

      this.topUI.startCountdown(topUsers.eventEndDate);
      this.topUI.displayTopUsers(topUsers);
    } catch (error) {
      console.error("Ошибка при загрузке знатоков:", error);
      alert("Не удалось получить топ знатоков, попробуйте позже");
    }
  }
}

class TopUI {
  constructor(blockUsersId, blockTimerId) {
    this.blockUsersId = document.getElementById(blockUsersId);
    this.blockTimerId = document.getElementById(blockTimerId);

    this.buttons = new TopButtons();
  }

  startCountdown(endDate) {
    const countDownDate = new Date(endDate).getTime();
    const timerElement = this.blockTimerId;
    const preloader = document.getElementById("preloader");

    this.intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      if (distance < 0) {
        clearInterval(this.intervalId);
        timerElement.innerHTML = "Награды уже в пути!";
        preloader.style.display = "none";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      let displayString = "";
      if (days > 0) displayString += days + "д ";
      if (hours > 0 || days > 0) displayString += hours + "ч ";
      if (minutes > 0 || hours > 0 || days > 0) displayString += minutes + "м ";
      displayString += seconds + "с";

      timerElement.innerHTML = displayString;
      if (window.getComputedStyle(preloader).display === "flex")
        preloader.style.display = "none";
    }, 1000);
  }

  displayTopUsers(topUsers) {
    let placeClass;
    if (topUsers.userPlace === 1) {
      placeClass = "first";
    } else if (topUsers.userPlace === 2) {
      placeClass = "second";
    } else if (topUsers.userPlace === 3) {
      placeClass = "third";
    } else {
      placeClass = "";
    }
    const listFriends = this.blockUsersId;
    listFriends.innerHTML = "";
    const listUser = document.createElement("div");
    listUser.classList.add("list-user");
    listUser.innerHTML = `
              <div class="friends-list-block-logo-info">
                <div class="friends-list-user-logo" style="background-image: url('${avatarUrl}')"></div>
                <div class="friends-list-user-info">
                  <div class="friends-list-user-info-name">${DOMPurify.sanitize(
                    username
                  )}</div>
                  <div class="friends-list-user-info-balance">
                    <div class="friends-list-user-info-balance-text">${
                      topUsers.userBalance
                    }</div>
                    <div class="friends-list-user-info-balance-logo"></div>
                  </div>
                </div>
              </div>
              <div class="list-user-rating">
                <div class="">Рейтинг</div>
                <div class="list-user-rating-place ${placeClass}">${
      topUsers.userPlace
    }</div></div>`;
    listFriends.append(listUser);

    topUsers.userRatingList.reverse().forEach((item) => {
      let placeClass;
      if (item.place === 1) {
        item.rewardAmount += "$";
        placeClass = "first";
      } else if (item.place === 2) {
        item.rewardAmount += "$";
        placeClass = "second";
      } else if (item.place === 3) {
        item.rewardAmount += "$";
        placeClass = "third";
      } else {
        item.rewardAmount = "";
        placeClass = "";
      }
      const list = document.createElement("div");
      list.classList.add("friends-list-user");
      list.innerHTML = `
            <div class="list-user-place ${placeClass}" >${item.place}</div>
            <div class="friends-list-block-logo-info">
              <div class="friends-list-user-logo" style="background-image: url('${
                item.avatarUrl
              }')"></div>
              <div class="friends-list-user-info">
                <div class="friends-list-user-info-name">${DOMPurify.sanitize(
                  item.username
                )}</div>
                <div class="friends-list-user-info-balance">
                  <div class="friends-list-user-info-balance-text">${
                    item.userBalance
                  }</div>
                  <div class="friends-list-user-info-balance-logo"></div>
                </div>
              </div>
            </div>
            <div class="list-user-reward">${item.rewardAmount}</div>
   `;

      listFriends.append(list);
    });
  }
}

class TopButtons {
  constructor() {
    this.modal = document.getElementById("modal");
    this.popupBtn = document.getElementById("pop");
    this.popupBtnSvg = document.getElementById("popu");
    this.modalButtonOk = document.getElementById("okButton");

    this._bindEvents();
  }

  _bindEvents() {
    this.popupBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      this.showModal(true);
    });

    this.popupBtnSvg.addEventListener("click", (event) => {
      event.stopPropagation();
      this.showModal(true);
    });

    document.addEventListener("click", (event) => {
      if (event.target === modal) {
        this.showModal(false);
      }
    });

    this.modalButtonOk.addEventListener("click", () => {
      this.showModal(false);
    });
  }

  showModal(show) {
    this.modal.style.display = show ? "block" : "none";
  }
}

const avatarUrl =
  tg.initDataUnsafe?.user?.photo_url ?? "tg.initDataUnsafe.user.photo_url";
const userId = tg.initDataUnsafe?.user?.id ?? 1;
const rawUsername = tg.initDataUnsafe?.user?.username;
const username = rawUsername ? DOMPurify.sanitize(rawUsername) : "User";

const top = new TopController(userId);
top.getTopUsers();
