document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle")
  const body = document.body
  const navbar = document.querySelector(".navbar")
  const logoImage = document.querySelector(".logo-image")

  const passwordLengthInput = document.getElementById("password-length")
  const lengthValueSpan = document.getElementById("length-value")
  const uppercaseCheckbox = document.getElementById("uppercase")
  const lowercaseCheckbox = document.getElementById("lowercase")
  const numbersCheckbox = document.getElementById("numbers")
  const symbolsCheckbox = document.getElementById("symbols")
  const passwordGrid = document.getElementById("password-grid")

  const CHARS_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const CHARS_LOWER = "abcdefghijklmnopqrstuvwxyz"
  const CHARS_NUMBERS = "0123456789"
  const CHARS_SYMBOLS = "!@#$%^&*()_+-=[]{}|;':\",.<>/?"

  // Fonction pour définir le thème
  const setTheme = (theme) => {
    body.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
    updateThemeToggleButton(theme)
    // Met à jour la source de l'image du logo en fonction du thème
    if (logoImage) {
      if (theme === "light") {
        logoImage.src = "../public/images/logo2.png" // Utilise le logo noir pour le thème clair
      } else {
        logoImage.src = "../public/images/logo1.png" // Utilise le logo blanc pour le thème sombre
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
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon sun-icon"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1-1.41"></path></svg>
        Sombre
      `
    }
  }

  // Logique de génération de mot de passe
  const generatePassword = (length, options) => {
    let charset = ""
    if (options.uppercase) charset += CHARS_UPPER
    if (options.lowercase) charset += CHARS_LOWER
    if (options.numbers) charset += CHARS_NUMBERS
    if (options.symbols) charset += CHARS_SYMBOLS

    if (charset.length === 0) {
      return "Select options" // Ne devrait pas arriver avec la nouvelle logique de case à cocher
    }

    let password = ""
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    return password
  }

  const generatePasswords = () => {
    const length = Number.parseInt(passwordLengthInput.value, 10)
    const options = {
      uppercase: uppercaseCheckbox.checked,
      lowercase: lowercaseCheckbox.checked,
      numbers: numbersCheckbox.checked,
      symbols: symbolsCheckbox.checked,
    }

    passwordGrid.innerHTML = "" // Efface les mots de passe existants

    // Cette vérification est maintenant principalement un mécanisme de secours
    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
      const errorDiv = document.createElement("div")
      errorDiv.classList.add("password-bubble", "no-options-selected")
      errorDiv.textContent = "Sélectionnez au moins un type de caractère."
      errorDiv.style.gridColumn = "1 / -1" // S'étend sur toutes les colonnes
      passwordGrid.appendChild(errorDiv)
      return
    }

    for (let i = 0; i < 30; i++) {
      // Génère 30 mots de passe (5x6)
      const password = generatePassword(length, options)
      const passwordBubble = document.createElement("div")
      passwordBubble.classList.add("password-bubble")
      passwordBubble.textContent = password
      passwordBubble.title = "Cliquer pour copier"

      passwordBubble.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(password)
          passwordBubble.classList.add("copied")
          setTimeout(() => {
            passwordBubble.classList.remove("copied")
          }, 1000) // Supprime la classe "copied" après 1 seconde
        } catch (err) {
          console.error("Échec de la copie du mot de passe : ", err)
        }
      })
      passwordGrid.appendChild(passwordBubble)
    }
  }

  // Fonction pour gérer les changements des cases à cocher et s'assurer qu'au moins une est cochée
  const handleCheckboxChange = (event) => {
    const checkboxes = [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox]
    const checkedCount = checkboxes.filter((cb) => cb.checked).length

    if (checkedCount === 0) {
      // Si l'utilisateur a essayé de décocher la dernière, l'empêcher
      event.target.checked = true
      alert("Au moins un type de caractère doit être sélectionné.")
    }
    generatePasswords() // Régénère les mots de passe après le changement
  }

  // Écouteurs d'événements pour les contrôles du générateur de mot de passe
  passwordLengthInput.addEventListener("input", () => {
    lengthValueSpan.textContent = passwordLengthInput.value
    generatePasswords() // Régénère au changement de longueur
  })

  uppercaseCheckbox.addEventListener("change", handleCheckboxChange)
  lowercaseCheckbox.addEventListener("change", handleCheckboxChange)
  numbersCheckbox.addEventListener("change", handleCheckboxChange)
  symbolsCheckbox.addEventListener("change", handleCheckboxChange)

  // Génération initiale au chargement de la page
  generatePasswords()

  // Fonction pour gérer la visibilité de la barre de navigation au défilement
  const handleScroll = () => {
    if (window.scrollY < 50) {
      navbar.classList.add("visible")
    } else {
      navbar.classList.remove("visible")
    }
  }

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
