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

    // ========== PARTICLE APPEARANCE ==========
    setupSlider('density', 'density', settings);
    setupSlider('size', 'size', settings);
    setupSlider('size-min', 'sizeMin', settings);
    setupSlider('size-max', 'sizeMax', settings);
    setupSlider('lifespan', 'lifespan', settings);
    setupSlider('exit-duration', 'exitDuration', settings);

    // Size control visibility logic
    function updateSizeControlsVisibility() {
        const singleGroup = document.getElementById('size-single-group');
        const rangeGroup = document.getElementById('size-range-group');
        const showRange = settings.randomSize || settings.sizeBySpeed;

        if (singleGroup) singleGroup.style.display = showRange ? 'none' : 'block';
        if (rangeGroup) rangeGroup.style.display = showRange ? 'block' : 'none';
    }

    // Random Size toggle
    const randomSizeToggle = document.getElementById('random-size');
    if (randomSizeToggle) {
        randomSizeToggle.addEventListener('click', () => {
            const isPressed = randomSizeToggle.getAttribute('aria-pressed') === 'true';
            const newState = !isPressed;
            randomSizeToggle.setAttribute('aria-pressed', newState);
            settings.randomSize = newState;
            updateSizeControlsVisibility();
        });
    }

    // Size by Speed toggle
    const sizeBySpeedToggle = document.getElementById('size-by-speed');
    if (sizeBySpeedToggle) {
        sizeBySpeedToggle.addEventListener('click', () => {
            const isPressed = sizeBySpeedToggle.getAttribute('aria-pressed') === 'true';
            const newState = !isPressed;
            sizeBySpeedToggle.setAttribute('aria-pressed', newState);
            settings.sizeBySpeed = newState;
            updateSizeControlsVisibility();
        });
    }

    // Initialize size controls visibility
    updateSizeControlsVisibility();

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
    setupToggle('bounce-enabled', 'bounceEnabled', settings, 'bounce-amount-group');
    setupSlider('bounce-amount', 'bounceAmount', settings);

    // ========== CAMERA CONTROLS ==========
    // Camera position sliders
    setupSlider('camera-x', 'cameraX', settings, (value) => {
        if (window.trailTool?.setCameraPosition) {
            window.trailTool.setCameraPosition(value, undefined, undefined);
        }
    });
    setupSlider('camera-y', 'cameraY', settings, (value) => {
        if (window.trailTool?.setCameraPosition) {
            window.trailTool.setCameraPosition(undefined, value, undefined);
        }
    });
    setupSlider('camera-z', 'cameraZ', settings, (value) => {
        if (window.trailTool?.setCameraPosition) {
            window.trailTool.setCameraPosition(undefined, undefined, value);
        }
    });
    setupSlider('camera-fov', 'cameraFOV', settings, (value) => {
        if (window.trailTool?.setCameraFOV) {
            window.trailTool.setCameraFOV(value);
        }
    });

    // Camera preset buttons
    document.querySelectorAll('.camera-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (window.trailTool?.setCameraPreset) {
                window.trailTool.setCameraPreset(view);
                // Update sliders to reflect new position
                const newSettings = window.trailTool.settings;
                updateSliderUI('camera-x', newSettings.cameraX);
                updateSliderUI('camera-y', newSettings.cameraY);
                updateSliderUI('camera-z', newSettings.cameraZ);
            }
        });
    });

    // Helper to update slider UI after preset
    function updateSliderUI(sliderId, value) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(sliderId + '-value');
        if (slider) slider.value = value;
        if (valueDisplay) valueDisplay.textContent = value;
    }

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

    // ========== MULTI-GRADIENT CONTROLS ==========
    const multiGradientToggle = document.getElementById('multi-gradient-enabled');
    if (multiGradientToggle) {
        multiGradientToggle.addEventListener('click', () => {
            const isPressed = multiGradientToggle.getAttribute('aria-pressed') === 'true';
            const newState = !isPressed;
            multiGradientToggle.setAttribute('aria-pressed', newState);
            settings.multiGradientEnabled = newState;

            const controlsGroup = document.getElementById('multi-gradient-controls');
            if (controlsGroup) {
                controlsGroup.style.display = newState ? 'block' : 'none';
            }

            // Initialize gradient sets if empty
            if (newState && settings.gradientSets.length === 0) {
                // Copy current gradient as first set
                settings.gradientSets.push({
                    stops: JSON.parse(JSON.stringify(settings.gradientStops)),
                    name: 'Gradient 1'
                });
                // Add a second default gradient
                settings.gradientSets.push({
                    stops: [
                        { color: '#ffd93d', position: 0 },
                        { color: '#ff6b6b', position: 50 },
                        { color: '#c44569', position: 100 }
                    ],
                    name: 'Gradient 2'
                });
                rebuildGradientSetsUI();
            }
        });
    }

    // Gradient mode dropdown
    const gradientMode = document.getElementById('gradient-mode');
    if (gradientMode) {
        gradientMode.addEventListener('change', (e) => {
            settings.gradientMode = e.target.value;
            const cycleSpeedGroup = document.getElementById('gradient-cycle-speed-group');
            if (cycleSpeedGroup) {
                cycleSpeedGroup.style.display = e.target.value === 'time' ? 'block' : 'none';
            }
        });
    }

    // Gradient cycle speed slider
    setupSlider('gradient-cycle-speed', 'gradientCycleSpeed', settings);

    // Add gradient set button
    const addGradientSetBtn = document.getElementById('add-gradient-set');
    if (addGradientSetBtn) {
        addGradientSetBtn.addEventListener('click', () => {
            if (settings.gradientSets.length >= 5) return; // Max 5 gradient sets
            const newIndex = settings.gradientSets.length + 1;
            settings.gradientSets.push({
                stops: [
                    { color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), position: 0 },
                    { color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), position: 50 },
                    { color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), position: 100 }
                ],
                name: 'Gradient ' + newIndex
            });
            rebuildGradientSetsUI();
        });
    }

    // Helper function to rebuild gradient sets UI
    function rebuildGradientSetsUI() {
        const container = document.getElementById('gradient-sets-container');
        if (!container) return;

        const label = container.querySelector('.chatooly-input-label');
        container.innerHTML = '';
        if (label) container.appendChild(label);

        settings.gradientSets.forEach((gradientSet, index) => {
            const div = document.createElement('div');
            div.className = 'gradient-set-item';
            div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center; padding: 8px; background: var(--chatooly-color-surface); border-radius: 4px;';

            // Create color preview strip
            const colorsPreview = gradientSet.stops.map(s => s.color).join(', ');
            div.innerHTML = `
                <div style="flex: 1; height: 24px; border-radius: 4px; background: linear-gradient(to right, ${colorsPreview});"></div>
                <span style="font-size: 11px; min-width: 70px;">${gradientSet.name}</span>
                ${index > 0 ? '<button class="chatooly-btn remove-gradient-set" data-index="' + index + '" style="padding: 2px 6px; min-width: auto;">×</button>' : ''}
            `;
            container.appendChild(div);
        });

        // Add remove handlers
        container.querySelectorAll('.remove-gradient-set').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                settings.gradientSets.splice(idx, 1);
                rebuildGradientSetsUI();
            });
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

function setupSlider(elementId, settingsKey, settings, callback = null) {
    const slider = document.getElementById(elementId);
    const valueDisplay = document.getElementById(`${elementId}-value`);

    if (!slider) return;

    slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        settings[settingsKey] = value;
        if (valueDisplay) {
            valueDisplay.textContent = value;
        }
        if (callback) {
            callback(value);
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
