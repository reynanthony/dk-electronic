const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const log = require('electron-log');
const Database = require('./src/database');
const Exporter = require('./src/exporter');

log.transports.file.level = 'info';
log.transports.console.level = 'debug';

let mainWindow;
let db;

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
ipcMain.handle('image:select', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
        ]
    });
    return result.filePaths[0] || null;
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
