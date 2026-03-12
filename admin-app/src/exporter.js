const fs = require('fs');
const path = require('path');
const log = require('electron-log');

class Exporter {
    constructor(database, outputPath) {
        this.db = database;
        this.outputPath = outputPath;
    }

    async exportAll() {
        log.info('Iniciando exportación a:', this.outputPath);
        
        // Asegurar que existe el directorio
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath, { recursive: true });
        }

        await this.exportProducts();
        await this.exportStore();
        await this.exportCategories();
        await this.exportBrands();
        await this.exportPromotions();
        
        log.info('Exportación completada');
        return true;
    }

    async exportProducts() {
        const products = this.db.getAllProducts().filter(p => p.activo);
        
        // Obtener configuración de la tienda
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
                categoria: p.categoria_nombre ? p.categoria_nombre.toLowerCase().replace(/\s+/g, '') : 'otros',
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
            orden: c.orden
        }));

        const filePath = path.join(this.outputPath, 'categorias.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        log.info('Categorías exportadas:', filePath);
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
