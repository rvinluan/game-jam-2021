let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d");

document.querySelector('#start-button-1')?.addEventListener('click', async () => {
    await Tone.start();
    init(1);
    mainloop();
})

document.querySelector('#start-button-2')?.addEventListener('click', async () => {
    await Tone.start();
    init(2);
    mainloop();
})

document.querySelector('#start-button-3')?.addEventListener('click', async () => {
    await Tone.start();
    init(3);
    mainloop();
})

document.querySelector('#start-button-4')?.addEventListener('click', async () => {
    await Tone.start();
    init(4);
    mainloop();
})

// Start Button Group

document.querySelector('#group-start-button-1')?.addEventListener('click', async () => {
    await Tone.start();
    init(1);
    mainloop();
})

document.querySelector('#group-start-button-2')?.addEventListener('click', async () => {
    await Tone.start();
    init(2);
    mainloop();
})

document.querySelector('#group-start-button-3')?.addEventListener('click', async () => {
    await Tone.start();
    init(3);
    mainloop();
})

document.querySelector('#group-start-button-4')?.addEventListener('click', async () => {
    await Tone.start();
    init(4);
    mainloop();
})

document.querySelector("#listen")?.addEventListener('click', () => {
    var st = 0;
    placedPieces.forEach((e, i) => {
        if(i > 0) {
            st += placedPieces[i-1].player.buffer.duration;
            st -= 0.05;
        }
        Tone.Transport.scheduleOnce( (time) => {
            console.log(e);
            e.player.start();
        } , st)
    })
    Tone.Transport.stop();
    Tone.Transport.start();
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

Piece.prototype.addToAnswer = function() {
    var totalWidth;
    if(placedPieces.length >= 1) {
        totalWidth = placedPieces.reduce((v, i) => v += i.imgWidth, 0);
    } else {
        totalWidth = 0;
    }
    placedPieces.push(this);
    this.y = answerArea - answerAreaOffset;
    this.x = totalWidth;
}

var allPieces = [];
var placedPieces = [];
var selectedPiece;
var mouseX, mouseY;
const answerArea = 200;
const answerAreaOffset = 50;

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
        var sel = dragCandidates[0];
        //make selected piece have z+1 of the highest z
        var zSorted = [...allPieces].sort((a, b) => a.z - b.z);
        sel.z = zSorted.pop().z + 1;
        return sel;
    }
}

function removeFromArray(array, piece) {
    let i = array.indexOf(piece);
    if(i > -1) {
        array.splice(i,1);
    }
}

canvas.addEventListener("mousedown", function(e){
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    selectedPiece = getTopPiece(e.offsetX, e.offsetY);
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
    selectedPiece.isBeingDragged = false;
    if(e.offsetY > answerArea - answerAreaOffset && e.offsetY < answerArea + answerAreaOffset) {
        if(placedPieces.indexOf(selectedPiece) == -1) {
            selectedPiece.addToAnswer();
        }
    } else {
        removeFromArray(placedPieces, selectedPiece);
    }
})

canvas.addEventListener("dblclick", function(e) {
    var selected = getTopPiece(e.offsetX, e.offsetY);
    console.log(selected);
    selected.playNotes();
})

function init(whichLevel) {
    levelData = [4,5,5,7];
    allPieces = [];
    placedPieces = [];
    for (var i = 0; i < levelData[whichLevel - 1]; i++) {
        var p = new Piece();
        var img = document.getElementById(whichLevel+"_" + (i + 1));
        p.x = Math.round(Math.random() * 200);
        p.y = Math.round(300 + Math.random() * 100);
        p.z = i;
        p.img = img;
        p.imgWidth = img.offsetWidth;
        p.imgHeight = img.offsetHeight;
        var ply = new Tone.Player("samples/"+whichLevel+"_"+(i+1)+".mp3").toDestination();
        p.player = ply;
        allPieces.push(p);
    }
}

function mainloop() {
    var all = document.getElementsByClassName('page')

    Array.from(all).forEach((ele) => {
      ele.style.display = 'none'
    })

    ctx.fillStyle = "#ffeeff";
    ctx.fillRect(0,0,900,1000);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,answerArea,900,5);
    ctx.fillRect(0,answerArea-answerAreaOffset,900,1);
    ctx.fillRect(0,answerArea+answerAreaOffset,900,1);
    allPieces.sort((a,b) => a.z - b.z);
    allPieces.forEach(i => {
        i.draw();
        if(i.isBeingDragged) {
            i.updatePosition(mouseX, mouseY);
        }
    });
    var widthSoFar = 0;
    placedPieces.forEach(i => {
        i.x = widthSoFar;
        widthSoFar += i.imgWidth;
    })
    requestAnimationFrame(mainloop);
}
