document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const vessel = urlParams.get('vessel');  // Default to manunggul if not specified
  const stageId = urlParams.get('stage');  // Default to stage 1

  const jsonFilePath = `/data/${vessel}.json`;  // Dynamically load based on vessel

  fetch(jsonFilePath)
    .then(response => response.json())
    .then(data => {
      if (data && data.stages) {
        const stageData = data.stages.find(stage => stage.id === parseInt(stageId, 10)) || data.stages[0];
        loadStage(stageData);
      }
    })
    .catch(error => {
      console.error("Error fetching JSON data:", error);
    });

  // Elements to interact with
  const introElement = document.querySelector('.intro');
  const introImg = document.querySelector('.intro img');
  const introTitle = document.querySelector('.intro h1');
  const stageContentImg = document.querySelector('.stageContent img');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');

  // Event listeners for navigation buttons
  prevButton.addEventListener('click', () => handleNavigation('prev'));
  nextButton.addEventListener('click', () => handleNavigation('next'));

  // Load stage content based on JSON
  function loadStage(stage) {
    // Clear any existing labels before loading the new stage
    removeLabels();

    introImg.src = stage.clay_gif;
    introTitle.textContent = stage.title;
    stageContentImg.src = stage.image;

    updateNavigationButtons(stage);

    // Add new labels for the current stage
    addDots(stage.content_blocks);
  }

  // Function to remove existing labels
  function removeLabels() {
    const stageElement = document.getElementById('stage');

    // Remove all elements with the label class
    const labels = stageElement.querySelectorAll('.label');
    labels.forEach(label => {
      label.remove();  // Remove each label from the DOM
    });
  }


  function updateNavigationButtons(stage) {
    const currentStageId = parseInt(stage.id, 10);
    prevButton.style.display = currentStageId > 1 ? 'inline' : 'none';
    nextButton.textContent = currentStageId < 3 ? 'Next' : 'Finish';
    nextButton.dataset.stageId = currentStageId;  // Set the current stage ID in a data attribute
  }

  function handleNavigation(direction) {
    const currentStageId = parseInt(nextButton.dataset.stageId, 10);
    let newStageId = direction === 'next' ? currentStageId + 1 : currentStageId - 1;
    if (newStageId >= 1 && newStageId <= 3) {
      loadNewStage(newStageId);
    } else {
      window.location.href = "/pages/journeys.html";  // Redirect on Finish
    }
  }

  function loadNewStage(newStageId) {
    const jsonFilePath = `/data/${vessel}.json`; // Fetch the updated vessel JSON

    fetch(jsonFilePath)
      .then(response => response.json())
      .then(data => {
        const stageData = data.stages.find(stage => stage.id === newStageId.toString());
        loadStage(stageData);  // Re-use the existing loadStage function
      })
      .catch(error => console.error("Error fetching stage data:", error));
  }

  // Add dots dynamically based on the JSON data for content_blocks
  function addDots(contentBlocks) {
    const stageElement = document.getElementById('stage');

    contentBlocks.forEach(block => {
      // Create a label instead of a dot
      const label = document.createElement('div');
      label.classList.add('label');
      label.textContent = block.title;
      label.style.position = 'absolute';
      label.style.top = block.dotPosition.top;
      label.style.left = block.dotPosition.left;

      // Create info box for each label
      const infoBox = document.createElement('div');
      infoBox.classList.add('info-box');
      infoBox.innerHTML = `
          <p>${block.text}</p>
          <button class="play-audio-button">Play Audio</button>
          <audio class="audio-element" src="${block.voiceover}"></audio>
        `;
      infoBox.style.opacity = '0';  // Start hidden
      label.appendChild(infoBox);

      // Toggle info box expansion on click
      label.addEventListener('click', () => {
        label.classList.toggle('expanded');
        infoBox.style.opacity = label.classList.contains('expanded') ? '1' : '0';
      });

      // Add event listener for play audio button
      const playButton = infoBox.querySelector('.play-audio-button');
      const audioElement = infoBox.querySelector('.audio-element');
      let isPlaying = false;

      playButton.addEventListener('click', (e) => {
        e.stopPropagation();  // Prevent label from collapsing when clicking the play button
        if (!isPlaying) {
          audioElement.play();
          playButton.textContent = "Stop Audio";
          isPlaying = true;
        } else {
          audioElement.pause();
          audioElement.currentTime = 0;  // Reset audio
          playButton.textContent = "Play Audio";
          isPlaying = false;
        }

        // Reset button when audio ends
        audioElement.addEventListener('ended', () => {
          playButton.textContent = "Play Audio";
          isPlaying = false;
        });
      });

      // Add the label to the stage
      stageElement.appendChild(label);
    });
  }

});
