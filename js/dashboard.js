// Gestion du tableau de bord et des interactions
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupToolCards();
        this.loadRecentActivity();
        this.updateUserStats();
    }

    setupToolCards() {
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.trackToolUsage(card);
                window.location.href = card.getAttribute('href');
            });
        });
    }

    trackToolUsage(card) {
        const toolName = card.querySelector('h3').textContent;
        let toolStats = JSON.parse(localStorage.getItem('toolStats') || '{}');
        
        toolStats[toolName] = (toolStats[toolName] || 0) + 1;
        localStorage.setItem('toolStats', JSON.stringify(toolStats));

        this.updateToolUsageDisplay(card, toolStats[toolName]);
    }

    updateToolUsageDisplay(card, count) {
        const usageElement = card.querySelector('.tool-usage');
        if (usageElement) {
            usageElement.textContent = `Utilisé ${count} fois`;
        }
    }

    loadRecentActivity() {
        const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        const activityList = document.querySelector('.activity-list');
        
        if (!activityList) return;

        // Vider la liste actuelle
        activityList.innerHTML = '';

        // Ajouter les activités récentes
        loginHistory.slice(0, 5).forEach(activity => {
            const activityItem = this.createActivityItem(activity);
            activityList.appendChild(activityItem);
        });
    }

    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const tools = ['TikTok', 'Spotify', 'Pinterest', 'Image', 'Text'];
        const randomTool = tools[Math.floor(Math.random() * tools.length)];
        
        item.innerHTML = `
            <i class="fas fa-${this.getToolIcon(randomTool)} activity-icon ${randomTool.toLowerCase()}"></i>
            <div class="activity-details">
                <span class="activity-text">Connexion réussie - ${randomTool} Tool</span>
                <span class="activity-time">${this.formatTime(activity.timestamp)}</span>
            </div>
        `;
        
        return item;
    }

    getToolIcon(toolName) {
        const icons = {
            'TikTok': 'music',
            'Spotify': 'headphones',
            'Pinterest': 'image',
            'Image': 'download',
            'Text': 'text-height'
        };
        return icons[toolName] || 'circle';
    }

    formatTime(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now - activityTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours} h`;
        if (diffDays === 1) return 'Hier';
        return `Il y a ${diffDays} jours`;
    }

    updateUserStats() {
        const toolStats = JSON.parse(localStorage.getItem('toolStats') || '{}');
        const totalToolsUsed = Object.values(toolStats).reduce((sum, count) => sum + count, 0);
        
        const toolsUsedElement = document.getElementById('toolsUsed');
        if (toolsUsedElement) {
            toolsUsedElement.textContent = totalToolsUsed;
        }

        // Mettre à jour l'affichage de l'utilisation des outils
        this.updateAllToolUsageDisplays(toolStats);
    }

    updateAllToolUsageDisplays(toolStats) {
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            const toolName = card.querySelector('h3').textContent;
            const count = toolStats[toolName] || 0;
            this.updateToolUsageDisplay(card, count);
        });
    }
}

// Initialisation du dashboard
document.addEventListener('DOMContentLoaded', function() {
    new DashboardManager();
});

// Fonction pour le menu mobile (si nécessaire)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}