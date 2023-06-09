const readline = require('readline');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const key = require('./key-ga.json');
const fs = require('fs');
const { DateTime } = require('luxon');

const client = new BetaAnalyticsDataClient({
    credentials: {
        client_email: key.client_email,
        private_key: key.private_key,
    },
});

async function getGoogleAnalyticsData(startDate, endDate) {
    const request = {
        property: 'properties/323617358',
        dateRanges: [
            {
                startDate: startDate,
                endDate: endDate,
            },
        ],
        dimensions: [
            {
                name: 'date',
            },
        ],
        metrics: [
            {
                name: 'Sessions',
            },
            {
                name: 'newUsers',
            },
            {
                name: 'totalRevenue',
            },
            {
                name: 'transactions',
            },
            {
                name: 'checkouts',
            },
        ],
    };

    try {
        const [response] = await client.runReport(request);

        const dimensionHeaders = response.dimensionHeaders.map((header) => header.name);
        const metricHeaders = response.metricHeaders.map((header) => header.name);
        const rows = response.rows.map((row) => ({
            dimensions: row.dimensionValues.map((value) => value.value),
            metrics: row.metricValues.map((value) => value.value),
        }));

        const data = rows.map((row) => {
            const rawDateValue = row.dimensions[0];
            const parsedDate = DateTime.fromFormat(rawDateValue, 'yyyyMMdd');
            const formattedDate = parsedDate.isValid ? parsedDate.toFormat('yyyy-MM-dd') : rawDateValue;
            const rowData = [formattedDate, ...row.metrics];
            const revenue = parseFloat(rowData[3]);
            const formattedRevenue = formatRevenue(revenue);
            return {
                date: formattedDate,
                sessions: rowData[1],
                newUsers: rowData[2],
                totalRevenue: formattedRevenue,
                transactions: rowData[4],
                checkouts: rowData[5],
            };
        });

        const jsonData = JSON.stringify(data, null, 2);
        const fileName = `ga_data_${startDate.replace(/-/g, '_')}_${endDate.replace(/-/g, '_')}.json`;

        fs.writeFileSync(fileName, jsonData, 'utf8');

        console.log(`Data saved successfully to ${fileName}`);
    } catch (error) {
        console.error('Error retrieving Google Analytics data:', error);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Enter the start date (YYYY-MM-DD): ', (startDate) => {
    rl.question('Enter the end date (YYYY-MM-DD): ', (endDate) => {
        rl.close();
        getGoogleAnalyticsData(startDate, endDate)
            .then(() => {
                console.log('Data retrieval successful');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
});

function formatRevenue(value) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    return formatter.format(value);
}
