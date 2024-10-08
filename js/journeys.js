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
  const topButtons = document.querySelector('.topButtons');
  const bottomButtons = document.querySelector('.bottomButtons');
  const audioToggleButton = document.getElementById('audioToggle');

  let currentlyOpenLabel = null;
  let globalAudioEnabled = true; // Audio enabled by default

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
      introElement.classList.remove('shrink-to-top');
      introElement.classList.add('shrink-to-top');
      [stageContent, topButtons, bottomButtons].forEach(el => el.classList.add('fade-in'));
    }, 1000);
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
    contentBlocks.forEach((block) => {
      const label = createLabel(block);
      labelContainer.appendChild(label);
    });
  }

  function createLabel(block) {
    const label = document.createElement('div');
    label.classList.add('label', 'white-container');

    const titleElement = document.createElement('h2');
    titleElement.textContent = block.title;
    label.appendChild(titleElement);

    const infoBox = createInfoBox(block);
    label.appendChild(infoBox);

    label.addEventListener('click', () => {
      if (currentlyOpenLabel && currentlyOpenLabel !== label) {
        toggleInfoBox(currentlyOpenLabel, currentlyOpenLabel.querySelector('.info-box'), false);
      }

      toggleInfoBox(label, infoBox, !label.classList.contains('expanded'));
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
      <i class="fa-solid fa-volume-high play-audio-button"></i>
      <audio class="audio-element" src="${block.voiceover}"></audio>`;
    infoBox.style.visibility = 'hidden';

    const playButton = infoBox.querySelector('.play-audio-button');
    const audioElement = infoBox.querySelector('.audio-element');

    // Set the icon to 'play' by default (since audio is enabled globally)
    playButton.classList.add('fa-volume-high');
    
    playButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (audioElement.paused) {
        audioElement.play();
        playButton.classList.remove('fa-volume-high');
        playButton.classList.add('fa-volume-xmark');
      } else {
        audioElement.pause();
        playButton.classList.remove('fa-volume-xmark');
        playButton.classList.add('fa-volume-high');
      }
    });

    return infoBox;
  }

  function toggleInfoBox(label, infoBox, expand) {
    if (label) {
      label.classList.toggle('expanded', expand);
    }
    infoBox.style.visibility = expand ? 'visible' : 'hidden';

    const audioElement = infoBox.querySelector('.audio-element');
    const playButton = infoBox.querySelector('.play-audio-button');

    if (expand) {
      if (globalAudioEnabled) {
        audioElement.play();
        playButton.classList.remove('fa-volume-high');
        playButton.classList.add('fa-volume-xmark');
      }
    } else {
      audioElement.pause();
      audioElement.currentTime = 0;
      playButton.classList.remove('fa-volume-xmark');
      playButton.classList.add('fa-volume-high'); // Reset to 'play' icon when paused
    }
  }

  function removeAllLabels() {
    document.querySelectorAll('.label').forEach(label => label.remove());
  }

  prevButton.addEventListener('click', () => handleNavigation('prev'));
  nextButton.addEventListener('click', () => handleNavigation('next'));

  audioToggleButton.addEventListener('click', () => {
    globalAudioEnabled = !globalAudioEnabled;
    audioToggleButton.textContent = globalAudioEnabled ? 'Audio: On' : 'Audio: Off';

    // Stop all currently playing audio if turning off
    document.querySelectorAll('.audio-element').forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Update all audio icons
    document.querySelectorAll('.play-audio-button').forEach(button => {
      button.classList.remove(globalAudioEnabled ? 'fa-volume-xmark' : 'fa-volume-high');
      button.classList.add(globalAudioEnabled ? 'fa-volume-high' : 'fa-volume-xmark');
    });
  });

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
