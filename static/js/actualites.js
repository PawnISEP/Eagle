document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle")
  const body = document.body
  const navbar = document.querySelector(".navbar")
  const logoImage = document.querySelector(".logo-image")
  const loaderElement = document.getElementById("loader")
  const articlesGrid = document.getElementById("articles-grid")

  // Fonction pour définir le thème
  const setTheme = (theme) => {
    body.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
    updateThemeToggleButton(theme)
    // Met à jour la source de l'image du logo en fonction du thème
    if (logoImage) {
      if (theme === "light") {
        logoImage.src = "{{ url_for('static', filename='images/logo2.png') }}" // Utilise le logo noir pour le thème clair
      } else {
        logoImage.src = "{{ url_for('static', filename='images/logo1.png') }}" // Utilise le logo blanc pour le thème sombre
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

  // Fonction pour récupérer et afficher les articles d'actualités de l'API GNews
  const fetchNewsArticles = async () => {
    // Utilise la variable globale injectée par Flask
    const API_KEY = window.GNEWS_API_KEY
    const query = "cybersécurité"
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=fr&max=9&token=${API_KEY}`

    loaderElement.classList.remove("hidden") // Afficher le loader
    articlesGrid.innerHTML = "" // Effacer les articles précédents

    try {
      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Clé API GNews invalide ou quota dépassé. Veuillez la vérifier.")
        }
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(`Erreur API GNews: ${response.status} - ${errorData.message || response.statusText}`)
      }
      const data = await response.json()

      if (data.articles && data.articles.length > 0) {
        data.articles.slice(0, 9).forEach((article) => {
          const articleCard = document.createElement("a")
          articleCard.href = article.url || "#"
          articleCard.target = "_blank"
          articleCard.classList.add("article-card")

          const publishedDate = article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Date inconnue"

          const imageUrl = article.image || "https://via.placeholder.com/400x200?text=Image+non+disponible"

          articleCard.innerHTML = `
            <img src="${imageUrl}" alt="${article.title || "Article image"}" class="article-image">
            <div class="article-content">
                <h3 class="article-title">${article.title || "Titre inconnu"}</h3>
                <p class="article-description">${article.description || "Aucune description disponible."}</p>
                <div class="article-meta">
                    <span class="article-date">Publié le ${publishedDate}</span>
                    <span class="article-source">${article.source.name || "Source inconnue"}</span>
                </div>
            </div>
          `
          articlesGrid.appendChild(articleCard)
        })
      } else {
        articlesGrid.innerHTML = `<p style="text-align: center; color: var(--text-color-light);">Aucun article trouvé pour le moment.</p>`
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des actualités:", error)
      articlesGrid.innerHTML = `<p style="text-align: center; color: var(--shimmer-red);">Une erreur est survenue lors du chargement des actualités : ${error.message}. Veuillez réessayer plus tard.</p>`
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

  // Écoute les événements de défilement pour basculer la visibilité de la barre de navigation
  window.addEventListener("scroll", handleScroll)

  // Récupère et affiche les articles d'actualités au chargement de la page
  fetchNewsArticles()
})
