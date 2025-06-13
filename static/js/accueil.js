document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle")
  const body = document.body
  const cyberAttackNumberElement = document.getElementById("cyber-attack-number")
  const dropdownChoice = document.getElementById("dropdown-choice")
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")
  const resultsDisplay = document.getElementById("results-display")
  const navbar = document.querySelector(".navbar")
  const searchBarContainer = document.querySelector(".search-bar-container")
  const loaderElement = document.getElementById("loader")
  const presentationSection = document.querySelector(".presentation-section")
  const faqSection = document.getElementById("faq-section")
  const logoImage = document.querySelector(".logo-image")

  // Décalage pour le défilement (20px d'espace)
  const SCROLL_OFFSET = 20

  // Fonction pour définir le thème
  const setTheme = (theme) => {
    body.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
    updateThemeToggleButton(theme)
    // Met à jour la source de l'image du logo en fonction du thème
    if (logoImage) {
      if (theme === "light") {
      logoImage.src = "/static/images/logo2.png"
      } else {
      logoImage.src = "/static/images/logo1.png"
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

  // Fonction pour mettre à jour le nombre de cyberattaques avec effet shimmer
  const updateCyberAttackNumber = () => {
    if (cyberAttackNumberElement) {
      const newNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
      cyberAttackNumberElement.textContent = newNumber.toLocaleString("fr-FR").replace(/\u202F/g, " ")

      cyberAttackNumberElement.classList.remove("shimmer-text")
      void cyberAttackNumberElement.offsetWidth
      cyberAttackNumberElement.classList.add("shimmer-text")

      cyberAttackNumberElement.style.setProperty("--spread", `${newNumber.toString().length * 10}px`)
    }
  }

  // Fonction pour calculer le hachage SHA-1
  async function sha1(message) {
    const textEncoder = new TextEncoder()
    const data = textEncoder.encode(message)
    const hashBuffer = await crypto.subtle.digest("SHA-1", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hexHash.toUpperCase() // HIBP attend des hachages en majuscules
  }

  // Fonction pour gérer la logique de recherche
  const handleSearch = async () => {
    const selectedCategory = dropdownChoice.value
    const inputValue = searchInput.value.trim()

    if (!inputValue && !selectedCategory) {
      alert("Veuillez saisir une donnée ET sélectionner un choix (Adresse email ou Mot de passe).")
      return
    } else if (!inputValue) {
      alert("Veuillez saisir une donnée dans le champ de recherche.")
      return
    } else if (!selectedCategory) {
      alert("Veuillez sélectionner un choix (Adresse email ou Mot de passe).")
      return
    }

    resultsDisplay.classList.add("hidden")
    loaderElement.classList.remove("hidden") // Afficher le loader
    resultsDisplay.innerHTML = "" // Vider les résultats précédents

    // Masquer la section de présentation et afficher la FAQ
    if (presentationSection) {
      presentationSection.classList.add("hidden")
    }
    if (faqSection) {
      faqSection.classList.remove("hidden")
    }

    try {
      if (selectedCategory === "password") {
        const passwordHash = await sha1(inputValue)
        const hashPrefix = passwordHash.substring(0, 5)
        const hashSuffix = passwordHash.substring(5)

        const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
          headers: {
            "Add-Padding": "true", // Recommandé par HIBP pour éviter le caching
          },
        })

        if (!response.ok) {
          throw new Error(`Erreur API HIBP: ${response.status} ${response.statusText}`)
        }

        const data = await response.text()
        const lines = data.split("\n")
        let pwnCount = 0

        for (const line of lines) {
          const [suffix, count] = line.split(":")
          if (suffix === hashSuffix) {
            pwnCount = Number.parseInt(count, 10)
            break
          }
        }

        const resultCard = document.createElement("div")
        resultCard.classList.add("result-card")

        const apiNameTag = "API HaveIBeenPwned (Mot de passe)"

        if (pwnCount > 0) {
          resultCard.classList.add("bad")
          resultCard.innerHTML = `
            <div class="api-name-tag">${apiNameTag}</div>
            <div class="result-header">
              <div class="result-icon-container"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg></div>
              <h3 class="result-title">Données compromises</h3>
            </div>
            <div class="result-content">
              <p>Votre mot de passe a été trouvé dans <span class="highlight-number">${pwnCount.toLocaleString("fr-FR").replace(/\u202F/g, " ")}</span> fuites de données.</p>
              <p>Action recommandée : Changez votre mot de passe immédiatement à l'aide de notre <a href="generateur-mot-de-passe.html" class="action-link">générateur de mot de passe</a>.</p>
            </div>
          `
        } else {
          resultCard.classList.add("good", "no-data-found")
          resultCard.innerHTML = `
            <div class="api-name-tag">${apiNameTag}</div>
            <div class="no-results-content">
              <p class="no-results-text"><strong>✅ Aucun résultat</strong></p>
            </div>
          `
        }
        resultsDisplay.appendChild(resultCard)
        resultsDisplay.classList.remove("hidden")

        setTimeout(() => {
          resultCard.classList.add("fade-in")
        }, 150)

        setTimeout(() => {
          const targetPosition = searchBarContainer.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })
        }, 350)
      } else if (selectedCategory === "email") {
        // Appel à la nouvelle route proxy Flask au lieu de l'API HIBP directe
        const response = await fetch(`/api/check-email-breach?email=${encodeURIComponent(inputValue)}`)

        const apiNameTag = "API HaveIBeenPwned (Adresse email)"
        const resultCard = document.createElement("div")
        resultCard.classList.add("result-card")

        if (response.status === 200) {
          const breaches = await response.json()
          if (breaches.length === 0) {
            resultCard.classList.add("good", "no-data-found")
            resultCard.innerHTML = `
                  <div class="api-name-tag">${apiNameTag}</div>
                  <div class="no-results-content">
                      <p class="no-results-text"><strong>✅ Aucun résultat</strong></p>
                  </div>
              `
          } else {
            resultCard.classList.add("bad")
            const breachesListHtml = breaches
              .map(
                (breach) => `
                  <li>
                      <strong>${breach.Title}</strong> (${breach.Domain}) - Date de la fuite: ${new Date(breach.BreachDate).toLocaleDateString("fr-FR")}
                      <p>${breach.Description}</p>
                      ${breach.DataClasses && breach.DataClasses.length > 0 ? `<p>Données exposées: ${breach.DataClasses.join(", ")}</p>` : ""}
                  </li>
              `,
              )
              .join("")

            resultCard.innerHTML = `
                  <div class="api-name-tag">${apiNameTag}</div>
                  <div class="result-header">
                      <div class="result-icon-container"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg></div>
                      <h3 class="result-title">Données compromises</h3>
                  </div>
                  <div class="result-content">
                      <p>Votre adresse email a été trouvée dans <span class="highlight-number">${breaches.length}</span> fuite(s) de données :</p>
                      <ul>${breachesListHtml}</ul>
                      <p>Action recommandée : Changez votre mot de passe pour les services concernés et activez l'authentification à deux facteurs.</p>
                  </div>
              `
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: response.statusText }))
          throw new Error(`Erreur du serveur Flask: ${response.status} - ${errorData.error || response.statusText}`)
        }

        resultsDisplay.appendChild(resultCard)
        resultsDisplay.classList.remove("hidden")

        setTimeout(() => {
          resultCard.classList.add("fade-in")
        }, 150)

        setTimeout(() => {
          const targetPosition = searchBarContainer.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })
        }, 350)
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error)
      resultsDisplay.innerHTML = `<p style="text-align: center; color: var(--rouge-scintillant);">Une erreur est survenue lors de la recherche : ${error.message}. Veuillez réessayer.</p>`
      resultsDisplay.classList.remove("hidden")
    } finally {
      loaderElement.classList.add("hidden") // Cacher le loader
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

  // Gère le clic sur le bouton de recherche
  searchButton.addEventListener("click", handleSearch)

  // Écoute les événements de touche sur le document pour déclencher la recherche avec Entrée
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (
        document.activeElement === searchInput ||
        document.activeElement === dropdownChoice ||
        document.activeElement === body
      ) {
        event.preventDefault()
        handleSearch()
      }
    }
  })

  // Écoute les événements de défilement pour basculer la visibilité de la barre de navigation
  window.addEventListener("scroll", handleScroll)

  // Mise à jour initiale du nombre de cyberattaques
  updateCyberAttackNumber()
  // Met à jour le nombre toutes les 3 secondes
  setInterval(updateCyberAttackNumber, 3000)
})
