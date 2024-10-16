document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const vessel = urlParams.get('vessel');
    const jsonFilePath = `/data/${vessel}.json`;

    const stageTitle = document.querySelector('.stageTitle');
    const stageImage = document.querySelector('.stageLeft img');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const infoContainer = document.querySelector('.infoContainer');
    const playPauseButton = document.getElementById('playPauseAudioButton');
    const stopButton = document.getElementById('stopAudioButton');

    let currentStageIndex = 0;
    let stages = [];
    let audioElements = [];
    let currentAudioIndex = 0;
    let isPaused = true;
    let contentBlocks = [];

    fetch(jsonFilePath)
        .then(response => response.json())
        .then(data => {
            stages = data.stages;
            const artefactId = data.artefactId[0];
            const viewArtefactButton = document.getElementById('artefactGalleryButton');
            viewArtefactButton.href = `/pages/artefact.html?id=${artefactId}`;
            loadStage(stages[currentStageIndex]);
        })
        .catch(error => console.error("Error fetching JSON data:", error));

    playPauseButton.addEventListener('click', () => {
        if (audioElements.length === 0 || !audioElements[currentAudioIndex]) {
            playSequentialAudio();
        } else if (audioElements[currentAudioIndex].paused) {
            resumeAudio();
        } else {
            pauseAudio();
        }
    });

    stopButton.addEventListener('click', () => {
        stopAudio();
    });

    function playSequentialAudio() {
        const stage = stages[currentStageIndex];

        if (!stage.voiceovers || stage.voiceovers.length === 0) {
            console.error("No voiceovers found for the current stage.");
            return;
        }

        const audioFiles = stage.voiceovers;
        const delayBetweenAudios = 1000;

        audioElements = audioFiles.map(src => {
            const audio = new Audio(src);
            audio.volume = 0.5;
            return audio;
        });

        currentAudioIndex = 0;
        playAudio(currentAudioIndex);

        audioElements.forEach((audio, index) => {
            audio.addEventListener('ended', () => {
                if (index < audioFiles.length - 1) {
                    setTimeout(() => {
                        currentAudioIndex++;
                        playAudio(currentAudioIndex);
                    }, delayBetweenAudios);
                } else {
                    stopAudio();
                }
            });
        });

        playPauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
        isPaused = false;
    }


    function playAudio(index) {
        resetHighlighting();
        if (contentBlocks[index]) {
            contentBlocks[index].classList.add('accent-background');
        }

        if (!audioElements[index]) {
            console.error("Audio element not found for index:", index);
            return;
        }

        audioElements[index].play().catch(error => console.error("Error playing audio:", error));
    }


    function resumeAudio() {
        if (audioElements[currentAudioIndex]) {
            audioElements[currentAudioIndex].play();
            playPauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
            isPaused = false;
        }
    }

    function pauseAudio() {
        if (audioElements[currentAudioIndex]) {
            audioElements[currentAudioIndex].pause();
            playPauseButton.innerHTML = '<i class="fa-solid fa-play"></i>';
            isPaused = true;
        }
    }

    function stopAudio() {
        audioElements.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        resetHighlighting();
        currentAudioIndex = -1; // Reset to ensure correct restart
        isPaused = false;
        playPauseButton.innerHTML = '<i class="fa-solid fa-play"></i>';
    }


    function resetHighlighting() {
        contentBlocks.forEach(block => block.classList.remove('accent-background'));
    }

    function updateProgress() {
        const steps = document.querySelectorAll('.progress-step');

        steps.forEach((step, index) => {
            if (index === currentStageIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }

            step.addEventListener('click', () => {
                if (index !== currentStageIndex) {
                    stopAudio();
                    currentStageIndex = index;
                    loadStage(stages[currentStageIndex]);
                }
            });
        });
    }

    function loadStage(stage) {
        resetStage();
        stageTitle.textContent = stage.title;
        stageImage.src = stage.image;
        updateInfoSections(stage.content_blocks);
        updateProgress();

        contentBlocks = document.querySelectorAll('.infoSection');

        prevButton.style.visibility = currentStageIndex === 0 ? 'hidden' : 'visible';
        nextButton.textContent = currentStageIndex === stages.length - 1 ? 'Finish' : 'Next';
    }

    function resetStage() {
        stageTitle.textContent = '';
        stageImage.src = '';
        infoContainer.innerHTML = '';
    }

    function updateInfoSections(contentBlocks) {
        contentBlocks.forEach((block) => {
            const infoSection = document.createElement('div');
            infoSection.classList.add('infoSection', 'white-container');

            const titleElement = document.createElement('h2');
            titleElement.classList.add('infoTitle');
            titleElement.textContent = block.title;

            const textElement = document.createElement('p');
            textElement.classList.add('infoText');
            textElement.textContent = block.text;

            infoSection.appendChild(titleElement);
            infoSection.appendChild(textElement);

            infoContainer.appendChild(infoSection);
        });
    }

    prevButton.addEventListener('click', () => handleNavigation('prev'));
    nextButton.addEventListener('click', () => handleNavigation('next'));

    function handleNavigation(direction) {
        stopAudio();

        if (direction === 'next') {
            currentStageIndex++;
            if (currentStageIndex >= stages.length) {
                window.location.href = "/pages/journeys.html";
            } else {
                loadStage(stages[currentStageIndex]);
            }
        } else if (direction === 'prev') {
            currentStageIndex--;
            loadStage(stages[currentStageIndex]);
        }
    }
});