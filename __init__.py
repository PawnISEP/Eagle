from flask import Flask, request, jsonify, render_template
import requests # Importez la bibliothèque requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# === ROUTES PRINCIPALES ===

@app.route('/')
def accueil():
    return render_template('accueil.html')

@app.route('/generateur-mot-de-passe')
def generateur_mot_de_passe():
    return render_template('generateur-mot-de-passe.html')

@app.route('/actualites')
def actualites():
    gnews_api_key = os.environ.get('NEXT_PUBLIC_GNEWS_API_KEY')
    return render_template('actualites.html', gnews_api_key=gnews_api_key)

@app.route('/contact')
def contact():
    return render_template('contact.html')

# === PAGES FOOTER ===

@app.route('/conditions')
def conditions_utilisation():
    return render_template('conditions-utilisation.html')

@app.route('/politique')
def politique_confidentialite():
    return render_template('politique-confidentialite.html')

@app.route('/protection')
def protection_donnees():
    return render_template('protection-donnees.html')

@app.route('/mentions')
def mentions_legales():
    return render_template('mentions-legales.html')

@app.route('/propos')
def a_propos():
    return render_template('a-propos.html')

# === NOUVELLE ROUTE PROXY POUR HIBP ===
@app.route('/api/check-email-breach', methods=['GET'])
def check_email_breach():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email parameter is missing"}), 400

    hibp_api_key = os.environ.get('NEXT_PUBLIC_HIBP_API_KEY')
    if not hibp_api_key:
        return jsonify({"error": "HIBP API key not configured on server"}), 500

    url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}?truncateResponse=false"
    headers = {
        "hibp-api-key": hibp_api_key,
        "User-Agent": "Eagle-Security-App"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status() # Lève une exception pour les codes d'état HTTP d'erreur (4xx ou 5xx)
        return jsonify(response.json()), response.status_code
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return jsonify([]), 200 # Retourne un tableau vide pour 404 (pas de fuites)
        elif e.response.status_code == 401:
            return jsonify({"error": "Unauthorized: Invalid HIBP API key"}), 401
        else:
            return jsonify({"error": f"HIBP API error: {e.response.status_code} - {e.response.text}"}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network or request error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
