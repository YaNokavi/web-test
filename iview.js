(function ($) {
  $.fn.iview = function (options) {
    options = $.extend({}, options);
    return this.each(function () {
      init($(this), options);
    });
  };

  function init(elem, options) {
    if (elem.hasClass("iview-ok")) return;
    var data = elem.data("iview");
    if (data === "disable") return;
    var img = getData(data);
    var opt = $.extend({}, options);
    if (img) opt.img = img;

    switch (elem.prop("tagName")) {
      case "IMG":
        elem.data("iview", opt).addClass("iview-image");
        break;
      case "A":
        var href = elem.attr("href");
        opt.img = function () {
          return href;
        };
        break;
      default:
        elem.find("IMG").each(function () {
          init($(this), opt);
        });
    }

    elem.addClass("iview-ok");
  }

  function getData(data) {
    if (!data) return null;
    if (typeof data !== "string") return null;
    data = data.trim();
    if (!data.length) return null;
    data = data.split(/\s+/);

    if (data.length == 1)
      return function (src) {
        return data[0];
      };
    if (data.length == 3 && data[0] == "replace")
      return function (src) {
        return src.replace(data[1], data[2]);
      };

    return null;
  }

  var overlay = $('<div class="iview-overlay">').appendTo(document.body);
  var preview = $('<div class="iview-preview">').appendTo(overlay);
  var caption = $('<div class="iview-caption">').appendTo(overlay);
  $('<div class="iview-closer">&times;</div>').appendTo(overlay);

  var scale = 1; // начальный масштаб
  var isDragging = false; // флаг для отслеживания перетаскивания
  var startX, startY;
  var offsetX = 0,
    offsetY = 0;

  // Обновление функции setPreview для корректного отображения
  // Установка предварительного просмотра
  // function setPreview(url, text) {
  //   if (url) {
  //       // Создаем временный элемент изображения для получения его размеров
  //       var img = new Image();
  //       img.src = url;

  //       img.onload = function() {
  //           // Устанавливаем размеры на основе загруженного изображения
  //           var aspectRatio = img.width / img.height;
  //           var newWidth = Math.min(window.innerWidth * 0.9, img.width);
  //           var newHeight = newWidth / aspectRatio;

  //           // Устанавливаем размеры элемента
  //           preview.css({
  //               "background-image": "url(" + url + ")",
  //               transform: "scale(" + scale + ")",
  //               "background-position": offsetX + "px " + offsetY + "px",
  //               width: newWidth + "px",
  //               height: newHeight + "px"
  //           });
  //           caption.text(text);
  //       };

  //       img.onerror = function() {
  //           logError("Can't load image: " + url);
  //           // В случае ошибки можно установить пустое изображение или другое действие
  //       };
  //   } else {
  //       preview.css({
  //           "background-image": "",
  //           width: "0px",
  //           height: "0px"
  //       });
  //       caption.text("");
  //   }
  // }

  function setPreview(url, text) {
    if (url) {
      var img = new Image();
      img.src = url;

      img.onload = function () {
        var aspectRatio = img.width / img.height;
        var newWidth = Math.min(window.innerWidth * 0.9, img.width);
        var newHeight = newWidth / aspectRatio;

        preview.css({
          "background-image": "url(" + url + ")",
          width: newWidth + "px",
          height: newHeight + "px",
          transform: `translate(-50%, -50%) scale(1)`,
        });
        caption.text(text);
      };

      img.onerror = function () {
        logError("Can't load image: " + url);
      };
    } else {
      preview.css({
        "background-image": "",
        width: "0px",
        height: "0px",
      });
      caption.text("");
    }
  }

  $(document).on("click", ".iview-closer", function () {
    // Сбрасываем масштаб и позицию
    scale = 1;
    offsetX = 0;
    offsetY = 0;

    setPreview("", ""); // Очищаем изображение
    overlay.fadeOut(); // Скрываем оверлей
  });

  // Обработка событий колесика мыши для увеличения/уменьшения
  $(document).on("wheel", ".iview-preview", function (e) {
    // e.preventDefault();
    // if (e.originalEvent.deltaY < 0) {
    //     scale *= 1.1; // увеличение
    // } else {
    //     scale /= 1.1; // уменьшение
    // }

    // // Ограничиваем масштабирование
    // scale = Math.max(scale, 1); // минимальный масштаб
    // scale = Math.min(scale, 5); // максимальный масштаб

    // e.preventDefault();
    // const scaleFactor = e.originalEvent.deltaY < 0 ? 1.1 : 0.9; // Увеличение или уменьшение масштаба
    // scale *= scaleFactor;

    // // Ограничиваем масштабирование
    // scale = Math.max(scale, 1); // минимальный масштаб
    // scale = Math.min(scale, 5); // максимальный масштаб

    // const imgWidth = $(".iview-preview").width();
    // const imgHeight = $(".iview-preview").height();

    // $(".iview-preview").css({
    //   transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    // });

    e.preventDefault();

    const scaleFactor = e.originalEvent.deltaY < 0 ? 1.1 : 0.9; // Увеличение или уменьшение масштаба
    const mouseX = e.originalEvent.clientX; // Позиция курсора по X
    const mouseY = e.originalEvent.clientY; // Позиция курсора по Y

    // Обновляем масштаб
    scale *= scaleFactor;

    // Ограничиваем масштабирование
    scale = Math.max(scale, 1); // минимальный масштаб
    scale = Math.min(scale, 5); // максимальный масштаб

    // Вычисляем текущее смещение
    const currentTransform = getCurrentTransformValues();
    offsetX = currentTransform.x;
    offsetY = currentTransform.y;

    // Пересчитываем новое смещение для центрирования зума на курсоре
    offsetX += (mouseX - offsetX) * (1 - scaleFactor);
    offsetY += (mouseY - offsetY) * (1 - scaleFactor);

    // Применяем трансформацию
    preview.css({
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    });
  });

  // $(document).on("wheel", ".iview-preview", function (e) {
  //   e.preventDefault();
  //   const scaleFactor = e.originalEvent.deltaY < 0 ? 1.1 : 0.9; // Увеличение или уменьшение масштаба
  //   scale *= scaleFactor;

  //   // Ограничиваем масштабирование
  //   scale = Math.max(scale, 1); // минимальный масштаб
  //   scale = Math.min(scale, 5); // максимальный масштаб

  //   // Пересчитываем позицию
  //   const imgWidth = preview.width();
  //   const imgHeight = preview.height();

  //   const newWidth = imgWidth * scaleFactor;
  //   const newHeight = imgHeight * scaleFactor;

  //   const offsetXCenter = (newWidth - imgWidth) / 2;
  //   const offsetYCenter = (newHeight - imgHeight) / 2;

  //   offsetX += offsetXCenter;
  //   offsetY += offsetYCenter;

  //   // Применяем новые размеры и трансформацию
  //   preview.css({
  //     width: newWidth + "px",
  //     height: newHeight + "px",
  //     transform: `translate(${offsetX + offsetXCenter}px, ${
  //       offsetY + offsetYCenter
  //     }px) scale(${scale})`,
  //   });
  // //   preview.css({
  // //     transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
  // // });

  // // Обновляем текущий масштаб
  // });

  // Обработка событий мыши для перетаскивания
  // $(document).on("mousedown touchstart", ".iview-preview", function (e) {
  //   isDragging = true;
  //   startX = (e.pageX || e.originalEvent.touches[0].pageX);
  //   startY = (e.pageY || e.originalEvent.touches[0].pageY);
  //   $(this).css("cursor", "grabbing");
  // });

  // $(document).on("mousemove touchmove", function (e) {
  //   if (isDragging) {
  //       // Вычисляем новое смещение
  //       const newX = (e.pageX || e.originalEvent.touches[0].pageX);
  //       const newY = (e.pageY || e.originalEvent.touches[0].pageY);

  //       // Обновляем offsetX и offsetY
  //       offsetX += newX - startX;
  //       offsetY += newY - startY;

  //       // Обновляем начальные координаты для следующего перемещения
  //       startX = newX;
  //       startY = newY;

  //       // Устанавливаем новое положение фона
  //       setPreview(
  //           preview.css("background-image").replace(/url\((['"]?)(.*?)\1\)/, "$2"),
  //           caption.text()
  //       );
  //   }
  // });

  const getCurrentTransformValues = () => {
    const matrix = preview.css("transform");
    if (matrix === "none") return { x: 0, y: 0 };

    const values = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
    return {
      x: parseFloat(values[4]), // translateX
      y: parseFloat(values[5]), // translateY
      scale: parseFloat(values[0]),
    };
  };

  $(document).on("mousedown touchstart", ".iview-preview", function (e) {
    isDragging = true;
    startX = e.pageX || e.originalEvent.touches[0].pageX;
    startY = e.pageY || e.originalEvent.touches[0].pageY;

    const currentTransform = getCurrentTransformValues();
    offsetX = currentTransform.x;
    offsetY = currentTransform.y;
    $(this).css("cursor", "grabbing");
  });

  // $(document).on("mousemove touchmove", function (e) {
  //   if (isDragging) {
  //       const newX = (e.pageX || e.originalEvent.touches[0].pageX);
  //       const newY = (e.pageY || e.originalEvent.touches[0].pageY);

  //       offsetX += newX - startX;
  //       offsetY += newY - startY;

  //       startX = newX;
  //       startY = newY;

  //       setPreview(
  //           preview.css("background-image").replace(/url\((['"]?)(.*?)\1\)/, "$2"),
  //           caption.text()
  //       );
  //   }
  // });

  $(document).on("mousemove touchmove", function (e) {
    if (isDragging) {
      const newX = e.pageX || e.originalEvent.touches[0].pageX;
      const newY = e.pageY || e.originalEvent.touches[0].pageY;

      offsetX += newX - startX;
      offsetY += newY - startY;

      startX = newX;
      startY = newY;

      preview.css({
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
      });
    }
  });

  $(document).on("mouseup touchend", function () {
    isDragging = false;
    $(".iview-preview").css("cursor", "grab");
  });

  $(document).on("mouseleave touchcancel", function () {
    isDragging = false;
    $(".iview-preview").css("cursor", "grab");
  });

  let initialDistance = null;

  $(document).on("touchmove", ".iview-preview", function (e) {
    if (e.originalEvent.touches.length === 2) {
      const dx =
        e.originalEvent.touches[0].pageX - e.originalEvent.touches[1].pageX;
      const dy =
        e.originalEvent.touches[0].pageY - e.originalEvent.touches[1].pageY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (initialDistance === null) {
        initialDistance = distance;
      } else {
        scale *= distance / initialDistance;
        initialDistance = distance; // обновляем начальное расстояние
        scale = Math.max(scale, 1); // минимальный масштаб
        scale = Math.min(scale, 5);
        preview.css({
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        });
      }
    }
  });

  $(document).on("touchend", function () {
    initialDistance = null; // сбрасываем начальное расстояние при завершении касания
  });

  // Закрытие при клике вне изображения
  $(document).on("click", ".iview-overlay", function (e) {
    if (!$(e.target).closest(".iview-preview").length) {
      // Проверяем, не кликнули ли мы по изображению
      scale = 1; // сброс масштаба
      offsetX = 0; // сброс смещения по X
      offsetY = 0; // сброс смещения по Y
      setPreview("", "");
      overlay.fadeOut();
    }
  });

  $(document).on("click", ".iview-image", function (e) {
    e.preventDefault();

    // scale = 1;
    // offsetX = 0;
    // offsetY = 0;

    overlay.fadeIn();

    var src = $(this).attr("src"),
      text = $(this).attr("alt"),
      data = $(this).data("iview");

    var dst = src;

    if (data.img)
      try {
        dst = data.img(src);
      } catch (e) {
        logError(e);
      }

    var img = new Image();

    img.onload = function () {
      setPreview(dst, text);
    };

    img.onerror = function () {
      logError("Can't load image: " + dst);
      setPreview(src, text);
    };

    img.src = dst;
  });

  function logError(error) {
    if (window.console) window.console.error(error);
  }

  $("[data-iview]").iview();
})(jQuery);
