class Plant {
    constructor(scene, x, y, species) {
        this.scene = scene;
        this.species = species; // 'potato', 'tomato', or 'eggplant'
        this.growthStage = 0;
        this.isReadyToHarvest = false;

        // Determine the frame based on the species
        const frame = this.getFrameForSpecies(species, this.growthStage);
        this.sprite = scene.add.sprite(x, y, 'plants', frame);
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

    harvest() {
        // Reset the growth again
        this.growthStage = 0;
        this.isReadyToHarvest = false;
        this.sprite.setFrame(this.getFrameForSpecies(this.species, this.growthStage));
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