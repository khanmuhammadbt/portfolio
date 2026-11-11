(() => {
    const pageShell = document.querySelector(".page-shell");
    const connectionLabel = document.getElementById("connection-label");
    const canvas = document.getElementById("game-canvas");
    const context = canvas.getContext("2d");
    const scoreElement = document.getElementById("score");
    const bestScoreElement = document.getElementById("best-score");
    const message = document.getElementById("game-message");
    const messageKicker = document.getElementById("message-kicker");
    const messageTitle = document.getElementById("message-title");
    const messageHint = document.getElementById("message-hint");
    const startButton = document.getElementById("start-button");
    const restartButton = document.getElementById("restart-button");

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const GROUND = 151;
    const PLAYER_X = 82;
    const PLAYER_WIDTH = 33;
    const PLAYER_HEIGHT = 39;
    const STORAGE_KEY = "km-offline-dino-best";
    let bestScore = readBestScore();
    let score = 0;
    let scoreProgress = 0;
    let playerY = GROUND - PLAYER_HEIGHT;
    let playerVelocity = 0;
    let speed = 285;
    let obstacles = [];
    let spawnDistance = 300;
    let state = "ready";
    let previousFrame = 0;
    let animationFrame = 0;
    let shouldReturnOnOnline = !navigator.onLine;

    try {
        shouldReturnOnOnline = shouldReturnOnOnline || sessionStorage.getItem("offline-return-url") !== null;
    } catch (error) {
        console.error("Could not check the page saved before offline mode.", error);
    }

    bestScoreElement.textContent = formatScore(bestScore);

    function formatScore(value) {
        return String(value).padStart(5, "0");
    }

    function readBestScore() {
        try {
            const saved = Number.parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
            return Number.isFinite(saved) && saved > 0 ? saved : 0;
        } catch (error) {
            console.error("Could not read the offline game best score.", error);
            return 0;
        }
    }

    function saveBestScore() {
        if (score <= bestScore) return;
        bestScore = score;
        bestScoreElement.textContent = formatScore(bestScore);
        try {
            localStorage.setItem(STORAGE_KEY, String(bestScore));
        } catch (error) {
            console.error("Could not save the offline game best score.", error);
        }
    }

    function updateScore() {
        scoreElement.textContent = formatScore(score);
    }

    function showMessage(kicker, title, hint) {
        messageKicker.textContent = kicker;
        messageTitle.textContent = title;
        messageHint.textContent = hint;
        message.classList.remove("is-hidden");
    }

    function hideMessage() {
        message.classList.add("is-hidden");
    }

    function drawScene() {
        context.clearRect(0, 0, WIDTH, HEIGHT);
        context.fillStyle = "#0d1911";
        context.fillRect(0, 0, WIDTH, HEIGHT);

        context.fillStyle = "rgba(112, 229, 154, 0.035)";
        context.beginPath();
        context.arc(580, 35, 105, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = "rgba(172, 210, 181, 0.19)";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(0, GROUND + 1);
        context.lineTo(WIDTH, GROUND + 1);
        context.stroke();

        context.fillStyle = "rgba(172, 210, 181, 0.2)";
        for (let x = 20; x < WIDTH; x += 74) {
            context.fillRect(x, GROUND + 9, 20, 1);
        }

        drawPlayer(PLAYER_X, playerY);
        obstacles.forEach(drawObstacle);
    }

    function drawPlayer(x, y) {
        context.fillStyle = "#70e59a";
        context.fillRect(x + 5, y + 9, 23, 24);
        context.fillRect(x + 17, y + 1, 15, 17);
        context.fillRect(x + 27, y + 8, 8, 5);
        context.fillRect(x, y + 18, 8, 5);
        context.fillStyle = "#0d1911";
        context.fillRect(x + 26, y + 5, 2, 2);
        context.fillStyle = "#70e59a";
        context.fillRect(x + 7, y + 31, 7, 8);
        context.fillRect(x + 21, y + 31, 7, 8);
    }

    function drawObstacle(obstacle) {
        context.fillStyle = "#8bcf78";
        context.fillRect(obstacle.x + 8, GROUND - obstacle.height, 13, obstacle.height);
        context.fillRect(obstacle.x, GROUND - obstacle.height + 13, 9, 7);
        context.fillRect(obstacle.x + 20, GROUND - obstacle.height + 23, 8, 7);
        context.fillStyle = "rgba(8, 25, 13, 0.38)";
        context.fillRect(obstacle.x + 11, GROUND - obstacle.height + 9, 3, 5);
    }

    function startGame() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        score = 0;
        scoreProgress = 0;
        speed = 285;
        playerY = GROUND - PLAYER_HEIGHT;
        playerVelocity = 0;
        obstacles = [];
        spawnDistance = 360;
        state = "running";
        previousFrame = 0;
        updateScore();
        startButton.querySelector("span").textContent = "Play again";
        restartButton.hidden = false;
        hideMessage();
        canvas.focus({ preventScroll: true });
        drawScene();
        animationFrame = requestAnimationFrame(tick);
    }

    function endGame() {
        state = "over";
        animationFrame = 0;
        saveBestScore();
        showMessage("GAME OVER", "Nice run. Give it another go?", "Press Space or choose Play again");
        startButton.querySelector("span").textContent = "Play again";
        drawScene();
    }

    function jump() {
        if (state !== "running") {
            startGame();
            return;
        }
        if (playerY >= GROUND - PLAYER_HEIGHT - 1) {
            playerVelocity = -470;
        }
    }

    function collides(obstacle) {
        const playerLeft = PLAYER_X + 5;
        const playerRight = PLAYER_X + PLAYER_WIDTH - 2;
        const playerTop = playerY + 4;
        const playerBottom = playerY + PLAYER_HEIGHT;
        const obstacleLeft = obstacle.x + 1;
        const obstacleRight = obstacle.x + 26;
        const obstacleTop = GROUND - obstacle.height;
        return playerRight > obstacleLeft
            && playerLeft < obstacleRight
            && playerBottom > obstacleTop + 3
            && playerTop < GROUND;
    }

    function tick(timestamp) {
        if (state !== "running") return;
        const delta = previousFrame ? Math.min((timestamp - previousFrame) / 1000, 0.04) : 0;
        previousFrame = timestamp;

        speed = Math.min(speed + delta * 11, 610);
        scoreProgress += delta * 10;
        score = Math.floor(scoreProgress);
        updateScore();

        playerVelocity += 1350 * delta;
        playerY = Math.min(playerY + playerVelocity * delta, GROUND - PLAYER_HEIGHT);
        if (playerY >= GROUND - PLAYER_HEIGHT) playerVelocity = 0;

        spawnDistance -= speed * delta;
        if (spawnDistance <= 0) {
            const height = 28 + Math.floor(Math.random() * 18);
            obstacles.push({ x: WIDTH + 12, height });
            spawnDistance = 310 + Math.random() * 220 + speed * 0.18;
        }

        obstacles.forEach((obstacle) => {
            obstacle.x -= speed * delta;
        });
        obstacles = obstacles.filter((obstacle) => obstacle.x > -35);
        drawScene();

        if (obstacles.some(collides)) {
            endGame();
            return;
        }
        animationFrame = requestAnimationFrame(tick);
    }

    function updateConnection() {
        const isOnline = navigator.onLine;
        pageShell.classList.toggle("is-online", isOnline);
        connectionLabel.textContent = isOnline ? "Connection restored" : "You're offline";
    }

    function returnToWebsite() {
        let destination = "/";
        try {
            const savedUrl = sessionStorage.getItem("offline-return-url");
            if (savedUrl) {
                const parsed = new URL(savedUrl, window.location.origin);
                if (parsed.origin === window.location.origin && parsed.pathname !== "/offline.html") {
                    destination = `${parsed.pathname}${parsed.search}${parsed.hash}`;
                }
            }
            sessionStorage.removeItem("offline-return-url");
        } catch (error) {
            console.error("Could not restore the page opened before offline mode.", error);
        }
        window.location.replace(destination);
    }

    startButton.addEventListener("click", startGame);
    restartButton.addEventListener("click", startGame);
    canvas.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        jump();
    });
    window.addEventListener("keydown", (event) => {
        if (event.target instanceof HTMLElement && event.target.matches("button, input, textarea, select, [contenteditable='true']")) {
            return;
        }
        if (event.code === "Space" || event.code === "ArrowUp") {
            event.preventDefault();
            jump();
        }
    });

    window.addEventListener("online", () => {
        updateConnection();
        if (shouldReturnOnOnline && navigator.onLine) returnToWebsite();
    });
    window.addEventListener("offline", updateConnection);
    updateConnection();
    drawScene();

    if (shouldReturnOnOnline && navigator.onLine) {
        returnToWebsite();
    }
})();
