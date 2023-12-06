class Plant {
    constructor(scene, x, y, species) {
        this.scene = scene;
        this.sunlight = []; // Sunlight
        this.water = []; // Water
        this.species = species; // 'potato', 'tomato', or 'eggplant'
        this.growthStage = 0;
        this.isReadyToHarvest = false;

        // Determine the frame based on the species
        const frame = this.getFrameForSpecies(species, this.growthStage);
        this.sprite = scene.add.sprite(x, y, 'plants', frame);
    }

    // Method to update the sprite frame
    updateSprite() {
        const frame = this.getFrameForSpecies(this.species, this.growthStage);
        this.sprite.setFrame(frame);
    }
    
    grow() {
        if (this.growthStage < 3) { // 4 grow stages including seed 1st planted
            this.growthStage++;
            this.sprite.setFrame(this.getFrameForSpecies(this.species, this.growthStage));
            if (this.growthStage === 3) {
                this.isReadyToHarvest = true;
            }
        }
    }

    // Grow condition
    checkGrowthConditions() {
        const currentSunlight = this.sunlight.reduce((a, b) => a + b, 0); // Total sunlight
        const currentWater = this.water.reduce((a, b) => a + b, 0); // Total water

        const sunNeeded = this.getSunNeeded();  
        const waterNeeded = this.getWaterNeeded();

        if (currentSunlight >= sunNeeded.min && currentSunlight <= sunNeeded.max &&
            currentWater >= waterNeeded.min && currentWater <= waterNeeded.max) 
        {
            this.grow();
        }
        if (!sunNeeded || !waterNeeded) // Testing error and stop immediately
        { 
            console.error('Growth conditions are undefined for species:', this.species, 'at growth stage:', this.growthStage);
            return;
        }
        // Reset the sunlight and water after checking
        this.sunlight = [];
        this.water = [];
    }

    // Sun value
    getSunNeeded() {
        const sunRequirements = {
            'tomato': {min: 30, max: 40},
            'potato': {min: 25, max: 35},
            'eggplant': {min: 30, max: 40}
        };
        
        if (!sunRequirements[this.species]) {
            console.error('Invalid species for sun requirements:', this.species);
            return { min: 0, max: 0 }; // or handle it differently
        }
    
        return sunRequirements[this.species];
    }
    
    // Water value
    getWaterNeeded() {
        const waterRequirements = {
            'tomato': {min: 30, max: 40},
            'potato': {min: 25, max: 35},
            'eggplant': {min: 30, max: 40}
        };
        if (!waterRequirements[this.species]) {
            console.error('Invalid species for sun requirements:', this.species);
            return { min: 0, max: 0 }; // or handle it differently
        }
        return waterRequirements[this.species];
    }

    harvest() {
        // Reset the growth again
        this.growthStage = 0;
        this.isReadyToHarvest = false;
        this.sprite.setFrame(this.getFrameForSpecies(this.species, this.growthStage));
        console.log("Plant reset to seed stage.");
    }

    getFrameForSpecies(species, growthStage) {
        const baseFrame = {
            'potato': 0,
            'tomato': 4,
            'eggplant': 8
        };
        return baseFrame[species] + growthStage;
    }
}