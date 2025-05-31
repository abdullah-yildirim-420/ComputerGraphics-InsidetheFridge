/**
 * Banana Crate Object Module
 * Handles loading and configuration of banana crate model
 * Represents a wooden crate of bananas in the fridge
 */
class BananaCrateObject {
    constructor(foodObjectManager, modelLoader) {
        this.foodObjectManager = foodObjectManager;
        this.modelLoader = modelLoader;
        this.bananaCrate = null;
        this.isLoaded = false;
        
        // Banana crate configuration
        this.config = {
            name: 'banana_crate',
            path: 'models/banana_crate.glb',
            scale: { x: 5, y: 5, z: 5 }, // Appropriate size for the crate
            position: { x: 43.5, y: 4, z: 1 }, // Lower shelf position
            rotation: { x: 0, y: -Math.PI / 4, z: 0 }, // Slight rotation for natural look
            enableShadows: true,
            processMaterials: true,
            
            materialConfig: {
                preserveOriginal: true, // Keep original model colors
                enhanceRealism: true,
                
                // Wood crate material properties
                woodProperties: {
                    roughness: 0.9, // Rough wood texture
                    metalness: 0.0,
                    color: 0xA0522D, // Brown wood color
                    emissive: 0x110000, // Very slight warm glow
                    normalScale: 0.8
                },
                
                // Banana material properties
                bananaProperties: {
                    roughness: 0.6, // Textured banana peel
                    metalness: 0.0,
                    color: 0xFFD700, // Golden yellow banana
                    emissive: 0x221100, // Slight warm glow
                    normalScale: 0.6
                }
            }
        };
        
        console.log('🍌 Banana Crate object module initialized');
    }
    
    /**
     * Load the Banana Crate model
     * @returns {Promise<THREE.Object3D>} The loaded Banana Crate object
     */
    async load() {
        if (this.isLoaded) {
            console.log('🍌 Banana Crate already loaded');
            return this.bananaCrate;
        }

        try {
            console.log('🍌 Loading banana crate model...');
            
            const bananaCrateModel = await this.modelLoader.loadModel(this.config);
            this.bananaCrate = bananaCrateModel;
            this.isLoaded = true;
            
            console.log('✅ Banana Crate model loaded successfully');
            console.log(`📦 Banana Crate position: (${bananaCrateModel.position.x}, ${bananaCrateModel.position.y}, ${bananaCrateModel.position.z})`);
            
            // Enhance materials for better visuals
            this.enhanceMaterials(bananaCrateModel);
            
            // Register with food object manager
            this.foodObjectManager.registerFoodObject('banana_crate', bananaCrateModel, {
                type: 'container',
                interactable: true,
                description: 'Wooden crate with fresh bananas',
                weight: 'medium',
                fragile: false,
                isOrganic: true
            });
            
            console.log('✅ Banana Crate loaded and positioned successfully!');
            return bananaCrateModel;
            
        } catch (error) {
            console.error('❌ Failed to load Banana Crate model:', error);
            console.log('🔄 Creating fallback crate...');
            this.createFallbackCrate();
            return this.bananaCrate;
        }
    }
    
    /**
     * Enhance materials for realistic effects
     * @param {THREE.Object3D} model - The Banana Crate model
     */
    enhanceMaterials(model) {
        console.log('Applying realistic material enhancements to Banana Crate...');
        
        // Analyze all materials in the model
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const objectName = object.name ? object.name.toLowerCase() : '';
                
                // Wood crate material detection
                if (materialName.includes('wood') || 
                    materialName.includes('crate') || 
                    objectName.includes('wood') || 
                    objectName.includes('crate') || 
                    objectName.includes('box')) {
                    
                    console.log('🪵 CRATE WOOD MATERIAL DETECTED');
                    this.enhanceWoodMaterial(object.material);
                }
                // Banana material detection
                else if (materialName.includes('banana') || 
                         objectName.includes('banana') ||
                         materialName.includes('yellow') ||
                         materialName.includes('fruit')) {
                    
                    console.log('🍌 BANANA MATERIAL DETECTED');
                    this.enhanceBananaMaterial(object.material);
                }
                // Apply general improvements to any other materials
                else {
                    console.log(`⚪ Applying general material improvements to ${objectName || 'unnamed object'}`);
                    this.enhanceGenericMaterial(object.material);
                }
                
                // Enable realistic shadow casting
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        console.log('✨ Banana Crate material enhancements completed');
    }
    
    /**
     * Enhance wood material properties
     */
    enhanceWoodMaterial(material) {
        const woodProps = this.config.materialConfig.woodProperties;
        
        // Apply wood properties
        material.roughness = woodProps.roughness;
        material.metalness = woodProps.metalness;
        
        // Preserve original color if present, otherwise use defined color
        if (!material.color) {
            material.color = new THREE.Color(woodProps.color);
        }
        
        if (material.emissive) {
            material.emissive.setHex(woodProps.emissive);
        }
        
        material.needsUpdate = true;
    }
    
    /**
     * Enhance banana material properties
     */
    enhanceBananaMaterial(material) {
        const bananaProps = this.config.materialConfig.bananaProperties;
        
        // Apply banana properties
        material.roughness = bananaProps.roughness;
        material.metalness = bananaProps.metalness;
        
        // Preserve original color if present, otherwise use defined color
        if (!material.color) {
            material.color = new THREE.Color(bananaProps.color);
        }
        
        if (material.emissive) {
            material.emissive.setHex(bananaProps.emissive);
        }
        
        material.needsUpdate = true;
    }
    
    /**
     * Apply general material enhancements
     */
    enhanceGenericMaterial(material) {
        // General material improvements
        material.roughness = 0.7;
        material.metalness = 0.1;
        material.needsUpdate = true;
    }
    
    /**
     * Create a fallback crate if model loading fails
     */
    createFallbackCrate() {
        console.log('Creating fallback Banana Crate...');
        
        const group = new THREE.Group();
        
        // Create wooden crate
        const crateGeometry = new THREE.BoxGeometry(1, 0.5, 0.8);
        const crateMaterial = new THREE.MeshStandardMaterial({
            color: 0xA0522D, // Brown
            roughness: 0.9,
            metalness: 0.0
        });
        
        const crate = new THREE.Mesh(crateGeometry, crateMaterial);
        group.add(crate);
        
        // Add some bananas to the crate
        const bananaGeometry = new THREE.CylinderGeometry(0.05, 0.04, 0.4, 8);
        const bananaMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700, // Golden yellow
            roughness: 0.6,
            metalness: 0.0
        });
        
        // Add several bananas in a pattern
        for (let i = 0; i < 8; i++) {
            const banana = new THREE.Mesh(bananaGeometry, bananaMaterial);
            
            // Position bananas in a pattern
            const row = Math.floor(i / 4);
            const col = i % 4;
            banana.position.set(
                -0.3 + col * 0.2,
                0.25 + Math.random() * 0.05,
                -0.2 + row * 0.25
            );
            
            // Rotate each banana slightly differently
            banana.rotation.z = Math.PI / 8 + Math.random() * 0.2;
            banana.rotation.y = Math.random() * Math.PI;
            
            group.add(banana);
        }
        
        // Position the fallback crate according to config
        group.position.set(
            this.config.position.x,
            this.config.position.y, 
            this.config.position.z
        );
        
        group.rotation.set(
            this.config.rotation.x,
            this.config.rotation.y,
            this.config.rotation.z
        );
        
        group.scale.set(
            this.config.scale.x * 2, // Scale up the fallback to be visible
            this.config.scale.y * 2,
            this.config.scale.z * 2
        );
        
        // Add to scene
        this.foodObjectManager.scene.add(group);
        this.bananaCrate = group;
        this.isLoaded = true;
        
        // Register with food object manager
        this.foodObjectManager.registerFoodObject('banana_crate', group, {
            type: 'container',
            interactable: true,
            description: 'Fallback banana crate',
            weight: 'medium',
            fragile: false,
            isOrganic: true
        });
        
        console.log('Fallback Banana Crate created');
    }
    
    /**
     * Get the loaded Banana Crate object
     * @returns {THREE.Object3D|null} The Banana Crate object or null if not loaded
     */
    getBananaCrate() {
        return this.bananaCrate;
    }
    
    /**
     * Check if model is loaded
     * @returns {boolean} True if model is loaded
     */
    isModelLoaded() {
        return this.isLoaded;
    }
    
    /**
     * Remove the Banana Crate from the scene
     */
    remove() {
        if (this.bananaCrate && this.bananaCrate.parent) {
            this.bananaCrate.parent.remove(this.bananaCrate);
            this.foodObjectManager.removeFoodObject('banana_crate');
            this.isLoaded = false;
            console.log('Banana Crate removed from scene');
        }
    }
    
    /**
     * Dispose of resources
     */
    dispose() {
        this.remove();
        this.bananaCrate = null;
        console.log('Banana Crate object disposed');
    }
}

// Make the BananaCrateObject available globally
window.BananaCrateObject = BananaCrateObject;
