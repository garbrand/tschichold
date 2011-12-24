var App = function() {
	var reader = 70;
	var comments = 100 - reader;
	
	$('#navigation li').toggle(function() {
		$('#reader').animate({width: reader + '%'}, 200);
		$('#comments').animate({width: comments + '%'}, 200);
		$('#navigation').addClass('open');
	}, function() {
		$('#reader').animate({width: '100%'}, 200);
		$('#comments').animate({width: '0%'}, 200);
		$('#navigation').removeClass('open');
	});
	
	$('body').keydown(function(event, data) {
		// The `1` key toggles the grid
		if (event.which == 49) {
			$('.grid').toggle();
			$('body').toggleClass('visible');
		};
	});
};