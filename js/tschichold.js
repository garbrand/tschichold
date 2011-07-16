var Tschichold = function(selector, target, registry, test) {
	// if(selector === undefined) return false;
	registry = registry || $({});
	target = target || 'body';
	test = test || false;
	
	// spread.page()		- return the current page we're on
	// spread.page(1) 	- set the current page
	// spread.pages()		- the number of pages at the current dimensions
	// spread.next()		- next page or false if there is none
	// spread.prev()		- previous page or false if there is none
	// spread.height()	- current height ajdusted for whole lines
	
	// buffer.text()		- get the text from the buffer
	// buffer.text('')	- set the text in the buffer
	// buffer.lines		- returns the number of lines of text at the current dimensions
	
	var model = {
		height: null,			// Integer height
		text: null,				// Cached copy of the text
		linesPerPage: null,	// Integer linesPerPage of the text
		linesInText: null,	// Number of lines the text would take at the current page size
		page: null,				// Current page
		textheight: null		// Total height of all the text
	};
	
	var view = {
		template: {
			spread: function() {
				// Template for the spread
				return '<div class="spread"></div>';
			},
			page: function() {
				// Template for two pages in a spread
				return '<div id="pageA" class="page"></div>' + '<div id="pageB" class="page"></div>';
			},
			buffer: function() {
				// Template for the off-screen text buffer
				return '<div id="tschichold-buffer"></div>';
			},
			thumb: function(id, label) {
				return '<div class="thumb '+id+'" id="tschichold-thumb-"'+id+'>'+label+'</div>';
			}
		},
		createBuffer: function(text) {
			var $buffer = $(view.template.buffer());
			$buffer.css({
				width: '33%',
				'margin-left': '-200%'
			}).html(text);
			// console.log(target, $buffer);
			$('body').append($buffer);
			return $buffer;
		},
		createSpread: function(callback) {
			// Append the spread and the pages to the target
			var $spread = $(view.template.spread());
			var prev = view.template.thumb('prev', '&lsaquo; Previous');
			var next = view.template.thumb('next', 'Next &rsaquo;');
			
			$spread.append(view.template.page(), prev, next).appendTo(target);
			callback();
		},
		calculateHeight: function() {
			// Calculate what the height should be in integer line-heights
			// Sets var height and var linesPerPage
			var $page = $('.page:first');
			model.height = $page.height();
			// console.log('height:', model.height);	
			var lineHeight = 24; // TODO: make this a robust function - parseFloat($page.css('line-height').slice(0,-2)); returns 'normal'
			var lines = Math.floor(model.height / lineHeight);
		
			model.linesPerPage = lines * lineHeight;
			
			return model.linesPerPage;
		},
		resetPageHeight: function() {
			// Reset the page height in percentages
			$('.page').css({bottom: '22.22%', height: 'auto'});
		},
		setPageHeight: function(height) {
			// Set the page height (in pixels)
			return $('.page').css({bottom: 'auto', height: height});
		},
		adjustHeight: function() {
			// Reset the spread dimensions to percentages, then re-calculate the pixel dimensions to make the spread integer line-heights
			view.resetPageHeight();

			model.linesPerPage = view.calculateHeight();
			view.setPageHeight(model.linesPerPage);
		},
		setText: function(text) {
			// Set the initial text to the page
			$('#tschichold.buffer').append(text);
			$('#pageA').append(text.clone());
			$('#pageB').append(text.clone());
		},
		flowText: function() {
			// Flow the text across the pages, according to the page we are on
			$('#pageA .text').css('margin-top', 0);
			$('#pageB .text').css('margin-top', -1 * model.linesPerPage);
		},
		calculateNumberOfPages: function() {
			// Get the number of lines in the buffer at the current dimensions
			var linesInBuffer = Math.ceil($('#tschichold-buffer').height()/24);
			// console.log(linesInBuffer, model.linesPerPage/24);
		}
	};
	
	var events = {
		resize: function() {
			// Recalculate the height to fit integer line-heights, the reflow the text
			$(window).resize(function(){
				view.adjustHeight();
				view.flowText();
				view.calculateNumberOfPages();
			});
		},
		next: function() {
			$('.next').click(function() {
				$('.text').animate({'margin-top': '-='+model.linesPerPage}, 0);
			});
		},
		prev: function() {
			$('.prev').click(function() {
				$('.text').animate({'margin-top': '+='+model.linesPerPage}, 0);
			});
		},
		scroll: function() {
			// Go to the next or prev page, depending on scroll direction
		},
		doneRendering: function() {
			registry.trigger('done');
		}
	};
	
	var controller = {
		test: function(arg) {
			console.log(arg);
		},
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
	
	return (test) ? api.testing() : api.production();
};