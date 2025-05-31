// Optimized Model Loading with Caching System
// Prevents app freezing and reduces memory usage

class OptimizedModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.loader = new THREE.GLTFLoader();
        this.loadedModels = new Map();
        
        // Advanced caching system
        this.modelCache = new Map(); // Stores original GLTF data
        this.loadingPromises = new Map(); // Prevents duplicate loading
        this.instanceCache = new Map(); // Stores processed instances
        
        // Performance tracking
        this.loadingStats = {
            totalLoads: 0,
            cacheHits: 0,
            loadingTime: 0
        };
        
        console.log('🚀 OptimizedModelLoader initialized with advanced caching');
    }

    // Main loading method with caching
    async loadModel(modelConfig) {
        const startTime = performance.now();
        const cacheKey = modelConfig.path;
        
        this.loadingStats.totalLoads++;
        
        try {
            let model;
            
            // Check cache first
            if (this.modelCache.has(cacheKey)) {
                console.log(`📦 Cache HIT: ${modelConfig.name}`);
                this.loadingStats.cacheHits++;
                const cachedGltf = this.modelCache.get(cacheKey);
                model = await this.createInstance(cachedGltf, modelConfig);
            }
            // Check if already loading
            else if (this.loadingPromises.has(cacheKey)) {
                console.log(`⏳ Waiting for: ${modelConfig.name}`);
                const gltf = await this.loadingPromises.get(cacheKey);
                model = await this.createInstance(gltf, modelConfig);
            }
            // Load new model
            else {
                console.log(`🔄 Loading NEW: ${modelConfig.name}`);
                const gltf = await this.loadModelFromDisk(modelConfig);
                model = await this.createInstance(gltf, modelConfig);
            }
            
            const loadTime = performance.now() - startTime;
            this.loadingStats.loadingTime += loadTime;
            
            console.log(`✅ ${modelConfig.name} loaded in ${loadTime.toFixed(2)}ms`);
            return model;
            
        } catch (error) {
            console.error(`❌ Failed to load ${modelConfig.name}:`, error);
            throw error;
        }
    }

    // Load model from disk with progress tracking
    async loadModelFromDisk(modelConfig) {
        const cacheKey = modelConfig.path;
        
        const loadingPromise = new Promise((resolve, reject) => {
            this.loader.load(
                modelConfig.path,
                (gltf) => {
                    // Cache the original GLTF
                    this.modelCache.set(cacheKey, gltf);
                    console.log(`💾 Cached: ${modelConfig.path}`);
                    resolve(gltf);
                },
                (progress) => {
                    if (progress.total > 0) {
                        const percent = ((progress.loaded / progress.total) * 100).toFixed(1);
                        console.log(`📈 ${modelConfig.name}: ${percent}%`);
                    }
                },
                (error) => {
                    console.error(`❌ Loading error for ${modelConfig.path}:`, error);
                    reject(error);
                }
            );
        });
        
        this.loadingPromises.set(cacheKey, loadingPromise);
        
        try {
            const gltf = await loadingPromise;
            this.loadingPromises.delete(cacheKey);
            return gltf;
        } catch (error) {
            this.loadingPromises.delete(cacheKey);
            throw error;
        }
    }

    // Create optimized instance from cached GLTF
    async createInstance(gltf, modelConfig) {
        // Clone the scene efficiently
        const model = gltf.scene.clone();
        
        // Apply transformations
        if (modelConfig.scale) {
            model.scale.set(
                modelConfig.scale.x, 
                modelConfig.scale.y, 
                modelConfig.scale.z
            );
        }
        
        if (modelConfig.position) {
            model.position.set(
                modelConfig.position.x, 
                modelConfig.position.y, 
                modelConfig.position.z
            );
        }
        
        if (modelConfig.rotation) {
            model.rotation.set(
                modelConfig.rotation.x, 
                modelConfig.rotation.y, 
                modelConfig.rotation.z
            );
        }
        
        // Process materials in batches to prevent freezing
        if (modelConfig.processMaterials) {
            await this.processMaterialsAsync(model, modelConfig.materialConfig);
        }
        
        // Enable shadows if specified
        if (modelConfig.enableShadows) {
            this.enableShadowsOptimized(model);
        }
        
        // Add to scene
        this.scene.add(model);
        
        // Store reference
        this.loadedModels.set(modelConfig.name, model);
        
        return model;
    }

    // Async material processing to prevent freezing
    async processMaterialsAsync(model, materialConfig = {}) {
        const materials = [];
        
        // Collect all materials first
        model.traverse((object) => {
            if (object.isMesh && object.material) {
                materials.push(object.material);
            }
        });
        
        console.log(`🎨 Processing ${materials.length} materials...`);
        
        // Process materials in batches
        const batchSize = 5;
        for (let i = 0; i < materials.length; i += batchSize) {
            const batch = materials.slice(i, i + batchSize);
            
            batch.forEach(material => {
                this.processSingleMaterial(material, materialConfig);
            });
            
            // Yield control every batch to prevent freezing
            if (i % batchSize === 0) {
                await this.yieldControl();
            }
        }
        
        console.log(`✅ Materials processed successfully`);
    }

    // Process single material with optimizations
    processSingleMaterial(material, config = {}) {
        // Apply material enhancements efficiently
        if (config.enhanceRealism) {
            if (material.roughness !== undefined) {
                material.roughness = config.roughness || material.roughness;
            }
            if (material.metalness !== undefined) {
                material.metalness = config.metalness || material.metalness;
            }
            if (material.aoMapIntensity !== undefined) {
                material.aoMapIntensity = config.aoMapIntensity || 1.0;
            }
        }
        
        // Apply shininess if specified
        if (config.shininess !== undefined && material.shininess !== undefined) {
            material.shininess = config.shininess;
        }
        
        material.needsUpdate = true;
    }

    // Optimized shadow enabling
    enableShadowsOptimized(model) {
        const meshes = [];
        
        model.traverse((object) => {
            if (object.isMesh) {
                meshes.push(object);
            }
        });
        
        // Enable shadows in batches
        meshes.forEach((mesh, index) => {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        });
    }

    // Yield control to prevent freezing
    async yieldControl() {
        return new Promise(resolve => {
            setTimeout(resolve, 1);
        });
    }

    // Progressive loading for multiple models
    async loadModelsProgressively(modelConfigs, onProgress = null) {
        const results = [];
        const total = modelConfigs.length;
        
        console.log(`🔄 Starting progressive loading of ${total} models...`);
        
        for (let i = 0; i < total; i++) {
            const config = modelConfigs[i];
            
            try {
                const model = await this.loadModel(config);
                results.push(model);
                
                if (onProgress) {
                    onProgress({
                        current: i + 1,
                        total: total,
                        progress: ((i + 1) / total) * 100,
                        modelName: config.name
                    });
                }
                
                // Yield after each model to prevent freezing
                await this.yieldControl();
                
            } catch (error) {
                console.error(`❌ Failed to load ${config.name}:`, error);
                results.push(null);
            }
        }
        
        console.log(`✅ Progressive loading completed`);
        return results;
    }

    // Get cache statistics
    getCacheStats() {
        const hitRate = this.loadingStats.totalLoads > 0 
            ? (this.loadingStats.cacheHits / this.loadingStats.totalLoads * 100).toFixed(1)
            : 0;
            
        return {
            totalLoads: this.loadingStats.totalLoads,
            cacheHits: this.loadingStats.cacheHits,
            hitRate: `${hitRate}%`,
            averageLoadTime: this.loadingStats.totalLoads > 0 
                ? (this.loadingStats.loadingTime / this.loadingStats.totalLoads).toFixed(2)
                : 0,
            cachedModels: this.modelCache.size
        };
    }

    // Clear cache if needed
    clearCache() {
        this.modelCache.clear();
        this.instanceCache.clear();
        this.loadingPromises.clear();
        console.log('🗑️ Model cache cleared');
    }

    // Dispose resources
    dispose() {
        this.clearCache();
        this.loadedModels.clear();
        console.log('🗑️ OptimizedModelLoader disposed');
    }
}

// Make it globally available
window.OptimizedModelLoader = OptimizedModelLoader;
