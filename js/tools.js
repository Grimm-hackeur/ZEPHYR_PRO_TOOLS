// Fonctions utilitaires pour tous les outils
class ToolsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupCommonEventListeners();
        this.loadUserPreferences();
    }

    setupCommonEventListeners() {
        // Gestion du copier-coller
        document.addEventListener('click', this.handleCopyButtons.bind(this));
        
        // Gestion des téléchargements
        document.addEventListener('click', this.handleDownloadButtons.bind(this));
        
        // Sauvegarde automatique des préférences
        window.addEventListener('beforeunload', this.saveUserPreferences.bind(this));
    }

    handleCopyButtons(e) {
        if (e.target.closest('[data-copy]')) {
            const button = e.target.closest('[data-copy]');
            const text = button.getAttribute('data-copy');
            this.copyToClipboard(text);
        }
    }

    handleDownloadButtons(e) {
        if (e.target.closest('[data-download]')) {
            const button = e.target.closest('[data-download]');
            const url = button.getAttribute('data-download');
            const filename = button.getAttribute('data-filename') || 'download';
            this.trackDownload(filename);
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Lien copié dans le presse-papier!', 'success');
        } catch (err) {
            // Fallback pour les anciens navigateurs
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Lien copié!', 'success');
        }
    }

    trackDownload(filename) {
        let downloads = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
        
        downloads.unshift({
            filename: filename,
            timestamp: new Date().toISOString(),
            tool: this.getCurrentTool()
        });

        // Garder seulement les 50 derniers téléchargements
        downloads = downloads.slice(0, 50);
        
        localStorage.setItem('downloadHistory', JSON.stringify(downloads));

        // Mettre à jour le compteur global
        const totalDownloads = parseInt(localStorage.getItem('totalDownloads') || '0') + 1;
        localStorage.setItem('totalDownloads', totalDownloads.toString());
    }

    getCurrentTool() {
        const path = window.location.pathname;
        if (path.includes('tiktok')) return 'TikTok';
        if (path.includes('pinterest')) return 'Pinterest';
        if (path.includes('spotify')) return 'Spotify';
        if (path.includes('image')) return 'Image Tools';
        if (path.includes('texte')) return 'Text Styler';
        return 'Unknown';
    }

    showNotification(message, type = 'info') {
        // Créer une notification toast
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Styles pour la notification
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            border-left: 4px solid ${this.getNotificationColor(type)};
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Animation d'entrée
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Suppression automatique
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            info: 'info-circle',
            warning: 'exclamation-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            info: '#4299e1',
            warning: '#ed8936'
        };
        return colors[type] || '#4299e1';
    }

    saveUserPreferences() {
        const preferences = {
            theme: 'light',
            language: 'fr',
            autoSave: true,
            lastUsedTools: this.getLastUsedTools()
        };
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }

    loadUserPreferences() {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        this.applyPreferences(preferences);
    }

    applyPreferences(preferences) {
        // Appliquer le thème
        if (preferences.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }

        // Autres préférences...
    }

    getLastUsedTools() {
        let toolUsage = JSON.parse(localStorage.getItem('toolUsage') || '{}');
        return Object.keys(toolUsage)
            .sort((a, b) => toolUsage[b] - toolUsage[a])
            .slice(0, 5);
    }

    // Validation d'URL
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Extraction d'ID depuis les URLs
    extractVideoId(url, platform) {
        const patterns = {
            tiktok: /tiktok\.com\/.*\/video\/(\d+)/,
            pinterest: /pinterest\.com\/pin\/(\d+)/,
            spotify: /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/
        };

        const pattern = patterns[platform];
        if (!pattern) return null;

        const match = url.match(pattern);
        return match ? match[1] || match[2] : null;
    }

    // Formatage de la taille des fichiers
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Gestion des erreurs API
    handleApiError(error, context) {
        console.error(`API Error in ${context}:`, error);
        
        let userMessage = 'Une erreur est survenue';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            userMessage = 'Erreur de connexion. Vérifiez votre internet.';
        } else if (error.response && error.response.status === 404) {
            userMessage = 'Contenu non trouvé. Vérifiez le lien.';
        } else if (error.response && error.response.status === 429) {
            userMessage = 'Trop de requêtes. Veuillez patienter.';
        }

        this.showNotification(userMessage, 'error');
        return userMessage;
    }

    // Sauvegarde des résultats
    saveResult(tool, input, output) {
        let results = JSON.parse(localStorage.getItem('savedResults') || '[]');
        
        results.unshift({
            tool: tool,
            input: input,
            output: output,
            timestamp: new Date().toISOString()
        });

        // Garder seulement les 20 derniers résultats
        results = results.slice(0, 20);
        
        localStorage.setItem('savedResults', JSON.stringify(results));
    }

    // Chargement des résultats sauvegardés
    loadSavedResults(tool = null) {
        const results = JSON.parse(localStorage.getItem('savedResults') || '[]');
        if (tool) {
            return results.filter(result => result.tool === tool);
        }
        return results;
    }
}

// Initialisation globale
const toolsManager = new ToolsManager();

// Fonctions globales accessibles depuis HTML
function copyToClipboard(text) {
    toolsManager.copyToClipboard(text);
}

function clearResult() {
    const resultElements = document.querySelectorAll('.result');
    resultElements.forEach(element => {
        element.style.display = 'none';
    });
}

function saveToHistory(tool, input, output) {
    toolsManager.saveResult(tool, input, output);
}

// Gestionnaire d'erreurs global
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    toolsManager.showNotification('Une erreur inattendue est survenue', 'error');
});

// Export pour les modules (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToolsManager, toolsManager };
}