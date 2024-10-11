const number = document.location.href.split("/").pop().slice(0, -5);
const courseInfo = JSON.parse(localStorage.getItem(`${number}-course`));

var userid = sessionStorage.getItem("userIdData");
const data = { id: userid, idCourse: number };

const courseElement = document.getElementById("info");
courseElement.innerHTML = `
            <div class="course-block-author">Автор: @${courseInfo.author}</div>
          <div class="course-block-description">
            <img src="../icons/logo_cuna.jpg" class="course-logo" />
            <div class="course-block-name">${courseInfo.name}</div>
            ${courseInfo.description}
          </div>
        `;

const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const text = document.querySelector(".course-block-button-text");
const star1 = document.getElementById("star1");
const star2 = document.getElementById("star2");

const modal = document.getElementById("modal");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

// const courseBlock = document.querySelector(".course-block");

// button1.addEventListener("click", function () {
//   text.style.animation = "fadeOut 50ms ease";
//   star1.style.animation = "fadeOut 50ms ease";
//   document.documentElement.style.setProperty(
//     "--course-block-width",
//     `${courseBlock.offsetWidth}px`
//   );

//   setTimeout(() => {
//     button1.style.animation =
//       "button-course 1.4s cubic-bezier(0.385, -0.220, 0.520, 0.840)";
//     text.innerText = "";
//     star1.style.display = "none";
//     setTimeout(() => {
//       star2.style.display = "block";
//       star1.style.animation = "none";
//       button1.style.display = "none";
//       button1.style.animation = "none";
//       button2.style.display = "flex";
//       text.style.animation = "none";
//     }, 1400);
//   }, 50);
// });

// button2.addEventListener("click", function () {
//   modal.style.display = "block";
//   noButton.addEventListener("click", function () {
//     modal.style.display = "none";
//   });

//   document.addEventListener("click", function (event) {
//     if (event.target === modal) {
//       modal.style.display = "none";
//     }
//   });

//   yesButton.addEventListener("click", function () {
//     modal.style.display = "none";
//     setTimeout(() => {
//       star2.style.animation = "fadeOut 0.1s ease";
//       setTimeout(() => {
//         button2.style.animation =
//           "button-favorite 0.5s cubic-bezier(0.385, -0.220, 0.520, 0.840)";
//         star2.style.display = "none";
//         setTimeout(() => {
//           text.style.animation = "fadeIn 0.1s ease";
//           star1.style.animation = "fadeIn 0.1s ease";
//           text.innerText = "Поступить на курс";
//           star1.style.display = "block";
//           button2.style.display = "none";
//           button1.style.display = "flex";
//           button2.style.animation = "none";
//           setTimeout(() => {
//             star1.style.animation = "none";
//             star2.style.animation = "none";
//             text.style.animation = "none";
//           }, 100);
//         }, 500);
//       }, 100);
//     }, 50);
//   });
// });

button1.addEventListener("click", function () {
  text.style.animation = "fadeOut 10ms ease";
  star1.style.animation = "fadeOut 50ms ease";
  setTimeout(() => {
    button1.style.animation = "button-course 0.4s ease";
    text.innerText = "";
    star1.style.display = "none";
    setTimeout(() => {
      star2.style.animation = "fadeIn 100ms ease";
      star2.style.display = "block";
      star1.style.animation = "none";
      button1.style.display = "none";
      button1.style.animation = "none";
      button2.style.display = "flex";
      text.style.animation = "none";
    }, 400);
  }, 10);
  async function postData(url = "", data = {}) {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await response.json();
      console.log("Успех:", JSON.stringify(json));
    } catch (error) {
      console.error("Ошибка:", error);
    }
  }
  postData("https://", data);
});

button2.addEventListener("click", function () {
  modal.style.display = "block";
  noButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  document.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  yesButton.addEventListener("click", function () {
    modal.style.display = "none";
    setTimeout(() => {
      star2.style.animation = "fadeOut 10ms ease";
      setTimeout(() => {
        button2.style.animation =
          "button-favorite 0.6s cubic-bezier(0.385, -0.220, 0.520, 0.840)";
        star2.style.display = "none";
        setTimeout(() => {
          text.style.animation = "fadeIn 10ms ease";
          star1.style.animation = "fadeIn 10ms ease";
          text.innerText = "Поступить на курс";
          star1.style.display = "block";
          button2.style.display = "none";
          button1.style.display = "flex";
          button2.style.animation = "none";
          setTimeout(() => {
            star1.style.animation = "none";
            star2.style.animation = "none";
            text.style.animation = "none";
          }, 10);
        }, 500);
      }, 10);
    }, 50);
  });
});
