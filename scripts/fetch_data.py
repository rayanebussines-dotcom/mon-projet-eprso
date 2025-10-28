import os
import json
from datetime import datetime

# Ligne FIX essentielle qui force l'exécution à la racine du dépôt
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) 

OUTPUT_FILE = "data/marine_data.geojson" 

# Contenu GeoJSON minimal pour garantir la réussite
raw_data = {
    "type": "FeatureCollection",
    "metadata": {
        "date_genere": datetime.now().isoformat(),
        "status": "Test réussi"
    },
    "features": []
}

with open(OUTPUT_FILE, 'w') as f:
    json.dump(raw_data, f, indent=2)
    
print("Opération de test réussie. Fichier créé.")
