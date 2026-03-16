/**
 * Navigation Module - Uses DataStore for centralized data
 */

const Navigation = (function() {

    async function waitForDataStore() {
        let attempts = 0;
        while (!window.DataStore && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (!window.DataStore) {
            console.error('DataStore not available');
            return false;
        }
        return true;
    }

    async function renderHeader() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        // Force fresh data load
        if (window.DataStore) {
            window.DataStore.invalidateCache();
        }

        const ready = await waitForDataStore();
        if (!ready) return;

        await window.DataStore.cargarDatos();
        const categorias = window.DataStore.getCategorias();
        
        let html = '<a href="index.html" class="text-sm font-medium hover:text-primary transition-colors">Inicio</a>';
        html += categorias.map(cat => {
            const slug = cat.slug || cat.nombre.toLowerCase().replace(/\s+/g, '');
            return '<a href="' + slug + '.html" class="text-sm font-medium hover:text-primary transition-colors">' + cat.nombre + '</a>';
        }).join('');

        nav.innerHTML = html;
    }

    async function renderFooter() {
        const footer = document.getElementById('footer-categorias');
        if (!footer) return;

        const ready = await waitForDataStore();
        if (!ready) return;

        await window.DataStore.cargarDatos();
        const categorias = window.DataStore.getCategorias();
        
        const html = categorias.map(cat => {
            const slug = cat.slug || cat.nombre.toLowerCase().replace(/\s+/g, '');
            return '<li><a href="' + slug + '.html" class="hover:text-primary transition-colors">' + cat.nombre + '</a></li>';
        }).join('');

        footer.innerHTML = html;
    }

    async function renderAll() {
        await renderHeader();
        await renderFooter();
    }

    return {
        renderHeader,
        renderFooter,
        renderAll
    };
})();

// Auto-render on DOM ready
function initNavigation() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Navigation.renderAll());
    } else {
        Navigation.renderAll();
    }
}

// Exponer globalmente
window.Navigation = Navigation;

// Initialize
initNavigation();
