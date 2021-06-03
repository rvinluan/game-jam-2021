let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d");

document.querySelector('#start-button')?.addEventListener('click', async () => {
    await Tone.start();
    init();
    mainloop();
})

const testSampler = new Tone.Sampler({
    urls: {
        "C4": "piano-c.mp3",
    },
    release: 1,
    baseUrl: "samples/",
}).toDestination();

Tone.loaded().then(() => {
})

function Piece() {
    var x,
        y,
        z,
        imgData,
        imgWidth,
        imgHeight,
        clickOffsetX,
        clickOffsetY,
        player,
        isBeingDragged;
}

Piece.prototype.draw = function() {
    ctx.drawImage(this.img, this.x, this.y, this.imgWidth, this.imgHeight);
}

Piece.prototype.isInside = function(x, y) {
    return ( x > this.x && x < this.x + this.imgWidth && y > this.y && y < this.y + this.imgHeight );
}

Piece.prototype.updatePosition = function(x, y) {
    this.x = x - this.clickOffsetX;
    this.y = y - this.clickOffsetY;
}

Piece.prototype.playNotes = function() {
    this.player.start();
}

var allPieces = [];
var mouseX, mouseY;

function getTopPiece(x, y) {
    dragCandidates = [];
    allPieces.forEach(i => {
        if (i.isInside(x, y)) {
            dragCandidates.push(i);
        }
    });
    if (dragCandidates.length == 0) {
        return null;
    } else if (dragCandidates.length > 1) {
        dragCandidates.sort((a, b) => a.z - b.z);
        return dragCandidates.pop();
    } else {
        var selectedPiece = dragCandidates[0];
        //make selected piece have z+1 of the highest z
        var zSorted = [...allPieces].sort((a, b) => a.z - b.z);
        selectedPiece.z = zSorted.pop().z + 1;
        return selectedPiece;
    }
}

canvas.addEventListener("mousedown", function(e){
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    var selectedPiece = getTopPiece(e.offsetX, e.offsetY);
    if(selectedPiece == null) {
        return;
    }
    selectedPiece.isBeingDragged = true;
    selectedPiece.clickOffsetX = e.offsetX - selectedPiece.x;
    selectedPiece.clickOffsetY = e.offsetY - selectedPiece.y;
})

canvas.addEventListener("mousemove", function(e){
    mouseX = e.offsetX;
    mouseY = e.offsetY;
})

canvas.addEventListener("mouseup", function (e) {
    allPieces.forEach(i => {
        i.isBeingDragged = false;
    });
})

canvas.addEventListener("dblclick", function(e) {
    var selected = getTopPiece(e.offsetX, e.offsetY);
    console.log(selected);
    selected.playNotes();
})

function init() {
    for (var i = 0; i < 4; i++) {
        var p = new Piece();
        var img = document.getElementById("1_" + (i + 1));
        p.x = Math.round(Math.random() * 200);
        p.y = Math.round(Math.random() * 250);
        p.z = i;
        p.img = img;
        p.imgWidth = img.offsetWidth;
        p.imgHeight = img.offsetHeight;
        var ply = new Tone.Player("samples/1_"+(i+1)+".mp3").toDestination();
        p.player = ply;
        allPieces.push(p);
    }
}

function mainloop() {
    ctx.fillStyle = "#ffeeff";
    ctx.fillRect(0,0,800,1000);
    allPieces.sort((a,b) => a.z - b.z);
    allPieces.forEach(i => {
        i.draw();
        if(i.isBeingDragged) {
            i.updatePosition(mouseX, mouseY);
        }
    });
    requestAnimationFrame(mainloop);
}