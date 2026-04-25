// =====================
// ПЕРЕМЕННЫЕ
// =====================
let transactions = [];
let investments = [];
let currency = "₽";

let budgetChart = null;
let investmentChart = null;

const budgetList = document.getElementById('budgetList');
const investmentList = document.getElementById('investmentList');
const totalBalanceElem = document.getElementById('totalBalance');
const currencySelector = document.getElementById('currencySelector');
const themeToggle = document.getElementById('themeToggle');

// Проверка сохранённой темы
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
}

themeToggle.addEventListener('click', () => {

    document.body.classList.toggle('light');

    const currentTheme = document.body.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);

    updateChartsTheme();
});

// =====================
// ВАЛЮТА
// =====================
currencySelector.value = currency;
currencySelector.addEventListener('change', e => {
    currency = e.target.value;
    renderTransactions();
    renderInvestments();
    updateTotalBalance();
});

// =====================
// ТРАНЗАКЦИИ
// =====================
document.getElementById('budgetForm').addEventListener('submit', e => {
    e.preventDefault();
    const desc = document.getElementById('desc').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!desc || isNaN(amount)) return;

    transactions.push({ desc, amount, type });
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';

    renderTransactions();
    updateTotalBalance();
});

function renderTransactions() {
    budgetList.innerHTML = '';
    transactions.forEach((t, i) => {
        const li = document.createElement('li');
        li.classList.add(t.type);
        li.textContent = `${t.desc} - ${t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)} ${currency}`;
        li.style.opacity = 0;
        li.style.transform = 'translateY(-20px)';
        budgetList.appendChild(li);
        setTimeout(() => {
            li.style.opacity = 1;
            li.style.transform = 'translateY(0)';
            li.style.transition = 'all 0.4s ease';
        }, i * 50);
    });
    updateBudgetChart();
}

// =====================
// ИНВЕСТИЦИИ
// =====================
document.getElementById('investmentForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('iname').value.trim();
    const amount = parseFloat(document.getElementById('iamount').value);
    const price = parseFloat(document.getElementById('iprice').value);

    if (!name || isNaN(amount) || isNaN(price)) return;

    investments.push({ name, amount, price });
    document.getElementById('iname').value = '';
    document.getElementById('iamount').value = '';
    document.getElementById('iprice').value = '';

    renderInvestments();
});

function renderInvestments() {
    investmentList.innerHTML = '';
    investments.forEach((i, idx) => {
        const li = document.createElement('li');
        li.classList.add('investment');
        const value = i.amount * i.price;
        li.textContent = `${i.name} - ${i.amount} × ${i.price.toFixed(2)} ${currency} = ${value.toFixed(2)} ${currency}`;
        li.style.opacity = 0;
        li.style.transform = 'translateY(-20px)';
        investmentList.appendChild(li);
        setTimeout(() => {
            li.style.opacity = 1;
            li.style.transform = 'translateY(0)';
            li.style.transition = 'all 0.4s ease';
        }, idx * 50);
    });
    updateInvestmentChart();
}

// =====================
// БАЛАНС
// =====================
function updateTotalBalance() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    totalBalanceElem.textContent = balance.toFixed(2) + " " + currency;
}

// =====================
// ГРАФИК БЮДЖЕТА
// =====================
function updateBudgetChart() {
    const labels = transactions.map((_, i) => `T${i + 1}`);
    const incomeData = transactions.map(t => t.type === 'income' ? t.amount : 0);
    const expenseData = transactions.map(t => t.type === 'expense' ? t.amount : 0);

    const ctx = document.getElementById('budgetChart').getContext('2d');
    

    if (!budgetChart) {
        budgetChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [
                { label: 'Доходы', data: incomeData, backgroundColor: '#34d399', borderRadius: 6 },
                { label: 'Расходы', data: expenseData, backgroundColor: '#fb7185', borderRadius: 6 }
            ]},
            options: { responsive:true, animation:{duration:1000,easing:'easeOutQuart'}, scales:{y:{beginAtZero:true}} }
        });
    } else {
        budgetChart.data.labels = labels;
        budgetChart.data.datasets[0].data = incomeData;
        budgetChart.data.datasets[1].data = expenseData;
        budgetChart.update({ duration: 1000, easing: 'easeOutQuart' });
    }
    
}

// =====================
// ГРАФИК ИНВЕСТИЦИЙ
// =====================
function updateInvestmentChart() {
    const labels = investments.map(i => i.name);
    const data = investments.map(i => i.amount * i.price);
    const investmentPalette = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#22d3ee"];
    const colors = investments.map((_, idx) => investmentPalette[idx % investmentPalette.length]);
    const ctx = document.getElementById('investmentChart').getContext('2d');

    if (!investmentChart) {
        investmentChart = new Chart(ctx, {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth:2 }] },
            options: { responsive:true, animation:{animateRotate:true, animateScale:true, duration:1200, easing:'easeOutQuart'}, cutout:'35%' }
        });
    } else {
        investmentChart.data.labels = labels;
        investmentChart.data.datasets[0].data = data;
        investmentChart.data.datasets[0].backgroundColor = colors;
        investmentChart.update({ duration:1200, easing:'easeOutQuart' });
    }
}

// =====================
// ОЧИСТКА С ПЛАВНОЙ АНИМАЦИЕЙ
// =====================
document.getElementById('clearBudget').addEventListener('click', () => {

    transactions.forEach((_, i) => {
        const li = budgetList.children[i];
        if (li) li.style.opacity = 0;
    });

    const canvas = document.getElementById('budgetChart');

    canvas.classList.add('chart-fade-out');

    setTimeout(() => {
        transactions = [];
        renderTransactions();
        updateTotalBalance();

        if (budgetChart) {
            budgetChart.destroy();
            budgetChart = null;
        }

        canvas.classList.remove('chart-fade-out');
    }, 600);

});


document.getElementById('clearInvestments').addEventListener('click', () => {

    investments.forEach((_, i) => {
        const li = investmentList.children[i];
        if (li) li.style.opacity = 0;
    });

    const canvas = document.getElementById('investmentChart');

    canvas.classList.add('chart-fade-out');

    setTimeout(() => {
        investments = [];
        renderInvestments();

        if (investmentChart) {
            investmentChart.destroy();
            investmentChart = null;
        }

        canvas.classList.remove('chart-fade-out');
    }, 600);

});
function updateChartsTheme() {

    const isLight = document.body.classList.contains('light');
    const gridColor = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
    const textColor = isLight ? "#1e293b" : "#ffffff";

    if (budgetChart) {
        budgetChart.options.scales.x.ticks.color = textColor;
        budgetChart.options.scales.y.ticks.color = textColor;
        budgetChart.options.scales.x.grid.color = gridColor;
        budgetChart.options.scales.y.grid.color = gridColor;
        budgetChart.update();
    }

    if (investmentChart) {
        investmentChart.options.plugins.legend.labels.color = textColor;
        investmentChart.update();
    }
}

// =====================
// SUPABASE AUTH
// =====================
// 1) Создай проект на https://supabase.com
// 2) Project Settings -> API
// 3) Вставь сюда Project URL и anon public key
const SUPABASE_URL = "ВСТАВЬ_СЮДА_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "ВСТАВЬ_СЮДА_SUPABASE_ANON_PUBLIC_KEY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function register(){

    const email = document.getElementById("regUser").value.trim();
    const password = document.getElementById("regPass").value;

    if(!email || !password){
        alert("Введите email и пароль");
        return;
    }

    if(password.length < 6){
        alert("Пароль должен быть минимум 6 символов");
        return;
    }

    const { error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if(error){
        alert(error.message);
        return;
    }

    const msg = document.getElementById("successMessage");
    msg.innerText = "Аккаунт создан ✓ Проверьте почту, если Supabase просит подтверждение";
    msg.classList.add("show-success");

    setTimeout(()=>{
        showLogin();
    },1600);
}

async function login(){

    const email = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value;

    if(!email || !password){
        alert("Введите email и пароль");
        return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if(error){
        alert("Неверный email или пароль");
        return;
    }

    showSite();
}

function showSite(){

    const auth = document.getElementById("authScreen");

    auth.style.opacity = "0";
    auth.style.pointerEvents = "none";

    setTimeout(()=>{
        auth.style.display="none";
    },400);
}

function showAuth(){

    const auth = document.getElementById("authScreen");

    auth.style.display = "flex";
    auth.style.opacity = "1";
    auth.style.pointerEvents = "all";
}

function showLogin(){
    document.getElementById("loginBlock").style.display="block";
    document.getElementById("registerBlock").style.display="none";
}

function showRegister(){
    document.getElementById("loginBlock").style.display="none";
    document.getElementById("registerBlock").style.display="block";
}

window.addEventListener("load", async () => {
    const { data } = await supabaseClient.auth.getSession();

    if(data.session){
        showSite();
    } else {
        showAuth();
    }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    showAuth();
});

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);

    if (input.type === "password") {
        input.type = "text";
        button.textContent = "Скрыть";
    } else {
        input.type = "password";
        button.textContent = "Показать";
    }
}

// =====================
// ИНИЦИАЛИЗАЦИЯ
// =====================
renderTransactions();
renderInvestments();
updateTotalBalance();
