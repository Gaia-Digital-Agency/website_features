// Types
interface SelectedFeature {
    category: string;
    feature: string;
}

interface VisitorData {
    count: number;
    location: string;
    visitTime: string;
}

// State Management
class FeatureChecklistApp {
    private currentPage: number = 1;
    private selectedFeatures: SelectedFeature[] = [];
    private visitorData: VisitorData;
    private projectNotes: string = '';

    constructor() {
        this.visitorData = this.initializeVisitorData();
        this.loadState();
        this.initializeEventListeners();
        this.updateVisitorDisplay();
        this.navigateToPage(1);
    }

    // Initialize visitor data
    private initializeVisitorData(): VisitorData {
        const existingData = sessionStorage.getItem('visitorData');
        
        if (existingData) {
            return JSON.parse(existingData);
        }

        const count = parseInt(localStorage.getItem('totalVisitorCount') || '0') + 1;
        localStorage.setItem('totalVisitorCount', count.toString());

        const visitTime = new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const newData: VisitorData = {
            count,
            location: 'Unknown',
            visitTime
        };

        // Get location using IP geolocation
        this.fetchLocation(newData);

        sessionStorage.setItem('visitorData', JSON.stringify(newData));
        return newData;
    }

    // Fetch visitor location
    private async fetchLocation(data: VisitorData): Promise<void> {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const locationData = await response.json();
            
            data.location = `${locationData.city}, ${locationData.country_name}`;
            this.visitorData = data;
            sessionStorage.setItem('visitorData', JSON.stringify(data));
            this.updateVisitorDisplay();
        } catch (error) {
            console.error('Failed to fetch location:', error);
            data.location = 'Location unavailable';
            this.updateVisitorDisplay();
        }
    }

    // Update visitor display in footer
    private updateVisitorDisplay(): void {
        const countElement = document.getElementById('visitor-count');
        const locationElement = document.getElementById('visitor-location');
        const timeElement = document.getElementById('visitor-time');

        if (countElement) countElement.textContent = this.visitorData.count.toString();
        if (locationElement) locationElement.textContent = this.visitorData.location;
        if (timeElement) timeElement.textContent = this.visitorData.visitTime;
    }

    // Load state from sessionStorage
    private loadState(): void {
        const savedFeatures = sessionStorage.getItem('selectedFeatures');
        const savedNotes = sessionStorage.getItem('projectNotes');

        if (savedFeatures) {
            this.selectedFeatures = JSON.parse(savedFeatures);
            this.restoreCheckboxes();
        }

        if (savedNotes) {
            this.projectNotes = savedNotes;
            const notesTextarea = document.getElementById('project-notes') as HTMLTextAreaElement;
            if (notesTextarea) {
                notesTextarea.value = this.projectNotes;
            }
        }
    }

    // Restore checkbox states from saved data
    private restoreCheckboxes(): void {
        const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const category = checkbox.dataset.category;
            const feature = checkbox.dataset.feature;
            
            const isSelected = this.selectedFeatures.some(
                sf => sf.category === category && sf.feature === feature
            );
            
            checkbox.checked = isSelected;
        });
    }

    // Save state to sessionStorage
    private saveState(): void {
        sessionStorage.setItem('selectedFeatures', JSON.stringify(this.selectedFeatures));
        sessionStorage.setItem('projectNotes', this.projectNotes);
    }

    // Initialize all event listeners
    private initializeEventListeners(): void {
        // Navigation links
        document.querySelectorAll<HTMLAnchorElement>('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt((link as HTMLAnchorElement).dataset.page || '1');
                this.navigateToPage(page);
                
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (navLinks?.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        });

        // Mobile menu toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Checkbox changes
        document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.handleCheckboxChange(checkbox);
            });
        });

        // Project notes
        const notesTextarea = document.getElementById('project-notes') as HTMLTextAreaElement;
        if (notesTextarea) {
            notesTextarea.addEventListener('input', (e) => {
                this.projectNotes = (e.target as HTMLTextAreaElement).value;
                this.saveState();
            });
        }

        // Download buttons
        const downloadMarkdownBtn = document.getElementById('download-markdown');
        const downloadStatsBtn = document.getElementById('download-visitor-stats');
        
        if (downloadMarkdownBtn) {
            downloadMarkdownBtn.addEventListener('click', () => {
                this.downloadMarkdown();
            });
        }

        if (downloadStatsBtn) {
            downloadStatsBtn.addEventListener('click', () => {
                this.downloadVisitorStats();
            });
        }

        // Back to top button
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            // Show/hide based on scroll position
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            });
        }
    }

    // Handle checkbox state changes
    private handleCheckboxChange(checkbox: HTMLInputElement): void {
        const category = checkbox.dataset.category;
        const feature = checkbox.dataset.feature;

        if (!category || !feature) return;

        if (checkbox.checked) {
            // Add to selected features
            this.selectedFeatures.push({ category, feature });
        } else {
            // Remove from selected features
            this.selectedFeatures = this.selectedFeatures.filter(
                sf => !(sf.category === category && sf.feature === feature)
            );
        }

        this.saveState();
        this.updateSummaryPage();
    }

    // Navigate to a specific page
    private navigateToPage(pageNumber: number): void {
        this.currentPage = pageNumber;

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`page-${pageNumber}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update nav link states
        document.querySelectorAll<HTMLAnchorElement>('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if ((link as HTMLAnchorElement).dataset.page === pageNumber.toString()) {
                link.classList.add('active');
            }
        });

        // Update summary if on summary page
        if (pageNumber === 10) {
            this.updateSummaryPage();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update the summary page with selected features
    private updateSummaryPage(): void {
        const summaryContainer = document.getElementById('selected-features');
        if (!summaryContainer) return;

        if (this.selectedFeatures.length === 0) {
            summaryContainer.innerHTML = '<p class="empty-state">No features selected yet. Navigate to other pages to select features.</p>';
            return;
        }

        // Group features by category
        const grouped = this.selectedFeatures.reduce((acc, feature) => {
            if (!acc[feature.category]) {
                acc[feature.category] = [];
            }
            acc[feature.category].push(feature.feature);
            return acc;
        }, {} as Record<string, string[]>);

        // Build HTML
        let html = '';
        Object.keys(grouped).sort().forEach(category => {
            html += `
                <div class="feature-category">
                    <h3>${category}</h3>
                    <ul>
                        ${grouped[category].sort().map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

        summaryContainer.innerHTML = html;
    }

    // Download checklist as markdown
    private downloadMarkdown(): void {
        let markdown = '# Website & App Features Checklist\n\n';
        markdown += `**Date Generated:** ${new Date().toLocaleDateString()}\n\n`;
        markdown += '---\n\n';

        if (this.selectedFeatures.length === 0) {
            markdown += 'No features selected.\n\n';
        } else {
            // Group features by category
            const grouped = this.selectedFeatures.reduce((acc, feature) => {
                if (!acc[feature.category]) {
                    acc[feature.category] = [];
                }
                acc[feature.category].push(feature.feature);
                return acc;
            }, {} as Record<string, string[]>);

            markdown += '## Selected Features\n\n';
            Object.keys(grouped).sort().forEach(category => {
                markdown += `### ${category}\n\n`;
                grouped[category].sort().forEach(feature => {
                    markdown += `- [ ] ${feature}\n`;
                });
                markdown += '\n';
            });
        }

        if (this.projectNotes.trim()) {
            markdown += '---\n\n';
            markdown += '## Project Notes\n\n';
            markdown += this.projectNotes + '\n\n';
        }

        markdown += '---\n\n';
        markdown += '_Generated by Feature Checklist App - net1io.com_\n';

        this.downloadFile(markdown, 'feature-checklist.md', 'text/markdown');
    }

    // Download visitor stats as markdown
    private downloadVisitorStats(): void {
        let markdown = '# Visitor Statistics\n\n';
        markdown += `**Total Visitors:** ${this.visitorData.count}\n\n`;
        markdown += `**Visitor Location:** ${this.visitorData.location}\n\n`;
        markdown += `**Visit Time:** ${this.visitorData.visitTime}\n\n`;
        markdown += '---\n\n';
        markdown += '_Generated by Feature Checklist App - net1io.com_\n';

        this.downloadFile(markdown, 'visitor-stats.md', 'text/markdown');
    }

    // Utility function to download files
    private downloadFile(content: string, filename: string, mimeType: string): void {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FeatureChecklistApp();
});
