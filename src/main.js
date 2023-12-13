let config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: "#8e9490",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: {
        x: 0,
        y: 0,
      },
    },
  },
  scene: [Load, Play],
};

let game = new Phaser.Game(config);

// Keyboard Inputs
let keyW, keyA, keyS, keyD;

// Game Pointer
let gamePointer;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}