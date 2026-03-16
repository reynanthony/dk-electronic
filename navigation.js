/**
 * Navigation Module - Uses DataStore for centralized data
 */

const Navigation = (function() {

    async function renderHeader() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        await DataStore.cargarDatos();
        const categorias = DataStore.getCategorias();
        
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

        await DataStore.cargarDatos();
        const categorias = DataStore.getCategorias();
        
        const html = categorias.map(cat => {
            const slug = cat.slug || cat.nombre.toLowerCase().replace(/\s+/g, '');
            return '<li><a href="' + slug + '.html" class="hover:text-primary transition-colors">' + cat.nombre + '</a></li>';
        }).join('');

        footer.innerHTML = html;
    }

    async function renderAll() {
        await DataStore.cargarDatos();
        await Promise.all([renderHeader(), renderFooter()]);
    }

    return {
        renderHeader,
        renderFooter,
        renderAll
    };
})();

// Auto-render on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Navigation.renderAll());
} else {
    Navigation.renderAll();
}

// Exponer globalmente
window.Navigation = Navigation;
