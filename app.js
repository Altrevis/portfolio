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
        'Developpeur Full Stack',
        'Passionne par le Code',
        'Createur d\'applications web',
        'Etudiant en informatique'
    ],
    typingSpeed: 95,
    typingDelay: 1800,
    revealSelector: '.hero-kicker, .hero-highlights, .about-card, .tech-category, .timeline-item, .project-card, .projects-toolbar, .contact-method'
};

const state = {
    repositories: [],
    activeFilter: 'all',
    searchTerm: ''
};

const elements = {
    navbar: document.querySelector('.navbar'),
    navLogo: document.querySelector('.nav-logo'),
    hamburger: document.querySelector('.hamburger'),
    navMenu: document.querySelector('.nav-menu'),
    navLinks: [...document.querySelectorAll('.nav-link')],
    sections: [...document.querySelectorAll('section[id]')],
    progressBar: document.querySelector('.scroll-progress'),
    backToTop: document.querySelector('.back-to-top'),
    projectSearch: document.getElementById('project-search'),
    projectsCount: document.getElementById('projects-count'),
    featuredGrid: document.getElementById('featured-projects-grid'),
    projectsGrid: document.getElementById('projects-grid')
};

function smoothScrollTo(target) {
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeMobileMenu() {
    elements.hamburger?.classList.remove('active');
    elements.navMenu?.classList.remove('active');
}

function updateScrollUI() {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = documentHeight > 0 ? scrollTop / documentHeight : 0;

    elements.navbar?.classList.toggle('scrolled', scrollTop > 30);
    elements.backToTop?.classList.toggle('visible', scrollTop > 500);

    if (elements.progressBar) {
        elements.progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    }

    let currentSectionId = elements.sections[0]?.id || '';

    elements.sections.forEach((section) => {
        const offset = section.offsetTop - 180;
        if (scrollTop >= offset) {
            currentSectionId = section.id;
        }
    });

    elements.navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${currentSectionId}`;
        link.classList.toggle('active', isActive);
    });
}

function setupNavigation() {
    elements.hamburger?.addEventListener('click', () => {
        elements.hamburger.classList.toggle('active');
        elements.navMenu?.classList.toggle('active');
    });

    elements.navLogo?.addEventListener('click', () => {
        smoothScrollTo(document.getElementById('home'));
        closeMobileMenu();
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            const target = href ? document.querySelector(href) : null;

            if (!target) {
                return;
            }

            event.preventDefault();
            smoothScrollTo(target);
            closeMobileMenu();
        });
    });

    elements.backToTop?.addEventListener('click', () => {
        smoothScrollTo(document.getElementById('home'));
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) {
            return;
        }

        window.requestAnimationFrame(() => {
            updateScrollUI();
            ticking = false;
        });

        ticking = true;
    }, { passive: true });

    updateScrollUI();
}

function typeWriter() {
    const typingElement = document.querySelector('.typing-text');

    if (!typingElement) {
        return;
    }

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
        const currentText = CONFIG.typingTexts[textIndex];

        typingElement.textContent = isDeleting
            ? currentText.slice(0, charIndex - 1)
            : currentText.slice(0, charIndex + 1);

        charIndex += isDeleting ? -1 : 1;

        let nextDelay = isDeleting ? CONFIG.typingSpeed / 2 : CONFIG.typingSpeed;

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            nextDelay = CONFIG.typingDelay;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % CONFIG.typingTexts.length;
            nextDelay = 450;
        }

        window.setTimeout(type, nextDelay);
    };

    type();
}

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
            console.error(`Erreur reseau GitHub (${resourceLabel}):`, error);
            return null;
        }
    }

    async fetchUser() {
        const user = await this.fetchJSON(`${this.baseUrl}/users/${this.username}`, 'profil');
        return user && !Array.isArray(user) ? user : null;
    }

    async fetchRepositories() {
        const repos = await this.fetchJSON(
            `${this.baseUrl}/users/${this.username}/repos?sort=updated&per_page=100`,
            'repositories'
        );

        return Array.isArray(repos) ? repos : [];
    }
}

async function updateGitHubStats() {
    const api = new GitHubAPI(CONFIG.username);
    const [user, repos] = await Promise.all([api.fetchUser(), api.fetchRepositories()]);
    const safeRepos = Array.isArray(repos) ? repos : [];

    const repoCount = document.getElementById('repo-count');
    const starsCount = document.getElementById('stars-count');
    const followersCount = document.getElementById('followers-count');

    if (repoCount) {
        repoCount.textContent = String(safeRepos.length);
    }

    if (user) {
        const totalStars = safeRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

        if (followersCount) {
            followersCount.textContent = String(user.followers || 0);
        }

        if (starsCount) {
            starsCount.textContent = String(totalStars);
        }
    } else {
        if (followersCount) {
            followersCount.textContent = '--';
        }

        if (starsCount) {
            starsCount.textContent = '--';
        }
    }

    return safeRepos;
}

function getLanguageIcon(language) {
    const icons = {
        JavaScript: '<i class="fab fa-js"></i>',
        Python: '<i class="fab fa-python"></i>',
        Java: '<i class="fab fa-java"></i>',
        Go: '<i class="fas fa-code"></i>',
        PHP: '<i class="fab fa-php"></i>',
        HTML: '<i class="fab fa-html5"></i>',
        CSS: '<i class="fab fa-css3-alt"></i>',
        TypeScript: '<i class="fas fa-file-code"></i>'
    };

    return icons[language] || '<i class="fas fa-code"></i>';
}

function getProjectDescription(projectName) {
    const descriptions = {
        'Shoply-API-e-commerce': 'API e-commerce complete avec systeme de paiement et gestion des commandes.',
        'E-commerce-project-YNOV': 'Plateforme e-commerce full-stack avec authentification, panier et tunnel de commande.',
        goodlifeapp: 'Application de suivi du bien-etre et des habitudes quotidiennes.',
        'weather-app': 'Application meteo avec API externe et experience utilisateur interactive.',
        'Groupie-Tracker-G7': 'Systeme de tracking d\'artistes et de concerts developpe en Go.',
        'project-forum': 'Forum communautaire avec authentification et gestion des discussions.',
        'ecommerce-website': 'Site e-commerce responsive avec catalogue produit et parcours fluide.',
        'APM-application': 'Application de monitoring et de performance applicative.',
        '2D-wave-monster-web': 'Jeu web 2D avec vagues d\'ennemis et gameplay progressif.',
        'IDS-python': 'Systeme de detection d\'intrusion en Python.',
        'Gogonne-REACT': 'Application moderne construite avec React.',
        'forum-java-LARV': 'Forum realise en Java.',
        'bowling-Node-JS': 'Application de gestion pour bowling en Node.js.',
        'hangman-web': 'Jeu du pendu en version web.',
        'hangman-terminal': 'Jeu du pendu en terminal.',
        'ynov-go-game': 'Jeu developpe en Go.',
        'site-hackathon': 'Site concu dans le cadre d\'un hackathon.',
        'appli-web-register-task': 'Application de gestion et suivi de taches.',
        'E-commerce-PHP': 'Projet e-commerce realise en PHP.',
        blizzard: 'Fan site autour de l\'univers Blizzard.',
        'ynov-colo-IA': 'Projet IA autour de la colocation.'
    };

    return descriptions[projectName] || 'Projet de developpement oriente produit, interface et logique metier.';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Aujourd\'hui';
    }

    if (diffDays === 1) {
        return 'Hier';
    }

    if (diffDays < 7) {
        return `${diffDays} j`;
    }

    if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} sem`;
    }

    if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)} mois`;
    }

    return `${Math.floor(diffDays / 365)} an`;
}

function createProjectCard(repo, isFeatured = false) {
    const card = document.createElement('article');
    const description = getProjectDescription(repo.name);
    const language = repo.language || 'Autre';

    card.className = `project-card tilt-card reveal${isFeatured ? ' featured-project' : ''}`;
    card.dataset.language = repo.language || 'Other';
    card.dataset.name = repo.name.toLowerCase();
    card.dataset.description = description.toLowerCase();
    card.dataset.tech = language.toLowerCase();
    card.innerHTML = `
        <div class="project-header">
            <div class="project-icon">${getLanguageIcon(repo.language)}</div>
            <div class="project-links">
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" title="Voir sur GitHub" aria-label="Voir ${repo.name} sur GitHub">
                    <i class="fab fa-github"></i>
                </a>
            </div>
        </div>
        <h3>${repo.name.replace(/-/g, ' ')}</h3>
        <p>${description}</p>
        <div class="project-tech">
            <span class="tech-tag">${language}</span>
        </div>
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

function updateProjectsCount(count) {
    if (!elements.projectsCount) {
        return;
    }

    elements.projectsCount.textContent = count > 1 ? `${count} projets visibles` : `${count} projet visible`;
}

function removeEmptyState() {
    elements.projectsGrid?.querySelector('.empty-state')?.remove();
}

function showEmptyState() {
    if (!elements.projectsGrid || elements.projectsGrid.querySelector('.empty-state')) {
        return;
    }

    const message = document.createElement('div');
    message.className = 'empty-state';
    message.innerHTML = `
        <i class="fas fa-folder-open"></i>
        <p>Aucun projet ne correspond a cette recherche pour le moment.</p>
    `;
    elements.projectsGrid.appendChild(message);
}

function applyProjectFilters() {
    const cards = [...document.querySelectorAll('#projects-grid .project-card')];
    const normalizedSearch = state.searchTerm.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
        const language = card.dataset.language;
        const matchesFilter = state.activeFilter === 'all' || language === state.activeFilter;
        const haystack = `${card.dataset.name} ${card.dataset.description} ${card.dataset.tech}`;
        const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
        const isVisible = matchesFilter && matchesSearch;

        card.classList.toggle('is-hidden', !isVisible);

        if (isVisible) {
            visibleCount += 1;
        }
    });

    updateProjectsCount(visibleCount);

    if (visibleCount === 0) {
        showEmptyState();
    } else {
        removeEmptyState();
    }
}

function initializeFilters() {
    const filterButtons = [...document.querySelectorAll('.filter-btn')];

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            state.activeFilter = button.dataset.filter || 'all';

            filterButtons.forEach((currentButton) => {
                currentButton.classList.toggle('active', currentButton === button);
            });

            applyProjectFilters();
        });
    });

    elements.projectSearch?.addEventListener('input', (event) => {
        state.searchTerm = event.target.value || '';
        applyProjectFilters();
    });
}

function setupRevealAnimations(root = document) {
    const revealElements = [...root.querySelectorAll(CONFIG.revealSelector)];

    revealElements.forEach((element, index) => {
        if (!element.classList.contains('reveal')) {
            element.classList.add('reveal');
        }

        element.style.transitionDelay = `${Math.min(index * 40, 220)}ms`;
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealElements.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.14,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((element) => observer.observe(element));
}

function setupTiltEffects(root = document) {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    root.querySelectorAll('.tilt-card').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const relativeX = (event.clientX - rect.left) / rect.width;
            const relativeY = (event.clientY - rect.top) / rect.height;
            const rotateY = (relativeX - 0.5) * 8;
            const rotateX = (0.5 - relativeY) * 8;

            card.style.setProperty('--rotate-x', `${rotateX}deg`);
            card.style.setProperty('--rotate-y', `${rotateY}deg`);
            card.style.setProperty('--glow-x', `${relativeX * 100}%`);
            card.style.setProperty('--glow-y', `${relativeY * 100}%`);
            card.style.setProperty('--lift', '-4px');
        });

        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rotate-x', '0deg');
            card.style.setProperty('--rotate-y', '0deg');
            card.style.setProperty('--glow-x', '50%');
            card.style.setProperty('--glow-y', '50%');
            card.style.setProperty('--lift', '0px');
        });
    });
}

function decorateStaticCards() {
    document.querySelectorAll('.about-card, .tech-category, .profile-card, .contact-method, .timeline-content').forEach((element) => {
        element.classList.add('tilt-card');
    });

    document.querySelectorAll('.timeline-item, .about-card, .tech-category, .contact-method').forEach((element) => {
        element.classList.add('reveal');
    });
}

async function displayProjects(repositories = null) {
    const api = new GitHubAPI(CONFIG.username);
    const repos = Array.isArray(repositories) ? repositories : await api.fetchRepositories();

    state.repositories = repos;

    if (!elements.featuredGrid || !elements.projectsGrid) {
        return;
    }

    if (!repos.length) {
        elements.featuredGrid.innerHTML = '<p class="loading">Aucun projet trouve.</p>';
        elements.projectsGrid.innerHTML = '<p class="loading">API GitHub indisponible. Reessayez plus tard.</p>';
        updateProjectsCount(0);
        return;
    }

    const featuredRepos = repos.filter((repo) => CONFIG.featuredProjects.includes(repo.name));
    const otherRepos = repos.filter((repo) => !CONFIG.featuredProjects.includes(repo.name));

    elements.featuredGrid.innerHTML = '';
    elements.projectsGrid.innerHTML = '';

    featuredRepos.forEach((repo) => {
        elements.featuredGrid.appendChild(createProjectCard(repo, true));
    });

    otherRepos.forEach((repo) => {
        elements.projectsGrid.appendChild(createProjectCard(repo));
    });

    setupRevealAnimations(document);
    setupTiltEffects(document);
    initializeFilters();
    applyProjectFilters();
}

function initializeExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
        if (!link.hasAttribute('rel')) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    decorateStaticCards();
    setupNavigation();
    setupRevealAnimations(document);
    setupTiltEffects(document);
    initializeExternalLinks();
    typeWriter();

    const repos = await updateGitHubStats();
    await displayProjects(repos);
    updateScrollUI();
});
