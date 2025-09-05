import fetchData from "./fetch.js";

class FriendsController {
  constructor(userId) {
    this.userId = userId;

    this.friendsUI = new FriendsUI(
      "friends",
      "list-referrals-top",
      "timer",
      this.userId
    );
  }

  async getReferrals() {
    try {
      const referrals = await fetchData(`user/referrals`, "GET", {
        "X-User-Id": this.userId,
      });

      referrals.length
        ? this.friendsUI.displayFriendsNotNull(referrals)
        : this.friendsUI.displayFriendsNull();
    } catch (error) {
      console.error("Не удалось получить список друзей", error, error.status);
    }
  }

  async getTopUsers() {
    try {
      const topUsers = await fetchData(`event/referral-competition`, "GET", {
        "X-User-Id": this.userId,
      });

      this.friendsUI.startCountdown(topUsers.eventEndDate);
      this.friendsUI.displayTopUsers(topUsers);
    } catch (error) {
      console.error("Не удалось получить топ рефералов", error, error.status);
    }
  }
}

class FriendsUI {
  constructor(referralsContainer, topUsersContainer, blockTimerId, userId) {
    this.referralsContainer = document.getElementById(referralsContainer);
    this.topUsersContainer = document.getElementById(topUsersContainer);
    this.blockTimerId = document.getElementById(blockTimerId);
    this.userId = userId;

    this.buttons = new FriendsButtons();
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

  displayTopUsers({ currentUserInfo, userRatingList }) {
    console.log(currentUserInfo);
    let placeClass;
    if (currentUserInfo.place === 1) {
      placeClass = "first";
    } else if (currentUserInfo.place === 2) {
      placeClass = "second";
    } else if (currentUserInfo.place === 3) {
      placeClass = "third";
    } else {
      placeClass = "";
    }

    const listFriends = this.topUsersContainer;
    const listUser = document.createElement("div");
    listUser.classList.add("list-user");
    listUser.innerHTML = `
  
              <div class="friends-list-block-logo-info">
                <div class="friends-list-user-logo" style="background-image: url('${avatarUrl}')"></div>
                <div class="friends-list-user-info">
                  <div class="friends-list-user-info-name">${username}</div>
                  <div class="friends-list-user-info-data">
                    <div class="friends-list-user-info-balance">
                      <div class="friends-list-user-info-balance-text">${currentUserInfo.userEventScore}</div>
                      <div class="friends-list-user-info-balance-logo"></div>
                    </div>
                    <div class="friends-list-user-info-balance">
                      <div class="friends-list-user-info-balance-text">${currentUserInfo.referralsNumber}</div>
                        <svg class="friends-list-user-info-balance-icon" width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clip-path="url(#clip0_51_711)">
                            <path d="M19.9584 24.5V22.1667C19.9584 20.929 19.4667 19.742 18.5916 18.8668C17.7164 17.9917 16.5294 17.5 15.2917 17.5H5.95841C4.72074 17.5 3.53375 17.9917 2.65858 18.8668C1.78341 19.742 1.29175 20.929 1.29175 22.1667V24.5"
                             stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M10.6249 12.8333C13.2022 12.8333 15.2916 10.744 15.2916 8.16667C15.2916 5.58934 13.2022 3.5 10.6249 3.5C8.04759 3.5 5.95825 5.58934 5.95825 8.16667C5.95825 10.744 8.04759 12.8333 10.6249 12.8333Z"
                             stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M26.9583 24.4999V22.1666C26.9575 21.1326 26.6133 20.1282 25.9798 19.311C25.3464 18.4938 24.4594 17.9101 23.4583 17.6516" 
                            stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M18.7917 3.65161C19.7956 3.90863 20.6853 4.49243 21.3207 5.31097C21.956 6.12952 22.3009 7.13625 22.3009 8.17244C22.3009 9.20864 21.956 10.2154 21.3207 11.0339C20.6853 11.8525 19.7956 12.4363 18.7917 12.6933" 
                            stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"></path>
                          </g>
                        </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div class="list-user-rating">
                <div class="">Рейтинг</div>
                <div class="list-user-rating-place ${placeClass}">${currentUserInfo.place}</div>
              </div>
            
          
          `;
    listFriends.append(listUser);

    userRatingList.forEach((item) => {
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
              <div class="friends-list-user-logo"></div>
              <div class="friends-list-user-info">
                <div class="friends-list-user-info-name">${DOMPurify.sanitize(
                  item.username
                )}</div>
                  <div class="friends-list-user-info-data">
                    <div class="friends-list-user-info-balance">
                      <div class="friends-list-user-info-balance-text">${
                        item.userEventScore
                      }</div>
                      <div class="friends-list-user-info-balance-logo"></div>
                    </div>
                    <div class="friends-list-user-info-balance">
                      <div class="friends-list-user-info-balance-text">${
                        item.referralsNumber
                      }</div>
                        <svg class="friends-list-user-info-balance-icon" width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clip-path="url(#clip0_51_711)">
                            <path d="M19.9584 24.5V22.1667C19.9584 20.929 19.4667 19.742 18.5916 18.8668C17.7164 17.9917 16.5294 17.5 15.2917 17.5H5.95841C4.72074 17.5 3.53375 17.9917 2.65858 18.8668C1.78341 19.742 1.29175 20.929 1.29175 22.1667V24.5"
                             stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M10.6249 12.8333C13.2022 12.8333 15.2916 10.744 15.2916 8.16667C15.2916 5.58934 13.2022 3.5 10.6249 3.5C8.04759 3.5 5.95825 5.58934 5.95825 8.16667C5.95825 10.744 8.04759 12.8333 10.6249 12.8333Z"
                             stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M26.9583 24.4999V22.1666C26.9575 21.1326 26.6133 20.1282 25.9798 19.311C25.3464 18.4938 24.4594 17.9101 23.4583 17.6516" 
                            stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M18.7917 3.65161C19.7956 3.90863 20.6853 4.49243 21.3207 5.31097C21.956 6.12952 22.3009 7.13625 22.3009 8.17244C22.3009 9.20864 21.956 10.2154 21.3207 11.0339C20.6853 11.8525 19.7956 12.4363 18.7917 12.6933" 
                            stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"></path>
                          </g>
                        </svg>
                    </div>
                  </div>
              </div>
            </div>
            <div class="list-user-reward">${item.rewardAmount}</div>
   `;
      listFriends.append(list);

      const logoDiv = list.querySelector(".friends-list-user-logo");
      if (item.avatarUrl) {
        logoDiv.style.backgroundImage = `url('${item.avatarUrl}')`;
        logoDiv.style.backgroundColor = "";
      } else {
        logoDiv.innerText = item.username[0].toUpperCase();
        logoDiv.style.backgroundImage = "none";
        logoDiv.style.backgroundColor = "#e04646";
      }
    });
  }

  displayFriendsNull() {
    this.referralsContainer.innerHTML = "";

    this.referralsContainer.innerHTML = `
  <div class="block friends-block-null">
        <img
          src="gif/octopus(miidle)_compressed.gif"
          style="height: 140px; width: 140px;"
        />
        <div class="friends-block-null-text">
          Приглашай друзей и получай больше Cuna-токенов
        </div>
        <div class="friends-block-null-text-down">
          За каждого приглашенного друга по твоей ссылке ты получишь 5% от его заработанных токенов
          CUNA
        </div>
      </div>
<div class="friends-block-button-container">
      <div class="friends-block-button" id="invite">
        <div class="friends-block-button-text">Пригласить друга</div>
        <svg
          class="friends-block-button-icon"
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.9996 19.5001V16.7917M19.9996 19.5001V22.2084M19.9996 19.5001H17.2913M19.9996 19.5001H22.7079M16.7496 15.3012C15.7543 14.8663 14.6552 14.6251 13.4996 14.6251C9.75364 14.6251 6.59975 17.1601 5.65991 20.6082C5.34524 21.7627 6.34469 22.7501 7.5413 22.7501H14.5829M17.2913 7.58341C17.2913 9.6775 15.5937 11.3751 13.4996 11.3751C11.4055 11.3751 9.70797 9.6775 9.70797 7.58341C9.70797 5.48933 11.4055 3.79175 13.4996 3.79175C15.5937 3.79175 17.2913 5.48933 17.2913 7.58341Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <div class="friends-block-button" id="copy">
        <div class="friends-block-button-text">Скопировать ссылку</div>
        <svg
          class="friends-block-button-icon"
          id="svg1"
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.75 19.4998V20.5832C16.75 21.7799 15.78 22.7499 14.5833 22.7499H5.91667C4.72005 22.7499 3.75 21.7799 3.75 20.5832V11.9164C3.75 10.7199 4.71999 9.74984 5.91658 9.7498L7 9.74976M16.75 9.74989V7.04155M16.75 9.74989V12.4582M16.75 9.74989H14.0417M16.75 9.74989H19.4583M12.4167 3.24976H21.0833C22.28 3.24976 23.25 4.2198 23.25 5.41642V14.0831C23.25 15.2797 22.28 16.2498 21.0833 16.2498H12.4167C11.22 16.2498 10.25 15.2797 10.25 14.0831V5.41642C10.25 4.2198 11.22 3.24976 12.4167 3.24976Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg
          class="friends-block-button-icon"
          id="svg2"
          style="display: none;"
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.5244 4.79211C22.3064 4.79861 22.0995 4.88973 21.9475 5.04616L9.114 17.8797L3.83309 12.5987C3.75576 12.5182 3.66314 12.4539 3.56065 12.4096C3.45817 12.3653 3.34787 12.3419 3.23623 12.3408C3.12458 12.3396 3.01383 12.3608 2.91047 12.403C2.8071 12.4452 2.71319 12.5076 2.63424 12.5866C2.55529 12.6655 2.49289 12.7594 2.45069 12.8628C2.40849 12.9661 2.38734 13.0769 2.38847 13.1885C2.38961 13.3002 2.41301 13.4105 2.4573 13.513C2.5016 13.6155 2.5659 13.7081 2.64644 13.7854L8.52067 19.6596C8.67806 19.8169 8.89147 19.9053 9.114 19.9053C9.33652 19.9053 9.54994 19.8169 9.70732 19.6596L23.1341 6.23281C23.2554 6.11494 23.3382 5.96318 23.3718 5.79742C23.4053 5.63167 23.388 5.45965 23.3221 5.30391C23.2562 5.14817 23.1447 5.01598 23.0024 4.92465C22.8601 4.83333 22.6935 4.78713 22.5244 4.79211Z"
            fill="currentColor"
            stroke="currentColor"
          />
        </svg>
        </div>
      </div>
  `;
    this.buttons.bindDynamicButtons(this.userId);
    document.getElementById("preloader").style.display = "none";
  }

  displayFriendsNotNull(referrals) {
    this.referralsContainer.innerHTML = "";
    this.referralsContainer.innerHTML = `
    <div class="block friends-block-not-null">
        <div class="friends-block-not-null-text">Приглашенные друзья
          <div class="friends-block-not-null-amount">${referrals.length}</div>
        </div>
        <div class="friends-block-not-null-text-down">
          За каждого приглашенного друга по твоей ссылке ты получишь 5% от его заработанных токенов
          CUNA
        </div>
        <div class="friends-block-not-null-list" id="list">
        </div>
      </div>
      <div class="friends-block-button-container not-null">
        <div class="friends-block-button" id="invite">
          <div class="friends-block-button-text">Пригласить друга</div>
          <svg
            class="friends-block-button-icon"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.9996 19.5001V16.7917M19.9996 19.5001V22.2084M19.9996 19.5001H17.2913M19.9996 19.5001H22.7079M16.7496 15.3012C15.7543 14.8663 14.6552 14.6251 13.4996 14.6251C9.75364 14.6251 6.59975 17.1601 5.65991 20.6082C5.34524 21.7627 6.34469 22.7501 7.5413 22.7501H14.5829M17.2913 7.58341C17.2913 9.6775 15.5937 11.3751 13.4996 11.3751C11.4055 11.3751 9.70797 9.6775 9.70797 7.58341C9.70797 5.48933 11.4055 3.79175 13.4996 3.79175C15.5937 3.79175 17.2913 5.48933 17.2913 7.58341Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="friends-block-button link-not-null" id="copy">
          <svg
            style="color: var(--theme-button-icon-text-color)"
            id="svg1"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.75 19.4998V20.5832C16.75 21.7799 15.78 22.7499 14.5833 22.7499H5.91667C4.72005 22.7499 3.75 21.7799 3.75 20.5832V11.9164C3.75 10.7199 4.71999 9.74984 5.91658 9.7498L7 9.74976M16.75 9.74989V7.04155M16.75 9.74989V12.4582M16.75 9.74989H14.0417M16.75 9.74989H19.4583M12.4167 3.24976H21.0833C22.28 3.24976 23.25 4.2198 23.25 5.41642V14.0831C23.25 15.2797 22.28 16.2498 21.0833 16.2498H12.4167C11.22 16.2498 10.25 15.2797 10.25 14.0831V5.41642C10.25 4.2198 11.22 3.24976 12.4167 3.24976Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <svg
            id="svg2"
            style="display: none; color: var(--theme-button-icon-text-color);"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.5244 4.79211C22.3064 4.79861 22.0995 4.88973 21.9475 5.04616L9.114 17.8797L3.83309 12.5987C3.75576 12.5182 3.66314 12.4539 3.56065 12.4096C3.45817 12.3653 3.34787 12.3419 3.23623 12.3408C3.12458 12.3396 3.01383 12.3608 2.91047 12.403C2.8071 12.4452 2.71319 12.5076 2.63424 12.5866C2.55529 12.6655 2.49289 12.7594 2.45069 12.8628C2.40849 12.9661 2.38734 13.0769 2.38847 13.1885C2.38961 13.3002 2.41301 13.4105 2.4573 13.513C2.5016 13.6155 2.5659 13.7081 2.64644 13.7854L8.52067 19.6596C8.67806 19.8169 8.89147 19.9053 9.114 19.9053C9.33652 19.9053 9.54994 19.8169 9.70732 19.6596L23.1341 6.23281C23.2554 6.11494 23.3382 5.96318 23.3718 5.79742C23.4053 5.63167 23.388 5.45965 23.3221 5.30391C23.2562 5.14817 23.1447 5.01598 23.0024 4.92465C22.8601 4.83333 22.6935 4.78713 22.5244 4.79211Z"
              fill="currentColor"
              stroke="currentColor"
            />
          </svg>
        </div>
      </div>
  `;

    const listFriends = document.getElementById("list");
    referrals.forEach((item) => {
      const list = document.createElement("div");
      list.classList.add("friends-list-user");

      list.innerHTML = `
      <div class="friends-list-block-logo-info">
              <div class="friends-list-user-logo"></div>
              <div class="friends-list-user-info">
                <div class="friends-list-user-info-name">${DOMPurify.sanitize(
                  item.name
                )}</div>
                <div class="friends-list-user-info-balance">
                  <div class="friends-list-user-info-balance-text">${
                    item.balance
                  }</div>
                  <div class="friends-list-user-info-balance-logo"></div>
                </div>
                </div>
              </div>
     `;
      listFriends.append(list);

      const logoDiv = list.querySelector(".friends-list-user-logo");
      if (item.avatarUrl) {
        logoDiv.style.backgroundImage = `url('${item.avatarUrl}')`;
        logoDiv.style.backgroundColor = "";
      } else {
        logoDiv.innerText = item.name[0].toUpperCase();
        logoDiv.style.backgroundImage = "none";
        logoDiv.style.backgroundColor = "#e04646";
      }
    });
    this.buttons.bindDynamicButtons(this.userId);

    document.getElementById("preloader").style.display = "none";
  }
}

class FriendsButtons {
  constructor() {
    this.modal = document.getElementById("modal");
    this.popupBtn = document.getElementById("pop");
    this.popupBtnSvg = document.getElementById("popu");
    this.modalButtonOk = document.getElementById("okButton");

    this._bindStaticEvents();
  }

  _bindStaticEvents() {
    this.popupBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      this.showModal(true);
    });

    this.popupBtnSvg.addEventListener("click", (event) => {
      event.stopPropagation();
      this.showModal(true);
    });

    document.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.showModal(false);
      }
    });

    this.modalButtonOk.addEventListener("click", () => {
      this.showModal(false);
    });
  }

  bindDynamicButtons(userId) {
    const buttonInvite = document.getElementById("invite");
    const buttonCopy = document.getElementById("copy");

    if (buttonInvite) {
      buttonInvite.addEventListener("click", () => {
        const link = `https://t.me/cunaedu_bot/CunaEdu?startapp=${userId}`;
        const text = encodeURIComponent(
          "Узнавай новое вместе со мной (@cryptuna)"
        );
        const url = encodeURIComponent(link);
        window.location.href = `https://t.me/share/url?url=${url}&text=${text}`;
      });
    }

    if (buttonCopy) {
      buttonCopy.addEventListener("click", () => {
        const link = `https://t.me/cunaedu_bot/CunaEdu?startapp=${userId}`;
        navigator.clipboard.writeText(link);

        const svg1 = document.getElementById("svg1");
        const svg2 = document.getElementById("svg2");

        if (svg1.style.display !== "none") {
          svg1.style.animation = "fade-out 0.2s forwards";
          setTimeout(() => {
            svg1.style.display = "none";
            svg2.style.display = "block";
            svg2.style.animation = "fade-in 0.2s forwards";

            setTimeout(() => {
              svg2.style.animation = "fade-out 0.2s forwards";
              setTimeout(() => {
                svg2.style.display = "none";
                svg1.style.display = "block";
                svg1.style.animation = "fade-in 0.2s forwards";
              }, 200);
            }, 2000);
          }, 200);
        }

        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred("success");
        }
      });
    }
  }

  showModal(show) {
    this.modal.style.display = show ? "block" : "none";
  }
}

const tg = window.Telegram.WebApp;

const avatarUrl =
  tg.initDataUnsafe?.user?.photo_url ?? "tg.initDataUnsafe.user.photo_url";
// const userId = tg.initDataUnsafe?.user?.id ?? 1;
const userId = tg.initDataUnsafe?.user?.id ?? 535799793;
const rawUsername = tg.initDataUnsafe?.user?.username;
const username = rawUsername ? DOMPurify.sanitize(rawUsername) : "User";

const friends = new FriendsController(userId);
friends.getReferrals();
friends.getTopUsers();
