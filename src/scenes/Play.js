class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
  }

  preload() {
        this.load.path = "./assets/";
        //Load characters
        this.load.atlas("pig", "pig.png", "pig.json");
  }

  create() {
    // Create the tilemap
    const map = this.make.tilemap({ key: "Map" });
    const tileset = map.addTilesetImage("tiles", "tiles");

    // Set the world bounds to match the size of this layer
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Create layers
    this.backGroundLayer = map.createLayer("Background", tileset, 0, 0);
    this.wallsLayer = map.createLayer("Fence", tileset, 0, 0);
    this.dirtLayer = map.createLayer("Dirt", tileset, 0, 0);

    // Set up collisions
    this.wallsLayer.setCollisionByProperty({ collides: true });

    // Create the pig sprite and add it to the scene
    this.player = this.physics.add.sprite(100, 100, "pig", "pig0.png");
    this.player.setScale(1);

    // Set the player to collide with the world bounds
    this.player.setCollideWorldBounds(true);

    // Add collision between 2 layers
    this.physics.add.collider(this.player, this.wallsLayer);

    // Camera setup to follow the player
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(1); // Set the desired zoom level

    // Enables Pointer
    gamePointer = this.input.activePointer;

    // Player's animation
    this.createAnimations();

    // Define Keyboard Inputs
    this.cursors = this.input.keyboard.createCursorKeys();

    // Grid size matches tile size in Tiled
    this.gridSize = 16;

    // Prevents diagonal movement and allows for grid-based movement
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
  }

createAnimations(){
    // pig animation 
    this.anims.create({
      key: "walkRight",
      frames: this.anims.generateFrameNames("pig", {
        start: 0,
        end: 2,
        zeroPad: 0,
        prefix: "pig",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "walkDown",
      frames: this.anims.generateFrameNames("pig", {
        start: 3,
        end: 5,
        zeroPad: 0,
        prefix: "pig",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "walkUp",
      frames: this.anims.generateFrameNames("pig", {
        start: 6,
        end: 8,
        zeroPad: 0,
        prefix: "pig",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "walkLeft",
      frames: this.anims.generateFrameNames("pig", {
        start: 9,
        end: 11,
        zeroPad: 0,
        prefix: "pig",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });

  }
  update() {
  }

  handleKeyDown(event) {
    if (!this.player.body.velocity.equals(new Phaser.Math.Vector2())) {
      // while we moving , ignore player spaming
      return;
    }
    
    // Player movement and animation based on grid
    switch(event.code) {
      case 'ArrowLeft':
        if (this.canMoveTo(this.player.x - this.gridSize, this.player.y)) {
          this.player.x -= this.gridSize;
          this.player.anims.play('walkLeft', true);
        }
        break;
      case 'ArrowRight':
        if (this.canMoveTo(this.player.x + this.gridSize, this.player.y)) {
          this.player.x += this.gridSize;
          this.player.anims.play('walkRight', true);
        }
        break;
      case 'ArrowUp':
        if (this.canMoveTo(this.player.x, this.player.y - this.gridSize)) {
          this.player.y -= this.gridSize;
          this.player.anims.play('walkUp', true);
        }
        break;
      case 'ArrowDown':
        if (this.canMoveTo(this.player.x, this.player.y + this.gridSize)) {
          this.player.y += this.gridSize;
          this.player.anims.play('walkDown', true);
        }
        break;
    }
  }

  canMoveTo(x, y) {
    // Check if the new x, y position in the world
    return x >= 0 && x <= this.physics.world.bounds.width &&
           y >= 0 && y <= this.physics.world.bounds.height &&
           !this.wallsLayer.getTileAtWorldXY(x, y);
  }


}
