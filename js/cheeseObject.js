/**
 * Cheese Object Module
 * Handles loading and configuration of Cheese model
 * Represents a block of cheese in the fridge
 */
class CheeseObject {
    constructor(foodObjectManager, modelLoader) {
        this.foodObjectManager = foodObjectManager;
        this.modelLoader = modelLoader;
        this.model = null;
        this.isLoaded = false;
        
        // Cheese configuration
        this.config = {
            name: 'cheese',
            path: 'models/cheese.glb',
            scale: { x: 0.45, y: 0.45, z: 0.45 },
            position: { x: 44, y: 19.5, z: -4 }, // Middle shelf position
            rotation: { x: 0, y: Math.PI, z: 0 }, // Slight rotation for natural look
            enableShadows: true,
            processMaterials: true,
            materialConfig: {
                changeColors: true,
                colorRules: [
                    {
                        condition: { type: 'yellow' },
                        newColor: { r: 1.0, g: 0.9, b: 0.6 }, // Nice cheese yellow
                        emissive: { r: 0.1, g: 0.08, b: 0.03 },
                        description: 'Enhancing cheese yellow color'
                    },
                    {
                        condition: { type: 'white' },
                        newColor: { r: 0.95, g: 0.95, b: 0.85 }, // Creamy white
                        emissive: { r: 0.05, g: 0.05, b: 0.03 },
                        description: 'Enhancing cheese white color'
                    },
                    {
                        condition: { type: 'dark' },
                        newColor: null, // Keep original
                        emissive: { r: 0.1, g: 0.1, b: 0.1 },
                        description: 'Adding brightness to dark cheese parts'
                    }
                ],
                shininess: 40, // Less shiny than plastic
                roughness: 0.7, // More rough surface
                metalness: 0.1, // Not metallic
                aoMapIntensity: 0.9
            }
        };
        
        console.log('Cheese Object module initialized');
    }

    /**
     * Load the cheese model
     */
    async load() {
        if (this.isLoaded) {
            console.log('🧀 Cheese already loaded');
            return this.model;
        }

        try {
            console.log('🧀 Loading cheese model...');
            
            this.model = await this.modelLoader.loadModel(this.config);
            
            if (this.model) {
                this.isLoaded = true;
                
                // Apply cheese-specific enhancements
                this.applyCheeseEnhancements();
                  // Register with food object manager
                if (this.foodObjectManager) {
                    this.foodObjectManager.registerFoodObject('cheese', this.model, {
                        type: 'dairy',
                        interactable: true,
                        description: 'Block of cheese',
                        weight: 'medium',
                        fragile: false
                    });
                }
                
                console.log('✅ Cheese loaded successfully!');
                console.log(`📍 Position: (${this.config.position.x}, ${this.config.position.y}, ${this.config.position.z})`);
                
                return this.model;
            } else {
                throw new Error('Failed to create cheese model');
            }
            
        } catch (error) {
            console.error('❌ Error loading cheese:', error);
            this.isLoaded = false;
            throw error;
        }
    }

    /**
     * Apply cheese-specific material enhancements
     */
    applyCheeseEnhancements() {
        if (!this.model) return;

        console.log('🧀 Applying cheese enhancements...');
        
        this.model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                
                materials.forEach((material, index) => {
                    this.enhanceCheeseMaterial(material, `cheese_material_${index}`);
                });
            }
        });
        
        console.log('✅ Cheese enhancements applied');
    }

    /**
     * Enhance individual cheese material
     */
    enhanceCheeseMaterial(material, materialName) {
        if (!material || material.userData.cheeseEnhanced) return;

        // Store original color
        const originalColor = material.color ? material.color.clone() : null;
        
        console.log(`🎨 Enhancing ${materialName}:`, {
            color: originalColor ? originalColor.getHexString() : 'none',
            type: material.type
        });

        // Determine material type and apply appropriate enhancements
        if (this.isYellowish(originalColor)) {
            this.applyYellowCheeseEnhancements(material, originalColor);
        } else if (this.isWhitish(originalColor)) {
            this.applyWhiteCheeseEnhancements(material, originalColor);
        } else {
            this.applyGeneralCheeseEnhancements(material, originalColor);
        }
    }

    /**
     * Check if color is yellowish (cheese color)
     */
    isYellowish(color) {
        if (!color) return false;
        return color.r > 0.6 && color.g > 0.5 && color.b < 0.7;
    }

    /**
     * Check if color is whitish
     */
    isWhitish(color) {
        if (!color) return false;
        return color.r > 0.7 && color.g > 0.7 && color.b > 0.6;
    }

    /**
     * Apply yellow cheese enhancements
     */
    applyYellowCheeseEnhancements(material, originalColor) {
        console.log('🟡 APPLYING YELLOW CHEESE ENHANCEMENTS');
        
        // Enhanced cheese yellow
        material.color.setRGB(1.0, 0.9, 0.6);
        material.emissive.setRGB(0.1, 0.08, 0.03);
        
        // Cheese-like surface properties
        material.roughness = 0.7;
        material.metalness = 0.05;
        
        if (material.shininess !== undefined) {
            material.shininess = 40;
        }
        
        material.userData.cheeseEnhanced = true;
        material.userData.cheeseType = 'yellow';
        material.needsUpdate = true;
        
        console.log('   Applied yellow cheese enhancements');
    }

    /**
     * Apply white cheese enhancements
     */
    applyWhiteCheeseEnhancements(material, originalColor) {
        console.log('⚪ APPLYING WHITE CHEESE ENHANCEMENTS');
        
        // Creamy white cheese
        material.color.setRGB(0.95, 0.95, 0.85);
        material.emissive.setRGB(0.05, 0.05, 0.03);
        
        // Soft cheese surface
        material.roughness = 0.8;
        material.metalness = 0.02;
        
        if (material.shininess !== undefined) {
            material.shininess = 30;
        }
        
        material.userData.cheeseEnhanced = true;
        material.userData.cheeseType = 'white';
        material.needsUpdate = true;
        
        console.log('   Applied white cheese enhancements');
    }

    /**
     * Apply general cheese enhancements
     */
    applyGeneralCheeseEnhancements(material, originalColor) {
        console.log('🧀 APPLYING GENERAL CHEESE ENHANCEMENTS');
        
        // Preserve original color but enhance properties
        if (originalColor && !material.userData.cheeseEnhanced) {
            material.color.copy(originalColor);
        }
        
        // General cheese improvements
        material.roughness = 0.6;
        material.metalness = 0.1;
        material.emissive.setRGB(0.08, 0.08, 0.05);
        
        if (material.shininess !== undefined) {
            material.shininess = 35;
        }
        
        // Improve surface quality
        material.side = material.side || THREE.FrontSide;
        
        // Improve ambient occlusion
        if (material.aoMapIntensity !== undefined) {
            material.aoMapIntensity = this.config.materialConfig.aoMapIntensity;
        }
        
        material.userData.cheeseEnhanced = true;
        material.userData.cheeseType = 'general';
        material.needsUpdate = true;
        
        console.log(`   Applied general cheese enhancements with color: ${material.color.getHexString()}`);
    }

    /**
     * Get the loaded model
     */
    getModel() {
        return this.model;
    }

    /**
     * Get loading status
     */
    isModelLoaded() {
        return this.isLoaded;
    }

    /**
     * Get cheese configuration
     */
    getConfig() {
        return this.config;
    }

    /**
     * Update cheese position
     */
    setPosition(x, y, z) {
        if (this.model) {
            this.model.position.set(x, y, z);
            this.config.position = { x, y, z };
            console.log(`🧀 Cheese position updated to: (${x}, ${y}, ${z})`);
        }
    }

    /**
     * Update cheese rotation
     */
    setRotation(x, y, z) {
        if (this.model) {
            this.model.rotation.set(x, y, z);
            this.config.rotation = { x, y, z };
            console.log(`🧀 Cheese rotation updated to: (${x}, ${y}, ${z})`);
        }
    }

    /**
     * Update cheese scale
     */
    setScale(x, y, z) {
        if (this.model) {
            this.model.scale.set(x, y, z);
            this.config.scale = { x, y, z };
            console.log(`🧀 Cheese scale updated to: (${x}, ${y}, ${z})`);
        }
    }

    /**
     * Remove cheese from scene
     */
    remove() {
        if (this.model && this.model.parent) {
            this.model.parent.remove(this.model);
            
            if (this.foodObjectManager) {
                this.foodObjectManager.unregisterFoodObject('cheese');
            }
            
            this.isLoaded = false;
            console.log('🧀 Cheese removed from scene');
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.remove();
        this.model = null;
        console.log('🧀 Cheese object disposed');
    }
}

// Make CheeseObject available globally
window.CheeseObject = CheeseObject;
