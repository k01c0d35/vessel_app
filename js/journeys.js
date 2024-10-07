document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const vessel = urlParams.get('vessel');
  const stageId = urlParams.get('stage');
  const jsonFilePath = `/data/${vessel}.json`;

  const introElement = document.querySelector('.intro');
  const introTitle = introElement.querySelector('h1');
  const stageContent = document.querySelector('.stageContent');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const restartButton = document.getElementById('restartButton');
  const topButtons = document.querySelector('.topButtons');
  const bottomButtons = document.querySelector('.bottomButtons');

  let currentlyOpenLabel = null; // Track the currently open label

  fetch(jsonFilePath)
    .then(response => response.json())
    .then(data => loadStage(data.stages.find(stage => stage.id === stageId) || data.stages[0]))
    .catch(error => console.error("Error fetching JSON data:", error));

  function loadStage(stage) {
    resetStage(stage);
    updateButtons(stage);
    addDots(stage.content_blocks);

    nextButton.dataset.stageId = stage.id;

    // Run the intro transition for each stage
    setTimeout(() => {
      introElement.classList.remove('shrink-to-top'); // Reset the class before applying it again
      introElement.classList.add('shrink-to-top');
      [stageContent, topButtons, bottomButtons].forEach(el => el.classList.add('fade-in'));
    }, 2000);
  }

  function resetStage(stage) {
    removeAllLabels();
    introTitle.textContent = stage.title;
    stageContent.querySelector('img').src = stage.image;
  }

  function updateButtons(stage) {
    const stageNum = parseInt(stage.id, 10);
    prevButton.style.visibility = 'visible';
    prevButton.textContent = "Previous";
    nextButton.textContent = stageNum >= 3 ? 'Finish' : 'Next';
  }

  function addDots(contentBlocks) {
    const labelContainer = document.querySelector('.labelContainer');
    contentBlocks.forEach((block, index) => {
      const label = createLabel(block);
      labelContainer.appendChild(label);
    });
  }

  function createLabel(block) {
    const label = document.createElement('div');
    label.classList.add('label');

    // Add h2 element for label title
    const titleElement = document.createElement('h2');
    titleElement.textContent = block.title;
    label.appendChild(titleElement);

    const infoBox = createInfoBox(block);
    label.appendChild(infoBox);

    label.addEventListener('click', () => {
      // Close the currently open label (if any)
      if (currentlyOpenLabel && currentlyOpenLabel !== label) {
        toggleInfoBox(currentlyOpenLabel, currentlyOpenLabel.querySelector('.info-box'), false);
      }

      // Open the clicked label's info box
      toggleInfoBox(label, infoBox, !label.classList.contains('expanded'));

      // Track the currently open label
      currentlyOpenLabel = label.classList.contains('expanded') ? label : null;
    });

    return label;
  }

  function createInfoBox(block) {
    const infoBox = document.createElement('div');
    infoBox.classList.add('info-box');
    infoBox.innerHTML = `
      <i class="fa-solid fa-xmark"></i>
      <p>${block.text}</p>
      <button class="play-audio-button">Play Audio</button>
      <audio class="audio-element" src="${block.voiceover}"></audio>`;
    infoBox.style.visibility = 'hidden';

    const playButton = infoBox.querySelector('.play-audio-button');
    const audioElement = infoBox.querySelector('.audio-element');

    playButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (audioElement.paused) {
        audioElement.play();
        playButton.textContent = "Stop Audio";
      } else {
        audioElement.pause();
        playButton.textContent = "Play Audio";
      }
    });

    // Close button to collapse the label and hide info box
    infoBox.querySelector('.fa-xmark').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleInfoBox(infoBox.closest('.label'), infoBox, false); // Collapse the label and hide info box
      currentlyOpenLabel = null; // Reset the currently open label
    });

    return infoBox;
  }

  function toggleInfoBox(label, infoBox, expand) {
    if (label) {
      label.classList.toggle('expanded', expand);
    }
    infoBox.style.visibility = expand ? 'visible' : 'hidden';

    if (!expand) {
      const audioElement = infoBox.querySelector('.audio-element');
      audioElement.pause();
      audioElement.currentTime = 0;
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
          loadStage(stageData);

          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('stage', newStageId);
          history.pushState(null, '', newUrl);
        }
      })
      .catch(error => console.error("Error fetching stage data:", error));
  }
});