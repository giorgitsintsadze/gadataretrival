const express = require('express');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const key = require('./key-ga.json');
const fs = require('fs');
const { DateTime } = require('luxon');

const app = express();
const port = 3000;

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

        return rows.map((row) => {
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
    } catch (error) {
        console.error('Error retrieving Google Analytics data:', error);
        throw error;
    }
}

function formatRevenue(value) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    return formatter.format(value);
}

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    const html = fs.readFileSync('./public/index.html', 'utf8');
    res.send(html);
});

app.post('/get-ga-data', async (req, res) => {
    const { startDate, endDate } = req.body;

    try {
        const data = await getGoogleAnalyticsData(startDate, endDate);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving data' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});