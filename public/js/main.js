document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#gaForm');
    const startDateInput = document.querySelector('#startDate');
    const endDateInput = document.querySelector('#endDate');
    const outputContainer = document.querySelector('#outputContainer');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        const fileName = `ga_data_${startDate}_${endDate}.json`;

        // Check if the JSON file exists for the requested dates
        const fileExists = await checkFileExists(fileName);

        if (fileExists) {
            // Load data from the existing JSON file
            const jsonData = await loadJSONFile(fileName);
            displayData(jsonData);
        } else {
            // Fetch data from the API and save it to a new JSON file
            try {
                const response = await fetch('/get-ga-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ startDate, endDate })
                });
                const data = await response.json();
                displayData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                outputContainer.innerHTML = '<p>Error fetching data</p>';
            }
        }
    });

    async function checkFileExists(fileName) {
        try {
            const response = await fetch(`/check-file-exists?fileName=${fileName}`);
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error checking file existence:', error);
            return false;
        }
    }

    async function loadJSONFile(fileName) {
        try {
            const response = await fetch(`/load-json-file?fileName=${fileName}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading JSON file:', error);
            return null;
        }
    }

    function displayData(data) {
        if (data) {
            const output = `
        <p>Start Date: ${data.startDate}</p>
        <p>End Date: ${data.endDate}</p>
        <p>Sessions: ${data.sessions}</p>
        <p>New Users: ${data.newUsers}</p>
        <p>Total Revenue: ${data.totalRevenue}</p>
        <p>Transactions: ${data.transactions}</p>
        <p>Checkouts: ${data.checkouts}</p>
      `;
            outputContainer.innerHTML = output;
        } else {
            outputContainer.innerHTML = '<p>No data available</p>';
        }
    }
});
