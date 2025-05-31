/**
 * Corona Extra Object Module
 * Handles loading and configuration of Corona Extra beer bottle model
 */
class CoronaExtraObject {
    constructor(foodObjectManager, modelLoader) {
        this.foodObjectManager = foodObjectManager;
        this.modelLoader = modelLoader;
        this.coronaExtra = null;
        
        // Corona Extra specific configuration
        this.config = {
            name: 'corona_extra',
            path: 'models/corona_extra.glb',
            scale: { x: 40, y: 40, z: 40 }, // Slightly larger than beer bottle
            position: { x: 31, y: 11.6, z: 7.55 }, // Next to beer bottle (3 units left)
            rotation: { x: 0, y: Math.PI / 4, z: 0 }, // Slight rotation for variety
            enableShadows: true,
            processMaterials: true,
            
            materialConfig: {
                changeColors: false, // Preserve original Corona Extra colors
                preserveOriginal: true, // Maintain original Corona appearance
                enhanceRealism: true, // Enable realistic material enhancements
                transparency: true,
                shininess: 120,
                roughness: 0.04,
                metalness: 0.05,
                aoMapIntensity: 1.2,
                  // Enhanced glass material properties for Corona clear glass (BALANCED)
                glassProperties: {
                    transparent: false,
                    opacity: 0, // Balanced visibility
                    refractionRatio: 0.98,
                    reflectivity: 1, // Reduced for liquid visibility
                    clearcoat: 0.3, // Reduced clearcoat
                    clearcoatRoughness: 0.1
                },
                // Enhanced liquid material properties for Corona beer (BALANCED)
                liquidProperties: {
                    transparent: true,
                    opacity: 0.9, // Balanced liquid visibility
                    roughness: 1,
                    metalness: 1,
                    refractionRatio: 1.33,
                    transmission: 0.1, // Slight transmission for realism
                    thickness: 0.8
                }
            }
        };
        
        console.log('Corona Extra Object module initialized');
    }
    
    /**
     * Load the Corona Extra model
     * @returns {Promise<THREE.Object3D>} The loaded Corona Extra object
     */    async load() {
        try {
            console.log('🍺 Loading Corona Extra model...');
            
            const coronaExtraModel = await this.modelLoader.loadModel(this.config);
            this.coronaExtra = coronaExtraModel;
            
            console.log('📦 Corona Extra model loaded, starting material analysis...');
            
            // Apply specific material enhancements for Corona glass effect
            this.enhanceMaterials(coronaExtraModel);
            
            // Apply environment map to the bottle (use existing envMap if available)
            this.applyEnvironmentMap(coronaExtraModel);
            
            // Count liquid materials found
            let liquidCount = 0;
            coronaExtraModel.traverse((object) => {
                if (object.isMesh && object.material && object.material.userData.isCoronaLiquid) {
                    liquidCount++;
                }
            });
            
            console.log(`🍺 LIQUID DETECTION SUMMARY: Found ${liquidCount} liquid materials in Corona Extra`);
            
            // Register with food object manager
            this.foodObjectManager.registerFoodObject('corona_extra', coronaExtraModel, {
                type: 'beverage',
                interactable: true,
                description: 'Corona Extra clear glass bottle with light beer',
                hasGlassEffect: true,
                weight: 'light',
                brand: 'Corona Extra'
            });
            
            console.log('✅ Corona Extra loaded and positioned successfully!');
            console.log('📍 Corona Extra position:', coronaExtraModel.position);
            console.log('📏 Corona Extra scale:', coronaExtraModel.scale);
            
            // Add a spotlight to highlight the Corona Extra
            this.addSpotlightToCoronaExtra(coronaExtraModel);
            
            return coronaExtraModel;
            
        } catch (error) {
            console.error('❌ Failed to load Corona Extra model:', error);
            console.log('🔄 Creating fallback Corona Extra with visible liquid...');
            this.createFallbackCoronaExtra();
            throw error;
        }
    }
      /**
     * Enhance materials for ultra-realistic Corona glass and liquid effects
     * @param {THREE.Object3D} model - The Corona Extra model
     */
    enhanceMaterials(model) {
        console.log('Applying realistic material enhancements to Corona Extra...');
        console.log('=== CORONA EXTRA MODEL ANALYSIS ===');
        
        // First, let's analyze ALL materials in the model
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                const originalColor = object.material.color ? object.material.color.clone() : null;
                const materialType = object.material.type || 'unknown';
                
                console.log(`=== CORONA MATERIAL FOUND ===`);
                console.log(`Object name: "${object.name}"`);
                console.log(`Material name: "${materialName || 'unnamed'}"`);
                console.log(`Material type: ${materialType}`);
                console.log(`Original color:`, originalColor ? `rgb(${originalColor.r.toFixed(2)}, ${originalColor.g.toFixed(2)}, ${originalColor.b.toFixed(2)})` : 'none');
                console.log(`Transparent: ${object.material.transparent}`);
                console.log(`Opacity: ${object.material.opacity}`);
                console.log(`==============================`);                // Try multiple detection methods for liquid
                let isLiquid = false;
                let isGlass = false;
                let isLabel = false;                // More aggressive liquid detection
                if (this.isLiquidMaterial(materialName, object.material) ||
                    object.name.toLowerCase().includes('liquid') ||
                    object.name.toLowerCase().includes('beer') ||
                    object.name.toLowerCase().includes('content') ||
                    object.name.toLowerCase().includes('fluid') ||
                    materialName.includes('inner') ||
                    materialName.includes('fill') ||
                    (originalColor && this.isLiquidColor(originalColor))) {
                    
                    console.log('🍺 LIQUID MATERIAL DETECTED!');
                    isLiquid = true;
                    this.enhanceLiquidMaterial(object.material, originalColor);
                    this.adjustLiquidLevel(object);
                    // Add render order for proper layering
                    object.renderOrder = 2;
                }
                
                // Glass detection
                else if (this.isGlassMaterial(materialName, object.material) ||
                         object.name.toLowerCase().includes('glass') ||
                         object.name.toLowerCase().includes('bottle') ||
                         (object.material.transparent && object.material.opacity < 0.9)) {
                    
                    console.log('🍃 GLASS MATERIAL DETECTED!');
                    isGlass = true;
                    this.enhanceGlassMaterial(object.material, originalColor);
                    // Glass should render first
                    object.renderOrder = 0;
                }
                
                // Label detection
                else if (this.isLabelMaterial(materialName, object.material) ||
                         object.name.toLowerCase().includes('label') ||
                         object.name.toLowerCase().includes('text') ||
                         (!object.material.transparent || object.material.opacity > 0.9)) {
                    
                    console.log('🏷️ LABEL/CAP MATERIAL DETECTED!');
                    isLabel = true;
                    this.enhanceLabelMaterial(object.material, originalColor);
                    object.renderOrder = 1;
                }                // If nothing was detected, apply general enhancements
                if (!isLiquid && !isGlass && !isLabel) {
                    console.log('❓ UNCLASSIFIED MATERIAL - applying general enhancements');
                    this.applyGeneralEnhancements(object.material, originalColor);
                }
                
                // Enable realistic shadow casting
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        
        console.log('=== CORONA EXTRA MATERIAL ENHANCEMENT COMPLETED ===');
    }    /**
     * Adjust liquid level to create realistic air gap for Corona
     */
    adjustLiquidLevel(liquidObject) {
        if (!liquidObject.geometry) return;
        
        console.log('Adjusting Corona liquid level for realistic appearance...');
        
        // Corona typically has more liquid (fuller bottle)
        liquidObject.scale.y = 0.9; // Reduce height by 10% for smaller air gap
        liquidObject.scale.x = 0.97; // Slightly smaller diameter
        liquidObject.scale.z = 0.97;
        
        // Lower the liquid position slightly
        liquidObject.position.y -= 0.05;
        
        console.log('Corona liquid level adjusted - fuller than regular beer');
    }    /**
     * Check if material is glass-related
     */
    isGlassMaterial(materialName, material) {
        return materialName.includes('glass') || 
               materialName.includes('bottle') ||
               materialName.includes('clear') ||
               materialName.includes('transparent') ||
               (material.transparent && material.opacity < 1.0);
    }
      /**
     * Check if material is liquid-related (enhanced detection)
     */
    isLiquidMaterial(materialName, material) {
        return materialName.includes('liquid') || 
               materialName.includes('beer') ||
               materialName.includes('corona') ||
               materialName.includes('fluid') ||
               materialName.includes('content') ||
               materialName.includes('drink') ||
               materialName.includes('inner') ||
               materialName.includes('fill') ||
               materialName.includes('inside');
    }
    
    /**
     * Check if color suggests liquid (beer colors: golden, amber, etc.)
     */
    isLiquidColor(color) {
        // Check for beer-like colors: golden, amber, yellow, brown tones
        const r = color.r;
        const g = color.g;
        const b = color.b;
        
        // Golden/amber beer colors (high red and green, low blue)
        const isGolden = (r > 0.6 && g > 0.4 && b < 0.4);
        // Brown beer colors
        const isBrown = (r > 0.3 && g > 0.2 && b < 0.2 && r > g && g > b);
        // Light beer colors (high overall but yellow tint)
        const isLightBeer = (r > 0.7 && g > 0.7 && b < 0.6);
        
        return isGolden || isBrown || isLightBeer;
    }    /**
     * Check if material is label/cap related
     */
    isLabelMaterial(materialName, material) {
        return materialName.includes('label') || 
               materialName.includes('text') ||
               materialName.includes('corona') ||
               materialName.includes('extra') ||
               materialName.includes('cap') ||
               materialName.includes('lid') ||
               materialName.includes('logo');
    }
      /**
     * Enhance glass material for Corona's distinctive clear glass (BALANCED VERSION)
     */
    enhanceGlassMaterial(material, originalColor) {
        console.log('🍃 ENHANCING CORONA GLASS MATERIAL - BALANCED VISIBILITY');
        
        const glassConfig = this.config.materialConfig.glassProperties;
        
        // Preserve original Corona glass color if it exists, otherwise use subtle tint
        if (originalColor) {
            material.color.copy(originalColor);
            // Add slight green tint for Corona bottle recognition
            material.color.multiplyScalar(0.95);
            material.color.g *= 1.05; // Slight green tint
        } else {
            // Corona's characteristic very light green glass
            material.color.setHex(0xf0f8f0); // Very light green tint
        }
        
        // BALANCED Corona glass properties - visible but still transparent
        material.transparent = true;
        material.opacity = 0.99; // More visible than before but still transparent
        material.roughness = 2; // Smooth but not perfect
        material.metalness = 2;
        material.refractionRatio = glassConfig.refractionRatio;
        material.reflectivity = 1; // Reduced reflectivity for liquid visibility
        
        // Advanced glass properties for Corona
        if (material.clearcoat !== undefined) {
            material.clearcoat = 1; // Reduced clearcoat for better balance
            material.clearcoatRoughness = 0.1;
        }
        
        // Single sided for better liquid visibility
        material.side = THREE.FrontSide;
        
        // Reduced environment mapping for better liquid visibility
        if (window.envMap) {
            material.envMap = window.envMap;
            material.envMapIntensity = 0.2; // Much lower for balance
        }
        
        material.needsUpdate = true;
        
        console.log('🍃 Corona glass enhanced with BALANCED visibility');
        console.log(`   Glass opacity: ${material.opacity}`);
        console.log(`   Glass color: ${material.color.getHexString()}`);
    }    /**
     * Enhance liquid material for Corona's light beer appearance (BALANCED VERSION)
     */
    enhanceLiquidMaterial(material, originalColor) {
        console.log('🍺 ENHANCING CORONA LIQUID MATERIAL - BALANCED REALISM');
        
        // Corona's distinctive light golden color - visible but realistic
        if (originalColor && this.isLiquidColor(originalColor)) {
            material.color.copy(originalColor);
            material.color.multiplyScalar(1.3); // Enhance original beer color
        } else {
            material.color.setHex(0xF5DEB3); // Corona's wheat/golden color
        }
        
        console.log('✅ Applied Corona golden color for liquid');
        
        // BALANCED liquid properties - visible and realistic
        material.transparent = true;
        material.opacity = 0.9; // Mostly opaque but slightly transparent for realism
        material.roughness = 1; // Smooth liquid surface
        material.metalness = 1;
        material.refractionRatio = 1.33;
        
        // Minimal transmission for realistic liquid look
        if (material.transmission !== undefined) {
            material.transmission = 0.1; // Slight transmission for realism
        }
        if (material.thickness !== undefined) {
            material.thickness = 0.8; // Thick liquid appearance
        }
        
        // Subtle emissive glow for visibility without overdoing it
        material.emissive = new THREE.Color(0x221100);
        material.emissiveIntensity = 0.15; // Moderate glow
        
        // FORCE single sided rendering
        material.side = THREE.FrontSide;
        
        // Subtle environment mapping for realistic liquid reflections
        if (window.envMap) {
            material.envMap = window.envMap;
            material.envMapIntensity = 0.25; // Moderate reflections
        }
        
        // Add special markers
        material.userData.isCoronaLiquid = true;
        material.userData.balancedVisibility = true;
        material.needsUpdate = true;
        
        console.log('🍺 Corona liquid enhanced with BALANCED visibility and realism');
        console.log(`   Liquid color: ${material.color.getHexString()}`);
        console.log(`   Liquid opacity: ${material.opacity}`);
        console.log(`   Emissive: ${material.emissive.getHexString()}`);        console.log(`   EmissiveIntensity: ${material.emissiveIntensity}`);
    }
    
    /**
     * Enhance Corona label/cap materials while preserving brand identity
     */
    enhanceLabelMaterial(material, originalColor) {
        console.log('Enhancing Corona label/cap material while preserving brand identity');
        
        // Preserve Corona's original colors completely
        if (originalColor) {
            material.color.copy(originalColor);
        }
        
        // Corona label properties (premium paper/metallic look)
        material.roughness = 0.7; // Slightly shinier than regular paper
        material.metalness = 0.1;  // Slight metallic sheen for premium look
        material.transparent = false;
        
        // Preserve Corona textures
        if (material.map) {
            material.map.needsUpdate = true;
        }
        
        material.needsUpdate = true;
    }
      /**
     * Apply general enhancements while preserving Corona's original appearance
     * (WITH FORCED LIQUID DETECTION)
     */
    applyGeneralEnhancements(material, originalColor) {
        console.log('🔍 APPLYING GENERAL ENHANCEMENTS WITH LIQUID DETECTION');
        
        // EXTRA LIQUID DETECTION: If this material looks like it could be liquid, force it
        if (originalColor && this.isLiquidColor(originalColor)) {
            console.log('🍺 FOUND POTENTIAL LIQUID BY COLOR - FORCING LIQUID ENHANCEMENT!');
            this.enhanceLiquidMaterial(material, originalColor);
            return;
        }
        
        // Check if this could be a liquid by other properties
        if (material.color && this.isLiquidColor(material.color)) {
            console.log('🍺 FOUND POTENTIAL LIQUID BY CURRENT COLOR - FORCING LIQUID ENHANCEMENT!');
            this.enhanceLiquidMaterial(material, material.color.clone());
            return;
        }
        
        // Preserve Corona's original color identity
        if (originalColor && !material.userData.enhanced) {
            material.color.copy(originalColor);
        }
        
        // General quality improvements
        material.side = material.side || THREE.FrontSide;
        
        // Improve ambient occlusion
        if (material.aoMapIntensity !== undefined) {
            material.aoMapIntensity = this.config.materialConfig.aoMapIntensity;
        }
        
        // Mark as enhanced
        material.userData.enhanced = true;
        material.userData.isCorona = true;
        material.needsUpdate = true;
        
        console.log(`   Applied general enhancements to material with color: ${material.color.getHexString()}`);
    }
    
    /**
     * Create a fallback Corona Extra if model loading fails
     */
    createFallbackCoronaExtra() {
        console.log('Creating realistic fallback Corona Extra geometry');
        
        const group = new THREE.Group();
          // Corona's distinctive clear bottle body - BALANCED VISIBILITY
        const bodyGeometry = new THREE.CylinderGeometry(0.32, 0.32, 1.6, 16); // Corona's straighter profile
        const bodyMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xf0f8f0, // Light green tint for Corona recognition
            transparent: true,
            opacity: 0.35, // More visible but still transparent
            roughness: 0.01, // Smooth but not perfect
            metalness: 0.0,
            transmission: 0.85, // Reduced transmission for better visibility
            thickness: 0.05, // Slightly thicker for visibility
            clearcoat: 0.3, // Reduced clearcoat
            clearcoatRoughness: 0.1,
            refractionRatio: 0.98,
            side: THREE.FrontSide
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.renderOrder = 0;
        group.add(body);
        
        // Corona's distinctive neck
        const neckGeometry = new THREE.CylinderGeometry(0.16, 0.26, 0.35, 12);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.position.y = 1.8;
        group.add(neck);        // Corona's light golden beer - BALANCED VISIBILITY
        const liquidGeometry = new THREE.CylinderGeometry(0.28, 0.28, 1.35, 16);
        const liquidMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xF5DEB3, // Corona's wheat golden color
            transparent: true,
            opacity: 0.85, // Balanced opacity
            roughness: 0.0,
            metalness: 0.0,
            transmission: 0.1, // Slight transmission for realism
            thickness: 0.8,
            refractionRatio: 1.33,
            side: THREE.FrontSide,
            emissive: 0x221100, // Moderate warm glow
            emissiveIntensity: 0.15 // Balanced glow
        });
        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.y = 0.7;
        liquid.renderOrder = 1;
        group.add(liquid);
          // Corona's distinctive foam (minimal amount - just a thin layer on top)
        const foamGeometry = new THREE.CylinderGeometry(0.27, 0.27, 0.04, 16); // Reduced height: 0.06 -> 0.04
        const foamMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFF5, // Very light cream foam
            transparent: true,
            opacity: 0.75, // Reduced opacity for minimal visibility
            roughness: 0.95,
            metalness: 0.0
        });
        const foam = new THREE.Mesh(foamGeometry, foamMaterial);
        foam.position.y = 1.40; // Slightly lower to sit just on liquid surface
        foam.renderOrder = 3; // Render on top
        group.add(foam);
        
        // Corona's cap/closure
        const capGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12);
        const capMaterial = new THREE.MeshStandardMaterial({
            color: 0xDAA520, // Golden cap for Corona
            roughness: 0.6,
            metalness: 0.4
        });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 2.0;
        group.add(cap);
        
        // Position the fallback Corona Extra
        group.position.set(this.config.position.x, this.config.position.y, this.config.position.z);
        group.scale.set(this.config.scale.x, this.config.scale.y, this.config.scale.z);
        group.rotation.y = this.config.rotation.y;
          // Apply environment map if available - balanced reflections
        if (window.envMap) {
            bodyMaterial.envMap = window.envMap;
            bodyMaterial.envMapIntensity = 0.2; // Reduced for balance
            liquidMaterial.envMap = window.envMap;
            liquidMaterial.envMapIntensity = 0.25; // Moderate liquid reflections
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
        this.coronaExtra = group;
        
        console.log('Enhanced realistic fallback Corona Extra created at position:', group.position);
        
        // Register with food object manager
        this.foodObjectManager.registerFoodObject('corona_extra_fallback', group, {
            type: 'beverage',
            interactable: true,
            description: 'Enhanced realistic fallback Corona Extra geometry',
            isFallback: true,
            hasRealisticMaterials: true,
            brand: 'Corona Extra'
        });
    }
    
    /**
     * Add a spotlight to highlight the Corona Extra
     * @param {THREE.Object3D} coronaExtra - The Corona Extra object
     */
    addSpotlightToCoronaExtra(coronaExtra) {
        // Create a spotlight to highlight the Corona Extra
        const spotlight = new THREE.SpotLight(0xfff8dc, 1.3, 18, Math.PI / 7, 0.3); // Warmer light for Corona
        spotlight.position.set(
            coronaExtra.position.x - 1.5,
            coronaExtra.position.y + 2.5,
            coronaExtra.position.z + 1.5
        );
        spotlight.target.position.copy(coronaExtra.position);
        
        // Enable shadows for the spotlight
        spotlight.castShadow = true;
        spotlight.shadow.camera.near = 0.1;
        spotlight.shadow.camera.far = 18;
        spotlight.shadow.mapSize.width = 1024;
        spotlight.shadow.mapSize.height = 1024;
        
        // Add to scene
        this.foodObjectManager.scene.add(spotlight);
        this.foodObjectManager.scene.add(spotlight.target);
        
        console.log('Spotlight added to highlight Corona Extra');
    }
    
    /**
     * Apply environment map to Corona Extra materials
     */
    applyEnvironmentMap(model) {
        if (!window.envMap) {
            console.log('No environment map available for Corona Extra');
            return;
        }
        
        console.log('Applying environment map to Corona Extra materials...');
        
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                const materialName = object.material.name ? object.material.name.toLowerCase() : '';
                
                // Apply environment map to glass materials
                if (this.isGlassMaterial(materialName, object.material)) {
                    object.material.envMap = window.envMap;
                    object.material.envMapIntensity = 0.4; // Corona's premium reflectivity
                    object.material.needsUpdate = true;
                    console.log('Environment map applied to Corona glass material');
                }
                
                // Apply environment map to liquid materials
                else if (this.isLiquidMaterial(materialName, object.material)) {
                    object.material.envMap = window.envMap;
                    object.material.envMapIntensity = 0.35;
                    object.material.needsUpdate = true;
                    console.log('Environment map applied to Corona liquid material');
                }
            }
        });
    }
    
    /**
     * Get the Corona Extra object
     * @returns {THREE.Object3D|null} The Corona Extra object
     */
    getCoronaExtra() {
        return this.coronaExtra;
    }
    
    /**
     * Update Corona Extra (called in animation loop if needed)
     */
    update() {
        if (this.coronaExtra) {
            // Future: Add Corona-specific animations
            // Example: Light refraction effects, condensation, etc.
        }
    }
    
    /**
     * Remove the Corona Extra from scene
     */
    remove() {
        if (this.coronaExtra) {
            this.foodObjectManager.removeFoodObject('corona_extra');
            this.coronaExtra = null;
        }
    }
}

// Export for use in other modules
window.CoronaExtraObject = CoronaExtraObject;
