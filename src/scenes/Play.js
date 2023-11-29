class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
    this.actionCount = 0;
    this.actionsPerTurn = 10; // Number of actions per turn
    this.currentTurn = 1; // Current turn number
    this.harvestedPlantsCount = 0; // for wining condition F0 last requirement
  }

  preload() {
    this.load.path = "./assets/";
    //Load characters
    this.load.atlas("pig", "pig.png", "pig.json");

    //Load plants
    this.load.spritesheet("plants", "plants.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    // Array - Plants
    this.plants = [];

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

    // Create text elements for turn number and action counter with corrected style
    this.turnText = this.add.text(10, 10, "Turn: 1", {
      fontSize: "16px",
      color: "#FFFFFF",
    });
    this.actionText = this.add.text(10, 30, "Actions Left: 10", {
      fontSize: "16px",
      color: "#FFFFFF",
    });

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
    this.input.keyboard.on("keydown", this.handleKeyDown, this);

    // Define new Keyboard Inputs for planting and harvesting
    this.keys = {
      plant: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      harvest: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    };

    // Animations create for plants
    this.anims.create({
      key: "growPotato",
      frames: this.anims.generateFrameNumbers("plants", { start: 0, end: 3 }),
      frameRate: 10,
    });
    this.anims.create({
      key: "growTomato",
      frames: this.anims.generateFrameNumbers("plants", { start: 4, end: 7 }),
      frameRate: 10,
    });
    this.anims.create({
      key: "growEggplant",
      frames: this.anims.generateFrameNumbers("plants", { start: 8, end: 11 }),
      frameRate: 10,
    });
  }

  createAnimations() {
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

  // Event Handler - Key Pressing
  handleKeyDown(event) {
    let targetX = this.player.x;
    let targetY = this.player.y;
    let moved = false; // Flag 

    // Handle movement directly without checking the velocity
    switch (event.code) {
      case "ArrowLeft":
        targetX -= this.gridSize;
        this.player.anims.play("walkLeft", true);
        moved = true;
        break;
      case "ArrowRight":
        targetX += this.gridSize;
        this.player.anims.play("walkRight", true);
        moved = true;
        break;
      case "ArrowUp":
        targetY -= this.gridSize;
        this.player.anims.play("walkUp", true);
        moved = true;
        break;
      case "ArrowDown":
        targetY += this.gridSize;
        this.player.anims.play("walkDown", true);
        moved = true;
        break;
    }

    // Limit movement while pressing the key
    if (moved && this.canMoveTo(targetX, targetY)) {
      this.tweens.add({
        targets: this.player,
        x: targetX,
        y: targetY,
        ease: "Linear",
        duration: 200,
        onComplete: () => {
          this.player.anims.stop();
          this.actionTaken();
        },
      });
    }

    // Q is plant W is harvest
    if (this.keys.plant.isDown) {
      this.plantAction();
    } else if (this.keys.harvest.isDown) {
      this.harvestAction();
    }
  }

  // New method for planting action
  plantAction() {
    const tileX = this.dirtLayer.worldToTileX(this.player.x);
    const tileY = this.dirtLayer.worldToTileY(this.player.y);
    const tile = this.dirtLayer.getTileAt(tileX, tileY);
    if (
      tile &&
      tile.properties.plantable &&
      !this.getPlantAt(tileX, tileY) // Tile Coordinate
    ) {
      const species = Phaser.Utils.Array.GetRandom([
        "potato",
        "tomato",
        "eggplant",
      ]);
      this.plantSeed(tileX, tileY, species);
      console.log("Planted a " + species + " at:", tileX, tileY);
      this.actionTaken();
    }
  }

  // New method for harvesting action
  harvestAction() {
    const tileX = this.dirtLayer.worldToTileX(this.player.x);
    const tileY = this.dirtLayer.worldToTileY(this.player.y);
    const plant = this.getPlantAt(tileX, tileY); // Tile Coordinate
    if (plant && plant.isReadyToHarvest) {
      this.harvestPlant(plant);
      this.actionTaken();
    }
  }

  // Position record
  canMoveTo(x, y) {
    // Check if the new x, y position in the world
    return (
      x >= 0 &&
      x <= this.physics.world.bounds.width &&
      y >= 0 &&
      y <= this.physics.world.bounds.height &&
      !this.wallsLayer.getTileAtWorldXY(x, y)
    );
  }

  // Action counting
  actionTaken() {
    this.actionCount++;
    this.actionText.setText(
      "Actions Left: " + (this.actionsPerTurn - this.actionCount)
    );

    if (this.actionCount >= this.actionsPerTurn) {
      this.endTurn();
    }
  }

  // End Turn and update Environment and update Plant
  endTurn() {
    // Increase turn number and reset the action count
    this.currentTurn++;
    this.actionCount = 0;

    // Update text elements
    this.turnText.setText("Turn: " + this.currentTurn);
    this.actionText.setText("Actions Left: " + this.actionsPerTurn);

    // Update game state for the new turn
    this.updateTileEnvironment();
    this.updatePlantsWithEnvironment();
    this.updatePlants();

    // Log the end of the turn for debugging
    console.log("Turn ended");

  }

  updateTileEnvironment() {
    // random value for dirt layer - each tile
    this.dirtLayer.forEachTile(tile => {
      // Directly modifying the custom properties of each tile
      tile.properties.sunValue = Phaser.Math.Between(20, 50);
      tile.properties.waterValue = Phaser.Math.Between(20, 50);
    });
  }

  updatePlantsWithEnvironment() {
    // update plant value 
    this.plants.forEach(plant => {
      const tileX = this.dirtLayer.worldToTileX(plant.sprite.x);
      const tileY = this.dirtLayer.worldToTileY(plant.sprite.y);
      const tile = this.dirtLayer.getTileAt(tileX, tileY);
  
      if (tile) {
        plant.sunlight.push(tile.properties.sunValue);
        plant.water.push(tile.properties.waterValue);
      }
  
      plant.checkGrowthConditions();
    });
  } 
  harvestPlant(plant) {
    // Convert plant world coordinates to tile coordinates for logging
    const tileX = this.dirtLayer.worldToTileX(plant.sprite.x);
    const tileY = this.dirtLayer.worldToTileY(plant.sprite.y);
    console.log(
      "Harvested a " + plant.species + " at tile coordinates:",
      tileX,
      tileY
    );
    plant.sprite.destroy();
    this.plants = this.plants.filter((p) => p !== plant);

     // Win condition counter
    this.harvestedPlantsCount++;

    // Check if the player harvested 30 plants
    if (this.harvestedPlantsCount === 30) {
      window.alert("You harvested 30 random plants, haha~");
    }
}
  

  getPlantAt(tileX, tileY) {
    return this.plants.find((plant) => {
      // Convert plant world coordinates to tile coordinates for comparison
      const plantTileX = this.dirtLayer.worldToTileX(plant.sprite.x);
      const plantTileY = this.dirtLayer.worldToTileY(plant.sprite.y);
      return tileX === plantTileX && tileY === plantTileY;
    });
  }

  // Not sure if I can make this call after or before Event handler
  attemptPlantingOrHarvesting() {
    // Convert the player's world position to tile coordinates
    const tileX = this.dirtLayer.worldToTileX(this.player.x);
    const tileY = this.dirtLayer.worldToTileY(this.player.y);

    // Access the tile using tile coordinates
    const tile = this.dirtLayer.getTileAt(tileX, tileY);

    // Check for a plant at the player's current position
    const plant = this.getPlantAt(this.player.x, this.player.y);
    if (plant) {
      if (plant.isReadyToHarvest) {
        this.harvestPlant(plant);
      } else {
        console.log("The plant is not ready to be harvested yet.");
      }
    } else if (tile && tile.properties.plantable) {
      this.plantSeed(
        tileX,
        tileY,
        Phaser.Utils.Array.GetRandom(["potato", "tomato", "eggplant"])
      );
    }
  }

  // Plants functions
  plantSeed(tileX, tileY, species) {
    // Convert tile coordinates back to world coordinates for placing the sprite
    const x = tileX * this.gridSize + this.gridSize / 2;
    const y = tileY * this.gridSize + this.gridSize / 2;

    if (!this.getPlantAt(x, y)) {
      const plant = new Plant(this, x, y, species);
      this.plants.push(plant);
    }
  }
  updatePlants() {
    this.plants.forEach((plant) => {
        plant.checkGrowthConditions(); // Check growth conditions 
    });
  }
}
