import fetchData from "./fetch.js";

localStorage.removeItem("courseData");

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

const userIdData = 1;
let logoName;
let userName;

// if (tg.initDataUnsafe.user.username) {
//   logoName = `${tg.initDataUnsafe.user.username}`[0].toUpperCase();
//   userName = `${tg.initDataUnsafe.user.username}`;
// } else {
logoName = "U";
userName = "User";
// }

userIdProfile.innerText += userIdData;
logoNameProfile.innerText = logoName;

async function getUserInfo() {
  const userInfo = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/user/${userIdData}/info?username=${userName}`,
    "POST"
  );
  balanceText.innerText = userInfo.balance;

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

async function checkTask(task) {
  const taskCheckInfo = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/task/${task.taskId}/completed?userId=${userIdData}`,
    "POST"
  );

  const buttonTask = document.getElementById(`task${task.taskId}`);
  if (taskCheckInfo) {
    buttonTask.classList.remove("load-task-animation");
    buttonTask.classList.remove("load-task");
    displayNotification(taskCheckInfo.reward);
    balanceText.innerText = taskCheckInfo.newBalance;
    buttonTask.classList.add("complete-task");
    buttonTask.textContent = "";
    buttonTask.innerHTML = `
        <svg style="color: var(--theme-button-hint-icon-text-color)" width="16" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.5244 4.79211C21.3064 4.79861 21.0995 4.88973 20.9475 5.04616L8.114 17.8797L2.83309 12.5987C2.75576 12.5182 2.66314 12.4539 2.56065 12.4096C2.45817 12.3653 2.34787 12.3419 2.23623 12.3408C2.12458 12.3396 2.01383 12.3608 1.91047 12.403C1.8071 12.4452 1.71319 12.5076 1.63424 12.5866C1.55529 12.6655 1.49289 12.7594 1.45069 12.8628C1.40849 12.9661 1.38734 13.0769 1.38847 13.1885C1.38961 13.3002 1.41301 13.4105 1.4573 13.513C1.5016 13.6155 1.5659 13.7081 1.64644 13.7854L7.52067 19.6596C7.67806 19.8169 7.89147 19.9053 8.114 19.9053C8.33652 19.9053 8.54994 19.8169 8.70732 19.6596L22.1341 6.23281C22.2554 6.11494 22.3382 5.96318 22.3718 5.79742C22.4053 5.63167 22.388 5.45965 22.3221 5.30391C22.2562 5.14817 22.1447 5.01598 22.0024 4.92465C21.8601 4.83333 21.6935 4.78713 21.5244 4.79211Z" fill="#1468b1"
            stroke="currentColor" stroke-width="2"/>
</svg>
`;
  } else {
    displayNotification();
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
      // location.href = task.taskUrl;
      // window.open(task.taskUrl);
      const telegramUrl = task.taskUrl.replace('https://', 'tg://');
      // window.open(telegramUrl, '_blank');
      window.location.href = telegramUrl;
      
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
      // button.setAttribute('data-href', task.taskUrl);
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
    const imageUrl = task.iconUrl; // Получаем URL изображения

    const imgLoadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageUrl;

      img.onload = () => {
        // console.log(`Изображение загружено: ${imageUrl}`);
        resolve(imageUrl);
      };

      img.onerror = () => {
        console.error(`Ошибка загрузки изображения: ${imageUrl}`);
        reject(imageUrl);
      };
    });

    imageLoadPromises.push(imgLoadPromise); // Добавляем промис в массив
  });

  // После завершения всех загрузок
  Promise.all(imageLoadPromises)
    .then(() => {
      // console.log("Все изображения загружены успешно!");
      document.getElementById("preloader").style.display = "none";
      animateProgress();
      // Здесь можно выполнить дополнительные действия после загрузки всех изображений
    })
    .catch((url) => {
      console.error(
        `Ошибка при загрузке одного или нескольких изображений: ${url}`
      );
      // Здесь можно обработать ошибку, если необходимо
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
    name = name.slice(0, -2) + "...";
    fontSize = "23px";
  }

  userNameProfile.style.fontSize = fontSize;
  userNameProfile.innerText = name;
};

setUserNameProfile(userName);

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
    course.innerHTML += courseHtml; // Добавление новой информации о курсе
  });
}

function animateProgress() {
  let progressBarElements = course.querySelectorAll(
    ".course-info-bar-progress"
  );
  if (document.getElementById("preloader").style.display === "none") {
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
}

function displayButton() {
  course.style.marginLeft = "0";
  const buttonHtml = `<div class="progress-title-enable-courses">Вы не изучаете ни один курс</div>`;
  course.innerHTML = buttonHtml;
}

function displayNotification(reward) {
  if (reward) {
    const notification = document.getElementById("notification");
    const notificationBalance = document.getElementById("notification-balance");
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
    const notificationBalance = document.getElementById("notification-balance");
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
}
