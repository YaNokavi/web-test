import fetchData from "./fetch.js";

// // Обновление таймера каждую секунду
function startCountdown(endDate) {
  // console.log(endDate)
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

const avatarUrl =
  tg.initDataUnsafe?.user?.photo_url ?? "tg.initDataUnsafe.user.photo_url";
const userId = tg.initDataUnsafe?.user?.id ?? 1;
const rawUsername = tg.initDataUnsafe?.user?.username;
const username = rawUsername ? DOMPurify.sanitize(rawUsername) : "User";

async function getTopUsers() {
  const topUsers = await fetchData(`event/student-competition`, "GET", {
    "X-User-Id": userId,
  });

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

  const listFriends = document.getElementById("list");
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
