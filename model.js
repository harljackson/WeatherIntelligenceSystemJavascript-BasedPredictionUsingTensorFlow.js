// --------------------------------------------------
// TensorFlow.js Rain Prediction Model
// --------------------------------------------------

let model;
let isModelLoaded = false;

// Global normalisation parameters (VERY IMPORTANT)
let featureMean = null;
let featureStd = null;

// --------------------------------------------------
// Load model + normalisation from browser storage
// --------------------------------------------------
async function loadModel() {
    try {
        model = await tf.loadLayersModel("localstorage://rain-prediction-model");

        // Load normalization params
        const norm = JSON.parse(localStorage.getItem("rainNormParams"));
        if (!norm) throw new Error("Normalisation parameters missing");

        featureMean = tf.tensor(norm.mean);
        featureStd = tf.tensor(norm.std);

        isModelLoaded = true;
        console.log("✅ Model + normalization loaded from local storage.");
        return true;
    } catch (err) {
        console.log("ℹ️ No saved model found.");
        return false;
    }
}

// --------------------------------------------------
// Create model architecture
// --------------------------------------------------
function createModel() {
    const model = tf.sequential();

    model.add(tf.layers.dense({
        inputShape: [5],
        units: 16,
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        units: 8,
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        units: 1,
        activation: "sigmoid"
    }));

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: "binaryCrossentropy",
        metrics: ["accuracy"]
    });

    return model;
}

// --------------------------------------------------
// Train model
// --------------------------------------------------
async function trainModel(inputs, labels) {
    model = createModel();

    const inputTensor = tf.tensor2d(inputs);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    console.log("🚀 Training model...");
    console.log("Input shape:", inputTensor.shape);

    await model.fit(inputTensor, labelTensor, {
        epochs: 30,
        batchSize: 32,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(
                    `Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)}, accuracy=${logs.accuracy.toFixed(4)}`
                );
            }
        }
    });

    isModelLoaded = true;
    console.log("✅ Model training complete.");

    // Save model
    await model.save("localstorage://rain-prediction-model");
    console.log("💾 Model saved to local storage.");

    inputTensor.dispose();
    labelTensor.dispose();
}

// --------------------------------------------------
// Predict rain probability
// --------------------------------------------------
function predictRain(features) {
    if (!isModelLoaded || !featureMean || !featureStd) {
        console.error("❌ Model or normalization not ready");
        return null;
    }

    // Validate inputs
    if (features.some(v => typeof v !== "number" || isNaN(v))) {
        console.error("❌ Invalid feature values", features);
        return null;
    }

    const inputTensor = tf.tensor2d([features]);

    const normalized = inputTensor
        .sub(featureMean)
        .div(featureStd);

    const prediction = model.predict(normalized);
    const probability = prediction.dataSync()[0];

    inputTensor.dispose();
    normalized.dispose();
    prediction.dispose();

    return probability;
}

// --------------------------------------------------
// Load & preprocess dataset
// --------------------------------------------------
async function loadAndPreprocessData() {
    return new Promise((resolve, reject) => {
        Papa.parse("data/weatherAUS.csv", {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                const inputs = [];
                const labels = [];

                let yes = 0;
                let no = 0;
                const MAX = 5000;

                for (const row of results.data) {
                    const features = [
                        row.Temp9am,
                        row.Humidity9am,
                        row.Pressure9am,
                        row.WindSpeed9am,
                        row.Cloud9am
                    ];

                    const label = row.RainTomorrow === "Yes" ? 1 : 0;

                    if (
                        features.some(v => typeof v !== "number") ||
                        row.RainTomorrow == null
                    ) continue;

                    if (label === 1 && yes >= MAX) continue;
                    if (label === 0 && no >= MAX) continue;

                    label === 1 ? yes++ : no++;

                    inputs.push(features);
                    labels.push(label);
                }

                console.log("🌧️ Rain:", yes, "☀️ No rain:", no);

                const inputTensor = tf.tensor2d(inputs);

                // Compute normalization parameters
                featureMean = inputTensor.mean(0);
                featureStd = inputTensor
                    .sub(featureMean)
                    .square()
                    .mean(0)
                    .sqrt()
                    .add(1e-6);

                // Save normalization params
                localStorage.setItem(
                    "rainNormParams",
                    JSON.stringify({
                        mean: featureMean.arraySync(),
                        std: featureStd.arraySync()
                    })
                );

                const normalizedInputs = inputTensor
                    .sub(featureMean)
                    .div(featureStd);

                resolve({
                    inputs: normalizedInputs.arraySync(),
                    labels
                });

                inputTensor.dispose();
            },
            error: reject
        });
    });
}

// --------------------------------------------------
// Initialise model
// --------------------------------------------------
(async () => {
    const loaded = await loadModel();

    if (!loaded) {
        console.log("📥 Training new model...");
        const { inputs, labels } = await loadAndPreprocessData();
        await trainModel(inputs, labels);
    }

    const btn = document.getElementById("getWeatherBtn");
    if (btn) {
        btn.disabled = false;
        btn.textContent = "Get Weather & Predict Rain";
        btn.classList.remove("opacity-50", "cursor-not-allowed");
    }
})();
