const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Productos
    products: {
        getAll: () => ipcRenderer.invoke('products:getAll'),
        getById: (id) => ipcRenderer.invoke('products:getById', id),
        create: (product) => ipcRenderer.invoke('products:create', product),
        update: (id, product) => ipcRenderer.invoke('products:update', id, product),
        delete: (id) => ipcRenderer.invoke('products:delete', id)
    },
    
    // Categorías
    categories: {
        getAll: () => ipcRenderer.invoke('categories:getAll'),
        create: (category) => ipcRenderer.invoke('categories:create', category),
        update: (id, category) => ipcRenderer.invoke('categories:update', id, category),
        delete: (id) => ipcRenderer.invoke('categories:delete', id)
    },
    
    // Marcas
    brands: {
        getAll: () => ipcRenderer.invoke('brands:getAll'),
        create: (brand) => ipcRenderer.invoke('brands:create', brand),
        update: (id, brand) => ipcRenderer.invoke('brands:update', id, brand),
        delete: (id) => ipcRenderer.invoke('brands:delete', id)
    },
    
    // Promociones
    promotions: {
        getAll: () => ipcRenderer.invoke('promotions:getAll'),
        create: (promotion) => ipcRenderer.invoke('promotions:create', promotion),
        update: (id, promotion) => ipcRenderer.invoke('promotions:update', id, promotion),
        delete: (id) => ipcRenderer.invoke('promotions:delete', id)
    },
    
    // Páginas
    pages: {
        getAll: () => ipcRenderer.invoke('pages:getAll'),
        getBySlug: (slug) => ipcRenderer.invoke('pages:getBySlug', slug),
        save: (page) => ipcRenderer.invoke('pages:save', page)
    },
    
    // Configuración
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        update: (settings) => ipcRenderer.invoke('settings:update', settings)
    },
    
    // Exportación
    export: {
        toJson: (outputPath) => ipcRenderer.invoke('export:toJson', outputPath),
        selectFolder: () => ipcRenderer.invoke('export:selectFolder')
    },
    
    // Imágenes
    image: {
        select: () => ipcRenderer.invoke('image:select')
    },

    // Git
    git: {
        status: () => ipcRenderer.invoke('git:status'),
        commitAndPush: (message) => ipcRenderer.invoke('git:commitAndPush', message),
        pull: () => ipcRenderer.invoke('git:pull'),
        exportAndPush: () => ipcRenderer.invoke('git:exportAndPush')
    }
});
