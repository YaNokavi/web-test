import fetchData from "./fetch.js";

const tg = window.Telegram.WebApp;

const avatarUrl =
  tg.initDataUnsafe?.user?.photo_url ?? "tg.initDataUnsafe.user.photo_url";
const userId = tg.initDataUnsafe?.user?.id ?? 1;
const rawUsername = tg.initDataUnsafe?.user?.username;
const username = rawUsername ? DOMPurify.sanitize(rawUsername) : "User";


async function getReferrals() {
  const referrals = await fetchData(`user/referrals`, "GET", {"X-User-Id": userId});

  referrals.length ? displayFriendsNotNull(referrals) : displayFriendsNull();
}

getReferrals();

function startCountdown(endDate) {
  var countDownDate = new Date(endDate).getTime();

  var x = setInterval(function () {
    // Получение текущей даты и времени
    var now = new Date().getTime();

    // Расчёт оставшегося времени
    var distance = countDownDate - now;

    // Расчёт дней, часов, минут и секунд
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Отображение результата
    let displayString = "";
    if (days > 0) displayString += days + "д ";
    if (hours > 0 || days > 0) displayString += hours + "ч "; // Show hours if there are days
    if (minutes > 0 || hours > 0 || days > 0) displayString += minutes + "м "; // Show minutes if there are hours or days
    displayString += seconds + "с";

    // Update the timer display
    document.getElementById("timer").innerHTML = displayString;

    // Если таймер истёк, отображение сообщения
    document.getElementById("preloader").style.display = "none";
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("timer").innerHTML = "Награды уже в пути!";
    }
  }, 1000);
}

async function getTopUsers() {
  const topUsers = await fetchData(
    `event/referral-competition`, "GET", {"X-User-Id": userId}
  );

  startCountdown(topUsers.eventEndDate);
  displayTopUsers(topUsers);
}

getTopUsers();

function displayTopUsers(topUsers) {
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

  const listFriends = document.getElementById("list-referrals-top");
  const listUser = document.createElement("div");
  listUser.classList.add("list-user");
  listUser.innerHTML = `
  
              <div class="friends-list-block-logo-info">
                <div class="friends-list-user-logo" style="background-image: url('${avatarUrl}')"></div>
                <div class="friends-list-user-info">
                  <div class="friends-list-user-info-name">${username}</div>
                  <div class="friends-list-user-info-balance">
                    <div class="friends-list-user-info-balance-text">${topUsers.userBalance}</div>
                    <div class="friends-list-user-info-balance-logo"></div>
                  </div>
                </div>
              </div>
              <div class="list-user-rating">
                <div class="">Рейтинг</div>
                <div class="list-user-rating-place ${placeClass}">${topUsers.userPlace}</div>
              </div>
            
          
          `;
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

    if (item.avatarUrl !== null) {
      list.innerHTML = `
            <div class="list-user-place ${placeClass}" >${item.place}</div>
            <div class="friends-list-block-logo-info">
              <div class="friends-list-user-logo" style="background-image: url('${item.avatarUrl}')"></div>
              <div class="friends-list-user-info">
                <div class="friends-list-user-info-name">${item.username}</div>
                <div class="friends-list-user-info-balance">
                  <div class="friends-list-user-info-balance-text">${item.userBalance}</div>
                  <div class="friends-list-user-info-balance-logo"></div>
                </div>
              </div>
            </div>
            <div class="list-user-reward">${item.rewardAmount}</div>
   `;
    } else {
      list.innerHTML = `
            <div class="list-user-place ${placeClass}" >${item.place}</div>
            <div class="friends-list-block-logo-info">
              <div class="friends-list-user-logo" style="background: #e04646;">${item.username[0].toUpperCase()}</div>
              <div class="friends-list-user-info">
                <div class="friends-list-user-info-name">${item.username}</div>
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
    }
    listFriends.append(list);
  });
}

function displayFriendsNull() {
  const main = document.getElementById("friends");
  main.innerHTML = "";

  main.innerHTML = `
  <div class="friends-block-null">
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
<div class="friends-block-null-button-container">
      <div class="friends-block-null-button-invite" id="invite">
        <div class="friends-block-null-button-text">Пригласить друга</div>
        <svg
          class="friends-block-null-button-icon"
          style="margin-left: 1px"
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
      <div class="friends-block-null-button-link" id="copy">
        <div class="friends-block-null-button-text">Скопировать ссылку</div>
        <svg
          class="friends-block-null-button-icon"
          id="svg1"
          style="margin-left: 5px"
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
          class="friends-block-null-button-icon"
          id="svg2"
          style="display: none; margin-left: 5px"
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
  document.getElementById("preloader").style.display = "none";
  buttons();
}

function displayFriendsNotNull(referrals) {
  const main = document.getElementById("friends");
  main.innerHTML = "";
  main.innerHTML = `
    <div class="friends-block-not-null">
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
      <div class="friends-buttons">
        <div class="friends-block-not-null-button-invite" id="invite">
          <div class="friends-block-not-null-button-text">Пригласить друга</div>
          <svg
            class="friends-block-null-button-icon"
            style="margin-left: 1px"
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
        <div class="friends-block-not-null-button-link" id="copy">
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

    if (item.avatarUrl !== null) {
      list.innerHTML = `
      
      <div class="friends-list-block-logo-info">
              <div class="friends-list-user-logo" style="background-image: url('${item.avatarUrl}')"></div>
              <div class="friends-list-user-info">
                <div class="friends-list-user-info-name">${item.name}</div>
                <div class="friends-list-user-info-balance">
                  <div class="friends-list-user-info-balance-text">${item.balance}</div>
                  <div class="friends-list-user-info-balance-logo"></div>
                </div>
                </div>
              </div>
     `;
    } else {
      list.innerHTML = `
      
      <div class="friends-list-block-logo-info">
              <div class="friends-list-user-logo" style="background: #e04646;">${item.name[0].toUpperCase()}</div>
              <div class="friends-list-user-info">
                <div class="friends-list-user-info-name">${item.name}</div>
                <div class="friends-list-user-info-balance">
                  <div class="friends-list-user-info-balance-text">${
                    item.balance
                  }</div>
                  <div class="friends-list-user-info-balance-logo"></div>
                </div>
                </div>
              </div>
     `;
    }
    listFriends.append(list);
  });
  document.getElementById("preloader").style.display = "none";
  buttons();
}

function buttons() {
  const buttonInvite = document.getElementById("invite");

  buttonInvite.addEventListener("click", function () {
    let a = `https://t.me/cunaedu_bot/CunaEdu?startapp=${userId}`,
      s = encodeURI(a),
      o = encodeURI("Узнавай новое вместе со мной (@cryptuna)");
    window.location.href = `https://t.me/share/url?url=${s}&text=${o}`;
  });

  document.getElementById("copy").addEventListener("click", function () {
    let link = `https://t.me/cunaedu_bot/CunaEdu?startapp=${userId}`;
    navigator.clipboard.writeText(link);

    var svg1 = document.getElementById("svg1");
    var svg2 = document.getElementById("svg2");

    if (svg1.style.display !== "none") {
      svg1.style.animation = "fadeOut 0.2s forwards";
      setTimeout(function () {
        svg1.style.display = "none";
        svg2.style.display = "block";
        svg2.style.animation = "fadeIn 0.2s forwards";

        setTimeout(function () {
          svg2.style.animation = "fadeOut 0.2s forwards";
          setTimeout(function () {
            svg2.style.display = "none";
            svg1.style.display = "block";
            svg1.style.animation = "fadeIn 0.2s forwards";
          }, 200);
        }, 2000);
      }, 200);
    }
    tg.HapticFeedback.impactOccurred("success");
  });
}

const modal = document.getElementById("modal");
const popupBtn = document.getElementById("pop");
const popupBtnSvg = document.getElementById("popu");
const modalButtonOk = document.getElementById("okButton");

const showModal = () => {
  modal.style.display = "block";
};

popupBtn.addEventListener("click", showModal);

popupBtnSvg.addEventListener("click", (e) => {
  e.stopPropagation();
  showModal();
});

document.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

modalButtonOk.addEventListener("click", () => {
  modal.style.display = "none";
});

localStorage.removeItem("courseData");
