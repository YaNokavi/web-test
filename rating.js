import fetchData from "./fetch.js";

const retry = async (fn, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
};

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const courseId = Number(urlParams.get("idCourse"));

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user.id;
// const userId = 1;

const amountComments = document.getElementById("amount-comments");
const buttonWriteComment = document.getElementById("button-write-comment");
const commentButtons = document.getElementById("comment-buttons");
const buttonSendComment = document.getElementById("button-send-comment");
const buttonReverse = document.getElementById("button-reverse");
const buttonDelete = document.getElementById("button-delete");
const buttonChangeComment = document.getElementById("button-change-comment");
const commentZone = document.getElementById("comment-zone");
const textarea = document.getElementById("comment");
const starsRating = document.querySelectorAll(".stars-svg-rating .star-rating");

const modal = document.getElementById("modal");
const buttonConfirmDelete = document.getElementById("yesButton");
const buttonCancelDelete = document.getElementById("noButton");

async function sendComment(comment, rating) {
  let body = {
    userId: userId,
    rating: rating,
    comment: comment,
  };

  try {
    await fetchData(`course/${courseId}/review`, "POST", body, false);
    getReviews("NEW_FIRST", false);
  } catch (error) {
    console.error("Ошибка при отправке коммента:", error);
  }
}

async function changeComment(reviewId, comment, rating) {
  let body = {
    reviewId: reviewId,
    rating: rating,
    comment: comment,
  };

  try {
    await fetchData(`course/${courseId}/review`, "PUT", body, false);
    getReviews("NEW_FIRST", false);
  } catch (error) {
    console.error("Ошибка при отправке коммента:", error);
  }
}

async function deleteComment(reviewId) {
  try {
    await fetchData(
      `course/${courseId}/review?reviewId=${reviewId}`,
      "DELETE",
      null,
      false
    );

    modal.style.display = "none";
    buttonWriteComment.style.display = "flex";
    buttonChangeComment.style.display = "none";
    buttonDelete.style.display = "none";
    commentButtons.style.display = "none";
    commentZone.style.display = "none";
    textarea.value = "";
    starsRating.forEach((star) => {
      star.classList.remove("active");
    });
    getReviews("NEW_FIRST", false);
  } catch (error) {
    console.error("Ошибка при отправке коммента:", error);
  }
}

function getReviewWord(count) {
  count = Math.abs(count) % 100;
  const lastDigit = count % 10;

  if (count > 10 && count < 20) {
    return "отзывов";
  }
  if (lastDigit > 1 && lastDigit < 5) {
    return "отзыва";
  }
  if (lastDigit === 1) {
    return "отзыв";
  }
  return "отзывов";
}

buttonWriteComment.addEventListener("click", function () {
  buttonWriteComment.style.display = "none";
  commentButtons.style.display = "flex";
  commentZone.style.display = "flex";
  textarea.value = "";
});

function resetButtons() {
  commentButtons.style.display = "none";
  commentZone.style.display = "none";

  buttonWriteComment.style.display = reviews.currentUserReview
    ? "none"
    : "flex";
  buttonChangeComment.style.display = reviews.currentUserReview
    ? "flex"
    : "none";

  textarea.value = "";
  starsRating.forEach((star) => {
    star.classList.remove("active");
  });
}

buttonReverse.addEventListener("click", function () {
  resetButtons();
});

buttonSendComment.addEventListener("click", function () {
  if (currentRating === 0) {
    console.log("Не все данные заполнены");
  } else if (!textarea.value) {
    const text = null;
    if (reviews.currentUserReview) {
      changeComment(reviews.currentUserReview.reviewId, text, currentRating);
      resetButtons();
    } else {
      sendComment(text, currentRating);
      resetButtons();
    }
  } else if (textarea.value) {
    if (reviews.currentUserReview) {
      changeComment(
        reviews.currentUserReview.reviewId,
        textarea.value,
        currentRating
      );
      resetButtons();
    } else {
      sendComment(textarea.value, currentRating);
      resetButtons();
    }
  }
});

buttonChangeComment.addEventListener("click", function () {
  commentZone.style.display = "flex";
  commentButtons.style.display = "flex";
  buttonChangeComment.style.display = "none";

  textarea.value = reviews.currentUserReview.message;
  updateStars(reviews.currentUserReview.rating);
});

document.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

buttonDelete.addEventListener("click", function () {
  modal.style.display = "flex";
});

buttonConfirmDelete.addEventListener("click", function () {
  deleteComment(reviews.currentUserReview.reviewId);
});

buttonCancelDelete.addEventListener("click", function () {
  modal.style.display = "none";
});

const maxLength = 2000;

textarea.addEventListener("input", function () {
  const currentLength = textarea.value.length;
  if (currentLength > maxLength) {
    // Обрезаем текст до максимума
    textarea.value = textarea.value.substring(0, maxLength);
  }

  this.style.height = "auto"; // Сброс высоты
  this.style.height = this.scrollHeight + "px"; // Установка высоты по содержимому
});

let currentRating = 0;

starsRating.forEach((star) => {
  star.addEventListener("click", () => {
    const rating = +star.getAttribute("data-value");
    updateStars(rating);
  });
});

function updateStars(newRating) {
  if (newRating > currentRating) {
    starsRating.forEach((star) => {
      const starValue = +star.getAttribute("data-value");
      if (starValue <= newRating) {
        setTimeout(() => {
          star.classList.add("active");
        }, 15 * starValue);
      }
    });
  } else if (newRating < currentRating) {
    starsRating.forEach((star) => {
      const starValue = +star.getAttribute("data-value");
      if (starValue > newRating && starValue <= currentRating) {
        setTimeout(() => {
          star.classList.remove("active");
        }, 15 * (currentRating - starValue));
      }
    });
  } else {
    starsRating.forEach((star) => {
      const starValue = +star.getAttribute("data-value");
      if (starValue <= newRating && starValue <= currentRating) {
        star.classList.add("active");
      }
    });
  }
  currentRating = newRating;
}

function displayRating(ratingInfo) {
  const rating = ratingInfo.rating;

  const formattedRating = Number.isInteger(rating)
    ? rating.toString()
    : rating.toFixed(1);
  document.getElementById("rating").innerText = `${formattedRating}/5`;

  const count = ratingInfo.reviewsTotalNumber;
  amountComments.innerText = `${count} ${getReviewWord(count)}`;

  const detailed = ratingInfo.detailedRatingTotalNumber;
  const total = Object.values(detailed).reduce((sum, v) => sum + v, 0);

  const progressBlocks = document.querySelectorAll(".progress-block-elem");

  const values = [
    detailed[5],
    detailed[4],
    detailed[3],
    detailed[2],
    detailed[1],
  ];

  progressBlocks.forEach((block, idx) => {
    const progress = block.querySelector("progress");
    const value = values[idx] || 0;
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    progress.value = percent;
  });
}

const commentsBlock = document.getElementById("comments");

async function sendUserReaction(reviewId, reactorId, reaction) {
  try {
    const response = await fetchData(
      `course/review/${reviewId}/reaction?reactorId=${reactorId}&reaction=${reaction}`,
      "POST",
      null,
      false
    );

    return response;
  } catch (error) {
    console.error("Ошибка при отправке реакции:", error);
  }
}

async function updateUserReaction(reviewId, reactorId, reaction) {
  try {
    const response = await fetchData(
      `course/review/${reviewId}/reaction?reactorId=${reactorId}&reaction=${reaction}`,
      "PUT",
      null,
      false
    );
    return response;
  } catch (error) {
    console.error("Ошибка при изменении реакции:", error);
  }
}

async function deleteUserReaction(reviewId, reactorId) {
  try {
    const response = await fetchData(
      `course/review/${reviewId}/reaction?reactorId=${reactorId}`,
      "DELETE",
      null,
      false
    );
    console.log(response);
    return response;
  } catch (error) {
    console.error("Ошибка при удалении реакции:", error);
  }
}

function addListenerOnUserMarks(courseReviews) {
  document.querySelectorAll(".comment-block").forEach((commentBlock) => {
    const reviewId = commentBlock.dataset.reviewId;
    if (!reviewId) return;

    const review = courseReviews.find((r) => r.reviewId == reviewId);
    if (!review) return;

    const likeMark = commentBlock.querySelector(".user-mark-icon.like");
    const dislikeMark = commentBlock.querySelector(".user-mark-icon.dislike");
    const likeCount = likeMark?.nextElementSibling;
    const dislikeCount = dislikeMark?.nextElementSibling;

    if (!likeMark || !dislikeMark || !likeCount || !dislikeCount) return;

    likeCount.dataset.original = review.likesCount;
    dislikeCount.dataset.original = review.dislikesCount;

    likeMark.addEventListener("click", async () => {
      const isLikeActive = likeMark.classList.contains("active");
      const isDislikeActive = dislikeMark.classList.contains("active");

      if (isLikeActive) {
        // Удаление лайка
        likeMark.classList.remove("active");
        likeCount.textContent = Number(likeCount.textContent) - 1;

        try {
          // Дожидаемся ответа от сервера
          const response = await retry(() =>
            deleteUserReaction(review.reviewId, userId)
          );
          console.log(response);

          // Если сервер вернул ошибку
          if (response !== 200) {
            // Откатываем изменения в UI
            likeMark.classList.add("active");
            likeCount.textContent = Number(likeCount.textContent) + 1;
            alert("Ошибка при удалении реакции");
          }
        } catch (error) {
          console.error("Ошибка:", error);
          // Откатываем изменения в UI при ошибке сети
          likeMark.classList.add("active");
          likeCount.textContent = Number(likeCount.textContent) + 1;
          alert("Сетевая ошибка");
        }
      } else {
        // Оптимистичное обновление UI
        likeMark.classList.add("active");
        likeCount.textContent = Number(likeCount.textContent) + 1;

        try {
          let response;
          if (isDislikeActive) {
            // Замена дизлайка на лайк
            dislikeMark.classList.remove("active");
            dislikeCount.textContent = Number(dislikeCount.textContent) - 1;

            response = await retry(() =>
              updateUserReaction(review.reviewId, userId, "LIKE")
            );
          } else {
            // Новый лайк
            response = await retry(() =>
              sendUserReaction(review.reviewId, userId, "LIKE")
            );
          }

          console.log(response);

          // Если сервер вернул ошибку
          if (response !== 200) {
            // Откатываем все изменения в UI
            likeMark.classList.remove("active");
            likeCount.textContent = Number(likeCount.textContent) - 1;

            if (isDislikeActive) {
              dislikeMark.classList.add("active");
              dislikeCount.textContent = Number(dislikeCount.textContent) + 1;
            }

            alert("Ошибка при отправке реакции");
          }
        } catch (error) {
          console.error("Ошибка:", error);
          // Откатываем все изменения в UI при ошибке сети
          likeMark.classList.remove("active");
          likeCount.textContent = Number(likeCount.textContent) - 1;

          if (isDislikeActive) {
            dislikeMark.classList.add("active");
            dislikeCount.textContent = Number(dislikeCount.textContent) + 1;
          }

          alert("Сетевая ошибка");
        }
      }
    });

    // Обработчик для дизлайков
    dislikeMark.addEventListener("click", async () => {
      const isDislikeActive = dislikeMark.classList.contains("active");
      const isLikeActive = likeMark.classList.contains("active");

      // Блокируем кнопки на время запроса

      try {
        if (isDislikeActive) {
          // Удаление дизлайка
          dislikeMark.classList.remove("active");
          dislikeCount.textContent = Number(dislikeCount.textContent) - 1;

          // Дожидаемся ответа от сервера
          const response = await retry(() =>
            deleteUserReaction(review.reviewId, userId)
          );
          console.log(response);

          // Если сервер вернул ошибку
          if (response !== 200) {
            throw new Error("Ошибка при удалении реакции");
          }
        } else {
          // Оптимистичное обновление UI
          dislikeMark.classList.add("active");
          dislikeCount.textContent = Number(dislikeCount.textContent) + 1;

          let response;
          if (isLikeActive) {
            // Замена лайка на дизлайк
            likeMark.classList.remove("active");
            likeCount.textContent = Number(likeCount.textContent) - 1;

            response = await retry(() =>
              updateUserReaction(review.reviewId, userId, "DISLIKE")
            );
          } else {
            // Новый дизлайк
            response = await retry(() =>
              sendUserReaction(review.reviewId, userId, "DISLIKE")
            );
          }

          console.log(response);

          // Если сервер вернул ошибку
          if (response !== 200) {
            throw new Error("Ошибка при отправке реакции");
          }
        }
      } catch (error) {
        console.error("Ошибка:", error);

        // Откатываем изменения в UI
        if (isDislikeActive) {
          // Откат удаления дизлайка
          dislikeMark.classList.add("active");
          dislikeCount.textContent = Number(dislikeCount.textContent) + 1;
        } else {
          // Откат добавления дизлайка
          dislikeMark.classList.remove("active");
          dislikeCount.textContent = Number(dislikeCount.textContent) - 1;

          // Восстанавливаем лайк, если он был
          if (isLikeActive) {
            likeMark.classList.add("active");
            likeCount.textContent = Number(likeCount.textContent) + 1;
          }
        }

        alert(error.message || "Сетевая ошибка");
      }
    });
  });
}

function declOfNum(number, titles) {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
}

function calculateDate(createTime) {
  const now = new Date();
  const past = new Date(createTime);

  const diffMs = now - past;
  if (diffMs < 0) return "только что";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) {
    return `${seconds} ${declOfNum(seconds, [
      "секунда",
      "секунды",
      "секунд",
    ])} назад`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${declOfNum(minutes, [
      "минута",
      "минуты",
      "минут",
    ])} назад`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${declOfNum(hours, ["час", "часа", "часов"])} назад`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${declOfNum(days, ["день", "дня", "дней"])} назад`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `${weeks} ${declOfNum(weeks, ["неделя", "недели", "недель"])} назад`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ${declOfNum(months, [
      "месяц",
      "месяца",
      "месяцев",
    ])} назад`;
  }

  const years = Math.floor(days / 365);
  return `${years} ${declOfNum(years, ["год", "года", "лет"])} назад`;
}

function initExpandHandlers() {
  // Обработчики для кнопок
  document.querySelectorAll(".button-expand-description").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Предотвращаем всплытие
      toggleCommentExpand(this);
    });
  });

  // Обработчики для текста комментариев
  document.querySelectorAll(".comment-description").forEach((desc) => {
    desc.addEventListener("click", toggleDescription);
  });
}

// Функция для переключения состояния комментария
function toggleDescription() {
  const commentBlock = this.closest(".comment-block");
  const button = commentBlock.querySelector(".button-expand-description");

  // Проверяем, нужна ли кнопка вообще
  if (button.style.display === "none") return;

  toggleCommentExpand(button);
}

// Общая функция переключения состояния
function toggleCommentExpand(element) {
  const commentBlock = element.closest(".comment-block");
  commentBlock.classList.toggle("expanded");

  const button = commentBlock.querySelector(".button-expand-description");
  const span = button.querySelector("span");
  span.textContent = commentBlock.classList.contains("expanded")
    ? "Свернуть"
    : "Раскрыть";
}

// Проверка необходимости кнопок
function checkExpandButtons() {
  const descriptions = document.querySelectorAll(".comment-description");

  descriptions.forEach((desc) => {
    const commentBlock = desc.closest(".comment-block");
    const button = commentBlock.querySelector(".button-expand-description");

    // Вычисляем реальную высоту текста
    const lineHeight = parseInt(getComputedStyle(desc).lineHeight);
    const maxHeight = lineHeight * 2;

    // Проверяем, превышает ли контент 2 строки
    if (desc.scrollHeight <= maxHeight) {
      button.style.display = "none";

      // Убираем курсор-указатель для коротких комментариев
      desc.style.cursor = "default";
    } else {
      button.style.display = "flex";

      // Добавляем курсор-указатель для длинных комментариев
      desc.style.cursor = "pointer";
    }
  });
}

window.addEventListener("resize", () => {
  checkExpandButtons();
});

function displayComments(courseReviews) {
  commentsBlock.innerHTML = "";
  //Добавить условие для добавления кнопки раскрыть/свернуть

  let commentColor = null;
  let date = null;
  let messageUser = null;
  // let userReactionLike = null;
  // let userReactionDislike = null;
  courseReviews.forEach((review) => {
    if (review.rating >= 4) {
      commentColor = "good";
    } else if (review.rating === 3) {
      commentColor = "medium";
    } else if (review.rating <= 2) {
      commentColor = "bad";
    }
    date = calculateDate(review.createTime);

    messageUser = review.message ? review.message : "";

    let userReactionLike = null;
    let userReactionDislike = null;
    if (review.currentUserReaction) {
      if (review.currentUserReaction === "LIKE") {
        userReactionLike = "active";
      } else if (review.currentUserReaction === "DISLIKE") {
        userReactionDislike = "active";
      }
    }
    console.log(review);
    let comment = `<div class="comment-block ${commentColor}" data-review-id="${review.reviewId}">
          <div class="comment-info">
            <div class="comment-text-rating">
              <div class="comment-header">
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    gap: 10px;
                    align-items: center;
                    min-width: 0;
                    width: 100%;
                  "
                >
                  <div class="comment-username">
                    <span>${review.username}</span>
                  </div>
                  <div class="comment-date">${date}</div>
                </div>
                <div class="comment-mark-rating">
                  ${review.rating}/5
                  <svg
                    style="margin-top: 2px"
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 0L4.69667 4.01794L0.318132 4.49139L3.58216 7.44806L2.6794 11.7586L6.5 9.568L10.3206 11.7586L9.41784 7.44806L12.6819 4.49139L8.30333 4.01794L6.5 0Z"
                      fill="#F1D904"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="comment-description">
                ${messageUser}
              </div>
            </div>
          </div>
          <div class="footer-comment-block">
            <div class="user-marks-block">
              <div class="user-mark">
                <svg
                  class="user-mark-icon like ${userReactionLike}"
                  width="24"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.45067 13.9082L11.4033 20.4395C11.6428 20.6644 11.7625 20.7769 11.9037 20.8046C11.9673 20.8171 12.0327 20.8171 12.0963 20.8046C12.2375 20.7769 12.3572 20.6644 12.5967 20.4395L19.5493 13.9082C21.5055 12.0706 21.743 9.0466 20.0978 6.92607L19.7885 6.52734C17.8203 3.99058 13.8696 4.41601 12.4867 7.31365C12.2913 7.72296 11.7087 7.72296 11.5133 7.31365C10.1304 4.41601 6.17972 3.99058 4.21154 6.52735L3.90219 6.92607C2.25695 9.0466 2.4945 12.0706 4.45067 13.9082Z"
                    stroke="currentColor"
                  />
                </svg>
                <span>${review.likesCount}</span>
              </div>
              <div class="user-mark">
                <svg
                  class="user-mark-icon dislike ${userReactionDislike}"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.4033 20.4392L4.45065 13.908C2.49447 12.0704 2.25692 9.04637 3.90216 6.92584L4.21151 6.52711C5.79541 4.48564 8.66322 4.36257 10.4435 5.90254L11.9999 7L13.7063 5.77883C15.494 4.37083 18.2482 4.54198 19.7884 6.52711L20.0978 6.92583C21.743 9.04636 21.5055 12.0704 19.5493 13.908L12.5967 20.4392C12.3572 20.6642 12.2374 20.7767 12.0963 20.8044C12.0327 20.8169 11.9673 20.8169 11.9037 20.8044C11.7625 20.7767 11.6428 20.6642 11.4033 20.4392Z"
                  />
                  <path
                    d="M10.4435 5.90254C8.66322 4.36257 5.79541 4.48564 4.21151 6.52711L3.90216 6.92584C2.25692 9.04637 2.49447 12.0704 4.45065 13.908L11.4033 20.4392C11.6428 20.6642 11.7625 20.7767 11.9037 20.8044C11.9673 20.8169 12.0327 20.8169 12.0963 20.8044C12.2374 20.7767 12.3572 20.6642 12.5967 20.4392L19.5493 13.908C21.5055 12.0704 21.743 9.04636 20.0978 6.92583L19.7884 6.52711C18.2482 4.54198 15.494 4.37083 13.7063 5.77883L11.9999 7L10.4435 5.90254ZM10.4435 5.90254L9.40778 7.21531C8.75184 8.04672 8.42387 8.46243 8.50535 8.90711C8.58682 9.35179 9.04087 9.62421 9.94896 10.1691L11.2014 10.9205C12.0457 11.4271 12.4679 11.6804 12.5618 12.0982C12.6558 12.516 12.3827 12.9256 11.8365 13.7449L11 14.9997"
                    stroke="currentColor"
                  />
                </svg>
                <span>${review.dislikesCount}</span>
              </div>
            </div>
            <div class="button-expand-description">
              <span>Раскрыть</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.35 3.8999L6.50002 9.7499L0.650024 3.8999"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </div>
          </div>
        </div>`;

    commentsBlock.innerHTML += comment;
  });

  const commentBlocks = commentsBlock.querySelectorAll(".comment-block");
  commentBlocks.forEach((block) => {
    const desc = block.querySelector(".comment-description");
    const buttonExpand = block.querySelector(".button-expand-description");

    // Проверяем, нужна ли кнопка
    if (desc.scrollHeight <= desc.clientHeight) {
      buttonExpand.classList.add("hidden");
    } else {
      buttonExpand.classList.remove("hidden");
    }
  });

  setTimeout(() => {
    checkExpandButtons();
    initExpandHandlers(); // Инициализируем обработчики
  }, 0);

  addListenerOnUserMarks(courseReviews);
  document.getElementById("preloader").style.display = "none";
}

let reviews;
async function getReviews(sortType, filter) {
  reviews = await fetchData(
    `course/${courseId}/reviews?userId=${userId}&sort=${sortType}`
  );

  displayComments(reviews.courseReviews);

  displayRating(reviews.courseRatingInfo);

  // console.log(reviews.currentUserReview)

  if (reviews.currentUserReview && !filter) {
    buttonWriteComment.style.display = "none";
    buttonChangeComment.style.display = "flex";
    buttonDelete.style.display = "flex";
  }
}

getReviews("NEW_FIRST", false);

const button1 = document.getElementById("widget-button-first");
const button2 = document.getElementById("widget-button-second");
const button3 = document.getElementById("widget-button-third");
const button4 = document.getElementById("widget-button-fourth");
const widgetBlock = document.getElementById("buttons-block");
const buttons = widgetBlock.querySelectorAll(".widget-button");

let activeIndex = 0;

function setActivePosition(index) {
  const translatePercent = index * 100; // 0% или 100%
  widgetBlock.style.setProperty("--pseudo-x", `${translatePercent}%`);
  activeIndex = index;

  buttons.forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });
}

setActivePosition(activeIndex);

button1.addEventListener("click", function () {
  if (
    button2.classList.contains("active") ||
    button3.classList.contains("active") ||
    button4.classList.contains("active")
  ) {
    button2.classList.remove("active");
    button3.classList.remove("active");
    button4.classList.remove("active");

    widgetBlock.style.setProperty("--active-pos", "0%");

    setActivePosition(0);
    getReviews("NEW_FIRST", true);

    button1.classList.add("active");
  }
});

button2.addEventListener("click", function () {
  if (
    button1.classList.contains("active") ||
    button3.classList.contains("active") ||
    button4.classList.contains("active")
  ) {
    button1.classList.remove("active");
    button3.classList.remove("active");
    button4.classList.remove("active");

    widgetBlock.style.setProperty("--active-pos", "25%");

    setActivePosition(1); // Обновляем позицию и классы
    getReviews("POSITIVE_FIRST", true);

    button2.classList.add("active");
  }
});

button3.addEventListener("click", function () {
  if (
    button1.classList.contains("active") ||
    button2.classList.contains("active") ||
    button4.classList.contains("active")
  ) {
    button1.classList.remove("active");
    button2.classList.remove("active");
    button4.classList.remove("active");

    widgetBlock.style.setProperty("--active-pos", "50%");

    setActivePosition(2); // Обновляем позицию и классы
    getReviews("NEGATIVE_FIRST", true);

    button3.classList.add("active");
  }
});

button4.addEventListener("click", function () {
  if (
    button1.classList.contains("active") ||
    button2.classList.contains("active") ||
    button3.classList.contains("active")
  ) {
    button1.classList.remove("active");
    button2.classList.remove("active");
    button3.classList.remove("active");

    widgetBlock.style.setProperty("--active-pos", "75%");

    setActivePosition(3); // Обновляем позицию и классы
    getReviews("USEFUL_FIRST", true);

    button4.classList.add("active");
  }
});

const refer = localStorage.getItem("refer");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");

function setupCatalog() {
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}

function setupFavorite() {
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
}

if (refer.endsWith("favorite.html")) {
  setupFavorite();
} else if (refer.endsWith("catalog.html")) {
  setupCatalog();
}