import Chart from 'chart.js/auto';

const ctx = document.getElementById('bitcoinChart').getContext('2d');
const updateBtn = document.getElementById('updateBtn');
const daysInput = document.getElementById('daysInput');
const tableBody = document.querySelector('#usersTable tbody');

let myChart = null;

async function loadChart(days) {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`);
    const data = await response.json();

    const labels = data.prices.map(item => new Date(item[0]).toLocaleDateString('pl-PL'));
    const prices = data.prices.map(item => item[1]);

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Cena BTC (USD) - ${days} dni`,
          data: prices,
          borderColor: '#f7931a',
          backgroundColor: 'rgba(247, 147, 26, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: false } }
      }
    });
  } catch (error) {
    console.error("Ошибка графика:", error);
  }
}
async function loadUsers() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const users = await response.json();
    tableBody.innerHTML = '';
    users.forEach(user => {
      const fakeBalance = (Math.random() * 10).toFixed(4);
      const row = `
        <tr>
          <td>${user.name}</td>
          <td>${user.company.name}</td>
          <td>${user.address.city}</td>
          <td>${fakeBalance} BTC</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

  } catch (error) {
    console.error("Ошибка пользователей:", error);
    tableBody.innerHTML = "<tr><td colspan='4' style='color:red;'>Błąd pobierania danych! Sprawdź konsolę.</td></tr>";
  }
}

loadChart(7); 
loadUsers();  

updateBtn.addEventListener('click', () => {
  const days = daysInput.value;
  if(days > 0) loadChart(days);
});