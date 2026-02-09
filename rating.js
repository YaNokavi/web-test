import fetchData from "./fetch.js";

let originalText = "";
let originalStars = 0;
let currentRating = 0;
let reviews = null; // для хранения данных отзывов

const commentButtons = document.getElementById("comment-buttons");
const commentZone = document.getElementById("comment-zone");
const starsRating = document.querySelectorAll(".stars-svg-rating .star-rating");
const textarea = document.getElementById("comment");

const buttonWriteComment = document.getElementById("button-write-comment");
const buttonDelete = document.getElementById("button-delete");
const buttonChangeComment = document.getElementById("button-change-comment");

function stripHtmlTags(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, "");
}

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

class RatingController {
  constructor(userId, courseId) {
    this.userId = userId;
    this.courseId = courseId;

    this.ratingUI = new RatingUI(userId);
  }

  async getReviews(sortType, filter) {
    try {
      reviews = await fetchData(
        `course/${this.courseId}/reviews?sort=${sortType}`,
        "GET",
        { "X-User-Id": this.userId }
      );
      this.ratingUI.displayComments(reviews.courseReviews);

      this.ratingUI.displayRating(reviews.courseRatingInfo);

      if (reviews.currentUserReview && !filter) {
        originalText = reviews.currentUserReview.message ?? "";
        originalStars = reviews.currentUserReview.rating;

        buttonWriteComment.style.display = "none";
        buttonChangeComment.style.display = "flex";
        buttonDelete.style.display = "flex";

        updateStars(originalStars);
        textarea.value = originalText;
      }
    } catch {
      console.error("Не удалось получить отзывы");
    }
  }
}

class RatingUI {
  constructor(userId) {
    this.userId = userId;

    this.widgetBlock = document.getElementById("buttons-block");
    this.amountComments = document.getElementById("amount-comments");
    this.commentsBlock = document.getElementById("comments");

    this.userReactionButtons = new UserReactionButtons(this.userId);

    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener("resize", () => {
      this.checkExpandButtons();
    });
  }

  declOfNum(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[
      number % 100 > 4 && number % 100 < 20
        ? 2
        : cases[number % 10 < 5 ? number % 10 : 5]
    ];
  }

  calculateDate(createTime) {
    const now = new Date();
    const past = new Date(createTime);

    const diffMs = now - past;
    if (diffMs < 0) return "только что";

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) {
      return `${seconds} ${this.declOfNum(seconds, [
        "секунда",
        "секунды",
        "секунд",
      ])} назад`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${this.declOfNum(minutes, [
        "минута",
        "минуты",
        "минут",
      ])} назад`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${this.declOfNum(hours, [
        "час",
        "часа",
        "часов",
      ])} назад`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} ${this.declOfNum(days, ["день", "дня", "дней"])} назад`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 5) {
      return `${weeks} ${this.declOfNum(weeks, [
        "неделя",
        "недели",
        "недель",
      ])} назад`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} ${this.declOfNum(months, [
        "месяц",
        "месяца",
        "месяцев",
      ])} назад`;
    }

    const years = Math.floor(days / 365);
    return `${years} ${this.declOfNum(years, ["год", "года", "лет"])} назад`;
  }

  initExpandHandlers() {
    document
      .querySelectorAll(".button-expand-description")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation(); // Предотвращаем всплытие
          this.toggleCommentExpand(e.currentTarget);
        });
      });

    // Обработчики для текста комментариев
    document.querySelectorAll(".comment-description").forEach((desc) => {
      desc.addEventListener("click", (event) => this.toggleDescription(event));
    });
  }

  toggleDescription(event) {
    const element = event.currentTarget; // или event.target, в зависимости от задачи
    const commentBlock = element.closest(".comment-block");
    const button = commentBlock.querySelector(".button-expand-description");

    if (button.style.display === "none") return;

    this.toggleCommentExpand(button);
  }

  toggleCommentExpand(element) {
    const commentBlock = element.closest(".comment-block");
    commentBlock.classList.toggle("expanded");

    const button = commentBlock.querySelector(".button-expand-description");
    const span = button.querySelector("span");
    span.textContent = commentBlock.classList.contains("expanded")
      ? "Свернуть"
      : "Раскрыть";
  }

  checkExpandButtons() {
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

  getReviewWord(count) {
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

  displayComments(courseReviews) {
    this.commentsBlock.innerHTML = "";

    let commentColor = null;
    let date = null;
    let messageUser = null;
    if (courseReviews.length > 0) {
      this.widgetBlock.style.display = "flex";
    } else {
      this.widgetBlock.style.display = "none";
    }
    courseReviews.forEach((review) => {
      if (review.rating >= 4) {
        commentColor = "good";
      } else if (review.rating === 3) {
        commentColor = "medium";
      } else if (review.rating <= 2) {
        commentColor = "bad";
      }
      date = this.calculateDate(review.createTime);

      messageUser = review.message ? stripHtmlTags(review.message) : "";

      let userReactionLike = null;
      let userReactionDislike = null;
      if (review.currentUserReaction) {
        if (review.currentUserReaction === "LIKE") {
          userReactionLike = "active";
        } else if (review.currentUserReaction === "DISLIKE") {
          userReactionDislike = "active";
        }
      }

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

      this.commentsBlock.innerHTML += comment;
    });

    const commentBlocks = this.commentsBlock.querySelectorAll(".comment-block");
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
      this.checkExpandButtons();
      this.initExpandHandlers(); // Инициализируем обработчики
    }, 0);

    if (courseReviews.length > 0) {
      this.userReactionButtons.addListenerOnUserMarks(courseReviews);
    }
    document.getElementById("preloader").style.display = "none";
  }

  displayRating(ratingInfo) {
    const rating = ratingInfo.rating;

    const formattedRating = Number.isInteger(rating)
      ? rating.toString()
      : rating.toFixed(1);
    document.getElementById("rating").innerText = `${formattedRating}/5`;

    const count = ratingInfo.reviewsTotalNumber;
    this.amountComments.innerText = `${count} ${this.getReviewWord(count)}`;

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
}

class UserCommentController {
  constructor(ratingController, filterManager) {
    this.ratingController = ratingController;
    this.filterManager = filterManager;
  }

  async sendComment(comment, rating) {
    const body = {
      rating: rating,
      comment: comment,
    };

    try {
      await fetchData(
        `course/${courseId}/review`,
        "POST",
        { "X-User-Id": userId },
        body,
        false
      );

      // Вызов методов через объекты
      this.filterManager.setActivePosition(0);
      this.ratingController.getReviews("NEW_FIRST", false);
    } catch (error) {
      console.error("Ошибка при отправке коммента:", error);
    }
  }

  async changeComment(reviewId, comment, rating) {
    const body = {
      reviewId: reviewId,
      rating: rating,
      comment: comment,
    };

    try {
      await fetchData(`course/${courseId}/review`, "PUT", {}, body, false);

      this.filterManager.setActivePosition(0);
      this.ratingController.getReviews("NEW_FIRST", false);
    } catch (error) {
      console.error("Ошибка при отправке коммента:", error);
    }
  }

  async deleteComment(reviewId) {
    try {
      const body = {
        reviewId: reviewId,
      };

      await fetchData(`course/${courseId}/review`, "DELETE", {}, body, false);

      // После удаления обновляем UI и отзывы
      buttonWriteComment.style.display = "flex";
      buttonChangeComment.style.display = "none";
      buttonDelete.style.display = "none";
      commentButtons.style.display = "none";
      commentZone.style.display = "none";
      textarea.value = "";
      starsRating.forEach((star) => {
        star.classList.remove("active");
      });

      this.filterManager.setActivePosition(0);
      this.ratingController.getReviews("NEW_FIRST", false);
    } catch (error) {
      console.error("Ошибка при отправке коммента:", error);
    }
  }
}

class UserCommentManager {
  constructor(userCommentController) {
    this.userCommentController = userCommentController;

    this.modal = document.getElementById("modal");
    this.buttonConfirmDelete = document.getElementById("yesButton");
    this.buttonCancelDelete = document.getElementById("noButton");

    this.buttonSendComment = document.getElementById("button-send-comment");
    this.buttonReverse = document.getElementById("button-reverse");

    this.maxLength = 2000;

    this.currentAction = null;

    this._bindEvents();
  }

  _bindEvents() {
    starsRating.forEach((star) => {
      star.addEventListener("click", () => {
        const rating = +star.getAttribute("data-value");
        updateStars(rating);
      });
    });

    buttonWriteComment.addEventListener("click", () => {
      buttonWriteComment.style.display = "none";
      commentButtons.style.display = "flex";
      commentZone.style.display = "flex";
      textarea.value = "";
      starsRating.forEach((star) => {
        star.classList.remove("active");
      });
    });

    this.buttonReverse.addEventListener("click", () => {
      const currentText = textarea.value;
      const currentStars = Array.from(starsRating).filter((star) =>
        star.classList.contains("active")
      ).length;

      const isTextChanged = currentText !== originalText;
      const isStarsChanged = currentStars !== originalStars;

      if (isTextChanged || isStarsChanged) {
        this.currentAction = "reverse";
        document.getElementById("modal-text").innerText =
          "Вы уверены, что хотите отменить отзыв?";
        this.modal.style.display = "flex";
      } else {
        this.resetButtons(reviews.currentUserReview);
      }
    });

    this.buttonSendComment.addEventListener("click", () => {
      if (currentRating === 0) {
        alert("Обязательно поставьте свою оценку!");
      } else if (!textarea.value) {
        const text = null;
        if (reviews.currentUserReview) {
          this.userCommentController.changeComment(
            reviews.currentUserReview.reviewId,
            text,
            currentRating
          );
          this.resetButtons(reviews.currentUserReview);
        } else {
          this.userCommentController.sendComment(text, currentRating);
          this.resetButtons(reviews.currentUserReview);
        }
      } else if (textarea.value) {
        if (reviews.currentUserReview) {
          const currentText = textarea.value;
          const currentStars = Array.from(starsRating).filter((star) =>
            star.classList.contains("active")
          ).length;

          const isTextChanged = currentText !== originalText;
          const isStarsChanged = currentStars !== originalStars;
          if (isTextChanged || isStarsChanged) {
            this.userCommentController.changeComment(
              reviews.currentUserReview.reviewId,
              stripHtmlTags(textarea.value),
              currentRating
            );
            this.resetButtons(reviews.currentUserReview);
          } else {
            alert("Ваш отзыв не изменился!");
          }
        } else {
          this.userCommentController.sendComment(
            stripHtmlTags(textarea.value),
            currentRating
          );
          this.resetButtons(reviews.currentUserReview);
        }
      }
    });

    buttonChangeComment.addEventListener("click", () => {
      commentZone.style.display = "flex";
      commentButtons.style.display = "flex";
      buttonChangeComment.style.display = "none";
    });

    document.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.modal.style.display = "none";
        this.currentAction = null;
      }
    });

    buttonDelete.addEventListener("click", () => {
      this.currentAction = "delete";
      document.getElementById("modal-text").innerText =
        "Вы уверены, что хотите удалить отзыв?";
      this.modal.style.display = "flex";
    });

    this.buttonConfirmDelete.addEventListener("click", () => {
      if (this.currentAction === "delete") {
        originalText = "";
        originalStars = 0;
        updateStars(originalStars);
        this.userCommentController.deleteComment(
          reviews.currentUserReview.reviewId
        );
      } else if (this.currentAction === "reverse") {
        this.resetButtons(reviews.currentUserReview);
        textarea.value = originalText;
        updateStars(originalStars);
      }
      this.modal.style.display = "none";
      this.currentAction = null; // Сбрасываем действие после подтверждения
    });

    this.buttonCancelDelete.addEventListener("click", () => {
      this.modal.style.display = "none";
      this.currentAction = null;
    });

    textarea.addEventListener("input", () => {
      const currentLength = textarea.value.length;
      if (currentLength > this.maxLength) {
        // Обрезаем текст до максимума
        textarea.value = textarea.value.substring(0, this.maxLength);
      }

      textarea.style.height = "auto"; // Сброс высоты
      textarea.style.height = textarea.scrollHeight + "px"; // Установка высоты по содержимому
    });
  }

  resetButtons(currentUserReview) {
    commentButtons.style.display = "none";
    commentZone.style.display = "none";

    buttonWriteComment.style.display = currentUserReview ? "none" : "flex";
    buttonChangeComment.style.display = currentUserReview ? "flex" : "none";
  }
}

class UserReactionController {
  constructor(userId) {
    this.userId = userId;
  }

  async sendUserReaction(reviewId, reaction) {
    try {
      const body = {
        reaction: reaction,
      };

      const response = await fetchData(
        `course/review/${reviewId}/reaction`,
        "POST",
        { "X-User-Id": this.userId },
        body,
        false
      );

      return response;
    } catch (error) {
      console.error("Ошибка при отправке реакции:", error);
    }
  }

  async updateUserReaction(reviewId, reaction) {
    try {
      const body = {
        reaction: reaction,
      };

      const response = await fetchData(
        `course/review/${reviewId}/reaction`,
        "PUT",
        { "X-User-Id": this.userId },
        body,
        false
      );

      return response;
    } catch (error) {
      console.error("Ошибка при изменении реакции:", error);
    }
  }

  async deleteUserReaction(reviewId) {
    try {
      const response = await fetchData(
        `course/review/${reviewId}/reaction`,
        "DELETE",
        { "X-User-Id": this.userId },
        null,
        false
      );

      return response;
    } catch (error) {
      console.error("Ошибка при удалении реакции:", error);
    }
  }
}

class UserReactionButtons {
  constructor(userId) {
    this.userId = userId;
    this.userReactionController = new UserReactionController(this.userId);
  }

  addListenerOnUserMarks(courseReviews) {
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
            const response =
              await this.userReactionController.deleteUserReaction(
                review.reviewId
              );

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

              response = await this.userReactionController.updateUserReaction(
                review.reviewId,
                "LIKE"
              );
            } else {
              // Новый лайк
              response = await this.userReactionController.sendUserReaction(
                review.reviewId,
                "LIKE"
              );
            }

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
            const response =
              await this.userReactionController.deleteUserReaction(
                review.reviewId
              );

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

              response = await this.userReactionController.updateUserReaction(
                review.reviewId,
                "DISLIKE"
              );
            } else {
              // Новый дизлайк
              response = await this.userReactionController.sendUserReaction(
                review.reviewId,
                "DISLIKE"
              );
            }

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
}

class FilterManager {
  constructor(activeIndex, ratingController) {
    this.activeIndex = activeIndex;
    this.ratingController = ratingController;
    this.widgetBlock = document.getElementById("buttons-block");
    this.buttons = this.widgetBlock.querySelectorAll(".widget-button");

    this.reviewTypes = [
      "NEW_FIRST",
      "POSITIVE_FIRST",
      "NEGATIVE_FIRST",
      "USEFUL_FIRST",
    ];
  }

  setActivePosition(index) {
    this.widgetBlock.style.setProperty("--pseudo-x", `${index * 100}%`);
    this.activeIndex = index;

    this.buttons.forEach((btn, i) => {
      btn.classList.toggle("active", i === index);
    });
  }

  init() {
    this.buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        if (this.activeIndex === index) return;

        this.setActivePosition(index);
        this.ratingController.getReviews(this.reviewTypes[index], true);
      });
    });
  }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const courseId = Number(urlParams.get("courseId"));

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id ?? 1;

const rating = new RatingController(userId, courseId);
const filterManager = new FilterManager(0, rating);

filterManager.init();

const userCommentController = new UserCommentController(rating, filterManager);
const userCommentManager = new UserCommentManager(userCommentController);

rating.getReviews("NEW_FIRST", false);

const refer = localStorage.getItem("refer");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");

catalogTab.style.animation = "none";
favorTab.style.animation = "none";
function setupCatalog() {
  catalogTab.style.color = "#ffffff";
}

function setupFavorite() {
  favorTab.style.color = "#ffffff";
}

if (refer.endsWith("favorite.html")) {
  setupFavorite();
} else if (refer.endsWith("catalog.html")) {
  setupCatalog();
}
