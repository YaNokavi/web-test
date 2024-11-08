/*** Плангин просмотра картинок ***/
(function($){
	// регистрируем плагин jquery
	$.fn.iview = function(options){  
		console.log("------------")
		console.log("init", options)
		options = $.extend({}, options)
		return this.each(function(){
			init($(this), options)
		})
	}
	// инициализация картинок на странице
	function init(elem, options){
    
		// обработанные элементы пропускаем
		if(elem.hasClass("iview-ok"))
			return
		// извлекаем настройки элемента
		var data = elem.data('iview')
		if(data === 'disable')
			return
		var img = getData(data)
		var opt = $.extend({}, options)
		if(img) opt.img = img
		switch(elem.prop('tagName')){
			case 'IMG': // картинка
				elem.data('iview', opt).addClass('iview-image')	
				break;
			case 'A': // ссылка 
				var href = elem.attr('href')
				opt.img = function(){return href;}
				// pass throw
			default: // контейнер с картинками
				elem.find('IMG').each(function(){
					console.log("cont", opt)
					init($(this), opt)
				})
		}
		elem.addClass('iview-ok');
	}
	// получение настроек картинки из атрибута data-ivew
	// возвращает фунцию для получения карьтинки просмотра, 
	// обрабатывающую url исходной картинки
	// или null, если атрибут пустой или заполнен неверно 
	function getData(data){
    
		if(! data)
			return null;
		if(typeof data !== 'string')
			return null;
		data = data.trim()
		if(! data.length) 
			return null;
		data = data.split(/\s+/);
		if(data.length == 1)
			return function(src){
				return data[0]
			} 
		if(data.length == 3 && data[0] == 'replace')
			return function(src){
				return src.replace(data[1], data[2]);
			} 
		return null;	
	}
	// конструируем "смотрелку" картинки
	var overlay = $('<div class="iview-overlay">').appendTo(document.body)
	var preview = $('<div class="iview-preview">').appendTo(overlay)
	var caption = $('<div class="iview-caption">').appendTo(overlay)
	$('<div class="iview-closer">&times;</div>').appendTo(overlay)
	// установить в просмотре картинку и подпись 
	function setPreview(url, text){
		preview.css('background-image', url ? 'url('+url+')' : '')
		caption.text(text)
	}
	// при клике в просмотр закрывыаем его 
	$(document).on('click', '.iview-overlay', function(e){
		e.preventDefault();
		setPreview('', '')
		overlay.fadeOut()
	})
	// при клике в картинку страницы открываем просмотр
	$(document).on('click', '.iview-image', function(e){
		e.preventDefault();
		// открываем просмотр, пока пустой
		overlay.fadeIn()
		// получаем элемент, url его картинки и настройки
		var e = $(this), 
			src = e.attr('src'), 
			text = e.attr('alt'), 
			data = e.data('iview')
		// определяем картинку, которубю показываем
		var dst = src
		if(data.img)
			try{
				dst = data.img(src) 
			}catch(e){
				logError(e)
			}
		// предварительная загрузка картинки
		var img = new Image();
		// после загрузки показываем картинку
		img.onload = function(){
			setPreview(dst, text)
		}
		// при ошибке ругаемся и показываем исходную картинку
		img.onerror = function(){
			logError("Can't load image: "+ dst)
			setPreview(src, text)
		}
		// запускаем загрузку
		img.src = dst;
	})
	// вывести ошибку в консоль браузера, если есть
	function logError(error) {
		if(window.console)
			window.console.error(error)
	}
	// сразу применяем плагин ко всем элементам с атрибутом data-iview
	$('[data-iview]').iview()

})(jQuery);

