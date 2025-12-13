let canvas, ctx;
let canvas_width = 400;
let canvas_height = 600;

let player_x = 100;
let player_y = 280;
let player_width = 34;
let player_height = 24;
let velocity = 0;
let gravity = 950;

let pipes = [];
const pipe_width = 70;
const pipe_gap = 140;
const pipe_speed = 180;
const pipe_interval = 1.6;
let pipeTimer = 0;

let player = {
    x: player_x,
    y: player_y,
    width: player_width,
    height: player_height
}

let lastTime = 0;
let score = 0;

const GameState = {
    START: "start",
    PLAYING: "playing",
    GAME_OVER: "game_over"
};

const playButton = {
    x: canvas_width / 2 - 80,
    y: canvas_height / 2 + 40,
    width: 160,
    height: 50
};

let gameState = GameState.START;

window.onload = function() {
    canvas = document.getElementById("gameCanvas");
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    ctx = canvas.getContext("2d");

    window.addEventListener("keydown", handleInput);
    canvas.addEventListener("mousedown", handleCanvasInput);
    canvas.addEventListener("touchstart", handleCanvasInput);
    canvas.addEventListener("contextmenu", e => e.preventDefault());

    window.addEventListener("wheel", e => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });

    window.addEventListener("keydown", e => {
        if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "=")) {
            e.preventDefault();
        }
    });

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function handleInput(e) {
    if (e.code !== "Space") return;

    if (gameState === GameState.START) startGame();
    else if (gameState === GameState.PLAYING) velocity = -350;
}


function handleCanvasInput(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    if (gameState === GameState.START) {
        startGame();
        return;
    }

    if (gameState === GameState.PLAYING) {
        velocity = -350;
        return;
    }

    if (gameState === GameState.GAME_OVER) {
        if (
            x >= playButton.x &&
            x <= playButton.x + playButton.width &&
            y >= playButton.y &&
            y <= playButton.y + playButton.height
        ) {
            resetGame();
        }
    }
}


function gameLoop(timestamp) {
    const delta = (timestamp - lastTime)/1000;
    lastTime = timestamp;

    update(delta);
    draw();

    requestAnimationFrame(gameLoop);
}


function update(delta) {
    if (gameState !== GameState.PLAYING) return;

    velocity += gravity * delta
    player.y += velocity * delta

    pipes.forEach(pipe => {
        pipe.x -= pipe_speed * delta;
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    pipeTimer += delta;
    if (pipeTimer > pipe_interval) {
        pipeTimer = 0;
        spawnPipe();
    }

    pipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipe.width < player.x) {
            pipe.passed = true;
            incrementScore();
        }
    });

    checkCollision();
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawplayer();
    drawPipes();
    drawScore();
    if (gameState === GameState.GAME_OVER) {
        drawGameOver();
        drawPlayButton();
    }

    if (gameState === GameState.START) {
        drawStartText();
    }
}


function drawplayer() {
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}


function drawPipes() {
    ctx.fillStyle = "black";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottomHeight);
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


function drawStartText() {
    ctx.fillStyle = "white";
    ctx.font = "bold 32px Lato";
    ctx.textAlign = "center";
    ctx.fillText("TAP", canvas.width / 1.8, canvas.height / 1.8);
    ctx.font = "50px Lato";
    ctx.fillText("👆 ", canvas.width / 2.2, canvas.height / 1.6);
}


function drawGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 50px Lato";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2.2 - 20);
}


function drawPlayButton() {
    ctx.fillStyle = "white";
    ctx.fillRect(
        playButton.x,
        playButton.y,
        playButton.width,
        playButton.height
    );

    ctx.fillStyle = "black";
    ctx.font = "bold 24px Lato";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
        "PLAY",
        playButton.x + playButton.width / 2,
        playButton.y + playButton.height / 2
    );
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
    if (player.y + player.height >= canvas.height || player.y <= 0) {
        gameState = GameState.GAME_OVER;
        return;
    }

    for (let pipe of pipes) {
        const hitTop = player.x < pipe.x + pipe.width &&
                       player.x + player.width > pipe.x &&
                       player.y < pipe.height;

        const hitBottom = player.x < pipe.x + pipe.width &&
                          player.x + player.width > pipe.x &&
                          player.y + player.height > pipe.bottomY;

        if (hitTop || hitBottom) {
            gameState = GameState.GAME_OVER;
            return;
        }
    }
}


function startGame() {
    gameState = GameState.PLAYING;
    velocity = -350;
}


function resetGame() {
    player.y = player_y;
    velocity = 0;
    pipes = [];
    score = 0;
    pipeTimer = 0;
    gameState = GameState.START;
}


function incrementScore() {
    score++;
}
