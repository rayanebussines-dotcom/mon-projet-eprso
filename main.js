// main.js - Code FINAL avec Fonctions d'Interface

// --- 1. INITIALISATION DU GLOBE ET VARIABLES ---
const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    animation: false
});

const dataUrl = 'data/marine_data.geojson'; 
let currentDataSource = null; // Pour garder une référence aux données chargées

// Positionnement initial (Marseille)
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(5.37, 43.3, 15000)
});


// --- 2. FONCTION PRINCIPALE DE CHARGEMENT ET RECHARGEMENT DES DONNÉES ---
async function loadMarineData() {
    document.getElementById('status').innerText = 'Statut: Chargement des données...';

    try {
        // Supprimer les anciennes données si elles existent pour recharger proprement
        if (currentDataSource) {
            viewer.dataSources.remove(currentDataSource, true);
        }
        
        // **Ajout pour garantir l'absence de cache navigateur lors du rechargement**
        const cacheBustingUrl = `${dataUrl}?t=${new Date().getTime()}`;
        
        const response = await fetch(cacheBustingUrl);
        
        if (!response.ok) {
            document.getElementById('status').innerText = `Erreur HTTP: ${response.statusText}`;
            console.error(`Erreur HTTP lors du chargement des données : ${response.statusText}`);
            return;
        }

        const geojsonData = await response.json();
        
        const dataSource = await Cesium.GeoJsonDataSource.load(geojsonData, {
            // Options de style pour les points
            markerSymbol: 'm',
            markerColor: Cesium.Color.YELLOW,
            clampToGround: true 
        });

        currentDataSource = dataSource; // Sauvegarder la référence
        viewer.dataSources.add(dataSource);
        
        document.getElementById('status').innerText = `Statut: Succès. ${geojsonData.features.length} points chargés.`;
        console.log(`SUCCÈS : ${geojsonData.features.length} points de données chargés.`);

    } catch (error) {
        document.getElementById('status').innerText = 'Statut: Erreur de lecture GeoJSON';
        console.error("Erreur fatale lors du chargement ou du parsing du GeoJSON:", error);
    }
}


// --- 3. FONCTION DE GÉOLOCALISATION (GPS DU PC) ---
function locateUser() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lon = position.coords.longitude;
                const lat = position.coords.latitude;
                
                document.getElementById('status').innerText = `Statut: GPS trouvé (${lat.toFixed(2)}, ${lon.toFixed(2)})`;

                // Centrer la caméra sur la position de l'utilisateur
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 5000) // 5 km d'altitude
                });
            },
            (error) => {
                document.getElementById('status').innerText = 'Statut: Géolocalisation refusée ou échouée.';
                console.error('Erreur de géolocalisation:', error);
            }
        );
    } else {
        document.getElementById('status').innerText = 'Statut: Géolocalisation non supportée.';
    }
}


// --- 4. GESTION DES ÉVÉNEMENTS ET LANCEMENT ---
document.getElementById('reloadButton').addEventListener('click', loadMarineData);
document.getElementById('locateButton').addEventListener('click', locateUser);

// Lancement initial au démarrage
loadMarineData();
