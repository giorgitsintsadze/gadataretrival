// Fetch analytics data from the server
async function fetchData(startDate, endDate) {
    try {
        const response = await fetch(`/analytics?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
    }
}

// Update the UI with analytics data
function updateUI(data) {
    document.getElementById('revenue').textContent = data.revenue;
    document.getElementById('conversion-rate').textContent = data.conversionRate;
    document.getElementById('avg-order-value').textContent = data.avgOrderValue;
    document.getElementById('transactions').textContent = data.transactions;
    document.getElementById('users').textContent = data.users;
    document.getElementById('sessions').textContent = data.sessions;
}

// Handle form submission
document.getElementById('data-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    try {
        const data = await fetchData(startDate, endDate);
        updateUI(data);
    } catch (error) {
        // Handle error
    }
});
