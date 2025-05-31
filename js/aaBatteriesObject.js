/**
 * AA Batteries Object Module
 * Handles loading and configuration of AA batteries model
 * Represents a pack of AA batteries in the fridge
 */
class AABatteriesObject {
    constructor(foodObjectManager, modelLoader) {
        this.foodObjectManager = foodObjectManager;
        this.modelLoader = modelLoader;
        this.aaBatteries = null;
        this.isLoaded = false;
        
        // AA batteries configuration
        this.config = {
            name: 'aa_batteries',
            path: 'models/aa_batteries.glb',
            scale: { x: 1.25, y: 1.25, z: 1.25 }, // Appropriate size for batteries
            position: { x: 31, y: 17.5, z: 5.75 }, // Mid-shelf position
            rotation: { x: 0, y: -Math.PI / 6, z: 0 }, // Slight rotation for natural look
            enableShadows: true,
            processMaterials: true,
            
            materialConfig: {
                preserveOriginal: true, // Keep original model colors
                enhanceRealism: true,
                
                // Battery pack material properties
                packProperties: {
                    roughness: 0.7,
                    metalness: 0.0,
                    color: 0x3070B0, // Blue-ish color (typical for battery packs)
                    emissive: 0x000000,
                    normalScale: 0.5
                },
                
                // Battery material properties
                batteryProperties: {
                    roughness: 0.4, // Smoother for plastic
                    metalness: 0.2, // Slight metallic look for terminals
                    color: 0xCCCCCC, // Silver-gray
                    emissive: 0x000000,
                    normalScale: 0.6
                }
            }
        };
        
        console.log('🔋 AA Batteries object module initialized');
    }
    
    /**
     * Load the AA Batteries model
     * @returns {Promise<THREE.Object3D>} The loaded AA Batteries object
     */
    async load() {
        if (this.isLoaded) {
            console.log('🔋 AA Batteries already loaded');
            return this.aaBatteries;
        }

        try {
            console.log('🔋 Loading AA batteries model...');
            
            const aaBatteriesModel = await this.modelLoader.loadModel(this.config);
            this.aaBatteries = aaBatteriesModel;
            this.isLoaded = true;
            
            console.log('✅ AA Batteries model loaded successfully');
            console.log(`📦 AA Batteries position: (${aaBatteriesModel.position.x}, ${aaBatteriesModel.position.y}, ${aaBatteriesModel.position.z})`);
            
            // Enhance materials for better visuals
            this.enhanceMaterials(aaBatteriesModel);
            
            // Register with food object manager
            this.foodObjectManager.registerFoodObject('aa_batteries', aaBatteriesModel, {
                type: 'item',
                interactable: true,
                description: 'Pack of AA batteries',
                weight: 'light',
                fragile: false,
                isOrganic: false
            });
            
            console.log('✅ AA Batteries loaded and positioned successfully!');
            return aaBatteriesModel;
            
        } catch (error) {
            console.error('❌ Failed to load AA Batteries model:', error);
            console.log('🔄 Creating fallback batteries...');
            this.createFallbackBatteries();
            return this.aaBatteries;
        }
    }
    
    /**
     * Enhance materials for realistic effects
     * @param {THREE.Object3D} model - The AA Batteries model
     */
    enhanceMaterials(model) {
        console.log('Applying realistic material enhancements to AA Batteries...');
        
        // Analyze all materials in the model
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const objectName = object.name ? object.name.toLowerCase() : '';
                
                // Pack material detection
                if (materialName.includes('pack') || 
                    materialName.includes('box') || 
                    materialName.includes('cardboard') || 
                    objectName.includes('pack') || 
                    objectName.includes('box') ||
                    objectName.includes('cardboard')) {
                    
                    console.log('📦 BATTERY PACK MATERIAL DETECTED');
                    this.enhancePackMaterial(object.material);
                }
                // Battery material detection
                else if (materialName.includes('battery') || 
                         materialName.includes('metal') ||
                         objectName.includes('battery') ||
                         objectName.includes('metal') ||
                         objectName.includes('cell')) {
                    
                    console.log('🔋 BATTERY MATERIAL DETECTED');
                    this.enhanceBatteryMaterial(object.material);
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
        
        console.log('✨ AA Batteries material enhancements completed');
    }
    
    /**
     * Enhance pack material properties
     */
    enhancePackMaterial(material) {
        const packProps = this.config.materialConfig.packProperties;
        
        // Apply pack properties
        material.roughness = packProps.roughness;
        material.metalness = packProps.metalness;
        
        // Preserve original color if present, otherwise use defined color
        if (!material.color) {
            material.color = new THREE.Color(packProps.color);
        }
        
        if (material.emissive) {
            material.emissive.setHex(packProps.emissive);
        }
        
        material.needsUpdate = true;
    }
    
    /**
     * Enhance battery material properties
     */
    enhanceBatteryMaterial(material) {
        const batteryProps = this.config.materialConfig.batteryProperties;
        
        // Apply battery properties
        material.roughness = batteryProps.roughness;
        material.metalness = batteryProps.metalness;
        
        // Preserve original color if present, otherwise use defined color
        if (!material.color) {
            material.color = new THREE.Color(batteryProps.color);
        }
        
        if (material.emissive) {
            material.emissive.setHex(batteryProps.emissive);
        }
        
        material.needsUpdate = true;
    }
    
    /**
     * Apply general material enhancements
     */
    enhanceGenericMaterial(material) {
        // General material improvements
        material.roughness = 0.6;
        material.metalness = 0.2;
        material.needsUpdate = true;
    }
    
    /**
     * Create fallback batteries if model loading fails
     */
    createFallbackBatteries() {
        console.log('Creating fallback AA Batteries...');
        
        const group = new THREE.Group();
        
        // Create battery pack
        const packGeometry = new THREE.BoxGeometry(0.8, 0.3, 1.2);
        const packMaterial = new THREE.MeshStandardMaterial({
            color: 0x3070B0, // Blue
            roughness: 0.7,
            metalness: 0.0
        });
        
        const pack = new THREE.Mesh(packGeometry, packMaterial);
        group.add(pack);
        
        // Add some individual batteries
        const batteryGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
        const batteryMaterial = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC, // Silver-gray
            roughness: 0.4,
            metalness: 0.2
        });
        
        // Add 4 batteries in a row
        for (let i = 0; i < 4; i++) {
            const battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
            
            // Position batteries in a row
            battery.position.set(
                -0.3 + i * 0.2,
                0.2, // Slightly above the pack
                0
            );
            
            // Rotate to horizontal position
            battery.rotation.z = Math.PI / 2;
            
            group.add(battery);
        }
        
        // Position the fallback batteries according to config
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
            this.config.scale.x,
            this.config.scale.y,
            this.config.scale.z
        );
        
        // Add to scene
        this.foodObjectManager.scene.add(group);
        this.aaBatteries = group;
        this.isLoaded = true;
        
        // Register with food object manager
        this.foodObjectManager.registerFoodObject('aa_batteries', group, {
            type: 'item',
            interactable: true,
            description: 'Fallback AA batteries',
            weight: 'light',
            fragile: false,
            isOrganic: false
        });
        
        console.log('Fallback AA Batteries created');
    }
    
    /**
     * Get the loaded AA Batteries object
     * @returns {THREE.Object3D|null} The AA Batteries object or null if not loaded
     */
    getAABatteries() {
        return this.aaBatteries;
    }
    
    /**
     * Check if model is loaded
     * @returns {boolean} True if model is loaded
     */
    isModelLoaded() {
        return this.isLoaded;
    }
    
    /**
     * Remove the AA Batteries from the scene
     */
    remove() {
        if (this.aaBatteries && this.aaBatteries.parent) {
            this.aaBatteries.parent.remove(this.aaBatteries);
            this.foodObjectManager.removeFoodObject('aa_batteries');
            this.isLoaded = false;
            console.log('AA Batteries removed from scene');
        }
    }
    
    /**
     * Dispose of resources
     */
    dispose() {
        this.remove();
        this.aaBatteries = null;
        console.log('AA Batteries object disposed');
    }
}

// Make the AABatteriesObject available globally
window.AABatteriesObject = AABatteriesObject;
