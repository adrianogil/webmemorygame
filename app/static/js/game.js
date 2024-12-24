let images = [];
const gameBoard = document.getElementById('game-board');
const newGameButton = document.getElementById('new-game');
const imageUpload = document.getElementById('image-upload');
const quitButton = document.createElement('button');
quitButton.textContent = 'Quit';
quitButton.id = 'quit-game';
quitButton.style.display = 'none';
document.body.insertBefore(quitButton, gameBoard);

// Style the layout of the first screen
newGameButton.style.margin = '20px';
imageUpload.style.margin = '20px';
const buttonContainer = document.createElement('div');
buttonContainer.style.display = 'flex';
buttonContainer.style.flexDirection = 'column';
buttonContainer.style.alignItems = 'center';
buttonContainer.style.marginTop = '50px';

buttonContainer.appendChild(newGameButton);
buttonContainer.appendChild(imageUpload);
document.body.insertBefore(buttonContainer, gameBoard);

async function fetchImages() {
    const response = await fetch('/api/images');
    images = (await response.json()).map(filename => `/uploads/images/${filename}`);
}

function createCard(imageUrl) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.image = imageUrl;

    // Back face (Placeholder)
    const backFace = document.createElement('div');
    backFace.classList.add('back');

    // Front face (Actual Image)
    const frontFace = document.createElement('img');
    frontFace.src = imageUrl;
    frontFace.classList.add('front');

    card.appendChild(backFace);
    card.appendChild(frontFace);

    card.addEventListener('click', () => {
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        checkMatch(card);
    });

    return card;
}


function startGame() {
    gameBoard.innerHTML = '';
    const shuffledImages = [...images, ...images].sort(() => Math.random() - 0.5);
    const numColumns = Math.ceil(Math.sqrt(shuffledImages.length));
    gameBoard.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;

    shuffledImages.forEach(imageUrl => {
        const card = createCard(imageUrl);
        gameBoard.appendChild(card);
    });

    newGameButton.style.display = 'none';
    imageUpload.style.display = 'none';
    quitButton.style.display = 'block';
}

function checkMatch(card) {
    const flippedCards = document.querySelectorAll('.card.flipped:not(.matched)');
    if (flippedCards.length === 2) {
        const [first, second] = flippedCards;
        if (first.dataset.image === second.dataset.image) {
            first.classList.add('matched');
            second.classList.add('matched');
        } else {
            setTimeout(() => {
                first.classList.remove('flipped');
                second.classList.remove('flipped');
            }, 1000);
        }
    }
}

quitButton.addEventListener('click', () => {
    gameBoard.innerHTML = '';
    newGameButton.style.display = 'block';
    imageUpload.style.display = 'block';
    quitButton.style.display = 'none';
});

imageUpload.addEventListener('change', async (event) => {
    const formData = new FormData();
    for (const file of event.target.files) {
        formData.append('files', file);
    }
    await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });
    fetchImages();
});

newGameButton.addEventListener('click', () => {
    if (images.length < 2) {
        alert('Please upload at least two images to start a new game!');
        return;
    }
    startGame();
});

// Initial load of images from Flask API
fetchImages();
