// Global variables
let scene, camera, renderer, controls;
let clock = new THREE.Clock();
let backPanelLight; // Back panel point light reference
let modelLoader;// Model loader instance - WILL BE REPLACED WITH OPTIMIZED VERSION
let optimizedLoader; // NEW: Optimized model loader with caching
let loadingScreen; // NEW: Loading screen manager
let memoryManager; // NEW: Memory management system
let cameraControls; // WASD camera controls
let objectDragControls; // Object dragging system
let foodObjectManager; // Food object manager
let coronaExtraObject; // Corona Extra modulelet coronaBottleObject; // Corona Bottle module
let eggCartonObject; // Egg Carton module
let openEggCartonObject; // Open Egg Carton module
let cheeseObject; // Cheese module
let pickledCucumbersObject; // Pickled Cucumbers module
let eggObject; // Egg module
let eggObjects = []; // Array to hold multiple egg instances
let bananaCrateObject; // Banana Crate module
let aaBatteriesObject; // AA Batteries module

// Initialize the scene
// Variable to control visualization of light helpers
const SHOW_LIGHT_HELPERS = false;  // Set to true to see light positions

function init() {    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0, 0, 0); // Lighter grey background for better contrast    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Position camera INSIDE the fridge.glb (fridge is at x:46, y:15, z:0.5 with scale 14x12.4x13)
    camera.position.set(46, 15, 0); // Exactly inside the fridge center
    camera.lookAt(40, 15, 0); // Look towards the front of the fridge interior// Create renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('webglCanvas'),
        antialias: true,
        logarithmicDepthBuffer: true  // Better depth precision for complex objects
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Enable and configure shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    
    // Better color representation
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Improved lighting settings
    renderer.physicallyCorrectLights = true;
    
    // Enhanced tone mapping for better dynamic range
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;  // Brighter overall exposure
    
    // Enable gamma correction for better color accuracy
    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;    // Add orbit controls (allows camera rotation with mouse) - DISABLED for FPS camera
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = false; // Disable OrbitControls for FPS camera    // Initialize OPTIMIZED model loader with caching
    optimizedLoader = new window.OptimizedModelLoader(scene);
    modelLoader = optimizedLoader; // Keep compatibility
    
    // Initialize memory manager
    memoryManager = new window.MemoryManager();
    memoryManager.register(renderer, 'WebGL Renderer');
    memoryManager.register(optimizedLoader, 'Optimized Model Loader');
    memoryManager.startMonitoring();
    
    // Initialize loading screen
    loadingScreen = new window.LoadingScreen();
    loadingScreen.show();
    loadingScreen.updateProgress(5, 'Initializing systems...');

    // Initialize food object manager
    foodObjectManager = new window.FoodObjectManager(scene, optimizedLoader);      

    loadingScreen.updateProgress(10, 'Creating object managers...');

    // Initialize Corona Extra object
    coronaExtraObject = new window.CoronaExtraObject(foodObjectManager, optimizedLoader);
    
    // Initialize Corona Bottle object
    coronaBottleObject = new window.CoronaBottleObject(foodObjectManager, optimizedLoader);    

    // Initialize Egg Carton object
    eggCartonObject = new window.EggCartonObject(foodObjectManager, optimizedLoader);
      // Initialize Open Egg Carton object
    openEggCartonObject = new window.OpenEggCartonObject(foodObjectManager, optimizedLoader);          // Initialize Cheese object
    cheeseObject = new window.CheeseObject(foodObjectManager, optimizedLoader);    // Initialize Pickled Cucumbers object
    pickledCucumbersObject = new window.PickledCucumbersObject(foodObjectManager, optimizedLoader);    // Initialize Banana Crate object
    bananaCrateObject = new window.BananaCrateObject(foodObjectManager, optimizedLoader);
    
    // Initialize AA Batteries object
    aaBatteriesObject = new window.AABatteriesObject(foodObjectManager, optimizedLoader);

    loadingScreen.updateProgress(15, 'Creating egg instances...');

    // Initialize Egg objects - create 5 instances efficiently
    for (let i = 1; i <= 5; i++) {
        const eggObject = new window.EggObject(foodObjectManager, optimizedLoader, i);
        eggObjects.push(eggObject);
    }
    
    // Initialize WASD camera controls
    cameraControls = new window.CameraControls(camera, {
        moveSpeed: 0.1,           // Camera movement speed
        rotationSpeed: 0.002,     // Mouse sensitivity
        enableVerticalMovement: true,  // Allow Q/E for up/down movement
        enableMouseLook: true,    // Enable FPS-style mouse look
        dampingFactor: 0.8        // Smooth movement damping
    });
    
    // Diğer modüllerin yüklenmesi için zaman tanı
    setupDependencies();
    
    // Add lights
    setupLights();
    
    // Load models
    loadModels();
    
    // Setup UI controls for lights
    setupLightControls();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

// Setup UI controls for lights
function setupLightControls() {
    // Create a UI container for the light controls
    const lightControlsContainer = document.createElement('div');
    lightControlsContainer.style.position = 'absolute';
    lightControlsContainer.style.top = '10px';
    lightControlsContainer.style.right = '10px';
    lightControlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    lightControlsContainer.style.padding = '15px';
    lightControlsContainer.style.borderRadius = '8px';
    lightControlsContainer.style.color = 'white';
    lightControlsContainer.style.fontFamily = 'Arial, sans-serif';
    lightControlsContainer.style.zIndex = '1000';
    lightControlsContainer.style.width = '300px';
    document.body.appendChild(lightControlsContainer);
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Arka Panel Işık Kontrolleri';
    title.style.margin = '0 0 15px 0';
    title.style.fontSize = '16px';
    title.style.textAlign = 'center';
    title.style.paddingBottom = '8px';
    lightControlsContainer.appendChild(title);

    // Create light control - ON/OFF Toggle
    const lightContainer = document.createElement('div');
    lightContainer.style.marginBottom = '15px';
    lightContainer.style.display = 'flex';
    lightContainer.style.alignItems = 'center';
    lightContainer.style.justifyContent = 'space-between';
    lightControlsContainer.appendChild(lightContainer);

    // Create checkbox
    const lightCheckbox = document.createElement('input');
    lightCheckbox.type = 'checkbox';
    lightCheckbox.id = 'lightToggle';
    lightCheckbox.checked = true; // Light starts on
    lightCheckbox.style.marginRight = '10px';
    lightCheckbox.style.cursor = 'pointer';
    lightCheckbox.style.width = '20px';
    lightCheckbox.style.height = '20px';
    lightContainer.appendChild(lightCheckbox);

    // Create label
    const lightLabel = document.createElement('label');
    lightLabel.htmlFor = 'lightToggle';
    lightLabel.textContent = 'Işığı Aç/Kapat';
    lightLabel.style.cursor = 'pointer';
    lightLabel.style.flexGrow = '1';
    lightContainer.appendChild(lightLabel);
    
    // Status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'lightStatus';
    statusIndicator.textContent = 'AÇIK';
    statusIndicator.style.backgroundColor = '#4CAF50';
    statusIndicator.style.color = 'white';
    statusIndicator.style.padding = '3px 8px';
    statusIndicator.style.borderRadius = '4px';
    statusIndicator.style.fontSize = '12px';
    statusIndicator.style.fontWeight = 'bold';
    lightContainer.appendChild(statusIndicator);

    // Add event listener for toggle
    lightCheckbox.addEventListener('change', function() {
        if (backPanelLight) {
            backPanelLight.visible = this.checked;
            
            // Update status indicator
            const statusEl = document.getElementById('lightStatus');
            if (this.checked) {
                statusEl.textContent = 'AÇIK';
                statusEl.style.backgroundColor = '#4CAF50';
            } else {
                statusEl.textContent = 'KAPALI';
                statusEl.style.backgroundColor = '#F44336';
            }
        }
    });
    
    // Create brightness control
    const brightnessContainer = document.createElement('div');
    brightnessContainer.style.marginBottom = '15px';
    lightControlsContainer.appendChild(brightnessContainer);
    
    const brightnessLabel = document.createElement('div');
    brightnessLabel.style.display = 'flex';
    brightnessLabel.style.justifyContent = 'space-between';
    brightnessLabel.style.marginBottom = '5px';
    brightnessContainer.appendChild(brightnessLabel);
    
    const brightnessTitleSpan = document.createElement('span');
    brightnessTitleSpan.textContent = 'Parlaklık:';
    brightnessLabel.appendChild(brightnessTitleSpan);
    
    const brightnessValueSpan = document.createElement('span');
    brightnessValueSpan.id = 'brightnessValue';
    brightnessValueSpan.textContent = '2.5';
    brightnessLabel.appendChild(brightnessValueSpan);
    
    const brightnessSlider = document.createElement('input');
    brightnessSlider.type = 'range';
    brightnessSlider.id = 'lightBrightness';
    brightnessSlider.min = '0.1';
    brightnessSlider.max = '5.0';
    brightnessSlider.step = '0.1';
    brightnessSlider.value = '2.5';
    brightnessSlider.style.width = '100%';
    brightnessContainer.appendChild(brightnessSlider);
    
    // Y position control
    const yPositionContainer = document.createElement('div');
    yPositionContainer.style.marginBottom = '15px';
    lightControlsContainer.appendChild(yPositionContainer);
    
    const yPositionLabel = document.createElement('div');
    yPositionLabel.style.display = 'flex';
    yPositionLabel.style.justifyContent = 'space-between';
    yPositionLabel.style.marginBottom = '5px';
    yPositionContainer.appendChild(yPositionLabel);
    
    const yPositionTitleSpan = document.createElement('span');
    yPositionTitleSpan.textContent = 'Y Pozisyonu:';
    yPositionLabel.appendChild(yPositionTitleSpan);
    
    const yPositionValueSpan = document.createElement('span');
    yPositionValueSpan.id = 'yPositionValue';
    yPositionValueSpan.textContent = '15';
    yPositionLabel.appendChild(yPositionValueSpan);
    
    const yPositionSlider = document.createElement('input');
    yPositionSlider.type = 'range';
    yPositionSlider.id = 'lightPositionY';
    yPositionSlider.min = '12';
    yPositionSlider.max = '18';
    yPositionSlider.step = '0.1';
    yPositionSlider.value = '15';
    yPositionSlider.style.width = '100%';
    yPositionContainer.appendChild(yPositionSlider);
    
    // Reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Varsayılan Ayarlara Döndür';
    resetButton.style.width = '100%';
    resetButton.style.padding = '8px';
    resetButton.style.backgroundColor = '#607D8B';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '4px';
    resetButton.style.color = 'white';
    resetButton.style.cursor = 'pointer';
    lightControlsContainer.appendChild(resetButton);
    
    // Event listeners for controls
    
    // Brightness control
    brightnessSlider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (backPanelLight) {
            // Base intensity for the light
            backPanelLight.intensity = value;
            brightnessValueSpan.textContent = value.toFixed(1);
        }
    });
    
    // Y position control
    yPositionSlider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (backPanelLight) {
            // Update light position
            backPanelLight.position.y = value;
            yPositionValueSpan.textContent = value.toFixed(1);
            
            // Update visual light bulb position
            const lightBulb = scene.children.find(child => 
                child.type === 'Mesh' && 
                child.material && 
                child.material.color && 
                child.material.color.getHexString() === 'ffffcc');
            
            if (lightBulb) {
                lightBulb.position.y = value;
            }
        }
    });
    
    // Reset button
    resetButton.addEventListener('click', function() {
        if (backPanelLight) {
            // Reset light to default values
            backPanelLight.position.y = 15;
            backPanelLight.intensity = 2.5;
            backPanelLight.visible = true;
            
            // Reset visual light bulb position
            const lightBulb = scene.children.find(child => 
                child.type === 'Mesh' && 
                child.material && 
                child.material.color && 
                child.material.color.getHexString() === 'ffffcc');
            
            if (lightBulb) {
                lightBulb.position.y = 15;
            }
            
            // Reset UI controls
            brightnessSlider.value = 2.5;
            brightnessValueSpan.textContent = '2.5';
            yPositionSlider.value = 15;
            yPositionValueSpan.textContent = '15';
            lightCheckbox.checked = true;
            
            // Update status indicator
            const statusEl = document.getElementById('lightStatus');
            statusEl.textContent = 'AÇIK';
            statusEl.style.backgroundColor = '#4CAF50';
        }
    });    console.log('Light controls setup completed with back panel light toggle');
}

// Load all models
async function loadModels() {
    try {
        // Load fridge model
        await loadFridgeModel();
        
        // Load kitchen and fridge model
        await loadKitchenAndFridgeModel();
        
        // Load food objects
        await loadFoodObjects();
        
        console.log('All models loaded successfully!');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

// Load all food objects
async function loadFoodObjects() {
    try {
        console.log('🍽️ Starting optimized progressive loading...');
        
        // Phase 1: Core objects (20-40%)
        loadingScreen.updateProgress(20, 'Loading Corona objects...');
        await coronaExtraObject.load();
        await new Promise(resolve => setTimeout(resolve, 50)); // Prevent freezing
        
        loadingScreen.updateProgress(30, 'Loading Corona bottle...');
        await coronaBottleObject.load();
        await new Promise(resolve => setTimeout(resolve, 50));
          // Phase 2: Carton objects and other food items (40-60%)
        loadingScreen.updateProgress(40, 'Loading egg carton...');
        await eggCartonObject.load();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        loadingScreen.updateProgress(47, 'Loading open egg carton...');
        await openEggCartonObject.load();
        await new Promise(resolve => setTimeout(resolve, 50));        loadingScreen.updateProgress(55, 'Loading cheese...');
        await cheeseObject.load();
        await new Promise(resolve => setTimeout(resolve, 50));        loadingScreen.updateProgress(58, 'Loading pickled cucumbers...');
        await pickledCucumbersObject.load();
        await new Promise(resolve => setTimeout(resolve, 50));
          loadingScreen.updateProgress(58, 'Loading banana crate...');
        await bananaCrateObject.load();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        loadingScreen.updateProgress(59, 'Loading AA batteries...');
        await aaBatteriesObject.load();
        await new Promise(resolve => setTimeout(resolve, 50));
          // Phase 3: Eggs progressively (60-90%)
        loadingScreen.updateProgress(60, 'Loading eggs progressively...');
        console.log('🥚 Loading 5 egg objects with progressive loading...');
        console.log('🥚 Available eggObjects:', eggObjects.length);
        
        const totalEggs = eggObjects.length;
        for (let i = 0; i < totalEggs; i++) {
            const progress = 60 + ((i + 1) / totalEggs) * 30; // 60% to 90%
            loadingScreen.updateProgress(progress, `Loading egg ${i + 1}/${totalEggs}...`);
            
            console.log(`🥚 Starting to load egg ${i + 1}...`);
            console.log(`🥚 Egg ${i + 1} object:`, eggObjects[i]);
            console.log(`🥚 Egg ${i + 1} config:`, eggObjects[i].config);
            
            try {
                await eggObjects[i].load();
                console.log(`✅ Egg ${i + 1} loaded successfully!`);
            } catch (error) {
                console.error(`❌ Failed to load egg ${i + 1}:`, error);
            }
            
            // Yield control every egg to prevent freezing
            await new Promise(resolve => setTimeout(resolve, 100));
        }
          // Final phase (90-100%)
        loadingScreen.updateProgress(95, 'Finalizing scene...');
        
        // Initialize object drag controls after all objects are loaded
        initializeDragControls();
        
        // Show cache statistics
        const cacheStats = optimizedLoader.getCacheStats();
        console.log('📊 Cache Statistics:', cacheStats);
        
        loadingScreen.updateProgress(100, 'Loading complete!');
        
        // Hide loading screen after a brief moment
        setTimeout(() => {
            loadingScreen.hide();
        }, 1000);
        
        console.log('✅ All food objects loaded successfully with optimization!');
        console.log(`📦 Cache hit rate: ${cacheStats.hitRate}`);
        console.log(`⚡ Average load time: ${cacheStats.averageLoadTime}ms`);
        
    } catch (error) {
        console.error('❌ Error loading food objects:', error);
        loadingScreen.updateProgress(100, 'Error occurred!');
        setTimeout(() => {
            loadingScreen.hide();
        }, 2000);    }
}

// Initialize object drag controls after all objects are loaded
function initializeDragControls() {
    console.log('🎯 Initializing drag controls...');
    
    // Create drag controls instance
    objectDragControls = new window.ObjectDragControls(scene, camera, renderer, cameraControls);
    
    // Collect all loaded food objects
    const dragObjects = [];
    
    // Add main food objects
    const coronaExtra = coronaExtraObject.getCoronaExtra();
    if (coronaExtra) {
        coronaExtra.userData.name = 'Corona Extra';
        dragObjects.push(coronaExtra);
    }
    
    const coronaBottle = coronaBottleObject.getCoronaBottle();
    if (coronaBottle) {
        coronaBottle.userData.name = 'Corona Bottle';
        dragObjects.push(coronaBottle);
    }
    
    const eggCarton = eggCartonObject.getEggCarton();
    if (eggCarton) {
        eggCarton.userData.name = 'Egg Carton';
        dragObjects.push(eggCarton);
    }
    
    const openEggCarton = openEggCartonObject.getOpenEggCarton();
    if (openEggCarton) {
        openEggCarton.userData.name = 'Open Egg Carton';
        dragObjects.push(openEggCarton);
    }
    
    const cheese = cheeseObject.getModel();
    if (cheese) {
        cheese.userData.name = 'Cheese';
        dragObjects.push(cheese);
    }
    
    const pickledCucumbers = pickledCucumbersObject.getPickledCucumbers();
    if (pickledCucumbers) {
        pickledCucumbers.userData.name = 'Pickled Cucumbers';
        dragObjects.push(pickledCucumbers);
    }
    
    const bananaCrate = bananaCrateObject.getBananaCrate();
    if (bananaCrate) {
        bananaCrate.userData.name = 'Banana Crate';
        dragObjects.push(bananaCrate);
    }
    
    const aaBatteries = aaBatteriesObject.getAABatteries();
    if (aaBatteries) {
        aaBatteries.userData.name = 'AA Batteries';
        dragObjects.push(aaBatteries);
    }
    
    // Add individual eggs
    eggObjects.forEach((eggObj, index) => {
        const egg = eggObj.getEgg();
        if (egg) {
            egg.userData.name = `Egg ${index + 1}`;
            dragObjects.push(egg);
        }
    });
    
    // Initialize drag controls with all objects
    if (dragObjects.length > 0) {
        objectDragControls.initializeDragObjects(dragObjects);
        console.log(`🎯 Drag controls initialized with ${dragObjects.length} objects`);
    } else {
        console.warn('🎯 No objects found for drag controls');
    }
}

// Position camera to get a good view of all food objects
function positionCameraForFoodObjects() {    const coronaExtra = coronaExtraObject.getCoronaExtra();
    const coronaBottle = coronaBottleObject.getCoronaBottle();
    const eggCarton = eggCartonObject.getEggCarton();
    const openEggCarton = openEggCartonObject.getOpenEggCarton();
    const cheese = cheeseObject.getModel();
    const pickledCucumbers = pickledCucumbersObject.getPickledCucumbers();
    const bananaCrate = bananaCrateObject.getBananaCrate();
    const aaBatteries = aaBatteriesObject.getAABatteries();
    const egg = eggObject.getEgg();    // Collect all loaded objects
    const objects = [];    if (coronaExtra) objects.push(coronaExtra);
    if (coronaBottle) objects.push(coronaBottle);
    if (eggCarton) objects.push(eggCarton);
    if (openEggCarton) objects.push(openEggCarton);
    if (cheese) objects.push(cheese);    if (pickledCucumbers) objects.push(pickledCucumbers);
    if (bananaCrate) objects.push(bananaCrate);
    if (aaBatteries) objects.push(aaBatteries);
    if (egg) objects.push(egg);
    
    if (objects.length > 0) {
        // Calculate center point of all objects
        let totalX = 0, totalY = 0, totalZ = 0;
        objects.forEach(obj => {
            totalX += obj.position.x;
            totalY += obj.position.y;
            totalZ += obj.position.z;
        });
        
        const centerX = totalX / objects.length;
        const centerY = totalY / objects.length;
        const centerZ = totalZ / objects.length;
        
        // Position camera INSIDE the fridge to view all objects
        // The fridge is at x: 46, so we position camera slightly forward of center
        camera.position.set(
            centerX + 12,  // Position inside fridge, closer to back wall (fridge is at x: 46)
            centerY + 2,   // Slightly above objects for better viewing angle
            centerZ + 8    // Forward from objects for clear view
        );
        
        // Look at center point of all objects
        camera.lookAt(centerX, centerY, centerZ);
          console.log(`Camera positioned to view ${objects.length} food objects from INSIDE fridge`);        console.log('Objects loaded:');
        if (coronaExtra) console.log('  - Corona Extra at:', coronaExtra.position);        if (coronaBottle) console.log('  - Corona Bottle at:', coronaBottle.position);
        if (eggCarton) console.log('  - Egg Carton at:', eggCarton.position);
        if (openEggCarton) console.log('  - Open Egg Carton at:', openEggCarton.position);        if (cheese) console.log('  - Cheese at:', cheese.position);        if (pickledCucumbers) console.log('  - Pickled Cucumbers at:', pickledCucumbers.position);
        if (bananaCrate) console.log('  - Banana Crate at:', bananaCrate.position);
        if (aaBatteries) console.log('  - AA Batteries at:', aaBatteries.position);
        if (egg) console.log('  - Egg at:', egg.position);
        console.log('Camera center point:', { x: centerX, y: centerY, z: centerZ });
        console.log('Camera position (INSIDE fridge):', { x: centerX + 12, y: centerY + 2, z: centerZ + 8 });
    } else {
        console.log('No food objects loaded, using default INSIDE fridge camera position');
        // Default fallback position INSIDE the fridge (fridge is at x: 46)
        camera.position.set(42, 17, 8);  // Inside fridge, towards front
        camera.lookAt(30, 15, 0);        // Look towards center of fridge interior
    }
}

// Load kitchen and fridge model
async function loadKitchenAndFridgeModel() {
    const kitchenConfig = {
        name: 'kitchen_and_fridge',
        path: 'models/kitchen_and_fridge.glb',
        scale: { x: 10, y: 10, z: 10 },
        position: { x: 15, y: 0, z: 0 }, // Position it next to the fridge
        rotation: { x: 0, y: Math.PI, z: 0 },
        enableShadows: true,
        processMaterials: true,
        materialConfig: {
            changeColors: true,
            colorRules: [
                {
                    condition: { type: 'pink' },
                    newColor: { r: 1.0, g: 1.0, b: 1.0 },
                    emissive: { r: 0.2, g: 0.2, b: 0.2 },
                    description: 'Converting pink materials to white'
                },
                {
                    condition: { type: 'dark' },
                    newColor: null, // Keep original color
                    emissive: { r: 0.2, g: 0.2, b: 0.2 },
                    description: 'Adding brightness to dark materials'
                }
            ],
            shininess: 80,
            roughness: 0.5,
            metalness: 0.6,
            aoMapIntensity: 0.8
        }
    };
    
    try {
        const kitchenModel = await modelLoader.loadModel(kitchenConfig);
        console.log('Kitchen and fridge model loaded and positioned successfully!');
        return kitchenModel;
    } catch (error) {
        console.error('Failed to load kitchen and fridge model:', error);
        throw error;
    }
}

// Load fridge model (converted to async)
async function loadFridgeModel() {
    const fridgeConfig = {
        name: 'fridge',
        path: 'models/fridge.glb',
        scale: { x: 14, y: 12.4, z: 13 },
        position: { x: 46, y: 15, z: 0.5 },
        rotation: { x: 0, y: -Math.PI/2, z: 0 },
        enableShadows: true,
        processMaterials: true,
        materialConfig: {
            changeColors: true,
            colorRules: [
                {
                    condition: { type: 'pink' },
                    newColor: { r: 1.0, g: 1.0, b: 1.0 },
                    emissive: { r: 0.2, g: 0.2, b: 0.2 },
                    description: 'Converting pink materials to white'
                },
                {
                    condition: { type: 'dark' },
                    newColor: null,
                    emissive: { r: 0.2, g: 0.2, b: 0.2 },
                    description: 'Adding brightness to dark materials'
                }
            ],
            shininess: 80,
            roughness: 0.2,
            metalness: 0.8,
            aoMapIntensity: 0.8
        }
    };
    
    try {
        const fridgeModel = await modelLoader.loadModel(fridgeConfig);
        
        // Find door objects for animations
        findDoorObjects(fridgeModel);
        
        // Initialize door animations after model is loaded
        if (window.DoorAnimations) {
            window.DoorAnimations.init(scene);
            window.DoorAnimations.setupControls();
        } else {
            console.error('Door animation module not loaded!');
        }
        
        console.log('Fridge model loaded and configured successfully!');
        return fridgeModel;
    } catch (error) {
        console.error('Failed to load fridge model:', error);
        createFallbackCube(); // Create a fallback if model fails to load
        throw error;
    }
}

// Find door objects in the fridge model
function findDoorObjects(fridgeModel) {
    console.log('Debugging: Searching for door objects in the model...');
    console.log('All objects in model:');
    fridgeModel.traverse((object) => {
        console.log('Object name:', object.name);
    });
    
    // Try to find the door objects using multiple approaches
    fridgeModel.traverse((object) => {
        console.log('Checking object:', object.name);
        
        // Try multiple name variations for upper door
        if (object.name === 'FridgeUpperDoor' || 
            object.name === 'UpperDoor' || 
            object.name.toLowerCase().includes('upper') && object.name.toLowerCase().includes('door') ||
            object.name.toLowerCase().includes('top') && object.name.toLowerCase().includes('door')) {
            
            console.log('Found match for upper door:', object);
            window.upperDoor = object;
            // Store original rotation for reference
            window.upperDoor.userData.originalRotation = window.upperDoor.rotation.clone();
            // Set pivot point for rotation (if not set correctly by default)
            // This marks the door for our renderer to know it's a door
            window.upperDoor.userData.isDoor = true;
        }
        
        // Try multiple name variations for lower door
        else if (object.name === 'FridgeLowerDoor' || 
                object.name === 'LowerDoor' || 
                object.name.toLowerCase().includes('lower') && object.name.toLowerCase().includes('door') ||
                object.name.toLowerCase().includes('bottom') && object.name.toLowerCase().includes('door')) {
                
            console.log('Found match for lower door:', object);
            window.lowerDoor = object;
            // Store original rotation for reference
            window.lowerDoor.userData.originalRotation = window.lowerDoor.rotation.clone();
            // Set pivot point for rotation (if not set correctly by default)
            window.lowerDoor.userData.isDoor = true;
        }
    });
}

// Create a fallback cube if model loading fails
function createFallbackCube() {
    console.log('Creating fallback cube since model failed to load');
    const geometry = new THREE.BoxGeometry(2, 3, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1.5, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
}

// Setup lights in the scene
function setupLights() {
    // Ambient light for basic illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Back panel bright point light (behind fridge)
    backPanelLight = new THREE.PointLight(0xffffff, 2.5, 20);
    backPanelLight.position.set(47.5, 15, 0.5); // Position behind fridge panel
    backPanelLight.castShadow = true;
    scene.add(backPanelLight);
    addLightHelper(backPanelLight);
    
    // Create a small visual representation of the light source
    const lightBulbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const lightBulbMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffcc, 
        emissive: 0xffffcc,
        emissiveIntensity: 1
    });    const lightBulb = new THREE.Mesh(lightBulbGeometry, lightBulbMaterial);
    lightBulb.position.copy(backPanelLight.position);
    scene.add(lightBulb);
    
    // 1. LEFT - Light from left side
    const leftLight = new THREE.DirectionalLight(0xffffff, 0.5);
    leftLight.position.set(-10, 0, 0);
    scene.add(leftLight);
    addLightHelper(leftLight);
    
    // 2. RIGHT - Light from right side
    const rightLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rightLight.position.set(10, 0, 0);
    scene.add(rightLight);
    addLightHelper(rightLight);
    
    // 3. UP - Light from above
    const upLight = new THREE.DirectionalLight(0xffffff, 0.5);
    upLight.position.set(0, 10, 0);
    scene.add(upLight);
    addLightHelper(upLight);
    
    // 4. DOWN - Light from below
    const downLight = new THREE.DirectionalLight(0xffffff, 0.5);
    downLight.position.set(0, -10, 0);
    scene.add(downLight);
    addLightHelper(downLight);
    
    // 5. FRONT - Light from front
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.5);
    frontLight.position.set(0, 0, 10);
    scene.add(frontLight);
    addLightHelper(frontLight);
    
    // 6. BACK - Light from back
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(0, 0, -10);
    scene.add(backLight);
    addLightHelper(backLight);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Helper function to add light visualization helpers
function addLightHelper(light, size = 1) {
    if (SHOW_LIGHT_HELPERS) {
        if (light instanceof THREE.DirectionalLight) {
            const helper = new THREE.DirectionalLightHelper(light, size);
            scene.add(helper);
        } else if (light instanceof THREE.PointLight) {
            const helper = new THREE.PointLightHelper(light, size);
            scene.add(helper);
        }
    }
}

// Ensure dependencies are loaded
function setupDependencies() {
    // Kontrol et ve yükle
    if (!window.DoorAnimations) {
        console.log('Loading door animations module...');
        const script = document.createElement('script');
        script.src = 'js/doorAnimations.js';
        document.head.appendChild(script);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update orbit controls (disabled for FPS camera)
    // controls.update();    // Update WASD camera controls
    if (cameraControls) {
        cameraControls.update();
    }
    
    // Update object drag controls
    if (objectDragControls) {
        objectDragControls.update();
    }    // Make the back panel light bulb glow with slight animation
    if (backPanelLight && backPanelLight.visible) {
        // Make the light pulsate slightly for a more realistic effect
        const pulseFactor = 0.1 * Math.sin(clock.getElapsedTime() * 2) + 1;
        backPanelLight.intensity = 2.5 * pulseFactor;
    }
    
    renderer.render(scene, camera);
}

// Start the application
window.onload = init;

// Add cleanup handlers to prevent memory leaks
window.addEventListener('beforeunload', () => {
    console.log('🧹 Application cleanup started...');
    
    // Stop memory monitoring
    if (memoryManager) {
        memoryManager.dispose();
    }
      // Clean up camera controls
    if (cameraControls) {
        cameraControls.destroy();
    }
    
    // Clean up object drag controls
    if (objectDragControls) {
        objectDragControls.dispose();
    }
    
    // Clean up loading screen
    if (loadingScreen) {
        loadingScreen.dispose();
    }
    
    // Clean up optimized loader
    if (optimizedLoader) {
        optimizedLoader.dispose();
    }
    
    // Dispose renderer resources
    if (renderer) {
        renderer.dispose();
    }
    
    console.log('✅ Application cleanup completed');
});

// Handle visibility change (when tab becomes hidden/visible)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab is hidden - reduce resource usage
        if (memoryManager) {
            memoryManager.cleanupUnused();
        }
    }
});