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
