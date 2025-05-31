// Door animation module

// Global variables
let upperDoor = null;
let lowerDoor = null;
let isUpperDoorOpen = false;
let isLowerDoorOpen = false;
const doorAnimationDuration = 1000; // 1 saniye
let currentUpperAnimation = null;
let currentLowerAnimation = null;

// Initialize door animation system
function initDoorAnimations(scene) {
    // Find the doors in the scene
    scene.traverse((object) => {
        // Find upper door
        if (object.name === 'FridgeUpperDoor') {
            console.log('Door animation system: Found upper door:', object);
            upperDoor = object;
            
            // Store original rotation for reference
            upperDoor.userData.originalRotation = upperDoor.rotation.clone();
            upperDoor.userData.isDoor = true;
        }
        
        // Find lower door
        if (object.name === 'FridgeLowerDoor') {
            console.log('Door animation system: Found lower door:', object);
            lowerDoor = object;
            
            // Store original rotation for reference
            lowerDoor.userData.originalRotation = lowerDoor.rotation.clone();
            lowerDoor.userData.isDoor = true;
        }
    });
    
    if (!upperDoor) {
        console.warn('Door animation system: Upper door not found in scene!');
    }
    
    if (!lowerDoor) {
        console.warn('Door animation system: Lower door not found in scene!');
    }
    
    if (upperDoor || lowerDoor) {
        console.log('Door animation system initialized successfully');
    }
}

// Toggle upper door open/close
function toggleUpperDoor() {
    if (!upperDoor) {
        console.warn('Door animation system: Upper door not found!');
        return;
    }
    
    // Cancel any ongoing animation
    if (currentUpperAnimation) {
        cancelAnimationFrame(currentUpperAnimation);
        currentUpperAnimation = null;
    }
    
    const startRotation = upperDoor.rotation.z;
    const targetRotation = isUpperDoorOpen ? 0 : Math.PI / 2; // 90 derece aç
    const startTime = Date.now();
    
    // Animate door
    function animateDoor() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / doorAnimationDuration, 1);
        
        // Ease in-out function for smoother animation
        const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : -1 + (4 - 2 * progress) * progress;
        
        // Update door rotation
        upperDoor.rotation.z = startRotation + (targetRotation - startRotation) * easeProgress;
        
        if (progress < 1) {
            currentUpperAnimation = requestAnimationFrame(animateDoor);
        } else {
            // Animation completed
            upperDoor.rotation.z = targetRotation;
            isUpperDoorOpen = !isUpperDoorOpen;
            currentUpperAnimation = null;
        }
    }
    
    // Start animation
    currentUpperAnimation = requestAnimationFrame(animateDoor);
}

// Toggle lower door open/close
function toggleLowerDoor() {
    if (!lowerDoor) {
        console.warn('Door animation system: Lower door not found!');
        return;
    }
    
    // Cancel any ongoing animation
    if (currentLowerAnimation) {
        cancelAnimationFrame(currentLowerAnimation);
        currentLowerAnimation = null;
    }
    
    const startRotation = lowerDoor.rotation.y;
    const targetRotation = isLowerDoorOpen ? 0 : Math.PI / 2; // 90 derece aç
    const startTime = Date.now();
    
    // Animate door
    function animateDoor() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / doorAnimationDuration, 1);
        
        // Ease in-out function for smoother animation
        const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : -1 + (4 - 2 * progress) * progress;
        
        // Update door rotation
        lowerDoor.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;
        
        if (progress < 1) {
            currentLowerAnimation = requestAnimationFrame(animateDoor);
        } else {
            // Animation completed
            lowerDoor.rotation.y = targetRotation;
            isLowerDoorOpen = !isLowerDoorOpen;
            currentLowerAnimation = null;
        }
    }
    
    // Start animation
    currentLowerAnimation = requestAnimationFrame(animateDoor);
}

// Add event listener for user interaction
function setupDoorControls() {
    // Keyboard controls
    document.addEventListener('keydown', function(event) {
        // 'O' key to toggle upper door
        if (event.key === 'o' || event.key === 'O') {
            toggleUpperDoor();
        }
        
        // 'L' key to toggle lower door
        if (event.key === 'l' || event.key === 'L') {
            toggleLowerDoor();
        }
    });
    
    // UI buttons for door toggles
    createDoorButton('Üst Kapıyı Aç/Kapat', toggleUpperDoor, '20px');
    createDoorButton('Alt Kapıyı Aç/Kapat', toggleLowerDoor, '70px');
}

// Helper function to create UI buttons
function createDoorButton(text, clickHandler, bottomPosition) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.position = 'absolute';
    button.style.bottom = bottomPosition;
    button.style.left = '20px';
    button.style.padding = '10px';
    button.style.zIndex = '1000';
    button.addEventListener('click', clickHandler);
    document.body.appendChild(button);
    return button;
}

// Export functions for use in main.js
window.DoorAnimations = {
    init: initDoorAnimations,
    setupControls: setupDoorControls,
    toggleUpperDoor: toggleUpperDoor,
    toggleLowerDoor: toggleLowerDoor
};