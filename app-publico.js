/**
 * DK Electronic - Frontend Público (Solo Lectura)
 * Versión limpia sin administración
 */

(function() {
    'use strict';

    // ==========================================
    // MÓDULO: Temas visuales por categoría
    // ==========================================
    const CategoryThemes = {
        default: {
            primary: '#c2410c',
            primaryLight: '#ea580c',
            gradient: 'from-black/70 via-black/50 to-black/30',
            heroImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80',
            heroTitle: 'Los mejores',
            heroSubtitle: 'electrodomésticos',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V-10a6.75 6.75 0 00-6.75-6.75h-.875A6.75 6.75 0 003.75 3.75v12.5z" /></svg>'
        },
        televisores: {
            primary: '#1e293b',
            primaryLight: '#475569',
            gradient: 'from-black/70 via-black/50 to-black/30',
            heroImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1920&q=80',
            heroTitle: 'Smart TVs',
            heroSubtitle: 'de las mejores marcas',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.15c0 .621.504 1.125 1.125 1.125z" /></svg>'
        },
        aires: {
            primary: '#0284c7',
            primaryLight: '#0ea5e9',
            gradient: 'from-black/70 via-black/50 to-black/30',
            heroImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1920&q=80',
            heroTitle: 'Aires',
            heroSubtitle: 'frescura para tu hogar',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>'
        },
        electrodomesticos: {
            primary: '#c2410c',
            primaryLight: '#ea580c',
            gradient: 'from-black/70 via-black/50 to-black/30',
            heroImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80',
            heroTitle: 'Electrodomésticos',
            heroSubtitle: 'calidad garantizada',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V-10a6.75 6.75 0 00-6.75-6.75h-.875A6.75 6.75 0 003.75 3.75v12.5z" /></svg>'
        },
        pulseras: {
            primary: '#d97706',
            primaryLight: '#f59e0b',
            gradient: 'from-black/70 via-black/50 to-black/30',
            heroImage: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1920&q=80',
            heroTitle: 'Pulseras',
            heroSubtitle: 'joyería y accesorios',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>'
        },
        viajes: {
            primary: '#0d9488',
            primaryLight: '#14b8a6',
            gradient: 'from-black/70 via-black/50 to-black/30',
            heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80',
            heroTitle: 'Viajes',
            heroSubtitle: 'experiencias únicas',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>'
        },
        comida: {
            primary: '#dc2626',
            primaryLight: '#ef4444',
            gradient: 'from-black/70 via-black/50 to-black/30',
            heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80',
            heroTitle: 'Comer como reyes',
            heroSubtitle: 'es lo mejor de la vida',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 12.18" /></svg>'
        }
    };

    function getCategoryTheme(categorySlug) {
        return CategoryThemes[categorySlug] || CategoryThemes.default;
    }

    // ==========================================
    // MÓDULO: DataLoader - Usa DataStore centralizado
    // ==========================================
    async function ensureDataStore() {
        // If DataStore exists, return it
        if (window.DataStore) {
            return window.DataStore;
        }
        
        // Wait for DataStore to become available
        let attempts = 0;
        while (!window.DataStore && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
        }
        
        if (!window.DataStore) {
            // Try to load dataStore.js dynamically
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'dataStore.js?t=' + Date.now();
                script.onload = () => {
                    if (window.DataStore) {
                        resolve(window.DataStore);
                    } else {
                        reject(new Error('DataStore failed to load'));
                    }
                };
                script.onerror = () => reject(new Error('DataStore script failed to load'));
                document.head.appendChild(script);
            });
        }
        
        return window.DataStore;
    }

    const DataLoader = {
        async load() {
            const DataStore = await ensureDataStore();
            await DataStore.cargarDatos();
            this.data = DataStore.getStore();
            this.categorias = DataStore.getCategorias();
            this.marcas = DataStore.getMarcas();
            this.promociones = DataStore.getPromociones();
            return this.data;
        },

        hasError() {
            return this.loadError !== null;
        },

        getErrorMessage() {
            return this.loadError || '';
        },

        getProducts() {
            return this.data.productos?.productos || [];
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

        getFeatured() {
            return this.getProducts().filter(p => p.destacado);
        },

        getByCategory(category) {
            return this.getProducts().filter(p => p.categoria === category);
        },

        getStore() {
            return this.data.productos?.tienda || this.data.tienda || {};
        }
    };

    // ==========================================
    // MÓDULO: DynamicNav - Navegación dinámica desde JSON
    // Usa el módulo Navigation centralizado
    // ==========================================
    const DynamicNav = {
        async render() {
            if (typeof Navigation !== 'undefined'&& Navigation.renderHeader) {
                await Navigation.renderHeader();
            }
        },

        async renderFooter() {
            if (typeof Navigation !== 'undefined') {
                await Navigation.renderFooter();
            }
        },

        invalidateCache() {
            if (typeof Navigation !== 'undefined') {
                Navigation.invalidateCache();
            }
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
        defaultImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        render() {
            const container = document.getElementById('categorias-container');
            if (!container) return;

            const categories = DataLoader.getCategoriesFull();

            if (categories.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center py-12"><svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg><p class="text-gray-500 text-lg">No hay categorías disponibles</p></div>';
                return;
            }

            container.innerHTML = categories.map(cat => {
                const slug = cat.slug || cat.nombre.toLowerCase().replace(/\s+/g, '');
                const name = cat.nombre;
                const desc = 'Ver productos';
                const img = cat.imagen || this.defaultImage;
                const theme = getCategoryTheme(slug);
                return `<a href="${slug}.html" class="group relative rounded-2xl overflow-hidden">
                    <img src="${img}" alt="${name}" class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" width="600" height="224" loading="lazy">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-5 flex items-end gap-3">
                        <div class="text-white">${theme.icon}</div>
                        <div>
                            <h3 class="text-xl font-bold text-white">${name}</h3>
                            <p class="text-white/80 text-sm">${desc}</p>
                        </div>
                    </div>
                </a>`;
            }).join('');
        }
    };

    const BrandRenderer = {
        render() {
            const container = document.getElementById('brands-container');
            if (!container) return;

            const brands = DataLoader.getBrands();

            if (brands.length === 0) {
                container.innerHTML = '';
                return;
            }

            const brandsItems = brands.map(brand => {
                const logo = brand.logo_url || '';
                if (logo) {
                    return `<div class="flex-shrink-0 mx-10"><img src="${logo}" alt="${brand.nombre}" class="h-20 object-contain" loading="lazy" onerror="this.style.display='none'"></div>`;
                }
                return `<div class="flex-shrink-0 mx-10"><span class="text-2xl font-medium text-gray-600">${brand.nombre}</span></div>`;
            }).join('');

            container.innerHTML = `
                <div class="overflow-hidden py-6 bg-white">
                    <div class="marquee-track">
                        ${brandsItems}
                        ${brandsItems}
                    </div>
                </div>
            `;
        }
    };

const PromotionRenderer = {
        currentIndex: 0,
        promotions: [],
        rotationTimer: null,
        
        render() {
            const container = document.getElementById('promo-container');
            if (!container) return;

            this.promotions = DataLoader.getPromotions();

            if (this.promotions.length === 0) {
                container.innerHTML = '';
                return;
            }

            // Clear any existing timer
            if (this.rotationTimer) {
                clearTimeout(this.rotationTimer);
                this.rotationTimer = null;
            }

            this.currentIndex = 0;
            this.showCurrentPromotion();
        },

        showCurrentPromotion() {
            const container = document.getElementById('promo-container');
            if (!container || !this.promotions.length) return;

            const promo = this.promotions[this.currentIndex];
            container.innerHTML = this.renderPromotion(promo);

            // Schedule next promotion - use fixed 20 second interval for stability
            this.rotationTimer = setTimeout(() => {
                this.nextPromotion();
            }, 20000);
        },

        nextPromotion() {
            this.currentIndex = (this.currentIndex + 1) % this.promotions.length;
            this.showCurrentPromotion();
        },

        renderPromotion(promo) {
            if (!promo) return '';
            
            if (promo.video_url) {
                let videoUrl = promo.video_url;
                
                if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                    let videoId = '';
                    if (videoUrl.includes('v=')) {
                        const params = videoUrl.split('v=')[1];
                        videoId = params.split('&')[0];
                    } else {
                        videoId = videoUrl.split('/').pop();
                    }
                    videoUrl = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&mute=1&rel=0';
                    return '<div class="relative w-full" style="padding-bottom: 56.25%;"><iframe src="' + videoUrl + '" class="absolute top-0 left-0 w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
                } else if (videoUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
                    return '<div class="relative w-full" style="padding-bottom: 56.25%;"><video class="absolute top-0 left-0 w-full h-full" controls autoplay muted playsinline><source src="' + videoUrl + '" type="video/mp4">Tu navegador no soporta videos.</video></div>';
                }
            } else if (promo.imagen) {
                return '<div class="w-full h-64 md:h-80 relative"><img src="' + promo.imagen + '" alt="' + promo.titulo + '" class="w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end"><div class="p-6 text-white"><h3 class="text-2xl font-bold">' + promo.titulo + '</h3>' + (promo.descripcion ? '<p class="mt-2">' + promo.descripcion + '</p>' : '') + '</div></div></div>';
            }
            return '';
        }
    };

    const NavRenderer = {
        render() {
            // Find all nav elements in header
            const navs = document.querySelectorAll('header nav');
            if (navs.length === 0) return;

            const categories = DataLoader.getCategoriesFull();
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';

            const links = categories.map(cat => {
                const slug = cat.slug || cat.nombre.toLowerCase().replace(/\s+/g, '');
                const isActive = (slug + '.html') === currentPage;
                return `<a href="${slug}.html" class="text-sm font-medium hover:text-primary transition-colors ${isActive ? 'text-primary' : ''}">${cat.nombre}</a>`;
            }).join('');

            const navContent = `<a href="index.html" class="text-sm font-medium hover:text-primary transition-colors ${currentPage === 'index.html' ? 'text-primary' : ''}">Inicio</a>` + links;

            navs.forEach(nav => {
                nav.innerHTML = navContent;
            });
        }
    };

    const ProductRenderer = {
  render(list, containerId = 'productos') {

    const container = document.getElementById(containerId);
    if (!container) return;

    // Validación robusta
    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor"
               viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10" />
          </svg>

          <p class="text-gray-500 text-lg">No hay productos disponibles</p>
          <p class="text-gray-400 text-sm mt-1">Pronto tendremos nuevos productos</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list
      .map(p => this.renderProduct(p))
      .join('');
  },

  renderProduct(product) {
    const price = product.precio.toLocaleString();
    // Usar constante central para el numero de WhatsApp
    const numero = (DataLoader && DataLoader.getStore && DataLoader.getStore().whatsapp) || WHATSAPP_DEFAULT;
    const wsLink = 'https://wa.me/' + numero + '?text=' + encodeURIComponent('Quiero comprar: ' + product.nombre);
    // Sanitizar campos antes de insertar en innerHTML para prevenir XSS
    const tmpDiv = document.createElement('div');
    tmpDiv.textContent = product.nombre || '';
    const nombre = tmpDiv.innerHTML;
    tmpDiv.textContent = product.descripcion || '';
    const descripcion = tmpDiv.innerHTML;
    tmpDiv.textContent = product.categoria || '';
    const categoria = tmpDiv.innerHTML;

    const badge = product.destacado 
        ? '<div class="absolute top-3 right-3 bg-orange-700 text-white text-[10px] font-black px-2 py-1 rounded uppercase">Hot</div>' 
        : '';
    const garantiaBadge = product.garantia 
        ? '<div class="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>' + (product.garantiaAnios || 1) + ' año' + ((product.garantiaAnios || 1) > 1 ? 's' : '') + ' garantía</div>'
        : '';

    return '<div class="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-700/30 transition-all duration-300">' + badge + '<div class="aspect-square relative overflow-hidden bg-gray-100"><img src="' + product.imagen + '" alt="' + nombre + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" onerror="this.src=\'https://placehold.co/400x400/f3f4f6/9ca3af?text=Sin+Imagen\'"></div><div class="p-4 flex flex-col flex-1"><span class="text-xs text-orange-700 uppercase tracking-wide">' + categoria + '</span><h3 class="font-bold text-sm text-gray-800 mt-1 line-clamp-1">' + nombre + '</h3><p class="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">' + descripcion + '</p>' + garantiaBadge + '<p class="text-lg font-black text-orange-700 mt-2">RD$ ' + price + '</p><a href="' + wsLink + '" target="_blank" class="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">Comprar</a></div></div>';
  }
};

    // ==========================================
    // INICIALIZACIÓN PRINCIPAL
    // ==========================================
    async function init() {
        console.log('DK Electronic: Inicializando...');
        
        try {
            // Cargar datos
            await DataLoader.load();
            console.log('DK Electronic: Datos cargados');
            
            // Renderizar navegación
            await DynamicNav.render();
            await DynamicNav.renderFooter();
            
            // Renderizar categorías
            CategoryRenderer.render();
            
            // Renderizar marcas
            BrandRenderer.render();
            
            // Renderizar promociones
            PromotionRenderer.render();
            
            // Renderizar productos destacados
            const featured = DataLoader.getFeatured();
            ProductRenderer.render(featured);
            
            // Renderizar filtros de categorías
            renderFiltros();
            
            console.log('DK Electronic: Inicialización completa');
        } catch (error) {
            console.error('DK Electronic: Error en inicialización:', error);
        }
    }

    // Renderizar filtros de categorías en el sticky bar
    function renderFiltros() {
        const container = document.getElementById('filtros');
        if (!container) return;
        
        const categories = DataLoader.getCategoriesFull();
        if (categories.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        let html = '<button class="filter-btn px-4 py-2 rounded-full text-sm font-medium bg-primary text-white transition-colors" data-category="all">Todos</button>';
        
        html += categories.map(cat => {
            const slug = cat.slug || cat.nombre.toLowerCase().replace(/\s+/g, '');
            return '<button class="filter-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors" data-category="' + slug + '">' + cat.nombre + '</button>';
        }).join('');
        
        container.innerHTML = html;
        
        // Agregar event listeners a los filtros
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                container.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('bg-primary', 'text-white');
                    b.classList.add('bg-gray-100', 'text-gray-700');
                });
                this.classList.remove('bg-gray-100', 'text-gray-700');
                this.classList.add('bg-primary', 'text-white');
                
                const category = this.dataset.category;
                const products = category === 'all' 
                    ? DataLoader.getProducts() 
                    : DataLoader.getByCategory(category);
                ProductRenderer.render(products);
            });
        });
    }

    // Auto-inicialización cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
