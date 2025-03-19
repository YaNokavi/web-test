// // Установка даты, до которой ведётся обратный отсчёт
// var countDownDate = new Date("Jan 5, 2030 15:37:25").getTime();

// // Обновление таймера каждую секунду
// var x = setInterval(function() {
//     // Получение текущей даты и времени
//     var now = new Date().getTime();

//     // Расчёт оставшегося времени
//     var distance = countDownDate - now;

//     // Расчёт дней, часов, минут и секунд
//     var days = Math.floor(distance / (1000 * 60 * 60 * 24));
//     var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//     var seconds = Math.floor((distance % (1000 * 60)) / 1000);

//     // Отображение результата
//     document.getElementById("demo").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

//     // Если таймер истёк, отображение сообщения
//     if (distance < 0) {
//         clearInterval(x);
//         document.getElementById("demo").innerHTML = "EXPIRED";
//     }
// }, 1000);

import fetchData from "./fetch.js";

// const tg = window.Telegram.WebApp;
// const userId = tg.initDataUnsafe.user.id;
const userId = 1;

async function getTopUsers() {
  const topUsers = await fetchData(
    `https://cryptunatest-anderm.amvera.io/v1/user/${userId}/referrals`
  );

  displayTopUsers(topUsers);
}

// getTopUsers();

function displayTopUsers(topUsers) {
  const main = document.getElementById("top-users");
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
  `;

  const listFriends = document.getElementById("list");
  referrals.forEach((item) => {
    const list = document.createElement("div");
    list.classList.add("friends-list-user");
    list.innerHTML = `
            <div class="friends-list-user-logo">${item.name[0].toUpperCase()}</div>
            <div class="friends-list-user-info">
              <div class="friends-list-user-info-name">${item.name}</div>
              <div class="friends-list-user-info-balance">
                <div class="friends-list-user-info-balance-text">${
                  item.balance
                }</div>
                <div class="friends-list-user-info-balance-logo"></div>
              </div>
            </div>
   `;
    listFriends.append(list);
  });
  document.getElementById("preloader").style.display = "none";
}

// const popup = document.getElementById("top-popup");
// const popupBtn = document.getElementById("pop");
// const popupBtnSvg = document.getElementById("popu");

// const showPopup = () => {
//   popup.style.display = "flex";
// };

// const hidePopup = () => {
//   popup.classList.add("top-hide-popup");
//   setTimeout(() => {
//     popup.style.display = "none";
//     popup.classList.remove("top-hide-popup");
//   }, 300);
// };

// popupBtn.addEventListener("click", showPopup);

// popupBtnSvg.addEventListener("click", (e) => {
//   e.stopPropagation();
//   showPopup();
// });

// document.addEventListener("click", (e) => {
//   if (
//     e.target !== popup &&
//     !popup.contains(e.target) &&
//     e.target !== popupBtn
//   ) {
//     hidePopup();
//   }
// });

localStorage.removeItem("courseData");
