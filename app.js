// ===== CONFIGURATION =====
const CONFIG = {
    username: 'Altrevis',
    featuredProjects: [
        'Shoply-API-e-commerce',
        'E-commerce-project-YNOV',
        'goodlifeapp',
        'weather-app',
        'Groupie-Tracker-G7',
        'project-forum'
    ],
    typingTexts: [
        'Développeur Full Stack',
        'Passionné par le Code',
        'Créateur d\'Applications Web',
        'Étudiant en Informatique'
    ],
    typingSpeed: 100,
    typingDelay: 2000
};

// ===== NAVIGATION =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll effect pour la navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Menu hamburger
hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Navigation smooth et active links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
            
            // Fermer le menu mobile
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// Mettre à jour le lien actif au scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== EFFET TYPING =====
function typeWriter() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentText = CONFIG.typingTexts[textIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = CONFIG.typingSpeed;
        
        if (isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = CONFIG.typingDelay;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % CONFIG.typingTexts.length;
            typeSpeed = 500;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// ===== GITHUB API =====
class GitHubAPI {
    constructor(username) {
        this.username = username;
        this.baseUrl = 'https://api.github.com';
    }

    async fetchJSON(url, resourceLabel) {
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                const apiMessage = data && data.message ? data.message : `HTTP ${response.status}`;
                console.warn(`GitHub API (${resourceLabel}) indisponible: ${apiMessage}`);
                return null;
            }

            return data;
        } catch (error) {
            console.error(`Erreur réseau GitHub (${resourceLabel}):`, error);
            return null;
        }
    }
    
    async fetchUser() {
        const user = await this.fetchJSON(`${this.baseUrl}/users/${this.username}`, 'profil');
        if (!user || Array.isArray(user)) {
            return null;
        }
        return user;
    }
    
    async fetchRepositories() {
        const repos = await this.fetchJSON(
            `${this.baseUrl}/users/${this.username}/repos?sort=updated&per_page=100`,
            'repositories'
        );

        if (!Array.isArray(repos)) {
            return [];
        }

        return repos;
    }
    
    async getLanguageStats(repos) {
        const languageCount = {};
        
        repos.forEach(repo => {
            if (repo.language) {
                languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
            }
        });
        
        return languageCount;
    }
}

// ===== STATISTIQUES GITHUB =====
async function updateGitHubStats() {
    const api = new GitHubAPI(CONFIG.username);
    
    try {
        const [user, repos] = await Promise.all([
            api.fetchUser(),
            api.fetchRepositories()
        ]);
        
        const safeRepos = Array.isArray(repos) ? repos : [];

        if (user) {
            document.getElementById('followers-count').textContent = user.followers || 0;

            const totalStars = safeRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
            document.getElementById('stars-count').textContent = totalStars;
        } else {
            document.getElementById('followers-count').textContent = '--';
            document.getElementById('stars-count').textContent = '--';
        }

        document.getElementById('repo-count').textContent = safeRepos.length;

        return safeRepos;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des stats:', error);
        return [];
    }
}

// ===== PROJETS =====
function getLanguageIcon(language) {
    const icons = {
        'JavaScript': '<i class="fab fa-js"></i>',
        'Python': '<i class="fab fa-python"></i>',
        'Java': '<i class="fab fa-java"></i>',
        'Go': '<i class="fas fa-code"></i>',
        'PHP': '<i class="fab fa-php"></i>',
        'HTML': '<i class="fab fa-html5"></i>',
        'CSS': '<i class="fab fa-css3-alt"></i>',
        'TypeScript': '<i class="fab fa-js"></i>'
    };
    return icons[language] || '<i class="fas fa-code"></i>';
}

function getProjectDescription(projectName) {
    const descriptions = {
        'Shoply-API-e-commerce': 'API e-commerce complète avec système de paiement et gestion des commandes',
        'E-commerce-project-YNOV': 'Plateforme e-commerce full-stack avec authentification et panier',
        'goodlifeapp': 'Application de suivi de bien-être et d\'habitudes quotidiennes',
        'weather-app': 'Application météo avec API et interface interactive',
        'Groupie-Tracker-G7': 'Système de tracking d\'artistes et concerts en Go',
        'project-forum': 'Forum communautaire avec système d\'authentification',
        'ecommerce-website': 'Site e-commerce responsive avec catalogue produits',
        'APM-application': 'Application de monitoring et performance',
        '2D-wave-monster-web': 'Jeu web 2D avec système de vagues d\'ennemis',
        'IDS-python': 'Système de détection d\'intrusion en Python',
        'Gogonne-REACT': 'Application React moderne',
        'forum-java-LARV': 'Forum développé en Java',
        'bowling-Node-JS': 'Application de gestion de bowling en Node.js',
        'hangman-web': 'Jeu du pendu en version web',
        'hangman-terminal': 'Jeu du pendu en terminal',
        'ynov-go-game': 'Jeu développé en Go',
        'site-hackathon': 'Site créé lors d\'un hackathon',
        'appli-web-register-task': 'Application de gestion de tâches',
        'E-commerce-PHP': 'E-commerce développé en PHP',
        'blizzard': 'Fan site Blizzard',
        'ynov-colo-IA': 'Projet d\'IA pour la colocation'
    };
    return descriptions[projectName] || 'Projet de développement';
}

function createProjectCard(repo, isFeatured = false) {
    const card = document.createElement('div');
    card.className = isFeatured ? 'project-card featured-project' : 'project-card';
    card.setAttribute('data-language', repo.language || 'Other');
    
    const description = getProjectDescription(repo.name);
    const languageIcon = getLanguageIcon(repo.language);
    
    card.innerHTML = `
        <div class="project-header">
            <div class="project-icon">${languageIcon}</div>
            <div class="project-links">
                <a href="${repo.html_url}" target="_blank" title="Voir sur GitHub">
                    <i class="fab fa-github"></i>
                </a>
            </div>
        </div>
        <h3>${repo.name.replace(/-/g, ' ')}</h3>
        <p>${description}</p>
        ${repo.language ? `
            <div class="project-tech">
                <span class="tech-tag">${repo.language}</span>
            </div>
        ` : ''}
        <div class="project-stats">
            <div class="project-stat">
                <i class="fas fa-star"></i>
                <span>${repo.stargazers_count || 0}</span>
            </div>
            <div class="project-stat">
                <i class="fas fa-code-branch"></i>
                <span>${repo.forks_count || 0}</span>
            </div>
            <div class="project-stat">
                <i class="fas fa-clock"></i>
                <span>${formatDate(repo.updated_at)}</span>
            </div>
        </div>
    `;
    
    return card;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays}j`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mois`;
    return `${Math.floor(diffDays / 365)}an`;
}

async function displayProjects(repositories = null) {
    const api = new GitHubAPI(CONFIG.username);
    const repos = Array.isArray(repositories) ? repositories : await api.fetchRepositories();
    const featuredGrid = document.getElementById('featured-projects-grid');
    const allProjectsGrid = document.getElementById('projects-grid');
    
    if (!repos || repos.length === 0) {
        featuredGrid.innerHTML =
            '<p class="loading">Aucun projet trouvé</p>';
        allProjectsGrid.innerHTML =
            '<p class="loading">API GitHub indisponible (limite atteinte ou accès refusé). Réessayez plus tard.</p>';
        return;
    }
    
    // Filtrer et afficher les projets featured
    const featuredRepos = repos.filter(repo => 
        CONFIG.featuredProjects.includes(repo.name)
    );
    
    featuredGrid.innerHTML = '';
    
    featuredRepos.forEach(repo => {
        featuredGrid.appendChild(createProjectCard(repo, true));
    });
    
    // Afficher tous les autres projets
    allProjectsGrid.innerHTML = '';
    
    repos.forEach(repo => {
        if (!CONFIG.featuredProjects.includes(repo.name)) {
            allProjectsGrid.appendChild(createProjectCard(repo, false));
        }
    });
    
    // Initialiser les filtres
    initializeFilters(repos);
}

// ===== FILTRES PROJETS =====
function initializeFilters(repos) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card:not(.featured-project)');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
                const language = card.getAttribute('data-language');
                
                if (filter === 'all' || language === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===== ANIMATIONS AU SCROLL =====
function animateOnScroll() {
    const elements = document.querySelectorAll('.about-card, .tech-category, .project-card, .timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// ===== SMOOTH SCROLL POUR LES LIENS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Portfolio de Léo Benazeth - Chargement...');
    
    // Démarrer l'effet typing
    typeWriter();
    
    // Charger les stats GitHub
    const repos = await updateGitHubStats();
    
    // Charger et afficher les projets
    await displayProjects(repos);
    
    // Initialiser les animations
    animateOnScroll();
    
    console.log('✅ Portfolio chargé avec succès!');
});

// ===== PERFORMANCES =====
// Lazy loading des images
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback pour les navigateurs anciens
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}