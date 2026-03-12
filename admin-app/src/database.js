const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');

class DKDatabase {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this.SQL = null;
        
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    async initialize() {
        this.SQL = await initSqlJs();
        
        if (fs.existsSync(this.dbPath)) {
            const buffer = fs.readFileSync(this.dbPath);
            this.db = new this.SQL.Database(buffer);
        } else {
            this.db = new this.SQL.Database();
        }
        
        this.createTables();
        this.seedDefaultData();
        this.save();
        
        log.info('Base de datos inicializada');
    }

    save() {
        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(this.dbPath, buffer);
    }

    createTables() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL UNIQUE,
                slug TEXT UNIQUE,
                imagen TEXT,
                activo INTEGER DEFAULT 1,
                orden INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        this.db.run(`
            CREATE TABLE IF NOT EXISTS brands (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL UNIQUE,
                logo_url TEXT,
                activo INTEGER DEFAULT 1,
                orden INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        this.db.run(`
            CREATE TABLE IF NOT EXISTS promotions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                descripcion TEXT,
                imagen TEXT,
                video_url TEXT,
                activo INTEGER DEFAULT 1,
                fecha_inicio TEXT,
                fecha_fin TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        this.db.run(`
            CREATE TABLE IF NOT EXISTS page_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_slug TEXT NOT NULL UNIQUE,
                title TEXT,
                descripcion TEXT,
                content TEXT,
                section1_title TEXT,
                section1_content TEXT,
                section2_title TEXT,
                section2_content TEXT,
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        this.db.run(`
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
            )
        `);

        this.db.run(`
            CREATE TABLE IF NOT EXISTS site_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                nombre_tienda TEXT DEFAULT 'DK Electronic',
                whatsapp TEXT DEFAULT '18293686994',
                telefono TEXT,
                email TEXT,
                direccion TEXT,
                logo_url TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    seedDefaultData() {
        const categoryCount = this.db.exec('SELECT COUNT(*) as count FROM categories')[0]?.values[0][0] || 0;
        
        if (categoryCount === 0) {
            this.db.run("INSERT INTO categories (nombre, slug, orden) VALUES ('Televisores', 'televisores', 1)");
            this.db.run("INSERT INTO categories (nombre, slug, orden) VALUES ('Aires Acondicionados', 'aires', 2)");
            this.db.run("INSERT INTO categories (nombre, slug, orden) VALUES ('Electrodomésticos', 'electrodomesticos', 3)");
            this.db.run("INSERT INTO categories (nombre, slug, orden) VALUES ('Pulseras', 'pulseras', 4)");
        }

        const brandCount = this.db.exec('SELECT COUNT(*) as count FROM brands')[0]?.values[0][0] || 0;
        
        if (brandCount === 0) {
            this.db.run("INSERT INTO brands (nombre, activo, orden) VALUES ('Samsung', 1, 1)");
            this.db.run("INSERT INTO brands (nombre, activo, orden) VALUES ('LG', 1, 2)");
            this.db.run("INSERT INTO brands (nombre, activo, orden) VALUES ('Sony', 1, 3)");
            this.db.run("INSERT INTO brands (nombre, activo, orden) VALUES ('Midea', 1, 4)");
            this.db.run("INSERT INTO brands (nombre, activo, orden) VALUES ('Whirlpool', 1, 5)");
        }

        const promotionCount = this.db.exec('SELECT COUNT(*) as count FROM promotions')[0]?.values[0][0] || 0;
        
        if (promotionCount === 0) {
            this.db.run("INSERT INTO promotions (titulo, descripcion, video_url, activo, fecha_inicio, fecha_fin) VALUES ('Promoción Especial', 'Gran descuento en toda la tienda', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, '2026-01-01', '2026-12-31')");
        }

        const settingsCount = this.db.exec('SELECT COUNT(*) as count FROM site_settings')[0]?.values[0][0] || 0;
        
        if (settingsCount === 0) {
            this.db.run("INSERT INTO site_settings (id, nombre_tienda, whatsapp) VALUES (1, 'DK Electronic', '18293686994')");
        }
    }

    _rowsToObjects(stmt) {
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
        }
        stmt.free();
        return results;
    }

    // PRODUCTOS
    getAllProducts() {
        const stmt = this.db.prepare(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM products p 
            LEFT JOIN categories c ON p.categoria_id = c.id 
            ORDER BY p.orden, p.id
        `);
        return this._rowsToObjects(stmt);
    }

    getProductById(id) {
        const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
        stmt.bind([id]);
        const results = this._rowsToObjects(stmt);
        return results[0] || null;
    }

    createProduct(product) {
        this.db.run(`
            INSERT INTO products (nombre, descripcion, precio, categoria_id, imagen, destacado, activo, garantia, garantia_anios, garantia_cond, orden)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            product.nombre, product.descripcion || '', product.precio, product.categoria_id || null,
            product.imagen || '', product.destacado ? 1 : 0, product.activo !== false ? 1 : 0,
            product.garantia ? 1 : 0, product.garantia_anios || 1, product.garantia_cond || '', product.orden || 0
        ]);
        const lastId = this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        this.save();
        return { id: lastId, ...product };
    }

    updateProduct(id, product) {
        this.db.run(`UPDATE products SET nombre=?, descripcion=?, precio=?, categoria_id=?, imagen=?, destacado=?, activo=?, garantia=?, garantia_anios=?, garantia_cond=?, orden=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [
            product.nombre, product.descripcion || '', product.precio, product.categoria_id || null,
            product.imagen || '', product.destacado ? 1 : 0, product.activo !== false ? 1 : 0,
            product.garantia ? 1 : 0, product.garantia_anios || 1, product.garantia_cond || '', product.orden || 0, id
        ]);
        this.save();
        return { id, ...product };
    }

    deleteProduct(id) {
        this.db.run('DELETE FROM products WHERE id = ?', [id]);
        this.save();
        return { changes: 1 };
    }

    // CATEGORÍAS
    getAllCategories() {
        const stmt = this.db.prepare('SELECT * FROM categories ORDER BY orden, id');
        return this._rowsToObjects(stmt);
    }

    createCategory(category) {
        const slug = category.slug || category.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        this.db.run('INSERT INTO categories (nombre, slug, imagen, activo, orden) VALUES (?, ?, ?, ?, ?)', [category.nombre, slug, category.imagen || '', category.activo ? 1 : 0, category.orden || 0]);
        const lastId = this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        this.save();
        return { id: lastId, ...category, slug };
    }

    updateCategory(id, category) {
        const slug = category.slug || category.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        this.db.run('UPDATE categories SET nombre=?, slug=?, imagen=?, activo=?, orden=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [category.nombre, slug, category.imagen || '', category.activo ? 1 : 0, category.orden || 0, id]);
        this.save();
        return { id, ...category, slug };
    }

    deleteCategory(id) {
        this.db.run('DELETE FROM categories WHERE id = ?', [id]);
        this.save();
        return { changes: 1 };
    }

    // MARCAS
    getAllBrands() {
        const stmt = this.db.prepare('SELECT * FROM brands ORDER BY orden, id');
        return this._rowsToObjects(stmt);
    }

    createBrand(brand) {
        this.db.run('INSERT INTO brands (nombre, logo_url, activo, orden) VALUES (?, ?, ?, ?)', [brand.nombre, brand.logo_url || '', brand.activo ? 1 : 0, brand.orden || 0]);
        const lastId = this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        this.save();
        return { id: lastId, ...brand };
    }

    updateBrand(id, brand) {
        this.db.run('UPDATE brands SET nombre=?, logo_url=?, activo=?, orden=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [brand.nombre, brand.logo_url || '', brand.activo ? 1 : 0, brand.orden || 0, id]);
        this.save();
        return { id, ...brand };
    }

    deleteBrand(id) {
        this.db.run('DELETE FROM brands WHERE id = ?', [id]);
        this.save();
        return { changes: 1 };
    }

    // PROMOCIONES
    getAllPromotions() {
        const stmt = this.db.prepare('SELECT * FROM promotions ORDER BY id DESC');
        return this._rowsToObjects(stmt);
    }

    getPromotionById(id) {
        const stmt = this.db.prepare('SELECT * FROM promotions WHERE id = ?');
        stmt.bind([id]);
        const results = this._rowsToObjects(stmt);
        return results[0] || null;
    }

    createPromotion(promotion) {
        this.db.run(`INSERT INTO promotions (titulo, descripcion, imagen, video_url, activo, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            promotion.titulo, promotion.descripcion || '', promotion.imagen || '', promotion.video_url || '', 
            promotion.activo ? 1 : 0, promotion.fecha_inicio || null, promotion.fecha_fin || null
        ]);
        const lastId = this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        this.save();
        return { id: lastId, ...promotion };
    }

    updatePromotion(id, promotion) {
        this.db.run(`UPDATE promotions SET titulo=?, descripcion=?, imagen=?, video_url=?, activo=?, fecha_inicio=?, fecha_fin=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [
            promotion.titulo, promotion.descripcion || '', promotion.imagen || '', promotion.video_url || '',
            promotion.activo ? 1 : 0, promotion.fecha_inicio || null, promotion.fecha_fin || null, id
        ]);
        this.save();
        return { id, ...promotion };
    }

    deletePromotion(id) {
        this.db.run('DELETE FROM promotions WHERE id = ?', [id]);
        this.save();
        return { changes: 1 };
    }

    // PÁGINAS
    getAllPages() {
        const stmt = this.db.prepare('SELECT * FROM page_content ORDER BY page_slug');
        return this._rowsToObjects(stmt);
    }

    getPageBySlug(slug) {
        const stmt = this.db.prepare('SELECT * FROM page_content WHERE page_slug = ?');
        stmt.bind([slug]);
        const results = this._rowsToObjects(stmt);
        return results[0] || null;
    }

    savePage(page) {
        const existing = this.getPageBySlug(page.page_slug);
        if (existing) {
            this.db.run(`UPDATE page_content SET title=?, descripcion=?, content=?, section1_title=?, section1_content=?, section2_title=?, section2_content=?, activo=?, updated_at=CURRENT_TIMESTAMP WHERE page_slug=?`, [
                page.title || '', page.descripcion || '', page.content || '', 
                page.section1_title || '', page.section1_content || '',
                page.section2_title || '', page.section2_content || '',
                page.activo ? 1 : 0, page.page_slug
            ]);
        } else {
            this.db.run('INSERT INTO page_content (page_slug, title, descripcion, content, section1_title, section1_content, section2_title, section2_content, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                page.page_slug, page.title || '', page.descripcion || '', page.content || '',
                page.section1_title || '', page.section1_content || '',
                page.section2_title || '', page.section2_content || '',
                page.activo ? 1 : 0
            ]);
        }
        this.save();
        return page;
    }

    // CONFIGURACIÓN
    getSettings() {
        const stmt = this.db.prepare('SELECT * FROM site_settings WHERE id = 1');
        const results = this._rowsToObjects(stmt);
        return results[0] || {};
    }

    updateSettings(settings) {
        this.db.run(`UPDATE site_settings SET nombre_tienda=?, whatsapp=?, telefono=?, email=?, direccion=?, logo_url=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`, [
            settings.nombre_tienda, settings.whatsapp, settings.telefono || '', settings.email || '', settings.direccion || '', settings.logo_url || ''
        ]);
        this.save();
        return settings;
    }

    close() {
        if (this.db) { this.save(); this.db.close(); }
    }
}

module.exports = DKDatabase;
