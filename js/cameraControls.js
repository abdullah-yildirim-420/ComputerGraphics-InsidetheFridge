/**
 * WASD Camera Controls for Three.js
 * Modular and independent camera movement system
 */
class CameraControls {
    constructor(camera, options = {}) {
        this.camera = camera;
        this.moveSpeed = options.moveSpeed || 0.5;
        this.rotationSpeed = options.rotationSpeed || 0.002;
        this.enableVerticalMovement = options.enableVerticalMovement !== false;
        this.enableMouseLook = options.enableMouseLook !== false;
        
        // Movement state
        this.keys = {
            forward: false,    // W
            backward: false,   // S
            left: false,       // A
            right: false,      // D
            up: false,         // Q
            down: false        // E
        };
        
        // Mouse look state
        this.mouseState = {
            isLocked: false,
            lastX: 0,
            lastY: 0
        };
        
        // Rotation angles (Euler angles)
        this.pitch = 0; // Up/Down rotation (X-axis)
        this.yaw = 0;   // Left/Right rotation (Y-axis)        // Rotation angles (Euler angles)
        this.pitch = 0; // Up/Down rotation (X-axis)
        this.yaw = 0;   // Left/Right rotation (Y-axis)
        
        // Velocity for smooth movement
        this.velocity = {
            x: 0,
            y: 0,
            z: 0
        };
        
        this.dampingFactor = options.dampingFactor || 0.85;
        this.isEnabled = true;
        
        // Bind methods to preserve context
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onPointerLockChange = this.onPointerLockChange.bind(this);
        this.update = this.update.bind(this);
        
        // Add event listeners
        this.addEventListeners();
        
        console.log('FPS Camera Controls initialized');
        console.log('Controls: W/S - Forward/Backward, A/D - Left/Right, Q/E - Up/Down');
        console.log('Click to lock mouse for FPS-style camera rotation');
    }
      addEventListeners() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        
        if (this.enableMouseLook) {
            document.addEventListener('click', this.onMouseDown);
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('pointerlockchange', this.onPointerLockChange);
        }
    }
    
    removeEventListeners() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('click', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    }
    
    onKeyDown(event) {
        if (!this.isEnabled) return;
        
        // Prevent default browser behavior for these keys
        const controlKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyQ', 'KeyE'];
        if (controlKeys.includes(event.code)) {
            event.preventDefault();
        }
        
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'KeyQ':
                if (this.enableVerticalMovement) {
                    this.keys.up = true;
                }
                break;
            case 'KeyE':
                if (this.enableVerticalMovement) {
                    this.keys.down = true;
                }
                break;
        }
    }
    
    onKeyUp(event) {
        if (!this.isEnabled) return;
        
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'KeyQ':
                this.keys.up = false;
                break;            case 'KeyE':
                this.keys.down = false;
                break;
        }
    }
    
    onMouseDown(event) {
        if (!this.isEnabled || !this.enableMouseLook) return;
        
        // Request pointer lock for FPS-style mouse look
        if (document.pointerLockElement !== document.body) {
            document.body.requestPointerLock();
        }
    }
    
    onMouseMove(event) {
        if (!this.isEnabled || !this.enableMouseLook || !this.mouseState.isLocked) return;
        
        // Get mouse movement delta
        const deltaX = event.movementX || 0;
        const deltaY = event.movementY || 0;
        
        // Update rotation angles
        this.yaw -= deltaX * this.rotationSpeed;
        this.pitch -= deltaY * this.rotationSpeed;
        
        // Clamp pitch to prevent over-rotation
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        
        // Apply rotation to camera
        this.updateCameraRotation();
    }
    
    onPointerLockChange() {
        this.mouseState.isLocked = (document.pointerLockElement === document.body);
        
        if (this.mouseState.isLocked) {
            console.log('Mouse locked - FPS camera active');
        } else {
            console.log('Mouse unlocked - Press ESC or click again to lock');
        }
    }
    
    updateCameraRotation() {
        // Create rotation quaternion from yaw and pitch
        const quaternion = new THREE.Quaternion();
        const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
        
        // Combine rotations: yaw first, then pitch
        quaternion.multiplyQuaternions(yawQuaternion, pitchQuaternion);
        
        // Apply to camera
        this.camera.quaternion.copy(quaternion);
    }
      update() {
        if (!this.isEnabled) return;
        
        // Calculate movement direction based on camera's current orientation
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        const worldUp = new THREE.Vector3(0, 1, 0);
        
        // Get camera's forward direction
        this.camera.getWorldDirection(direction);
        direction.normalize();
        
        // Get camera's right direction
        right.crossVectors(direction, worldUp).normalize();
        
        // Get camera's local up direction (for true 6DOF movement)
        const up = new THREE.Vector3();
        up.crossVectors(right, direction).normalize();
        
        // Reset acceleration
        let acceleration = new THREE.Vector3(0, 0, 0);
        
        // Forward/Backward movement (along camera's forward vector)
        if (this.keys.forward) {
            acceleration.add(direction.clone().multiplyScalar(this.moveSpeed));
        }
        if (this.keys.backward) {
            acceleration.add(direction.clone().multiplyScalar(-this.moveSpeed));
        }
        
        // Left/Right movement (strafe along camera's right vector)
        if (this.keys.left) {
            acceleration.add(right.clone().multiplyScalar(-this.moveSpeed));
        }
        if (this.keys.right) {
            acceleration.add(right.clone().multiplyScalar(this.moveSpeed));
        }
        
        // Up/Down movement (if enabled, use world up/down)
        if (this.enableVerticalMovement) {
            if (this.keys.up) {
                acceleration.add(worldUp.clone().multiplyScalar(this.moveSpeed));
            }
            if (this.keys.down) {
                acceleration.add(worldUp.clone().multiplyScalar(-this.moveSpeed));
            }
        }
        
        // Apply acceleration to velocity
        this.velocity.x += acceleration.x;
        this.velocity.y += acceleration.y;
        this.velocity.z += acceleration.z;
        
        // Apply damping to create smooth movement
        this.velocity.x *= this.dampingFactor;
        this.velocity.y *= this.dampingFactor;
        this.velocity.z *= this.dampingFactor;
        
        // Apply velocity to camera position
        this.camera.position.x += this.velocity.x;
        this.camera.position.y += this.velocity.y;
        this.camera.position.z += this.velocity.z;
    }
    
    // Public methods for external control
    enable() {
        this.isEnabled = true;
    }
    
    disable() {
        this.isEnabled = false;
        // Reset all keys when disabled
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
        });
    }
    
    setMoveSpeed(speed) {
        this.moveSpeed = speed;
    }
      setDampingFactor(factor) {
        this.dampingFactor = Math.max(0, Math.min(1, factor));
    }
    
    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }
    
    // Set camera rotation directly (useful for initialization)
    setRotation(pitch, yaw) {
        this.pitch = pitch;
        this.yaw = yaw;
        this.updateCameraRotation();
    }
    
    // Clean up when destroying the instance
    destroy() {
        // Exit pointer lock if active
        if (document.pointerLockElement === document.body) {
            document.exitPointerLock();
        }
        
        this.removeEventListeners();
        this.disable();
    }
}

// Export for use in other modules
window.CameraControls = CameraControls;
