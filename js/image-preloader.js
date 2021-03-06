function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
    });
}

preload([
    'img/arrow.png',
    'img/blank-map.jpg',
    'img/buttonBackground.jpg',
    'img/cross.png',
    'img/keyboard-keys-move.png',
    'img/keyboard-keys-rotate.png',
    'img/kickstarter.jpg',
    'img/potentialPlacement.png',
    'img/selectedTile.png',
    'img/tileOutline.png',
    'img/tilePlacementCancel.png',
    'img/tilePlacementConfirm.png',
    'img/tilePlacementRotateClockwise.png',
    'img/tilePlacementRotateCounterClockwise.png',
    'img/title.jpg',
    'img/woodCircle.png',
    'img/zoomBackground.png',
    'img/zoomIn.png',
    'img/zoomIn-inactive.png',
    'img/zoomOut.png',
    'img/zoomOut-inactive.png',
    'img/tiles/blue00.png',
    'img/tiles/blue01.png',
    'img/tiles/blue02.png',
    'img/tiles/blue03.png',
    'img/tiles/blue04.png',
    'img/tiles/blue05.png',
    'img/tiles/blue06.png',
    'img/tiles/blue07.png',
    'img/tiles/blue08.png',
    'img/tiles/blue09.png',
    'img/tiles/lunar00.png',
    'img/tiles/lunar01.png',
    'img/tiles/lunar02.png',
    'img/tiles/lunar03.png',
    'img/tiles/lunar04.png',
    'img/tiles/lunar05.png',
    'img/tiles/lunar06.png',
    'img/tiles/lunar07.png',
    'img/tiles/lunar08.png',
    'img/tiles/lunar09.png',
    'img/tiles/solar00.png',
    'img/tiles/solar01.png',
    'img/tiles/solar02.png',
    'img/tiles/solar03.png',
    'img/tiles/solar04.png',
    'img/tiles/solar05.png',
    'img/tiles/solar06.png',
    'img/tiles/solar07.png',
    'img/tiles/solar08.png',
    'img/tiles/solar09.png',
    'img/tiles/tentacle00.png',
    'img/tiles/tentacle01.png',
    'img/tiles/tentacle02.png',
    'img/tiles/tentacle03.png',
    'img/tiles/tentacle04.png',
    'img/tiles/tentacle05.png',
    'img/tiles/tentacle06.png',
    'img/tiles/tentacle07.png',
    'img/tiles/tentacle08.png',
    'img/tiles/tentacle09.png',
    'img/tiles/yellow00.png',
    'img/tiles/yellow01.png',
    'img/tiles/yellow02.png',
    'img/tiles/yellow03.png',
    'img/tiles/yellow04.png',
    'img/tiles/yellow05.png',
    'img/tiles/yellow06.png',
    'img/tiles/yellow07.png',
    'img/tiles/yellow08.png',
    'img/tiles/yellow09.png'
]);