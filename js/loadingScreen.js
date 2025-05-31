// Loading Screen Manager
// Provides visual feedback during model loading

class LoadingScreen {
    constructor() {
        this.loadingElement = null;
        this.progressBar = null;
        this.statusText = null;
        this.isVisible = false;
        
        this.createLoadingScreen();
    }

    createLoadingScreen() {
        // Main loading screen
        this.loadingElement = document.createElement('div');
        this.loadingElement.id = 'loadingScreen';
        this.loadingElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Arial', sans-serif;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;

        // Logo/Title
        const title = document.createElement('div');
        title.innerHTML = '🥶 Inside The Fridge';
        title.style.cssText = `
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        `;

        // Progress container
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 400px;
            background: rgba(255,255,255,0.1);
            border-radius: 25px;
            padding: 5px;
            backdrop-filter: blur(10px);
            margin-bottom: 1rem;
        `;

        // Progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            width: 0%;
            height: 20px;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            border-radius: 20px;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        `;

        // Status text
        this.statusText = document.createElement('div');
        this.statusText.textContent = 'Initializing...';
        this.statusText.style.cssText = `
            font-size: 1rem;
            margin-top: 1rem;
            opacity: 0.8;
        `;

        // Loading animation
        const spinner = document.createElement('div');
        spinner.innerHTML = '⭕';
        spinner.style.cssText = `
            font-size: 2rem;
            animation: spin 2s linear infinite;
            margin-top: 1rem;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Assemble elements
        progressContainer.appendChild(this.progressBar);
        this.loadingElement.appendChild(title);
        this.loadingElement.appendChild(progressContainer);
        this.loadingElement.appendChild(this.statusText);
        this.loadingElement.appendChild(spinner);

        document.body.appendChild(this.loadingElement);
    }

    show() {
        if (this.loadingElement && !this.isVisible) {
            this.loadingElement.style.display = 'flex';
            setTimeout(() => {
                this.loadingElement.style.opacity = '1';
            }, 10);
            this.isVisible = true;
            console.log('🖥️ Loading screen shown');
        }
    }

    hide() {
        if (this.loadingElement && this.isVisible) {
            this.loadingElement.style.opacity = '0';
            setTimeout(() => {
                this.loadingElement.style.display = 'none';
            }, 500);
            this.isVisible = false;
            console.log('🖥️ Loading screen hidden');
        }
    }

    updateProgress(percent, statusText = '') {
        if (this.progressBar) {
            this.progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        }
        
        if (this.statusText && statusText) {
            this.statusText.textContent = statusText;
        }
    }

    setStatus(text) {
        if (this.statusText) {
            this.statusText.textContent = text;
        }
    }

    // Animated progress update
    animateProgress(targetPercent, statusText = '', duration = 300) {
        return new Promise(resolve => {
            const currentPercent = parseFloat(this.progressBar.style.width) || 0;
            const difference = targetPercent - currentPercent;
            const steps = Math.max(1, Math.floor(duration / 16)); // 60fps
            const stepSize = difference / steps;
            
            let step = 0;
            const animate = () => {
                step++;
                const newPercent = currentPercent + (stepSize * step);
                
                this.updateProgress(newPercent, statusText);
                
                if (step < steps) {
                    requestAnimationFrame(animate);
                } else {
                    this.updateProgress(targetPercent, statusText);
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    dispose() {
        if (this.loadingElement) {
            document.body.removeChild(this.loadingElement);
            this.loadingElement = null;
            this.progressBar = null;
            this.statusText = null;
            this.isVisible = false;
        }
    }
}

// Make it globally available
window.LoadingScreen = LoadingScreen;
