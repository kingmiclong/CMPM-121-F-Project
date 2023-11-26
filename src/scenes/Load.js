class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
    
    }

    create() {
        // check for local storage browser support
        if(window.localStorage) {
            console.log('Local storage supported');
        } else {
            console.log('Local storage not supported');
        }

        // go to Title scene
        this.scene.start('playScene');
    }
}