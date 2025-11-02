(() => {
    const transactionForm = document.getElementById('transactionForm');
    const descInput = document.getElementById('desc');
    const amountInput = document.getElementById('amount');
    const typeSelect = document.getElementById('type');

    const balanceAmount = document.getElementById('balanceAmount');
    const incomeAmount = document.getElementById('incomeAmount');
    const expenseAmount = document.getElementById('expenseAmount');

    const transactionList = document.getElementById('transactionList');
    const clearAllBtn = document.getElementById('clearAll');

    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');

    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    const STORAGE_KEY = 'expense-tracker-v1';
    const THEME_KEY = 'expense-tracker-theme';

    let transactions = loadTransactions();

  const uid = () => Date.now() + Math.floor(Math.random() * 1000);

    function saveTransactions() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }

    function loadTransactions() {
        try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function formatCurrency(value) {
        const sign = value < 0 ? '-' : '';
        return `${sign}₹${Math.abs(value).toFixed(2)}`;
    }

    function computeTotals(list) {
        let income = 0, expense = 0;
        for (const tx of list) tx.type === 'income' ? income += tx.amount : expense += tx.amount;
        return { income, expense, balance: income - expense };
    }

    function render() {
        const { income, expense, balance } = computeTotals(transactions);
        incomeAmount.textContent = `+${formatCurrency(income)}`;
        expenseAmount.textContent = `-${formatCurrency(expense)}`;
        balanceAmount.textContent = formatCurrency(balance);

        transactionList.innerHTML = '';
        if (!transactions.length) {
        const li = document.createElement('li');
        li.className = 'transaction';
        li.innerHTML = `<div class="tx-left"><div class="tx-desc">No transactions yet</div></div>`;
        transactionList.appendChild(li);
        return;
        }

        const frag = document.createDocumentFragment();
        for (const tx of [...transactions].reverse()) {
        const li = document.createElement('li');
        li.className = 'transaction';

        const left = document.createElement('div'); left.className = 'tx-left';
        const icon = document.createElement('div');
        icon.className = `tx-icon ${tx.type==='income'?'tx-income':'tx-expense'}`;
        icon.innerHTML = tx.type==='income'?'<i class="fa-solid fa-arrow-down-to-line"></i>':'<i class="fa-solid fa-arrow-up-from-line"></i>';

        const meta = document.createElement('div');
        const d = document.createElement('div'); d.className='tx-desc'; d.textContent=tx.desc;
        const t = document.createElement('div'); t.className='tx-time'; t.textContent=new Date(tx.time).toLocaleString();
        meta.appendChild(d); meta.appendChild(t);

        left.appendChild(icon); left.appendChild(meta);

        const right = document.createElement('div'); right.style.display='flex'; right.style.alignItems='center'; right.style.gap='8px';
        const amount = document.createElement('div'); amount.className='tx-amount';
        amount.textContent = `${tx.type==='income'?'+':'-'}${formatCurrency(tx.amount).replace('₹','')}`;
        amount.style.color = tx.type==='income'? 'var(--success)': 'var(--danger)';

        const del = document.createElement('button'); del.className='del'; del.title='Delete transaction'; del.innerHTML='<i class="fa-regular fa-trash-can"></i>';
        del.addEventListener('click',()=>removeTransaction(tx.id));

        right.appendChild(amount); right.appendChild(del);
        li.appendChild(left); li.appendChild(right);
        frag.appendChild(li);
        }
        transactionList.appendChild(frag);
    }

    function addTransaction(desc, amount, type) {
        const tx={id:uid(), desc:desc.trim(), amount:Math.abs(Number(amount)), type, time:Date.now()};
        const { balance } = computeTotals(transactions);
        if(type==='expense' && tx.amount>balance){ showModal(); return false; }
        transactions.push(tx); saveTransactions(); render(); return true;
    }

    function removeTransaction(id){ transactions = transactions.filter(t=>t.id!==id); saveTransactions(); render(); }
    function clearAll(){ if(!transactions.length) return; if(!confirm('Clear all transactions?')) return; transactions=[]; saveTransactions(); render(); }
    function showModal(){ modal.classList.remove('hidden'); }
    function hideModal(){ modal.classList.add('hidden'); }

    const body = document.body;
        
    function loadTheme() {
        try{
        const t = localStorage.getItem(THEME_KEY);
        if(t==='dark'){ body.classList.add('dark-mode'); themeIcon.className='fa-solid fa-sun'; }
        else if(t==='light'){ body.classList.remove('dark-mode'); themeIcon.className='fa-solid fa-moon'; }
        else{
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.toggle('dark-mode', prefersDark);
            themeIcon.className = prefersDark?'fa-solid fa-sun':'fa-solid fa-moon';
        }
        }catch(e){}
    }
        
    function toggleTheme(){ const isDark = body.classList.toggle('dark-mode'); themeIcon.className=isDark?'fa-solid fa-sun':'fa-solid fa-moon'; try{localStorage.setItem(THEME_KEY, isDark?'dark':'light');}catch(e){} }

    transactionForm.addEventListener('submit', e=>{ e.preventDefault(); const desc=descInput.value, rawAmt=amountInput.value; if(!desc||rawAmt===''){alert('Please fill description and amount.'); return;} const amt=Number(rawAmt); if(Number.isNaN(amt)||amt<=0){alert('Amount must be greater than 0.'); return;} const type=typeSelect.value; const ok=addTransaction(desc, Math.abs(amt), type); if(ok){transactionForm.reset(); descInput.focus();} });
    clearAllBtn.addEventListener('click', clearAll);
    modalClose.addEventListener('click', hideModal);
    modal.addEventListener('click', e=>{if(e.target===modal) hideModal();});
    themeToggle.addEventListener('click', toggleTheme);
    document.addEventListener('keydown', e=>{if(e.key==='Escape' && !modal.classList.contains('hidden')) hideModal();});

    loadTheme();
    render();
})();
