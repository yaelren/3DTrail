/*
 * 3D Trail Tool - UI Controls
 * Author: Claude Code
 *
 * Handles UI interactions for the 3D Trail tool.
 * Connects HTML controls to the settings object in main.js.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for main.js to initialize
    setTimeout(() => {
        initUIControls();
    }, 100);
});

function initUIControls() {
    const settings = window.trailTool ? window.trailTool.settings : null;
    if (!settings) {
        console.warn('3D Trail: Settings not found, retrying...');
        setTimeout(initUIControls, 100);
        return;
    }

    // ========== MODEL UPLOAD ==========
    const modelUpload = document.getElementById('model-upload');
    const modelInfo = document.getElementById('model-info');
    const modelName = document.getElementById('model-name');
    const clearModel = document.getElementById('clear-model');

    if (modelUpload) {
        modelUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                modelName.textContent = 'Loading...';
                modelInfo.style.display = 'block';

                await window.trailTool.loadGLBModel(file);

                modelName.textContent = file.name;
            } catch (error) {
                alert('Failed to load GLB: ' + error.message);
                modelInfo.style.display = 'none';
                modelUpload.value = '';
            }
        });
    }

    if (clearModel) {
        clearModel.addEventListener('click', () => {
            window.trailTool.clearModel();
            modelInfo.style.display = 'none';
            modelUpload.value = '';
        });
    }

    // ========== TRAIL SETTINGS ==========
    setupSlider('density', 'density', settings);
    setupSlider('size-min', 'sizeMin', settings);
    setupSlider('size-max', 'sizeMax', settings);
    setupSlider('lifespan', 'lifespan', settings);
    setupSlider('exit-duration', 'exitDuration', settings);
    setupToggle('size-by-speed', 'sizeBySpeed', settings);

    // Disappear mode dropdown
    const disappearMode = document.getElementById('disappear-mode');
    if (disappearMode) {
        disappearMode.addEventListener('change', (e) => {
            settings.disappearMode = e.target.value;
        });
    }

    // ========== MOVEMENT ==========
    setupToggle('float-enabled', 'floatEnabled', settings, 'float-controls-group');
    setupSlider('float-amplitude', 'floatAmplitude', settings);

    // Float style dropdown
    const floatStyle = document.getElementById('float-style');
    if (floatStyle) {
        floatStyle.addEventListener('change', (e) => {
            settings.floatStyle = e.target.value;
        });
    }

    setupToggle('follow-enabled', 'followEnabled', settings, 'follow-strength-group');
    setupSlider('follow-strength', 'followStrength', settings);

    // ========== OBJECT FACING ==========
    const facingMode = document.getElementById('facing-mode');
    const fixedAngleControls = document.getElementById('fixed-angle-controls');

    if (facingMode) {
        facingMode.addEventListener('change', (e) => {
            settings.facingMode = e.target.value;
            if (fixedAngleControls) {
                fixedAngleControls.style.display = e.target.value === 'fixed' ? 'block' : 'none';
            }
        });
    }

    setupSlider('angle-x', 'fixedAngleX', settings);
    setupSlider('angle-y', 'fixedAngleY', settings);
    setupSlider('angle-z', 'fixedAngleZ', settings);

    // ========== PHYSICS ==========
    setupToggle('gravity-enabled', 'gravityEnabled', settings, 'gravity-strength-group');
    setupSlider('gravity-strength', 'gravityStrength', settings);
    setupToggle('spin-enabled', 'spinEnabled', settings, 'spin-speed-group');
    setupSlider('spin-speed', 'spinSpeed', settings);
    setupToggle('tumble-enabled', 'tumbleEnabled', settings, 'tumble-speed-group');
    setupSlider('tumble-speed', 'tumbleSpeed', settings);
    setupToggle('bounce-enabled', 'bounceEnabled', settings);

    // ========== BACKGROUND (handled in main.js but UI toggle here) ==========
    const transparentToggle = document.getElementById('transparent-bg');
    if (transparentToggle) {
        transparentToggle.addEventListener('click', () => {
            const isPressed = transparentToggle.getAttribute('aria-pressed') === 'true';
            const newState = !isPressed;
            transparentToggle.setAttribute('aria-pressed', newState);

            const bgColorGroup = document.getElementById('bg-color-group');
            if (bgColorGroup) {
                bgColorGroup.style.display = newState ? 'none' : 'block';
            }
        });
    }

    // ========== MATERIAL (MATCAP) CONTROLS ==========
    const materialToggle = document.getElementById('material-enabled');
    if (materialToggle) {
        materialToggle.addEventListener('click', () => {
            const isPressed = materialToggle.getAttribute('aria-pressed') === 'true';
            const newState = !isPressed;
            materialToggle.setAttribute('aria-pressed', newState);

            const controlsGroup = document.getElementById('material-controls-group');
            if (controlsGroup) controlsGroup.style.display = newState ? 'block' : 'none';

            if (window.trailTool?.toggleMaterialMode) {
                window.trailTool.toggleMaterialMode(newState);
            }

            // Update preview when enabling
            if (newState) {
                setTimeout(updateMaterialPreview, 100);
            }
        });
    }

    // Preview canvas setup
    const previewCanvas = document.getElementById('matcap-preview');
    function updateMaterialPreview() {
        if (!settings.materialEnabled) return;

        const sourceCanvas = window.trailTool?.getMatcapPreview?.();
        if (previewCanvas && sourceCanvas) {
            const ctx = previewCanvas.getContext('2d');
            ctx.clearRect(0, 0, 80, 80);
            ctx.drawImage(sourceCanvas, 0, 0, 80, 80);
        }

        if (window.trailTool?.updateMaterial) {
            window.trailTool.updateMaterial();
        }
    }

    // Gradient type dropdown
    const gradientType = document.getElementById('gradient-type');
    if (gradientType) {
        gradientType.addEventListener('change', (e) => {
            settings.gradientType = e.target.value;
            updateMaterialPreview();
        });
    }

    // Gradient stops setup
    function setupGradientStops() {
        const stops = document.querySelectorAll('.gradient-stop');
        stops.forEach((stop, index) => {
            const colorInput = stop.querySelector('.gradient-color');
            const positionInput = stop.querySelector('.gradient-position');
            const positionValue = stop.querySelector('.gradient-position-value');

            if (colorInput) {
                colorInput.addEventListener('input', (e) => {
                    if (settings.gradientStops[index]) {
                        settings.gradientStops[index].color = e.target.value;
                        updateMaterialPreview();
                    }
                });
            }

            if (positionInput) {
                positionInput.addEventListener('input', (e) => {
                    const val = parseInt(e.target.value);
                    if (settings.gradientStops[index]) {
                        settings.gradientStops[index].position = val;
                        if (positionValue) positionValue.textContent = val + '%';
                        updateMaterialPreview();
                    }
                });
            }
        });
    }
    setupGradientStops();

    // Add gradient stop button
    const addStopBtn = document.getElementById('add-gradient-stop');
    if (addStopBtn) {
        addStopBtn.addEventListener('click', () => {
            if (settings.gradientStops.length >= 6) return; // Max 6 stops
            settings.gradientStops.push({ color: '#888888', position: 50 });
            rebuildGradientStopsUI();
            updateMaterialPreview();
        });
    }

    // Remove gradient stop button
    const removeStopBtn = document.getElementById('remove-gradient-stop');
    if (removeStopBtn) {
        removeStopBtn.addEventListener('click', () => {
            if (settings.gradientStops.length <= 2) return; // Min 2 stops
            settings.gradientStops.pop();
            rebuildGradientStopsUI();
            updateMaterialPreview();
        });
    }

    // Light position slider
    setupSlider('light-position', 'lightPosition', settings);
    const lightPosSlider = document.getElementById('light-position');
    if (lightPosSlider) {
        lightPosSlider.addEventListener('input', updateMaterialPreview);
    }

    // Light intensity slider
    setupSlider('light-intensity', 'lightIntensity', settings);
    const lightIntSlider = document.getElementById('light-intensity');
    if (lightIntSlider) {
        lightIntSlider.addEventListener('input', updateMaterialPreview);
    }

    // Rim light toggle
    setupToggle('rim-enabled', 'rimEnabled', settings, 'rim-controls');
    const rimToggle = document.getElementById('rim-enabled');
    if (rimToggle) {
        rimToggle.addEventListener('click', () => {
            setTimeout(updateMaterialPreview, 0);
        });
    }

    // Rim intensity slider
    setupSlider('rim-intensity', 'rimIntensity', settings);
    const rimIntSlider = document.getElementById('rim-intensity');
    if (rimIntSlider) {
        rimIntSlider.addEventListener('input', updateMaterialPreview);
    }

    // Rim color picker
    const rimColor = document.getElementById('rim-color');
    if (rimColor) {
        rimColor.addEventListener('input', (e) => {
            settings.rimColor = e.target.value;
            updateMaterialPreview();
        });
    }

    // Shader mode dropdown
    const shaderMode = document.getElementById('shader-mode');
    if (shaderMode) {
        shaderMode.addEventListener('change', (e) => {
            settings.shaderMode = e.target.value;
            // Need to recreate material for flatShading change
            if (settings.materialEnabled && window.trailTool?.toggleMaterialMode) {
                window.trailTool.toggleMaterialMode(false);
                window.trailTool.toggleMaterialMode(true);
            }
        });
    }

    // Helper function to rebuild gradient stops UI dynamically
    function rebuildGradientStopsUI() {
        const container = document.getElementById('gradient-stops-container');
        if (!container) return;

        // Keep the label
        const label = container.querySelector('.chatooly-input-label');
        container.innerHTML = '';
        if (label) container.appendChild(label);

        settings.gradientStops.forEach((stop, index) => {
            const div = document.createElement('div');
            div.className = 'gradient-stop';
            div.dataset.index = index;
            div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
            div.innerHTML = `
                <input type="color" class="gradient-color" value="${stop.color}" style="width: 40px; height: 30px;">
                <input type="range" class="chatooly-slider gradient-position" min="0" max="100" value="${stop.position}" style="flex: 1;">
                <span class="gradient-position-value" style="min-width: 35px;">${stop.position}%</span>
            `;
            container.appendChild(div);
        });

        setupGradientStops();
    }
}

// ========== HELPER FUNCTIONS ==========

function setupSlider(elementId, settingsKey, settings) {
    const slider = document.getElementById(elementId);
    const valueDisplay = document.getElementById(`${elementId}-value`);

    if (!slider) return;

    slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        settings[settingsKey] = value;
        if (valueDisplay) {
            valueDisplay.textContent = value;
        }
    });
}

function setupToggle(elementId, settingsKey, settings, showHideId = null) {
    const toggle = document.getElementById(elementId);
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const isPressed = toggle.getAttribute('aria-pressed') === 'true';
        const newState = !isPressed;

        toggle.setAttribute('aria-pressed', newState);
        settings[settingsKey] = newState;

        if (showHideId) {
            const element = document.getElementById(showHideId);
            if (element) {
                element.style.display = newState ? 'block' : 'none';
            }
        }
    });
}
