// Model loading and management module - FIXED VERSION

class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.loader = new THREE.GLTFLoader();
        this.loadedModels = new Map();
        
        // Cache sistemi - aynı modeli tekrar yüklemekten kaçın
        this.modelCache = new Map();
        this.loadingPromises = new Map(); // Aynı anda aynı model yüklenmesini engelle
        
        console.log('🚀 ModelLoader initialized with caching system');
    }

    // Load a model with specified configuration - CACHED VERSION
    async loadModel(modelConfig) {
        const cacheKey = modelConfig.path;
        
        // Cache'de var mı kontrol et
        if (this.modelCache.has(cacheKey)) {
            console.log(`📦 Using cached model: ${modelConfig.name} (${modelConfig.path})`);
            const cachedGltf = this.modelCache.get(cacheKey);
            return this.createModelInstance(cachedGltf, modelConfig);
        }
        
        // Zaten yükleniyor mu kontrol et
        if (this.loadingPromises.has(cacheKey)) {
            console.log(`⏳ Waiting for model loading: ${modelConfig.name}`);
            const cachedGltf = await this.loadingPromises.get(cacheKey);
            return this.createModelInstance(cachedGltf, modelConfig);
        }
        
        // Yeni model yükle
        console.log(`🔄 Loading new model: ${modelConfig.name} (${modelConfig.path})`);
        const loadingPromise = this.loadModelFromFile(modelConfig.path);
        this.loadingPromises.set(cacheKey, loadingPromise);
        
        try {
            const gltf = await loadingPromise;
            this.modelCache.set(cacheKey, gltf); // Cache'e kaydet
            this.loadingPromises.delete(cacheKey);
            
            console.log(`✅ Model cached successfully: ${modelConfig.path}`);
            return this.createModelInstance(gltf, modelConfig);
        } catch (error) {
            this.loadingPromises.delete(cacheKey);
            throw error;
        }
    }
    
    // Dosyadan model yükle
    loadModelFromFile(path) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => resolve(gltf),
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(1);
                    console.log(`📈 Loading progress: ${percent}% - ${path}`);
                },
                (error) => {
                    console.error(`❌ Error loading ${path}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    // Cache'den model instance oluştur
    createModelInstance(gltf, modelConfig) {
        console.log(`🔧 Creating instance: ${modelConfig.name}`);
        
        // Orijinal modeli klonla
        const model = gltf.scene.clone();
                    
        // Apply transformations
        if (modelConfig.scale) {
            model.scale.set(modelConfig.scale.x, modelConfig.scale.y, modelConfig.scale.z);
        }
        
        if (modelConfig.position) {
            model.position.set(modelConfig.position.x, modelConfig.position.y, modelConfig.position.z);
        }
        
        if (modelConfig.rotation) {
            model.rotation.set(modelConfig.rotation.x, modelConfig.rotation.y, modelConfig.rotation.z);
        }
        
        // Apply material processing if specified
        if (modelConfig.processMaterials) {
            this.processMaterials(model, modelConfig.materialConfig);
        }
        
        // Enable shadows if specified
        if (modelConfig.enableShadows) {
            this.enableShadows(model);
        }
        
        // Add to scene
        this.scene.add(model);
        
        // Store reference
        this.loadedModels.set(modelConfig.name, model);
        
        return model;
    }

    // Process materials for a model
    processMaterials(model, materialConfig = {}) {
        model.traverse((object) => {
            if (object.isMesh) {
                // Enable shadows
                object.castShadow = true;
                object.receiveShadow = true;
                
                // Process materials
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => this.enhanceMaterial(mat, materialConfig));
                } else {
                    this.enhanceMaterial(object.material, materialConfig);
                }
            }
        });
    }

    // Enhance individual material
    enhanceMaterial(material, config = {}) {
        if (!material) return;
        
        // Update material properties
        material.needsUpdate = true;
        material.side = THREE.DoubleSide;
        
        // Apply color changes if specified
        if (config.changeColors && material.color) {
            this.applyColorChanges(material, config.colorRules);
        }
        
        // Improve material properties
        if (material.shininess !== undefined) {
            material.shininess = config.shininess || 80;
        }
        
        if (material.roughness !== undefined) {
            material.roughness = config.roughness || 0.5;
        }
        
        if (material.metalness !== undefined) {
            material.metalness = config.metalness || 0.6;
        }
        
        if (material.aoMapIntensity !== undefined) {
            material.aoMapIntensity = config.aoMapIntensity || 0.8;
        }
    }

    // Apply color changes based on rules
    applyColorChanges(material, colorRules = []) {
        if (!material.color) return;
        
        const color = material.color;
        console.log('Material color:', color.r, color.g, color.b);
        
        // Apply each color rule
        colorRules.forEach(rule => {
            if (this.matchesColorCondition(color, rule.condition)) {
                console.log(`Applying color rule: ${rule.description}`);
                
                if (rule.newColor) {
                    material.color.setRGB(rule.newColor.r, rule.newColor.g, rule.newColor.b);
                }
                
                if (rule.emissive) {
                    material.emissive.set(rule.emissive.r, rule.emissive.g, rule.emissive.b);
                }
            }
        });
        
        // Default emissive for materials that didn't match any rule
        if (!material.emissive || (material.emissive.r === 0 && material.emissive.g === 0 && material.emissive.b === 0)) {
            material.emissive.set(0.1, 0.1, 0.1);
        }
    }

    // Check if color matches a condition
    matchesColorCondition(color, condition) {
        switch (condition.type) {
            case 'pink':
                return color.r > 0.7 && color.g < 0.7 && color.b < 0.7;
            case 'dark':
                return color.r < 0.2 && color.g < 0.2 && color.b < 0.2;
            case 'custom':
                return condition.check(color);
            default:
                return false;
        }
    }

    // Enable shadows for all meshes in model
    enableShadows(model) {
        model.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

    // Get a loaded model by name
    getModel(name) {
        return this.loadedModels.get(name);
    }

    // Remove a model from scene
    removeModel(name) {
        const model = this.loadedModels.get(name);
        if (model) {
            this.scene.remove(model);
            this.loadedModels.delete(name);
            return true;
        }
        return false;
    }

    // Get all loaded model names
    getLoadedModelNames() {
        return Array.from(this.loadedModels.keys());
    }

    // Cache management methods
    getCachedModel(path) {
        return this.modelCache.get(path);
    }
    
    setCachedModel(path, gltf) {
        this.modelCache.set(path, gltf);
        console.log(`📦 Model cached: ${path}`);
    }
    
    isModelCached(path) {
        return this.modelCache.has(path);
    }
    
    isModelLoading(path) {
        return this.loadingPromises.has(path);
    }
    
    // Create optimized instance from cached model
    createOptimizedInstance(gltf, modelConfig) {
        const model = gltf.scene.clone();
        
        // Apply transformations efficiently
        if (modelConfig.scale) {
            model.scale.set(modelConfig.scale.x, modelConfig.scale.y, modelConfig.scale.z);
        }
        
        if (modelConfig.position) {
            model.position.set(modelConfig.position.x, modelConfig.position.y, modelConfig.position.z);
        }
        
        if (modelConfig.rotation) {
            model.rotation.set(modelConfig.rotation.x, modelConfig.rotation.y, modelConfig.rotation.z);
        }
        
        // Apply material processing if specified (but cached)
        if (modelConfig.processMaterials) {
            this.processMaterials(model, modelConfig.materialConfig);
        }
        
        // Enable shadows if specified
        if (modelConfig.enableShadows) {
            this.enableShadows(model);
        }
        
        // Add to scene
        this.scene.add(model);
        
        // Store reference
        this.loadedModels.set(modelConfig.name, model);
        
        return model;
    }    // Clear cache
    clearCache() {
        this.modelCache.clear();
        this.loadingPromises.clear();
        console.log('🗑️ Model cache cleared');
    }

    // Check if model is cached
    isModelCached(path) {
        return this.modelCache.has(path);
    }

    // Dispose resources
    dispose() {
        this.clearCache();
        this.loadedModels.clear();
        console.log('🗑️ ModelLoader disposed');
    }
}

// Export for global access
window.ModelLoader = ModelLoader;
