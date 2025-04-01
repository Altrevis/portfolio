// Fonction pour récupérer les projets GitHub
async function fetchGitHubProjects(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const projects = await response.json();

        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = ''; // Nettoyer le contenu existant

        // Limiter à 6 projets
        projects.slice(0, 10).forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');

            projectCard.innerHTML = `
                <h3>${project.name}</h3>
                <div class="project-links">
                    <a href="${project.html_url}" target="_blank">
                        <i class="fab fa-github"></i> Voir le projet
                    </a>
                    <span>${project.language || 'N/A'}</span>
                </div>
            `;

            projectsGrid.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = '<p>Impossible de charger les projets GitHub</p>';
    }
}

// Remplacez 'Altrevis' par votre nom d'utilisateur GitHub
fetchGitHubProjects('Altrevis');