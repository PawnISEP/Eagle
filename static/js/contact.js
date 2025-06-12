document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle")
  const body = document.body
  const navbar = document.querySelector(".navbar")
  const logoImage = document.querySelector(".logo-image")
  const contactForm = document.getElementById("contact-form")

  // Fonction pour définir le thème
  const setTheme = (theme) => {
    body.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
    updateThemeToggleButton(theme)
    // Met à jour la source de l'image du logo en fonction du thème
    if (logoImage) {
      if (theme === "light") {
        logoImage.src = "{{ url_for('static', filename='images/logo2.png') }}"
      } else {
        logoImage.src = "{{ url_for('static', filename='images/logo1.png') }}"
      }
    }
  }

  // Fonction pour mettre à jour le texte et l'icône du bouton de bascule de thème
  const updateThemeToggleButton = (currentTheme) => {
    if (currentTheme === "dark") {
      themeToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon moon-icon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
        Clair
      `
    } else {
      themeToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon sun-icon"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1.41-1.41"></path></svg>
        Sombre
      `
    }
  }

  // Fonction pour gérer la visibilité de la barre de navigation au défilement
  const handleScroll = () => {
    if (window.scrollY < 50) {
      navbar.classList.add("visible")
    } else {
      navbar.classList.remove("visible")
    }
  }

  // Gère la soumission du formulaire
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault() // Empêche la soumission par défaut du formulaire

    const name = document.getElementById("name").value
    const email = document.getElementById("email").value
    const subject = document.getElementById("subject").value
    const message = document.getElementById("message").value

    // Validation basique
    if (!name || !email || !subject || !message) {
      alert("Veuillez remplir tous les champs du formulaire.")
      return
    }

    // Dans une application réelle, vous enverriez ces données à un serveur
    console.log("Formulaire soumis :", { name, email, subject, message })
    alert("Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.")

    // Efface le formulaire (optionnel)
    contactForm.reset()
  })

  // Charge le thème sauvegardé depuis localStorage ou utilise le thème sombre par défaut
  const savedTheme = localStorage.getItem("theme") || "dark"
  setTheme(savedTheme)

  // Vérification initiale de la visibilité de la barre de navigation
  handleScroll()

  // Bascule le thème au clic sur le bouton
  themeToggle.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme")
    const newTheme = currentTheme === "light" ? "dark" : "light"
    setTheme(newTheme)
  })

  // Écoute les événements de défilement pour basculer la visibilité de la barre de navigation
  window.addEventListener("scroll", handleScroll)
})
