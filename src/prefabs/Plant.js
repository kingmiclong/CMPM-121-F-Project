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
    static species = {};

    static defineSpecies(name) {
        const species = new PlantType(name);
        this.species[name] = species;
        return species;
    }

    static getSpeciesData(species) {
        return this.species[species] ? this.species[species].getData() : null;
    }

    static getFrameForSpecies(species, growthStage) {
        const speciesData = this.getSpeciesData(species);
        if (!speciesData || !speciesData.frames[growthStage]) {
            console.error('Invalid species or growth stage:', species, growthStage);
            return 0;
        }
        return speciesData.frames[growthStage];
    }
}

class PlantType {
    constructor(name) {
        this.name = name;
        this.sun = {};
        this.water = {};
        this.frames = [];
    }

    setSunRange(min, max) {
        this.sun = { min, max };
        return this;
    }

    setWaterRange(min, max) {
        this.water = { min, max };
        return this;
    }

    setFrames(frames) {
        this.frames = frames;
        return this;
    }

    getData() {
        return {
            sun: this.sun,
            water: this.water,
            frames: this.frames,
        };
    }
}

// Define species with the new DSL
PlantSpecies.defineSpecies('potato')
    .setSunRange(25, 35)
    .setWaterRange(20, 30)
    .setFrames([0, 1, 2, 3]);

PlantSpecies.defineSpecies('tomato')
    .setSunRange(30, 40)
    .setWaterRange(25, 35)
    .setFrames([4, 5, 6, 7]);

PlantSpecies.defineSpecies('eggplant')
    .setSunRange(30, 40)
    .setWaterRange(30, 40)
    .setFrames([8, 9, 10, 11]);