class EggCartonObject {
    constructor(foodObjectManager, modelLoader) {
        this.foodObjectManager = foodObjectManager;
        this.modelLoader = modelLoader;
        this.eggCarton = null;
          // Egg Carton specific configuration
        this.config = {
            name: 'egg_carton',
            path: 'models/egg_cover_3d_scan.glb',
            scale: { x: 20, y: 20, z: 20 }, // Appropriate size for egg carton
            position: { x: 42, y: 291.5, z: 759.5 }, // Positioned inside fridge near other food objects
            rotation: { x: 0, y: Math.PI , z: 0 }, // Slight rotation for visual appeal
            enableShadows: true,
            processMaterials: true,
            
            materialConfig: {
                changeColors: false, // Preserve original egg carton colors
                preserveOriginal: true, // Maintain original appearance
                enhanceRealism: true, // Enable realistic material enhancements
                transparency: false,
                shininess: 60,
                roughness: 0.7, // Cardboard-like roughness
                metalness: 0.0, // No metallic properties for cardboard
                aoMapIntensity: 1.0,
                
                // Cardboard/paper material properties for egg carton
                cardboardProperties: {
                    roughness: 0.8, // Rough cardboard texture
                    metalness: 0.0, // Non-metallic
                    color: 0xF5E6D3, // Light beige cardboard color
                    normalScale: 0.5 // Subtle normal mapping
                },
                
                // Egg material properties (if eggs are visible)
                eggProperties: {
                    roughness: 0.2, // Smooth eggshell
                    metalness: 0.0,
                    color: 0xFFFEF0, // Off-white egg color
                    subsurface: 0.1 // Slight subsurface scattering for realism
                }
            }
        };
        
        console.log('Egg Carton Object module initialized');
    }
    
    /**
     * Load the Egg Carton model
     * @returns {Promise<THREE.Object3D>} The loaded Egg Carton object
     */
    async load() {
        try {
            console.log('🥚 Loading Egg Carton model...');
            
            const eggCartonModel = await this.modelLoader.loadModel(this.config);
            this.eggCarton = eggCartonModel;
            
            console.log('📦 Egg Carton model loaded, starting material analysis...');
            
            // Apply specific material enhancements for egg carton
            this.enhanceMaterials(eggCartonModel);
            
            // Apply environment map if available
            this.applyEnvironmentMap(eggCartonModel);
            
            // Count materials found
            let materialCount = 0;
            eggCartonModel.traverse((object) => {
                if (object.isMesh && object.material) {
                    materialCount++;
                }
            });
            
            console.log(`🥚 MATERIAL ANALYSIS: Found ${materialCount} materials in Egg Carton`);
            
            // Register with food object manager
            this.foodObjectManager.registerFoodObject('egg_carton', eggCartonModel, {
                type: 'dairy',
                interactable: true,
                description: 'Egg carton with eggs',
                hasCardboardTexture: true,
                weight: 'medium',
                fragile: true
            });
            
            console.log('✅ Egg Carton loaded and positioned successfully!');
            console.log('📍 Egg Carton position:', eggCartonModel.position);
            console.log('📏 Egg Carton scale:', eggCartonModel.scale);
            
            // Add lighting to highlight the egg carton
            this.addLightingToEggCarton(eggCartonModel);
            
            return eggCartonModel;
            
        } catch (error) {
            console.error('❌ Failed to load Egg Carton model:', error);
            console.log('🔄 Creating fallback Egg Carton...');
            this.createFallbackEggCarton();
            throw error;
        }
    }
    
    /**
     * Enhance materials for realistic egg carton and egg effects
     * @param {THREE.Object3D} model - The Egg Carton model
     */
    enhanceMaterials(model) {
        console.log('Applying realistic material enhancements to Egg Carton...');
        console.log('=== EGG CARTON MODEL ANALYSIS ===');
        
        // Analyze all materials in the model
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const objectName = object.name ? object.name.toLowerCase() : '';
                const originalColor = object.material.color ? object.material.color.clone() : null;
                const materialType = object.material.type || 'unknown';
                
                console.log(`=== EGG CARTON MATERIAL FOUND ===`);
                console.log(`Object name: "${object.name}"`);
                console.log(`Material name: "${materialName || 'unnamed'}"`);
                console.log(`Material type: ${materialType}`);
                console.log(`Original color:`, originalColor ? `rgb(${originalColor.r.toFixed(2)}, ${originalColor.g.toFixed(2)}, ${originalColor.b.toFixed(2)})` : 'none');
                console.log(`==============================`);
                
                // Detect material types
                let isCardboard = false;
                let isEgg = false;
                let isLabel = false;
                
                // Cardboard detection
                if (this.isCardboardMaterial(materialName, objectName, object.material) ||
                    objectName.includes('carton') ||
                    objectName.includes('box') ||
                    objectName.includes('package') ||
                    materialName.includes('cardboard') ||
                    materialName.includes('paper')) {
                    
                    console.log('📦 CARDBOARD MATERIAL DETECTED!');
                    isCardboard = true;
                    this.enhanceCardboardMaterial(object.material, originalColor);
                    object.renderOrder = 0;
                }
                // Egg detection
                else if (this.isEggMaterial(materialName, objectName, object.material) ||
                         objectName.includes('egg') ||
                         materialName.includes('egg') ||
                         materialName.includes('shell') ||
                         (originalColor && this.isEggColor(originalColor))) {
                    
                    console.log('🥚 EGG MATERIAL DETECTED!');
                    isEgg = true;
                    this.enhanceEggMaterial(object.material, originalColor);
                    object.renderOrder = 1;
                }
                // Label/text detection
                else if (this.isLabelMaterial(materialName, objectName, object.material) ||
                         objectName.includes('label') ||
                         objectName.includes('text') ||
                         materialName.includes('label')) {
                    
                    console.log('🏷️ LABEL MATERIAL DETECTED!');
                    isLabel = true;
                    this.enhanceLabelMaterial(object.material, originalColor);
                    object.renderOrder = 2;
                }
                
                // If nothing was detected, apply general enhancements
                if (!isCardboard && !isEgg && !isLabel) {
                    console.log('❓ UNCLASSIFIED MATERIAL - applying general enhancements');
                    this.applyGeneralEnhancements(object.material, originalColor);
                }
                
                // Enable realistic shadow casting
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        console.log('=== EGG CARTON MATERIAL ENHANCEMENT COMPLETED ===');
    }
    
    /**
     * Check if material is cardboard-related
     */
    isCardboardMaterial(materialName, objectName, material) {
        return materialName.includes('cardboard') || 
               materialName.includes('paper') ||
               materialName.includes('carton') ||
               materialName.includes('box') ||
               objectName.includes('carton') ||
               objectName.includes('package');
    }
    
    /**
     * Check if material is egg-related
     */
    isEggMaterial(materialName, objectName, material) {
        return materialName.includes('egg') || 
               materialName.includes('shell') ||
               objectName.includes('egg') ||
               materialName.includes('white') ||
               materialName.includes('oval');
    }
    
    /**
     * Check if material is label-related
     */
    isLabelMaterial(materialName, objectName, material) {
        return materialName.includes('label') || 
               materialName.includes('text') ||
               materialName.includes('print') ||
               objectName.includes('label') ||
               materialName.includes('brand');
    }
    
    /**
     * Check if color suggests egg (white, cream, beige)
     */
    isEggColor(color) {
        const r = color.r;
        const g = color.g;
        const b = color.b;
        
        // White/cream egg colors
        const isWhite = (r > 0.85 && g > 0.85 && b > 0.8);
        // Beige/brown egg colors
        const isBeige = (r > 0.7 && g > 0.6 && b > 0.5 && r > g && g > b);
        
        return isWhite || isBeige;
    }
    
    /**
     * Enhance cardboard material properties
     */
    enhanceCardboardMaterial(material, originalColor) {
        console.log('📦 ENHANCING CARDBOARD MATERIAL');
        
        const cardboardConfig = this.config.materialConfig.cardboardProperties;
        
        // Preserve original cardboard color or use default
        if (originalColor) {
            material.color.copy(originalColor);
        } else {
            material.color.setHex(cardboardConfig.color);
        }
        
        // Cardboard material properties
        material.roughness = cardboardConfig.roughness;
        material.metalness = cardboardConfig.metalness;
        material.transparent = false;
        
        // Add slight variation for realism
        material.color.multiplyScalar(0.95 + Math.random() * 0.1);
        
        material.needsUpdate = true;
        
        console.log('📦 Cardboard material enhanced');
        console.log(`   Color: ${material.color.getHexString()}`);
        console.log(`   Roughness: ${material.roughness}`);
    }
    
    /**
     * Enhance egg material properties
     */
    enhanceEggMaterial(material, originalColor) {
        console.log('🥚 ENHANCING EGG MATERIAL');
        
        const eggConfig = this.config.materialConfig.eggProperties;
        
        // Preserve original egg color or use default
        if (originalColor && this.isEggColor(originalColor)) {
            material.color.copy(originalColor);
        } else {
            material.color.setHex(eggConfig.color);
        }
        
        // Egg shell properties
        material.roughness = eggConfig.roughness;
        material.metalness = eggConfig.metalness;
        material.transparent = false;
        
        // Add slight subsurface scattering effect for realism
        if (material.transmission !== undefined) {
            material.transmission = eggConfig.subsurface;
        }
        
        // Slight variation in egg colors for realism
        const variation = 0.95 + Math.random() * 0.1;
        material.color.multiplyScalar(variation);
        
        material.needsUpdate = true;
        
        console.log('🥚 Egg material enhanced');
        console.log(`   Color: ${material.color.getHexString()}`);
        console.log(`   Roughness: ${material.roughness}`);
    }
    
    /**
     * Enhance label material properties
     */
    enhanceLabelMaterial(material, originalColor) {
        console.log('🏷️ ENHANCING LABEL MATERIAL');
        
        // Preserve original label colors
        if (originalColor) {
            material.color.copy(originalColor);
        }
        
        // Label properties (paper/plastic)
        material.roughness = 0.6;
        material.metalness = 0.0;
        material.transparent = false;
        
        // Preserve label textures
        if (material.map) {
            material.map.needsUpdate = true;
        }
        
        material.needsUpdate = true;
        
        console.log('🏷️ Label material enhanced');
    }
    
    /**
     * Apply general enhancements
     */
    applyGeneralEnhancements(material, originalColor) {
        console.log('🔍 APPLYING GENERAL ENHANCEMENTS');
        
        // Preserve original color
        if (originalColor && !material.userData.enhanced) {
            material.color.copy(originalColor);
        }
        
        // General improvements
        material.side = material.side || THREE.FrontSide;
        
        // Improve ambient occlusion
        if (material.aoMapIntensity !== undefined) {
            material.aoMapIntensity = this.config.materialConfig.aoMapIntensity;
        }
        
        // Mark as enhanced
        material.userData.enhanced = true;
        material.userData.isEggCarton = true;
        material.needsUpdate = true;
        
        console.log(`   Applied general enhancements to material with color: ${material.color.getHexString()}`);
    }
    
    /**
     * Apply environment mapping to the egg carton
     */
    applyEnvironmentMap(model) {
        if (!window.envMap) {
            console.log('No environment map available for Egg Carton');
            return;
        }
        
        console.log('Applying environment map to Egg Carton materials...');
        
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const objectName = object.name ? object.name.toLowerCase() : '';
                
                // Apply subtle environment map to egg materials for realism
                if (this.isEggMaterial(materialName, objectName, object.material)) {
                    object.material.envMap = window.envMap;
                    object.material.envMapIntensity = 0.15; // Subtle reflection for eggs
                    object.material.needsUpdate = true;
                    console.log('Environment map applied to egg material');
                }
            }
        });
    }
    
    /**
     * Add lighting to highlight the egg carton
     * @param {THREE.Object3D} model - The Egg Carton object
     */
    addLightingToEggCarton(model) {
        // Create a soft light to highlight the egg carton
        const spotlight = new THREE.SpotLight(0xffffff, 0.8, 15, Math.PI / 8, 0.4);
        spotlight.position.set(
            model.position.x - 2,
            model.position.y + 3,
            model.position.z + 2
        );
        spotlight.target.position.copy(model.position);
        
        // Enable shadows for the spotlight
        spotlight.castShadow = true;
        spotlight.shadow.camera.near = 0.1;
        spotlight.shadow.camera.far = 15;
        spotlight.shadow.mapSize.width = 512;
        spotlight.shadow.mapSize.height = 512;
        
        // Add to scene
        this.foodObjectManager.scene.add(spotlight);
        this.foodObjectManager.scene.add(spotlight.target);
        
        console.log('Lighting added to highlight Egg Carton');
    }
    
    /**
     * Create a fallback egg carton if model loading fails
     */
    createFallbackEggCarton() {
        console.log('Creating fallback Egg Carton geometry');
        
        const group = new THREE.Group();
        
        // Cardboard carton box
        const cartonGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.8);
        const cartonMaterial = new THREE.MeshStandardMaterial({
            color: 0xF5E6D3, // Light beige cardboard
            roughness: 0.8,
            metalness: 0.0
        });
        
        const carton = new THREE.Mesh(cartonGeometry, cartonMaterial);
        carton.position.y = 0.15;
        group.add(carton);
        
        // Create 6 eggs in a 2x3 arrangement
        const eggGeometry = new THREE.SphereGeometry(0.08, 12, 8);
        const eggMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFEF0, // Off-white
            roughness: 0.2,
            metalness: 0.0
        });
        
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
                const egg = new THREE.Mesh(eggGeometry, eggMaterial);
                egg.position.set(
                    -0.25 + (j * 0.25),
                    0.35,
                    -0.15 + (i * 0.3)
                );
                egg.scale.y = 1.2; // Make eggs slightly oval
                group.add(egg);
            }
        }
        
        // Position the fallback egg carton
        group.position.set(this.config.position.x, this.config.position.y, this.config.position.z);
        group.scale.set(this.config.scale.x, this.config.scale.y, this.config.scale.z);
        group.rotation.y = this.config.rotation.y;
        
        // Add to scene
        this.foodObjectManager.scene.add(group);
        this.eggCarton = group;
          console.log('Fallback Egg Carton created and added to scene');
    }
      /**
     * Get the loaded Egg Carton object
     * @returns {THREE.Object3D|null} The Egg Carton object or null if not loaded
     */
    getEggCarton() {
        return this.eggCarton;
    }
}

// Make EggCartonObject available globally
window.EggCartonObject = EggCartonObject;
