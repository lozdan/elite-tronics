/**
 * SuperBox
 * The lightbox reimagined. Fully responsive HTML5 image galleries.
 * 
 * Latest version: https://github.com/seyDoggy/superbox
 * Original version: https://github.com/toddmotto/superbox
 * 
 * License <https://github.com/seyDoggy/superbox/blob/master/LICENSE.txt>
 */
 ;(function($, undefined) {
	'use strict';

	var pluginName = 'SuperBox',
		pluginVersion = '3.0.9';

	$.fn.SuperBox = function(options) {

		/*
		 * OPTIONS
		 */
		var defaults = $.extend({
			background : null,
			border : null,
			height : 400,
			view : 'landscape',
			xColor : null,
			xShadow : 'none'
		}, options);

		/*
		 * DECLARATIONS
		 */
		var sbIsIconShown = false,
			sdIsNavReady = false,
			sbShow = $('<div class="superbox-show"/>'),
			sbImg = $('<media src="media/ajax-loader.gif" class="superbox-current-media"/>'),
			sbClose = $('<a href="#" class="superbox-close"><i class="icon-remove-sign"></i></a>'),
			sbPrev = $('<a href="#" class="superbox-prev"><i class="icon-circle-arrow-left"></i></a>'),
			sbNext = $('<a href="#" class="superbox-next"><i class="icon-circle-arrow-right"></i></a>'),
			sbFloat = $('<div class="superbox-float"/>'),
			sbList = this.find('>div'),
			sbList8 = this.find('>div:nth-child(8n)'),
			sbList6 = this.find('>div:nth-child(6n)'),
			sbList4 = this.find('>div:nth-child(4n)'),
			sbList2 = this.find('>div:nth-child(2n)');

		/*
		 * METHODS
		 */
		/**
		 * setSuperboxLayout
		 * 
		 * Removes previously set classes,
		 * Add classes based on parent width,
		 * Set .superbox.show width based number of columns
		 */
		var setSuperboxLayout = function(num){
			var setColumns = function(num){
				var lastItem,
					columnClass = 'superbox-' + num,
					classArray = ['superbox-last','superbox-8','superbox-6','superbox-4','superbox-2'];
				if (num === 8) {
					lastItem = sbList8;
				} else if (num === 6) {
					lastItem = sbList6;
				} else if (num === 4) {
					lastItem = sbList4;
				} else if (num === 2) {
					lastItem = sbList2;
				}
				/*
				 * remove classes
				 */
				for (var i = classArray.length - 1; i >= 0; i--) {
					sbList.removeClass(classArray[i]);
				}
				/*
				 * add classes
				 */
				sbList.addClass(columnClass);
				lastItem.add(sbList.last()).addClass('superbox-last');
				/*
				 * set superbox-show width
				 */
				if ($('.superbox-show').outerWidth(true) != sbList.width()*num) {
					$('.superbox-show').outerWidth(sbList.width()*num);
				}
			};
			if ($('.superbox-active').width() > 1024) {
				setColumns(8);
			} else if ($('.superbox-active').width() > 767) {
				setColumns(6);
			} else if ($('.superbox-active').width() > 320) {
				setColumns(4);
			} else {
				setColumns(2);
			}
		};

		/**
		 * setSuperBoxHeight
		 * 
		 * Set superbox-show outer height based on default height,
		 * based on viewport height,
		 * based on standard 2:3 ratio,
		 * based on default orientation.
		 */
		var setSuperBoxHeight = (function(){
			var thisWidth = $('.superbox-show').outerWidth(true),
				thisHeight = defaults.height + (16 * 3), /* 1.5em padding */
				newHeight = thisHeight,
				thisWindow = $(window).height() * 0.80,
				thisView = defaults.view,
				thisRatio = 0.6667;

			if (newHeight > thisWindow) {
				newHeight = thisWindow;
			}
			if ((thisView === 'landscape') && (thisWidth < newHeight / thisRatio)) {
				newHeight = thisWidth * thisRatio;
			}
			if ((thisView === 'portrait') && (thisWidth < newHeight * thisRatio)) {
				newHeight = thisWidth / thisRatio;
			}
			if ((thisView === 'square') && (thisWidth < newHeight)) {
				newHeight = thisWidth;
			}
			$('.superbox-show').outerHeight(newHeight);
		});

		/**
		 * createSuperboxShow
		 * 
		 * Dynamically create superbox-show and insert it after superbox-last,
		 * apply data-media of the thumbnail to the source of the full image,
		 * preload previous and next full size image data into DOM,
		 * open the superbox-show,
		 * fade in and out of each image,
		 * animate image to top of clicked row,
		 * close superbox-show when X is clicked,
		 * close superbox-show when open image is clicked
		 */
		var createSuperboxShow = function(elem){
			/*
			 * DECLARATIONS (createSuperboxShow)
			 */
			var noSuperbox = !$('.superbox-show').length,
				isOpen = elem.hasClass('superbox-O'),
				notLast = !elem.hasClass('superbox-last'),
				notInRow = !elem.nextAll('.superbox-last:first').next('.superbox-show').length,
				showNotNext = !elem.next('.superbox-show').length,
			/*
			 * METHODS (createSuperboxShow)
			 */
				openSuperBoxShow = function(type){
					if (type === 'A') {
						sbShow.append(sbImg).append(sbClose).append(sbPrev).append(sbNext).insertAfter(elem.nextAll('.superbox-last:first'));
					} else {
						sbShow.append(sbImg).append(sbClose).insertAfter(elem);
					}
					setSuperBoxHeight();
					setSuperboxLayout();
					setImageData();
					$('.superbox-show').slideDown('slow',function(){
						moveToTop();
						setOpenClass(true);
						revealImage(true);
						if (sdIsNavReady === false) {
							$('.superbox-prev,.superbox-next').on('click',function(event){
								navigation($(this),event);
								sdIsNavReady = true;
							});
						}
					});
				},
				setImageData = function(){
					$('.superbox-show media.superbox-current-media').attr('src',elem.find('media').data('media'));
					preloadImageData();
				},
				preloadImageData = function(){
					var imgPrev = new Image(),
						imgNext = new Image();
					imgPrev.src = elem.prev('.superbox-list').find('media').data('media');
					imgNext.src = elem.nextAll('.superbox-list:first').find('media').data('media');
				},
				moveToTop = function(){
					$('html, body').animate({
						scrollTop:$('.superbox-show').offset().top - elem.width()
					}, 'medium');
				},
				setOpenClass = function(bool){
					if (bool === true) {
						sbList.removeClass('superbox-O');
						elem.addClass('superbox-O');
					} else {
						sbList.removeClass('superbox-O');
					}
				},
				revealImage = function(bool){
					if (bool === true) {
						$('.superbox-show media.superbox-current-media').animate({opacity:1},750);
						if (sbIsIconShown === false) {
							revealIcons(true);
						}
					} else {
						$('.superbox-show media.superbox-current-media').animate({opacity:0},100,function(){
							setImageData();
						});
					}
				},
				revealIcons = function(bool){
					if (bool === true) {
						sbIsIconShown = true;
						$('.superbox-close, .superbox-prev, .superbox-next').animate({opacity:0.7},750);
					} else {
						sbIsIconShown = false;
						$('.superbox-close, .superbox-prev, .superbox-next').animate({opacity:0},100);
					}
				},
				quickSwap = function(){
					revealImage(false);
					revealImage(true);
					setOpenClass(true);
				},
				closeSuperBoxShow = function(){
					var closeUp = function(){
						revealImage(false);
						revealIcons(false);
						$('.superbox-show').slideUp(function(){
							$(this).remove();
							setOpenClass(false);
							sdIsNavReady = false;
						});
					};
					$('.superbox-close').on('click',function(event){
						event.preventDefault();
						closeUp();
					});
					if (isOpen === true) {
						closeUp();
					}
				};

			/*
			 * IMPLEMENTATION (createSuperboxShow)
			 */
			if (isOpen === false) {
				if (notLast === true && notInRow === true) {
					if (noSuperbox === true) {
						openSuperBoxShow('A');
					} else {
						revealImage(false);
						revealIcons(false);
						$('.superbox-show').slideUp(function(){
							openSuperBoxShow('A');
						});
					}
				} else if (notLast === false && showNotNext === true) {
					if (noSuperbox === true) {
						openSuperBoxShow('B');
					} else {
						revealImage(false);
						revealIcons(false);
						$('.superbox-show').slideUp(function(){
							openSuperBoxShow('B');
						});
					}
				} else {
					quickSwap();
				}
			}
			closeSuperBoxShow();
		};

		/**
		 * keepShowAfterLast
		 * 
		 * Move superbox-show to after superbox-last when window is resized
		 */
		var keepShowAfterLast = function(){
			$(window).resize(function(){
				if ($('.superbox-O').hasClass('superbox-last')) {
					$('.superbox-show').insertAfter($('.superbox-O'));
				} else {
					$('.superbox-show').insertAfter($('.superbox-O').nextAll('.superbox-last:first'));
				}
			});
		};

		/**
		 * useDefaults
		 * 
		 * Make us of and apply user settings
		 */
		var useDefaults = function(){
			if (defaults.background !== null) {
				$('.superbox-show ').css('background-color',defaults.background);
			}
			if (defaults.border !== null) {
				$('.superbox-show media.superbox-current-media').css('border-color',defaults.border);
			}
			if (defaults.xColor !== null) {
				$('.superbox-close, .superbox-prev, .superbox-next').css('color',defaults.xColor);
			}
			if (defaults.xShadow == 'emboss') {
				$('.superbox-close, .superbox-prev, .superbox-next').css('text-shadow','0 1px 0 rgba(0,0,0,0.6), 0 -1px 0 rgba(250,250,250,0.2)');
			} else if (defaults.xShadow == 'embed') {
				$('.superbox-close, .superbox-prev, .superbox-next').css('text-shadow','0 -1px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(250,250,250,0.5)');
			}
		};

		/**
		 * navigation
		 * 
		 * activates navigation based on action or selector
		 */
		var navigation = function(select,event){
			event.preventDefault();
			var direction = null,
				selector = null;
			if (event.keyCode == 37 || select.hasClass('superbox-prev')) {
				/*
				 * go left
				 */
				direction = 'prev';
				selector = '.superbox-list';
			} else if (event.keyCode == 39 || select.hasClass('superbox-next')) {
				/*
				 * go right
				 */
				direction = 'nextAll';
				selector = '.superbox-list:first';
			}
			if (direction !== null) {
				$('.superbox-O')[direction](selector).click();
			}
		};

		/**
		 * keyBoardNav
		 * 
		 * Allows use of left and right arrow keys to navigate through images.
		 */
		var keyBoardNav = function(){
			if (sdIsNavReady === false) {
				$(document.documentElement).keyup(function (event) {
					navigation($(this),event);
					sdIsNavReady = true;
				});
			}
		};

		/*
		 * IMPLEMENTATION
		 */

		/*
		 * Add superbox-active class to allow for CSS to take hold
		 */
		this.addClass('superbox-active');

		/*
		 * Add superbox-list class for easier CSS targeting
		 */
		sbList.addClass('superbox-list');

		/*
		 * Adjust superbox-show height and width based on window size
		 */
		setSuperboxLayout();
		$(window).resize(function(){
			setSuperBoxHeight();
			setSuperboxLayout();
		});

		/*
		 * Create final float
		 */
		sbFloat.appendTo(this);

		/*
		 * Preload image data when thumbnail is hovered over
		 */
		sbList.on('mouseenter',function(){
			var img = new Image(),
				source = $(this).find('media').data('media');
			$(img).attr('src',source);
		});

		/*
		 * Open/Close superbox-show based on click
		 */
		sbList.on('click',function(){
			/*
			 * Create superbox-show
			 */
			createSuperboxShow($(this));

			/*
			 * Apply user settings
			 */
			useDefaults();
		});

		/*
		 * Keep superbox-show after the proper row at all times
		 */
		keepShowAfterLast();

		/*
		 * Enable keyboard navigation
		 */
		keyBoardNav();

		return this;
	};
})(jQuery);