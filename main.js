// main.js - Le Cerveau du Projet EPRSO

// La fonction asynchrone auto-exécutée (pour garantir le bon fonctionnement de 'await')
(async function() {

  console.log("Le moteur démarre.");

  // 1. Authentification
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNjc2NzE2Yi02NGQ4LTRhNDctOGZhMy1hMjllZmIwMzczMzgiLCJpZCI6MzUzMzgzLCJpYXQiOjE3NjE2NTY1ODV9.fIc9gO2PD8ziF7UcQa20JmCr_Bq8Agqm0iUvSwKqyZk'; 

  try {
    const viewer = new Cesium.Viewer('cesiumContainer', {
      
      // Configuration de la Bathymétrie 3D (Module 1)
      terrainProvider: await Cesium.createWorldTerrainAsync({
        requestWaterMask: true,     
        requestVertexNormals: true  
      }),
      
      // Widgets (interface épurée)
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false
    });

    // 2. Réglages de la Scène
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
    viewer.scene.skyAtmosphere.show = false;
    viewer.scene.backgroundColor = Cesium.Color.BLACK;
    
    // -----------------------------------------------------
    // 3. MODULE GPS IMMÉDIAT (Détection et Suivi) - (Module 6)
    // -----------------------------------------------------

    const monBateau = viewer.entities.add({
      name: 'Mon Bateau',
      position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
      point: {
        pixelSize: 15,
        color: Cesium.Color.RED, 
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3
      },
      label: {
          text: 'MON EPRSO', 
          font: '14pt sans-serif',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
      }
    });

    if (navigator.geolocation) {
      console.log("Tentative de détection GPS...");
      
      navigator.geolocation.watchPosition(
        function(position) {
          const longitude = position.coords.longitude;
          const latitude = position.coords.latitude;
          const altitude = position.coords.altitude || 0;

          monBateau.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

          if (!viewer.trackedEntity) {
            viewer.trackedEntity = monBateau;
          }
          
        },
        function(error) {
          console.error("Erreur GPS - Permission refusée ou position non disponible. Message : " + error.message);
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(3, 45, 1500000) 
          });
        },
        { enableHighAccuracy: true }
      );

    } else {
      console.warn("Le GPS n'est pas supporté par votre PC.");
    }
    
    // -----------------------------------------------------
    // 4. MODULES 2, 3 & 5 : SST, CHLOROPHYLLE/PLANKTON & ZONES BIOLOGIQUES
    // -----------------------------------------------------

    // Charger le fichier GeoJSON créé par le Robot Collecteur (GitHub Action)
    const marineDataSource = Cesium.GeoJsonDataSource.load('data/marine_data.geojson', {
        clampToGround: true
    });

    viewer.dataSources.add(marineDataSource).then(function(dataSource) {
        
        const entities = dataSource.entities.values;

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const props = entity.properties;
            
            // Assurez-vous que les propriétés existent avant de les lire
            const temperature = props.temperature ? props.temperature.getValue() : 0;
            const plankton_density = props.plankton_density ? props.plankton_density.getValue() : 0; 
            
            // Logique de zone favorable (Module 5)
            // Ex: Température dans une bonne plage ET densité élevée
            const isFavorable = (temperature >= 18 && temperature <= 20) || (plankton_density > 0.3);
            
            let pointColor = Cesium.Color.fromHsl(0.0, 0.0, 0.5); 

            if (isFavorable) {
                // Couleur dynamique basée sur la densité du Plankton
                const hue = 0.33 * (1 - Math.min(plankton_density * 3, 1)); 
                pointColor = Cesium.Color.fromHsl(hue, 1.0, 0.5); 
            } else {
                 pointColor = Cesium.Color.GREY; 
            }
            
            // Affichage des données (Module 3)
            entity.point = {
                pixelSize: 10,
                color: pointColor,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 1,
            };

            // Affichage des informations détaillées au survol 
            entity.description = `
                <p>Température (SST): <b>${temperature}°C</b></p>
                <p>Densité Plankton: <b>${plankton_density}</b></p>
                <p>Zone Biologique : <b>${isFavorable ? '✅ OUI' : '❌ NON'}</b></p>
            `;
        }
        
        console.log(`Données marines (SST/Plankton) chargées et affichées.`);
    });


  } catch (error) {
    console.error("Échec du chargement du globe Cesium. Vérifiez votre clé Cesium ION.", error);
  }

})();