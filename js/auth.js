// Gestion de l'authentification et des sessions
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Écouteur pour le formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Vérifier si l'utilisateur est connecté sur les pages protégées
        if (this.isProtectedPage() && !this.isLoggedIn()) {
            this.redirectToLogin();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const message = document.getElementById('loginMessage');

        if (!username || !password) {
            this.showMessage('Veuillez remplir tous les champs', 'error', message);
            return;
        }

        // Simulation de connexion (remplacer par une vraie API)
        const loginSuccess = await this.authenticateUser(username, password);
        
        if (loginSuccess) {
            this.createSession(username);
            this.showMessage('Connexion réussie! Redirection...', 'success', message);
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            this.showMessage('Identifiants incorrects', 'error', message);
        }
    }

    async authenticateUser(username, password) {
        // Simulation d'une requête API
        return new Promise((resolve) => {
            setTimeout(() => {
                // En production, vérifier avec votre backend
                const validUsers = ['admin', 'user', 'demo'];
                resolve(validUsers.includes(username.toLowerCase()) && password.length >= 3);
            }, 1000);
        });
    }

    createSession(username) {
        const sessionData = {
            username: username,
            loginTime: new Date().toISOString(),
            sessionId: this.generateSessionId(),
            ip: this.getClientIP()
        };

        localStorage.setItem('userSession', JSON.stringify(sessionData));
        this.saveLoginHistory(sessionData);
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    getClientIP() {
        // En production, récupérer l'IP réelle du serveur
        return '192.168.1.1'; // IP simulée
    }

    saveLoginHistory(sessionData) {
        let loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        
        loginHistory.unshift({
            username: sessionData.username,
            timestamp: sessionData.loginTime,
            ip: sessionData.ip
        });

        // Garder seulement les 10 dernières connexions
        loginHistory = loginHistory.slice(0, 10);
        
        localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
    }

    checkExistingSession() {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
            this.currentUser = JSON.parse(sessionData);
            
            // Vérifier si la session a expiré (24 heures)
            const loginTime = new Date(this.currentUser.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                this.logout();
            }
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isProtectedPage() {
        const protectedPages = ['dashboard.html', 'tools/'];
        return protectedPages.some(page => window.location.pathname.includes(page));
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    logout() {
        localStorage.removeItem('userSession');
        this.currentUser = null;
        window.location.href = 'index.html';
    }

    showMessage(text, type, element) {
        if (!element) return;
        
        element.textContent = text;
        element.className = `message ${type}`;
        element.style.display = 'block';

        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getLoginHistory() {
        return JSON.parse(localStorage.getItem('loginHistory') || '[]');
    }
}

// Initialisation
const authManager = new AuthManager();

// Fonction de déconnexion globale
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        authManager.logout();
    }
}

// Vérifier la session au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Afficher le nom d'utilisateur sur le dashboard
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay && authManager.currentUser) {
        usernameDisplay.textContent = authManager.currentUser.username;
    }

    // Mettre à jour les statistiques
    updateDashboardStats();
});

function updateDashboardStats() {
    const loginHistory = authManager.getLoginHistory();
    const toolsUsed = document.getElementById('toolsUsed');
    const downloadsCount = document.getElementById('downloadsCount');

    if (toolsUsed) {
        toolsUsed.textContent = loginHistory.length;
    }

    if (downloadsCount) {
        // Simuler le nombre de téléchargements
        const downloads = localStorage.getItem('totalDownloads') || '0';
        downloadsCount.textContent = parseInt(downloads) + loginHistory.length * 3;
    }
}