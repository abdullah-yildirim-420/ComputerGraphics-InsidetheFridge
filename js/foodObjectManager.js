/**
 * Food Object Manager - Manages all food objects in the fridge
 * Modular system for loading and managing individual food items
 */
class FoodObjectManager {
    constructor(scene, modelLoader) {
        this.scene = scene;
        this.modelLoader = modelLoader;
        this.foodObjects = new Map(); // Store all food objects
        this.interactableObjects = []; // Objects that can be interacted with
        
        console.log('Food Object Manager initialized');
    }
    
    /**
     * Register a food object in the manager
     * @param {string} name - Unique name for the object
     * @param {THREE.Object3D} object - The 3D object
     * @param {Object} metadata - Additional data about the object
     */
    registerFoodObject(name, object, metadata = {}) {
        const foodItem = {
            object: object,
            name: name,
            type: metadata.type || 'generic',
            interactable: metadata.interactable !== false,
            originalPosition: object.position.clone(),
            originalRotation: object.rotation.clone(),
            ...metadata
        };
        
        this.foodObjects.set(name, foodItem);
        
        if (foodItem.interactable) {
            this.interactableObjects.push(object);
            // Mark object for interaction system
            object.userData.isInteractable = true;
            object.userData.foodObjectName = name;
        }
        
        console.log(`Food object registered: ${name} (${foodItem.type})`);
    }
    
    /**
     * Get a food object by name
     * @param {string} name - Name of the object
     * @returns {Object|null} Food object data
     */
    getFoodObject(name) {
        return this.foodObjects.get(name) || null;
    }
    
    /**
     * Get all food objects of a specific type
     * @param {string} type - Type of food objects
     * @returns {Array} Array of food objects
     */
    getFoodObjectsByType(type) {
        return Array.from(this.foodObjects.values()).filter(item => item.type === type);
    }
    
    /**
     * Remove a food object
     * @param {string} name - Name of the object to remove
     */
    removeFoodObject(name) {
        const foodItem = this.foodObjects.get(name);
        if (foodItem) {
            this.scene.remove(foodItem.object);
            
            // Remove from interactable objects if it was interactable
            const index = this.interactableObjects.indexOf(foodItem.object);
            if (index > -1) {
                this.interactableObjects.splice(index, 1);
            }
            
            this.foodObjects.delete(name);
            console.log(`Food object removed: ${name}`);
        }
    }
    
    /**
     * Reset all food objects to their original positions
     */
    resetAllPositions() {
        this.foodObjects.forEach((foodItem, name) => {
            foodItem.object.position.copy(foodItem.originalPosition);
            foodItem.object.rotation.copy(foodItem.originalRotation);
        });
        console.log('All food objects reset to original positions');
    }
    
    /**
     * Get all interactable objects (for raycasting)
     * @returns {Array} Array of THREE.Object3D that can be interacted with
     */
    getInteractableObjects() {
        return this.interactableObjects;
    }
    
    /**
     * Get statistics about loaded food objects
     * @returns {Object} Statistics object
     */
    getStats() {
        const stats = {
            totalObjects: this.foodObjects.size,
            interactableObjects: this.interactableObjects.length,
            types: {}
        };
        
        this.foodObjects.forEach(foodItem => {
            if (!stats.types[foodItem.type]) {
                stats.types[foodItem.type] = 0;
            }
            stats.types[foodItem.type]++;
        });
        
        return stats;
    }
    
    /**
     * Update all food objects (called in animation loop if needed)
     */
    update() {
        // Future: Add physics, animations, etc.
        this.foodObjects.forEach((foodItem, name) => {
            // Example: Add subtle floating animation for some objects
            if (foodItem.hasFloatingAnimation) {
                const time = Date.now() * 0.001;
                foodItem.object.position.y = foodItem.originalPosition.y + Math.sin(time + foodItem.animationOffset) * 0.02;
            }
        });
    }
}

// Export for use in other modules
window.FoodObjectManager = FoodObjectManager;
