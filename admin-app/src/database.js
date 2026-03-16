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
            this.db = new this.SQL.Database(new Uint8Array(buffer));
        } else {
            this.db = new this.SQL.Database();
        }
        
        this.createTables();
        this.migrate();
        this.seedDefaultData();
        await this.save();
        
        log.info('Base de datos inicializada');
    }

    async save() {
        if (!this.db) return;
        const data = this.db.export();
        const buffer = Buffer.from(data);
        await fs.promises.writeFile(this.dbPath, buffer);
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
                hero_imagen TEXT,
                hero_titulo TEXT,
                hero_subtitulo TEXT,
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

    migrate() {
        try {
            this.db.run("ALTER TABLE categories ADD COLUMN hero_imagen TEXT DEFAULT ''");
        } catch(e) {}
        try {
            this.db.run("ALTER TABLE categories ADD COLUMN hero_titulo TEXT DEFAULT ''");
        } catch(e) {}
        try {
            this.db.run("ALTER TABLE categories ADD COLUMN hero_subtitulo TEXT DEFAULT ''");
        } catch(e) {}
    }

    seedDefaultData() {
        const categoryCount = this.db.exec('SELECT COUNT(*) as count FROM categories')[0]?.values[0][0] || 0;
        
        if (categoryCount === 0) {
            this.db.run("INSERT INTO categories (nombre, slug, imagen, orden) VALUES ('Televisores', 'televisores', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80', 1)");
            this.db.run("INSERT INTO categories (nombre, slug, imagen, orden) VALUES ('Aires Acondicionados', 'aires', 'https://images.unsplash.com/photo-1631545806609-8da4a5c5d9b0?w=600&q=80', 2)");
            this.db.run("INSERT INTO categories (nombre, slug, imagen, orden) VALUES ('Electrodomésticos', 'electrodomesticos', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80', 3)");
            this.db.run("INSERT INTO categories (nombre, slug, imagen, orden) VALUES ('Pulseras', 'pulseras', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80', 4)");
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
            this.db.run("INSERT INTO promotions (titulo, descripcion, video_url, activo, fecha_inicio, fecha_fin) VALUES ('Promoción Especial', 'Gran descuento en toda la tienda', '', 1, '2026-01-01', '2026-12-31')");
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
            SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug 
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

    async createProduct(product) {
        this.db.run(`
            INSERT INTO products (nombre, descripcion, precio, categoria_id, imagen, destacado, activo, garantia, garantia_anios, garantia_cond, orden)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            String(product.nombre), String(product.descripcion || ''), parseFloat(product.precio) || 0, product.categoria_id ? parseInt(product.categoria_id, 10) : null,
            String(product.imagen || ''), product.destacado ? 1 : 0, product.activo !== false ? 1 : 0,
            product.garantia ? 1 : 0, parseInt(product.garantia_anios, 10) || 1, String(product.garantia_cond || ''), parseInt(product.orden, 10) || 0
        ]);
        const lastId = this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        await this.save();
        return { id: lastId, ...product };
    }

    async updateProduct(id, product) {
        this.db.run(`UPDATE products SET nombre=?, descripcion=?, precio=?, categoria_id=?, imagen=?, destacado=?, activo=?, garantia=?, garantia_anios=?, garantia_cond=?, orden=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [
            String(product.nombre), String(product.descripcion || ''), parseFloat(product.precio) || 0, product.categoria_id ? parseInt(product.categoria_id, 10) : null,
            String(product.imagen || ''), product.destacado ? 1 : 0, product.activo !== false ? 1 : 0,
            product.garantia ? 1 : 0, parseInt(product.garantia_anios, 10) || 1, String(product.garantia_cond || ''), parseInt(product.orden, 10) || 0, parseInt(id, 10)
        ]);
        await this.save();
        return { id, ...product };
    }

    async deleteProduct(id) {
        this.db.run('DELETE FROM products WHERE id = ?', [parseInt(id, 10)]);
        await this.save();
        return { changes: 1 };
    }

    // CATEGORÍAS
    getAllCategories() {
        const stmt = this.db.prepare('SELECT * FROM categories ORDER BY orden, id');
        return this._rowsToObjects(stmt);
    }

    normalizeSlug(text) {
        if (!text) return '';
        return String(text)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/\s+/g, '-')           // Spaces to hyphens
            .replace(/[^\w-]/g, '')          // Remove non-word chars
            .replace(/-+/g, '-')            // Multiple hyphens to one
            .replace(/^-|-$/g, '');          // Trim leading/trailing hyphens
    }

    async createCategory(category) {
        const nombre = String(category.nombre || '').trim();
        let slug;
        if (category.slug && category.slug.trim()) {
            slug = category.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        } else {
            slug = this.normalizeSlug(nombre);
        }
        this.db.run('INSERT INTO categories (nombre, slug, imagen, activo, orden, hero_imagen, hero_titulo, hero_subtitulo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            nombre, 
            slug, 
            String(category.imagen || ''), 
            category.activo ? 1 : 0, 
            parseInt(category.orden, 10) || 0,
            String(category.hero_imagen || ''),
            String(category.hero_titulo || ''),
            String(category.hero_subtitulo || '')
        ]);
        const lastId = this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        await this.save();
        return { id: lastId, ...category, slug };
    }

    async updateCategory(id, category) {
        const nombre = String(category.nombre || '').trim();
        let slug;
        if (category.slug && category.slug.trim()) {
            slug = category.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        } else {
            slug = this.normalizeSlug(nombre);
        }
        this.db.run('UPDATE categories SET nombre=?, slug=?, imagen=?, activo=?, orden=?, hero_imagen=?, hero_titulo=?, hero_subtitulo=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [
            nombre, 
            slug, 
            String(category.imagen || ''), 
            category.activo ? 1 : 0, 
            parseInt(category.orden, 10) || 0,
            String(category.hero_imagen || ''),
            String(category.hero_titulo || ''),
            String(category.hero_subtitulo || ''),
            parseInt(id, 10)
        ]);
        await this.save();
        return { id, ...category, slug };
    }

    async deleteCategory(id) {
        this.db.run('DELETE FROM categories WHERE id = ?', [parseInt(id, 10)]);
        await this.save();
        return { changes: 1 };
    }

    // MARCAS
    getAllBrands() {
        const stmt = this.db.prepare('SELECT * FROM brands ORDER BY orden, id');
        return this._rowsToObjects(stmt);
    }

    async createBrand(brand) {
        this.db.run('INSERT INTO brands (nombre, logo_url, activo, orden) VALUES (?, ?, ?, ?)', [
            String(brand.nombre), String(brand.logo_url || ''), brand.activo ? 1 : 0, parseInt(brand.orden, 10) || 0
        ]);
        const lastId = this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        await this.save();
        return { id: lastId, ...brand };
    }

    async updateBrand(id, brand) {
        this.db.run('UPDATE brands SET nombre=?, logo_url=?, activo=?, orden=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [
            String(brand.nombre), String(brand.logo_url || ''), brand.activo ? 1 : 0, parseInt(brand.orden, 10) || 0, parseInt(id, 10)
        ]);
        await this.save();
        return { id, ...brand };
    }

    async deleteBrand(id) {
        this.db.run('DELETE FROM brands WHERE id = ?', [parseInt(id, 10)]);
        await this.save();
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

    async createPromotion(promotion) {
        this.db.run(`INSERT INTO promotions (titulo, descripcion, imagen, video_url, activo, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            String(promotion.titulo), String(promotion.descripcion || ''), String(promotion.imagen || ''), String(promotion.video_url || ''), 
            promotion.activo ? 1 : 0, promotion.fecha_inicio ? String(promotion.fecha_inicio) : null, promotion.fecha_fin ? String(promotion.fecha_fin) : null
        ]);
        const lastId = this.db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        await this.save();
        return { id: lastId, ...promotion };
    }

    async updatePromotion(id, promotion) {
        this.db.run(`UPDATE promotions SET titulo=?, descripcion=?, imagen=?, video_url=?, activo=?, fecha_inicio=?, fecha_fin=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [
            String(promotion.titulo), String(promotion.descripcion || ''), String(promotion.imagen || ''), String(promotion.video_url || ''),
            promotion.activo ? 1 : 0, promotion.fecha_inicio ? String(promotion.fecha_inicio) : null, promotion.fecha_fin ? String(promotion.fecha_fin) : null, parseInt(id, 10)
        ]);
        await this.save();
        return { id, ...promotion };
    }

    async deletePromotion(id) {
        this.db.run('DELETE FROM promotions WHERE id = ?', [parseInt(id, 10)]);
        await this.save();
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

    async savePage(page) {
        const existing = this.getPageBySlug(page.page_slug);
        const slug = String(page.page_slug);
        if (existing) {
            this.db.run(`UPDATE page_content SET title=?, descripcion=?, content=?, section1_title=?, section1_content=?, section2_title=?, section2_content=?, activo=?, updated_at=CURRENT_TIMESTAMP WHERE page_slug=?`, [
                String(page.title || ''), String(page.descripcion || ''), String(page.content || ''), 
                String(page.section1_title || ''), String(page.section1_content || ''),
                String(page.section2_title || ''), String(page.section2_content || ''),
                page.activo ? 1 : 0, slug
            ]);
        } else {
            this.db.run('INSERT INTO page_content (page_slug, title, descripcion, content, section1_title, section1_content, section2_title, section2_content, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                slug, String(page.title || ''), String(page.descripcion || ''), String(page.content || ''),
                String(page.section1_title || ''), String(page.section1_content || ''),
                String(page.section2_title || ''), String(page.section2_content || ''),
                page.activo ? 1 : 0
            ]);
        }
        await this.save();
        return page;
    }

    // CONFIGURACIÓN
    getSettings() {
        const stmt = this.db.prepare('SELECT * FROM site_settings WHERE id = 1');
        const results = this._rowsToObjects(stmt);
        return results[0] || {};
    }

    async updateSettings(settings) {
        this.db.run(`UPDATE site_settings SET nombre_tienda=?, whatsapp=?, telefono=?, email=?, direccion=?, logo_url=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`, [
            String(settings.nombre_tienda || ''), String(settings.whatsapp || ''), String(settings.telefono || ''), String(settings.email || ''), String(settings.direccion || ''), String(settings.logo_url || '')
        ]);
        await this.save();
        return settings;
    }

    async close() {
        if (this.db) { await this.save(); this.db.close(); }
    }
}

module.exports = DKDatabase;
