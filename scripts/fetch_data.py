# fetch_data.py
import requests
import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
from datetime import datetime

# --- CONFIGURATION ---
# Exemple de zone (Méditerranée Ouest)
# Les données de Copernicus/NOAA vous permettront de faire une grille mondiale
LAT_MIN, LAT_MAX = 40.0, 43.0
LON_MIN, LON_MAX = 0.0, 5.0

# API météo marine gratuite (simule la sortie de données scientifiques)
# Source: Open-Meteo Marine API
API_URL = "https://marine-api.open-meteo.com/v1/marine"

# --- FONCTION DE TRAITEMENT ---

def fetch_and_process_data():
    """
    Simule la récupération des données (SST et Courants) et leur conversion en JSON.
    NOTE: Pour la Chlorophylle, il faudrait une API ou une source NetCDF spécifique.
    """
    
    # 1. Récupération des données (SST et Vitesse du vent en surface)
    params = {
        "latitude": f"{LAT_MIN},{LAT_MAX}",
        "longitude": f"{LON_MIN},{LON_MAX}",
        "hourly": ["sea_surface_temperature", "wave_height"],
        "forecast_days": 1,
        "format": "json"
    }
    
    print(f"Téléchargement des données pour la zone {LAT_MIN}-{LAT_MAX}...")
    response = requests.get(API_URL, params=params)
    
    if response.status_code != 200:
        print(f"ERREUR lors du téléchargement. Statut: {response.status_code}")
        return

    raw_data = response.json()
    
    # 2. Extraction et Formatage pour CesiumJS
    # Nous créons une grille simple de points (GeoJSON) pour le rendu Cesium
    
    hourly_data = raw_data.get("hourly", {})
    if not hourly_data or not hourly_data.get("time"):
        print("Aucune donnée horaire trouvée.")
        return

    time_index = 0 # On prend la première heure (proche du temps réel)
    
    # Liste de toutes les coordonnées
    latitudes = [float(l) for l in params["latitude"].split(',')]
    longitudes = [float(l) for l in params["longitude"].split(',')]
    
    # Structure de données simplifiée pour le front-end
    output_features = []
    
    # Ici, on simplifie car l'API retourne les valeurs dans un ordre linéaire
    # En réalité, votre script devrait remapper les grilles NetCDF en Lat/Lon
    # Pour cette démo, on utilise les points pour la température de surface (SST)
    
    # SIMULATION pour créer quelques points GeoJSON basiques
    for lat in range(int(LAT_MIN), int(LAT_MAX) + 1):
        for lon in range(int(LON_MIN), int(LON_MAX) + 1):
            
            # Ici, une valeur bidon est utilisée car l'API ne donne pas
            # les valeurs par grille directement sans plus de manipulation.
            # En réalité: 'temp = hourly_data["sea_surface_temperature"][index_de_la_grille]'
            temp_simul = 18.0 + (lat * 0.5) - (lon * 0.2) # Exemple de gradient
            
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    # C'est la donnée que Cesium va lire (ex: SST)
                    "temperature": round(temp_simul, 2), 
                    # Simule l'effet "Chlorophylle/Plankton"
                    "plankton_density": round((temp_simul - 17) * 0.1, 2) 
                }
            }
            output_features.append(feature)

    # Le fichier final (GeoJSON)
    geojson_output = {
        "type": "FeatureCollection",
        "features": output_features
    }

    # 3. Sauvegarde dans le dossier 'data'
    file_path = "data/marine_data.geojson"
    with open(file_path, 'w') as f:
        json.dump(geojson_output, f, indent=2)
    
    print(f"Succès : {len(output_features)} points de données sauvegardés dans {file_path}")

# --- EXÉCUTION ---
if __name__ == "__main__":
    fetch_and_process_data()
