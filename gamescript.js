let canvas, ctx;
let canvas_width = 400;
let canvas_height = 600;

let lastTime = 0;
let score = 0;

let bird_x = 100;
let bird_y = 280;
let bird_width = 34;
let bird_height = 24;
let velocity = 0;
let gravity = 950;

let pipes = [];
const pipe_width = 70;
const pipe_gap = 140;
const pipe_speed = 180;    // pixels per second
const pipe_interval = 1.6; // seconds
let pipeTimer = 0;

let bird = {
    x: bird_x,
    y: bird_y,
    width: bird_width,
    height: bird_height
}


function jump() {
    velocity = -350;
}

window.onload = function() {
    canvas = document.getElementById("gameCanvas");
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    ctx = canvas.getContext("2d");

    window.addEventListener("keydown", function(e) {
        if (e.code === "Space") jump();
    });

    window.addEventListener("mousedown", jump);
    window.addEventListener("touchstart", jump);

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}


function gameLoop(timestamp) {
    const delta = (timestamp - lastTime)/1000;
    lastTime = timestamp;

    update(delta);
    draw();

    requestAnimationFrame(gameLoop);
}


function update(delta) {
    velocity += gravity * delta
    bird.y += velocity * delta

    pipes.forEach(pipe => {
        pipe.x -= pipe_speed * delta;
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    pipeTimer += delta;
    if (pipeTimer > pipe_interval) {
        pipeTimer = 0;
        spawnPipe();
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird();
    drawPipes();
    drawScore();
}


function drawBird() {
    ctx.fillStyle = "white";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}


function drawPipes() {
    ctx.fillStyle = "blue";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);             // Top
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottomHeight); // Bottom
    });
}


function drawScore() {
    ctx.font = "bold 40px Lato";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.lineWidth = 2; 
    ctx.strokeStyle = "white";
    ctx.strokeText(score, canvas.width / 2, 10);
}


function spawnPipe() {
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;
    
    let topHeight = getRandomInt(50, canvas.height - pipe_gap - 50);
    let bottomY = topHeight + pipe_gap;
    let bottomHeight = canvas.height - bottomY;

    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipe_width,
        height: topHeight,
        bottomY: bottomY,
        bottomHeight: bottomHeight,
        passed: false  
    });
}


function checkCollision() {

}


function resetGame() {

}


function incrementScore() {
    
}
