/**
 * Navigation Module
 */

var Navigation = {
    renderHeader: function() {
        var nav = document.getElementById('main-nav');
        if (!nav) return;
        
        var categorias = [];
        
        // Try to get categories from DataStore
        if (window.DataStore && typeof window.DataStore.getCategorias === 'function') {
            try {
                categorias = window.DataStore.getCategorias() || [];
            } catch (e) {
                console.warn('Navigation: No se pudieron cargar categorías:', e);
            }
        }
        
        // Fallback if no categories
        if (categorias.length === 0) {
            categorias = [
                { nombre: 'Tecnologia', slug: 'tecnologia' },
                { nombre: 'Accesorios', slug: 'accesorios' }
            ];
        }
        
        var html = '<a href="index.html" class="text-sm font-medium hover:text-primary transition-colors">Inicio</a>';
        for (var i = 0; i < categorias.length; i++) {
            var cat = categorias[i];
            html += '<a href="' + cat.slug + '.html" class="text-sm font-medium hover:text-primary transition-colors">' + cat.nombre + '</a>';
        }
        
        nav.innerHTML = html;
    },
    
    renderFooter: function() {
        var footer = document.getElementById('footer-categorias');
        if (!footer) return;
        
        var categorias = [];
        
        // Try to get categories from DataStore
        if (window.DataStore && typeof window.DataStore.getCategorias === 'function') {
            try {
                categorias = window.DataStore.getCategorias() || [];
            } catch (e) {
                console.warn('Navigation: No se pudieron cargar categorías:', e);
            }
        }
        
        // Fallback if no categories
        if (categorias.length === 0) {
            categorias = [
                { nombre: 'Tecnologia', slug: 'tecnologia' },
                { nombre: 'Accesorios', slug: 'accesorios' }
            ];
        }
        
        var html = '';
        for (var i = 0; i < categorias.length; i++) {
            var cat = categorias[i];
            html += '<li><a href="' + cat.slug + '.html" class="hover:text-primary transition-colors">' + cat.nombre + '</a></li>';
        }
        
        footer.innerHTML = html;
    },
    
    renderAll: function() {
        this.renderHeader();
        this.renderFooter();
    }
};

// Auto-render on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        Navigation.renderAll();
    });
} else {
    Navigation.renderAll();
}

// Exponer globalmente
window.Navigation = Navigation;
