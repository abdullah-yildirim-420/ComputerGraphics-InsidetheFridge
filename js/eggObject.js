/**
 * Egg Object Module
 * Handles loading and configuration of individual Egg model
 * Represents a single egg object in the fridge
 */
class EggObject {
    constructor(foodObjectManager, modelLoader, eggId = 1) {
        this.foodObjectManager = foodObjectManager;
        this.modelLoader = modelLoader;
        this.egg = null;
        this.eggId = eggId; // Benzersiz ID
        
        // Her yumurta için farklı pozisyon ve rotasyon
        const positions = [
            { x: 46.6, y: 15.25, z: 5 },    // Egg 1
            { x: 44.8, y: 15.25, z: 4.4 },    // Egg 2  
            { x: 45.8, y: 15.25, z: 4.4 },    // Egg 3
            { x: 45.2, y: 15.25, z: -0.9 },  // Egg 4
            { x: 40, y: 15.25, z: 0 }   // Egg 5
        ];
        
        const rotations = [
            Math.PI / 4,   // Egg 1
            Math.PI / 6,   // Egg 2
            Math.PI / 3,   // Egg 3
            Math.PI / 2,   // Egg 4
            -Math.PI / 4   // Egg 5
        ];
          // Egg specific configuration
        this.config = {
            name: `egg${eggId}`,
            path: 'models/egg.glb',
            scale: { x: 0.2, y: 0.2, z: 0.2 }, // Appropriate size for single egg
            position: positions[eggId - 1] || positions[0], // Güvenli pozisyon seçimi
            rotation: { x: 0, y: rotations[eggId - 1] || 0, z: 0 }, // Güvenli rotasyon seçimi
            enableShadows: true,
            processMaterials: true,
            
            materialConfig: {
                changeColors: false, // Preserve original egg colors
                preserveOriginal: true, // Maintain original appearance
                enhanceRealism: true, // Enable realistic material enhancements
                transparency: false,
                shininess: 40,
                roughness: 0.2, // Smooth eggshell texture
                metalness: 0.0, // No metallic properties for eggshell
                aoMapIntensity: 1.0,
                
                // Eggshell material properties
                eggshellProperties: {
                    roughness: 0.15, // Very smooth eggshell
                    metalness: 0.0, // Non-metallic
                    color: 0xFFFEF0, // Off-white egg color
                    normalScale: 0.3, // Subtle normal mapping for shell texture
                    subsurface: 0.05 // Slight subsurface scattering for realism
                },
                
                // Egg interior properties (if visible)
                interiorProperties: {
                    roughness: 0.8, // Rough interior
                    metalness: 0.0,
                    color: 0xFFFBF0, // Slightly warmer white for interior
                    opacity: 0.9
                }
            }
        };
        
        console.log(`Egg Object ${eggId} module initialized`);
    }
    
    /**
     * Load the Egg model
     * @returns {Promise<THREE.Object3D>} The loaded Egg object
     */    async load() {
        try {
            console.log(`🥚 Loading single Egg ${this.eggId} model...`);
            
            // Use optimized loader - it will handle caching automatically
            const eggModel = await this.modelLoader.loadModel(this.config);
            this.egg = eggModel;
            
            console.log(`🥚 Egg ${this.eggId} model loaded from ${this.modelLoader.isModelCached ? this.modelLoader.isModelCached(this.config.path) ? 'CACHE' : 'DISK' : 'LOADER'}`);
            
            // Apply specific material enhancements for egg - but only if not cached
            if (typeof this.modelLoader.isModelCached === 'function' && !this.modelLoader.isModelCached(this.config.path)) {
                console.log(`🎨 Applying fresh material enhancements to Egg ${this.eggId}...`);
                this.enhanceMaterials(eggModel);
            } else {
                console.log(`📦 Using cached materials for Egg ${this.eggId}`);
            }
            
            // Apply environment map if available
            this.applyEnvironmentMap(eggModel);
            
            // Count materials found
            let materialCount = 0;
            eggModel.traverse((object) => {
                if (object.isMesh && object.material) {
                    materialCount++;
                }
            });
            
            console.log(`🥚 MATERIAL ANALYSIS: Found ${materialCount} materials in Egg ${this.eggId}`);
            
            // Register with food object manager
            this.foodObjectManager.registerFoodObject(`egg${this.eggId}`, eggModel, {
                type: 'dairy',
                interactable: true,
                description: `Single egg ${this.eggId}`,
                hasEggshellTexture: true,
                weight: 'light',
                fragile: true,
                isOrganic: true
            });
            
            console.log(`✅ Egg ${this.eggId} loaded and positioned successfully!`);
            console.log(`📍 Egg ${this.eggId} position:`, eggModel.position);
            console.log(`📏 Egg ${this.eggId} scale:`, eggModel.scale);
            
            // Add lighting to highlight the egg
            this.addLightingToEgg(eggModel);
            
            return eggModel;        } catch (error) {
            console.error(`❌ Failed to load Egg ${this.eggId} model:`, error);
            console.log(`🔄 Creating fallback Egg ${this.eggId}...`);
            this.createFallbackEgg();
            // Return the fallback egg instead of throwing
            return this.egg;
        }
    }
    
    /**
     * Enhance materials for realistic egg effects
     * @param {THREE.Object3D} model - The Egg model
     */    enhanceMaterials(model) {
        console.log(`Applying realistic material enhancements to Egg ${this.eggId}...`);
        console.log(`=== EGG ${this.eggId} MODEL ANALYSIS ===`);
        
        // Analyze all materials in the model
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const objectName = object.name ? object.name.toLowerCase() : '';
                const originalColor = object.material.color ? object.material.color.clone() : null;
                const materialType = object.material.type || 'unknown';
                
                console.log(`=== EGG ${this.eggId} MATERIAL FOUND ===`);
                console.log(`Object name: "${object.name}"`);
                console.log(`Material name: "${materialName || 'unnamed'}"`);
                console.log(`Material type: ${materialType}`);
                console.log(`Original color:`, originalColor ? `rgb(${originalColor.r.toFixed(2)}, ${originalColor.g.toFixed(2)}, ${originalColor.b.toFixed(2)})` : 'none');
                console.log(`==============================`);
                
                // Detect material types
                let isEggshell = false;
                let isInterior = false;
                
                // Eggshell detection
                if (this.isEggshellMaterial(materialName, objectName, object.material) ||
                    objectName.includes('shell') ||
                    objectName.includes('egg') ||
                    materialName.includes('shell') ||
                    materialName.includes('egg') ||
                    (originalColor && this.isEggshellColor(originalColor))) {
                    
                    console.log('🥚 EGGSHELL MATERIAL DETECTED!');
                    isEggshell = true;
                    this.enhanceEggshellMaterial(object.material, originalColor);
                    object.renderOrder = 0;
                }
                // Interior detection
                else if (this.isInteriorMaterial(materialName, objectName, object.material) ||
                         objectName.includes('interior') ||
                         objectName.includes('inside') ||
                         materialName.includes('interior') ||
                         materialName.includes('inside')) {
                    
                    console.log('🔳 EGG INTERIOR MATERIAL DETECTED!');
                    isInterior = true;
                    this.enhanceInteriorMaterial(object.material, originalColor);
                    object.renderOrder = 1;
                }
                
                // If nothing was detected, apply eggshell enhancements as default
                if (!isEggshell && !isInterior) {
                    console.log('🥚 DEFAULT - applying eggshell enhancements');
                    this.enhanceEggshellMaterial(object.material, originalColor);
                }
                
                // Enable realistic shadow casting
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        console.log(`=== EGG ${this.eggId} MATERIAL ENHANCEMENT COMPLETED ===`);
    }
    
    /**
     * Check if material is eggshell-related
     */
    isEggshellMaterial(materialName, objectName, material) {
        return materialName.includes('shell') || 
               materialName.includes('egg') ||
               materialName.includes('white') ||
               objectName.includes('shell') ||
               objectName.includes('egg') ||
               materialName.includes('exterior');
    }
    
    /**
     * Check if material is interior-related
     */
    isInteriorMaterial(materialName, objectName, material) {
        return materialName.includes('interior') || 
               materialName.includes('inside') ||
               materialName.includes('yolk') ||
               objectName.includes('interior') ||
               objectName.includes('inside') ||
               materialName.includes('inner');
    }
    
    /**
     * Check if color suggests eggshell (white, cream, light brown)
     */
    isEggshellColor(color) {
        const r = color.r;
        const g = color.g;
        const b = color.b;
        
        // White/cream eggshell colors
        const isWhite = (r > 0.85 && g > 0.85 && b > 0.8);
        // Light brown/beige eggshell colors
        const isLightBrown = (r > 0.7 && g > 0.6 && b > 0.5 && r > g && g > b);
        
        return isWhite || isLightBrown;
    }
    
    /**
     * Enhance eggshell material properties
     */
    enhanceEggshellMaterial(material, originalColor) {
        console.log('🥚 ENHANCING EGGSHELL MATERIAL');
        
        const eggshellConfig = this.config.materialConfig.eggshellProperties;
        
        // Preserve original eggshell color or use default
        if (originalColor && this.isEggshellColor(originalColor)) {
            material.color.copy(originalColor);
        } else {
            material.color.setHex(eggshellConfig.color);
        }
        
        // Eggshell properties
        material.roughness = eggshellConfig.roughness;
        material.metalness = eggshellConfig.metalness;
        material.transparent = false;
        
        // Add slight subsurface scattering for realistic eggshell look
        if (material.transmission !== undefined) {
            material.transmission = eggshellConfig.subsurface;
        }
        
        // Slight variation in eggshell colors for realism
        const variation = 0.98 + Math.random() * 0.04;
        material.color.multiplyScalar(variation);
        
        material.needsUpdate = true;
        
        console.log('🥚 Eggshell material enhanced');
        console.log(`   Color: ${material.color.getHexString()}`);
        console.log(`   Roughness: ${material.roughness}`);
    }
    
    /**
     * Enhance interior material properties
     */
    enhanceInteriorMaterial(material, originalColor) {
        console.log('🔳 ENHANCING EGG INTERIOR MATERIAL');
        
        const interiorConfig = this.config.materialConfig.interiorProperties;
        
        // Preserve original interior color or use default
        if (originalColor) {
            material.color.copy(originalColor);
        } else {
            material.color.setHex(interiorConfig.color);
        }
        
        // Interior properties
        material.roughness = interiorConfig.roughness;
        material.metalness = interiorConfig.metalness;
        material.transparent = false;
        
        // If egg has visible interior, make it slightly translucent
        if (interiorConfig.opacity < 1.0) {
            material.transparent = true;
            material.opacity = interiorConfig.opacity;
        }
        
        material.needsUpdate = true;
        
        console.log('🔳 Egg interior material enhanced');
        console.log(`   Color: ${material.color.getHexString()}`);
        console.log(`   Roughness: ${material.roughness}`);
    }
    
    /**
     * Apply environment mapping to the egg
     */    applyEnvironmentMap(model) {
        if (!window.envMap) {
            console.log(`No environment map available for Egg ${this.eggId}`);
            return;
        }
        
        console.log(`Applying environment map to Egg ${this.eggId} materials...`);
        
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const objectName = object.name ? object.name.toLowerCase() : '';
                
                // Apply subtle environment map to eggshell for realism
                if (this.isEggshellMaterial(materialName, objectName, object.material)) {
                    object.material.envMap = window.envMap;
                    object.material.envMapIntensity = 0.1; // Very subtle reflection for eggshell
                    object.material.needsUpdate = true;
                    console.log('Environment map applied to eggshell material');
                }
            }
        });
    }
    
    /**
     * Add lighting to highlight the egg
     * @param {THREE.Object3D} model - The Egg object
     */
    addLightingToEgg(model) {
        // Create a soft light to highlight the egg
        const spotlight = new THREE.SpotLight(0xffffff, 0.6, 10, Math.PI / 10, 0.5);
        spotlight.position.set(
            model.position.x + 1,
            model.position.y + 2,
            model.position.z + 1
        );
        spotlight.target.position.copy(model.position);
        
        // Enable shadows for the spotlight
        spotlight.castShadow = true;
        spotlight.shadow.camera.near = 0.1;
        spotlight.shadow.camera.far = 10;
        spotlight.shadow.mapSize.width = 256;
        spotlight.shadow.mapSize.height = 256;
        
        // Add to scene
        this.foodObjectManager.scene.add(spotlight);
        this.foodObjectManager.scene.add(spotlight.target);
          console.log(`Lighting added to highlight Egg ${this.eggId}`);
    }
    
    /**
     * Create a fallback egg if model loading fails
     */
    createFallbackEgg() {
        console.log(`Creating fallback Egg ${this.eggId} geometry`);
        
        // Create a simple egg shape using ellipsoid geometry
        const eggGeometry = new THREE.SphereGeometry(0.1, 16, 12);
        const eggMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFEF0, // Off-white eggshell
            roughness: 0.15,
            metalness: 0.0
        });
        
        const egg = new THREE.Mesh(eggGeometry, eggMaterial);
        
        // Make it slightly egg-shaped (more oval)
        egg.scale.set(1, 1.3, 1);
        
        // Position the fallback egg
        egg.position.set(this.config.position.x, this.config.position.y, this.config.position.z);
        egg.scale.multiplyScalar(this.config.scale.x / 15); // Adjust for scale
        egg.rotation.y = this.config.rotation.y;
        
        // Enable shadows
        egg.castShadow = true;
        egg.receiveShadow = true;
          // Add to scene
        this.foodObjectManager.scene.add(egg);
        this.egg = egg;
        
        // Register with food object manager
        this.foodObjectManager.registerFoodObject(`egg${this.eggId}`, egg, {
            type: 'dairy',
            interactable: true,
            description: `Fallback egg ${this.eggId}`,
            hasEggshellTexture: true,
            weight: 'light',
            fragile: true,
            isOrganic: true
        });
        
        console.log(`Fallback Egg ${this.eggId} created and added to scene`);
    }
    
    /**
     * Get the loaded Egg object
     * @returns {THREE.Object3D|null} The Egg object or null if not loaded
     */
    getEgg() {
        return this.egg;
    }
}

// Make EggObject available globally
window.EggObject = EggObject;
