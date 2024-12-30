import fetchData from "./fetch.js";

const popup = document.querySelector(".popup");
const popupBtn = document.getElementById("pop");
const popupBtnSvg = document.getElementById("popu");
const balanceText = document.getElementById("balance");
const userIdProfile = document.querySelector(".profile-userid");
const logoNameProfile = document.querySelector(
  ".profile-logo.profile-logo-name"
);
const userNameProfile = document.querySelector(".profile-nickname");
const course = document.getElementById("course-info");

const userIdData = localStorage.getItem("userIdData");
const logoName = localStorage.getItem("logoname");
const userName = localStorage.getItem("username");

userIdProfile.innerText += userIdData;
logoNameProfile.innerText = logoName;

// if (
//   !sessionStorage.getItem("currentTab") &&
//   !sessionStorage.getItem("currentLink")
// ) {
localStorage.removeItem("courseData");
// }

let referallId = localStorage.getItem("referallId");
let data;
if (!referallId || referallId === userIdData) {
  data = {
    userId: userIdData,
    username: userName,
  };
} else {
  data = {
    userId: userIdData,
    username: userName,
    referrerId: referallId,
  };
}
async function getUserInfo() {
  const userInfo = await fetchData(
    "https://cryptuna-anderm.amvera.io/v1/user/info",
    "POST",
    data
  );
  balanceText.innerText = userInfo.balance;
  document.getElementById("preloader").style.display = "none";

  if (userInfo.coursesProgress.length != 0) {
    displayProgress(userInfo);
  } else {
    displayButton();
  }
}

getUserInfo();

async function getTasks() {
  await getUserInfo();
  const tasksInfo = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/task/all?userId=${userIdData}`,
    "GET"
  );

  displayTasks(tasksInfo);
}

getTasks();

const tasksList = document.getElementById("tasks-list");
function displayTasks(tasksInfo) {
  tasksInfo.forEach((task, index) => {
    // console.log(task.iconUrl)
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");
    taskItem.innerHTML = `<div class="task-item-logo" style="background-image: url('${
      task.iconUrl
    }');"></div>
            <div class="task-item-name">${task.header}
              <div class="task-item-description">+ ${task.reward} CUNA</div>
            </div>
            <div class="task-item-button" id="buttonTask${
              index + 1
            }">Выполнить</div>`;
    tasksList.append(taskItem);
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

const setUserNameProfile = (name) => {
  let fontSize;

  if (name.length <= 15) {
    fontSize = "30px";
  } else if (name.length < 19) {
    fontSize = "24px";
  } else {
    name = name.slice(0, -2) + "..."; // Обрезаем, чтобы уместить
    fontSize = "23px";
  }

  userNameProfile.style.fontSize = fontSize;
  userNameProfile.innerText = name;
};

setUserNameProfile(userName);

function displayProgress(userInfo) {
  let listProgress = [];
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
    course.innerHTML += courseHtml; // Добавление новой информации о курсе
    //console.log(course)
  });
  let progressBarElements = course.querySelectorAll(
    ".course-info-bar-progress"
  );
  requestAnimationFrame(() => {
    progressBarElements.forEach((currentProgressBar, index) => {
      // Задержка для начала анимации
      setTimeout(() => {
        currentProgressBar.style.transition = "width 1s ease"; // Устанавливаем плавный переход
        currentProgressBar.style.width = `${listProgress[index]}%`; // Устанавливаем конечное значение ширины
      }, index * 300); // Задержка для последовательной анимации
    });
  });
}

function displayButton() {
  course.style.marginLeft = "0";
  const buttonHtml = `<div class="progress-title-enable-courses">Вы не изучаете ни один курс</div>`;
  course.innerHTML = buttonHtml;
}

// Функция для показа уведомления
function displayNotification() {
  const notification = document.getElementById("notification");
  setTimeout(() => {
    notification.classList.add("show"); // Добавляем класс для анимации появления
    setTimeout(() => {
      tg.HapticFeedback.notificationOccurred("success");
    }, 350);
    // Убираем уведомление через пару секунд
    setTimeout(() => {
      notification.classList.remove("show"); // Убираем класс для анимации исчезновения
    }, 2000); // Уведомление будет видимо в течение 3 секунд
  }, 1000);
}
displayNotification();
// Показать уведомление при загрузке страницы (или вызовите эту функцию по событию)
