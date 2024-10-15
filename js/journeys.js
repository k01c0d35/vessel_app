document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const vessel = urlParams.get('vessel');
  const jsonFilePath = `/data/${vessel}.json`;

  const stageTitle = document.querySelector('.stageTitle');
  const stageImage = document.querySelector('.stageLeft img');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const infoContainer = document.querySelector('.infoContainer');

  let currentStageIndex = 0;
  let stages = [];

  // Fetch the JSON data for the specific vessel
  fetch(jsonFilePath)
      .then(response => response.json())
      .then(data => {
          stages = data.stages;
          loadStage(stages[currentStageIndex]);
      })
      .catch(error => console.error("Error fetching JSON data:", error));

  function loadStage(stage) {
      resetStage();
      stageTitle.textContent = stage.title;
      stageImage.src = stage.image;
      updateInfoSections(stage.content_blocks);

      // Update button visibility and text based on the current stage
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

          const audioButton = createAudioButton(block.voiceover);

          infoSection.appendChild(titleElement);
          infoSection.appendChild(audioButton);
          infoSection.appendChild(textElement);

          infoContainer.appendChild(infoSection);
      });
  }

  function createAudioButton(voiceoverSrc) {
    const audioButtonDiv = document.createElement('div');
    audioButtonDiv.classList.add('audioButton');

    const audioButton = document.createElement('i');
    audioButton.classList.add('fa-solid', 'fa-volume-high', 'play-audio-button');

    const audioElement = document.createElement('audio');
    audioElement.classList.add('audio-element');
    audioElement.src = voiceoverSrc;
    audioElement.volume = 0.5;
    audioElement.muted = false; // Unmute, but only plays on user click

    // Handle the audio button click event
    audioButton.addEventListener('click', () => {
        pauseAllAudio(); // Pause any other playing audios
        toggleAudio(audioButton, audioElement); // Toggle this audio
    });

    audioButtonDiv.appendChild(audioButton);
    audioButtonDiv.appendChild(audioElement);

    return audioButtonDiv;
}


function toggleAudio(button, audio) {
  if (audio.paused) {
      audio.play().then(() => {
          button.classList.replace('fa-volume-high', 'fa-volume-xmark');
      }).catch(error => {
          console.error("Audio play failed:", error);
      });
  } else {
      audio.pause();
      button.classList.replace('fa-volume-xmark', 'fa-volume-high');
  }
}


  function pauseAllAudio() {
    const allAudioElements = document.querySelectorAll('.audio-element');
    allAudioElements.forEach(audio => {
        if (!audio.paused) {
            audio.pause();
            const relatedButton = audio.previousSibling;
            if (relatedButton.classList.contains('fa-volume-xmark')) {
                relatedButton.classList.replace('fa-volume-xmark', 'fa-volume-high');
            }
        }
    });
}


  prevButton.addEventListener('click', () => handleNavigation('prev'));
  nextButton.addEventListener('click', () => handleNavigation('next'));

  function handleNavigation(direction) {
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
