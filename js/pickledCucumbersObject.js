/**
 * Pickled Cucumbers Object Module
 * Handles loading and configuration of Pickled Cucumbers jar model
 * Represents a jar of pickled cucumbers in the fridge
 */
class PickledCucumbersObject {
    constructor(foodObjectManager, modelLoader) {
        this.foodObjectManager = foodObjectManager;
        this.modelLoader = modelLoader;
        this.pickledCucumbers = null;
        
        // Pickled Cucumbers specific configuration
        this.config = {
            name: 'pickled_cucumbers',
            path: 'models/pickled_cucumbers.glb',
            scale: { x: 0.5, y: 0.5, z: 0.5 }, // Appropriate size for jar
            position: { x: 72.5, y: 20, z: -6 }, // Middle shelf, back position
            rotation: { x: 0, y: Math.PI / 3, z: 0 }, // Slight rotation for visual appeal
            enableShadows: true,
            processMaterials: true,
            
            materialConfig: {
                changeColors: false, // Preserve original jar colors
                preserveOriginal: true, // Maintain original appearance
                enhanceRealism: true, // Enable realistic material enhancements
                transparency: false,
                shininess: 80,
                roughness: 0.1, // Glass-like smoothness for jar
                metalness: 0.0, // No metallic properties for glass
                aoMapIntensity: 1.0,
                
                // Glass jar material properties
                glassProperties: {
                    roughness: 0.5, // Very smooth glass
                    metalness: 0.1, // Non-metallic
                    color: 0xF8F8FF, // Clear glass tint
                    transparency: true,
                    opacity: 0.85, // Semi-transparent glass
                    normalScale: 0.2 // Subtle normal mapping for glass texture
                },
                
                // Pickle material properties
                pickleProperties: {
                    roughness: 0.4, // Slightly rough pickle surface
                    metalness: 0.0,
                    color: 0x4A6741, // Dark green pickle color
                    emissive: 0x1A2518, // Slight green glow
                    normalScale: 0.6 // Pickle texture detail
                },
                  // Brine/liquid material properties
                brineProperties: {
                    roughness: 0.25, // Smooth liquid
                    metalness: 0.1,
                    color: 0xD4D466, // More visible yellowish brine
                    transparency: true,
                    opacity: 0.9, // Much more opaque
                    normalScale: 0.1,
                    emissive: 0x333311 // Slight glow to make it more visible
                },
                
                // Metal lid properties
                lidProperties: {
                    roughness: 0.3, // Metal lid texture
                    metalness: 0.8, // Metallic lid
                    color: 0xC0C0C0, // Silver metal
                    normalScale: 0.4
                }
            }
        };
        
        console.log('Pickled Cucumbers Object module initialized');
    }
    
    /**
     * Load the Pickled Cucumbers model
     * @returns {Promise<THREE.Object3D>} The loaded Pickled Cucumbers object
     */
    async load() {
        try {
            console.log('🥒 Loading Pickled Cucumbers jar model...');
            
            const pickledCucumbersModel = await this.modelLoader.loadModel(this.config);
            this.pickledCucumbers = pickledCucumbersModel;
            
            console.log('📦 Pickled Cucumbers model loaded, starting material analysis...');
            
            // Apply specific material enhancements for pickled cucumbers jar
            this.enhanceMaterials(pickledCucumbersModel);
            
            // Apply environment map if available
            this.applyEnvironmentMap(pickledCucumbersModel);
            
            // Count materials found
            let materialCount = 0;
            pickledCucumbersModel.traverse((object) => {
                if (object.isMesh && object.material) {
                    materialCount++;
                }
            });
            
            console.log(`🥒 MATERIAL ANALYSIS: Found ${materialCount} materials in Pickled Cucumbers`);
            
            // Register with food object manager
            this.foodObjectManager.registerFoodObject('pickled_cucumbers', pickledCucumbersModel, {
                type: 'vegetable',
                interactable: true,
                description: 'Jar of pickled cucumbers',
                hasGlassTexture: true,
                weight: 'heavy',
                fragile: true,
                isPreserved: true
            });
            
            console.log('✅ Pickled Cucumbers loaded and positioned successfully!');
            console.log('📍 Pickled Cucumbers position:', pickledCucumbersModel.position);
            console.log('📏 Pickled Cucumbers scale:', pickledCucumbersModel.scale);
            
            // Add lighting to highlight the jar
            this.addLightingToPickledCucumbers(pickledCucumbersModel);
            
            return pickledCucumbersModel;
            
        } catch (error) {
            console.error('❌ Failed to load Pickled Cucumbers model:', error);
            console.log('🔄 Creating fallback Pickled Cucumbers...');
            this.createFallbackPickledCucumbers();
            return this.pickledCucumbers;
        }
    }
    
    /**
     * Enhance materials for realistic pickled cucumbers jar effects
     * @param {THREE.Object3D} model - The Pickled Cucumbers model
     */
    enhanceMaterials(model) {
        console.log('Applying realistic material enhancements to Pickled Cucumbers...');
        console.log('=== PICKLED CUCUMBERS MODEL ANALYSIS ===');
        
        // Analyze all materials in the model
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const objectName = object.name ? object.name.toLowerCase() : '';
                const originalColor = object.material.color ? object.material.color.clone() : null;
                const materialType = object.material.type || 'unknown';
                
                console.log(`=== PICKLED CUCUMBERS MATERIAL FOUND ===`);
                console.log(`Object name: "${object.name}"`);
                console.log(`Material name: "${materialName || 'unnamed'}"`);
                console.log(`Material type: ${materialType}`);
                console.log(`Original color:`, originalColor ? `rgb(${originalColor.r.toFixed(2)}, ${originalColor.g.toFixed(2)}, ${originalColor.b.toFixed(2)})` : 'none');
                console.log(`==============================`);
                
                // Detect material types
                let isGlass = false;
                let isPickle = false;
                let isBrine = false;
                let isLid = false;
                
                // Glass jar detection
                if (this.isGlassMaterial(materialName, objectName, object.material) ||
                    objectName.includes('jar') ||
                    objectName.includes('glass') ||
                    materialName.includes('glass') ||
                    materialName.includes('jar') ||
                    (originalColor && this.isGlassColor(originalColor))) {
                    
                    console.log('🫙 GLASS JAR MATERIAL DETECTED!');
                    isGlass = true;
                    this.enhanceGlassMaterial(object.material, originalColor);
                    object.renderOrder = 2;
                }
                // Pickle detection
                else if (this.isPickleMaterial(materialName, objectName, object.material) ||
                         objectName.includes('pickle') ||
                         objectName.includes('cucumber') ||
                         materialName.includes('pickle') ||
                         materialName.includes('cucumber') ||
                         (originalColor && this.isPickleColor(originalColor))) {
                    
                    console.log('🥒 PICKLE MATERIAL DETECTED!');
                    isPickle = true;
                    this.enhancePickleMaterial(object.material, originalColor);
                    object.renderOrder = 0;
                }
                // Brine/liquid detection
                else if (this.isBrineMaterial(materialName, objectName, object.material) ||
                         objectName.includes('brine') ||
                         objectName.includes('liquid') ||
                         objectName.includes('water') ||
                         materialName.includes('brine') ||
                         materialName.includes('liquid')) {
                    
                    console.log('💧 BRINE MATERIAL DETECTED!');
                    isBrine = true;
                    this.enhanceBrineMaterial(object.material, originalColor);
                    object.renderOrder = 1;
                }
                // Lid detection
                else if (this.isLidMaterial(materialName, objectName, object.material) ||
                         objectName.includes('lid') ||
                         objectName.includes('cap') ||
                         objectName.includes('cover') ||
                         materialName.includes('lid') ||
                         materialName.includes('metal')) {
                    
                    console.log('🔗 LID MATERIAL DETECTED!');
                    isLid = true;
                    this.enhanceLidMaterial(object.material, originalColor);
                    object.renderOrder = 3;
                }
                
                // If nothing was detected, apply general enhancements
                if (!isGlass && !isPickle && !isBrine && !isLid) {
                    console.log('❓ UNCLASSIFIED MATERIAL - applying general enhancements');
                    this.applyGeneralEnhancements(object.material, originalColor);
                }
                
                // Enable realistic shadow casting
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        console.log('=== PICKLED CUCUMBERS MATERIAL ENHANCEMENT COMPLETED ===');
    }
    
    /**
     * Check if material is glass-related
     */
    isGlassMaterial(materialName, objectName, material) {
        return materialName.includes('glass') || 
               materialName.includes('jar') ||
               materialName.includes('transparent') ||
               objectName.includes('jar') ||
               objectName.includes('glass');
    }
    
    /**
     * Check if material is pickle-related
     */
    isPickleMaterial(materialName, objectName, material) {
        return materialName.includes('pickle') || 
               materialName.includes('cucumber') ||
               materialName.includes('vegetable') ||
               objectName.includes('pickle') ||
               objectName.includes('cucumber');
    }
    
    /**
     * Check if material is brine-related
     */
    isBrineMaterial(materialName, objectName, material) {
        return materialName.includes('brine') || 
               materialName.includes('liquid') ||
               materialName.includes('water') ||
               objectName.includes('brine') ||
               objectName.includes('liquid');
    }
    
    /**
     * Check if material is lid-related
     */
    isLidMaterial(materialName, objectName, material) {
        return materialName.includes('lid') || 
               materialName.includes('cap') ||
               materialName.includes('metal') ||
               objectName.includes('lid') ||
               objectName.includes('cap');
    }
    
    /**
     * Check if color suggests glass (clear, white, light)
     */
    isGlassColor(color) {
        const r = color.r;
        const g = color.g;
        const b = color.b;
        
        // Clear/white glass colors
        const isClear = (r > 0.8 && g > 0.8 && b > 0.8);
        // Light tinted glass
        const isLightTinted = (r > 0.7 && g > 0.7 && b > 0.6);
        
        return isClear || isLightTinted;
    }
    
    /**
     * Check if color suggests pickle (green)
     */
    isPickleColor(color) {
        const r = color.r;
        const g = color.g;
        const b = color.b;
        
        // Green pickle colors
        return (g > r && g > b && g > 0.3);
    }
    
    /**
     * Enhance glass material properties
     */
    enhanceGlassMaterial(material, originalColor) {
        console.log('🫙 ENHANCING GLASS MATERIAL');
        
        const glassConfig = this.config.materialConfig.glassProperties;
        
        // Glass properties
        material.color.setHex(glassConfig.color);
        material.roughness = glassConfig.roughness;
        material.metalness = glassConfig.metalness;
        material.transparent = glassConfig.transparency;
        material.opacity = glassConfig.opacity;
        
        // Add refraction effect
        if (material.ior !== undefined) {
            material.ior = 1.52; // Glass index of refraction
        }
        
        material.needsUpdate = true;
        
        console.log('🫙 Glass material enhanced');
        console.log(`   Color: ${material.color.getHexString()}`);
        console.log(`   Opacity: ${material.opacity}`);
    }
    
    /**
     * Enhance pickle material properties
     */
    enhancePickleMaterial(material, originalColor) {
        console.log('🥒 ENHANCING PICKLE MATERIAL');
        
        const pickleConfig = this.config.materialConfig.pickleProperties;
        
        // Preserve original pickle color or use default
        if (originalColor && this.isPickleColor(originalColor)) {
            material.color.copy(originalColor);
            // Darken slightly for more realistic look
            material.color.multiplyScalar(0.8);
        } else {
            material.color.setHex(pickleConfig.color);
        }
        
        // Pickle properties
        material.roughness = pickleConfig.roughness;
        material.metalness = pickleConfig.metalness;
        material.emissive.setHex(pickleConfig.emissive);
        material.transparent = false;
        
        material.needsUpdate = true;
        
        console.log('🥒 Pickle material enhanced');
        console.log(`   Color: ${material.color.getHexString()}`);
        console.log(`   Roughness: ${material.roughness}`);
    }
      /**
     * Enhance brine material properties
     */
    enhanceBrineMaterial(material, originalColor) {
        console.log('💧 ENHANCING BRINE MATERIAL');
        
        const brineConfig = this.config.materialConfig.brineProperties;
        
        // Brine properties - more visible
        material.color.setHex(brineConfig.color);
        material.roughness = brineConfig.roughness;
        material.metalness = brineConfig.metalness;
        material.transparent = brineConfig.transparency;
        material.opacity = brineConfig.opacity;
        
        // Add emissive glow for better visibility
        if (brineConfig.emissive) {
            material.emissive.setHex(brineConfig.emissive);
        }
        
        // Ensure the material is visible
        material.side = THREE.DoubleSide; // Visible from both sides
        material.depthWrite = false; // Prevent z-fighting with glass
        
        material.needsUpdate = true;
        
        console.log('💧 Brine material enhanced with increased visibility');
        console.log(`   Color: ${material.color.getHexString()}`);
        console.log(`   Opacity: ${material.opacity}`);
        console.log(`   Emissive: ${material.emissive.getHexString()}`);
    }
    
    /**
     * Enhance lid material properties
     */
    enhanceLidMaterial(material, originalColor) {
        console.log('🔗 ENHANCING LID MATERIAL');
        
        const lidConfig = this.config.materialConfig.lidProperties;
        
        // Preserve original lid color or use default
        if (originalColor) {
            material.color.copy(originalColor);
        } else {
            material.color.setHex(lidConfig.color);
        }
        
        // Metal lid properties
        material.roughness = lidConfig.roughness;
        material.metalness = lidConfig.metalness;
        material.transparent = false;
        
        material.needsUpdate = true;
        
        console.log('🔗 Lid material enhanced');
        console.log(`   Color: ${material.color.getHexString()}`);
        console.log(`   Metalness: ${material.metalness}`);
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
        material.userData.isPickledCucumbers = true;
        material.needsUpdate = true;
        
        console.log(`   Applied general enhancements to material with color: ${material.color.getHexString()}`);
    }
    
    /**
     * Apply environment mapping to the pickled cucumbers jar
     */
    applyEnvironmentMap(model) {
        if (!window.envMap) {
            console.log('No environment map available for Pickled Cucumbers');
            return;
        }
        
        console.log('Applying environment map to Pickled Cucumbers materials...');
        
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const objectName = object.name ? object.name.toLowerCase() : '';
                
                // Apply environment map to glass for realistic reflections
                if (this.isGlassMaterial(materialName, objectName, object.material)) {
                    object.material.envMap = window.envMap;
                    object.material.envMapIntensity = 0.8; // Strong reflection for glass
                    object.material.needsUpdate = true;
                    console.log('Environment map applied to glass material');
                }
                
                // Apply subtle environment map to metal lid
                if (this.isLidMaterial(materialName, objectName, object.material)) {
                    object.material.envMap = window.envMap;
                    object.material.envMapIntensity = 0.6; // Medium reflection for metal
                    object.material.needsUpdate = true;
                    console.log('Environment map applied to lid material');
                }
            }
        });
    }
    
    /**
     * Add lighting to highlight the pickled cucumbers jar
     * @param {THREE.Object3D} model - The Pickled Cucumbers object
     */
    addLightingToPickledCucumbers(model) {
        // Create a soft light to highlight the jar
        const spotlight = new THREE.SpotLight(0xffffff, 0.7, 12, Math.PI / 8, 0.4);
        spotlight.position.set(
            model.position.x - 2,
            model.position.y + 3,
            model.position.z + 2
        );
        spotlight.target.position.copy(model.position);
        
        // Enable shadows for the spotlight
        spotlight.castShadow = true;
        spotlight.shadow.camera.near = 0.1;
        spotlight.shadow.camera.far = 12;
        spotlight.shadow.mapSize.width = 512;
        spotlight.shadow.mapSize.height = 512;
        
        // Add to scene
        this.foodObjectManager.scene.add(spotlight);
        this.foodObjectManager.scene.add(spotlight.target);
        
        console.log('Lighting added to highlight Pickled Cucumbers jar');
    }
    
    /**
     * Create a fallback pickled cucumbers jar if model loading fails
     */
    createFallbackPickledCucumbers() {
        console.log('Creating fallback Pickled Cucumbers geometry');
        
        const group = new THREE.Group();
        
        // Glass jar body
        const jarGeometry = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16);
        const jarMaterial = new THREE.MeshStandardMaterial({
            color: 0xF8F8FF, // Clear glass
            transparent: true,
            opacity: 0.8,
            roughness: 0.05,
            metalness: 0.0
        });
        
        const jar = new THREE.Mesh(jarGeometry, jarMaterial);
        jar.position.y = 0.6;
        group.add(jar);
        
        // Metal lid
        const lidGeometry = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 16);
        const lidMaterial = new THREE.MeshStandardMaterial({
            color: 0xC0C0C0, // Silver metal
            roughness: 0.3,
            metalness: 0.8
        });
        
        const lid = new THREE.Mesh(lidGeometry, lidMaterial);
        lid.position.y = 1.25;
        group.add(lid);
          // Pickles inside jar (simplified)
        for (let i = 0; i < 5; i++) {
            const pickleGeometry = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
            const pickleMaterial = new THREE.MeshStandardMaterial({
                color: 0x4A6741, // Dark green
                roughness: 0.4,
                metalness: 0.0
            });
            
            const pickle = new THREE.Mesh(pickleGeometry, pickleMaterial);
            pickle.position.set(
                (Math.random() - 0.5) * 0.6,
                0.2 + Math.random() * 0.8,
                (Math.random() - 0.5) * 0.6
            );
            pickle.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            group.add(pickle);
        }
        
        // Brine/liquid layer - much more visible
        const brineGeometry = new THREE.CylinderGeometry(0.55, 0.55, 1.1, 16);
        const brineMaterial = new THREE.MeshStandardMaterial({
            color: 0xD4D466, // Yellowish brine - more visible
            transparent: true,
            opacity: 0.85, // Much more opaque
            roughness: 0.1,
            metalness: 0.0,
            emissive: 0x333311, // Slight glow
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        const brine = new THREE.Mesh(brineGeometry, brineMaterial);
        brine.position.y = 0.6;
        group.add(brine);
        
        // Position the fallback jar
        group.position.set(this.config.position.x, this.config.position.y, this.config.position.z);
        group.scale.set(this.config.scale.x, this.config.scale.y, this.config.scale.z);
        group.rotation.y = this.config.rotation.y;
        
        // Add to scene
        this.foodObjectManager.scene.add(group);
        this.pickledCucumbers = group;
        
        // Register with food object manager
        this.foodObjectManager.registerFoodObject('pickled_cucumbers', group, {
            type: 'vegetable',
            interactable: true,
            description: 'Fallback jar of pickled cucumbers',
            hasGlassTexture: true,
            weight: 'heavy',
            fragile: true,
            isPreserved: true
        });
        
        console.log('Fallback Pickled Cucumbers created and added to scene');
    }
    
    /**
     * Get the loaded Pickled Cucumbers object
     * @returns {THREE.Object3D|null} The Pickled Cucumbers object or null if not loaded
     */
    getPickledCucumbers() {
        return this.pickledCucumbers;
    }
}

// Make PickledCucumbersObject available globally
window.PickledCucumbersObject = PickledCucumbersObject;
