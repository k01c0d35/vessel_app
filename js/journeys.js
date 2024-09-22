document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop().split('.')[0];
  const jsonFilePath = `/data/${currentPage}.json`;

  fetch(jsonFilePath)
    .then(response => response.json())
    .then(data => {
      if (data && data.stages) {
        const stageId = new URLSearchParams(window.location.search).get('stage');
        const stageData = data.stages.find(stage => stage.id === stageId) || data.stages[0];
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
  const introBlurb = document.querySelector('.blurb');
  const stageContentImg = document.querySelector('.stageContent img');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');

  // Event listeners for navigation buttons
  prevButton.addEventListener('click', () => handleNavigation('prev'));
  nextButton.addEventListener('click', () => handleNavigation('next'));

  // Load stage content based on JSON
  function loadStage(stage) {
    introImg.src = stage.clay_gif;
    introTitle.textContent = stage.title;
    introBlurb.textContent = stage.blurb;
    stageContentImg.src = stage.image;

    updateNavigationButtons(stage);

    addDots(stage.content_blocks);
  }

  function updateNavigationButtons(stage) {
    const currentStageId = parseInt(stage.id, 10);
    prevButton.style.display = currentStageId > 1 ? 'inline' : 'none';
    nextButton.textContent = currentStageId < 3 ? 'Next' : 'Finish';
    nextButton.dataset.stageId = currentStageId;  // Set the current stage ID in a data attribute
  }

  // Handle navigation with button clicks
  function handleNavigation(direction) {
    const currentStageId = parseInt(nextButton.dataset.stageId, 10);
    let newStageId = direction === 'next' ? currentStageId + 1 : currentStageId - 1;
    if (newStageId >= 1 && newStageId <= 3) {
      window.location.href = `/pages/${currentPage}.html?stage=${newStageId}`;
    } else {
      window.location.href = "/pages/journeys.html";  // Redirect on Finish
    }
  }

  // Add dots dynamically based on the JSON data for content_blocks
  function addDots(contentBlocks) {
    const stageElement = document.getElementById('stage');

    contentBlocks.forEach(block => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.style.top = block.dotPosition.top;
      dot.style.left = block.dotPosition.left;

      // Create info box for each dot
      const infoBox = document.createElement('div');
      infoBox.classList.add('info-box');
      infoBox.innerHTML = `
      <h3>${block.title}</h3>
      <p>${block.text}</p>
      <button class="play-audio-button">Play Audio</button>
      <audio class="audio-element" src="${block.voiceover}"></audio>
    `;
      infoBox.style.opacity = '0';
      dot.appendChild(infoBox);

      // Toggle dot expansion on click
      dot.addEventListener('click', () => {
        dot.classList.toggle('expanded');
        infoBox.style.opacity = dot.classList.contains('expanded') ? '1' : '0';
      });

      // Add event listener for play audio button
      const playButton = infoBox.querySelector('.play-audio-button');
      const audioElement = infoBox.querySelector('.audio-element');

      let isPlaying = false;

      playButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent collapsing the info box when clicking the play button

        if (!isPlaying) {
          // Start playing the audio and change button text to "Stop Audio"
          audioElement.play();
          playButton.textContent = "Stop Audio";
          isPlaying = true;
        } else {
          // Stop the audio and revert the button text to "Play Audio"
          audioElement.pause();
          audioElement.currentTime = 0; // Reset the audio to the beginning
          playButton.textContent = "Play Audio";
          isPlaying = false;
        }

        // Update the button text when audio naturally ends
        audioElement.addEventListener('ended', () => {
          playButton.textContent = "Play Audio";
          isPlaying = false;
        });
      });

      // Add the dot to the stage
      stageElement.appendChild(dot);
    });
  }
});
