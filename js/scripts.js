let startingTilesTypes = ['blue', 'lunar', 'solar', 'tentacle', 'yellow'];
let gameTilesTypes = ['blue', 'lunar', 'solar', 'tentacle', 'yellow'];

let startingTile;

let turnsLeft = 0;


let gameTiles = [];
let initialTilePairs = [];

let mapData = [];

let mapRowsColumnsIndexes = {
	rows: {},
	columns: {}
};


// how big the generated map is
// up-down = 0-39 limits
// left-right = 0-39 limits
let mapLimits = {
	up: 14,
	down: 26,
	left: 5,
	right: 35
}

let mapMoveAmount = {
	'tilePos': {
		'top': 0,
		'left': 0
	},
	'view':{
		'desktop': {	
			'incs': {
				'vertical': 85,
				'horizontal': 100			
			},
			'unit': 'px'
		},
		'tablet': {
			'incs': {
				'vertical': 8,
				'horizontal': 9.25			
			},
			'unit': 'vw'
		},
		'mobile': {
			'incs': {
				'vertical': 14.1,
				'horizontal': 16.35			
			},
			'unit': 'vw'
		}
	}
}

let mapRowRange = mapLimits.down - mapLimits.up; // 22 rows
let mapColumnRange = mapLimits.right - mapLimits.left; // 22 columns

let mapStats = {
	'centerRow': 21,
	'centerColumn': 20,
	'tileExtremes': {
		row: {
			top: 0,
			bottom: -1
		},
		column: {
			left: 1,
			right: 0
		}
	},
	'zoomStats': {
		'10': {
			xTilesVisible: 6,
			yTilesVisible: 4
		},
		'8': {
			xTilesVisible: 8,
			yTilesVisible: 6
		},
		'6': {
			xTilesVisible: 10,
			yTilesVisible: 6
		}
	},
	'directionStatus': {
		up: 'unlocked',
		down: 'unlocked',
		left: 'unlocked',
		right: 'unlocked'
	}
}

let zoomLevel = 10;

// If device is touch capable, use touch as the trigger, otherwise the user is using a desktop computer so use click
let touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

let lockFunction = false;
let lockMap = false;

let rotateTileAllowed = false;

let currentView = 'desktop';

$(document).ready(function(){

	setupTiles(); // Enter total number of tiles to be used in game as argument
	updateNextTurn('setup');
	checkScreenWidth();
	setTimeout(function(){
		$('#ks-container').addClass('showKickstarterInfo');
	}, 500)

})

$(document).on('mouseenter','#ks-container #kickstartImg',function(){
	$('#ks-container').addClass('activeKickstarter');
});

$(document).on('mouseleave','#ks-container.activeKickstarter',function(){
	$('#ks-container.activeKickstarter').removeClass('activeKickstarter');
});

$(document).on(touchEvent,'.modal.is-active .modal-background.closableModalBackground',function(){
	$('.modal.is-active').removeClass('is-active');
});

$(document).on(touchEvent,'.closeModalTrigger',function(){
	$('.modal.is-active').removeClass('is-active');
});

$(document).on(touchEvent,'#startGame',function(){
	$('#keyboardKeysModal').addClass('is-active');
});

$(document).on(touchEvent,'.instructionsButton',function(){
	$('#instructionsModal').addClass('is-active');
});

$(document).on(touchEvent,'#commenceGame',function(){
	$('body').addClass('gameView');
	$('.layer').hide();
	$('#gameLayer').show();
	setupInitialTilePairs();
	initiateMap();
});

$(window).resize(function() {
	checkScreenWidth();
});

function checkScreenWidth(){
	let changeOfView = false;
	let windowSize = $(window).width();

	if(windowSize <= 599) {
		if(currentView != 'mobile') {
			changeOfView = true;
			currentView = 'mobile';
		}
	} else if(windowSize <= 1205) {
		if(currentView != 'tablet') {
			changeOfView = true;
			currentView = 'tablet';
		}
	} else if(windowSize > 1205) {
		if(currentView != 'desktop') {
			changeOfView = true;
			currentView = 'desktop';
		}
	}

	if(changeOfView) {
		if(currentView != 'desktop') {
			console.log('commenceGame');
			$('#homepageButtonContainer .startCommenceButton').attr('id', 'commenceGame');
		} else {
			console.log('startGame');
			$('#homepageButtonContainer .startCommenceButton').attr('id', 'startGame');
		}
		
		if($('#mapContainer #mapHiddenOverlay').length) {
			setZoom(zoomLevel,document.getElementById("mapHiddenOverlay"));
		}

		updateMapPosition('horizontal');
		updateMapPosition('vertical');
		changeOfView = false;
	}

}

$(document).keydown(function(e){

	if(!lockMap) {
		lockMap = true;
		setTimeout(function(){
			lockMap = false;
		}, 220);

		if (e.which == 81 && rotateTileAllowed == true) { 
			rotateTileCounterClockwiseFunction();
			return false;
		} else if (e.which == 69 && rotateTileAllowed == true) { 
			rotateTileClockwiseFunction();
			return false;
		} else if (e.which == 37 || e.which == 65) { 
			if(mapStats.directionStatus.left == 'unlocked') {
				processMapMovement('left');
				return false;
			}
		 } else if (e.which == 38 || e.which == 87) { 
			if(mapStats.directionStatus.up == 'unlocked') {
				processMapMovement('up');
				return false;
			}
		 } else if (e.which == 39 || e.which == 68) { 
			if(mapStats.directionStatus.right == 'unlocked') {
				processMapMovement('right');
				return false;
			}
		 } else if (e.which == 40 || e.which == 83) { 
			if(mapStats.directionStatus.down == 'unlocked') {
				processMapMovement('down');
				return false;
			}
		 } else if (e.which == 9) { 
			e.preventDefault();
		 }
	}
    
});

function processMapMovement(thisDirection){

	if(thisDirection == 'up' || thisDirection == 'down') {	
		if(thisDirection == 'up') {
			mapMoveAmount.tilePos.top++;
		} else if(thisDirection == 'down') {	
			mapMoveAmount.tilePos.top--;	
		}
		checkIfMapLimitReached('vertical', mapMoveAmount.tilePos.top);
		updateMapPosition('vertical');
	}

	if(thisDirection == 'left' || thisDirection == 'right') {	
		if(thisDirection == 'left') {
			mapMoveAmount.tilePos.left++;
		} else if(thisDirection == 'right') {	
			mapMoveAmount.tilePos.left--;
		}

		checkIfMapLimitReached('horizontal', mapMoveAmount.tilePos.left);
		updateMapPosition('horizontal');
	}

	$('.' + thisDirection + 'Arrow').addClass('activeArrow');
	setTimeout(function(){
		$('.activeArrow').removeClass('activeArrow');
	}, 100);

}

function checkIfMapLimitReached(direction, newIncrementPosition){

	if(direction == 'horizontal') {

		mapStats.directionStatus.left = 'unlocked';
		mapStats.directionStatus.right = 'unlocked';
		$('.leftArrow').show();
		$('.rightArrow').show();

		let horizontalTileLimit = mapStats.zoomStats[zoomLevel].xTilesVisible;
		let horizontalTilesHalfwayAmount = Math.floor(horizontalTileLimit / 2);

		if(newIncrementPosition <= (mapStats.centerColumn - mapLimits.right) + (horizontalTilesHalfwayAmount) + 1) {
			mapStats.directionStatus.right = 'mapLimit-locked';
			$('.rightArrow').hide();
		} else if(newIncrementPosition <= (mapStats.tileExtremes.column.right - horizontalTilesHalfwayAmount)) {
			mapStats.directionStatus.right = 'tileLimit-locked'
			$('.rightArrow').hide();
		} else if(newIncrementPosition > (mapStats.centerColumn - mapLimits.left) - (horizontalTilesHalfwayAmount + 1)) {
			mapStats.directionStatus.left = 'mapLimit-locked'
			$('.leftArrow').hide();
		} else if((newIncrementPosition + 1) >= (mapStats.tileExtremes.column.left + horizontalTilesHalfwayAmount)) {
			mapStats.directionStatus.left = 'tileLimit-locked'
			$('.leftArrow').hide();
		}

	} else if(direction == 'vertical') {

		mapStats.directionStatus.up = 'unlocked';
		mapStats.directionStatus.down = 'unlocked';
		$('.upArrow').show();
		$('.downArrow').show();

		let verticalTileLimit = mapStats.zoomStats[zoomLevel].yTilesVisible;
		let verticalTilesHalfwayAmount = Math.floor(verticalTileLimit / 2);

		if(newIncrementPosition <= (mapStats.centerRow - mapLimits.down) + (verticalTilesHalfwayAmount) + 1) {
			mapStats.directionStatus.down = 'mapLimit-locked';
			$('.downArrow').hide();			
		} else if((newIncrementPosition - 1) <= (mapStats.tileExtremes.row.bottom - verticalTilesHalfwayAmount)) {
			mapStats.directionStatus.down = 'tileLimit-locked'
			$('.downArrow').hide();			
		} else if(newIncrementPosition > (mapStats.centerRow - mapLimits.up) - (verticalTilesHalfwayAmount + 1)) {
			mapStats.directionStatus.up = 'mapLimit-locked'
			$('.upArrow').hide();			
		} else if(newIncrementPosition >= (mapStats.tileExtremes.row.top + verticalTilesHalfwayAmount)) {
			mapStats.directionStatus.up = 'tileLimit-locked'
			$('.upArrow').hide();			
		}
	}
}

function updateMapPosition(moveDirection) {
	if(moveDirection == 'horizontal') {
		let newLeftPosNum = (mapMoveAmount.tilePos.left * mapMoveAmount.view[currentView].incs.horizontal) * (zoomLevel / 10);
		let newLeftPos = newLeftPosNum + mapMoveAmount.view[currentView].unit;
		$('#mapContainer #mapHiddenOverlay').css('left', newLeftPos);
	} else if(moveDirection == 'vertical') {
		let newTopPosNum = (mapMoveAmount.tilePos.top * mapMoveAmount.view[currentView].incs.vertical) * (zoomLevel / 10);
		let newTopPos = newTopPosNum + mapMoveAmount.view[currentView].unit;
		$('#mapContainer #mapHiddenOverlay').css('top', newTopPos);
	}
}

$(document).on(touchEvent,'.zoomOptions .zoomOption.activeZoom',function(){

	if(!lockFunction) {

		lockFunction = true;

		setTimeout(function(){
			lockFunction = false;
		}, 220);

		let zoomInLimit = 10;
		let zoomOutLimit = 6;

		let zoomOption = $(this).attr('zoomType');

		if(zoomOption == 'zoomIn') {
			zoomLevel = zoomLevel + 2;

		} else if(zoomOption == 'zoomOut') {
			zoomLevel = zoomLevel - 2;
		}

		if(zoomLevel == zoomInLimit) {
			$('.zoomOptions .zoomIn').removeClass('activeZoom').addClass('inactiveZoom');
			$('.zoomOptions .zoomIn').attr('src', 'img/zoomIn-inactive.png')
		} else if(zoomLevel == zoomOutLimit) {
			$('.zoomOptions .zoomOut').attr('src', 'img/zoomOut-inactive.png')
			$('.zoomOptions .zoomOut').removeClass('activeZoom').addClass('inactiveZoom');
		} else {

			if(zoomLevel < zoomInLimit) {
				if($('.zoomOptions .zoomIn').hasClass('inactiveZoom')) {
					$('.zoomOptions .zoomIn').removeClass('inactiveZoom').addClass('activeZoom');
					$('.zoomOptions .zoomIn').attr('src', 'img/zoomIn.png')
				}
			}

			if(zoomLevel > zoomOutLimit) {
				if($('.zoomOptions .zoomOut').hasClass('inactiveZoom')) {
					$('.zoomOptions .zoomOut').removeClass('inactiveZoom').addClass('activeZoom');
					$('.zoomOptions .zoomOut').attr('src', 'img/zoomOut.png')
				}
			}

		}

		checkIfMapLimitReached('horizontal', mapMoveAmount.tilePos.left);
		checkIfMapLimitReached('vertical', mapMoveAmount.tilePos.top);

		setZoom(zoomLevel,document.getElementById("mapHiddenOverlay"));

	}
});

function setZoom(newZoom, el) {

	let transformOriginPercentages = '';

	if(currentView == 'desktop') {
		transformOriginPercentages = '9.4% 5.5%';
	} else if(currentView == 'tablet') {
		transformOriginPercentages = '13.4% 8%';
	} else if(currentView == 'mobile') {
		transformOriginPercentages = '21.1% 14%';
	}

	let zoomScale = Number(newZoom)/10;

	let p = ["webkit", "moz", "ms", "o"],
	s = "scale(" + zoomScale + ")"
	
	for (let i = 0; i < p.length; i++) {
		el.style[p[i] + "Transform"] = s;
		el.style[p[i] + "TransformOrigin"] = transformOriginPercentages;
	}

	el.style["transform"] = s;
	el.style["transformOrigin"] = transformOriginPercentages;

	updateMapPosition('vertical');
	updateMapPosition('horizontal');
}

$(document).on(touchEvent,'.mapNavigation .navArrow',function(){
	let thisDirection = $(this).attr('direction');
	processMapMovement(thisDirection);
});


$(document).on(touchEvent,'#cancelTilePairSelection',function(){
	if($('#tilePairContainer .playerTilePair.activePair.chosenPair').data('tiles-placed') == 0) {
		console.log('no tiles placed');
		cancelTilePlacement();
	} else {
		console.log('one tile placed');
		cancelBothTilePlacements();
	}
})

$(document).on(touchEvent,'#undoTilePlacement',function(){
	cancelTilePlacement();
})

$(document).on(touchEvent,'#checkTilePlacement',function(){
	checkTilePlacement();
});

$(document).on(touchEvent,'#rotateTileClockwise', rotateTileClockwiseFunction);
$(document).on(touchEvent,'#rotateTileCounterclockwise', rotateTileCounterClockwiseFunction);

function rotateTileClockwiseFunction() {
	// find the currently chosen tile that is currently being placed, and store it's current rotation value into a variable
	let currentRotation = parseInt($('.mapTileContainer .availableTile.lockedIn').data('tile-rotation'));
	// add 60 degrees to the current rotation since it's being rotated clockwise
	let newRotation = currentRotation + 60;
	// update the new value on the tilerotation attribute that corresponds with chosen tile
	$('.mapTileContainer .availableTile.lockedIn').data('tile-rotation', newRotation);
	// update the new value in the css to animate the tile moving to the new correct rotation
	$('.mapTileContainer .availableTile.lockedIn').css('transform', 'rotate(' + newRotation + 'deg)');
}

function rotateTileCounterClockwiseFunction() {
	// find the currently chosen tile that is currently being placed, and store it's current rotation value into a variable
	let currentRotation = parseInt($('.mapTileContainer .availableTile.lockedIn').data('tile-rotation'));
	// minus 60 degrees to the current rotation since it's being rotated counter-clockwise
	let newRotation = currentRotation - 60;
	// update the new value on the tilerotation attribute that corresponds with chosen tile
	$('.mapTileContainer .availableTile.lockedIn').data('tile-rotation', newRotation);
	// update the new value in the css to animate the tile moving to the new correct <rotation></rotation>
	$('.mapTileContainer .availableTile.lockedIn').css('transform', 'rotate(' + newRotation + 'deg)');
}

$(document).on(touchEvent,'#lastTurnModal .closeModalTrigger',function(){
	endOfGameSetup()
})

function deactivateChosenTile() {
	// if a player has previously clicked on a tile container which activates that particular tile and shows all the valid placements on the map BUT then performs another action to nullify the placing of the tile, this function removes all related classes and elements that correspond with the tile placement action
	$('.chosenCropCircle').removeClass('chosenCropCircle');
	$('.selectedCropCircleOutline').remove();
	$('.validPlacement').remove();
}

function temporarilyLockMap(timePeriod) {
	lockMap = true;
	setTimeout(function(){
		lockMap = false;
	}, timePeriod);
}


function checkTilePlacement() {

	// target the confirmed tile in the map which will be the one with the .lockedIn class still assigned
	let tileToCheck = $('.mapTileContainer .availableTile.lockedIn');
    
    // store the map hex ID that has had the newly moved tile confirmed into it
	// e.g. -->  row-20-column-19
	let tileToCheckID = tileToCheck.parent().attr('id');
	
	checkValidTileConnections(tileToCheckID);

}

function confirmTilePlacement(confirmedTileID) {

	rotateTileAllowed = false;
    
    // fade out the opaque yellow hexes showing the valid placements since the user has now finalized the tile placement
    $('.validPlacement').fadeOut();

    // add the .placedTile class, which is used by the activateTokenPlacement() function to identify which tiles will be able to a relevant token placed on it
	$('#' + confirmedTileID).addClass('placedTile');
	$('#' + confirmedTileID + ' .availableTile').addClass('cropCircleTile').removeClass('availableTile');
    
    // now that the map hex parent element has the .lastPlacedTile class added, we can remove the .lockedIn class from the tileContainer child element
	$('.lockedIn').removeClass('lockedIn');

	// the .lastPlacedTile class is added for the purposes of the undo button (to identify which map hex contains the tileContainer element to be moved back to the display area)
	// it is added AFTER the checkMapConstraints() function in case the map is extended and re-rendered, so that the .lastPlacedTile class is not removed in the process
	$('#' + confirmedTileID).addClass('lastPlacedTile');
	
	// removing the "showOptions" class causes the option bar to retract until the next tile is placed
	$('#placedTileOptions').removeClass('showOptions');

	let tilesPlaced = $('.playerTilePair.activePair.chosenPair').data('tiles-placed');

	tilesPlaced++;

	if(tilesPlaced == 1) {
		$('.playerTilePair.activePair.chosenPair').data('tiles-placed', tilesPlaced);
		activateNextTileToPlace();
	} else if(tilesPlaced == 2) {
		$('.mapTileContainer .cropCircleTile').each(function(){
			$(this).addClass('cropCircleTile').removeClass('temporaryTile');
			let tileHexID = $(this).closest('.mapTileContainer').attr('id');
			updatePlacedTileData(tileHexID);
		});
		roundCleanUp();
	}

}

function updatePlacedTileData(confirmedTileID) {
	
	// split the id based on the hyphens into an array and store in the "splitConfirmedTileID" variable
	// row-20-column-19
	// becomes:
	// splitConfirmedTileID = ['row', '20', 'column', '19']
	let splitConfirmedTileID = confirmedTileID.split('-');

	// convert the row string into a num and store in 'confirmedTileRow' var
	let confirmedTileRow = parseInt(splitConfirmedTileID[1]);

	// mapStats.tileExtremes.row.top
	// mapStats.tileExtremes.row.bottom
	// mapStats.tileExtremes.column.left
	// mapStats.tileExtremes.column.right
	
	if((mapStats.centerRow - confirmedTileRow) >= mapStats.tileExtremes.row.top) {
		mapStats.tileExtremes.row.top = mapStats.centerRow - confirmedTileRow;

		if(mapStats.directionStatus.up == 'tileLimit-locked') {
			mapStats.directionStatus.up = 'unlocked';
			$('.upArrow').show();
		}
	}
	
	if((mapStats.centerRow - confirmedTileRow) < mapStats.tileExtremes.row.bottom) {
		mapStats.tileExtremes.row.bottom = mapStats.centerRow - confirmedTileRow;

		if(mapStats.directionStatus.down == 'tileLimit-locked') {
			mapStats.directionStatus.down = 'unlocked';
			$('.downArrow').show();
		}

	}

	// convert the column string into a num and store in 'confirmedTileColumn' var
	let confirmedTileColumn = parseInt(splitConfirmedTileID[3]);

	if((mapStats.centerColumn - confirmedTileColumn) > mapStats.tileExtremes.column.left) {
		mapStats.tileExtremes.column.left = mapStats.centerColumn - confirmedTileColumn;

		if(mapStats.directionStatus.left == 'tileLimit-locked') {
			mapStats.directionStatus.left = 'unlocked';
			$('.leftArrow').show();
		}
	}

	if((mapStats.centerColumn - confirmedTileColumn) < mapStats.tileExtremes.column.right) {
		mapStats.tileExtremes.column.right = mapStats.centerColumn - confirmedTileColumn;

		if(mapStats.directionStatus.right == 'tileLimit-locked') {
			mapStats.directionStatus.right = 'unlocked';
			$('.rightArrow').show();
		}
	}

	// store the current tile rotation into "confirmedTileRotation" variable (don't need an array for this one since it's just one figure)
	// e.g. confirmedTileRotation = "300";
	let confirmedTileRotation = $(`#${confirmedTileID} .availableTile`).data('tile-rotation');

	// loop through the mapData array in order to update the newly placed tile information
	for (let i = 0; i < mapData.length; i++) {

		// we just need to target the first child under each top level tier in the array to ascertain what row the next level corresponds with
		// (the code is looking for row 20)

		// 0: {row: 16, column: 13, placedTile: false, tileName: 'blue-0' …}
		// 1: {row: 17, column: 13, placedTile: false, tileName: 'blue-0' …}
		// 2: {row: 18, column: 13, placedTile: false, tileName: 'blue-0' …}
		// 3: {row: 19, column: 13, placedTile: false, tileName: 'blue-0' …}
		// 4: {row: 20, column: 13, placedTile: false, tileName: 'blue-0' …}

		// match = index 4
		// mapData[4] contains the row that the code needs to update
		// once the row matches that row of the map hex, that index is looped through to find the appropriate column
		if(mapData[i][0].row == confirmedTileRow) {

			for (let j = 0; j < mapData[i].length; j++) {

				// mapData[4] = [
					// 0: {row: 20, column: 13, placedTile: false, tileName: 'blue-0' …}
					// 1: {row: 20, column: 14, placedTile: false, tileName: 'blue-0' …}
					// 2: {row: 20, column: 15, placedTile: false, tileName: 'blue-0' …}
					// 3: {row: 20, column: 16, placedTile: false, tileName: 'blue-0' …}
					// 4: {row: 20, column: 17, placedTile: false, tileName: 'blue-0' …}
					// 5: {row: 20, column: 18, placedTile: false, tileName: 'blue-0' …}
					// 6: {row: 20, column: 19, placedTile: false, tileName: 'blue-0' …}
				//]

				if(mapData[i][j].column == confirmedTileColumn) {
					// in example mapData[4][6] would match row-20-column-19 id
					// now the code updates the details in that entry with the new information from the placed tile
					mapData[i][j].placedTile = true;
					mapData[i][j].name = true;
					mapData[i][j].rotation = confirmedTileRotation;
				}
			}
		}
	}

	// the .lastPlacedTile class is added for the purposes of the undo button (to identify which map hex contains the tileContainer element to be moved back to the display area)
	// it is added AFTER the checkMapConstraints() function in case the map is extended and re-rendered, so that the .lastPlacedTile class is not removed in the process
	$('#' + confirmedTileID).addClass('lastPlacedTile');
	
	// removing the "showOptions" class causes the option bar to retract until the next tile is placed
	$('#placedTileOptions').removeClass('showOptions');

	let tilesPlaced = $('.playerTilePair.activePair.chosenPair').data('tiles-placed');

	tilesPlaced++;

	if(tilesPlaced == 1) {
		$('.playerTilePair.activePair.chosenPair').data('tiles-placed', tilesPlaced);
		activateNextTileToPlace();
	} else if(tilesPlaced == 2) {
		roundCleanUp();
	}
}

function checkValidTileConnections(thisTileID) {

	console.log('thisTileID');
	console.log(thisTileID);

	let tileDirectionalSide = ['n', 'ne', 'se', 's', 'sw', 'nw'];

	let currentTileRotation = parseInt($(`#${thisTileID} .availableTile`).data('tile-rotation'));

	console.log('currentTileRotation');
	console.log(currentTileRotation);

	let currentTileNumber = parseInt($(`#${thisTileID} .availableTile`).data('tile-number'));

	console.log('currentTileNumber');
	console.log(currentTileNumber);

	let startingIndex = 0;

	if(currentTileRotation != 0) {
		startingIndex = findStartingIndex(currentTileRotation);
	}

	let currentTileConnections = [];

	for (let i = 0; i < 6; i++) {
		currentTileConnections.push(tileConnections[currentTileNumber][startingIndex]);
		startingIndex++;
		if(startingIndex > 5) {
			startingIndex = 0;
		}
	}

	console.log('startingIndex');
	console.log(startingIndex);

	console.log('currentTileConnections');
	console.log(currentTileConnections);

	let matchingNeighbourIndexes = [3, 4, 5, 0, 1, 2];
	let neighbourTileIDs = neighbourTiles(thisTileID);

	let invalidConnections = [];

	// loop through the "neighbourTileIDs" to see if any of the neighbourTiles ALREADY HAVE A TILE ON IT
	for (let i = 0; i < neighbourTileIDs.length; i++) {
		// Only neighbour tiles WITHOUT the "placedTile" class meet the criteria to be pushed into the "potentialTiles" array

		if($('#' + neighbourTileIDs[i]).hasClass('placedTile')) {

			console.log('neighbourTileIDs[i]');
			console.log(neighbourTileIDs[i]);

			let neighbourTileRotation = parseInt($(`#${neighbourTileIDs[i]} .cropCircleTile`).data('tile-rotation'));

			console.log('neighbourTileRotation');
			console.log(neighbourTileRotation);

			let neighbourTileNumber = parseInt($(`#${neighbourTileIDs[i]} .cropCircleTile`).data('tile-number'));
			let startingNeighbourIndex = 0;

			console.log('neighbourTileNumber');
			console.log(neighbourTileNumber);

			if(neighbourTileRotation != 0) {
				startingNeighbourIndex = findStartingIndex(neighbourTileRotation);

				console.log('startingNeighbourIndex');
				console.log(startingNeighbourIndex);
				
				if((startingNeighbourIndex + matchingNeighbourIndexes[i]) > 5) {
					startingNeighbourIndex = startingNeighbourIndex - 6;
				}

			}

			let matchedNeighbourSide = parseInt(startingNeighbourIndex + matchingNeighbourIndexes[i]);

			console.log('matchedNeighbourSide');
			console.log(matchedNeighbourSide);

			let neighbourConnection = tileConnections[neighbourTileNumber][matchedNeighbourSide];

			console.log('neighbourConnection');
			console.log(neighbourConnection);
			
			if(currentTileConnections[i] != neighbourConnection) {
				invalidConnections.push(tileDirectionalSide[i]);
			}

		}
	}

	if(invalidConnections.length == 0) {
		confirmTilePlacement(thisTileID);
	} else {
		$('#placedTileOptions .button').attr('disabled', 'disabled');
		$rejectedHex = $('.mapTileContainer .availableTile').closest('.mapTileContainer');
		for (let i = 0; i < invalidConnections.length; i++) {
			$rejectedHex.append(`<img class="invalidConnection cross-${invalidConnections[i]}" src="img/cross.png">`);
		}
	
		setTimeout(function(){
			$('.invalidConnection').addClass('revealCross');
		}, 10);

		setTimeout(function(){
			$('.revealCross').removeClass('revealCross');
		}, 1400);

		setTimeout(function(){
			$('#placedTileOptions .button').removeAttr('disabled');
		}, 2000);

		setTimeout(function(){
			$('.invalidConnection').remove();
		}, 2100);
		
	}
}

function findStartingIndex(thisTileRotation){
	console.log('thisTileRotation');
	console.log(thisTileRotation);
	if(thisTileRotation < 0) {
		// tile has been rotated counter-clockwise
		let positiveRotation = Math.abs(thisTileRotation);

		console.log('positiveRotation');
		console.log(positiveRotation);

		let rotationAmount = positiveRotation / 60;

		console.log('rotationAmount');
		console.log(rotationAmount);

		let actualRotations = rotationAmount % 6;

		console.log('actualRotations');
		console.log(actualRotations);

		return 0 + actualRotations;
	} else if(thisTileRotation > 0) {
		let rotationAmount = thisTileRotation / 60;

		console.log('rotationAmount');
		console.log(rotationAmount);

		let actualRotations = rotationAmount % 6;

		console.log('actualRotations');
		console.log(actualRotations);

		return 6 - actualRotations;
	} else if(thisTileRotation == 0) {
		return 0;
	}
}

function roundCleanUp(){

	$('#cancelTilePairSelection').attr('disabled', 'disabled');

	$('.playerTilePair.inactivePair .availableTile').addClass('rejectedTiles');

	let firstTileType = $('.playerTilePair.inactivePair .leftTile .availableTile').data('tile-type');
	$('.playerTilePair.inactivePair .leftTile .availableTile').parentToAnimate($('.tileCountTypeContainer[data-tile-count-type="' + firstTileType + '"]'), 2000);

	let secondTileType = $('.playerTilePair.inactivePair .rightTile .availableTile').data('tile-type');
	$('.playerTilePair.inactivePair .rightTile .availableTile').parentToAnimate($('.tileCountTypeContainer[data-tile-count-type="' + secondTileType + '"]'), 2000);

	setTimeout(function(){
		if(firstTileType == secondTileType) {
			let $tileTimerContainer = $('.tileCountTypeContainer[data-tile-count-type="' + firstTileType + '"]');
			let currentTileAmount = parseInt($tileTimerContainer.data('tile-count'));
			let newTileAmount = currentTileAmount + 2;
			$tileTimerContainer.data('tile-count', newTileAmount);
			$tileTimerContainer.find('.tileCountNum').html(newTileAmount);

			// if the keystoneTile variable is true, immediately update the tileTokenResetTime variable to 2500 to give time for the nature cube addition animate to conclude
			tileTokenResetTime = 2500;

			let tileTimerParentOffest = $tileTimerContainer.offset();

			$('body').append('<div id="tileCounterUpdate"><p class="animatedNumber">+2</p></div>');

			let tileTimerTopPos = tileTimerParentOffest.top;
			let tileTimerLeftPos = tileTimerParentOffest.left + 68;

			$('#tileCounterUpdate').css({
				'position': 'absolute',
				'top': tileTimerTopPos,
				'left': tileTimerLeftPos,
				'zIndex': 9
			});

			setTimeout(function(){
				$('#tileCounterUpdate').addClass('animationEnabled');
			}, 10)

			setTimeout(function(){
				let animatedTopPos = tileTimerTopPos - 150;
				$('#tileCounterUpdate').css({
					'opacity': 1,
					'top': animatedTopPos
				});
			}, 20)

			setTimeout(function(){
				$('#tileCounterUpdate').css('opacity', '0');
			}, 900)

			setTimeout(function(){
				$('#tileCounterUpdate').remove();
			}, 2000)


		} else {
			let $firstTileTimerContainer = $('.tileCountTypeContainer[data-tile-count-type="' + firstTileType + '"]');
			let currentFirstTileAmount = parseInt($firstTileTimerContainer.data('tile-count'));
			let newFirstTileAmount = currentFirstTileAmount + 1;
			$firstTileTimerContainer.data('tile-count', newFirstTileAmount);
			$firstTileTimerContainer.find('.tileCountNum').html(newFirstTileAmount);
	
			let $secondTileTimerContainer = $('.tileCountTypeContainer[data-tile-count-type="' + secondTileType + '"]');
			let currentSecondTileAmount = parseInt($secondTileTimerContainer.data('tile-count'));
			let newSecondTileAmount = currentSecondTileAmount + 1;
			$secondTileTimerContainer.data('tile-count', newSecondTileAmount);
			$secondTileTimerContainer.find('.tileCountNum').html(newSecondTileAmount);


			let firstTileTimerParentOffest = $firstTileTimerContainer.offset();
			let secondTileTimerParentOffest = $secondTileTimerContainer.offset();

			$('body').append('<div id="firstTileCounterUpdate"><p class="animatedNumber">+1</p></div>');
			$('body').append('<div id="secondTileCounterUpdate"><p class="animatedNumber">+1</p></div>');

			let firstTileTimerTopPos = firstTileTimerParentOffest.top - 10;
			let firstTileTimerLeftPos = firstTileTimerParentOffest.left + 73;

			let secondTileTimerTopPos = secondTileTimerParentOffest.top - 10;
			let secondTileTimerLeftPos = secondTileTimerParentOffest.left + 73;

			$('#firstTileCounterUpdate').css({
				'position': 'absolute',
				'top': firstTileTimerTopPos,
				'left': firstTileTimerLeftPos,
				'zIndex': 9
			});

			$('#secondTileCounterUpdate').css({
				'position': 'absolute',
				'top': secondTileTimerTopPos,
				'left': secondTileTimerLeftPos,
				'zIndex': 9
			});

			setTimeout(function(){
				$('#firstTileCounterUpdate').addClass('animationEnabled');
				$('#secondTileCounterUpdate').addClass('animationEnabled');
			}, 10)

			setTimeout(function(){
				let firstAnimatedTopPos = firstTileTimerTopPos - 150;
				let secondAnimatedTopPos = secondTileTimerTopPos - 150;
				$('#firstTileCounterUpdate').css({
					'opacity': 1,
					'top': firstAnimatedTopPos
				});
				$('#secondTileCounterUpdate').css({
					'opacity': 1,
					'top': secondAnimatedTopPos
				});
			}, 20)

			setTimeout(function(){
				$('#firstTileCounterUpdate').css('opacity', '0');
				$('#secondTileCounterUpdate').css('opacity', '0');
			}, 1400)

			setTimeout(function(){
				$('#firstTileCounterUpdate').remove();
				$('#secondTileCounterUpdate').remove();
			}, 2400)

		}
	}, 1800)

	setTimeout(function(){
		generateNextTiles();
	}, 3300)
}

function generateNextTiles() {
	// since there are 4 tiles to be generated (two pairs of two tiles), the below loop is actioned 4 times

	var newTileInfo = [];

	for (let i = 0; i < 4; i++) {
		// the first tile is spliced and stored in the "thisTile" variable
		let thisTile = gameTiles.splice(0, 1);
		// finally push the tile information into the "initialTilePairs" variable which will eventually hold the information for all 4 initial tiles to be displayed
		newTileInfo.push(thisTile[0]);
	}

	let nextTilePairHTML = `

		<div data-tiles-placed="0" id="tilePairOne" class="playerTilePair inactivePair">
			<div class="availableTileContainer leftTile">
				<img data-tile-type="${newTileInfo[0].type}" data-tile-number="${newTileInfo[0].number}" data-tile-rotation="0" style="transform: rotate(0deg);" class="availableTile" src="img/tiles/${newTileInfo[0].name}.png" />
			</div>
			<div class="availableTileContainer rightTile">
				<img data-tile-type="${newTileInfo[1].type}" data-tile-number="${newTileInfo[1].number}" data-tile-rotation="0" style="transform: rotate(0deg);" class="availableTile" src="img/tiles/${newTileInfo[1].name}.png" />
			</div>
		</div>

		<div data-tiles-placed="0" id="tilePairTwo" class="playerTilePair inactivePair">
			<div class="availableTileContainer leftTile">
				<img data-tile-type="${newTileInfo[2].type}" data-tile-number="${newTileInfo[2].number}" data-tile-rotation="0" style="transform: rotate(0deg);" class="availableTile" src="img/tiles/${newTileInfo[2].name}.png" />
			</div>
			<div class="availableTileContainer rightTile">
				<img data-tile-type="${newTileInfo[3].type}" data-tile-number="${newTileInfo[3].number}" data-tile-rotation="0" style="transform: rotate(0deg);" class="availableTile" src="img/tiles/${newTileInfo[3].name}.png" />
			</div>
		</div>
	`;

	$('#tilePairContainer').html(nextTilePairHTML);

	setTimeout(function(){
		$('#tilePairOne').addClass('endPosition');
		$('#tilePairTwo').addClass('endPosition');
	}, 20);
};

function activateNextTileToPlace() {

	let nextTile = $('.playerTilePair.activePair.chosenPair .availableTileContainer:not(.chosenCropCircle)');
	$('.chosenCropCircle').removeClass('chosenCropCircle');
	$(nextTile).addClass('chosenCropCircle');
	$(nextTile).append('<img class="selectedTileOutline" src="img/selectedTile.png" />');
	showPossibleTilePlacements('normal');
}

function cancelTilePlacement() {

	temporarilyLockMap(1000);

	rotateTileAllowed = false;

	// since the tile has already been moved from the display area onto the map - we now need to move the tile back FROM the map hex it's previously been moved to TO the same place in the display area it was taken from
	$('.mapTileContainer .availableTile.lockedIn').parentToAnimate($('.availableTileContainer.chosenCropCircle'), 1000);

	// the class locked in was previously assigned to the tile that was moved to the map hex - so we can remove this now

	let currentTilesPlaced = $('.playerTilePair.activePair.chosenPair').data('tiles-placed');

	if(currentTilesPlaced == 0) {

		$('#cancelTilePairSelection').attr('disabled', 'disabled');

		// we can remove the inactive class from all of the tile+token combination containers, since the user will again need to choose another combination again
		// $('.inactivePair').removeClass('inactivePair');
		$('.lockedTiles').removeClass('lockedTiles');
		$('.chosenPair').removeClass('chosenPair');
		$('.activePair').addClass('inactivePair').removeClass('activePair');

		// the yellow border around the chosen hex is faded out since there is now no currently selected hex
		$('.selectedCropCircleOutline').fadeOut();

		// the opaque yellow hexes are faded out since there is no chosen tiles again
		$('.validPlacement').fadeOut();
		
		// remove the .chosenCropCircle class since the user has reset which tile has been chosen
		$('.chosenCropCircle').removeClass('chosenCropCircle');

		setTimeout(function(){
			// the yellow border around the chosen hex is now removed since enough time has elapsed for it to fade out
			$('.selectedCropCircleOutline').remove();
			// the opaque yellow hexes are faded out are now removed since enough time has elapsed for it to fade out
			$('.validPlacement').remove();
		}, 400)

	} else if (currentTilesPlaced == 1) {

		setTimeout(function(){
			$('.availableTileContainer.chosenCropCircle').append('<img class="selectedTileOutline" src="img/selectedTile.png" />');
			showPossibleTilePlacements('normal');
		}, 1000)
	}

	setTimeout(function(){
		$('.lockedIn').removeClass('lockedIn');
	}, 1100)

    // removing the "showOptions" class causes the option bar to retract until the next tile is placed
	$('#placedTileOptions').removeClass('showOptions');

	$('.mobileTilePlacementOptions.activeTileOptions').addClass('inactiveTileOptions').removeClass('activeTileOptions');
	
}

function cancelBothTilePlacements() {

	$('#cancelTilePairSelection').attr('disabled', 'disabled');

	temporarilyLockMap(1000);

	rotateTileAllowed = false;

	if($('.mapTileContainer .availableTile.lockedIn').length) {
		// since the tile has already been moved from the display area onto the map - we now need to move the tile back FROM the map hex it's previously been moved to TO the same place in the display area it was taken from
		$('.mapTileContainer .availableTile.lockedIn').parentToAnimate($('.playerTilePair.activePair.chosenPair .availableTileContainer.chosenCropCircle'), 1000);
	}

	$('.mapTileContainer.lastPlacedTile .cropCircleTile').addClass('availableTile').removeClass('cropCircleTile');

	$('.mapTileContainer.lastPlacedTile .availableTile').parentToAnimate($('.playerTilePair.activePair.chosenPair .availableTileContainer:not(.chosenCropCircle)'), 1000);

	// the class locked in was previously assigned to the tile that was moved to the map hex - so we can remove this now

	$('.playerTilePair.activePair.chosenPair').data('tiles-placed', 0);

	// we can remove the inactive class from all of the tile+token combination containers, since the user will again need to choose another combination again
		// $('.inactivePair').removeClass('inactivePair');
		$('.lockedTiles').removeClass('lockedTiles');
		$('.chosenPair').removeClass('chosenPair');
		$('.activePair').addClass('inactivePair').removeClass('activePair');

		// the yellow border around the chosen hex is faded out since there is now no currently selected hex
		$('.selectedTileOutline').fadeOut();

		// the opaque yellow hexes are faded out since there is no chosen tiles again
		$('.validPlacement').fadeOut();
		
		// remove the .chosenCropCircle class since the user has reset which tile has been chosen
		$('.chosenCropCircle').removeClass('chosenCropCircle');

		setTimeout(function(){
			// the yellow border around the chosen hex is now removed since enough time has elapsed for it to fade out
			$('.selectedTileOutline').remove();
			// the opaque yellow hexes are faded out are now removed since enough time has elapsed for it to fade out
			$('.validPlacement').remove();
		}, 400)

	setTimeout(function(){
		$('.lockedIn').removeClass('lockedIn');
		$('.placedTile.lastPlacedTile').removeClass('placedTile');
		$('.lastPlacedTile').removeClass('lastPlacedTile');	
		$('.potentialPlacement').removeClass('potentialPlacement');
	}, 1100)

    // removing the "showOptions" class causes the option bar to retract until the next tile is placed
	$('#placedTileOptions').removeClass('showOptions');

	$('.mobileTilePlacementOptions.activeTileOptions').addClass('inactiveTileOptions').removeClass('activeTileOptions');
}


// this function is triggered at the start of the game to choose the amount of tiles to use (once they're all used the game is over)
function setupTiles() {

	for (let i = 0; i < gameTilesTypes.length; i++) {
		for (let j = 0; j < tileConfig.length; j++) {
			if(!tileConfig[j].startTile) {
				let tileObject = {};
				tileObject.name = `${gameTilesTypes[i]}0${j}`;
				tileObject.number = `${j}`;
				tileObject.type = `${gameTilesTypes[i]}`;
				tileObject.rotation = randomRotation();
				gameTiles.push(tileObject);
			}
		}
	}

	shuffle(gameTiles);

	let startingTilesHTML = '';

	for (let i = 0; i < startingTilesTypes.length; i++) {
		startingTilesHTML += `<li><img data-tile-type="${startingTilesTypes[i]}" class="startingTile" src="img/tiles/${startingTilesTypes[i]}00.png" /></li>`;
	}

	$('#startingTileContainer #startingTiles').html(startingTilesHTML);
	
}

$(document).on(touchEvent,'.startingTile',function(){
	$('.chosenStartingTile').removeClass('chosenStartingTile');
	$(this).addClass('chosenStartingTile');
	startingTile = $(this).data('tile-type');
	$('#startGame').removeAttr('disabled');
	$('#commenceGame').removeAttr('disabled');
});

function setupInitialTilePairs() {

	// since there are 4 tiles to be generated (two pairs of two tiles), the below loop is actioned 4 times
	for (let i = 0; i < 4; i++) {
		// the first tile is spliced and stored in the "thisTile" variable
		let thisTile = gameTiles.splice(0, 1);
		// finally push the tile information into the "initialTilePairs" variable which will eventually hold the information for all 4 initial tiles to be displayed
		initialTilePairs.push(thisTile[0]);
	}

	let initialTilePairHTML = `

		<div data-tiles-placed="0" id="tilePairOne" class="endPosition playerTilePair inactivePair">
			<div class="availableTileContainer leftTile">
				<img data-tile-type="${initialTilePairs[0].type}" data-tile-number="${initialTilePairs[0].number}" data-tile-rotation="0" style="transform: rotate(0deg);" class="availableTile" src="img/tiles/${initialTilePairs[0].name}.png" />
			</div>
			<div class="availableTileContainer rightTile">
				<img data-tile-type="${initialTilePairs[1].type}" data-tile-number="${initialTilePairs[1].number}" data-tile-rotation="0" style="transform: rotate(0deg);" class="availableTile" src="img/tiles/${initialTilePairs[1].name}.png" />
			</div>
		</div>

		<div data-tiles-placed="0" id="tilePairTwo" class="endPosition playerTilePair inactivePair">
			<div class="availableTileContainer leftTile">
				<img data-tile-type="${initialTilePairs[2].type}" data-tile-number="${initialTilePairs[2].number}" data-tile-rotation="0" style="transform: rotate(0deg);" class="availableTile" src="img/tiles/${initialTilePairs[2].name}.png" />
			</div>
			<div class="availableTileContainer rightTile">
				<img data-tile-type="${initialTilePairs[3].type}" data-tile-number="${initialTilePairs[3].number}" data-tile-rotation="0" style="transform: rotate(0deg);" class="availableTile" src="img/tiles/${initialTilePairs[3].name}.png" />
			</div>
		</div>
	`;


	$('#tilePairContainer').html(initialTilePairHTML);

}

function randomRotation() {
	let rotations = [0, 60, 120, 180, 240, 300];
	let rotationIndex = Math.floor(Math.random() * 6);
	return rotations[rotationIndex];
}

function initiateMap() {

	let numRows = mapLimits.down - mapLimits.up + 1;
	let numColumns = mapLimits.right - mapLimits.left + 1;

	// mapData = []
	let i;
	let j;
	let k;
	let l;

	// loop through all rows
	for (i = 0, j = mapLimits.up; i < numRows; i++) {

		mapRowsColumnsIndexes.rows['row' + j] = i;

		// j = 16 ROW START
		// i < 11 ROW DURATION (11 rows)
		// end result = rows = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
		mapData[i] = [];
		// loop through all the children of the currently targetted row - which represents the columns
		for (k = 0, l = mapLimits.left; k < numColumns; k++) {

			mapRowsColumnsIndexes.columns['column' + l] = k;

			// l = 14 COLUMNS START
			// k < 12 COLUMNS DURATION (12 columns)
			// end result = columns = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
			mapData[i][k] = {
				// every map hex is blank to start with
				row: j,
				column: l,
				tileName: '',
				number: '',
				placedTile: false,
				rotation: 0
			}
			l++;
		}
		j++;
	}

	// run the code to transfer the starting tile information into the map
	loadStartingTileDetails(startingTile)
	// now that the starting template for the map has been creatd (as well as the starting tile information), the map is generated
	generateMap();
}

function loadStartingTileDetails(startingTileType){
	let mapRowIndex = mapRowsColumnsIndexes['rows']['row20'];
	let mapColumnIndex = mapRowsColumnsIndexes['columns']['column20'];
	mapData[mapRowIndex][mapColumnIndex].placedTile = true;
	mapData[mapRowIndex][mapColumnIndex].rotation = 0;
	mapData[mapRowIndex][mapColumnIndex].name = startingTileType + '00';
	mapData[mapRowIndex][mapColumnIndex].number = '0';
}

function generateMap() {
	// the map HTML script
	let mapHTML = '<div id="mapHiddenOverlay">';
	for (let i = 0; i < mapData.length; i++) {
		for (let j = 0; j < mapData[i].length; j++) {

			mapHTML += '<div id="row-' + mapData[i][j].row + '-column-' + mapData[i][j].column + '" class="mapTileContainer row-' + mapData[i][j].row + ' column-' + mapData[i][j].column;

			if(mapData[i][j].placedTile) {
				mapHTML +=  ' placedTile">';
				mapHTML +=  '<img class="cropCircleTile" src="img/tiles/' + mapData[i][j].name + '.png" data-tile-rotation="' + mapData[i][j].rotation + '"  data-tile-number="0" style="transform: rotate(' + mapData[i][j].rotation + 'deg);">';
			} else {
				mapHTML +=  '">';
				mapHTML += '<img class="tileOutline" src="img/tileOutline.png" />';
			}

			mapHTML += '</div>';

		}
	}
	mapHTML += '</div>';

	mapHTML += '<div class="zoomOptions">';
	mapHTML += '<img class="zoomBackground" src="img/zoomBackground.png" />';
	mapHTML += '<img zoomType="zoomIn" class="zoomIn zoomOption inactiveZoom" src="img/zoomIn-inactive.png" />';
	mapHTML += '<img zoomType="zoomOut" class="zoomOut zoomOption activeZoom" src="img/zoomOut.png" />';

	mapHTML += '</div>';

	mapHTML += '<div class="mapNavigation">';

	mapHTML += '<img class="navBackground" src="img/woodCircle.png" />';

	mapHTML += '<img direction="up" class="upArrow navArrow" src="img/arrow.png" />';
	mapHTML += '<img direction="right" class="rightArrow navArrow" src="img/arrow.png" />';
	mapHTML += '<img direction="down" class="downArrow navArrow" src="img/arrow.png" />';
	mapHTML += '<img direction="left" class="leftArrow navArrow" src="img/arrow.png" />';

	mapHTML += '</div>';

	mapHTML += '<div id="placedTileOptions">';

	mapHTML += '<button id="undoTilePlacement" class="button is-warning">Undo</button>';
	mapHTML += '<button id="checkTilePlacement" class="button is-success">Confirm</button>';
	mapHTML += '<button id="rotateTileCounterclockwise" class="button is-link">Rotate Counterclockwise</button>';
	mapHTML += '<button id="rotateTileClockwise" class="button is-primary">Rotate Clockwise</button>';
	
	mapHTML += '</div>';

	// the map is generated and all the exisiting information has been replaced
	$('#gameLayer #mapContainer').html(mapHTML);

	$('.navArrow').show();

}

$(document).on('mouseover','#playerTileContainer .playerTilePair:not(.lockedTiles) .availableTileContainer',function(){
	$(this).closest('.playerTilePair').addClass('activePair').removeClass('inactivePair');
});

$(document).on('mouseout','#playerTileContainer .playerTilePair:not(.chosenPair):not(.lockedTiles) .availableTileContainer',function(){
	$(this).closest('.playerTilePair').addClass('inactivePair').removeClass('activePair');
});


$(document).on(touchEvent,'#playerTileContainer .playerTilePair:not(.lockedTiles) .availableTileContainer',function(){

	$('.activePair').addClass('inactivePair').removeClass('activePair');
	$('.chosenPair').removeClass('chosenPair');
	$('.chosenCropCircle').removeClass('chosenCropCircle');
	$('.selectedTileOutline').remove();

	$(this).closest('.playerTilePair').addClass('activePair').removeClass('inactivePair');
	$(this).closest('.playerTilePair').addClass('chosenPair');
	$(this).addClass('chosenCropCircle');
	$(this).append('<img class="selectedTileOutline" src="img/selectedTile.png" />');

	showPossibleTilePlacements('normal');
});



function showPossibleTilePlacements(mode) {

	$('.validPlacement').remove();
	$('.potentialPlacement').removeClass('potentialPlacement');

	// initiate an array to store all of the potentialTile placements into
	var potentialTiles = [];

	// since you need to place a new tile next to an existing tile, the code first of all loops through all of the currently placed tiles out on the board
	$('.mapTileContainer.placedTile').each(function(index) {
		// store the current id of the placedTile in question
		let thisID = $(this).attr('id');
		// run the "neighbourTiles" function to find out which tiles are next to the currently selected already placed tile, and store them in the "potentialPlacements" array
		let potentialPlacements = neighbourTiles(thisID);

		// loop through the "potentialPlacements" to see if any of the neighbourTiles ALREADY HAVE A TILE ON IT
		for (let i = 0; i < potentialPlacements.length; i++) {
			// Only neighbour tiles WITHOUT the "placedTile" class meet the criteria to be pushed into the "potentialTiles" array
			if(!$('#' + potentialPlacements[i]).hasClass('placedTile')) {
				potentialTiles.push(potentialPlacements[i]);
			}
		}
		
	});

	// we apply a new Set to the array of potential tiles, since most (if not all) of the placed tiles border the same empty tiles, so this eliminates duplicates
	var confirmedTiles = [...new Set(potentialTiles)];

	// for the final confirmed map hexes that are valid potential placement, loop through them to add the relevant class (depending on the game mode) that will be used to preview the potential token placements
	for (let i = 0; i < confirmedTiles.length; i++) {
		if(mode == 'normal') {
			$('#' + confirmedTiles[i]).addClass('potentialPlacement');
		} else if(mode == 'natureCube') {
			$('#' + confirmedTiles[i]).addClass('potentialNatureCubeTilePlacement');
		}
		// finally, add the opaque yellow hex to each of the potential map hexes for the player to easily see which hexes can receive the tile that is currently chosen
		$('#' + confirmedTiles[i]).append('<img class="validPlacement" src="img/potentialPlacement.png" />');
	}

}

function neighbourTiles(tileID) {
	
	let splitID = tileID.split('-');
	let thisRow = parseInt(splitID[1]);
	let thisColumn = parseInt(splitID[3]);

	let neighbourTilesIDs = [];

	if(thisColumn % 2 == 0) {
		neighbourTilesIDs.push('row-' + (thisRow - 1) + '-column-' + (thisColumn)); // N
		neighbourTilesIDs.push('row-' + (thisRow - 1) + '-column-' + (thisColumn + 1)); // NE
		neighbourTilesIDs.push('row-' + (thisRow) + '-column-' + (thisColumn + 1)); // SE
		neighbourTilesIDs.push('row-' + (thisRow + 1) + '-column-' + (thisColumn)); // S
		neighbourTilesIDs.push('row-' + (thisRow) + '-column-' + (thisColumn - 1)); // SW
		neighbourTilesIDs.push('row-' + (thisRow - 1) + '-column-' + (thisColumn - 1)); // NW
	} else {
		neighbourTilesIDs.push('row-' + (thisRow - 1) + '-column-' + (thisColumn)); // N
		neighbourTilesIDs.push('row-' + (thisRow) + '-column-' + (thisColumn + 1)); // NE
		neighbourTilesIDs.push('row-' + (thisRow + 1) + '-column-' + (thisColumn + 1)); // SE
		neighbourTilesIDs.push('row-' + (thisRow + 1) + '-column-' + (thisColumn)); // S
		neighbourTilesIDs.push('row-' + (thisRow + 1) + '-column-' + (thisColumn - 1)); // SW
		neighbourTilesIDs.push('row-' + (thisRow) + '-column-' + (thisColumn - 1)); // NW
	}

	return neighbourTilesIDs;
}



$(document).on('mouseenter','.mapTileContainer.potentialPlacement',function(){
	// the .potentialPlacement class has been previously add to every hex container on the map to show the player where they can place the newly chosen tile on the map

	// target the currently hovered over tile
	let thisTile = $(this);

	// the tile+token pairing that had previously been clicked has the .chosenCropCircle class assigned to it
	// targeting the .cropCircleTile child, a copy of all of the tile information is now created on the map hex that the user is currently hovering over
	$('.chosenCropCircle .availableTile').clone().appendTo(thisTile);

	// copying all of the tile contents also copies over the yellow border into the map - which we don't need as the user can easily tell what hex has just ben generated, so we can immediately delete this element from the newly generated tile html in the map
	$('.mapTileContainer.potentialPlacement .availableTile .selectedCropCircleOutline').remove();
});

$(document).on('mouseleave','.mapTileContainer.potentialPlacement',function(){
	// once the user leaves a map hex that is a potential placement, the tile that is currently being previewed is deleted
	$('.mapTileContainer.potentialPlacement .availableTile:not(.lockedIn)').remove();
});

$(document).on(touchEvent,'.mapTileContainer.potentialPlacement',function(){

	$('#cancelTilePairSelection').removeAttr('disabled');

	$('#playerTileContainer .playerTilePair').addClass('lockedTiles');

	$('.selectedTileOutline').remove();

	if($('.mapTileContainer.potentialPlacement .availableTile').length) {

		// add the class mapPreviewTileContainer to the currently cloned tile container in the map hex to be able to differentiate between the tile container that's going to be moved from the displayed are for the purposes of fading and removing the preview version
		$('.mapTileContainer.potentialPlacement .availableTile').addClass('mapPreviewTileContainer');

		// fade out the tileContainer that was cloned into the map hex as a preview so that we can animate the final tile contents from the displayed tile area
		$('.availableTile.mapPreviewTileContainer').fadeOut();

		setTimeout(function(){
			// now that time has passed to fade out the preview tile element that was cloned into the chosen map hex - we can safely remove the previewed tile info
			$('.availableTile.mapPreviewTileContainer').remove();
		}, 300)
	}
	
	// store the id of the map hex currently chosen
	// e.g. -->  row-20-column-19
	let targID = $(this).attr('id');  

	// remove the potentialPlacement class from of the map hex elements, since we don't need to preview anymore tile information now that a tile placement has been finalized
	$('.mapTileContainer.potentialPlacement').removeClass('potentialPlacement');

	// adding the 'lockedIn' class allows differentiation between all of the other tile html in map div once the tile html is animated and transferred into the map
	// this class will be removed once the tile is finalized	
	$('.chosenCropCircle .availableTile').addClass('lockedIn')

	// now that the chosen tile has been selected by the user AND a valid hex on the map has also been clicked on to move the chosen tile - all of the other tile+token elements have an inactive class added in order to show that they are currently off limits to be chosen
	// this was not done previously as even once the user had clicked JUST the displayed tile+tokencombination, they could just as easily click another container to change their mind
	// $('.availableTileContainer:not(.chosenCropCircle)').addClass('inactive');

	temporarilyLockMap(1000);

	// move the chosen displayed tile onto the chosen blank map hex
	$('.chosenCropCircle .availableTile.lockedIn').parentToAnimate($('#' + targID), 1000);

	setTimeout(function(){
		// adding the showOptions class to the #placedTileOptions element causes it to slideUp for the user to view the options, such as rotating the tile, confirming the placement, or cancelling the placement
		$('#mapContainer #placedTileOptions').addClass('showOptions');
		rotateTileAllowed = true;
	}, 300)
	
})

function updateNextTurn(mode){
	// starting variable: let turnsLeft = 21;

	if(mode != 'setup') {
		// the function runs when the player succesfully concludes a turn, the turnsLeft variable figure is always reduced by one
		turnsLeft--;
	}

	// then the new turnsLeft figure is updated in the Turns Left info on the page
	$('.turnsLeftFigure').html(turnsLeft);

	// if the turnsLeft variable is at 0, the game is over, and the red color indicates this to the player
	if(turnsLeft == 0) {
		$('#turnsContainer').addClass('has-text-danger');
	}
}

function endOfGameNotification() {
	// run this function once the human player places all of their 21 tiles
	// remove the displayed tiles and tokens area (since we don't need them anymore)
	updateNextTurn('nextTurn');
	$('#lastTurnModal').addClass('is-active');

}

function endOfGameSetup() {
	alert('Game over!')
}

function debugShowTileIDs(){
	$('.mapTileContainer.placedTile').each(function(){
		if($(this).hasClass('placedToken')) {
			let currentTileID = $(this).attr('id');
			let splitCurrentTileID = currentTileID.split('-');
	
			let thisRow = parseInt(splitCurrentTileID[1]);
			let thisColumn = parseInt(splitCurrentTileID[3]);
	
			$(this).append(`<p class="debugTileCoords">${thisRow}-${thisColumn}</p>`);
		} else {
			$(this).remove();
		}
	})
}

let allPlacedTiles = {};
let allPlacedTokens = {};

let habitatMatches = {
	desert: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	},
	forest: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	},
	lake: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	},
	mountain: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	},
	swamp: {
		placedTiles: 0,
		tilesWithMatchedHabitats: [],
		finalSets:[],
		largestSet: 0
	}
};

let rotationIndexes = {
	positive: [0, 60, 120, 180, 240, 300],
	negative: [0, -300, -240, -180, -120, -60]
}

function processRotationFigure(rotation){	
	if(rotation >= 360) {
		rotation = rotation % 360;
	} else if(rotation <= -360) {
		rotation = rotation % -360;
	}	
	return rotation;
}

function findRotationIndex(rotation){
	let rotationIndex = 0;
	if(Math.sign(rotation) != -1) {		
		rotationIndex = rotationIndexes['positive'].indexOf(rotation);		
		return rotationIndex;
	} else {		
		rotationIndex = rotationIndexes['negative'].indexOf(rotation);		
		return rotationIndex;
	}
}

let directions = ['NE', 'E', 'SE', 'SW', 'W', 'NW'];
let oppositeDirections = ['SW', 'W', 'NW', 'NE', 'E', 'SE'];

let linkedTileSides = [
	{	
		rowColMapping: [{
				rowDif: -1,
				colDif: 0
			},{
				rowDif: -1,
				colDif: +1
			}
		],
		direction: 'NE',
		oppositeDirection: 'SW',
		indexMatch: '0-3'
	},{	
		rowColMapping: [{
			rowDif: 0,
			colDif: +1
		},{
			rowDif: 0,
			colDif: +1
		}],
		direction: 'E',
		oppositeDirection: 'W',
		indexMatch: '1-4'
	},{	
		rowColMapping: [{
			rowDif: +1,
			colDif: 0
		},{
			rowDif: +1,
			colDif: +1
		}],
		direction: 'SE',
		oppositeDirection: 'NW',
		indexMatch: '2-5'
	},{	rowColMapping: [{
			rowDif: +1,
			colDif: -1
		},{
			rowDif: +1,
			colDif: 0
		}],
		direction: 'SW',
		oppositeDirection: 'NE',
		indexMatch: '3-0'
	},{	
		rowColMapping: [{
			rowDif: 0,
			colDif: -1
		},{
			rowDif: 0,
			colDif: -1
		}],
		direction: 'W',
		oppositeDirection: 'E',
		indexMatch: '4-1'
	},{	
		rowColMapping: [{
			rowDif: -1,
			colDif: -1
		},
		{
			rowDif: -1,
			colDif: 0
		}],
		direction: 'NW',
		oppositeDirection: 'SE',
		indexMatch: '5-2'
	}
];

// function processPlacedTilesAndTokens() {

// 	let tileNum = 1;
	
// 	for (let i = 0; i < mapData.length; i++) {
// 		for (let j = 0; j < mapData[i].length; j++) {
// 			if(mapData[i][j].placedTile) {
// 					let thisRow = mapData[i][j].row;
// 					let thisColumn = mapData[i][j].column;
// 					let thisRotation = processRotationFigure(parseInt(mapData[i][j].rotation));
// 					let numTurns = findRotationIndex(thisRotation);
// 					let thisHabitats = [];
// 					let thisHabitatSides = new Array(6);
// 				if(mapData[i][j].habitats.length == 1) {
		
// 					for (let k = 0; k < thisHabitatSides.length; k++) {
// 						thisHabitatSides[k] = mapData[i][j].habitats[0];
// 					}

// 					habitatMatches[mapData[i][j].habitats[0]].placedTiles++;
// 					thisHabitats.push(mapData[i][j].habitats[0]);

// 				} else if(mapData[i][j].habitats.length == 2) {

// 					// let numTurns = rotationIndexes.indexOf(thisRotation);
// 					let habitatsLoaded = 0;
// 					let turnedIndex = habitatsLoaded + numTurns;

// 					habitatMatches[mapData[i][j].habitats[0]].placedTiles++;
// 					habitatMatches[mapData[i][j].habitats[1]].placedTiles++;

// 					thisHabitats.push(mapData[i][j].habitats[1], mapData[i][j].habitats[0]);
// 					let currentHabitat = thisHabitats[0];
					
// 					for (let k = 0; k < thisHabitatSides.length; k++) {

// 						thisHabitatSides[turnedIndex] = currentHabitat;
						
// 						turnedIndex++
// 						if(turnedIndex == 6) turnedIndex = 0;

// 						habitatsLoaded++
// 						if(habitatsLoaded == 3) currentHabitat = thisHabitats[1];

// 					}
// 				}

// 				allPlacedTiles['row-' + thisRow + '-column-' + thisColumn] = {
// 					tileNum: tileNum,
// 					row: thisRow,
// 					column: thisColumn,
// 					rotation: thisRotation,
// 					habitats: thisHabitats,
// 					habitatSides: thisHabitatSides
// 				}

// 				if(mapData[i][j].placedToken) allPlacedTokens['row-' + thisRow + '-column-' + thisColumn] = mapData[i][j].placedToken;
// 				tileNum++;
// 			}
// 		}
// 	}

// 	const tileIDs = Object.keys(allPlacedTiles);
			
// 	for (const tileID of tileIDs) {

// 		let thisRow = allPlacedTiles[tileID].row
// 		let thisColumn = allPlacedTiles[tileID].column
		
// 		let rowColMapSet = thisRow % 2;
// 		if(rowColMapSet != 0) rowColMapSet = 1;

// 		for (let i = 0; i < linkedTileSides.length; i++) {

// 			let newRow = thisRow + linkedTileSides[i].rowColMapping[rowColMapSet].rowDif;
// 			let newColumn = thisColumn + linkedTileSides[i].rowColMapping[rowColMapSet].colDif;		
// 			let newTileID = 'row-' + newRow + '-column-' + newColumn;

// 			if(allPlacedTiles.hasOwnProperty(newTileID)) {
// 				let matchedIndexes = linkedTileSides[i].indexMatch.split('-');
// 				if(allPlacedTiles[tileID].habitatSides[matchedIndexes[0]] == allPlacedTiles[newTileID].habitatSides[matchedIndexes[1]]) {
// 					let thisTileNum = allPlacedTiles[tileID].tileNum;
// 					let matchedTileNum = allPlacedTiles[newTileID].tileNum;
// 					habitatMatches[allPlacedTiles[tileID].habitatSides[matchedIndexes[0]]].tilesWithMatchedHabitats.push(thisTileNum + '-' + matchedTileNum);
// 				}
// 			}
// 		}
// 	}

// 	let oldHabitatMatches = JSON.parse(JSON.stringify(habitatMatches))
// 	const allHabitats = Object.keys(habitatMatches);
			
// 	for (const currentHabitat of allHabitats) {

// 		if(habitatMatches[currentHabitat].placedTiles > 0) {
// 			if(habitatMatches[currentHabitat].tilesWithMatchedHabitats.length > 0){

// 				let linkedTiles = JSON.parse(JSON.stringify(habitatMatches[currentHabitat].tilesWithMatchedHabitats));

// 				let tileQueue = [];
// 				let thisTileGroup = [];

// 				while(linkedTiles.length > 0) {

// 					tileQueue = [];
// 					thisTileGroup = [];

// 					let firstTiles = linkedTiles.pop();
// 					let splitFirstTiles = firstTiles.split('-');
// 					let reverseTileMatch = splitFirstTiles[1] + '-' + splitFirstTiles[0];

// 					let reverseTileIndex = linkedTiles.indexOf(reverseTileMatch);

// 					if(reverseTileIndex !== -1) {
// 						let removedTile = linkedTiles.splice(reverseTileIndex, 1);
// 					}

// 					tileQueue.push(splitFirstTiles[0], splitFirstTiles[1])

// 					while(tileQueue.length > 0) {

// 						for (let k = linkedTiles.length - 1; k >= 0; k--) {
// 							let tileToCheckString = linkedTiles[k].toString();
// 							let tileToCheckSplit = tileToCheckString.split('-');
// 							if(tileQueue[0] == tileToCheckSplit[0]) {
// 								let matched = linkedTiles.splice(k, 1);
// 								let matchedString = matched.toString();
// 								let splitMatched = matchedString.split('-');
// 								if(tileQueue.indexOf(splitMatched[1]) === -1 && thisTileGroup.indexOf(splitMatched[1]) === -1) {
// 									tileQueue.push(splitMatched[1]);
// 								}

// 							}
// 						}

// 						let lastTileChecked = tileQueue.shift();
// 						thisTileGroup.push(lastTileChecked);
// 					}

// 					if(thisTileGroup.length > habitatMatches[currentHabitat].largestSet) {
// 						habitatMatches[currentHabitat].largestSet = thisTileGroup.length;
// 					}

// 					habitatMatches[currentHabitat].finalSets.push(thisTileGroup);

// 				}
// 			} else {
// 				habitatMatches[currentHabitat].largestSet = 1;
// 			}
// 		}
// 	}

// }

function shuffleObject(obj){
    // new obj to return
  let newObj = {};
    // create keys array
  let keys = Object.keys(obj);
    // randomize keys array
    keys.sort(function(a,b){return Math.random()- 0.5;});
  // save in new array
    keys.forEach(function(k) {
        newObj[k] = obj[k];
});
  return newObj;
}

function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
  
	return array;
}

Object.defineProperties(Array.prototype, {
    count: {
        value: function(value) {
            return this.filter(x => x==value).length;
        }
    }
});


jQuery.fn.extend({
    // Modified and Updated by MLM
    // Origin: Davy8 (http://stackoverflow.com/a/5212193/796832)
    parentToAnimate: function(newParent, duration) {

        duration = duration || 'slow';
        
		let $element = $(this);

		newParent = $(newParent); // Allow passing in either a JQuery object or selector

		let oldOffset = $element.offset();
        $(this).appendTo(newParent);
        let newOffset = $element.offset();
        
		let temp = $element.clone().appendTo('body');

		let startTransformVal = 'scale(1) ' + $element[0].style.transform;
		let endTransformVal = 'scale(1) ' + $element[0].style.transform;

		let transformProperty = $('#container').css('transform');

		if(transformProperty != 0) {
			endTransformVal = transformProperty + $element[0].style.transform;
		}

		
		if($element[0].className == 'availableTile rejectedTiles') {

			let startWidth = $element[0].offsetWidth;
			let endWidth = 0;

			let startHeight = $element[0].offsetHeight;
			let endHeight = 0;

			let startOpacity = .4;
			let endOpacity = .4;

			let startTop = oldOffset.top;
			let endTop = newOffset.top;

			let startLeft = oldOffset.left;
			let endLeft = newOffset.left;

			let tileRotationString = $element[0].style.transform;
			let tileRotation = parseInt(tileRotationString.match(/(\d+)/));

			if(tileRotation % 180 != 0 ) {
				startTop = startTop + 21;
				endTop = endTop + 21;

				startLeft = startLeft + 15;
				endLeft = endLeft + 15;
			}

			endTop = endTop + 30;
			endLeft = endLeft - 110;
		
			temp.css({
				'position': 'absolute',
				'top': startTop,
				'left': startLeft,
				'transform': startTransformVal,
				'width': startWidth,
				'height': startHeight,
				'opacity': startOpacity,
				'zIndex': 1000
			});
			
			$element.hide();

			temp.animate({
				'top': endTop,
				'left': endLeft,
				'transform': endTransformVal,
				'width': endWidth,
				'height': endHeight,
				'opacity': endOpacity
			}, duration, function() {
				$element.remove();
				temp.remove();
			});

		} else if($element[0].className == 'availableTile' || $element[0].className == 'availableTile lockedIn') {

			let zoomScale = Number(zoomLevel)/10;

			let startWidth = $element[0].offsetWidth;
			let endWidth = $element[0].offsetWidth;

			let startHeight = $element[0].offsetHeight;
			let endHeight = $element[0].offsetHeight;

			let startOpacity = 1;
			let endOpacity = 1;

			let startTop = oldOffset.top;
			let endTop = newOffset.top;

			let startLeft = oldOffset.left;
			let endLeft = newOffset.left;

			let tileRotationString = $element[0].style.transform;
			let tileRotation = parseInt(tileRotationString.match(/(\d+)/));

			if(tileRotation % 180 != 0 ) {
				startTop = startTop + 21;
				endTop = endTop + 21;

				startLeft = startLeft + 15;
				endLeft = endLeft + 15;
			}
			
			if(newParent[0].offsetParent.id == 'mapHiddenOverlay') {
			
				endWidth = startWidth * zoomScale;
				endHeight = startHeight * zoomScale;

			} else if(newParent[0].offsetParent.id == 'tilePairOne' || newParent[0].offsetParent.id == 'tilePairTwo') {

				startWidth = endWidth * zoomScale;
				startHeight = endHeight * zoomScale;

				endOpacity = .4;
			
				let transformProperty = $('#container').css('transform');

				if(transformProperty != 0) {
					endTransformVal = transformProperty;
				}

			}

			temp.css({
				'position': 'absolute',
				'top': startTop,
				'left': startLeft,
				'transform': startTransformVal,
				'width': startWidth,
				'height': startHeight,
				'opacity': startOpacity,
				'zIndex': 1000
			});
			
			$element.hide();

			temp.animate({
				'top': endTop,
				'left': endLeft,
				'transform': endTransformVal,
				'width': endWidth,
				'height': endHeight,
				'opacity': endOpacity
			}, duration, function() {
				$element.show();
				temp.remove();
			});

		} else if($element[0].className == 'availableTile movingElementOpacity') {

			temp.css({
				'position': 'absolute',
				'left': oldOffset.left,
				'top': oldOffset.top,
				'transform': startTransformVal,
				'opacity': .75,
				'zIndex': 1000
			});
			
			$element.hide();

			temp.animate({
				'top': newOffset.top,
				'transform': endTransformVal,
				'left': newOffset.left,
				'opacity': .75
			}, duration, function() {
				$element.show();
				temp.remove();
				$element.css('opacity', '1');
			});

		} else {

			temp.css({
				'position': 'absolute',
				'left': oldOffset.left,
				'top': oldOffset.top,
				'transform': startTransformVal,
				'zIndex': 1000
			});
			
			$element.hide();

			temp.animate({
				'top': newOffset.top,
				'transform': endTransformVal,
				'left': newOffset.left
			}, duration, function() {
				$element.show();
				temp.remove();
			});

		}

    }
});

function countInArray(array, what) {
    let count = 0;
    for (let i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function openInNewTab(url) {
	let win = window.open(url, '_blank');
	win.focus();
  }

function returnDuplicates(arr, arr2) {
    let ret = [];
    for(let i in arr) {   
        if(arr2.indexOf(arr[i]) > -1){
            ret.push(arr[i]);
        }
    }
    return ret.toString();
};

function allPossibleCases(arr) {
	if (arr.length === 0) {
		return [];
	} else if (arr.length ===1) {
		return arr[0];
	} else {
		let result = [];
		let allCasesOfRest = allPossibleCases(arr.slice(1));  // recur with the rest of array
		for (let c in allCasesOfRest) {
			for (let i = 0; i < arr[0].length; i++) {
				result.push(`${arr[0][i]} ${allCasesOfRest[c]}`);
			}
		}
		return result;
	}
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    let max = arr[0];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}
