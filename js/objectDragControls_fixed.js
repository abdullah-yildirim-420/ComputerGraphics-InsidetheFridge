/**
 * Keyboard Object Drag Controls Module
 * Handles object selection and dragging using number keys (1-9)
 * Each number key selects a specific object for dragging
 */
class ObjectDragControls {
    constructor(scene, camera, renderer, cameraControls) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.cameraControls = cameraControls;
        
        // Object management
        this.allObjects = [];
        this.selectedObject = null;
        this.selectedObjectIndex = -1;
        this.isDragging = false;
        
        // Mouse tracking
        this.mouse = new THREE.Vector2();
        this.mouseWorldPosition = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.intersectionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        
        // Object mapping (number key -> object)
        this.objectMapping = {
            '1': { name: 'Corona Extra', object: null },
            '2': { name: 'Corona Bottle', object: null },
            '3': { name: 'Egg Carton', object: null },
            '4': { name: 'Open Egg Carton', object: null },
            '5': { name: 'Cheese', object: null },
            '6': { name: 'Pickled Cucumbers', object: null },
            '7': { name: 'Banana Crate', object: null },
            '8': { name: 'AA Batteries', object: null },
            '9': { name: 'Egg', object: null }
        };
        
        // Visual feedback
        this.selectedObjectOriginalColor = null;
        this.selectedObjectHighlight = null;
        
        // Drag offset
        this.dragOffset = new THREE.Vector3();
        
        // Bind methods
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.updateSelectedObjectPosition = this.updateSelectedObjectPosition.bind(this);
        
        this.isEnabled = true;
        
        console.log('🎯 Keyboard Object Drag Controls initialized');
        console.log('🎯 Press number keys 1-9 to select and drag objects');
        this.printObjectMapping();
    }
    
    /**
     * Print object mapping to console
     */
    printObjectMapping() {
        console.log('📋 Object Mapping:');
        Object.keys(this.objectMapping).forEach(key => {
            console.log(`   ${key}: ${this.objectMapping[key].name}`);
        });
    }
    
    /**
     * Initialize drag controls with food objects
     * @param {Array} foodObjects - Array of THREE.Object3D objects that can be dragged
     */
    initializeDragObjects(foodObjects) {
        this.allObjects = [];        // Store all objects and map them to number keys
        foodObjects.forEach((obj, index) => {
            if (obj && obj.userData) {
                this.allObjects.push(obj);
                
                // Map objects to number keys based on their exact names
                const objectName = obj.userData.name;
                if (objectName) {
                    Object.keys(this.objectMapping).forEach(key => {
                        const mapping = this.objectMapping[key];
                        
                        // Exact string matching to avoid confusion between similar names
                        if (mapping.name === objectName) {
                            mapping.object = obj;
                            console.log(`🎯 Mapped ${key}: ${objectName} -> ${mapping.name}`);
                        } else if (mapping.name === 'Egg' && objectName.startsWith('Egg ')) {
                            // Special case for eggs (Egg 1, Egg 2, etc.)
                            if (!mapping.object) {  // Only map the first egg found
                                mapping.object = obj;
                                console.log(`🎯 Mapped ${key}: ${objectName} -> ${mapping.name}`);
                            }
                        }
                    });
                }
            }
        });
        
        // Add event listeners
        this.addEventListeners();
        
        console.log(`🎯 Keyboard drag controls initialized with ${this.allObjects.length} objects`);
        this.printMappedObjects();
    }
    
    /**
     * Print mapped objects to console
     */
    printMappedObjects() {
        console.log('🗂️ Mapped Objects:');
        Object.keys(this.objectMapping).forEach(key => {
            const mapping = this.objectMapping[key];
            const status = mapping.object ? '✅ Mapped' : '❌ Not Found';
            console.log(`   ${key}: ${mapping.name} - ${status}`);
        });
    }
    
    /**
     * Add event listeners
     */
    addEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown);
        
        // Mouse events
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
    }
    
    /**
     * Remove event listeners
     */
    removeEventListeners() {
        document.removeEventListener('keydown', this.onKeyDown);
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
    }
    
    /**
     * Handle keyboard events
     */
    onKeyDown(event) {
        if (!this.isEnabled) return;
        
        const key = event.key;
        
        // Check if it's a number key 1-9
        if (key >= '1' && key <= '9') {
            event.preventDefault();
            this.handleObjectSelection(key);
        }
    }
    
    /**
     * Handle object selection via number keys
     */
    handleObjectSelection(key) {
        const mapping = this.objectMapping[key];
        
        if (!mapping.object) {
            console.warn(`❌ Object for key ${key} (${mapping.name}) not found`);
            return;
        }
        
        // If same object is selected, deselect it
        if (this.selectedObject === mapping.object) {
            this.deselectObject();
            console.log(`🎯 Deselected ${mapping.name} (key ${key})`);
            return;
        }
        
        // Deselect previous object if any
        if (this.selectedObject) {
            this.deselectObject();
        }
        
        // Select new object
        this.selectObject(mapping.object, key);
        console.log(`🎯 Selected ${mapping.name} (key ${key}) - move mouse to drag`);
    }
    
    /**
     * Select an object for dragging
     */
    selectObject(object, key) {
        this.selectedObject = object;
        this.selectedObjectIndex = key;
        this.isDragging = true;
        
        // Store original position as drag offset
        this.dragOffset.copy(object.position);
        
        // Add visual highlight
        this.addObjectHighlight(object);
        
        // Disable camera controls while dragging
        if (this.cameraControls) {
            this.cameraControls.isEnabled = false;
        }
        
        // Change cursor
        document.body.style.cursor = 'grabbing';
        
        // Update intersection plane based on object's current Y position
        this.intersectionPlane.constant = -object.position.y;
    }
    
    /**
     * Deselect current object
     */
    deselectObject() {
        if (this.selectedObject) {
            // Remove visual highlight
            this.removeObjectHighlight();
            
            // Log final position
            const pos = this.selectedObject.position;
            console.log(`📍 Final position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
            
            this.selectedObject = null;
            this.selectedObjectIndex = -1;
            this.isDragging = false;
        }
        
        // Re-enable camera controls
        if (this.cameraControls) {
            this.cameraControls.isEnabled = true;
        }
        
        // Reset cursor
        document.body.style.cursor = 'default';
    }
    
    /**
     * Add visual highlight to selected object
     */
    addObjectHighlight(object) {
        // Store original material colors
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                if (!child.userData.originalColor && child.material.color) {
                    child.userData.originalColor = child.material.color.clone();
                }
                
                // Make it brighter
                if (child.material.color) {
                    child.material.color.multiplyScalar(1.3);
                }
                
                // Add slight emissive glow
                if (child.material.emissive) {
                    child.userData.originalEmissive = child.material.emissive.clone();
                    child.material.emissive.setRGB(0.1, 0.1, 0.2);
                }
            }
        });
    }
    
    /**
     * Remove visual highlight from object
     */
    removeObjectHighlight() {
        if (this.selectedObject) {
            this.selectedObject.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Restore original color
                    if (child.userData.originalColor) {
                        child.material.color.copy(child.userData.originalColor);
                    }
                    
                    // Restore original emissive
                    if (child.userData.originalEmissive) {
                        child.material.emissive.copy(child.userData.originalEmissive);
                    } else if (child.material.emissive) {
                        child.material.emissive.setRGB(0, 0, 0);
                    }
                }
            });
        }
    }
    
    /**
     * Handle mouse movement for dragging
     */
    onMouseMove(event) {
        if (!this.isEnabled || !this.isDragging || !this.selectedObject) return;
        
        // Update mouse coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update object position
        this.updateSelectedObjectPosition();
    }
    
    /**
     * Update selected object position based on mouse
     */
    updateSelectedObjectPosition() {
        if (!this.selectedObject) return;
        
        // Cast ray from camera through mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersection with the plane at object's Y level
        const intersectionPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.intersectionPlane, intersectionPoint);
        
        if (intersectionPoint) {
            // Update object position (keep Y coordinate fixed)
            this.selectedObject.position.x = intersectionPoint.x;
            this.selectedObject.position.z = intersectionPoint.z;
            // Y position stays the same as when selected
        }
    }
    
    /**
     * Add a new object to the system
     */
    addDragObject(object) {
        if (object && !this.allObjects.includes(object)) {
            this.allObjects.push(object);
            console.log(`🎯 Added ${object.userData.name || 'object'} to keyboard drag controls`);
        }
    }
    
    /**
     * Remove an object from the system
     */
    removeDragObject(object) {
        const index = this.allObjects.indexOf(object);
        if (index !== -1) {
            // If this was the selected object, deselect it
            if (this.selectedObject === object) {
                this.deselectObject();
            }
            
            this.allObjects.splice(index, 1);
            
            // Remove from mapping
            Object.keys(this.objectMapping).forEach(key => {
                if (this.objectMapping[key].object === object) {
                    this.objectMapping[key].object = null;
                }
            });
            
            console.log(`🎯 Removed ${object.userData.name || 'object'} from keyboard drag controls`);
        }
    }
    
    /**
     * Enable/disable drag controls
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (!enabled && this.selectedObject) {
            this.deselectObject();
        }
        
        console.log(`🎯 Keyboard drag controls ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Update method (called in animation loop)
     */
    update() {
        // Update object position if dragging
        if (this.isDragging && this.selectedObject) {
            // This ensures smooth dragging in the animation loop
            // The actual position update happens in onMouseMove
        }
    }
    
    /**
     * Get current object mapping status
     */
    getObjectMappingStatus() {
        const status = {};
        Object.keys(this.objectMapping).forEach(key => {
            const mapping = this.objectMapping[key];
            status[key] = {
                name: mapping.name,
                mapped: mapping.object !== null,
                selected: this.selectedObject === mapping.object
            };
        });
        return status;
    }
    
    /**
     * Manually assign object to key
     */
    assignObjectToKey(key, object) {
        if (key >= '1' && key <= '9' && object) {
            this.objectMapping[key].object = object;
            console.log(`🎯 Manually assigned ${object.userData.name || 'object'} to key ${key}`);
        }
    }
    
    /**
     * Dispose of drag controls
     */
    dispose() {
        // Deselect current object
        if (this.selectedObject) {
            this.deselectObject();
        }
        
        // Remove event listeners
        this.removeEventListeners();
        
        // Clear arrays
        this.allObjects = [];
        Object.keys(this.objectMapping).forEach(key => {
            this.objectMapping[key].object = null;
        });
        
        console.log('🎯 Keyboard Object Drag Controls disposed');
    }
}

// Make the ObjectDragControls available globally
window.ObjectDragControls = ObjectDragControls;
