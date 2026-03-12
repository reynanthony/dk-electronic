/**
 * DK Electronic - Frontend Público (Solo Lectura)
 * Versión limpia sin administración
 */

(function() {
    'use strict';

    // ==========================================
    // MÓDULO: DataLoader - Carga datos del servidor
    // ==========================================
    const DataLoader = {
        data: null,
        categorias: [],
        marcas: [],
        promociones: [],

        async load() {
            const timestamp = Date.now();
            
            const [productosRes, categoriasRes, marcasRes, promocionesRes] = await Promise.all([
                fetch(`data/productos.json?_=${timestamp}`),
                fetch(`data/categorias.json?_=${timestamp}`),
                fetch(`data/marcas.json?_=${timestamp}`),
                fetch(`data/promociones.json?_=${timestamp}`)
            ]);

            this.data = productosRes.ok ? await productosRes.json() : { productos: [] };
            this.categorias = categoriasRes.ok ? await categoriasRes.json() : [];
            this.marcas = marcasRes.ok ? await marcasRes.json() : [];
            this.promociones = promocionesRes.ok ? await promocionesRes.json() : [];
            
            return this.data;
        },

        getProducts() {
            return this.data?.productos || [];
        },

        getCategories() {
            return this.categorias.map(c => c.slug || c.nombre.toLowerCase().replace(/\s+/g, ''));
        },

        getCategoriesFull() {
            return this.categorias;
        },

        getBrands() {
            return this.marcas;
        },

        getPromotions() {
            return this.promociones;
        },
        },

        getFeatured() {
            return this.getProducts().filter(p => p.destacado);
        },

        getByCategory(category) {
            return this.getProducts().filter(p => p.categoria === category);
        },

        getStore() {
            return this.data?.tienda || {};
        }
    };

    // ==========================================
    // MÓDULO: URL Builder - Construcción de URLs
    // ==========================================
    const UrlBuilder = {
        getWhatsAppLink(producto) {
            const numero = DataLoader.getStore().whatsapp || '18293686994';
            const mensaje = `Hola! Estoy interesado en: ${producto.nombre}\nPrecio: RD$ ${producto.precio.toLocaleString()}\n\n${producto.descripcion || ''}`;
            return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
        },

        getYoutubeId(url) {
            if (!url) return null;
            const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
            return match ? match[1] : null;
        }
    };

    // ==========================================
    // MÓDULO: ProductRenderer - Renderiza productos
    // ==========================================
    const CategoryRenderer = {
        defaultImages: {
            'televisores': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80',
            'aires': 'https://images.unsplash.com/photo-1631545806609-8da4a5c5d9b0?w=600&q=80',
            'electrodomesticos': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80'
        },
        render() {
            const container = document.getElementById('categorias-container');
            if (!container) return;

            const categories = DataLoader.getCategoriesFull();

            if (categories.length === 0) {
                container.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">No hay categorías disponibles</p>';
                return;
            }

            container.innerHTML = categories.map(cat => {
                const slug = cat.slug || cat.nombre.toLowerCase().replace(/\s+/g, '');
                const name = cat.nombre;
                const desc = 'Ver productos';
                const img = cat.imagen || this.defaultImages[slug] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';
                return `<a href="${slug}.html" class="group relative rounded-2xl overflow-hidden">
                    <img src="${img}" alt="${name}" class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" width="600" height="224" loading="lazy">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-5">
                        <h3 class="text-xl font-bold text-white">${name}</h3>
                        <p class="text-white/80 text-sm">${desc}</p>
                    </div>
                </a>`;
            }).join('');
        }
    };

    const NavRenderer = {
        render() {
            const nav = document.getElementById('main-nav');
            if (!nav) return;

            const categories = DataLoader.getCategories();
            const categoryNames = {
                'televisores': 'Televisores',
                'aires': 'Aires',
                'electrodomesticos': 'Electrodomésticos',
                'pulceras': 'Pulceras'
            };

            const links = categories.map(cat => {
                const name = categoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
                return `<a href="${cat}.html" class="text-sm font-medium hover:text-primary transition-colors">${name}</a>`;
            }).join('');

            nav.innerHTML = `<a href="index.html" class="text-sm font-medium hover:text-primary transition-colors">Inicio</a>` + links;
        }
    };

    const ProductRenderer = {
        render(list, containerId = 'productos') {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!list || list.length === 0) {
                container.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">No hay productos disponibles</p>';
                return;
            }

            container.innerHTML = list.map(p => this.renderProduct(p)).join('');
        },

        renderProduct(product) {
            const price = product.precio.toLocaleString();
            const wsLink = UrlBuilder.getWhatsAppLink(product);
            const badge = product.destacado 
                ? '<div class="absolute top-3 right-3 bg-orange-700 text-white text-[10px] font-black px-2 py-1 rounded uppercase">Hot</div>' 
                : '';
            const garantiaBadge = product.garantia 
                ? `<div class="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    ${product.garantiaAnios || 1} año${(product.garantiaAnios || 1) > 1 ? 's' : ''} garantía
                   </div>`
                : '';

            return `
            <div class="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-700/30 transition-all duration-300">
                ${badge}
                <div class="aspect-square relative overflow-hidden bg-gray-100">
                    <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy"
                        onerror="this.src='https://placehold.co/400x400/f3f4f6/9ca3af?text=Sin+Imagen'">
                </div>
                <div class="p-4 flex flex-col flex-1">
                    <span class="text-xs text-orange-700 uppercase tracking-wide">${product.categoria}</span>
                    <h3 class="font-bold text-sm text-gray-800 mt-1 line-clamp-1">${product.nombre}</h3>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">${product.descripcion || ''}</p>
                    ${garantiaBadge}
                    <p class="text-lg font-black text-orange-700 mt-2">RD$ ${price}</p>
                    <a href="${wsLink}" target="_blank" class="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Comprar
                    </a>
                </div>
            </div>`;
        }
    };

    // ==========================================
    // MÓDULO: CategoryFilter - Filtros de categorías
    // ==========================================
    const CategoryFilter = {
        init() {
            const container = document.getElementById('filtros');
            if (!container) return;

            const categorias = DataLoader.getCategories();
            const buttons = ['todos', ...categorias];
            
            container.innerHTML = buttons.map((c, i) => {
                const isActive = i === 0;
                const label = c === 'todos' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1);
                return `<button data-category="${c}" class="filter-btn flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${isActive ? 'bg-primary text-white shadow-orange-300/50' : 'bg-white text-slate-600 hover:bg-orange-50 border border-slate-200'}">${label}</button>`;
            }).join('');

            container.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.handleFilter(e));
            });
        },

        handleFilter(e) {
            const category = e.target.dataset.category;
            
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-primary', 'text-white', 'shadow-orange-300/50');
                b.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
            });
            e.target.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');
            e.target.classList.add('bg-primary', 'text-white', 'shadow-orange-300/50');

            const result = category === 'todos' 
                ? DataLoader.getProducts() 
                : DataLoader.getByCategory(category);
            
            ProductRenderer.render(result);
        }
    };

    // ==========================================
    // MÓDULO: WarrantyRenderer - Página de garantía
    // ==========================================
    const WarrantyRenderer = {
        render() {
            const container = document.getElementById('productos');
            const products = DataLoader.getProducts().filter(p => p.garantia);
            ProductRenderer.render(products, 'productos');
            this.renderInfo();
        },

        renderInfo() {
            const container = document.getElementById('garantiaInfo');
            if (!container) return;

            container.innerHTML = `
                <div class="grid md:grid-cols-3 gap-6 mb-12">
                    <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div class="w-14 h-14 bg-orange-700/10 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        </div>
                        <h3 class="font-bold text-lg mb-2">2 Años de Garantía</h3>
                        <p class="text-sm text-gray-500">Todos nuestros Televisores incluyen garantía total.</p>
                    </div>
                    <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div class="w-14 h-14 bg-orange-700/10 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                        </div>
                        <h3 class="font-bold text-lg mb-2">2 Años de Garantía</h3>
                        <p class="text-sm text-gray-500">Aires Acondicionados con garantía total.</p>
                    </div>
                    <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div class="w-14 h-14 bg-orange-700/10 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                        </div>
                        <h3 class="font-bold text-lg mb-2">1 Año de Garantía</h3>
                        <p class="text-sm text-gray-500">Electrodomésticos con garantía especializada.</p>
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
                    <h3 class="font-bold text-lg mb-4">¿Qué cubre la garantía?</h3>
                    <ul class="space-y-3 text-sm text-gray-600">
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            <span>Defectos de fábrica en componentes eléctricos y electrónicos</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            <span>Problemas de funcionamiento que no sean por mal uso</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            <span>Repuestos y mano de obra sin costo</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            <span>Servicio técnico a domicilio (según ubicación)</span>
                        </li>
                    </ul>
                    
                    <h3 class="font-bold text-lg mb-4 mt-6">¿Qué NO cubre la garantía?</h3>
                    <ul class="space-y-3 text-sm text-gray-600">
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                            <span>Daños por uso inadecuado o accidentes</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                            <span>Daños por picos de tensión o fallas eléctricas</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                            <span>Productos sin factura o comprobante de compra</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                            <span>Desgaste natural por uso</span>
                        </li>
                    </ul>
                </div>`;
        }
    };

    // ==========================================
    // MÓDULO: App - Inicialización
    // ==========================================
    const App = {
        async init() {
            try {
                await DataLoader.load();
                this.render();
            } catch (e) {
                console.error('Error initializing app:', e);
                const container = document.getElementById('productos');
                if (container) {
                    container.innerHTML = '<p class="col-span-full text-center py-10 text-red-500">Error al cargar los productos. Por favor recarga la página.</p>';
                }
            }
        },

        render() {
            const isCategoryPage = typeof CATEGORIA !== 'undefined';
            
            if (isCategoryPage) {
                if (CATEGORIA === 'garantia') {
                    WarrantyRenderer.render();
                } else {
                    const filtered = DataLoader.getByCategory(CATEGORIA);
                    ProductRenderer.render(filtered);
                }
            } else {
                ProductRenderer.render(DataLoader.getProducts());
                CategoryFilter.init();
                CategoryRenderer.render();
                NavRenderer.render();
            }
        }
    };

    // ==========================================
    // Inicialización automática
    // ==========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }
})();
