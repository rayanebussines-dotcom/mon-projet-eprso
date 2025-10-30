// main.js

// --- 1. INITIALISATION DU GLOBE ---
const viewer = new Cesium.Viewer('cesiumContainer', {
    // Désactiver les options inutiles pour la performance si nécessaire
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    animation: false
});

// Positionnement initial (ex: sur Marseille)
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(5.37, 43.3, 15000) // Lon, Lat, Hauteur
});


// --- 2. LOGIQUE DE CHARGEMENT DES DONNÉES ---
async function loadMarineData() {
    // Chemin crucial : doit être relatif à index.html
    const dataUrl = 'data/marine_data.geojson'; 

    try {
        const response = await fetch(dataUrl);
        
        // Gérer les erreurs (ex: 404 - Fichier non trouvé)
        if (!response.ok) {
            console.error(`Erreur HTTP lors du chargement des données : ${response.statusText}`);
            return;
        }

        const geojsonData = await response.json();
        
        // **CONFIRMATION CLÉ :** Voir combien de points ont été chargés
        console.log(`SUCCÈS : ${geojsonData.features.length} points de données chargés.`);

        // Charger les données GeoJSON dans Cesium
        const dataSource = await Cesium.GeoJsonDataSource.load(geojsonData, {
            // Options de style
            stroke: Cesium.Color.RED,
            fill: Cesium.Color.BLUE.withAlpha(0.5),
            markerSymbol: 'm', // Utiliser des symboles de marqueur simples
            markerColor: Cesium.Color.YELLOW,
            clampToGround: true 
        });

        viewer.dataSources.add(dataSource);
        
    } catch (error) {
        console.error("Erreur fatale lors du chargement ou du parsing du GeoJSON:", error);
    }
}

// Lancer le chargement
loadMarineData();
