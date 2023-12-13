class LanguageManager {
    constructor(scene) {
        this.scene = scene;
        this.currentLanguage = 'en'; // default language
    }

    loadLanguage(language) {
        this.currentLanguage = language;
        if (this.scene) {
            this.scene.updateUI();
        }
    }
}

// @ts-ignore
window.languageManager = new LanguageManager();