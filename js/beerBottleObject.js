/**
 * Beer Bottle Object Module
 * Handles loading and configuration of beer bottle model
 */
class BeerBottleObject {
    constructor(foodObjectManager, modelLoader) {
        this.foodObjectManager = foodObjectManager;
        this.modelLoader = modelLoader;        this.beerBottle = null;
        
        // Beer bottle specific configuration
        this.config = {
            name: 'beer_bottle',
            path: 'models/beer_bottle.glb',
            scale: { x: 0.1, y: 0.1, z: 0.1 }, // Increased size for better visibility
            position: { x: 37, y: 11.6, z: 5.8 }, // Better positioned inside fridge interior
            rotation: { x: 0, y: 0, z: 0 },
            enableShadows: true,
            processMaterials: true,            materialConfig: {
                changeColors: false, // Preserve original beer bottle colors
                preserveOriginal: true, // New flag to maintain original appearance
                enhanceRealism: true, // Enable realistic material enhancements
                transparency: true,
                shininess: 100,
                roughness: 0.05,
                metalness: 0.1,
                aoMapIntensity: 1.0,
                
                // Enhanced glass material properties for better visibility
                glassProperties: {
                    transparent: true,
                    opacity: 0.1, // Much more transparent to clearly see liquid inside
                    refractionRatio: 0.98,
                    reflectivity: 0.2, // Further reduced reflectivity for better liquid visibility
                    clearcoat: 0.5, // Reduced clearcoat for less reflections
                    clearcoatRoughness: 0.2
                },
                // Enhanced liquid material properties
                liquidProperties: {
                    transparent: true,
                    opacity: 0.9,
                    roughness: 0.0,
                    metalness: 0.0,
                    refractionRatio: 1.33, // Water-like refraction
                    transmission: 0.9, // For realistic liquid transmission
                    thickness: 0.5
                }
            }
        };
        
        console.log('Beer Bottle Object module initialized');
    }
    
    /**
     * Load the beer bottle model
     * @returns {Promise<THREE.Object3D>} The loaded beer bottle object
     */
    async load() {
        try {
            console.log('Loading beer bottle model...');
            
            const beerBottleModel = await this.modelLoader.loadModel(this.config);
            this.beerBottle = beerBottleModel;
              // Apply specific material enhancements for glass effect
            this.enhanceMaterials(beerBottleModel);
            
            // Create environment map for realistic reflections
            this.createEnvironmentMap();
            
            // Apply environment map to the bottle
            this.applyEnvironmentMap(beerBottleModel);
              // Register with food object manager
            this.foodObjectManager.registerFoodObject('beer_bottle', beerBottleModel, {
                type: 'beverage',
                interactable: true,
                description: 'Glass beer bottle with liquid inside',
                hasGlassEffect: true,
                weight: 'light' // For future physics
            });
              console.log('Beer bottle loaded and positioned successfully!');
            console.log('Beer bottle position:', beerBottleModel.position);
            console.log('Beer bottle scale:', beerBottleModel.scale);
            
            // Add a spotlight to highlight the beer bottle
            this.addSpotlightToBeerBottle(beerBottleModel);
            
            return beerBottleModel;
            
        } catch (error) {
            console.error('Failed to load beer bottle:', error);
            this.createFallbackBeerBottle();
            throw error;
        }
    }    /**
     * Enhance materials for ultra-realistic glass and liquid effects
     * @param {THREE.Object3D} model - The beer bottle model
     */
    enhanceMaterials(model) {
        console.log('Applying realistic material enhancements to beer bottle...');
        
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const originalColor = object.material.color ? object.material.color.clone() : null;
                
                console.log(`Processing material: ${materialName || 'unnamed'}`);
                
                // Detect and enhance glass parts
                if (this.isGlassMaterial(materialName, object.material)) {
                    this.enhanceGlassMaterial(object.material, originalColor);
                }
                
                // Detect and enhance liquid parts
                else if (this.isLiquidMaterial(materialName, object.material)) {
                    this.enhanceLiquidMaterial(object.material, originalColor);
                    // Adjust liquid level for realism
                    this.adjustLiquidLevel(object);
                }
                
                // Detect and enhance label/cap parts
                else if (this.isLabelMaterial(materialName, object.material)) {
                    this.enhanceLabelMaterial(object.material, originalColor);
                }
                
                // Apply general enhancements while preserving original look
                this.applyGeneralEnhancements(object.material, originalColor);
                
                // Enable realistic shadow casting
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        console.log('Material enhancement completed - beer bottle should now look more realistic!');
    }
    
    /**
     * Adjust liquid level to create realistic air gap
     */
    adjustLiquidLevel(liquidObject) {
        if (!liquidObject.geometry) return;
        
        console.log('Adjusting liquid level for realistic appearance...');
        
        // Scale down the liquid slightly to create air gap
        liquidObject.scale.y = 0.85; // Reduce height by 15% for air gap
        liquidObject.scale.x = 0.95; // Slightly smaller diameter for gap between glass
        liquidObject.scale.z = 0.95;
        
        // Lower the liquid position slightly
        liquidObject.position.y -= 0.1;
        
        console.log('Liquid level adjusted - now shows realistic air gap');
    }
    
    /**
     * Check if material is glass-related
     */
    isGlassMaterial(materialName, material) {
        return materialName.includes('glass') || 
               materialName.includes('bottle') ||
               materialName.includes('transparent') ||
               (material.transparent && material.opacity < 1.0);
    }
    
    /**
     * Check if material is liquid-related
     */
    isLiquidMaterial(materialName, material) {
        return materialName.includes('liquid') || 
               materialName.includes('beer') ||
               materialName.includes('fluid') ||
               materialName.includes('content') ||
               materialName.includes('drink');
    }
    
    /**
     * Check if material is label/cap related
     */
    isLabelMaterial(materialName, material) {
        return materialName.includes('label') || 
               materialName.includes('text') ||
               materialName.includes('cap') ||
               materialName.includes('lid') ||
               materialName.includes('logo');
    }
    
    /**
     * Enhance glass material for ultra-realism
     */
    enhanceGlassMaterial(material, originalColor) {
        console.log('Enhancing glass material for ultra-realism');
        
        const glassConfig = this.config.materialConfig.glassProperties;
        
        // Preserve original color if it exists
        if (originalColor) {
            material.color.copy(originalColor);
        }        // Ultra-realistic glass properties with much better transparency
        material.transparent = true;
        material.opacity = 0.1; // Much more transparent to clearly see liquid inside
        material.roughness = 0.01; // Even smoother glass for crystal clarity
        material.metalness = 0.0;  // Glass is not metallic
        material.refractionRatio = glassConfig.refractionRatio;
        material.reflectivity = 0.2; // Further reduced reflectivity for better liquid visibility
        
        // Advanced glass properties (if supported)
        if (material.clearcoat !== undefined) {
            material.clearcoat = glassConfig.clearcoat;
            material.clearcoatRoughness = glassConfig.clearcoatRoughness;
        }
          // Fresnel effect for realistic glass
        material.side = THREE.FrontSide; // Single sided for better liquid visibility
          // Environment mapping for subtle reflections only
        if (window.envMap) {
            material.envMap = window.envMap;
            material.envMapIntensity = 0.3; // Much lower for better liquid visibility
        }
        
        material.needsUpdate = true;
    }
      /**
     * Enhance liquid material for ultra-realism
     */
    enhanceLiquidMaterial(material, originalColor) {
        console.log('Enhancing liquid material for ultra-realism');
        
        const liquidConfig = this.config.materialConfig.liquidProperties;
        
        // Preserve or enhance the original liquid color
        if (originalColor) {
            // Enhance the original color slightly for better visibility
            material.color.copy(originalColor);
            material.color.multiplyScalar(1.2); // More vibrant for better liquid appearance
        } else {
            // Default realistic beer color with golden amber tones
            material.color.setHex(0xE6B84D); // Richer golden beer color
        }
        
        // Ultra-realistic liquid properties
        material.transparent = true;
        material.opacity = 0.95; // More opaque for better liquid visibility
        material.roughness = 0.0; // Perfectly smooth liquid surface
        material.metalness = 0.0;
        material.refractionRatio = 1.33; // Beer/liquid refraction
        
        // Advanced liquid properties for realism
        if (material.transmission !== undefined) {
            material.transmission = 0.85; // Slightly less transmission for more visible liquid
        }
        if (material.thickness !== undefined) {
            material.thickness = 0.8; // Thicker appearance for liquid volume
        }
        
        // Add subtle foam/bubbles effect at the top
        if (material.emissive !== undefined) {
            material.emissive.setHex(0x111111); // Very subtle inner glow
        }
        
        // Liquid surface properties
        material.side = THREE.FrontSide; // Only front faces for proper liquid rendering
        
        // Environment mapping for realistic liquid reflections
        if (window.envMap) {
            material.envMap = window.envMap;
            material.envMapIntensity = 0.4; // More visible reflections on liquid surface
        }
        
        // Mark material as liquid for special handling
        material.userData.isLiquid = true;
        material.needsUpdate = true;
    }
    
    /**
     * Enhance label/cap materials while preserving original appearance
     */
    enhanceLabelMaterial(material, originalColor) {
        console.log('Enhancing label/cap material while preserving original look');
        
        // Preserve original color completely
        if (originalColor) {
            material.color.copy(originalColor);
        }
        
        // Realistic label/paper properties
        material.roughness = 0.9; // Paper-like roughness
        material.metalness = 0.0;  // Non-metallic
        material.transparent = false; // Labels are usually opaque
        
        // Preserve any existing textures
        if (material.map) {
            material.map.needsUpdate = true;
        }
        
        material.needsUpdate = true;
    }
    
    /**
     * Apply general enhancements while preserving original appearance
     */
    applyGeneralEnhancements(material, originalColor) {
        // Preserve original color if no specific enhancement was applied
        if (originalColor && !material.userData.enhanced) {
            material.color.copy(originalColor);
        }
        
        // General quality improvements
        material.side = material.side || THREE.FrontSide;
        
        // Improve ambient occlusion if supported
        if (material.aoMapIntensity !== undefined) {
            material.aoMapIntensity = this.config.materialConfig.aoMapIntensity;
        }
        
        // Mark as enhanced
        material.userData.enhanced = true;
        material.needsUpdate = true;
    }
      /**
     * Create a fallback beer bottle if model loading fails
     */
    createFallbackBeerBottle() {
        console.log('Creating realistic fallback beer bottle geometry');
        
        const group = new THREE.Group();
          // Enhanced bottle body with crystal-clear glass material
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.35, 1.5, 16);        const bodyMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x88aa88, // Much lighter green glass - almost clear
            transparent: true,
            opacity: 0.1, // Ultra transparent to match config
            roughness: 0.01, // Crystal clear glass
            metalness: 0.0,
            transmission: 0.98, // Maximum transmission for see-through effect
            thickness: 0.02, // Thinner glass appearance
            clearcoat: 0.1, // Minimal clearcoat to reduce reflections
            clearcoatRoughness: 0.05,
            refractionRatio: 0.98,
            side: THREE.FrontSide // Single sided for better rendering
        });        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.renderOrder = 0; // Render glass first
        group.add(body);
        
        // Enhanced bottle neck
        const neckGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.4, 12);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.position.y = 1.7;
        group.add(neck);        // Enhanced beer liquid with realistic properties and proper level
        const liquidGeometry = new THREE.CylinderGeometry(0.26, 0.30, 1.2, 16); // Bigger and taller for visibility
        const liquidMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xFFD700, // Brighter golden color for better visibility
            transparent: true,
            opacity: 1.0, // Completely opaque liquid
            roughness: 0.0,
            metalness: 0.0,
            transmission: 0.0, // No transmission - solid liquid
            thickness: 1.0,
            refractionRatio: 1.33,
            side: THREE.FrontSide, // Only front faces for proper liquid
            emissive: 0x332200, // Slight glow for visibility
            emissiveIntensity: 0.1
        });
        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.y = 0.6; // Higher position for better visibility
        liquid.renderOrder = 1; // Render after glass
        group.add(liquid);
        
        // Add foam layer at the top of the beer for realism
        const foamGeometry = new THREE.CylinderGeometry(0.23, 0.23, 0.08, 16);
        const foamMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFF8DC, // Cream white foam color
            transparent: true,
            opacity: 0.9,
            roughness: 0.8,
            metalness: 0.0
        });
        const foam = new THREE.Mesh(foamGeometry, foamMaterial);
        foam.position.y = 1.04; // Just above the liquid level
        group.add(foam);
        
        // Add a bottle cap
        const capGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12);
        const capMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.2
        });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 1.95;
        group.add(cap);
        
        // Position the fallback bottle
        group.position.set(this.config.position.x, this.config.position.y, this.config.position.z);
        group.scale.set(this.config.scale.x, this.config.scale.y, this.config.scale.z);        // Apply environment map if available with reduced intensity
        if (window.envMap) {
            bodyMaterial.envMap = window.envMap;
            bodyMaterial.envMapIntensity = 0.3; // Much lower for crystal clear effect
            liquidMaterial.envMap = window.envMap;
            liquidMaterial.envMapIntensity = 0.4; // More visible reflections on liquid
            // Don't apply env map to foam for realistic matte foam appearance
        }
        
        // Enable shadows
        group.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                object.material.needsUpdate = true;
            }
        });
        
        // Add to scene
        this.modelLoader.scene.add(group);
        this.beerBottle = group;
        
        console.log('Enhanced realistic fallback beer bottle created at position:', group.position);
        console.log('Fallback beer bottle scale:', group.scale);
        
        // Register with food object manager
        this.foodObjectManager.registerFoodObject('beer_bottle_fallback', group, {
            type: 'beverage',
            interactable: true,
            description: 'Enhanced realistic fallback beer bottle geometry',
            isFallback: true,
            hasRealisticMaterials: true
        });
    }
    
    /**
     * Add a spotlight to highlight the beer bottle
     * @param {THREE.Object3D} beerBottle - The beer bottle object
     */
    addSpotlightToBeerBottle(beerBottle) {
        // Create a spotlight to highlight the beer bottle
        const spotlight = new THREE.SpotLight(0xffffff, 1.5, 20, Math.PI / 6, 0.25);
        spotlight.position.set(
            beerBottle.position.x + 2,
            beerBottle.position.y + 3,
            beerBottle.position.z + 2
        );
        spotlight.target.position.copy(beerBottle.position);
        
        // Enable shadows for the spotlight
        spotlight.castShadow = true;
        spotlight.shadow.camera.near = 0.1;
        spotlight.shadow.camera.far = 20;
        spotlight.shadow.mapSize.width = 1024;
        spotlight.shadow.mapSize.height = 1024;
        
        // Add to scene
        this.foodObjectManager.scene.add(spotlight);
        this.foodObjectManager.scene.add(spotlight.target);
        
        console.log('Spotlight added to highlight beer bottle');
    }
    
    /**
     * Get the beer bottle object
     * @returns {THREE.Object3D|null} The beer bottle object
     */
    getBeerBottle() {
        return this.beerBottle;
    }
    
    /**
     * Update beer bottle (called in animation loop if needed)
     */
    update() {
        if (this.beerBottle) {
            // Future: Add bottle-specific animations
            // Example: Liquid sloshing, condensation effects, etc.
        }
    }
      /**
     * Remove the beer bottle from scene
     */
    remove() {
        if (this.beerBottle) {
            this.foodObjectManager.removeFoodObject('beer_bottle');
            this.beerBottle = null;
        }
    }
    
    /**
     * Create environment map for realistic reflections
     */
    createEnvironmentMap() {
        if (window.envMap) {
            console.log('Environment map already exists');
            return;
        }
        
        console.log('Creating environment map for realistic reflections...');
        
        // Create a cube render target for environment mapping
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        });
        
        // Create cube camera for environment mapping
        const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
        
        // Create a simple environment scene
        const envScene = new THREE.Scene();
        
        // Add gradient background
        const gradientTexture = this.createGradientTexture();
        envScene.background = gradientTexture;
        
        // Add some basic geometry for reflections
        this.addEnvironmentGeometry(envScene);
        
        // Store globally for use
        window.envMap = cubeRenderTarget.texture;
        window.cubeCamera = cubeCamera;
        window.envScene = envScene;
        
        console.log('Environment map created successfully');
    }
    
    /**
     * Create gradient texture for environment background
     */
    createGradientTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Create gradient
        const gradient = context.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.5, '#FFFFFF'); // White
        gradient.addColorStop(1, '#F0F0F0'); // Light gray
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 256, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }
    
    /**
     * Add basic geometry to environment scene for reflections
     */
    addEnvironmentGeometry(envScene) {
        // Add some basic shapes that will create interesting reflections
        
        // Floor plane
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc,
            roughness: 0.8 
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -5;
        envScene.add(floor);
        
        // Some ambient light for the environment
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        envScene.add(ambientLight);
        
        // Directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 10, 5);
        envScene.add(dirLight);
    }
    
    /**
     * Apply environment map to beer bottle materials
     */
    applyEnvironmentMap(model) {
        if (!window.envMap) {
            console.log('No environment map available');
            return;
        }
        
        console.log('Applying environment map to beer bottle materials...');
        
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                  // Apply environment map to glass materials with reduced intensity
                if (this.isGlassMaterial(materialName, object.material)) {
                    object.material.envMap = window.envMap;
                    object.material.envMapIntensity = 0.3; // Much lower for better liquid visibility
                    object.material.needsUpdate = true;
                    console.log('Environment map applied to glass material');
                }
                
                // Apply subtle environment map to liquid materials
                else if (this.isLiquidMaterial(materialName, object.material)) {
                    object.material.envMap = window.envMap;
                    object.material.envMapIntensity = 0.3;
                    object.material.needsUpdate = true;
                    console.log('Environment map applied to liquid material');
                }
            }
        });
    }
}

// Export for use in other modules
window.BeerBottleObject = BeerBottleObject;
