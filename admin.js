// Toggle sidebar
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar.style.left === '0px') {
        sidebar.style.left = '-240px';
        overlay.style.display = 'none';
    } else {
        sidebar.style.left = '0px';
        overlay.style.display = 'block';
    }
}

// Show section
function showSection(id, event) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    toggleMenu();

    if(id === 'dashboard') updateDashboard(); // refresh dashboard
}

// Dummy users
if (!localStorage.getItem('users')) {
    const dummyUsers = [
        { fullname: "Akbar", phone: "08123456789", email: "akbar@mail.com", saldo: 10000, deposit: 5000, withdraw: 0 },
        { fullname: "Budi", phone: "08123456788", email: "budi@mail.com", saldo: 20000, deposit: 10000, withdraw: 0 }
    ];
    localStorage.setItem('users', JSON.stringify(dummyUsers));
}

// ---------------- User Management ----------------
function renderUsers() {
    const userList = document.getElementById('userList');
    const search = document.getElementById('searchUser')?.value.toLowerCase() || '';
    userList.innerHTML = '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    users.forEach((u, index) => {
        if (u.fullname.toLowerCase().includes(search) || u.phone.includes(search)) {
            const saldo = u.saldo || 0;
            const deposit = u.deposit || 0;
            const withdraw = u.withdraw || 0;

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <h4>${u.fullname}</h4>
                <ul class="balance-list">
                    <li>Saldo: <span class="value">Rp${saldo}</span></li>
                    <li>Deposit: <span class="value">Rp${deposit}</span></li>
                    <li>Withdraw: <span class="value">Rp${withdraw}</span></li>
                </ul>
                <div class="actions">
                    <input type="number" class="amount-input" placeholder="Jumlah..." id="input-${index}">
                    <select id="select-${index}">
                        <option value="saldo">Saldo</option>
                        <option value="deposit">Deposit</option>
                        <option value="withdraw">Withdraw</option>
                    </select>
                    <button class="action-btn" onclick="updateUser(${index}, 'add')">Tambah</button>
                    <button class="action-btn" onclick="updateUser(${index}, 'minus')">Kurangi</button>
                    <button class="action-btn" onclick="loginAsUser(${index})"><i class="fa fa-sign-in-alt"></i> Masuk</button>
                </div>
            `;
            userList.appendChild(card);
        }
    });
}

// Update user saldo/deposit/withdraw
function updateUser(index, type) {
    const input = document.getElementById(`input-${index}`);
    const select = document.getElementById(`select-${index}`);
    const amount = parseInt(input.value);

    if (isNaN(amount) || amount <= 0) { 
        alert("Masukkan jumlah valid!"); 
        return; 
    }

    const users = JSON.parse(localStorage.getItem('users'));
    const field = select.value;

    if (type === 'add') users[index][field] += amount;
    else users[index][field] -= amount;

    if (users[index][field] < 0) users[index][field] = 0;

    localStorage.setItem('users', JSON.stringify(users));
    input.value = '';
    renderUsers();
    updateDashboard(); // update dashboard otomatis
}

// Masuk sebagai user
function loginAsUser(index) {
    const users = JSON.parse(localStorage.getItem('users'));
    localStorage.setItem('activeUser', JSON.stringify(users[index]));
    alert(`Masuk sebagai ${users[index].fullname}`);
    window.location.href = 'profil.html';
}

// Live search
document.getElementById('searchUser')?.addEventListener('input', renderUsers);

// ---------------- Dashboard ----------------
function updateDashboard() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const totalUser = users.length;
    const totalDeposit = users.reduce((sum,u)=>sum+(u.deposit||0),0);
    const totalWithdraw = users.reduce((sum,u)=>sum+(u.withdraw||0),0);

    document.getElementById('totalUser').innerText = totalUser;
    document.getElementById('totalDeposit').innerText = `Rp${totalDeposit}`;
    document.getElementById('totalWithdraw').innerText = `Rp${totalWithdraw}`;

    renderChart(users);
}

// Render chart (Chart.js)
function renderChart(users) {
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    const depositData = users.map(u => u.deposit || 0);
    const withdrawData = users.map(u => u.withdraw || 0);
    const labels = users.map(u => u.fullname);

    if(window.dashboardChart) window.dashboardChart.destroy(); // destroy previous chart

    window.dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Deposit',
                    data: depositData,
                    backgroundColor: '#c1f52b'
                },
                {
                    label: 'Withdraw',
                    data: withdrawData,
                    backgroundColor: '#ff6b6b'
                }
            ]
        },
        options: {
            responsive:true,
            plugins: {
                legend:{ position:'top' }
            },
            scales:{
                y: { beginAtZero:true }
            }
        }
    });
}

// Initial render
renderUsers();
updateDashboard();

// Simulasi data transaksi (bisa diupdate saat tambah/kurangi deposit/withdraw)
if(!localStorage.getItem('transactions')){
    const dummyTransactions = [
        { date: '2025-09-14', deposit: 5000, withdraw: 0 },
        { date: '2025-09-14', deposit: 10000, withdraw: 0 },
        { date: '2025-09-15', deposit: 0, withdraw: 2000 }
    ];
    localStorage.setItem('transactions', JSON.stringify(dummyTransactions));
}

function updateDashboard() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const totalUser = users.length;
    const totalDeposit = users.reduce((acc,u)=>acc+(u.deposit||0),0);
    const totalWithdraw = users.reduce((acc,u)=>acc+(u.withdraw||0),0);

    document.getElementById('totalUser').innerText = totalUser;
    document.getElementById('totalDeposit').innerText = `Rp${totalDeposit}`;
    document.getElementById('totalWithdraw').innerText = `Rp${totalWithdraw}`;

    // Ambil data transaksi
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    // Kelompokkan per tanggal
    const grouped = {};
    transactions.forEach(t=>{
        if(!grouped[t.date]) grouped[t.date]={deposit:0, withdraw:0};
        grouped[t.date].deposit += t.deposit || 0;
        grouped[t.date].withdraw += t.withdraw || 0;
    });

    const labels = Object.keys(grouped).sort(); // tanggal urut
    const depositData = labels.map(d=>grouped[d].deposit);
    const withdrawData = labels.map(d=>grouped[d].withdraw);

    // Hapus chart lama
    if(window.dashboardChartInstance) window.dashboardChartInstance.destroy();

    const ctx = document.getElementById('dashboardChart').getContext('2d');
    window.dashboardChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Deposit',
                    data: depositData,
                    backgroundColor: 'rgba(193, 245, 43, 0.7)',
                    borderColor: 'rgba(193, 245, 43, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Withdraw',
                    data: withdrawData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive:true,
            plugins: { legend: { position: 'top', labels: { color:'#fff' } } },
            scales: {
                x: { ticks: { color:'#fff' }, grid: { color:'#3c4452' } },
                y: { ticks: { color:'#fff' }, grid: { color:'#3c4452' }, beginAtZero:true }
            }
        }
    });
}

// Panggil updateDashboard setiap render
renderUsers = (function(originalRender){
    return function(){
        originalRender();
        updateDashboard();
    }
})(renderUsers);