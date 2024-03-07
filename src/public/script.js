const fileInput = document.getElementById("file-input");
const reader= new FileReader();
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d", {willReadFrequently: true});
const brightnessSlider = document.getElementById("brightness");
const contrastSlider = document.getElementById("contrast");
const opacitySlider = document.getElementById("transparent");
const resetButton = document.getElementById("reset-button");
const saveButton = document.getElementById("save-button");
let originalImageData;
addEventListeners();

function addEventListeners() {
    fileInput.addEventListener("change", (event) => {
        const files = event.target.files;
        reader.readAsDataURL(files[0]);
    });

    reader.addEventListener("load", (event) => {
        const img = document.createElement("img");
        img.addEventListener("load", () => {
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.style.boxShadow = "3px 3px 5px 3px rgba(0,0,0,0.1)";
            context.drawImage(img, 0, 0);
            originalImageData = structuredClone(getImageDataFromCanvas());
            applySliderValues();
        });
        img.src = event.target.result.toString();
    });

    brightnessSlider.addEventListener("change", (event) => {
        const label = document.getElementById("brightnessLabel");
        label.textContent = `Brightness: ${event.target.value}`;
        applyEffects();
    });

    contrastSlider.addEventListener("change", (event) => {
        const label = document.getElementById("contrastLabel");
        label.textContent = `Contrast: ${event.target.value}`;
        applyEffects();
    });

    opacitySlider.addEventListener("change", (event) => {
        const label = document.getElementById("opacityLabel");
        label.textContent = `Opacity: ${event.target.value}`;
        applyEffects();
    });

    resetButton.addEventListener("click", () => {
        setDefaultSliderValues();
    });

    saveButton.addEventListener("click", () => {
        const downloadLink = document.createElement("a");
        downloadLink.href = canvas.toDataURL();
        downloadLink.download = "result.png";
        downloadLink.click();
    });
}

function applyEffects() {
    if (!originalImageData) {
        console.warn("Image data not found. Load an image first.");
        return;
    }
    const brightnessValue = parseInt(brightnessSlider.value);
    const contrastValue = parseInt(contrastSlider.value);
    const transparencyValue = parseFloat(opacitySlider.value);
    const imageData = structuredClone(originalImageData);
    const pixels = imageData.data;
    let pixelArrayCopy = new Array(pixels.length);
    for (let i = 0; i < pixels.length; i++) {
        pixelArrayCopy[i] = parseFloat(pixels[i]);
    }
    setContrast(contrastValue, pixelArrayCopy);
    setBrightness(brightnessValue, pixelArrayCopy);
    truncateRgbValues(pixelArrayCopy);
    setTransparency(transparencyValue, pixelArrayCopy);
    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = pixelArrayCopy[i];
    }
    context.putImageData(imageData, 0, 0);
}

function setContrast(value, pixels) {
    const factor = 259 * (255 + value) / (255 * (259 - value));
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = factor * (pixels[i] - 128) + 128;
        pixels[i+1] = factor * (pixels[i+1] - 128) + 128;
        pixels[i+2] = factor * (pixels[i+2] - 128) + 128;
    }
}

function setBrightness(value, pixels) {
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = pixels[i] + value;
        pixels[i+1] = pixels[i+1] + value;
        pixels[i+2] = pixels[i+2] + value;
    }
}

function truncateRgbValues(pixels) {
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = truncate(pixels[i]);
        pixels[i+1] = truncate(pixels[i+1]);
        pixels[i+2] = truncate(pixels[i+2]);
    }
}

function truncate(value) {
    if (isNaN(value)) {
        throw new Error("Parameter is not a number!");
    }
    if (value < 0) return 0;
    if (value > 255) return 255;
    return value;
}

function setTransparency(value, pixels) {
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i+3] = pixels[i+3] * value;
    }
}

function getImageDataFromCanvas() {
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

function setDefaultSliderValues() {
    brightnessSlider.value = 0;
    contrastSlider.value = 0;
    opacitySlider.value = 1;
    applySliderValues();
}

function applySliderValues() {
    brightnessSlider.dispatchEvent(new Event("change"));
    contrastSlider.dispatchEvent(new Event("change"));
    opacitySlider.dispatchEvent(new Event("change"));
}