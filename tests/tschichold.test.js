module("Tschichold", {
	setup: function() {
		var that = this;
		this.registry = $({});
		this.t = Tschichold('#fixture', '#hidden', this.registry, true);
		
		$('body').append('<div id="hidden"></div>');
		
		$('#hidden').load('fixtures/text.html #fixture', function() {
			that.registry.trigger('loaded');
		});
	},
	teardown: function() {
		$('#hidden').remove();
		this.registry = null;
		this.t = null;
	}
});

asyncTest('Basic Tests', function() {
	var t = this.t;
	this.registry.bind('loaded', function(event,data) {
		start();
		ok(t, 'Tschichold lives!');
		ok('model' in t, 'Model is exposed');
		ok('view' in t, 'View is exposed');
		ok('controller' in t, 'Controller is exposed');
		ok('events' in t, 'Events are exposed');
	});
});

asyncTest('Creating the view', function() {
	var that = this;
	
	this.registry.one('loaded', function(event,data) {
		that.t.api.init();
		start();
		
		ok($('.spread').length, 'A spread was appended');
		ok($('#pageA').length, 'Page A was appended');
		ok($('#pageB').length, 'Page B was appended');
	
		ok($('.spread p').length, 'Paragraphs were appended to Page A');
	});
});

/*
asyncTest('Measurements', function() {
	var that = this;
	this.registry.bind('loaded', function(event,data) {
		that.t.api.init();
		var height1 = $('#hidden').height();
		var height2 = Math.floor((height1*0.6666667)/24)*24;
		var height3 = that.t.view.calculateHeight();
		
		console.log(height1, height2, height3, $('.page:first'));
		
		start();
		equals($('.page:first').height(), height2, 'Appended height is correct');
	});
});
*/