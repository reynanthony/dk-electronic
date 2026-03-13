const fs = require('fs');
const path = require('path');
const log = require('electron-log');

class Exporter {
    constructor(database, outputPath) {
        this.db = database;
        this.outputPath = outputPath;
    }

    async exportAll() {
        log.info('Iniciando exportacin a:', this.outputPath);
        
        // Asegurar que existe el directorio
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath, { recursive: true });
        }

        // Update version number for cache busting
        await this.exportVersion();
        
        await this.exportProducts();
        await this.exportStore();
        await this.exportCategories();
        await this.exportBrands();
        await this.exportPromotions();
        await this.exportPages();
        
        log.info('Exportacin completada');
        return true;
    }

    async exportVersion() {
        let version = 1;
        const versionPath = path.join(this.outputPath, 'version.json');
        
        if (fs.existsSync(versionPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
                version = (data.v || 0) + 1;
            } catch(e) {
                version = 1;
            }
        }
        
        fs.writeFileSync(versionPath, JSON.stringify({ v: version }, null, 2), 'utf8');
        log.info('Version exportada:', version);
    }

    async exportProducts() {
        const products = this.db.getAllProducts().filter(p => p.activo);
        
        // Obtener configuracin de la tienda
        const settings = this.db.getSettings();
        
        const data = {
            tienda: {
                nombre: settings.nombre_tienda || 'DK Electronic',
                whatsapp: settings.whatsapp || '18293686994'
            },
productos: products.map(p => ({
                id: p.id,
                nombre: p.nombre,
                descripcion: p.descripcion,
                precio: p.precio,
                categoria: p.categoria_slug || p.categoria_nombre?.toLowerCase().replace(/\s+/g, '') || 'otros',
                categoria_id: p.categoria_id,
                imagen: p.imagen,
                destacado: p.destacado === 1,
                garantia: p.garantia === 1,
                garantiaAnios: p.garantia_anios,
                garantiaCond: p.garantia_cond
            }))
        };

        const filePath = path.join(this.outputPath, 'productos.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        log.info('Productos exportados:', filePath);
    }

    async exportCategories() {
        const categories = this.db.getAllCategories().filter(c => c.activo);
        
        const data = categories.map(c => ({
            id: c.id,
            nombre: c.nombre,
            slug: c.slug,
            imagen: c.imagen || '',
            orden: c.orden,
            hero_imagen: c.hero_imagen || '',
            hero_titulo: c.hero_titulo || '',
            hero_subtitulo: c.hero_subtitulo || ''
        }));

        const filePath = path.join(this.outputPath, 'categorias.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        log.info('Categorias exportadas:', filePath);
    }

    async exportBrands() {
        const brands = this.db.getAllBrands().filter(b => b.activo);
        
        const data = brands.map(b => ({
            id: b.id,
            nombre: b.nombre,
            logo_url: b.logo_url || '',
            orden: b.orden
        }));

        const filePath = path.join(this.outputPath, 'marcas.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        log.info('Marcas exportadas:', filePath);
    }

    async exportPromotions() {
        const promotions = this.db.getAllPromotions().filter(p => p.activo);
        
        const data = promotions.map(p => ({
            id: p.id,
            titulo: p.titulo,
            descripcion: p.descripcion,
            imagen: p.imagen || '',
            video_url: p.video_url || '',
            fecha_inicio: p.fecha_inicio,
            fecha_fin: p.fecha_fin
        }));

        const filePath = path.join(this.outputPath, 'promociones.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        log.info('Promociones exportadas:', filePath);
    }

    async exportPages() {
        const pages = this.db.getAllPages().filter(p => p.activo);
        
        const data = {};
        pages.forEach(p => {
            data[p.page_slug] = {
                title: p.title || '',
                content: p.content || ''
            };
        });

        const filePath = path.join(this.outputPath, 'paginas.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        log.info('Pginas exportadas:', filePath);

        // Create HTML pages for categories automatically
        await this.createCategoryPages();
    }

    async createCategoryPages() {
        const categories = this.db.getAllCategories().filter(c => c.activo);
        
        const templatePath = path.join(this.outputPath, 'electrodomesticos.html');
        
        // Read template if exists, otherwise create basic template
        let template = '';
        if (fs.existsSync(templatePath)) {
            template = fs.readFileSync(templatePath, 'utf8');
        } else {
            // Basic template for category pages
            template = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
<meta name="description" content="{CATEGORY_NAME} | DK Electronic"/>
<meta name="keywords" content="{CATEGORY_NAME}, dk electronic, republica dominicana"/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="https://reynanthony.github.io/dk-electronic/{SLUG}.html"/>
<link rel="manifest" href="manifest.json"/>
<meta name="theme-color" content="#c2410c"/>
<title>{CATEGORY_NAME} | DK Electronic</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<script>
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#c2410c',
                'primary-light': '#ea580c',
                surface: '#ffffff',
                background: '#f8fafc',
                muted: '#94a3b8',
                dark: '#0f172a',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            }
        }
    }
}
</script>
<style>
body { font-family: 'Outfit', sans-serif; }
</style>
</head>
<body class="bg-background text-dark font-sans">
<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="flex items-center justify-between h-16">
<a href="index.html" class="flex items-center gap-3" aria-label="DK Electronic - Inicio">
<img src="logo/dklogo-removebg-preview.png" alt="DK" class="h-10 w-10 object-contain" width="40" height="40">
<span class="text-xl font-bold tracking-tight">DK <span class="text-primary">Electronic</span></span>
</a>
<nav class="hidden md:flex items-center gap-8" aria-label="Navegacin principal">
<a href="index.html" class="text-sm font-medium hover:text-primary transition-colors">Inicio</a>
<a href="televisores.html" class="text-sm font-medium hover:text-primary transition-colors">Televisores</a>
<a href="aires.html" class="text-sm font-medium hover:text-primary transition-colors">Aires</a>
<a href="electrodomesticos.html" class="text-sm font-medium hover:text-primary transition-colors">Electrodomsticos</a>
<a href="pulseras.html" class="text-sm font-medium hover:text-primary transition-colors">Pulseras</a>
</nav>
<div class="flex items-center gap-3">
<a href="https://wa.me/18293686994" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-700 transition-colors" aria-label="Contactar por WhatsApp">
<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
<span class="hidden sm:inline">WhatsApp</span>
</a>
</div>
</div>
</div>
</header>

<main class="py-12">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="mb-8">
<h1 class="text-3xl font-bold">{CATEGORY_NAME}</h1>
<p class="text-muted mt-2">Los mejores productos en {CATEGORY_NAME}</p>
</div>
<div id="productos" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
<div class="col-span-full text-center py-12 text-muted">
<div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
<p class="mt-4">Cargando productos...</p>
</div>
</div>
</div>
</main>

<footer class="bg-white py-12 border-t" role="contentinfo">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid md:grid-cols-4 gap-10">
<div>
<div class="flex items-center gap-2 mb-4">
<img src="logo/dklogo-removebg-preview.png" alt="DK" class="h-8 w-8 object-contain" width="32" height="32">
<span class="font-bold">DK <span class="text-primary">Electronic</span></span>
</div>
<p class="text-sm text-muted">Los mejores electrodomsticos con garanta y servicio tcnico en Repblica Dominicana.</p>
</div>
<div>
<h4 class="font-medium mb-4">Categorias</h4>
<ul class="space-y-2 text-sm text-muted">
<li><a href="televisores.html" class="hover:text-primary transition-colors">Televisores</a></li>
<li><a href="aires.html" class="hover:text-primary transition-colors">Aires</a></li>
<li><a href="electrodomesticos.html" class="hover:text-primary transition-colors">Electrodomsticos</a></li>
<li><a href="pulseras.html" class="hover:text-primary transition-colors">Pulseras</a></li>
</ul>
</div>
<div>
<h4 class="font-medium mb-4">Ayuda</h4>
<ul class="space-y-2 text-sm text-muted">
<li><a href="envios.html" class="hover:text-primary transition-colors">Envos</a></li>
<li><a href="garantia.html" class="hover:text-primary transition-colors">Garanta</a></li>
<li><a href="contacto.html" class="hover:text-primary transition-colors">Contacto</a></li>
</ul>
</div>
<div>
<h4 class="font-medium mb-4">Contacto</h4>
<p class="text-sm text-muted">+1 (829) 368-6994</p>
<p class="text-sm text-muted">Repblica Dominicana</p>
</div>
</div>
<div class="pt-8 border-t text-center text-sm text-muted">
 2024 DK Electronic. Todos los derechos reservados.
</div>
</div>
</footer>

<script>
const CATEGORIA = '{SLUG}';
</script>
<script src="app-publico.js"></script>
</body>
</html>`;
        }

        for (const cat of categories) {
            const slug = cat.slug;
            const pagePath = path.join(this.outputPath, slug + '.html');
            
            // Only create if doesn't exist
            if (!fs.existsSync(pagePath)) {
                let pageContent = template
                    .replace(/{CATEGORY_NAME}/g, cat.nombre)
                    .replace(/{SLUG}/g, slug);
                
                fs.writeFileSync(pagePath, pageContent, 'utf8');
                log.info('Pgina creada:', pagePath);
            }
        }

        // Update all existing pages with new category links
        await this.updateAllPagesWithCategoryLinks(categories);
    }

    async updateAllPagesWithCategoryLinks(categories) {
        const pagesToUpdate = ['index.html', 'televisores.html', 'aires.html', 'electrodomesticos.html', 'pulseras.html', 'viajes.html', 'comida.html', 'contacto.html', 'envios.html', 'garantia.html'];
        
        for (const page of pagesToUpdate) {
            const pagePath = path.join(this.outputPath, page);
            if (!fs.existsSync(pagePath)) continue;
            
            let content = fs.readFileSync(pagePath, 'utf8');
            let modified = false;
            
            for (const cat of categories) {
                const slug = cat.slug;
                const name = cat.nombre;
                const headerLink = '<a href="' + slug + '.html" class="text-sm font-medium hover:text-primary transition-colors">' + name + '</a>';
                const footerLink = '<li><a href="' + slug + '.html" class="hover:text-primary transition-colors">' + name + '</a></li>';
                
                if (!content.includes('href="' + slug + '.html"')) {
                    modified = true;
                }
                
                if (!content.includes('>' + name + '</a></li>') && content.includes('<h4 class="font-medium mb-4">Categorias</h4>')) {
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(pagePath, content, 'utf8');
                log.info('Pagina actualizada:', pagePath);
            }
        }
    }

    async exportStore() {
        const settings = this.db.getSettings();
        
        const data = {
            nombre: settings.nombre_tienda || 'DK Electronic',
            whatsapp: settings.whatsapp || '18293686994',
            telefono: settings.telefono || '',
            email: settings.email || '',
            direccion: settings.direccion || ''
        };

        const filePath = path.join(this.outputPath, 'tienda.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        log.info('Tienda exportada:', filePath);
    }
}

module.exports = Exporter;
