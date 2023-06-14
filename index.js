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

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    const html = fs.readFileSync('./public/index.html', 'utf8');
    res.send(html);
});

app.get('/analytics', async (req, res) => {
    const { startDate, endDate } = req.query;

    const metrics = [
        'totalRevenue',
        'purchaserConversionRate',
        'averagePurchaseRevenue',
        'transactions',
        'totalUsers',
        'sessions',
    ];

    const dimensions = [
        'date',
        'sessionCampaignName',
        'sessionDefaultChannelGroup',
    ];

    const request = {
        property: 'properties/323617358',
        dateRanges: [
            {
                startDate: startDate,
                endDate: endDate,
            },
        ],
        metrics: metrics.map(metric => {
            return { name: metric };
        }),
        dimensions: dimensions.map(dimension => {
            return { name: dimension };
        }),
    };

    try {
        const [response] = await client.runReport(request);

        const metricHeaders = response.metricHeaders.map(header => header.name);
        const dimensionHeaders = response.dimensionHeaders.map(header => header.name);
        const rows = response.rows.map(row => {
            const rowData = {};
            metricHeaders.forEach((header, index) => {
                rowData[header] = row.metricValues[index].value;
            });
            dimensionHeaders.forEach((header, index) => {
                rowData[header] = row.dimensionValues[index].value;
            });
            return rowData;
        });

        res.json({
            revenue: rows[0]['metric.revenue'],
            conversionRate: rows[0]['metric.conversionRate'],
            avgOrderValue: rows[0]['metric.averageOrderValue'],
            transactions: rows[0]['metric.transactions'],
            users: rows[0]['metric.users'],
            sessions: rows[0]['metric.sessions'],
        });
    } catch (error) {
        console.error('Error retrieving Google Analytics data:', error);
        res.status(500).json({ error: 'Error retrieving Google Analytics data' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
