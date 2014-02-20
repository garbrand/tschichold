// Return how much pages a `doc` at the viewport `height`
var pages = function ( doc, height ) {
	// `doc`: total height of the text
	// `height`: viewport height
	return Math.ceil( doc / height );
};

// Return the y offset for a given page
var offset = function ( page, height ) {
	// `page` is the zero-indexed number of the page
	return page * height;
};

// Return a height for a mask that shows an integer number of lines on a spread
var mask = function ( height, x ) {
	// `height`: viewport height
	// `x`: line x-height
	return Math.floor( height / x );
};