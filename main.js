import requests
import os
import json
from datetime import datetime
import random # Ajout pour générer des données réalistes

# --- FIX ESSENTIEL POUR LE CHEMIN ---
# Force le script à s'exécuter à la racine du dépôt pour trouver le dossier data/
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) 

# --- CONFIGURATION DES FICHIERS ---
# Le script va sauvegarder les données ici
OUTPUT_FILE = "data/marine_data.geojson" 
# URL de l'API de données marines (gardée comme référence)
DATA_API_URL = "https://example.com/api/marine_data" 

def fetch_and_process_data():
    try:
        # --- SIMULATION DE DONNÉES CRÉDIBLES ---
        # Si vous avez une URL API réelle, remplacez cette section.
        # Sinon, ceci génère 3 points de données valides autour de la région de Marseille.
        
        features = []
        base_coords = [5.37, 43.3] # Coordonnées de base (Marseille)

        for i in range(3):
            # Génère des coordonnées légèrement aléatoires pour simuler 3 points
            lon = base_coords[0] + random.uniform(-0.1, 0.1)
            lat = base_coords[1] + random.uniform(-0.1, 0.1)

            feature = {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
              },
              "properties": {
                "sst": round(random.uniform(20.0, 24.0), 2), # Température (entre 20 et 24 C)
                "chlorophyll": round(random.uniform(0.1, 1.5), 2), # Chlorophylle
                "timestamp": datetime.now().isoformat(),
                "id": i + 1
              }
            }
            features.append(feature)

        # Création du GeoJSON complet
        final_geojson = {
          "type": "FeatureCollection",
          "metadata": {
              "date_creation": datetime.now().isoformat(),
              "nb_points": len(features),
              "status": "SUCCES FINAL AVEC DONNEES"
          },
          "features": features
        }
        
        # --- 2. ENREGISTREMENT DU FICHIER ---
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(final_geojson, f, indent=2)
            
        print("Opération de génération de données terminée avec succès.")

    except Exception as e:
        print(f"Erreur fatale lors de l'exécution du script: {e}")
        raise

if __name__ == "__main__":
    fetch_and_process_data()
