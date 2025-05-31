/**
 * Banana Object Module
 * Handles loading and configuration of Banana model
 * Optimized for new banana.glb model
 */
class BananaObject {
    constructor(foodObjectManager, modelLoader) {
        this.foodObjectManager = foodObjectManager;
        this.modelLoader = modelLoader;
        this.banana = null;
        this.isLoaded = false;
          // Banana configuration optimized for new model
        this.config = {
            name: 'banana',
            path: 'models/banana.glb',
            scale: { x: 0.02, y: 0.02, z: 0.02 }, // Fixed scale for new model
            position: { x: 42, y: 19.5, z: 1 }, // Middle shelf, good position
            rotation: { x: 0, y: Math.PI / 4, z: 0 }, // Natural angle
            enableShadows: true,
            processMaterials: true,
            
            materialConfig: {
                preserveOriginal: true, // Keep original model colors
                enhanceRealism: true,
                autoDetect: true, // Auto-detect material types
                
                // Enhanced material properties
                defaultProperties: {
                    roughness: 0.4,
                    metalness: 0.0,
                    envMapIntensity: 0.2
                },
                
                // Banana-specific enhancements
                bananaEnhancements: {
                    peelColor: 0xFFD700, // Golden yellow
                    peelRoughness: 0.6,
                    fleshColor: 0xFFF8DC, // Cream white
                    fleshRoughness: 0.3,
                    spotColor: 0x8B4513, // Brown
                    spotRoughness: 0.8
                }
            }
        };
        
        console.log('🍌 Banana Object initialized for new model');
    }
      /**
     * Load the new Banana model
     * @returns {Promise<THREE.Object3D>} The loaded Banana object
     */
    async load() {
        if (this.isLoaded) {
            console.log('🍌 Banana already loaded');
            return this.banana;
        }

        try {
            console.log('🍌 Loading new banana.glb model...');
            
            const bananaModel = await this.modelLoader.loadModel(this.config);            this.banana = bananaModel;
            this.isLoaded = true;
            
            console.log('✅ New banana model loaded successfully');
            console.log(`📦 Banana position: (${bananaModel.position.x}, ${bananaModel.position.y}, ${bananaModel.position.z})`);
            console.log(`📏 Banana scale: (${bananaModel.scale.x}, ${bananaModel.scale.y}, ${bananaModel.scale.z})`);
            console.log('📐 Banana bounding box:', this.getBoundingBoxSize(bananaModel));
            
            // Analyze and enhance materials
            this.analyzeMaterials(bananaModel);
            this.enhanceMaterials(bananaModel);
            
            // Apply environment mapping
            this.applyEnvironmentMap(bananaModel);
            
            // Enable shadows
            this.enableShadows(bananaModel);
            
            // Register with food object manager
            this.foodObjectManager.registerFoodObject('banana', bananaModel, {
                type: 'fruit',
                interactable: true,
                description: 'Fresh ripe banana',
                organic: true,
                weight: 'light',
                nutritious: true
            });
            
            console.log('🍌 Banana successfully integrated into fridge!');
            return bananaModel;
            
        } catch (error) {
            console.error('❌ Failed to load new banana model:', error);
            console.log('🔄 Creating fallback banana...');
            this.createFallbackBanana();
            return this.banana;
        }
    }
      /**
     * Analyze materials in the new banana model
     */
    analyzeMaterials(model) {
        console.log('🔍 Analyzing new banana model materials...');
        
        let materialCount = 0;
        const materials = new Map();
        
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                materialCount++;
                const materialName = object.material.name || `material_${materialCount}`;
                const objectName = object.name || `object_${materialCount}`;
                
                materials.set(materialName, {
                    material: object.material,
                    object: object,
                    originalColor: object.material.color ? object.material.color.clone() : null,
                    type: this.detectMaterialType(materialName, objectName, object.material)
                });
                
                console.log(`📋 Material: "${materialName}" | Object: "${objectName}" | Type: ${materials.get(materialName).type}`);
            }
        });
        
        console.log(`🍌 Found ${materialCount} materials in new banana model`);
        this.materials = materials;
        return materials;
    }
    
    /**
     * Detect material type based on name and properties
     */
    detectMaterialType(materialName, objectName, material) {
        const name = (materialName + ' ' + objectName).toLowerCase();
        
        if (name.includes('peel') || name.includes('skin') || name.includes('yellow')) {
            return 'peel';
        } else if (name.includes('flesh') || name.includes('meat') || name.includes('inside') || name.includes('white')) {
            return 'flesh';
        } else if (name.includes('spot') || name.includes('brown') || name.includes('bruise')) {
            return 'spot';
        } else if (name.includes('stem') || name.includes('tip')) {
            return 'stem';
        }
        
        // Auto-detect by color if available
        if (material.color) {
            const color = material.color;
            if (color.r > 0.7 && color.g > 0.6 && color.b < 0.5) {
                return 'peel'; // Yellow-ish
            } else if (color.r > 0.8 && color.g > 0.8 && color.b > 0.7) {
                return 'flesh'; // White-ish
            } else if (color.r > 0.3 && color.g < 0.3 && color.b < 0.3) {
                return 'spot'; // Brown-ish
            }
        }
        
        return 'general';
    }
    
    /**
     * Enhance materials based on detected types
     */
    enhanceMaterials(model) {
        console.log('✨ Enhancing banana materials...');
        
        if (!this.materials) {
            this.analyzeMaterials(model);
        }
        
        const enhancements = this.config.materialConfig.bananaEnhancements;
        const defaultProps = this.config.materialConfig.defaultProperties;
        
        this.materials.forEach((materialData, materialName) => {
            const { material, type, originalColor } = materialData;
            
            console.log(`🎨 Enhancing ${type} material: ${materialName}`);
            
            switch (type) {
                case 'peel':
                    if (this.config.materialConfig.preserveOriginal && originalColor) {
                        material.color.copy(originalColor);
                        material.color.multiplyScalar(1.1); // Slightly brighter
                    } else {
                        material.color.setHex(enhancements.peelColor);
                    }
                    material.roughness = enhancements.peelRoughness;
                    material.metalness = 0.0;
                    material.emissive.setRGB(0.05, 0.04, 0.01);
                    break;
                    
                case 'flesh':
                    if (this.config.materialConfig.preserveOriginal && originalColor) {
                        material.color.copy(originalColor);
                    } else {
                        material.color.setHex(enhancements.fleshColor);
                    }
                    material.roughness = enhancements.fleshRoughness;
                    material.metalness = 0.0;
                    material.emissive.setRGB(0.02, 0.02, 0.01);
                    break;
                    
                case 'spot':
                    material.color.setHex(enhancements.spotColor);
                    material.roughness = enhancements.spotRoughness;
                    material.metalness = 0.0;
                    material.emissive.setRGB(0.01, 0.005, 0.0);
                    break;
                    
                case 'stem':
                    material.color.setHex(0x8B4513); // Brown
                    material.roughness = 0.8;
                    material.metalness = 0.0;
                    break;
                    
                default:
                    // General enhancements
                    if (originalColor && this.config.materialConfig.preserveOriginal) {
                        material.color.copy(originalColor);
                    }
                    material.roughness = defaultProps.roughness;
                    material.metalness = defaultProps.metalness;
                    break;
            }
            
            material.needsUpdate = true;
        });
        
        console.log('✅ Material enhancements completed');
    }
    
    /**
     * Apply environment mapping for realistic reflections
     */
    applyEnvironmentMap(model) {
        if (!window.envMap) {
            console.log('ℹ️ No environment map available');
            return;
        }
        
        console.log('🌍 Applying environment map to banana...');
        
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                object.material.envMap = window.envMap;
                object.material.envMapIntensity = this.config.materialConfig.defaultProperties.envMapIntensity;
                object.material.needsUpdate = true;
            }
        });
    }
    
    /**
     * Enable shadow casting and receiving
     */
    enableShadows(model) {
        model.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        console.log('🌟 Shadows enabled for banana');
    }
      /**
     * Create fallback banana geometry if model fails to load
     */
    createFallbackBanana() {
        console.log('🔄 Creating fallback banana geometry...');
        
        const group = new THREE.Group();
        
        // Main banana body
        const bodyGeometry = new THREE.CylinderGeometry(0.12, 0.08, 1.0, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            roughness: 0.6,
            metalness: 0.0
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 12; // Slight curve
        group.add(body);
        
        // Banana tip
        const tipGeometry = new THREE.SphereGeometry(0.08, 8, 6);
        tipGeometry.scale(1, 0.6, 1);
        const tip = new THREE.Mesh(tipGeometry, bodyMaterial);
        tip.position.y = -0.5;
        group.add(tip);
        
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.15, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.0
        });
        
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.6;
        group.add(stem);
          // Apply configuration but adjust scale for fallback
        group.position.set(this.config.position.x, this.config.position.y, this.config.position.z);
        // For fallback, we need a different scale since it's a custom geometry
        if (this.config.scale.x < 1) {
            // If using the new small scale for the model, use appropriate fallback scale
            group.scale.set(0.5, 0.5, 0.5);
        } else {
            // Otherwise use config scale
            group.scale.set(this.config.scale.x, this.config.scale.y, this.config.scale.z);
        }
        group.rotation.set(this.config.rotation.x, this.config.rotation.y, this.config.rotation.z);
        
        // Enable shadows
        this.enableShadows(group);
        
        // Add to scene
        this.foodObjectManager.scene.add(group);
        this.banana = group;
        this.isLoaded = false; // Mark as fallback
        
        // Register fallback
        this.foodObjectManager.registerFoodObject('banana', group, {
            type: 'fruit',
            interactable: true,
            description: 'Fallback banana',
            organic: true,
            isFallback: true
        });
        
        console.log('🍌 Fallback banana created and positioned');
    }
    
    /**
     * Update banana position
     */
    setPosition(x, y, z) {
        if (this.banana) {
            this.banana.position.set(x, y, z);
            this.config.position = { x, y, z };
            console.log(`🍌 Banana moved to: (${x}, ${y}, ${z})`);
        }
    }
    
    /**
     * Update banana scale
     */
    setScale(x, y, z) {
        if (this.banana) {
            this.banana.scale.set(x, y, z);
            this.config.scale = { x, y, z };
            console.log(`🍌 Banana scaled to: (${x}, ${y}, ${z})`);
        }
    }
    
    /**
     * Update banana rotation
     */
    setRotation(x, y, z) {
        if (this.banana) {
            this.banana.rotation.set(x, y, z);
            this.config.rotation = { x, y, z };
            console.log(`🍌 Banana rotated to: (${x}, ${y}, ${z})`);
        }
    }
      /**
     * Get the banana object
     */
    getBanana() {
        return this.banana;
    }
    
    /**
     * Calculate bounding box size of the model for debugging
     */
    getBoundingBoxSize(model) {
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        return {
            width: size.x,
            height: size.y,
            depth: size.z,
            volume: size.x * size.y * size.z
        };
    }
    
    /**
     * Check if model is loaded
     */
    isModelLoaded() {
        return this.isLoaded;
    }
    
    /**
     * Get banana configuration
     */
    getConfig() {
        return this.config;
    }
    
    /**
     * Remove banana from scene
     */
    remove() {
        if (this.banana && this.banana.parent) {
            this.banana.parent.remove(this.banana);
            this.foodObjectManager.removeFoodObject('banana');
            this.isLoaded = false;
            console.log('🍌 Banana removed from scene');
        }
    }
    
    /**
     * Dispose of resources
     */
    dispose() {
        this.remove();
        
        if (this.materials) {
            this.materials.forEach((materialData) => {
                if (materialData.material.dispose) {
                    materialData.material.dispose();
                }
            });
            this.materials.clear();
        }
        
        this.banana = null;
        console.log('🍌 Banana object disposed');
    }
}

// Make BananaObject available globally
window.BananaObject = BananaObject;
