const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const syllabusId = urlParams.get("syllabusId");
const moduleId = urlParams.get("moduleId");
const submoduleId = urlParams.get("submoduleId");
const stepId = urlParams.get("stepId");

const userId = localStorage.getItem("userIdData");

const modulesData = JSON.parse(
  localStorage.getItem(`courseData`)
).courseModuleList;
const submoduleInfo = modulesData[moduleId - 1].submoduleList[submoduleId - 1];
const stepInfo = submoduleInfo.stepList;
const stepIdProgress = stepInfo[stepId - 1].id;
const urlContent = stepInfo[stepId - 1].textContentUrl;
const testContent = stepInfo[stepId - 1].test;

const title = document.getElementById("title");
const arrow = document.getElementById("ref");
title.innerText = modulesData[moduleId - 1].submoduleList[submoduleId - 1].name;
arrow.href = `syllabus.html?id=${syllabusId}`;

const steps = document.getElementById("steps-number");
steps.innerHTML = `${stepId} из ${Object.keys(stepInfo).length}`;

var data = JSON.parse(localStorage.getItem("completedSteps"));
const mediaContent = document.getElementById("content");
async function addContent() {
  try {
    const response = await fetch(urlContent);
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    content = await response.text(); // Сохраняем данные в переменной
    mediaContent.innerHTML = content;
    if (testContent != null) {
      displayTest();
    } else {
      data.completedSteps.push(stepId);
      console.log(data);
      localStorage.setItem("completedSteps", JSON.stringify(data));
    }
  } catch (error) {
    console.error("Ошибка при получении курсов:", error);
  } finally {
    document.getElementById("preloader").style.display = "none";
  }
}

const testDiv = document.getElementById("test");
const submitButton = document.getElementById("submit-button");
const resultContainer = document.getElementById("result-container");
const retryButton = document.getElementById("retry-button");
const nextButton = document.getElementById("next-button");
function displayTest() {
  testDiv.style.display = "flex";
  submitButton.style.display = "flex";
  resultContainer.style.display = "flex";
  testDiv.innerHTML = `<p style="margin-bottom: 10px">${testContent.question}</p>`;
  testContent.options.forEach((option) => {
    const label = document.createElement("label");
    label.innerHTML = `
        <input type="radio" name="question" value="${option}">
        ${option}
    `;
    testDiv.append(label);
  });
  resultContainer.innerText = "";
  retryButton.style.display = "none";
  submitButton.classList.add("disabled");
  const inputs = document.querySelectorAll('input[name="question"]');
  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      submitButton.classList.remove("disabled");
      submitButton.disabled = false; // Разблокировать кнопку после выбора ответа
    });
  });

  submitButton.addEventListener("click", () => {
    const selectedOption = document.querySelector(
      `input[name="question"]:checked`
    );
    if (selectedOption) {
      if (selectedOption.value === testContent.answer) {
        submitButton.style.animation = "fadeOut 0.2s ease";
        setTimeout(() => {
          submitButton.style.display = "none";
          submitButton.style.animation = "none";
          nextButton.style.display = "flex";
          nextButton.style.animation = "fadeIn 0.2s ease";
          resultContainer.innerText = "Правильно!";
          resultContainer.style.animation = "fadeIn 0.2s ease";
          setTimeout(() => {
            nextButton.style.animation = "none";
            resultContainer.style.animation = "none";
          }, 200);
        }, 200);

        if (
          (stepId == Object.keys(stepInfo).length) &
          (submoduleId != Object.keys(submoduleInfo).length)
        ) {
          nextButton.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${
            Number(submoduleId) + 1
          }&stepId=${1}`;
        } else if (
          (submoduleId == Object.keys(submoduleInfo).length) &
          (moduleId != Object.keys(modulesData).length)
        ) {
          nextButton.href = `step.html?syllabusId=${syllabusId}&moduleId=${
            Number(moduleId) + 1
          }&submoduleId=${1}&stepId=${1}`;
        } else if (
          (moduleId == Object.keys(modulesData).length) &
          (submoduleId == Object.keys(submoduleInfo).length) &
          (stepId == Object.keys(stepInfo).length)
        ) {
          nextButton.removeAttribute("href");
          nextButton.addEventListener("click", function () {
            alert("HUY");
          });
        } else {
          nextButton.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
            Number(stepId) + 1
          }`;
        }
      } else {
        submitButton.style.animation = "fadeOut 0.2s ease";
        setTimeout(() => {
          submitButton.style.display = "none";
          submitButton.style.animation = "none";
          retryButton.style.display = "flex";
          retryButton.style.animation = "fadeIn 0.2s ease";
          resultContainer.innerText = "Неправильно!";
          resultContainer.style.animation = "fadeIn 0.2s ease";
          setTimeout(() => {
            resultContainer.style.animation = "none";
            retryButton.style.animation = "none";
          }, 200);
        }, 200);
      }

      const inputs = document.querySelectorAll('input[name="question"]');
      inputs.forEach((input) => {
        input.disabled = true;
      });
    } else {
      submitButton.disabled = true;
    }
  });
  retryButton.addEventListener("click", () => {
    displayTest();
    submitButton.style.display = "flex";
    submitButton.disabled = false; // Разблокировать кнопку после повторной

    // if (selectedOption && selectedOption.value === testContent.answer) {
    //   score++;
    // }
    // resultContainer.innerText = `Вы набрали ${score} баллов.`;
  });
}

// function getLocalStorageSize() {
//   let total = 0;
//   for (let key in localStorage) {
//     if (localStorage.hasOwnProperty(key)) {
//       total += (localStorage[key].length + key.length) * 2; // Учитываем размер в UTF-16
//     }
//   }
//   return (total / 1024).toFixed(2); // Возвращаем размер в КБ
// }

// console.log(
//   "Используемая память localStorage: " + getLocalStorageSize() + " KB"
// );

// function getItemSize(key) {
//   const value = localStorage.getItem(key);
//   if (value) {
//     // Учитываем размер ключа и значения в байтах (UTF-16)
//     const size = (key.length + value.length) * 2;
//     return (size / 1024).toFixed(2); // Возвращаем размер в КБ
//   }
//   return 0; // Если элемент не найден
// }

// const key = "coursesData"; // Замените на ваш ключ
// console.log(`Размер элемента '${key}': ${getItemSize(key)} KB`);

const buttonBack = document.getElementById("button-back");
if (stepId == 1) {
  buttonBack.removeAttribute("href");
} else {
  buttonBack.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
    Number(stepId) - 1
  }`;
}

const buttonForward = document.getElementById("button-forward");
if (stepId == Object.keys(stepInfo).length) {
  buttonForward.removeAttribute("href");
} else {
  buttonForward.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
    Number(stepId) + 1
  }`;
}

const button = document.getElementById("button-next-step");

if (
  (stepId == Object.keys(stepInfo).length) &
  (submoduleId != Object.keys(submoduleInfo).length)
) {
  button.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${
    Number(submoduleId) + 1
  }&stepId=${1}`;
} else if (
  (submoduleId == Object.keys(submoduleInfo).length) &
  (moduleId != Object.keys(modulesData).length)
) {
  button.href = `step.html?syllabusId=${syllabusId}&moduleId=${
    Number(moduleId) + 1
  }&submoduleId=${1}&stepId=${1}`;
} else if (
  (moduleId == Object.keys(modulesData).length) &
  (submoduleId == Object.keys(submoduleInfo).length) &
  (stepId == Object.keys(stepInfo).length)
) {
  button.removeAttribute("href");
  button.addEventListener("click", function () {
    alert("HUY");
  });
} else {
  button.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
    Number(stepId) + 1
  }`;
}

const refer = localStorage.getItem("refer");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");
let link = document.referrer.split("/").pop();
link = link.split("&").pop();
const switc = document.getElementById("switc");

sessionStorage.setItem("currentTab", refer);
sessionStorage.setItem("currentLink", window.location.href);

if (refer == "index.html" || refer == "favorite.html") {
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
  favorTab.addEventListener("click", function () {
    sessionStorage.removeItem("currentTab");
    sessionStorage.removeItem("currentLink");
  });
} else if (refer == "catalog.html") {
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
  catalogTab.addEventListener("click", function () {
    sessionStorage.removeItem("currentTab");
    sessionStorage.removeItem("currentLink");
  });
}

if (stepId != 1 || link == "stepId=2") {
  title.style.animation = "none";
  switc.style.animation = "none";
}
