/**
 * DataStore - Centralized data management
 * Single source of truth for all JSON data
 * Eliminates duplicate fetches and ensures data consistency
 */

const DataStore = (function() {
    const store = {
        categorias: null,
        productos: null,
        marcas: null,
        promociones: null,
        tienda: null,
        version: null,
        loaded: false
    };

    let loadPromise = null;

    async function fetchJSON(path) {
        try {
            const res = await fetch(path + '?v=' + Date.now());
            if (!res.ok) throw new Error('Error loading ' + path);
            return await res.json();
        } catch(err) {
            console.error('DataStore error:', err);
            return null;
        }
    }

    async function cargarDatos() {
        if (store.loaded && loadPromise) {
            return store;
        }

        if (loadPromise) {
            return loadPromise;
        }

        loadPromise = (async () => {
            console.log('DataStore: Loading all data...');
            
            const [categorias, productos, marcas, promociones, tienda, version] = await Promise.all([
                fetchJSON('categorias.json'),
                fetchJSON('productos.json'),
                fetchJSON('marcas.json'),
                fetchJSON('promociones.json'),
                fetchJSON('tienda.json'),
                fetchJSON('version.json')
            ]);

            store.categorias = categorias || [];
            store.productos = productos || { productos: [], tienda: {} };
            store.marcas = marcas || [];
            store.promociones = promociones || [];
            store.tienda = tienda || {};
            store.version = version || { v: 0 };
            store.loaded = true;

            console.log('DataStore: Loaded', {
                categorias: store.categorias.length,
                productos: store.productos.productos?.length || 0,
                marcas: store.marcas.length,
                promociones: store.promociones.length
            });

            return store;
        })();

        return loadPromise;
    }

    function getStore() {
        return store;
    }

    function getCategorias() {
        return store.categorias || [];
    }

    function getProductos() {
        return store.productos?.productos || [];
    }

    function getTienda() {
        return store.productos?.tienda || store.tienda || {};
    }

    function getMarcas() {
        return store.marcas || [];
    }

    function getPromociones() {
        return store.promociones || [];
    }

    function getVersion() {
        return store.version?.v || 0;
    }

    function getProductosByCategoria(categoria) {
        return getProductos().filter(p => p.categoria === categoria);
    }

    function getCategoriaBySlug(slug) {
        return getCategorias().find(c => c.slug === slug);
    }

    function invalidateCache() {
        store.loaded = false;
        loadPromise = null;
    }

    return {
        cargarDatos,
        getStore,
        getCategorias,
        getProductos,
        getTienda,
        getMarcas,
        getPromociones,
        getVersion,
        getProductosByCategoria,
        getCategoriaBySlug,
        invalidateCache
    };
})();

// Auto-load on script execution
DataStore.cargarDatos();
