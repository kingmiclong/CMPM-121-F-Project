class Plant {
    constructor(scene, x, y, species) {
        this.scene = scene;
        this.sunlight = [];
        this.water = [];
        this.species = species;
        this.growthStage = 0;
        this.isReadyToHarvest = false;
        
        const frame = PlantSpecies.getFrameForSpecies(species, this.growthStage);
        this.sprite = scene.add.sprite(x, y, 'plants', frame);
    }

    updateSprite() {
        const frame = PlantSpecies.getFrameForSpecies(this.species, this.growthStage);
        this.sprite.setFrame(frame);
    }

    grow() {
        if (this.growthStage < 3) {
            this.growthStage++;
            this.updateSprite();
            this.isReadyToHarvest = this.growthStage === 3;
        }
    }

    checkGrowthConditions() {
        const speciesData = PlantSpecies.getSpeciesData(this.species);
        if (!speciesData) {
            console.error('Growth conditions are undefined for species:', this.species);
            return;
        }

        const currentSunlight = this.sunlight.reduce((a, b) => a + b, 0);
        const currentWater = this.water.reduce((a, b) => a + b, 0);

        if (currentSunlight >= speciesData.sun.min && currentSunlight <= speciesData.sun.max &&
            currentWater >= speciesData.water.min && currentWater <= speciesData.water.max) {
            this.grow();
        }

        this.sunlight = [];
        this.water = [];
    }

    harvest() {
        this.growthStage = 0;
        this.isReadyToHarvest = false;
        this.updateSprite();
        console.log("Plant reset to seed stage.");
    }
}

class PlantSpecies {
    static species = {
        'potato': {
            sun: {min: 25, max: 35},
            water: {min: 20, max: 30},
            frames: [0, 1, 2, 3]
        },
        'tomato': {
            sun: {min: 30, max: 40},
            water: {min: 25, max: 35},
            frames: [4, 5, 6, 7]
        },
        'eggplant': {
            sun: {min: 30, max: 40},
            water: {min: 30, max: 40},
            frames: [8, 9, 10, 11]
        },
    };

    static getSpeciesData(species) {
        return this.species[species];
    }

    static getFrameForSpecies(species, growthStage) {
        const speciesData = this.species[species];
        if (!speciesData || !speciesData.frames[growthStage]) {
            console.error('Invalid species or growth stage:', species, growthStage);
            return 0;
        }
        return speciesData.frames[growthStage];
    }
}