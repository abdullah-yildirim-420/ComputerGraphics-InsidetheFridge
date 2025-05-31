/**
 * Object Drag Controls - Number Key Selection System
 * Each number key (1-9, 0) selects a specific food item for dragging
 */
class ObjectDragControls {
    constructor(scene, camera, renderer, foodObjectManager) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.foodObjectManager = foodObjectManager;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isDragging = false;
        this.selectedObject = null;
        this.dragOffset = new THREE.Vector3();
        this.dragPlane = new THREE.Plane();
        this.intersectionPoint = new THREE.Vector3();
        
        // Food object mappings for number keys
        this.objectMappings = {
            '1': 'corona_extra',
            '2': 'corona_bottle',
            '3': 'egg_carton',
            '4': 'open_egg_carton',
            '5': 'cheese',
            '6': 'pickled_cucumbers',
            '7': 'banana_crate',
            '8': 'aa_batteries',
            '9': 'egg1',  // First egg
            '0': 'egg5'   // Last egg (5th egg)
        };
        
        // Currently selected object key
        this.selectedKey = null;
        
        // Bind event handlers
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        
        this.setupEventListeners();
        
        console.log('Object drag controls initialized with number key selection system');
        console.log('Key mappings:', this.objectMappings);
    }
    
    setupEventListeners() {
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('keydown', this.onKeyDown);
    }
    
    onKeyDown(event) {
        const key = event.key;
        
        // Check if it's a number key (1-9, 0)
        if (this.objectMappings.hasOwnProperty(key)) {
            event.preventDefault();
            
            const objectName = this.objectMappings[key];
            
            // If same key pressed again, deselect
            if (this.selectedKey === key && this.isDragging) {
                this.deselectObject();
                return;
            }
            
            // Try to select the object
            const foodItem = this.foodObjectManager.getFoodObject(objectName);
            
            if (foodItem && foodItem.object) {
                this.selectObject(foodItem.object, key);
                console.log(`Selected ${objectName} with key ${key}`);
            } else {
                console.warn(`Object ${objectName} not found for key ${key}`);
                
                // Try alternative naming for eggs
                if (objectName.startsWith('egg')) {
                    const eggNumber = objectName.replace('egg', '');
                    const alternativeName = `egg${eggNumber}`;
                    const alternativeItem = this.foodObjectManager.getFoodObject(alternativeName);
                    
                    if (alternativeItem && alternativeItem.object) {
                        this.selectObject(alternativeItem.object, key);
                        console.log(`Selected ${alternativeName} with key ${key} (alternative naming)`);
                    }
                }
            }
        }
    }
    
    selectObject(object, key) {
        // Deselect previous object if any
        if (this.selectedObject) {
            this.deselectObject();
        }
        
        this.selectedObject = object;
        this.selectedKey = key;
        this.isDragging = true;
        
        // Create a drag plane perpendicular to camera view at object position
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        this.dragPlane.setFromNormalAndCoplanarPoint(cameraDirection, object.position);
        
        // Initialize drag offset as zero (cursor will move object directly)
        this.dragOffset.set(0, 0, 0);
        
        // Visual feedback - make object slightly transparent
        this.setObjectTransparency(object, 0.7);
        
        console.log(`Object selected for dragging: ${object.userData.foodObjectName || 'unknown'}`);
    }
    
    deselectObject() {
        if (this.selectedObject) {
            // Restore original transparency
            this.setObjectTransparency(this.selectedObject, 1.0);
            
            console.log(`Object deselected: ${this.selectedObject.userData.foodObjectName || 'unknown'}`);
        }
        
        this.selectedObject = null;
        this.selectedKey = null;
        this.isDragging = false;
    }
    
    setObjectTransparency(object, opacity) {
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        material.transparent = opacity < 1.0;
                        material.opacity = opacity;
                        material.needsUpdate = true;
                    });
                } else {
                    child.material.transparent = opacity < 1.0;
                    child.material.opacity = opacity;
                    child.material.needsUpdate = true;
                }
            }
        });
    }
    
    onMouseMove(event) {
        if (!this.isDragging || !this.selectedObject) {
            return;
        }
        
        event.preventDefault();
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersection with drag plane
        if (this.raycaster.ray.intersectPlane(this.dragPlane, this.intersectionPoint)) {
            // Update object position directly to intersection point
            this.selectedObject.position.copy(this.intersectionPoint);
        }
    }
    
    update() {
        // No animation updates needed for this drag system
    }
    
    dispose() {
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('keydown', this.onKeyDown);
        
        // Restore transparency of selected object
        if (this.selectedObject) {
            this.setObjectTransparency(this.selectedObject, 1.0);
        }
        
        console.log('Object drag controls disposed');
    }
}

// Make the ObjectDragControls available globally
window.ObjectDragControls = ObjectDragControls;
