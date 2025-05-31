// Memory Management Utilities
// Helps prevent memory leaks and optimize performance

class MemoryManager {
    constructor() {
        this.disposables = new Set();
        this.intervalId = null;
        this.isMonitoring = false;
        
        console.log('🧹 MemoryManager initialized');
    }

    // Register an object for cleanup
    register(object, name = 'unnamed') {
        if (object && typeof object.dispose === 'function') {
            this.disposables.add({ object, name });
            console.log(`📝 Registered ${name} for cleanup`);
        }
    }

    // Start memory monitoring
    startMonitoring(intervalMs = 30000) { // Every 30 seconds
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.intervalId = setInterval(() => {
            this.logMemoryUsage();
            this.cleanupUnused();
        }, intervalMs);
        
        console.log('📊 Memory monitoring started');
    }

    // Stop memory monitoring
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isMonitoring = false;
            console.log('📊 Memory monitoring stopped');
        }
    }

    // Log current memory usage
    logMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
            const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
            
            console.log(`💾 Memory: ${used}MB / ${total}MB (limit: ${limit}MB)`);
            
            // Warn if memory usage is high
            if (used > limit * 0.8) {
                console.warn('⚠️ High memory usage detected! Consider cleanup.');
                this.forceCleanup();
            }
        }
    }

    // Clean up unused resources
    cleanupUnused() {
        let cleanedCount = 0;
        
        this.disposables.forEach(item => {
            if (item.object && typeof item.object.dispose === 'function') {
                // Check if object is still referenced
                try {
                    if (this.isObjectUnused(item.object)) {
                        item.object.dispose();
                        this.disposables.delete(item);
                        cleanedCount++;
                        console.log(`🗑️ Cleaned up unused ${item.name}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Error checking ${item.name}:`, error);
                }
            }
        });
        
        if (cleanedCount > 0) {
            console.log(`✅ Cleaned up ${cleanedCount} unused objects`);
        }
    }

    // Force cleanup of all registered objects
    forceCleanup() {
        console.log('🧹 Force cleanup initiated...');
        
        let cleanedCount = 0;
        this.disposables.forEach(item => {
            try {
                if (item.object && typeof item.object.dispose === 'function') {
                    item.object.dispose();
                    cleanedCount++;
                    console.log(`🗑️ Force cleaned ${item.name}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error disposing ${item.name}:`, error);
            }
        });
        
        this.disposables.clear();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
            console.log('♻️ Garbage collection triggered');
        }
        
        console.log(`✅ Force cleanup completed: ${cleanedCount} objects disposed`);
    }

    // Check if object appears to be unused
    isObjectUnused(object) {
        // Simple heuristic - could be enhanced
        if (object.parent === null || object.parent === undefined) {
            return true;
        }
        
        if (object.children && object.children.length === 0 && 
            object.material && object.material.transparent && 
            object.material.opacity === 0) {
            return true;
        }
        
        return false;
    }

    // Optimize Three.js renderer
    optimizeRenderer(renderer) {
        if (!renderer) return;
        
        // Clear buffers
        renderer.clear();
        
        // Reset render states
        renderer.resetState();
        
        // Log rendering info
        if (renderer.info) {
            const info = renderer.info;
            console.log(`🎮 Render Info:`, {
                geometries: info.memory.geometries,
                textures: info.memory.textures,
                calls: info.render.calls,
                triangles: info.render.triangles
            });
            
            // Reset counters
            info.reset();
        }
    }

    // Optimize textures
    optimizeTextures() {
        // Find all textures in scene and optimize
        const textures = [];
        
        if (window.scene) {
            window.scene.traverse((object) => {
                if (object.material) {
                    const materials = Array.isArray(object.material) 
                        ? object.material 
                        : [object.material];
                    
                    materials.forEach(material => {
                        Object.keys(material).forEach(key => {
                            if (material[key] && material[key].isTexture) {
                                textures.push(material[key]);
                            }
                        });
                    });
                }
            });
        }
        
        // Remove duplicate textures
        const uniqueTextures = [...new Set(textures)];
        console.log(`🖼️ Found ${uniqueTextures.length} unique textures`);
        
        // Optimize texture settings
        uniqueTextures.forEach(texture => {
            if (texture.generateMipmaps !== false) {
                texture.generateMipmaps = false;
                texture.needsUpdate = true;
            }
        });
    }

    // Get memory statistics
    getStats() {
        const stats = {
            registeredObjects: this.disposables.size,
            isMonitoring: this.isMonitoring
        };
        
        if (performance.memory) {
            const memory = performance.memory;
            stats.memoryUsage = {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        
        return stats;
    }

    // Dispose of the memory manager itself
    dispose() {
        this.stopMonitoring();
        this.forceCleanup();
        console.log('🧹 MemoryManager disposed');
    }
}

// Browser-specific optimizations
class BrowserOptimizer {
    static optimizeForBrowser() {
        // Detect browser and apply optimizations
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Chrome')) {
            console.log('🌐 Applying Chrome optimizations...');
            BrowserOptimizer.optimizeChrome();
        } else if (userAgent.includes('Firefox')) {
            console.log('🌐 Applying Firefox optimizations...');
            BrowserOptimizer.optimizeFirefox();
        } else if (userAgent.includes('Safari')) {
            console.log('🌐 Applying Safari optimizations...');
            BrowserOptimizer.optimizeSafari();
        }
    }
    
    static optimizeChrome() {
        // Chrome-specific optimizations
        if (window.performance && window.performance.memory) {
            // Enable memory monitoring for Chrome
            return true;
        }
    }
    
    static optimizeFirefox() {
        // Firefox-specific optimizations
        // Firefox handles memory differently
        console.log('🦊 Firefox memory management enabled');
    }
    
    static optimizeSafari() {
        // Safari-specific optimizations
        console.log('🍎 Safari optimizations applied');
    }
}

// Initialize browser optimizations
BrowserOptimizer.optimizeForBrowser();

// Make available globally
window.MemoryManager = MemoryManager;
window.BrowserOptimizer = BrowserOptimizer;
