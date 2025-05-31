/**
 * Simple UI-Based Object Drag Controls
 * Easy to use drag system with UI buttons and keyboard shortcuts
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
        this.isDragging = false;
        
        // Mouse tracking
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        
        // Ground plane for drag calculations
        this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        
        // Object list with names
        this.objectList = [
            { name: 'Corona Extra', key: '1', object: null },
            { name: 'Corona Bottle', key: '2', object: null },
            { name: 'Egg Carton', key: '3', object: null },
            { name: 'Open Egg Carton', key: '4', object: null },
            { name: 'Cheese', key: '5', object: null },
            { name: 'Pickled Cucumbers', key: '6', object: null },
            { name: 'Banana Crate', key: '7', object: null },
            { name: 'AA Batteries', key: '8', object: null }
        ];
        
        // Bind methods
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseClick = this.onMouseClick.bind(this);
        
        this.isEnabled = true;
        
        console.log('🎮 Simple Drag Controls initialized');
        
        // Create UI
        this.createUI();
        this.setupEventListeners();
    }
    
    /**
     * Create UI for object selection
     */
    createUI() {
        // Create drag controls UI panel
        const dragUI = document.createElement('div');
        dragUI.id = 'dragControlsUI';
        dragUI.style.cssText = `
            position: absolute;
            top: 120px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            max-width: 200px;
            z-index: 1000;
        `;
        
        // Title
        const title = document.createElement('h4');
        title.textContent = 'Obje Sürükleme';
        title.style.cssText = 'margin: 0 0 10px 0; color: #4CAF50;';
        dragUI.appendChild(title);
        
        // Instructions
        const instructions = document.createElement('p');
        instructions.textContent = 'Nesne seç ve fareyle sürükle:';
        instructions.style.cssText = 'margin: 0 0 10px 0; font-size: 11px;';
        dragUI.appendChild(instructions);
        
        // Create buttons for each object
        this.objectList.forEach((item, index) => {
            const button = document.createElement('button');
            button.textContent = `${item.key}: ${item.name}`;
            button.style.cssText = `
                width: 100%;
                margin: 2px 0;
                padding: 5px;
                background: #333;
                color: white;
                border: 1px solid #555;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.2s;
            `;
            
            button.onmouseover = () => {
                button.style.background = '#4CAF50';
            };
            
            button.onmouseout = () => {
                if (this.selectedObject !== item.object) {
                    button.style.background = '#333';
                }
            };
            
            button.onclick = () => {
                this.selectObjectByIndex(index);
            };
            
            item.button = button;
            dragUI.appendChild(button);
        });
        
        // Status text
        const status = document.createElement('div');
        status.id = 'dragStatus';
        status.style.cssText = 'margin-top: 10px; font-size: 11px; color: #888;';
        status.textContent = 'Nesne seçilmedi';
        dragUI.appendChild(status);
        
        document.body.appendChild(dragUI);
        
        console.log('🎮 Drag controls UI created');
    }
    
    /**
     * Update status text
     */
    updateStatus(text) {
        const status = document.getElementById('dragStatus');
        if (status) {
            status.textContent = text;
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.onKeyDown);
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
        this.renderer.domElement.addEventListener('click', this.onMouseClick);
    }
    
    /**
     * Remove event listeners
     */
    removeEventListeners() {
        document.removeEventListener('keydown', this.onKeyDown);
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.renderer.domElement.removeEventListener('click', this.onMouseClick);
    }
    
    /**
     * Initialize with food objects
     */
    initializeDragObjects(foodObjects) {
        this.allObjects = foodObjects;
        
        // Map objects to list items
        foodObjects.forEach(obj => {
            if (obj && obj.userData && obj.userData.name) {
                const objectName = obj.userData.name.toLowerCase();
                
                // Find matching item in objectList
                this.objectList.forEach(item => {
                    const itemName = item.name.toLowerCase();
                    
                    if (objectName.includes(itemName.split(' ')[0]) || 
                        itemName.includes(objectName.split(' ')[0])) {
                        item.object = obj;
                        console.log(`🎮 Mapped: ${item.name} -> ${obj.userData.name}`);
                    }
                });
            }
        });
        
        // Update UI button states
        this.updateButtonStates();
        
        console.log(`🎮 Drag controls initialized with ${this.allObjects.length} objects`);
    }
    
    /**
     * Update button states based on available objects
     */
    updateButtonStates() {
        this.objectList.forEach(item => {
            if (item.button) {
                if (item.object) {
                    item.button.style.opacity = '1';
                    item.button.disabled = false;
                } else {
                    item.button.style.opacity = '0.5';
                    item.button.disabled = true;
                }
            }
        });
    }
    
    /**
     * Handle keyboard input
     */
    onKeyDown(event) {
        if (!this.isEnabled) return;
        
        const key = event.key;
        
        // Find object by key
        this.objectList.forEach((item, index) => {
            if (item.key === key && item.object) {
                event.preventDefault();
                this.selectObjectByIndex(index);
            }
        });
        
        // ESC to deselect
        if (key === 'Escape') {
            this.deselectObject();
        }
    }
    
    /**
     * Select object by index
     */
    selectObjectByIndex(index) {
        const item = this.objectList[index];
        
        if (!item || !item.object) {
            console.warn(`❌ Object ${item ? item.name : 'unknown'} not available`);
            return;
        }
        
        // If same object, deselect
        if (this.selectedObject === item.object) {
            this.deselectObject();
            return;
        }
        
        // Deselect previous
        if (this.selectedObject) {
            this.deselectObject();
        }
        
        // Select new object
        this.selectObject(item.object, item.name);
        
        // Update button appearance
        this.objectList.forEach(listItem => {
            if (listItem.button) {
                if (listItem === item) {
                    listItem.button.style.background = '#4CAF50';
                    listItem.button.style.borderColor = '#4CAF50';
                } else {
                    listItem.button.style.background = '#333';
                    listItem.button.style.borderColor = '#555';
                }
            }
        });
    }
    
    /**
     * Select an object
     */
    selectObject(object, name) {
        this.selectedObject = object;
        this.isDragging = true;
        
        // Visual feedback
        this.addHighlight(object);
        
        // Disable camera controls
        if (this.cameraControls) {
            this.cameraControls.isEnabled = false;
        }
        
        // Update cursor and status
        document.body.style.cursor = 'grab';
        this.updateStatus(`${name} seçildi - fareyle sürükle`);
        
        console.log(`🎮 Selected: ${name}`);
    }
    
    /**
     * Deselect current object
     */
    deselectObject() {
        if (this.selectedObject) {
            // Remove highlight
            this.removeHighlight(this.selectedObject);
            
            // Log final position
            const pos = this.selectedObject.position;
            console.log(`📍 Final position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
            
            this.selectedObject = null;
            this.isDragging = false;
        }
        
        // Re-enable camera controls
        if (this.cameraControls) {
            this.cameraControls.isEnabled = true;
        }
        
        // Reset UI
        document.body.style.cursor = 'default';
        this.updateStatus('Nesne seçilmedi');
        
        // Reset button colors
        this.objectList.forEach(item => {
            if (item.button && item.object) {
                item.button.style.background = '#333';
                item.button.style.borderColor = '#555';
            }
        });
        
        console.log('🎮 Object deselected');
    }
    
    /**
     * Add visual highlight to object
     */
    addHighlight(object) {
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                // Store original colors
                if (!child.userData.originalColor && child.material.color) {
                    child.userData.originalColor = child.material.color.clone();
                }
                
                // Make brighter
                if (child.material.color) {
                    child.material.color.multiplyScalar(1.5);
                }
                
                // Add glow
                if (child.material.emissive) {
                    child.userData.originalEmissive = child.material.emissive.clone();
                    child.material.emissive.setRGB(0.2, 0.2, 0.0);
                }
            }
        });
    }
    
    /**
     * Remove visual highlight
     */
    removeHighlight(object) {
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                // Restore original colors
                if (child.userData.originalColor) {
                    child.material.color.copy(child.userData.originalColor);
                }
                
                if (child.userData.originalEmissive) {
                    child.material.emissive.copy(child.userData.originalEmissive);
                } else if (child.material.emissive) {
                    child.material.emissive.setRGB(0, 0, 0);
                }
            }
        });
    }
    
    /**
     * Handle mouse movement
     */
    onMouseMove(event) {
        if (!this.isEnabled || !this.isDragging || !this.selectedObject) return;
        
        // Update mouse coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update cursor
        document.body.style.cursor = 'grabbing';
        
        // Move object
        this.moveSelectedObject();
    }
    
    /**
     * Handle mouse clicks (for deselection)
     */
    onMouseClick(event) {
        if (!this.isEnabled) return;
        
        // If object is selected and we're not over the UI, deselect on click
        if (this.selectedObject && event.target === this.renderer.domElement) {
            // Don't deselect immediately, just update cursor
            document.body.style.cursor = 'grab';
        }
    }
    
    /**
     * Move selected object based on mouse position
     */
    moveSelectedObject() {
        if (!this.selectedObject) return;
        
        // Cast ray from camera
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Set ground plane at object's current Y level
        this.groundPlane.constant = -this.selectedObject.position.y;
        
        // Find intersection with ground plane
        const intersectionPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.groundPlane, intersectionPoint);
        
        if (intersectionPoint) {
            // Update object position (X and Z only, keep Y)
            this.selectedObject.position.x = intersectionPoint.x;
            this.selectedObject.position.z = intersectionPoint.z;
        }
    }
    
    /**
     * Add object to system
     */
    addDragObject(object) {
        if (object && !this.allObjects.includes(object)) {
            this.allObjects.push(object);
            console.log(`🎮 Added ${object.userData.name || 'object'} to drag system`);
        }
    }
    
    /**
     * Remove object from system
     */
    removeDragObject(object) {
        const index = this.allObjects.indexOf(object);
        if (index !== -1) {
            if (this.selectedObject === object) {
                this.deselectObject();
            }
            
            this.allObjects.splice(index, 1);
            
            // Remove from object list
            this.objectList.forEach(item => {
                if (item.object === object) {
                    item.object = null;
                }
            });
            
            this.updateButtonStates();
            console.log(`🎮 Removed ${object.userData.name || 'object'} from drag system`);
        }
    }
    
    /**
     * Enable/disable system
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (!enabled && this.selectedObject) {
            this.deselectObject();
        }
        
        const ui = document.getElementById('dragControlsUI');
        if (ui) {
            ui.style.display = enabled ? 'block' : 'none';
        }
        
        console.log(`🎮 Drag controls ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Update method (called in animation loop)
     */
    update() {
        // Nothing needed here for this implementation
    }
    
    /**
     * Dispose of system
     */
    dispose() {
        // Deselect current object
        if (this.selectedObject) {
            this.deselectObject();
        }
        
        // Remove event listeners
        this.removeEventListeners();
        
        // Remove UI
        const ui = document.getElementById('dragControlsUI');
        if (ui) {
            ui.remove();
        }
        
        // Clear arrays
        this.allObjects = [];
        this.objectList.forEach(item => {
            item.object = null;
            item.button = null;
        });
        
        console.log('🎮 Drag controls disposed');
    }
}

// Make available globally
window.ObjectDragControls = ObjectDragControls;