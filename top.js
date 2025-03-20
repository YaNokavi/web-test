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
  // const topUsers = await fetchData(
  //   `https://cryptunatest-anderm.amvera.io/v1/user/${userId}/referrals`
  // );

  const topUsers = {
    username: "Yan Miracles",
    userBalance: 123,
    ratingPlace: 1035,
    usersRatingList: [
      {
        username: "Andrey Ermolaev",
        userBalance: 9999999999,
      },
      {
        username: "Yan Toples",
        userBalance: 5,
      },
      {
        username: "Vitalik Buterin",
        userBalance: 0,
      },
      {
        username: "Vitalik Buterin",
        userBalance: 0,
      },
      {
        username: "Vitalik Buterin",
        userBalance: 0,
      },
      {
        username: "Vitalik Buterin",
        userBalance: 0,
      },
    ],
  };

  displayTopUsers(topUsers);
}

getTopUsers();

function displayTopUsers(topUsers) {
  const main = document.getElementById("top-users");
  main.innerHTML = "";
  main.innerHTML = `
    <div class="friends-block-not-null">
        <div class="friends-block-not-null-text">Таблица лидеров</div>
        <div class="friends-block-not-null-text-down">
          Данный топ формируется на основе заработанных CUNA-токенов за
          прохождение тестов в курсах и сбрасывается каждый месяц.
        </div>
        <div class="friends-block-not-null-list" id="list">
          
      </div>
  `;

  const listFriends = document.getElementById("list");
  const listUser = document.createElement("div");
  listUser.classList.add("list-user");
  listUser.innerHTML = `
  
              <div class="friends-list-block-logo-info">
                <div class="friends-list-user-logo">Y</div>
                <div class="friends-list-user-info">
                  <div class="friends-list-user-info-name">${topUsers.username}</div>
                  <div class="friends-list-user-info-balance">
                    <div class="friends-list-user-info-balance-text">${topUsers.userBalance}</div>
                    <div class="friends-list-user-info-balance-logo"></div>
                  </div>
                </div>
              </div>
              <div class="list-user-rating">
                <div class="">Рейтинг</div>
                <div class="list-user-rating-place">${topUsers.ratingPlace}</div>
              </div>
            
          
          `;
  listFriends.append(listUser);
  console.log(listFriends);

  topUsers.usersRatingList.forEach((item, index) => {
    // console.log(item)
    let reward;
    let place;
    if (index === 0) {
      reward = "20$";
      place = "first";
    } else if (index === 1) {
      reward = "10$";
      place = "second";
    } else if (index === 2) {
      reward = "5$";
      place = "third";
    } else {
      reward = "";
      place = "";
    }
    const list = document.createElement("div");
    list.classList.add("friends-list-user");

    list.innerHTML = `
            <div class="list-user-place ${place}" >${index + 1}</div>
            <div class="friends-list-block-logo-info">
              <div class="friends-list-user-logo">Y</div>
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
            <div class="list-user-reward">${reward}</div>
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
