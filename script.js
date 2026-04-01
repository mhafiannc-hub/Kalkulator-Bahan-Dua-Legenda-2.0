const state = {
    tab: 'bahan',
    ingredients: [
        { id: 1, name: 'Biji Kopi Arabica', unit: 'gr', price: 250, initial: 1000 },
        { id: 2, name: 'Susu UHT', unit: 'ml', price: 22, initial: 5000 },
        { id: 3, name: 'Gula Aren', unit: 'ml', price: 45, initial: 1000 }
    ],
    menus: [
        { id: 1, name: 'Es Kopi Susu Legenda', recipe: [
            { ingId: 1, qty: 18 },
            { ingId: 2, qty: 150 },
            { ingId: 3, qty: 30 }
        ]}
    ],
    history: {
        sales: [],
        purchases: [],
        audits: []
    }
};

const app = {
    init() {
        const saved = localStorage.getItem('dua_legenda_db');
        if (saved) Object.assign(state, JSON.parse(saved));
        this.render();
        lucide.createIcons();
    },

    save() {
        localStorage.setItem('dua_legenda_db', JSON.stringify(state));
    },

    setTab(t) {
        state.tab = t;
        this.render();
    },

    render() {
        const container = document.getElementById('content-container');
        if (!container) return;
        
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('tab-active'));
        const activeTab = document.getElementById(`tab-${state.tab}`);
        if (activeTab) activeTab.classList.add('tab-active');

        switch(state.tab) {
            case 'bahan': this.viewBahan(container); break;
            case 'resep': this.viewResep(container); break;
            case 'input': this.viewInput(container); break;
            case 'laporan': this.viewLaporan(container); break;
        }
        lucide.createIcons();
    },

    // --- VIEW: BAHAN BAKU ---
    viewBahan(el) {
        el.innerHTML = `
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-6 border-b flex justify-between items-center bg-slate-50/50">
                    <h3 class="font-bold text-slate-800">Daftar Inventaris</h3>
                    <button onclick="app.modalBahan()" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition">Tambah Bahan</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-400">
                            <tr>
                                <th class="px-8 py-4">Bahan</th>
                                <th class="px-8 py-4">Satuan</th>
                                <th class="px-8 py-4 text-right">Harga</th>
                                <th class="px-8 py-4 text-right">Hapus</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${state.ingredients.map(i => `
                                <tr>
                                    <td class="px-8 py-5 font-bold text-slate-700">${i.name}</td>
                                    <td class="px-8 py-5 uppercase font-bold text-slate-400 text-[10px]">${i.unit}</td>
                                    <td class="px-8 py-5 text-right font-mono text-slate-500">Rp ${i.price.toLocaleString()}</td>
                                    <td class="px-8 py-5 text-right">
                                        <button onclick="app.deleteItem('ingredients', ${i.id})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // --- VIEW: RESEP ---
    viewResep(el) {
        el.innerHTML = `
            <div id="print-area-resep">
                <div class="flex justify-between items-center mb-6 no-print">
                    <h3 class="font-bold text-slate-800">Resep Menu Terdaftar</h3>
                    <div class="flex gap-2">
                        <button onclick="app.exportPDF('print-area-resep', 'Daftar_Resep_Dua_Legenda')" class="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                            <i data-lucide="download" class="w-3 h-3"></i> Simpan PDF
                        </button>
                        <button onclick="app.modalResep()" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Menu Baru</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${state.menus.map(m => `
                        <div class="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative group">
                            <h4 class="text-lg font-black text-indigo-600 mb-4">${m.name}</h4>
                            <div class="space-y-3">
                                ${m.recipe.map(r => {
                                    const ing = state.ingredients.find(i => i.id == r.ingId);
                                    return `
                                        <div class="flex justify-between text-sm border-b border-slate-50 pb-2">
                                            <span class="text-slate-400">${ing ? ing.name : 'Unknown'}</span>
                                            <span class="font-bold text-slate-700">${r.qty} ${ing?.unit || ''}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            <button onclick="app.deleteItem('menus', ${m.id})" class="absolute top-6 right-6 text-slate-200 hover:text-red-500 transition no-print"><i data-lucide="x-circle" class="w-5 h-5"></i></button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // --- VIEW: INPUT ---
    viewInput(el) {
        el.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <div class="flex items-center gap-2 mb-6">
                        <div class="bg-emerald-100 p-2 rounded-lg text-emerald-600"><i data-lucide="shopping-cart" class="w-5 h-5"></i></div>
                        <h3 class="font-bold text-slate-800">Penjualan</h3>
                    </div>
                    <form onsubmit="app.handleEntry(event, 'sales')" class="space-y-4">
                        <select name="id" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm" required>
                            <option value="">Pilih Menu...</option>
                            ${state.menus.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                        </select>
                        <input name="qty" type="number" step="1" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm" placeholder="Jumlah Terjual" required>
                        <button type="submit" class="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition">Catat Jual</button>
                    </form>
                </div>
                
                <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <div class="flex items-center gap-2 mb-6">
                        <div class="bg-blue-100 p-2 rounded-lg text-blue-600"><i data-lucide="package" class="w-5 h-5"></i></div>
                        <h3 class="font-bold text-slate-800">Pembelian</h3>
                    </div>
                    <form onsubmit="app.handleEntry(event, 'purchases')" class="space-y-4">
                        <select name="id" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm" required>
                            <option value="">Pilih Bahan...</option>
                            ${state.ingredients.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
                        </select>
                        <input name="qty" type="number" step="0.01" class="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm" placeholder="Jumlah Beli" required>
                        <button type="submit" class="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition">Catat Beli</button>
                    </form>
                </div>

                <div class="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white">
                    <div class="flex items-center gap-2 mb-6">
                        <div class="bg-indigo-500/20 p-2 rounded-lg text-indigo-400"><i data-lucide="clipboard-check" class="w-5 h-5"></i></div>
                        <h3 class="font-bold">Stok Opname</h3>
                    </div>
                    <form onsubmit="app.handleEntry(event, 'audits')" class="space-y-4">
                        <select name="id" class="w-full bg-white/10 border-none p-4 rounded-2xl text-sm text-white" required>
                            <option value="" class="text-slate-800">Pilih Bahan...</option>
                            ${state.ingredients.map(i => `<option value="${i.id}" class="text-slate-800">${i.name}</option>`).join('')}
                        </select>
                        <input name="qty" type="number" step="0.01" class="w-full bg-white/10 border-none p-4 rounded-2xl text-sm text-white placeholder:text-slate-500" placeholder="Stok Fisik Nyata" required>
                        <button type="submit" class="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-indigo-50 transition">Kunci Stok</button>
                    </form>
                </div>
            </div>

            <div class="mt-10 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div class="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
                    <span class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Log Aktivitas</span>
                    <button onclick="app.clearHistory()" class="text-red-500 text-[10px] font-bold">Hapus Riwayat</button>
                </div>
                <div class="divide-y divide-slate-50 max-h-60 overflow-y-auto">
                    ${this.getLogs().map(l => `
                        <div class="px-6 py-4 flex justify-between items-center text-xs">
                            <div><span class="font-bold text-slate-700">${l.label}</span> <span class="text-slate-300 mx-2">|</span> <span class="text-slate-400 font-mono">${l.date}</span></div>
                            <div class="font-black ${l.color}">${l.qty > 0 ? '+' : ''}${l.qty}</div>
                        </div>
                    `).join('')}
                    ${this.getLogs().length === 0 ? '<div class="p-10 text-center text-slate-400 italic text-xs">Belum ada aktivitas.</div>' : ''}
                </div>
            </div>
        `;
    },

    // --- VIEW: LAPORAN ---
    viewLaporan(el) {
        const report = this.calc();
        el.innerHTML = `
            <div id="print-area-laporan">
                <div class="flex justify-between items-center mb-8 no-print">
                    <div>
                        <h3 class="font-bold text-xl text-slate-800">Rekonsiliasi & Waste</h3>
                        <p class="text-xs text-slate-400">Selisih antara resep vs hitungan tangan.</p>
                    </div>
                    <button onclick="app.exportPDF('print-area-laporan', 'Laporan_Waste_Dua_Legenda')" class="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 flex items-center gap-2">
                        <i data-lucide="file-down" class="w-4 h-4"></i> Simpan Laporan (PDF)
                    </button>
                </div>

                <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th class="px-10 py-6">Bahan Baku</th>
                                <th class="px-10 py-6 text-right">Stok Teori</th>
                                <th class="px-10 py-6 text-right">Stok Fisik</th>
                                <th class="px-10 py-6 text-right">Waste (Selisih)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${report.map(r => {
                                const diff = r.actual - r.theor;
                                const color = diff < 0 ? 'text-red-600 bg-red-50' : (diff > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 bg-slate-50');
                                return `
                                    <tr class="hover:bg-slate-50/50 transition-colors">
                                        <td class="px-10 py-8">
                                            <div class="font-black text-slate-800 text-base">${r.name}</div>
                                            <div class="text-[10px] text-slate-400 font-bold uppercase">${r.unit}</div>
                                        </td>
                                        <td class="px-10 py-8 text-right font-mono text-slate-500">${r.theor.toFixed(1)}</td>
                                        <td class="px-10 py-8 text-right font-mono font-black text-indigo-700 text-lg">${r.actual.toFixed(1)}</td>
                                        <td class="px-10 py-8 text-right">
                                            <span class="px-4 py-2 rounded-2xl font-black font-mono text-sm ${color}">
                                                ${diff > 0 ? '+' : ''}${diff.toFixed(1)}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // --- LOGIC ---
    calc() {
        return state.ingredients.map(ing => {
            const buy = state.history.purchases.filter(p => p.id == ing.id).reduce((a, b) => a + b.qty, 0);
            let sold = 0;
            state.history.sales.forEach(s => {
                const menu = state.menus.find(m => m.id == s.id);
                if (menu) {
                    const component = menu.recipe.find(r => r.ingId == ing.id);
                    if (component) sold += (component.qty * s.qty);
                }
            });
            const theor = ing.initial + buy - sold;
            const lastAudit = state.history.audits.filter(a => a.id == ing.id).slice(-1)[0];
            const actual = lastAudit ? lastAudit.qty : theor;
            return { name: ing.name, unit: ing.unit, theor, actual };
        });
    },

    handleEntry(e, type) {
        e.preventDefault();
        const fd = new FormData(e.target);
        state.history[type].push({
            id: parseInt(fd.get('id')),
            qty: parseFloat(fd.get('qty')),
            date: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
        });
        this.save();
        this.render();
        e.target.reset();
    },

    getLogs() {
        const l = [];
        state.history.sales.forEach(s => l.push({ label: state.menus.find(m => m.id == s.id)?.name, qty: s.qty, date: s.date, color: 'text-emerald-500' }));
        state.history.purchases.forEach(p => l.push({ label: state.ingredients.find(i => i.id == p.id)?.name, qty: p.qty, date: p.date, color: 'text-blue-500' }));
        state.history.audits.forEach(a => l.push({ label: 'Opname: ' + state.ingredients.find(i => i.id == a.id)?.name, qty: a.qty, date: a.date, color: 'text-slate-800' }));
        return l.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    },

    exportPDF(id, name) {
        const el = document.getElementById(id);
        const opt = {
            margin: 10,
            filename: `${name}_${new Date().toLocaleDateString()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(el).save();
    },

    deleteItem(key, id) {
        if(confirm('Hapus data ini, Tuan?')) {
            state[key] = state[key].filter(x => x.id !== id);
            this.save();
            this.render();
        }
    },

    clearHistory() {
        if(confirm('Bersihkan semua riwayat transaksi harian, Tuan Rex?')) {
            state.history = { sales: [], purchases: [], audits: [] };
            this.save();
            this.render();
        }
    },

    // --- MODALS ---
    openModal(html) {
        const back = document.getElementById('modal-backdrop');
        const body = document.getElementById('modal-body');
        body.innerHTML = html;
        back.classList.remove('hidden'); back.classList.add('flex');
        setTimeout(() => { 
            back.classList.replace('opacity-0', 'opacity-100'); 
            body.classList.replace('scale-90', 'scale-100'); 
        }, 10);
    },

    closeModal() {
        const back = document.getElementById('modal-backdrop');
        const body = document.getElementById('modal-body');
        back.classList.replace('opacity-100', 'opacity-0'); 
        body.classList.replace('scale-100', 'scale-90');
        setTimeout(() => { 
            back.classList.replace('flex', 'hidden'); 
        }, 300);
    },

    modalBahan() {
        this.openModal(`
            <h2 class="text-2xl font-black mb-6">Bahan Baku Baru</h2>
            <form onsubmit="app.submitBahan(event)" class="space-y-4">
                <input name="name" class="w-full bg-slate-50 p-4 rounded-2xl border-none outline-indigo-500" placeholder="Nama Bahan (Kopi, Susu, dll)" required>
                <div class="grid grid-cols-2 gap-4">
                    <input name="unit" class="w-full bg-slate-50 p-4 rounded-2xl border-none outline-indigo-500" placeholder="Unit (gr/ml)" required>
                    <input name="price" type="number" class="w-full bg-slate-50 p-4 rounded-2xl border-none outline-indigo-500" placeholder="Harga/Unit" required>
                </div>
                <input name="initial" type="number" class="w-full bg-slate-50 p-4 rounded-2xl border-none outline-indigo-500" placeholder="Stok Awal Saat Ini" required>
                <div class="flex gap-3 pt-6">
                    <button type="button" onclick="app.closeModal()" class="flex-1 font-bold text-slate-400">Batal</button>
                    <button type="submit" class="flex-[2] bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100">Simpan Bahan</button>
                </div>
            </form>
        `);
    },

    submitBahan(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        state.ingredients.push({
            id: Date.now(),
            name: fd.get('name'),
            unit: fd.get('unit'),
            price: parseFloat(fd.get('price')),
            initial: parseFloat(fd.get('initial'))
        });
        this.save(); this.closeModal(); this.render();
    },

    modalResep() {
        this.openModal(`
            <h2 class="text-2xl font-black mb-6">Menu & Formula</h2>
            <form onsubmit="app.submitResep(event)" class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <input name="name" class="w-full bg-slate-100 p-4 rounded-2xl border-none mb-4" placeholder="Nama Menu (Es Kopi Susu)" required>
                <p class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Komposisi Resep</p>
                <div id="recipe-rows" class="space-y-3">
                    <div class="recipe-row flex gap-2">
                        <select class="flex-1 bg-slate-50 p-3 rounded-xl border-none text-sm" required>
                            ${state.ingredients.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
                        </select>
                        <input type="number" step="0.01" class="w-24 bg-slate-50 p-3 rounded-xl border-none text-sm text-center" placeholder="Qty" required>
                    </div>
                </div>
                <button type="button" onclick="app.addRecipeRow()" class="text-xs font-bold text-indigo-600">+ Tambah Bahan</button>
                <div class="flex gap-3 pt-8 border-t mt-6">
                    <button type="button" onclick="app.closeModal()" class="flex-1 font-bold text-slate-400">Batal</button>
                    <button type="submit" class="flex-[2] bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">Simpan Menu</button>
                </div>
            </form>
        `);
    },

    addRecipeRow() {
        const row = document.createElement('div');
        row.className = 'recipe-row flex gap-2 animate-slide-up';
        row.innerHTML = `
            <select class="flex-1 bg-slate-50 p-3 rounded-xl border-none text-sm" required>
                ${state.ingredients.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
            </select>
            <input type="number" step="0.01" class="w-24 bg-slate-50 p-3 rounded-xl border-none text-sm text-center" placeholder="Qty" required>
            <button type="button" onclick="this.parentElement.remove()" class="text-red-400 p-2">✕</button>
        `;
        document.getElementById('recipe-rows').appendChild(row);
    },

    submitResep(e) {
        e.preventDefault();
        const form = e.target;
        const rows = form.querySelectorAll('.recipe-row');
        const recipe = Array.from(rows).map(r => ({
            ingId: parseInt(r.querySelector('select').value),
            qty: parseFloat(r.querySelector('input').value)
        }));
        state.menus.push({ id: Date.now(), name: form.querySelector('[name="name"]').value, recipe });
        this.save(); this.closeModal(); this.render();
    }
};

window.onload = () => app.init();
