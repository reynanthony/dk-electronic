const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');

class DKDatabase {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    initialize() {
        this.db = new Database(this.dbPath);
        this.db.pragma('journal_mode = WAL');
        
        this.createTables();
        this.seedDefaultData();
        
        log.info('Tablas creadas y datos iniciales cargados');
    }

    createTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL UNIQUE,
                slug TEXT UNIQUE,
                activo INTEGER DEFAULT 1,
                orden INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS brands (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL UNIQUE,
                logo_url TEXT,
                activo INTEGER DEFAULT 1,
                orden INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                precio REAL NOT NULL,
                categoria_id INTEGER,
                imagen TEXT,
                destacado INTEGER DEFAULT 0,
                activo INTEGER DEFAULT 1,
                garantia INTEGER DEFAULT 0,
                garantia_anios INTEGER DEFAULT 1,
                garantia_cond TEXT,
                orden INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES categories(id)
            );

            CREATE TABLE IF NOT EXISTS promotions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                descripcion TEXT,
                imagen_url TEXT,
                video_url TEXT,
                activo INTEGER DEFAULT 1,
                orden INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS site_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                nombre_tienda TEXT DEFAULT 'DK Electronic',
                whatsapp TEXT DEFAULT '18293686994',
                telefono TEXT,
                email TEXT,
                direccion TEXT,
                logo_url TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    seedDefaultData() {
        // Verificar si ya hay datos
        const categoryCount = this.db.prepare('SELECT COUNT(*) as count FROM categories').get();
        
        if (categoryCount.count === 0) {
            // Insertar categorías por defecto
            const insertCategory = this.db.prepare('INSERT INTO categories (nombre, slug, orden) VALUES (?, ?, ?)');
            insertCategory.run('Televisores', 'televisores', 1);
            insertCategory.run('Aires Acondicionados', 'aires', 2);
            insertCategory.run('Electrodomésticos', 'electrodomesticos', 3);
        }

        const brandCount = this.db.prepare('SELECT COUNT(*) as count FROM brands').get();
        
        if (brandCount.count === 0) {
            // Insertar marcas por defecto
            const insertBrand = this.db.prepare('INSERT INTO brands (nombre, activo, orden) VALUES (?, ?, ?)');
            insertBrand.run('Samsung', 1, 1);
            insertBrand.run('LG', 1, 2);
            insertBrand.run('Sony', 1, 3);
            insertBrand.run('Midea', 1, 4);
            insertBrand.run('Whirlpool', 1, 5);
        }

        const settingsCount = this.db.prepare('SELECT COUNT(*) as count FROM site_settings').get();
        
        if (settingsCount.count === 0) {
            // Insertar configuración por defecto
            this.db.prepare('INSERT INTO site_settings (id, nombre_tienda, whatsapp) VALUES (1, ?, ?)').run('DK Electronic', '18293686994');
        }
    }

    // ==========================================
    // PRODUCTOS
    // ==========================================
    getAllProducts() {
        return this.db.prepare(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM products p 
            LEFT JOIN categories c ON p.categoria_id = c.id 
            ORDER BY p.orden, p.id
        `).all();
    }

    getProductById(id) {
        return this.db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    }

    createProduct(product) {
        const stmt = this.db.prepare(`
            INSERT INTO products (nombre, descripcion, precio, categoria_id, imagen, destacado, activo, garantia, garantia_anios, garantia_cond, orden)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            product.nombre,
            product.descripcion || '',
            product.precio,
            product.categoria_id || null,
            product.imagen || '',
            product.destacado ? 1 : 0,
            product.activo !== false ? 1 : 0,
            product.garantia ? 1 : 0,
            product.garantia_anios || 1,
            product.garantia_cond || '',
            product.orden || 0
        );
        
        return { id: result.lastInsertRowid, ...product };
    }

    updateProduct(id, product) {
        const stmt = this.db.prepare(`
            UPDATE products SET 
                nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, imagen = ?,
                destacado = ?, activo = ?, garantia = ?, garantia_anios = ?, garantia_cond = ?,
                orden = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run(
            product.nombre,
            product.descripcion || '',
            product.precio,
            product.categoria_id || null,
            product.imagen || '',
            product.destacado ? 1 : 0,
            product.activo !== false ? 1 : 0,
            product.garantia ? 1 : 0,
            product.garantia_anios || 1,
            product.garantia_cond || '',
            product.orden || 0,
            id
        );
        
        return { id, ...product };
    }

    deleteProduct(id) {
        return this.db.prepare('DELETE FROM products WHERE id = ?').run(id);
    }

    // ==========================================
    // CATEGORÍAS
    // ==========================================
    getAllCategories() {
        return this.db.prepare('SELECT * FROM categories ORDER BY orden, id').all();
    }

    createCategory(category) {
        const slug = category.slug || category.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const stmt = this.db.prepare('INSERT INTO categories (nombre, slug, activo, orden) VALUES (?, ?, ?, ?)');
        const result = stmt.run(category.nombre, slug, category.activo ? 1 : 0, category.orden || 0);
        return { id: result.lastInsertRowid, ...category, slug };
    }

    updateCategory(id, category) {
        const slug = category.slug || category.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        this.db.prepare('UPDATE categories SET nombre = ?, slug = ?, activo = ?, orden = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(category.nombre, slug, category.activo ? 1 : 0, category.orden || 0, id);
        return { id, ...category, slug };
    }

    deleteCategory(id) {
        return this.db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    }

    // ==========================================
    // MARCAS
    // ==========================================
    getAllBrands() {
        return this.db.prepare('SELECT * FROM brands ORDER BY orden, id').all();
    }

    createBrand(brand) {
        const stmt = this.db.prepare('INSERT INTO brands (nombre, logo_url, activo, orden) VALUES (?, ?, ?, ?)');
        const result = stmt.run(brand.nombre, brand.logo_url || '', brand.activo ? 1 : 0, brand.orden || 0);
        return { id: result.lastInsertRowid, ...brand };
    }

    updateBrand(id, brand) {
        this.db.prepare('UPDATE brands SET nombre = ?, logo_url = ?, activo = ?, orden = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(brand.nombre, brand.logo_url || '', brand.activo ? 1 : 0, brand.orden || 0, id);
        return { id, ...brand };
    }

    deleteBrand(id) {
        return this.db.prepare('DELETE FROM brands WHERE id = ?').run(id);
    }

    // ==========================================
    // PROMOCIONES
    // ==========================================
    getAllPromotions() {
        return this.db.prepare('SELECT * FROM promotions ORDER BY orden, id').all();
    }

    createPromotion(promotion) {
        const stmt = this.db.prepare('INSERT INTO promotions (titulo, descripcion, imagen_url, video_url, activo, orden) VALUES (?, ?, ?, ?, ?, ?)');
        const result = stmt.run(
            promotion.titulo,
            promotion.descripcion || '',
            promotion.imagen_url || '',
            promotion.video_url || '',
            promotion.activo ? 1 : 0,
            promotion.orden || 0
        );
        return { id: result.lastInsertRowid, ...promotion };
    }

    updatePromotion(id, promotion) {
        this.db.prepare('UPDATE promotions SET titulo = ?, descripcion = ?, imagen_url = ?, video_url = ?, activo = ?, orden = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(
                promotion.titulo,
                promotion.descripcion || '',
                promotion.imagen_url || '',
                promotion.video_url || '',
                promotion.activo ? 1 : 0,
                promotion.orden || 0,
                id
            );
        return { id, ...promotion };
    }

    deletePromotion(id) {
        return this.db.prepare('DELETE FROM promotions WHERE id = ?').run(id);
    }

    // ==========================================
    // CONFIGURACIÓN
    // ==========================================
    getSettings() {
        return this.db.prepare('SELECT * FROM site_settings WHERE id = 1').get() || {};
    }

    updateSettings(settings) {
        this.db.prepare(`
            UPDATE site_settings SET 
                nombre_tienda = ?, whatsapp = ?, telefono = ?, email = ?, 
                direccion = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `).run(
            settings.nombre_tienda,
            settings.whatsapp,
            settings.telefono || '',
            settings.email || '',
            settings.direccion || '',
            settings.logo_url || ''
        );
        return settings;
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = DKDatabase;
