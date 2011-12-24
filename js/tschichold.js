// 
//  tschichold.js
//  tschichold
//  
//  Created by Garbrand van der Molen on 2011-12-24.
//  Copyright 2011 Garbrand. All rights reserved.
// 


// # Tschichold
// Classical canon of page construction for the digital age.

var Tschichold = function(selector, target, registry) {
	// Defaults
	registry = registry || $({});
	target = target || 'body';
	
	// Cache jQuery selectors
	var $body = $('body')
	, $buffer
	, $pread
	, $next
	, $prev
	, $text
	, $page
	, $pageA
	, $pageB;

	
	// # Model
	var model = {
		height: null,			// Integer height
		text: null,				// Cached copy of the text
		linesPerPage: null,	// Integer linesPerPage of the text
		pageHeight: null,
		linesInText: null,	// Number of lines the text would take at the current page size
		page: null,				// Current page
		textheight: null,		// Total height of all the text
		lineHeight: null
	};
	
	
	
	// # View
	var view = {
		template: {
			spread: function() {
				// Template for the spread
				return '<div class="spread"></div>';
			},
			page: function(id) {
				// Template for two pages in a spread
				return $('<div />', { 
					id: 'page' + id, 
					'class': 'page' 
				});
			},
			buffer: function() {
				// Template for the off-screen text buffer
				return $('<div id="tschichold-buffer"></div>');
			},
			thumb: function(id, label) {
				// Decode the entities in `label` by creating a jQuery object, then grabbing the text
				var text = $("<div/>").html(label).text();
				
				return $('<div />', {
					id: 'tschichold-thumb-' + id,
					text: decodeURI(text),
					"class": 'thumb ' + id 
				});
			}
		},
		
		createBuffer: function(text) {
			$buffer = view.template.buffer();
			$buffer.css({
				'width': '33%',
				'margin-left': '-200%'
			}).html(text);

			$body.append($buffer);
			return $buffer;
		},
		
		createSpread: function(callback) {
			// Append the spread and the pages to the target
			$spread = $(view.template.spread());
			$prev = view.template.thumb('prev', '&lsaquo; Previous');
			$next = view.template.thumb('next', 'Next &rsaquo;');
			$pageA = view.template.page('A');
			$pageB = view.template.page('B');
			
			$spread.append($pageA, $pageB, $prev, $next).appendTo(target);
			
			callback();
		},
		
		calculateHeight: function() {
			// Calculate what the height should be in integer line-heights
			// Sets var `height` and var `linesPerPage`
			model.height = $pageA.height();
			model.lineHeight = parseFloat($body.css('line-height').slice(0, -2));
			var lines = Math.floor(model.height / model.lineHeight);
		
			// TODO: change linesPerPage to pageHeight, add a new variable to hold actual linesPerPage
			return model.linesPerPage = lines * model.lineHeight;
		},
		
		resetPageHeight: function() {
			// Reset the page height in percentages
			$pageA.add($pageB).css({bottom: '22.22%', height: 'auto'});
		},
		
		setPageHeight: function(height) {
			// Set the page height (in pixels)
			return $('.page').css({bottom: 'auto', height: height});
		},
		
		adjustHeight: function() {
			// Reset the spread dimensions to percentages, then re-calculate the pixel dimensions to make the spread integer line-heights
			view.resetPageHeight();

			view.calculateHeight();
			view.setPageHeight(model.linesPerPage);
		},
		
		setText: function(text) {
			// Set the initial text to the page
			$buffer.append(text);
			$pageA.add($pageB).append(text.clone());
		},
		
		flowText: function() {
			// Flow the text across the pages, according to the page we are on
			$pageA.find('.text').css('margin-top', 0);
			$pageB.find('.text').css('margin-top', -1 * model.linesPerPage);
			
			return $text = $('.text');
		},
		
		calculateNumberOfPages: function() {
			// Get the number of lines in the buffer at the current dimensions
			// TODO: recheck this on resize
			// TODO: seems we're setting the line-height in hard pixels
			var lines = Math.ceil($buffer.height()/model.lineHeight);
			console.log(lines, model.linesPerPage/model.lineHeight);
		}
	};
	
	
	
	// # Events
	var events = {
		resize: function() {
			// Recalculate the height to fit integer line-heights, the reflow the text
			// Throttle this function, as it can send an overwhelming amount of events
			var scroll = false
			, interval;
			
			$(window).resize(function(){
				scroll = true;
			});
			
			interval = setInterval(function() {
				if(scroll) {
					scroll = false;
					
					view.adjustHeight();
					view.flowText();
					view.calculateNumberOfPages();
				}
			}, 250);
			
			// Return the interval id so we can use this to call `clearTimeout(interval)`
			return interval;
		},
		next: function() {
			$next.click(function() {
				$text.animate({'margin-top': '-='+model.linesPerPage*2}, 0);
			});
		},
		prev: function() {
			$prev.click(function() {
				$text.animate({'margin-top': '+='+model.linesPerPage*2}, 0);
			});
		},
		doneRendering: function() {
			registry.trigger('done');
		}
	};
	
	
	
	// # Controller
	var controller = {
		init: function() {
			// Initialize
			model.textheight = $(selector).height();
 			model.text = $(selector).clone();
			$(selector).remove();
			
			// Setup
			view.createBuffer(model.text);
			view.createSpread(function() {
				// Appending to the DOM takes a moment, do the other DOM operations in this callback
				view.setText(model.text);
				view.adjustHeight();
				view.flowText();
				view.calculateNumberOfPages();
				events.doneRendering();
			});
			
			// Events
			events.resize();
			events.next();
			events.prev();
		}
	};
	
	
	
	// # API
	var api = {
		production: function() {
			return {
				init: controller.init
			};
		},
		
		testing: function() {
			return {
				model: model,
				view: view,
				controller: controller,
				events: events,
				api: api.production()
			};
		}
	};
	
	// If we run in the context of QUnit, return the test API
	return (typeof QUnit == 'undefined') ? api.production() :  api.testing();
};