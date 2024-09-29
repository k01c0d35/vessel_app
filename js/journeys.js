document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const vessel = urlParams.get('vessel');
  const stageId = urlParams.get('stage');
  const jsonFilePath = `/data/${vessel}.json`;

  const introElement = document.querySelector('.intro');
  const introImg = introElement.querySelector('img');
  const introTitle = introElement.querySelector('h1');
  const stageContent = document.querySelector('.stageContent');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const restartButton = document.getElementById('restartButton');
  const topButtons = document.querySelector('.topButtons');
  const bottomButtons = document.querySelector('.bottomButtons');

  const storageKey = `${vessel}_stage_${stageId}_unlockedLabels`;
  let unlockedLabels = JSON.parse(localStorage.getItem(storageKey)) || [false, false, false];

  fetch(jsonFilePath)
    .then(response => response.json())
    .then(data => loadStage(data.stages.find(stage => stage.id === stageId) || data.stages[0]))
    .catch(error => console.error("Error fetching JSON data:", error));

  function loadStage(stage) {
    resetStage(stage);
    updateButtons(stage);
    addDots(stage.content_blocks);

    nextButton.dataset.stageId = stage.id;

    setTimeout(() => {
      introElement.classList.add('shrink-to-top');
      [stageContent, topButtons, bottomButtons].forEach(el => el.classList.add('fade-in'));
    }, 2000);
  }

  function resetStage(stage) {
    // Clear all previous labels
    removeAllLabels();

    // Initialize or retrieve unlock state from localStorage
    const currentStorageKey = `${vessel}_stage_${stage.id}_unlockedLabels`;
    unlockedLabels = JSON.parse(localStorage.getItem(currentStorageKey)) || [false, false, false];

    // Set the intro content and stage image
    introImg.src = stage.clay_gif;
    introTitle.textContent = stage.title;
    stageContent.querySelector('img').src = stage.image;

    // Ensure the first label is always visible
    unlockedLabels = [true, ...unlockedLabels.slice(1)];
    localStorage.setItem(currentStorageKey, JSON.stringify(unlockedLabels));

}

  function updateButtons(stage) {
    const stageNum = parseInt(stage.id, 10);
    prevButton.style.visibility = stageNum > 1 ? 'visible' : 'hidden';
    nextButton.textContent = stageNum >= 3 ? 'Finish' : 'Next';
    nextButton.style.pointerEvents = unlockedLabels.every(val => val) ? 'auto' : 'none';
  }

  function addDots(contentBlocks) {
    contentBlocks.forEach((block, index) => {
      const label = createLabel(block, index);
      document.querySelector('.stageContent').appendChild(label);
    });
  }

  function createLabel(block, index) {
    const label = document.createElement('div');
    label.classList.add('label');
    label.textContent = block.title;
    label.style = `position: absolute; top: ${block.dotPosition.top}; left: ${block.dotPosition.left}; visibility: ${unlockedLabels[index] ? 'visible' : 'hidden'}`;

    const infoBox = createInfoBox(block, label, index);
    label.appendChild(infoBox);

    label.addEventListener('click', () => handleLabelClick(label, infoBox, index));
    return label;
  }

  function createInfoBox(block, label, index) {
    const infoBox = document.createElement('div');
    infoBox.classList.add('info-box');
    infoBox.innerHTML = `
      <i class="fa-solid fa-xmark"></i>
      <p>${block.text}</p>
      <button class="play-audio-button">Play Audio</button>
      <audio class="audio-element" src="${block.voiceover}"></audio>`;
    infoBox.style.visibility = 'hidden';

    // Audio play/pause logic
    const playButton = infoBox.querySelector('.play-audio-button');
    const audioElement = infoBox.querySelector('.audio-element');

    // Play/Pause event listener
    playButton.addEventListener('click', (e) => {
      e.stopPropagation();

      if (audioElement.paused) {
        audioElement.play();
        playButton.textContent = "Stop Audio";
      } else {
        audioElement.pause();
        audioElement.currentTime = 0;
        playButton.textContent = "Play Audio";
      }
    });

    // Close info box logic
    infoBox.querySelector('.fa-xmark').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleInfoBox(label, infoBox, false);
    });

    return infoBox;
  }

  function handleLabelClick(label, infoBox, index) {
    if (index === 0 || unlockedLabels[index - 1]) {
      toggleInfoBox(label, infoBox, !label.classList.contains('expanded'));
      unlockLabel(index);
      enableNextButton();
    }
  }

  function toggleInfoBox(label, infoBox, expand) {
    label.classList.toggle('expanded', expand);
    infoBox.style.visibility = expand ? 'visible' : 'hidden';

    const audioElement = infoBox.querySelector('.audio-element');
    const playButton = infoBox.querySelector('.play-audio-button');

    if (!expand) {
      audioElement.pause();
      audioElement.currentTime = 0;
      playButton.textContent = "Play Audio";
    }
  }

  function unlockLabel(index) {
    unlockedLabels[index] = true;
    const currentStorageKey = `${vessel}_stage_${nextButton.dataset.stageId}_unlockedLabels`;
    localStorage.setItem(currentStorageKey, JSON.stringify(unlockedLabels));
    const nextLabel = document.querySelectorAll('.label')[index + 1];
    if (nextLabel) nextLabel.style.visibility = 'visible';
  }

  function enableNextButton() {
    if (unlockedLabels.every(val => val)) {
      nextButton.style.pointerEvents = 'auto';
      nextButton.classList.add('goldOnBlackButton');
    }
  }

  function removeAllLabels() {
    document.querySelectorAll('.label').forEach(label => label.remove());
  }

  prevButton.addEventListener('click', () => handleNavigation('prev'));
  nextButton.addEventListener('click', () => handleNavigation('next'));

  function handleNavigation(direction) {
    const currentStageId = parseInt(nextButton.dataset.stageId, 10);
    let newStageId = direction === 'next' ? currentStageId + 1 : currentStageId - 1;

    if (newStageId >= 1 && newStageId <= 3) {
      loadNewStage(newStageId);
    } else if (direction === 'next' && newStageId > 3) {
      window.location.href = "/pages/journeys.html";
    } else {
      console.error('Invalid stage ID or out of bounds.');
    }
  }

  function loadNewStage(newStageId) {
    fetch(jsonFilePath)
      .then(response => response.json())
      .then(data => {
        const stageData = data.stages.find(stage => stage.id === newStageId.toString());
        if (stageData) {
          nextButton.dataset.stageId = newStageId;

          const newStorageKey = `${vessel}_stage_${newStageId}_unlockedLabels`;
          if (!localStorage.getItem(newStorageKey)) {
            localStorage.setItem(newStorageKey, JSON.stringify([true, false, false]));
          }

          loadStage(stageData);

          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('stage', newStageId);
          history.pushState(null, '', newUrl);
        }
      })
      .catch(error => console.error("Error fetching stage data:", error));
  }

  restartButton.addEventListener('click', () => {
    // Clear all storage keys related to this vessel
    for (let i = 1; i <= 3; i++) {
      localStorage.removeItem(`${vessel}_stage_${i}_unlockedLabels`);
    }

    // Redirect to the first stage
    const firstStageUrl = new URL(window.location.href);
    firstStageUrl.searchParams.set('stage', '1'); // Set stage to 1
    window.location.href = firstStageUrl.toString(); // Redirect to first stage
  });
});
