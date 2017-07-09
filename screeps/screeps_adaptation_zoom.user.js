// ==UserScript==
// @name         Screeps adaptation zoom
// @namespace    https://screeps.com/
// @version      0.1.1
// @author       Shiaupiau
// @include      https://screeps.com/a/
// @run-at       document-ready
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require      https://github.com/Esryok/screeps-browser-ext/raw/master/screeps-browser-core.js
// ==/UserScript==

$(document).ready(() => {
	ScreepsAdapter.onViewChange(function(triggerName) {
		if (triggerName == 'roomEntered') {
			adaptationZoom();
		}
	});
	ScreepsAdapter.onRoomChange(function(roomName) {
		adaptationZoom();
	});

	function adaptationZoom() {
		var gameFieldContainerElem = angular.element('.game-field-container');
		var gameFieldElem = angular.element('.game-field');
		var resizePlaceholderElem = angular.element('.resize-placeholder');

		var roomElem = angular.element('.room');
		var roomScope = roomElem.scope();

		var containerWidth = gameFieldContainerElem.width();
		var containerHeight = gameFieldContainerElem.height();

		var toWidth = containerHeight;
		var toZoom = toWidth / containerWidth * 100;

		roomScope.Room.zoom = toZoom;
	}
});