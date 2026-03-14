const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const log = require('electron-log');
const Database = require('./database');
const Exporter = require('./exporter');
const AutoSync = require('./autoSync');

log.transports.file.level = 'info';
log.transports.console.level = 'debug';

let mainWindow;
let db;

// Git inicializado en la raíz del proyecto (donde están los JSON)
const projectRoot = path.resolve(__dirname, '..', '..');
const autoSync = new AutoSync(projectRoot);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: 'DK Electronic - Admin'
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Capturar errores del frontend
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        if (level >= 2) { // 2 = warning, 3 = error
            log.error(`[Renderer Error] ${message} (Línea: ${line}, Source: ${sourceId})`);
        }
    });

    log.info('Aplicación iniciada');
}

async function initializeDatabase() {
    const dbPath = path.join(__dirname, 'database', 'dk-electronic.db');
    db = new Database(dbPath);
    await db.initialize();
    log.info('Base de datos inicializada');
}

// IPC Handlers - Productos
ipcMain.handle('products:getAll', async () => {
    return db.getAllProducts();
});

ipcMain.handle('products:getById', async (event, id) => {
    return db.getProductById(id);
});

ipcMain.handle('products:create', async (event, product) => {
    return db.createProduct(product);
});

ipcMain.handle('products:update', async (event, id, product) => {
    return db.updateProduct(id, product);
});

ipcMain.handle('products:delete', async (event, id) => {
    return db.deleteProduct(id);
});

// IPC Handlers - Categorías
ipcMain.handle('categories:getAll', async () => {
    return db.getAllCategories();
});

ipcMain.handle('categories:create', async (event, category) => {
    return db.createCategory(category);
});

ipcMain.handle('categories:update', async (event, id, category) => {
    return db.updateCategory(id, category);
});

ipcMain.handle('categories:delete', async (event, id) => {
    return db.deleteCategory(id);
});

// IPC Handlers - Marcas
ipcMain.handle('brands:getAll', async () => {
    return db.getAllBrands();
});

ipcMain.handle('brands:create', async (event, brand) => {
    return db.createBrand(brand);
});

ipcMain.handle('brands:update', async (event, id, brand) => {
    return db.updateBrand(id, brand);
});

ipcMain.handle('brands:delete', async (event, id) => {
    return db.deleteBrand(id);
});

// IPC Handlers - Promociones
ipcMain.handle('promotions:getAll', async () => {
    return db.getAllPromotions();
});

ipcMain.handle('promotions:create', async (event, promotion) => {
    return db.createPromotion(promotion);
});

ipcMain.handle('promotions:update', async (event, id, promotion) => {
    return db.updatePromotion(id, promotion);
});

ipcMain.handle('promotions:delete', async (event, id) => {
    return db.deletePromotion(id);
});

// IPC Handlers - Páginas
ipcMain.handle('pages:getAll', async () => {
    return db.getAllPages();
});

ipcMain.handle('pages:getBySlug', async (event, slug) => {
    return db.getPageBySlug(slug);
});

ipcMain.handle('pages:save', async (event, page) => {
    return db.savePage(page);
});

// IPC Handlers - Configuración
ipcMain.handle('settings:get', async () => {
    return db.getSettings();
});

ipcMain.handle('settings:update', async (event, settings) => {
    return db.updateSettings(settings);
});

// IPC Handlers - Exportación
ipcMain.handle('export:toJson', async (event, outputPath) => {
    try {
        const exporter = new Exporter(db, outputPath || path.join(__dirname, '..', 'data'));
        await exporter.exportAll();
        return { success: true, message: 'Exportación completada' };
    } catch (error) {
        log.error('Error en exportación:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('export:selectFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.filePaths[0] || null;
});

// IPC Handlers - Imágenes
const fs = require('fs');

ipcMain.handle('image:select', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
        ],
        defaultPath: path.join(__dirname, '..', '..', 'imagenes')
    });
    
    if (!result.filePaths[0]) return null;
    
    const sourcePath = result.filePaths[0];
    const fileName = path.basename(sourcePath);
    const imagesFolder = path.join(__dirname, '..', '..', 'imagenes');
    const destPath = path.join(imagesFolder, fileName);
    
    if (!fs.existsSync(imagesFolder)) {
        fs.mkdirSync(imagesFolder, { recursive: true });
    }
    
    if (sourcePath !== destPath) {
        fs.copyFileSync(sourcePath, destPath);
    }
    
    return 'imagenes/' + fileName;
});

ipcMain.handle('video:select', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'mov', 'avi'] }
        ],
        defaultPath: path.join(__dirname, '..', '..', 'videos')
    });
    
    if (!result.filePaths[0]) return null;
    
    const sourcePath = result.filePaths[0];
    const fileName = path.basename(sourcePath);
    const videosFolder = path.join(__dirname, '..', '..', 'videos');
    const destPath = path.join(videosFolder, fileName);
    
    if (!fs.existsSync(videosFolder)) {
        fs.mkdirSync(videosFolder, { recursive: true });
    }
    
    if (sourcePath !== destPath) {
        fs.copyFileSync(sourcePath, destPath);
    }
    
    return 'videos/' + fileName;
});

// IPC Handlers - Git
ipcMain.handle('git:status', async () => {
    try {
        const status = await autoSync.git.status();
        return { success: true, status };
    } catch (error) {
        log.error('Git status error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('git:commitAndPush', async (event, message) => {
    return await autoSync.sync();
});

ipcMain.handle('git:pull', async () => {
    return await autoSync.pull();
});

ipcMain.handle('git:exportAndPush', async () => {
    try {
        log.info('=== INICIANDO EXPORTACIÓN Y SINCRONIZACIÓN ===');
        
        // Exportar datos a JSON
        const exporter = new Exporter(db, projectRoot);
        await exporter.exportAll();
        log.info('Datos exportados correctamente');

        // Auto-sync con GitHub
        const result = await autoSync.sync();
        
        if (result.success) {
            return { success: true, message: 'Exportado y sincronizado con GitHub' };
        } else {
            return { success: true, message: result.message };
        }
    } catch (error) {
        log.error('ERROR en sincronización:', error);
        return { success: false, message: 'Error: ' + error.message };
    }
});

app.whenReady().then(async () => {
    await initializeDatabase();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

process.on('uncaughtException', (error) => {
    log.error('Error no controlado:', error);
});

process.on('unhandledRejection', (error) => {
    log.error('Promesa rechazada:', error);
});
