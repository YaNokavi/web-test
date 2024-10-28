const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const syllabusId = urlParams.get("syllabusId");
const moduleId = urlParams.get("moduleId");
const submoduleId = urlParams.get("submoduleId");
const stepId = urlParams.get("stepId");

var modulesData = JSON.parse(localStorage.getItem(`courseData-${syllabusId}`)).courseModuleList;
var submoduleInfo = modulesData[moduleId - 1].submoduleList[submoduleId - 1];
var stepInfo = submoduleInfo.stepList;
var urlContent = stepInfo[stepId - 1].textContentUrl;
// urlContent = "/test.txt"
// urlContent = "https://raw.githubusercontent.com/AndreyErmol/CunaEduFiles/2682e44dcf2b815ddf38f3bb0c5101af773a04f1/content.txt"
// urlContent = 'https://cors-anywhere.herokuapp.com/https://docviewer.yandex.ru/view/1880030910/?*=u1HB1dTjwVM%2BENqTSME8IimEy857InVybCI6InlhLWRpc2s6Ly8vZGlzay9DdW5hRWR1L2NvdXJzZXMvdGVjaG5pY2FsIGFuYWx5c2lzL2NvbnRlbnQudHh0IiwidGl0bGUiOiJjb250ZW50LnR4dCIsIm5vaWZyYW1lIjpmYWxzZSwidWlkIjoiMTg4MDAzMDkxMCIsInRzIjoxNzMwMTM4NzM4OTMwLCJ5dSI6IjU3Mzk3MzUzODE3Mjg1MDEzNTMifQ%3D%3D'
var testContent = stepInfo[stepId - 1].test;

var title = document.getElementById("title");
var arrow = document.getElementById("ref");
title.innerText = modulesData[moduleId - 1].submoduleList[submoduleId - 1].name;
arrow.href = `syllabus.html?id=${syllabusId}`;

var steps = document.getElementById("steps-number");
steps.innerHTML = `${stepId} из ${Object.keys(stepInfo).length}`;

var mediaContent = document.getElementById("content");
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
    }
  } catch (error) {
    console.error("Ошибка при получении курсов:", error);
  }
}

addContent();

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

var buttonBack = document.getElementById("button-back");
if (stepId == 1) {
  buttonBack.removeAttribute("href");
} else {
  buttonBack.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
    Number(stepId) - 1
  }`;
}

var buttonForward = document.getElementById("button-forward");
if (stepId == Object.keys(stepInfo).length) {
  buttonForward.removeAttribute("href");
} else {
  buttonForward.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
    Number(stepId) + 1
  }`;
}

var button = document.getElementById("button-next-step");

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

var refer = localStorage.getItem("refer");
var favorTab = document.getElementById("favor");
var catalogTab = document.getElementById("catalog");
var link = document.referrer.split("/").pop();
link = link.split("&").pop();
var switc = document.getElementById("switc");

if (refer == "index.html" || refer == "favorite.html") {
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
} else if (refer == "catalog.html") {
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}

if (stepId != 1 || link == "stepId=2") {
  title.style.animation = "none";
  switc.style.animation = "none";
}
