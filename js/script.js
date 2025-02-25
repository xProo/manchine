class VoiceRecognition {
  constructor() {
    if (!("webkitSpeechRecognition" in window)) {
      alert(
        "La reconnaissance vocale n'est pas supportée par votre navigateur."
      );
      return;
    }
    // Web Speech API
    this.recognition = new webkitSpeechRecognition();
    this.commandManager = new VoiceCommandManager();
    this.setupRecognition();
    this.setupButtons();
  }

  setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "fr-FR";

    this.recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          this.commandManager.processCommand(finalTranscript);
        } else {
          interimTranscript += transcript;
        }
      }

      document.getElementById("output").innerHTML =
        finalTranscript +
        '<i style="color: #999">' +
        interimTranscript +
        "</i>";
    };

    this.recognition.onerror = (event) => {
      console.error("Erreur de reconnaissance:", event.error);
    };
  }

  setupButtons() {
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");

    startButton.addEventListener("click", () => {
      this.recognition.start();
      startButton.disabled = true;
      stopButton.disabled = false;
    });

    stopButton.addEventListener("click", () => {
      this.recognition.stop();
      startButton.disabled = false;
      stopButton.disabled = true;
    });
  }
}

class AudioAnalyzer {
  constructor() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.canvas = document.getElementById("frequencyCanvas");
    this.canvasCtx = this.canvas.getContext("2d");

    this.signalProcessor = new SignalProcessor();
    this.commandManager = new VoiceCommandManager();
    this.setupAdvancedAnalysis();
    this.d3Visualizer = new D3Visualizer();

    // Ajout d'un log pour debug
    console.log("AudioAnalyzer initialisé");
  }

  setupAdvancedAnalysis() {
    this.analyser.smoothingTimeConstant = 0.85;
    this.processedData = new Float32Array(this.bufferLength);
  }

  async processAudioData() {
    this.analyser.getFloatTimeDomainData(this.processedData);

    // Application de la FFT
    const fftData = this.signalProcessor.applyFFT(this.processedData);

    // Filtrage du bruit
    const filteredData = this.signalProcessor.filterNoise(fftData);

    return filteredData;
  }

  setupCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  async setupMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      this.isRunning = true;
      this.draw();
      console.log("Microphone connecté avec succès");
    } catch (err) {
      console.error("Erreur d'accès au microphone:", err);
    }
  }

  draw() {
    if (!this.isRunning) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    requestAnimationFrame(() => this.draw());

    // Obtenir les données audio
    this.analyser.getByteFrequencyData(this.dataArray);

    // Mettre à jour la visualisation D3
    this.d3Visualizer.update(this.dataArray);

    // Mise à jour du canvas
    this.canvasCtx.fillStyle = "rgb(0, 0, 0)";
    this.canvasCtx.fillRect(0, 0, width, height);

    const barWidth = (width / this.bufferLength) * 2.5;
    let x = 0;

    this.dataArray.forEach((value, i) => {
      const barHeight = ((value + 1) * height) / 2;

      // Couleur basée sur la fréquence
      const hue = (i / this.bufferLength) * 360;
      this.canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      this.canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    });
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  new VoiceRecognition();
});
