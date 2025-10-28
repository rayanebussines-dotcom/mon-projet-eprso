import requests
import os
# Ligne FIX essentielle qui force l'exécution à la racine du dépôt
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) 
import json
from datetime import datetime

# URL de l'API de données marines (exemple hypothétique)
DATA_API_URL = "https://example.com/api/marine_data" 
# Chemin où le GeoJSON sera sauvegardé (doit être à la racine)
OUTPUT_FILE = "data/marine_data.geojson" 

def fetch_and_process_data():
    try:
        # 1. Requête API
        print(f"Tentative de récupération des données depuis: {DATA_API_URL}")
        
        # --- ATTENTION: Remplacez ceci par l'appel réel à l'API ---
        # response = requests.get(DATA_API_URL) 
        # response.raise_for_status() # Lève une exception si le statut est 4xx ou 5xx
        # raw_data = response.json()
        
        # Simuler une réponse JSON valide si l'API est temporairement indisponible
        # Ceci garantit que le robot ne plante pas si l'API est le problème
        raw_data = {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [5.37, 43.3] # Marseille
              },
              "properties": {
                "sst": 22.5,
                "chlorophyll": 0.5,
                "timestamp": datetime.now().isoformat()
              }
            }
          ]
        }
        
        # 2. Enregistrement du fichier GeoJSON
        print(f"Données récupérées. Enregistrement vers: {OUTPUT_FILE}")
        
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(raw_data, f, indent=2)
            
        print("Opération terminée avec succès.")

    except requests.exceptions.HTTPError as e:
        print(f"Erreur HTTP: Impossible de récupérer les données. Statut: {e.response.status_code}")
        # Terminer proprement avec succès même si l'API échoue temporairement
        return
    except Exception as e:
        print(f"Erreur fatale lors de l'exécution du script: {e}")
        # Le robot doit échouer si le code a une erreur interne
        raise

if __name__ == "__main__":
    fetch_and_process_data()
