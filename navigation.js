/**
 * Navigation Module - Centralized navigation management
 * Carga categorías desde categorias.json y genera navegación dinámica
 */

const Navigation = (function() {
    let categoriasCache = null;

    async function obtenerCategorias() {
        if (categoriasCache) return categoriasCache;
        
        try {
            const res = await fetch('categorias.json?v=' + Date.now());
            const data = await res.json();
            categoriasCache = data;
            return data;
        } catch(error) {
            console.error('Error cargando categorías:', error);
            return [];
        }
    }

    function invalidateCache() {
        categoriasCache = null;
    }

    async function renderHeader() {
        const nav = document.getElementById('nav-categorias');
        if (!nav) return;

        const categorias = await obtenerCategorias();
        
        let html = '<a href="index.html" class="text-sm font-medium hover:text-primary transition-colors">Inicio</a>';
        html += categorias.map(cat => {
            const slug = cat.slug || cat.nombre.toLowerCase().replace(/\s+/g, '');
            return '<a href="categoria.html?slug=' + slug + '" class="text-sm font-medium hover:text-primary transition-colors">' + cat.nombre + '</a>';
        }).join('');

        nav.innerHTML = html;
    }

    async function renderFooter() {
        const footer = document.getElementById('footer-categorias');
        if (!footer) return;

        const categorias = await obtenerCategorias();
        
        const html = categorias.map(cat => {
            const slug = cat.slug || cat.nombre.toLowerCase().replace(/\s+/g, '');
            return '<li><a href="categoria.html?slug=' + slug + '" class="hover:text-primary transition-colors">' + cat.nombre + '</a></li>';
        }).join('');

        footer.innerHTML = html;
    }

    async function renderAll() {
        await Promise.all([renderHeader(), renderFooter()]);
    }

    return {
        obtenerCategorias,
        invalidateCache,
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
