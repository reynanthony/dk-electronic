let datos = null;
let PASS = localStorage.getItem('dk_admin_pass') || 'dkadmin2024';
let isAdmin = false;

const defaultPromoSettings = {
    promo: {
        titulo: '¡Ofertas Especiales!',
        imagen: '',
        video: 'https://www.youtube.com/watch?v=UGR7V_sm0cY',
        activo: true
    },
    brands: [
        { nombre: 'Samsung', url: 'imagenes/samsung.png', activo: true },
        { nombre: 'LG', url: 'imagenes/lg.png', activo: true },
        { nombre: 'Sony', url: 'imagenes/sony.png', activo: true },
        { nombre: 'Midea', url: 'imagenes/midea.png', activo: true },
        { nombre: 'Whirlpool', url: 'imagenes/whirlpool.png', activo: true }
    ]
};

function getPromoSettings() {
    const stored = localStorage.getItem('dk_promo');
    if (!stored) return defaultPromoSettings;
    try {
        const parsed = JSON.parse(stored);
        if (!parsed.brands || parsed.brands.length === 0) {
            return defaultPromoSettings;
        }
        if (!parsed.promo || (!parsed.promo.video && !parsed.promo.imagen)) {
            return defaultPromoSettings;
        }
        return parsed;
    } catch {
        return defaultPromoSettings;
    }
}

let promoSettings = getPromoSettings();

let garantiaSettings = JSON.parse(localStorage.getItem('dk_garantia')) || {
    cobertura: {
        televisores: '2 años',
        aires: '2 años',
        electrodomesticos: '1 año'
    },
    cubre: [
        'Defectos de fábrica en componentes eléctricos y electrónicos',
        'Problemas de funcionamiento que no sean por mal uso',
        'Repuestos y mano de obra sin costo',
        'Servicio técnico a domicilio (según ubicación)'
    ],
    noCubre: [
        'Daños por uso inadecuado o accidentes',
        'Daños por picos de tensión o fallas eléctricas',
        'Productos sin factura o comprobante de compra',
        'Desgaste natural por uso'
    ]
};

async function init() {
    const stored = localStorage.getItem('dk_productos');
    const garantiaStored = localStorage.getItem('dk_garantia');
    if (garantiaStored) {
        garantiaSettings = JSON.parse(garantiaStored);
    }
    promoSettings = getPromoSettings();
    
    try {
        datos = stored ? JSON.parse(stored) : await (await fetch('productos.json')).json();
        if (!stored) localStorage.setItem('dk_productos', JSON.stringify(datos));
        
        if (typeof CATEGORIA !== 'undefined') {
            if (CATEGORIA === 'garantia') {
                renderGarantia();
            } else {
                const filtered = datos.productos.filter(p => p.categoria === CATEGORIA);
                render(filtered);
            }
        } else {
            render(datos.productos);
            categories();
            renderPromo();
            renderBrands();
        }
        
        if (isAdmin) {
            panelAdmin();
            if (typeof CATEGORIA !== 'undefined' && CATEGORIA === 'garantia') {
                showGarantiaSettingsPanel();
            }
        }
    } catch(e) { 
        document.getElementById('productos').innerHTML = '<p class="col-span-full text-center py-10">Error al cargar</p>'; 
    }
}

function renderPromo() {
    const container = document.getElementById('promo-container');
    if (!container) return;
    
    if (!promoSettings.promo.activo) {
        container.innerHTML = '';
        return;
    }
    
    const { titulo, imagen, video } = promoSettings.promo;
    
    if (!imagen && !video) {
        container.innerHTML = '';
        return;
    }
    
    let content = '';
    
    if (video) {
        const videoId = video.includes('youtube.com') ? video.split('v=')[1]?.split('&')[0] : video.split('/').pop();
        
        content = `
            <div style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 1rem; overflow: hidden; background: #000;">
                <iframe 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0&showinfo=0&playsinline=1&modestbranding=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
        `;
    } else if (imagen) {
        content = `
            <div class="relative rounded-2xl overflow-hidden shadow-lg">
                <img src="${imagen}" alt="Promoción" class="w-full object-cover max-h-80">
            </div>
        `;
    }
    
    if (titulo) {
        content = `
            <div class="mb-6">
                <h2 class="text-3xl md:text-4xl font-bold">${titulo}</h2>
            </div>
            ${content}
        `;
    }
    
    container.innerHTML = content;
}

function renderBrands() {
    const container = document.getElementById('brands-container');
    if (!container) return;
    
    let brands = promoSettings && promoSettings.brands && promoSettings.brands.length > 0 
        ? promoSettings.brands 
        : defaultPromoSettings.brands;
    
    const activeBrands = brands.filter(b => b && b.activo !== false);
    
    if (activeBrands.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-sm py-4">No hay marcas activas</p>';
        return;
    }
    
    const brandItem = (brand) => {
        return `
            <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 40px; min-width: 140px;">
                <img src="${brand.url}" alt="${brand.nombre}" style="height: 50px; object-fit: contain; filter: grayscale(100%); transition: filter 0.3s;" 
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" 
                    onload="this.nextElementSibling.style.display='none'">
                <span style="font-size: 16px; font-weight: 700; color: #c2410c; margin-top: 8px; display: none; text-transform: uppercase; letter-spacing: 1px;">${brand.nombre}</span>
            </div>
        `;
    };
    
    const brandsHTML = activeBrands.map(brandItem).join('');
    const brandsDuplicated = brandsHTML + brandsHTML;
    
    container.innerHTML = `
        <div style="overflow: hidden; width: 100%;">
            <div id="marquee-content" style="white-space: nowrap; animation: scroll-marquee 20s linear infinite; display: inline-block;">
                ${brandsDuplicated}
            </div>
        </div>
        <style>
            @keyframes scroll-marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            #marquee-content:hover {
                animation-play-state: paused;
            }
        </style>
    `;
}

function renderGarantia() {
    const productosConGarantia = datos.productos.filter(p => p.garantia);
    render(productosConGarantia);
    renderGarantiaInfo();
}

function renderGarantiaInfo() {
    const container = document.getElementById('garantiaInfo');
    if (!container) return;
    
    container.innerHTML = `
        <div class="grid md:grid-cols-3 gap-6 mb-12">
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <h3 class="font-bold text-lg mb-2">${garantiaSettings.cobertura.televisores} de Garantía</h3>
                <p class="text-sm text-muted">Todos nuestros Televisores incluyen garantía total.</p>
            </div>
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                </div>
                <h3 class="font-bold text-lg mb-2">${garantiaSettings.cobertura.aires} de Garantía</h3>
                <p class="text-sm text-muted">Aires Acondicionados con garantía total.</p>
            </div>
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                </div>
                <h3 class="font-bold text-lg mb-2">${garantiaSettings.cobertura.electrodomesticos} de Garantía</h3>
                <p class="text-sm text-muted">Electrodomésticos con garantía especializada.</p>
            </div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
            <h3 class="font-bold text-lg mb-4">¿Qué cubre la garantía?</h3>
            <ul class="space-y-3 text-sm text-muted">
                ${garantiaSettings.cubre.map(item => `
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>${item}</span>
                    </li>
                `).join('')}
            </ul>
            
            <h3 class="font-bold text-lg mb-4 mt-6">¿Qué NO cubre la garantía?</h3>
            <ul class="space-y-3 text-sm text-muted">
                ${garantiaSettings.noCubre.map(item => `
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        <span>${item}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function showGarantiaSettings() {
    if (document.getElementById('garantiaSettings')) return;
    
    const s = document.createElement('div');
    s.id = 'garantiaSettings';
    s.className = 'fixed bottom-4 left-4 z-50 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl w-80';
    s.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-sm text-primary">Configurar Garantía</span>
            <button onclick="document.getElementById('garantiaSettings').remove()" class="text-slate-400 hover:text-dark">✕</button>
        </div>
        <div class="space-y-3">
            <div>
                <label class="text-xs font-medium text-slate-600">Televisores</label>
                <input type="text" id="g-tv" value="${garantiaSettings.cobertura.televisores}" class="w-full border border-slate-200 rounded px-2 py-1 text-sm">
            </div>
            <div>
                <label class="text-xs font-medium text-slate-600">Aires</label>
                <input type="text" id="g-aires" value="${garantiaSettings.cobertura.aires}" class="w-full border border-slate-200 rounded px-2 py-1 text-sm">
            </div>
            <div>
                <label class="text-xs font-medium text-slate-600">Electrodomésticos</label>
                <input type="text" id="g-electro" value="${garantiaSettings.cobertura.electrodomesticos}" class="w-full border border-slate-200 rounded px-2 py-1 text-sm">
            </div>
            <div>
                <label class="text-xs font-medium text-slate-600">Cubre (uno por línea)</label>
                <textarea id="g-cubre" rows="3" class="w-full border border-slate-200 rounded px-2 py-1 text-xs">${garantiaSettings.cubre.join('\n')}</textarea>
            </div>
            <div>
                <label class="text-xs font-medium text-slate-600">No cubre (uno por línea)</label>
                <textarea id="g-no-cubre" rows="3" class="w-full border border-slate-200 rounded px-2 py-1 text-xs">${garantiaSettings.noCubre.join('\n')}</textarea>
            </div>
            <button onclick="saveGarantiaSettings()" class="w-full bg-primary text-white py-2 rounded text-sm font-medium">Guardar</button>
        </div>
    `;
    document.body.appendChild(s);
}

function saveGarantiaSettings() {
    garantiaSettings = {
        cobertura: {
            televisores: document.getElementById('g-tv').value,
            aires: document.getElementById('g-aires').value,
            electrodomesticos: document.getElementById('g-electro').value
        },
        cubre: document.getElementById('g-cubre').value.split('\n').filter(x => x.trim()),
        noCubre: document.getElementById('g-no-cubre').value.split('\n').filter(x => x.trim())
    };
    
    localStorage.setItem('dk_garantia', JSON.stringify(garantiaSettings));
    renderGarantiaInfo();
    alert('Configuración de garantía guardada');
}

function render(list) {
    if (!list || list.length === 0) {
        document.getElementById('productos').innerHTML = '<p class="col-span-full text-center py-10 text-muted">No hay productos en esta categoría</p>';
        return;
    }
    
    let html = '';
    const wsNum = datos?.tienda?.whatsapp || '18293686994';
    list.forEach(p => {
        const price = p.precio.toLocaleString();
        const wsLink = `https://wa.me/${wsNum}?text=${encodeURIComponent(`Hola! Estoy interesado en: ${p.nombre}\nPrecio: RD$ ${price}\n\n${p.descripcion}`)}`;
        const badge = p.destacado ? '<div class="absolute top-3 right-3 bg-primary text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">Hot</div>' : '';
        const garantiaBadge = p.garantia ? `<div class="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>${p.garantiaAnios || 1} año${(p.garantiaAnios || 1) > 1 ? 's' : ''} garantía</div>` : '';
        const garantiaInfo = p.garantia ? `<div class="text-xs text-green-600 mt-1 line-clamp-1">${p.garantiaCond || 'Garantía incluida'}</div>` : '';
        const adminBtns = isAdmin ? `<div class="flex gap-2 mt-2"><button onclick="editProd(${p.id})" class="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-1.5 rounded text-xs font-medium">Editar</button><button onclick="delProd(${p.id})" class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-1.5 rounded text-xs font-medium">Eliminar</button></div>` : '';
        
        html += `
        <div class="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300">
            ${badge}
            <div class="aspect-square relative overflow-hidden bg-slate-100">
                <img src="${p.imagen}" alt="${p.nombre}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1557821552-17105176677c?w=400'">
            </div>
            <div class="p-4 flex flex-col flex-1">
                <span class="text-xs text-primary uppercase tracking-wide">${p.categoria}</span>
                <h3 class="font-bold text-sm text-dark mt-1 line-clamp-1">${p.nombre}</h3>
                <p class="text-xs text-muted mt-1 line-clamp-2 flex-1">${p.descripcion}</p>
                ${garantiaBadge}
                ${garantiaInfo}
                <p class="text-lg font-black text-primary mt-2">RD$ ${price}</p>
                <a href="${wsLink}" target="_blank" class="mt-3 w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/20 text-sm">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Comprar
                </a>
                ${adminBtns}
            </div>
        </div>`;
    });
    document.getElementById('productos').innerHTML = html;
}

function categories() {
    const cats = ['todos', ...new Set(datos.productos.map(p => p.categoria))];
    let html = '';
    cats.forEach((c, i) => {
        const active = i === 0 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600 hover:text-dark';
        html += `<button onclick="filterCat('${c}')" class="filtro-btn px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${active}">${c === 'todos' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}</button>`;
    });
    const filtrosContainer = document.getElementById('filtros');
    if (filtrosContainer) filtrosContainer.innerHTML = html;
}

function filterCat(cat) {
    document.querySelectorAll('.filtro-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white');
        b.classList.add('bg-slate-200', 'text-slate-600');
    });
    event.target.classList.remove('bg-slate-200', 'text-slate-600');
    event.target.classList.add('bg-primary', 'text-white');
    
    const result = cat === 'todos' ? datos.productos : datos.productos.filter(p => p.categoria === cat);
    render(result);
}

function adminLogin() {
    const existing = document.querySelector('.admin-login-modal');
    if (existing) existing.remove();
    
    const m = document.createElement('div');
    m.className = 'admin-login-modal fixed inset-0 z-[60] flex items-center justify-center p-4';
    m.innerHTML = `
        <div class="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onclick="closeModal()"></div>
        <div class="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-primary to-orange-500"></div>
            <div class="p-8 text-center">
                <div class="w-20 h-20 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 mb-1">DK Electronic</h2>
                <p class="text-slate-500 text-sm mb-6">Acceso administrativo</p>
                <form id="loginForm" class="space-y-4">
                    <div>
                        <input type="password" id="adminPass" required class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" placeholder="••••••••" autocomplete="off">
                        <p id="loginError" class="text-red-500 text-xs mt-2 hidden">Contraseña incorrecta</p>
                    </div>
                    <button type="submit" class="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Ingresar</button>
                </form>
                <div class="mt-6 pt-6 border-t border-slate-100">
                    <p class="text-xs text-slate-400">Presiona <kbd class="bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">Esc</kbd> para cerrar</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(m);
    document.getElementById('adminPass').focus();
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
    
    document.getElementById('loginForm').onsubmit = e => {
        e.preventDefault();
        const pwd = document.getElementById('adminPass').value;
        if (pwd === PASS) {
            isAdmin = true;
            localStorage.setItem('dk_admin', 'true');
            closeModal();
            init();
        } else {
            document.getElementById('adminPass').classList.add('border-red-400', 'bg-red-50');
            document.getElementById('adminPass').value = '';
            document.getElementById('loginError').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('adminPass').classList.remove('border-red-400', 'bg-red-50');
            }, 500);
        }
    };
}

function logoutAdmin() {
    document.getElementById('panel')?.remove();
    isAdmin = false;
    localStorage.removeItem('dk_admin');
    init();
}

function closePanel() {
    document.getElementById('panel')?.remove();
}

function changePassword() {
    const m = document.createElement('div');
    m.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4';
    m.innerHTML = `
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="closeModal()"></div>
        <div class="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div class="p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-dark">Cambiar Contraseña</h3>
                        <p class="text-xs text-slate-500">Actualiza tu clave de acceso</p>
                    </div>
                </div>
                <form id="changePassForm" class="space-y-3">
                    <div>
                        <label class="block text-xs font-medium text-slate-600 mb-1">Contraseña Actual</label>
                        <input type="password" id="oldPass" required class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-600 mb-1">Nueva Contraseña</label>
                        <input type="password" id="newPass" required class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-600 mb-1">Confirmar Nueva</label>
                        <input type="password" id="confirmPass" required class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="submit" class="flex-1 bg-primary hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
                        <button type="button" onclick="closeModal()" class="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    document.getElementById('changePassForm').onsubmit = e => {
        e.preventDefault();
        const oldP = document.getElementById('oldPass').value;
        const newP = document.getElementById('newPass').value;
        const confP = document.getElementById('confirmPass').value;
        
        if (oldP !== PASS) {
            alert('La contraseña actual es incorrecta');
            return;
        }
        if (newP !== confP) {
            alert('Las contraseñas nuevas no coinciden');
            return;
        }
        if (newP.length < 4) {
            alert('La contraseña debe tener al menos 4 caracteres');
            return;
        }
        
        localStorage.setItem('dk_admin_pass', newP);
        alert('Contraseña actualizada. Usa Ctrl+K para acceder con la nueva clave.');
        closeModal();
    };
}

function showPromoSettings() {
    const m = document.createElement('div');
    m.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4';
    m.innerHTML = `
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="closeModal()"></div>
        <div class="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-pink-600 to-rose-500 px-6 py-4 sticky top-0">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-white">Promociones y Banner</h3>
                            <p class="text-xs text-white/80">Configura ofertas y marcas</p>
                        </div>
                    </div>
                    <button onclick="closeModal()" class="text-white/80 hover:text-white">✕</button>
                </div>
            </div>
            <div class="p-6 space-y-4">
                <div class="bg-pink-50 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="font-medium text-dark">Espacio Publicitario</h4>
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="p-activo" class="rounded border-pink-300 text-pink-600" ${promoSettings.promo.activo ? 'checked' : ''}>
                            <span class="text-slate-600">Activo</span>
                        </label>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-medium text-slate-600 mb-1">Título (opcional)</label>
                            <input type="text" id="p-titulo" value="${promoSettings.promo.titulo || ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="¡Ofertas Especiales!">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-slate-600 mb-1">URL de Imagen</label>
                            <input type="url" id="p-img" value="${promoSettings.promo.imagen || ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="https://...">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-slate-600 mb-1">URL de Video (YouTube)</label>
                            <input type="url" id="p-video" value="${promoSettings.promo.video || ''}" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="https://youtube.com/watch?v=...">
                        </div>
                    </div>
                </div>
                
                <div class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-medium text-dark mb-3">Banner de Marcas</h4>
                    <p class="text-xs text-slate-500 mb-3">Activa las marcas que quieres mostrar en el banner</p>
                    <div id="brandsList" class="space-y-2 max-h-48 overflow-y-auto"></div>
                    <button onclick="addNewBrand()" class="mt-3 text-xs text-primary hover:underline">+ Agregar marca</button>
                </div>
                
                <div class="flex gap-3 pt-2">
                    <button onclick="savePromoSettings()" class="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-lg font-semibold transition-colors">Guardar</button>
                    <button onclick="closeModal()" class="px-5 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    
    // Populate brands list
    const brandsList = document.getElementById('brandsList');
    promoSettings.brands.forEach(brand => {
        const item = document.createElement('div');
        item.className = 'brand-item flex items-center gap-2 p-2 bg-white rounded border';
        item.innerHTML = `
            <input type="checkbox" class="brand-active" ${brand.activo !== false ? 'checked' : ''}>
            <input type="text" class="brand-name flex-1 text-xs border rounded px-2 py-1" placeholder="Nombre" value="${brand.nombre || ''}">
            <input type="url" class="brand-url flex-[2] text-xs border rounded px-2 py-1" placeholder="URL del logo" value="${brand.url || ''}">
            <button onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700">✕</button>
        `;
        brandsList.appendChild(item);
    });
}

function savePromoSettings() {
    const brandsInputs = document.querySelectorAll('#brandsList .brand-item');
    const brands = Array.from(brandsInputs).map(item => ({
        nombre: item.querySelector('.brand-name').value,
        url: item.querySelector('.brand-url').value,
        activo: item.querySelector('.brand-active').checked
    }));
    
    promoSettings = {
        promo: {
            titulo: document.getElementById('p-titulo').value,
            imagen: document.getElementById('p-img').value,
            video: document.getElementById('p-video').value,
            activo: document.getElementById('p-activo').checked
        },
        brands: brands
    };
    
    localStorage.setItem('dk_promo', JSON.stringify(promoSettings));
    closeModal();
    alert('Promociones guardadas');
    location.reload();
}

function resetPromoToDefaults() {
    if (confirm('¿Restablecer las marcas a los valores predeterminados?')) {
        localStorage.removeItem('dk_promo');
        promoSettings = getPromoSettings();
        renderBrands();
        alert('Marcas restablecidas');
    }
}

function addNewBrand() {
    const list = document.getElementById('brandsList');
    const item = document.createElement('div');
    item.className = 'brand-item flex items-center gap-2 p-2 bg-white rounded border';
    item.innerHTML = `
        <input type="checkbox" class="brand-active" checked>
        <input type="text" class="brand-name flex-1 text-xs border rounded px-2 py-1" placeholder="Nombre">
        <input type="url" class="brand-url flex-[2] text-xs border rounded px-2 py-1" placeholder="URL del logo">
        <button onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700">✕</button>
    `;
    list.appendChild(item);
}

function showContacto() {
    const m = document.createElement('div');
    m.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    m.innerHTML = `
        <div class="absolute inset-0 bg-black/50" onclick="closeModal()"></div>
        <div class="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6">
            <button onclick="closeModal()" class="absolute right-3 top-3 text-slate-400 hover:text-dark text-xl">×</button>
            <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-dark">Contáctanos</h3>
                    <p class="text-sm text-slate-500">Estamos para ayudarte</p>
                </div>
            </div>
            <form id="contactForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                    <input type="text" id="c-nombre" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" placeholder="Tu nombre">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" id="c-email" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" placeholder="tu@email.com">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                    <input type="tel" id="c-telefono" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" placeholder="+1 (829) 000-0000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
                    <textarea id="c-mensaje" required rows="3" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" placeholder="¿En qué podemos ayudarte?"></textarea>
                </div>
                <button type="submit" class="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-lg font-semibold transition-colors">Enviar Mensaje</button>
            </form>
        </div>
    `;
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    
    const wsNum = datos?.tienda?.whatsapp || '18293686994';
    
    document.getElementById('contactForm').onsubmit = e => {
        e.preventDefault();
        const nombre = document.getElementById('c-nombre').value;
        const email = document.getElementById('c-email').value;
        const telefono = document.getElementById('c-telefono').value;
        const mensaje = document.getElementById('c-mensaje').value;
        
        const wsText = encodeURIComponent(`*Nuevo mensaje de contacto*\n\n*Nombre:* ${nombre}\n*Email:* ${email}\n*Teléfono:* ${telefono}\n*Mensaje:* ${mensaje}`);
        const wsUrl = `https://wa.me/${wsNum}?text=${wsText}`;
        
        window.open(wsUrl, '_blank');
        closeModal();
    };
}

function showEnvios() {
    const m = document.createElement('div');
    m.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    m.id = 'enviosModal';
    m.innerHTML = `
        <div class="absolute inset-0 bg-black/50" onclick="closeModal()"></div>
        <div class="relative bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button onclick="closeModal()" class="absolute right-3 top-3 text-slate-400 hover:text-dark text-xl">×</button>
            <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-dark">Envíos a Domicilio</h3>
                    <p class="text-sm text-slate-500">Selecciona tu ubicación en el mapa</p>
                </div>
            </div>
            <div class="space-y-4">
                <div class="bg-slate-50 rounded-lg p-4">
                    <p class="text-sm text-slate-600 mb-3"><strong>Instrucciones:</strong> El mapa muestra la ubicación. Escribe tu dirección exacta manualmente para el envío.</p>
                    <div class="w-full h-64 rounded-lg overflow-hidden border border-slate-300">
                        <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-70.1%2C18.35%2C-69.7%2C18.6&amp;layer=mapnik" style="width:100%;height:100%;border:0;"></iframe>
                    </div>
                </div>
                <form id="envioForm" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                            <input type="text" id="e-nombre" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" placeholder="Tu nombre">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                            <input type="tel" id="e-telefono" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" placeholder="+1 (829) 000-0000">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Dirección Exacta</label>
                        <textarea id="e-direccion" required rows="2" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" placeholder="Calle, número, barrio, referencias..."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Producto(s) de Interés</label>
                        <textarea id="e-productos" rows="2" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" placeholder="Menciona los productos que quieres comprar..."></textarea>
                    </div>
                    <input type="hidden" id="e-lat" value="">
                    <input type="hidden" id="e-lng" value="">
                    <button type="submit" class="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        Solicitar Envío por WhatsApp
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    
    window.currentWsNumber = datos?.tienda?.whatsapp || '18293686994';
    
    document.getElementById('envioForm').onsubmit = e => {
        e.preventDefault();
        const nombre = document.getElementById('e-nombre').value;
        const telefono = document.getElementById('e-telefono').value;
        const direccion = document.getElementById('e-direccion').value;
        const productos = document.getElementById('e-productos').value;
        const lat = document.getElementById('e-lat').value;
        const lng = document.getElementById('e-lng').value;
        
        let coords = '';
        if (lat && lng) {
            coords = `\n*Coords:* ${lat}, ${lng}`;
        }
        
        const wsText = encodeURIComponent(`*Solicitud de Envío*\n\n*Nombre:* ${nombre}\n*Teléfono:* ${telefono}\n*Dirección:* ${direccion}${coords}\n*Productos:* ${productos || 'No especificados'}`);
        const wsUrl = `https://wa.me/${window.currentWsNumber}?text=${wsText}`;
        
        window.open(wsUrl, '_blank');
    };
}

function togglePanel() {
    const panel = document.getElementById('panel');
    const content = document.getElementById('panelContent');
    if (content.style.display === 'none') {
        content.style.display = 'block';
        panel.querySelector('.bg-gradient-to-r').nextElementSibling.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
}

function showForm(producto = null) {
    const edit = producto !== null;
    const m = document.createElement('div');
    m.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    m.innerHTML = `
        <div class="absolute inset-0 bg-black/50" onclick="closeModal()"></div>
        <div class="relative bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6">
            <button onclick="closeModal()" class="absolute right-3 top-3 text-slate-400 hover:text-dark">✕</button>
            <h3 class="text-lg font-bold mb-4">${edit ? 'Editar' : 'Agregar'} Producto</h3>
            <form id="prodForm" class="space-y-4">
                <input type="text" id="p-nombre" placeholder="Nombre del producto" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-dark">
                <textarea id="p-desc" placeholder="Descripción" required rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-dark"></textarea>
                <div class="flex gap-3">
                    <input type="number" id="p-precio" placeholder="Precio" required class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-dark">
                    <select id="p-cat" class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-dark">
                        <option value="televisores">Televisores</option>
                        <option value="aires">Aires</option>
                        <option value="electrodomesticos">Electrodomésticos</option>
                    </select>
                </div>
                <input type="url" id="p-img" placeholder="URL de imagen" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-dark">
                
                <div class="bg-slate-50 rounded-lg p-4 space-y-3">
                    <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input type="checkbox" id="p-garantia" class="rounded border-slate-300 bg-white text-primary" onchange="toggleGarantiaFields()">
                        Producto con Garantía
                    </label>
                    <div id="garantiaFields" class="hidden space-y-2">
                        <select id="p-garantia-anios" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">
                            <option value="1">1 Año de garantía</option>
                            <option value="2">2 Años de garantía</option>
                            <option value="3">3 Años de garantía</option>
                        </select>
                        <input type="text" id="p-garantia-cond" placeholder="Condiciones de la garantía (ej: defectos de fábrica)" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    </div>
                </div>
                
                <label class="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" id="p-dest" class="rounded border-slate-300 bg-slate-50 text-primary"> Producto destacado
                </label>
                <div class="flex gap-3 pt-2">
                    <button type="submit" class="flex-1 bg-primary hover:bg-primary-light py-2.5 rounded-lg font-semibold text-white">${edit ? 'Guardar' : 'Agregar'}</button>
                    <button type="button" onclick="closeModal()" class="px-5 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:text-dark">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    
    if (edit) {
        document.getElementById('p-nombre').value = producto.nombre;
        document.getElementById('p-desc').value = producto.descripcion;
        document.getElementById('p-precio').value = producto.precio;
        document.getElementById('p-cat').value = producto.categoria;
        document.getElementById('p-img').value = producto.imagen;
        document.getElementById('p-dest').checked = producto.destacado;
        
        if (producto.garantia) {
            document.getElementById('p-garantia').checked = true;
            document.getElementById('garantiaFields').classList.remove('hidden');
            document.getElementById('p-garantia-anios').value = producto.garantiaAnios || 1;
            document.getElementById('p-garantia-cond').value = producto.garantiaCond || '';
        }
    }
    
    document.getElementById('prodForm').onsubmit = e => {
        e.preventDefault();
        saveProduct(edit ? producto.id : null);
    };
}

function toggleGarantiaFields() {
    const checkbox = document.getElementById('p-garantia');
    const fields = document.getElementById('garantiaFields');
    if (checkbox.checked) {
        fields.classList.remove('hidden');
    } else {
        fields.classList.add('hidden');
    }
}

function saveProduct(id) {
    const tieneGarantia = document.getElementById('p-garantia').checked;
    
    const prod = {
        id: id || Math.max(...datos.productos.map(x => x.id), 0) + 1,
        nombre: document.getElementById('p-nombre').value,
        descripcion: document.getElementById('p-desc').value,
        precio: parseInt(document.getElementById('p-precio').value),
        categoria: document.getElementById('p-cat').value,
        imagen: document.getElementById('p-img').value,
        destacado: document.getElementById('p-dest').checked,
        garantia: tieneGarantia,
        garantiaAnios: tieneGarantia ? parseInt(document.getElementById('p-garantia-anios').value) : 0,
        garantiaCond: tieneGarantia ? document.getElementById('p-garantia-cond').value : ''
    };
    
    if (id) {
        const i = datos.productos.findIndex(x => x.id === id);
        if (i !== -1) datos.productos[i] = prod;
    } else {
        datos.productos.push(prod);
    }
    
    localStorage.setItem('dk_productos', JSON.stringify(datos));
    closeModal();
    init();
    alert(id ? 'Producto actualizado' : 'Producto agregado');
}

function editProd(id) {
    const p = datos.productos.find(x => x.id === id);
    if (p) showForm(p);
}

function delProd(id) {
    if (confirm('¿Eliminar este producto?')) {
        datos.productos = datos.productos.filter(x => x.id !== id);
        localStorage.setItem('dk_productos', JSON.stringify(datos));
        init();
    }
}

function exportData() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], {type: 'application/json'}));
    a.download = 'productos.json';
    a.click();
}

function importData() {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = '.json';
    i.onchange = e => {
        const r = new FileReader();
        r.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.productos) {
                    datos = data;
                    localStorage.setItem('dk_productos', JSON.stringify(datos));
                    init();
                    alert('Importado correctamente');
                }
            } catch { alert('Error al importar'); }
        };
        r.readAsText(e.target.files[0]);
    };
    i.click();
}

function closeModal() {
    document.querySelectorAll('.fixed').forEach(x => x.remove());
    document.body.style.overflow = '';
}

function panelAdmin() {
    const existing = document.getElementById('panel');
    if (existing) existing.remove();
    
    const p = document.createElement('div');
    p.id = 'panel';
    p.className = 'fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl w-80 overflow-hidden';
    p.innerHTML = `
        <div class="bg-gradient-to-r from-primary via-orange-500 to-primary px-5 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <span class="font-bold text-white text-lg">Administración</span>
            </div>
            <button onclick="this.closest('#panel').remove()" class="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <div class="p-4 space-y-3">
            <button onclick="showForm()" class="w-full flex items-center gap-3 bg-primary/10 hover:bg-primary/20 text-primary p-3.5 rounded-xl text-sm font-semibold transition-all group">
                <div class="w-9 h-9 bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                </div>
                <span>Agregar Producto</span>
            </button>
            <button onclick="exportData()" class="w-full flex items-center gap-3 bg-amber-50 hover:bg-amber-100 text-amber-700 p-3.5 rounded-xl text-sm font-semibold transition-all group">
                <div class="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                </div>
                <span>Exportar Datos</span>
            </button>
            <button onclick="importData()" class="w-full flex items-center gap-3 bg-blue-50 hover:bg-blue-100 text-blue-700 p-3.5 rounded-xl text-sm font-semibold transition-all group">
                <div class="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </div>
                <span>Importar Datos</span>
            </button>
            <button onclick="showPromoSettings()" class="w-full flex items-center gap-3 bg-pink-50 hover:bg-pink-100 text-pink-700 p-3.5 rounded-xl text-sm font-semibold transition-all group">
                <div class="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                </div>
                <span>Promociones y Marcas</span>
            </button>
            <div class="pt-3 border-t border-slate-100">
                <button onclick="logoutAdmin()" class="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 p-3 rounded-xl text-sm font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(p);
    
    p.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    document.addEventListener('click', function(e) {
        if (!p.contains(e.target)) {
            p.remove();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('dk_admin') === 'true') isAdmin = true;
    init();
    
    window.adminLogin = adminLogin;
    window.editProd = editProd;
    window.delProd = delProd;
    window.showForm = showForm;
    window.filterCat = filterCat;
    window.exportData = exportData;
    window.importData = importData;
    window.closeModal = closeModal;
    window.changePassword = changePassword;
    window.panelAdmin = panelAdmin;
    window.showPromoSettings = showPromoSettings;
    window.savePromoSettings = savePromoSettings;
    window.addNewBrand = addNewBrand;
    window.resetPromoToDefaults = resetPromoToDefaults;
    
    setTimeout(() => {
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                e.stopPropagation();
                document.querySelectorAll('.fixed').forEach(el => el.remove());
                if (isAdmin) {
                    panelAdmin();
                } else {
                    adminLogin();
                }
            }
        });
        
        const logoImg = document.querySelector('img[alt="DK"]');
        if (logoImg) {
            let logoClickCount = 0;
            let logoClickTimer = null;
            logoImg.style.cursor = 'pointer';
            logoImg.addEventListener('click', () => {
                logoClickCount++;
                clearTimeout(logoClickTimer);
                logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1000);
                if (logoClickCount >= 3) {
                    logoClickCount = 0;
                    document.querySelectorAll('.fixed').forEach(el => el.remove());
                    if (isAdmin) panelAdmin();
                    else adminLogin();
                }
            });
        }
        
        if (window.location.search.includes('admin') && !isAdmin) {
            adminLogin();
        }
    }, 200);
});
