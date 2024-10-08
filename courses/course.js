const number = document.location.href.split("/").pop().slice(0, -5);
const courseInfo = JSON.parse(localStorage.getItem(`${number}-course`));

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

button1.addEventListener("click", function () {
  text.style.animation = "fadeOut 0.1s ease";
  star1.style.animation = "fadeOut 0.1s ease";
  setTimeout(() => {
    button1.style.animation = "button-course 0.4s ease";
    text.innerText = "";
    star1.style.display = "none";
    setTimeout(() => {
      star2.style.display = "block";
      star1.style.animation = "none";
      button1.style.display = "none";
      button1.style.animation = "none";
      button2.style.display = "flex";
      text.style.animation = "none";
    }, 300);
  }, 50);
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
      star2.style.animation = "fadeOut 0.1s ease";
      setTimeout(() => {
        button2.style.animation = "button-favorite 0.5s ease";
        star2.style.display = "none";
        setTimeout(() => {
          text.style.animation = "fadeIn 0.1s ease";
          star1.style.animation = "fadeIn 0.1s ease";
          text.innerText = "Поступить на курс";
          star1.style.display = "block";
          button2.style.display = "none";
          button1.style.display = "flex";
          button2.style.animation = "none";
          setTimeout(() => {
            star1.style.animation = "none";
            star2.style.animation = "none";
            text.style.animation = "none";
          }, 100);
        }, 400);
      }, 100);
    }, 50);
  });
});
