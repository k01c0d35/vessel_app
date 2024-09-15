// Define stages in order
const stages = ['stage1', 'stage2', 'stage3'];
let currentStageIndex = -1; // Start with -1 to show start-journey first

function showStage(stageId) {
    // Hide all stages
    stages.forEach(stage => {
        const element = document.getElementById(stage);
        if (element) {
            element.style.display = 'none';
        }
    });

    // Show the requested stage
    const stageElement = document.getElementById(stageId);
    if (stageElement) {
        stageElement.style.display = 'flex';
    }
}

function updateButtons() {
    // Show Previous button if not on the first stage
    document.getElementById('prevButton').style.display = currentStageIndex > 0 ? 'inline' : 'none';
    
    // Show Next button if not on the last stage
    document.getElementById('nextButton').style.display = currentStageIndex < stages.length - 1 ? 'inline' : 'none';
}

function goToStage(stageIndex) {
    if (stageIndex >= 0 && stageIndex < stages.length) {
        currentStageIndex = stageIndex;
        showStage(stages[currentStageIndex]);
        updateButtons();
    }
}

document.querySelector('.start-button').onclick = () => goToStage(0);

document.getElementById('nextButton').onclick = () => {
    if (currentStageIndex < stages.length - 1) {
        goToStage(currentStageIndex + 1);
    }
    if (currentStageIndex === stages.length - 1) {
        window.location.href = '/pages/journeys.html'; // Navigate to selection page
    }
};

document.getElementById('prevButton').onclick = () => {
    if (currentStageIndex > 0) {
        goToStage(currentStageIndex - 1);
    }
};
