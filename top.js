import fetchData from "./fetch.js";

// // Обновление таймера каждую секунду
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
    document.getElementById("timer").innerHTML =
      days + "д " + hours + "ч " + minutes + "м " + seconds + "с ";

    // Если таймер истёк, отображение сообщения
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("timer").innerHTML = "Награды уже в пути!";
    }
  }, 1000);
}

// const userId = tg.initDataUnsafe.user.id;
const tg = window.Telegram.WebApp;
let username;
let logoname;
// if (tg.initDataUnsafe.user.username) {
//   logoname = `${tg.initDataUnsafe.user.username}`[0].toUpperCase();
//   const name = `${tg.initDataUnsafe.user.username}`;
//   username = DOMPurify.sanitize(name);
// } else {
logoname = "U";
username = "User";
// }
const userId = 1;

async function getTopUsers() {
  // const topUsers = await fetchData(
  //   `user/${userId}/referrals`
  // );

  const topUsers = {
    userBalance: 0,
    userPlace: 3,
    eventEndDate: "2025-03-10T16:39:23.987",
    userRatingList: [
      {
        place: 20,
        username: "Crypto_bll",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 19,
        username: "vratskiypenit",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 18,
        username: "Martellqa",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 17,
        username: "LintaoVita",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 16,
        username: "xzsks",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 15,
        username: "User",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 14,
        username: "Hzzzzip",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 13,
        username: "hemlebf",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 12,
        username: "Jack",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 11,
        username: "Ivy",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 10,
        username: "Hank",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 9,
        username: "Grace",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 8,
        username: "Frank",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 7,
        username: "Eve",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 6,
        username: "David",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 5,
        username: "Charlie",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 4,
        username: "example",
        userBalance: 0,
        rewardAmount: null,
      },
      {
        place: 3,
        username: "delovoyslava",
        userBalance: 0,
        rewardAmount: 5,
      },
      {
        place: 2,
        username: "Arrival_D",
        userBalance: 10,
        rewardAmount: 10,
      },
      {
        place: 1,
        username: "Yan_Miracles",
        userBalance: 30,
        rewardAmount: 20,
      },
    ],
  };

  displayTopUsers(topUsers);
  startCountdown(topUsers.eventEndDate);
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

  const listFriends = document.getElementById("list");
  const listUser = document.createElement("div");
  listUser.classList.add("list-user");
  listUser.innerHTML = `
  
              <div class="friends-list-block-logo-info">
                <div class="friends-list-user-logo">${logoname}</div>
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

    list.innerHTML = `
            <div class="list-user-place ${placeClass}" >${item.place}</div>
            <div class="friends-list-block-logo-info">
              <div class="friends-list-user-logo">${item.username[0].toUpperCase()}</div>
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
    listFriends.append(list);
  });
  document.getElementById("preloader").style.display = "none";
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

modalButtonOk.addEventListener("click", (event) => {
  modal.style.display = "none";
});

localStorage.removeItem("courseData");
