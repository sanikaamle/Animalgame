// Define animal images
const animalImages = [
    'images/bottle.png',
    'images/cherry.png',
    'images/food.png',
    'images/frog.png',
    'images/mushroom.png',
    'images/panda.png',
    'images/turtle.png',
];

// Preload images to prevent flickering
const preloadImages = () => {
    animalImages.forEach(imgSrc => {
        const img = new Image();
        img.src = imgSrc;
    });
};

preloadImages();

let score = 0;
let lives = 3;
let gameRunning = true;
let animalSpeed = 5; //speed of falling animals.
let spawnRate = 1000; // Reduced from 2000ms to 1000ms
let isPaused = false;
const activeAnimals = [];

const bucket = document.getElementById('bucket');
const scoreElement = document.getElementById('score');
const heartsContainer = document.getElementById('hearts');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const pauseButton = document.getElementById('pauseButton');

function handleCatch(animal) {
    score += 10;
    updateScore();
    animal.remove();
    const index = activeAnimals.indexOf(animal);
    if (index !== -1) activeAnimals.splice(index, 1);
}

function handleMiss(animal) {
    lives--;
    updateLives();
    animal.remove();
    const index = activeAnimals.indexOf(animal);
    if (index !== -1) activeAnimals.splice(index, 1);

    if (lives <= 0) {
        endGame();
    }
}

function isCaught(animalRect, bucketRect) {
    return animalRect.bottom >= bucketRect.top &&
           animalRect.top <= bucketRect.bottom &&
           animalRect.right >= bucketRect.left &&
           animalRect.left <= bucketRect.right;
}

function updateScore() {
    scoreElement.textContent = score;
    if (score % 100 === 0) {
        spawnRate = Math.max(800, spawnRate - 200);
        animalSpeed += 0.5;
    }
}

function updateLives() {
    const hearts = heartsContainer.children;
    for (let i = 0; i < hearts.length; i++) {
        hearts[i].style.opacity = i < lives ? '1' : '0.3';
    }
}
//hi
function endGame() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    score = 0;
    lives = 3;
    gameRunning = true;
    spawnRate = 2000;
    animalSpeed = 2;

    document.querySelectorAll('.animal').forEach(animal => animal.remove());
    activeAnimals.length = 0;

    updateScore();
    updateLives();
    gameOverScreen.style.display = 'none';
    bucket.style.left = '50%';
    bucket.style.transform = 'translateX(-50%)';

    startGame();
}

function createAnimal() {
    if (!gameRunning || isPaused) return;

    const animal = document.createElement('div');
    animal.className = 'animal';

    const img = document.createElement('img');
    img.src = animalImages[Math.floor(Math.random() * animalImages.length)];
    img.alt = 'Animal';
    animal.appendChild(img);

    animal.style.position = 'absolute';
    animal.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    animal.style.top = '-50px';

    document.body.appendChild(animal);
    activeAnimals.push(animal);

    function fall() {
        if (!document.body.contains(animal)) return;

        if (gameRunning && !isPaused) {
            const top = parseFloat(animal.style.top);
            animal.style.top = (top + animalSpeed) + 'px';

            const bucketRect = bucket.getBoundingClientRect();
            const animalRect = animal.getBoundingClientRect();

            if (top > window.innerHeight) {
                handleMiss(animal);
                return;
            } else if (isCaught(animalRect, bucketRect)) {
                handleCatch(animal);
                return;
            }
        }
        requestAnimationFrame(fall);
    }

    requestAnimationFrame(fall);
}

function startGame() {
    if (!gameRunning) return;
    if (!isPaused) createAnimal();
    setTimeout(startGame, spawnRate);
}

document.addEventListener('DOMContentLoaded', () => {
    updateLives();
    startGame();

    document.addEventListener('mousemove', (e) => {
        if (!gameRunning || isPaused) return;

        const bucketWidth = bucket.offsetWidth;
        const maxX = window.innerWidth - bucketWidth;
        let newX = e.clientX - bucketWidth / 2;

        newX = Math.max(0, Math.min(newX, maxX));
        bucket.style.left = newX + 'px';
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && gameRunning) {
            e.preventDefault();
            togglePause();
        }
    });

    pauseButton.addEventListener('click', togglePause);

    function togglePause() {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
        document.body.style.filter = isPaused ? 'grayscale(50%)' : '';
    }
});
