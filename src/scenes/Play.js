class Play extends Phaser.Scene {
  constructor() {
    super("playScene");
    this.actionCount = 0;
    this.actionsPerTurn = 10; // Number of actions per turn
    this.currentTurn = 1; // Current turn number
    this.harvestedPlantsCount = 0; // for wining condition F0 last requirement
    this.gridState = null; // Byte array for grid state
    this.undoStack = []; // Undo stack
    this.redoStack = []; // Redo stack
    this.undoPressed = false; // testing Redo Stack
    this.redoPressed = false; // testing Undo Stack
  }

  preload() {
    this.load.path = "./assets/";
    //Load characters
    this.load.atlas("pig", "pig.png", "pig.json");

    // Load the scenario file
    this.load.json("scenarioConfig", "gameScenario.json");

    //Load plants
    this.load.spritesheet("plants", "plants.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    
     // Load language files
     this.load.json('en', 'en.json');
     this.load.json('zh', 'zh.json');
     this.load.json('ja', 'ja.json');
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
    // Initialize the byte array for the grid state
    const gridSize = this.dirtLayer.width * this.dirtLayer.height;
    this.gridState = new Uint8Array(gridSize * 3); // 3 bytes per tile

    // Prevents diagonal movement and allows for grid-based movement
    this.input.keyboard.on("keydown", this.handleKeyDown, this);

    // Define new Keyboard Inputs for planting and harvesting
    this.keys = {
      plant: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      harvest: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      undo: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T),
      redo: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
    };
    // Add the event listener for the Save Game button
    document.getElementById("saveGameButton").addEventListener("click", () => {
      this.saveGameToFile();
    });
    // Add the event listener for the Load Game button
    document.getElementById("loadGameButton").addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
      fileInput.onchange = (event) => {
        // Check if the target is an input element and has files
        const input = event.target;
        if (input instanceof HTMLInputElement && input.files.length > 0) {
          const file = input.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              // Check if the result is a string
              const result = e.target.result;
              if (typeof result === "string") {
                const gameState = JSON.parse(result);
                this.applyGameState(gameState);
              }
            };
            reader.readAsText(file);
          }
        }
      };
      fileInput.click();
    });

    // Auto-save every minute
    this.time.addEvent({
      delay: 60000, // 60000 ms = 1 minute
      callback: this.autoSaveGame,
      callbackScope: this,
      loop: true,
    });

    // Check for auto-save
    const autoSavedData = localStorage.getItem("autoSave");
    if (autoSavedData) {
      const confirmAutoLoad = confirm(
        "Do you want to continue where you left off?"
      );
      if (confirmAutoLoad) {
        this.applyGameState(JSON.parse(autoSavedData));
      } else {
        // Clear auto-save if the user does not want to use it
        localStorage.removeItem("autoSave");
      }
    }
    // Parse the scenario configuration
    const scenarioConfig = this.cache.json.get("scenarioConfig");
    const currentScenario = scenarioConfig.scenarios[0]; // For example, choosing the first scenario

    // Apply starting conditions
    this.currentTurn = currentScenario.startingConditions.initialTurn;
    this.actionsPerTurn = currentScenario.startingConditions.actionsPerTurn;
    this.player.setPosition(
      currentScenario.startingConditions.playerPosition.x,
      currentScenario.startingConditions.playerPosition.y
    );

    // Set up weather policy
    this.weatherPolicy = currentScenario.weatherPolicy;

    // Set up victory conditions
    this.victoryConditions = currentScenario.victoryConditions;

    // Initialize the text 
    // @ts-ignore
    window.languageManager.scene = this; // Set the current scene
    this.initializeTexts();
  }

  // Initialize the Text
  initializeTexts() {
    // Load the language file for the current language
    // @ts-ignore
    this.languageData = this.cache.json.get(window.languageManager.currentLanguage);

    // Initialize your text elements
    this.turnText = this.add.text(10, 10, '', { fontSize: '16px', color: '#FFFFFF' });
    this.actionText = this.add.text(10, 30, '', { fontSize: '16px', color: '#FFFFFF' });

    this.updateUI(); // Set their initial values
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

  // Event Handler - Key Pressing
  handleKeyDown(event) {
    // Movement keys
    if (this.handleMovementKeys(event)) {
      return; // If a movement key was pressed, we don't need to check other keys
    }

    // Planting and harvesting keys
    if (this.keys.plant.isDown) {
      this.plantAction();
    } else if (this.keys.harvest.isDown) {
      this.harvestAction();
    }
    // Undo/Redo keys
    this.handleUndoRedoKeys(event);
  }

  handleMovementKeys(event) {
    let targetX = this.player.x;
    let targetY = this.player.y;
    let moved = false;

    switch (event.code) {
      case "ArrowLeft":
        targetX -= this.gridSize;
        moved = true;
        break;
      case "ArrowRight":
        targetX += this.gridSize;
        moved = true;
        break;
      case "ArrowUp":
        targetY -= this.gridSize;
        moved = true;
        break;
      case "ArrowDown":
        targetY += this.gridSize;
        moved = true;
        break;
    }

    if (moved && this.canMoveTo(targetX, targetY)) {
      this.movePlayer(targetX, targetY);
      return true;
    }
    return false;
  }

  movePlayer(targetX, targetY) {
    // Determine the direction of movement and play corresponding animation
    if (targetX > this.player.x) {
      this.player.anims.play("walkRight", true);
    } else if (targetX < this.player.x) {
      this.player.anims.play("walkLeft", true);
    } else if (targetY > this.player.y) {
      this.player.anims.play("walkDown", true);
    } else if (targetY < this.player.y) {
      this.player.anims.play("walkUp", true);
    }

    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      ease: "Linear",
      duration: 300,
      onComplete: () => {
        this.player.anims.stop();
        this.actionTaken();
        this.recordGameState("move", { to: { x: targetX, y: targetY } });
      },
    });
  }

  handleUndoRedoKeys(event) {
    if (event.code === "KeyT" && !this.undoPressed) {
      this.undoAction();
      this.undoPressed = true;
    } else if (event.code === "KeyR" && !this.redoPressed) {
      this.redoAction();
      this.redoPressed = true;
    }

    // Reset flags on key release
    this.input.keyboard.on("keyup", (event) => {
      if (event.code === "KeyT") {
        this.undoPressed = false;
      } else if (event.code === "KeyR") {
        this.redoPressed = false;
      }
    });
  }
  // New method for planting action
  plantAction() {
    const tileX = this.dirtLayer.worldToTileX(this.player.x);
    const tileY = this.dirtLayer.worldToTileY(this.player.y);
    const tile = this.dirtLayer.getTileAt(tileX, tileY);

    if (tile && tile.properties.plantable && !this.getPlantAt(tileX, tileY)) {
      // Define species before using it in recordAction
      const species = Phaser.Utils.Array.GetRandom([
        "potato",
        "tomato",
        "eggplant",
      ]);
      this.plantSeed(tileX, tileY, species);
      console.log("Planted a " + species + " at:", tileX, tileY);
      this.actionTaken();

      // Now species is defined and can be used in recordAction
      this.recordGameState("plant", { species, tileX, tileY });
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
    if (!plant) {
      console.error("No plant found at:", tileX, tileY);
      return;
    }
    // Record the action for undo
    this.recordGameState("harvest", { species: plant.species, tileX, tileY });
  }

  // Modified method to record the entire game state
  recordGameState(actionType, additionalData = {}) {
    const gameState = {
      type: actionType,
      playerPosition: { x: this.player.x, y: this.player.y },
      plantStates: this.getPlantStates(), // This should include growth stages and environmental factors
      actionCount: this.actionCount,
      currentTurn: this.currentTurn,
      ...additionalData,
    };
    this.undoStack.push(gameState);
    this.redoStack = []; // Clear redo stack on new action
  }

  getPlantStates() {
    return this.plants.map((plant) => ({
      x: plant.sprite.x,
      y: plant.sprite.y,
      species: plant.species,
      growthStage: plant.growthStage,
      sunlight: [...plant.sunlight], // Clone the arrays
      water: [...plant.water],
    }));
  }

  undoAction() {
    if (this.undoStack.length > 0) {
      const prevState = this.undoStack.pop();
      this.applyGameState(prevState);
      this.redoStack.push(this.createCurrentGameState()); // Save the current state before undo
    }
  }

  redoAction() {
    if (this.redoStack.length > 0) {
      const nextState = this.redoStack.pop();
      this.applyGameState(nextState);
      this.undoStack.push(this.createCurrentGameState()); // Save the current state before redo
    }
  }

  createCurrentGameState() {
    return {
      playerPosition: { x: this.player.x, y: this.player.y },
      plantStates: this.getPlantStates(),
      actionCount: this.actionCount,
      currentTurn: this.currentTurn,
      // Any additional data needed
    };
  }

  applyGameState(gameState) {
    // Apply player position
    this.player.setPosition(
      gameState.playerPosition.x,
      gameState.playerPosition.y
    );

    // Apply plant states
    this.applyPlantStates(gameState.plantStates);

    // Apply action count and turn number
    this.actionCount = gameState.actionCount;
    this.currentTurn = gameState.currentTurn;

    // Update UI elements
    this.updateUI();
  }

  applyPlantStates(plantStates) {
    // First, destroy existing plant sprites
    this.plants.forEach((plant) => plant.sprite.destroy());
    this.plants = [];

    // Then, recreate plants based on the saved states
    plantStates.forEach((state) => {
      const plant = new Plant(this, state.x, state.y, state.species);
      plant.growthStage = state.growthStage;
      plant.sunlight = [...state.sunlight];
      plant.water = [...state.water];
      plant.isReadyToHarvest = state.isReadyToHarvest; // Restore harvest state
      plant.updateSprite(); // Update the sprite frame based on the growth stage
      this.plants.push(plant);
    });
  }

  getGridState(tileX, tileY) {
    // Retrieve the current grid state for the given tile
    const index = this.getGridStateIndex(tileX, tileY);
    return {
      plantable: this.gridState[index],
      speciesCode: this.gridState[index + 1],
      growthStage: this.gridState[index + 2],
    };
  }

  setGridState(tileX, tileY, state) {
    // Set the grid state for the given tile
    const index = this.getGridStateIndex(tileX, tileY);
    this.gridState[index] = state.plantable;
    this.gridState[index + 1] = state.speciesCode;
    this.gridState[index + 2] = state.growthStage;
  }

  applyGridStateChange(action) {
    // Apply the grid state changes based on the action
    const index = this.getGridStateIndex(action.tileX, action.tileY);
    if (action.type === "plant") {
      this.gridState[index] = 1;
      this.gridState[index + 1] = this.getSpeciesFromCode(action.species);
      this.gridState[index + 2] = 0;
    } else if (action.type === "harvest") {
      this.gridState[index] = 0;
      this.gridState[index + 1] = 0;
      this.gridState[index + 2] = 0;
    }
  }

  getReverseAction(action) {
    if (action.type === "move") {
      return { type: "move", from: action.to, to: action.from };
    }
    if (action.type === "plant") {
      return {
        type: "harvest",
        tileX: action.tileX,
        tileY: action.tileY,
        species: action.species,
      };
    } else if (action.type === "harvest") {
      return {
        type: "plant",
        tileX: action.tileX,
        tileY: action.tileY,
        species: action.species,
      };
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

  updateUI() {
    // Assuming window.languageManager.currentLanguage is set correctly
    // and this.cache.json.get(...) retrieves the correct language data
    // @ts-ignore
    this.languageData = this.cache.json.get(window.languageManager.currentLanguage);

    // Update Phaser UI elements
    this.turnText.setText(`${this.languageData["Turn"]}: ${this.currentTurn}`);
    this.actionText.setText(`${this.languageData["Action"]}: ${this.actionsPerTurn - this.actionCount}`);

    // Update HTML button texts
    document.getElementById('saveGameButton').innerText = this.languageData["Save"];
    document.getElementById('loadGameButton').innerText = this.languageData["Load"];
}

  // Change Language
  changeLanguage(newLanguage) {
    this.currentLanguage = newLanguage;
    this.languageData = this.cache.json.get(this.currentLanguage);
    this.updateUI();
  }
  // Action counting method
  actionTaken() {
    this.actionCount++;
    if (this.actionCount >= this.actionsPerTurn) {
      this.endTurn();
    } else {
      this.updateUI(); // Update UI only if the turn hasn't ended
    }
  }

  // End Turn and update Environment and update Plant
  endTurn() {
    // Increase turn number and reset the action count
    this.currentTurn++;
    this.actionCount = 0;

    // Update game state for the new turn
    this.updateUI();
    this.updateTileEnvironment();
    this.updatePlantsWithEnvironment(); // Updates plants based on the environment

    // Record the state of the game
    this.recordGameState("endTurn");

    // Log the end of the turn for debugging
    console.log("Turn ended");
  }

  updateTileEnvironment() {
    if (!this.weatherPolicy) {
      console.error("Weather policy is not defined.");
      return;
    }

    this.dirtLayer.forEachTile((tile) => {
      tile.properties.sunValue = Phaser.Math.Between(
        this.weatherPolicy.sunlightRange[0],
        this.weatherPolicy.sunlightRange[1]
      );
      tile.properties.waterValue = Phaser.Math.Between(
        this.weatherPolicy.waterRange[0],
        this.weatherPolicy.waterRange[1]
      );
    });
  }

  updatePlantsWithEnvironment() {
    // update plant value
    this.plants.forEach((plant) => {
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

    // Check victory condition
    if (!this.victoryConditions) {
      console.error("Victory conditions are not defined.");
      return;
    }

    if (
      this.harvestedPlantsCount === this.victoryConditions.harvestedPlantsCount
    ) {
      window.alert("Victory! You harvested the required number of plants.");
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

    // Update grid state byte array
    const index = this.getGridStateIndex(tileX, tileY);
    this.gridState[index] = 1; // Mark tile as plantable
    this.gridState[index + 1] = this.getSpeciesFromCode(species); // Set species code
    this.gridState[index + 2] = 0; // Initial growth stage
  }

  // Testing - GridSate
  getGridStateIndex(tileX, tileY) {
    return (tileY * this.dirtLayer.width + tileX) * 3;
  }

  //Testing - Species Serial
  getSpeciesFromCode(code) {
    const speciesByCode = {
      0: "none",
      1: "potato",
      2: "tomato",
      3: "eggplant",
    };
    return speciesByCode[code] || "none";
  }

  updatePlants() {
    this.plants.forEach((plant) => {
      plant.checkGrowthConditions();
      // Update GridState with the new growth stage
      const tileX = this.dirtLayer.worldToTileX(plant.sprite.x);
      const tileY = this.dirtLayer.worldToTileY(plant.sprite.y);
      const index = this.getGridStateIndex(tileX, tileY);
      this.gridState[index + 2] = plant.growthStage;
    });
  }
  saveGameToFile() {
    const gameState = this.createCurrentGameState(); // Assuming this method returns all necessary game state data
    const gameStateString = JSON.stringify(gameState);
    const blob = new Blob([gameStateString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "gameState.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  autoSaveGame() {
    const gameState = this.createCurrentGameState();
    localStorage.setItem("autoSave", JSON.stringify(gameState));
    console.log("Game auto-saved.");
  }
}
