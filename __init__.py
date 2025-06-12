from flask import Flask
from flask import render_template
from flask import json
import sqlite3

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
    return render_template('actualites.html')

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
                                                                                                               
if __name__ == "__main__":
  app.run(debug=True)

