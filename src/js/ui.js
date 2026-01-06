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
