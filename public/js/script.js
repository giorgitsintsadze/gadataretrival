$(document).ready(function() {
    const recordsPerPage = 10;
    let jsonData = [];

    function showLoader() {
        $('#loader').show();
    }

    function hideLoader() {
        $('#loader').hide();
    }

    function loadJSONData(startDate, endDate) {
        showLoader();

        const fileName = `ga_data_${startDate}_${endDate}.json`;

        $.get('/check-file-exists', { fileName: fileName }, function(data) {
            if (data.exists) {
                $.get('/load-json-file', { fileName: fileName }, function(data) {
                    jsonData = data;
                    displayData(1);
                    displayPagination();
                    hideLoader();
                });
            } else {
                $.ajax({
                    url: '/get-ga-data',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ range: $('#range-option').val() }),
                    success: function(data) {
                        jsonData = data;
                        displayData(1);
                        displayPagination();
                        hideLoader();
                    },
                    error: function(error) {
                        console.error('Error retrieving data:', error);
                        hideLoader();
                    }
                });
            }
        });
    }

    function displayData(page) {
        const dataContainer = $('#data-container');
        dataContainer.empty();

        const startIndex = (page - 1) * recordsPerPage;
        const endIndex = page * recordsPerPage;
        const paginatedData = jsonData.slice(startIndex, endIndex);

        if (paginatedData.length > 0) {
            // ascending order
            paginatedData.sort((a, b) => new Date(a.date) - new Date(b.date));

            for (const row of paginatedData) {
                const rowHtml = `
                            <tr>
                                <td>${row.date}</td>
                                <td>${row.sessions}</td>
                                <td>${row.newUsers}</td>
                                <td>${row.totalRevenue}</td>
                                <td>${row.transactions}</td>
                                <td>${row.checkouts}</td>
                            </tr>
                        `;
                dataContainer.append(rowHtml);
            }
        } else {
            const noDataHtml = '<tr><td colspan="6" class="no-data">No data available</td></tr>';
            dataContainer.append(noDataHtml);
        }
    }

    function displayPagination() {
        const totalPages = Math.ceil(jsonData.length / recordsPerPage);

        const paginationContainer = $('#pagination-container');
        paginationContainer.empty();

        if (totalPages > 1) {
            let paginationHtml = '';

            paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="1">First</a></li>`;
            paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="prev">Previous</a></li>`;

            for (let i = 1; i <= totalPages; i++) {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
            }

            paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="next">Next</a></li>`;
            paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">Last</a></li>`;

            paginationContainer.html(paginationHtml);

            paginationContainer.find('a.page-link').click(function(e) {
                e.preventDefault();
                const page = $(this).data('page');
                if (page === 'prev') {
                    const currentPage = parseInt(paginationContainer.find('.active').find('a').data('page'));
                    if (currentPage > 1) {
                        displayData(currentPage - 1);
                        paginationContainer.find('.active').removeClass('active').prev().addClass('active');
                    }
                } else if (page === 'next') {
                    const currentPage = parseInt(paginationContainer.find('.active').find('a').data('page'));
                    if (currentPage < totalPages) {
                        displayData(currentPage + 1);
                        paginationContainer.find('.active').removeClass('active').next().addClass('active');
                    }
                } else {
                    displayData(page);
                    paginationContainer.find('.active').removeClass('active');
                    $(this).parent().addClass('active');
                }
            });
        }
    }

    $('form').submit(function(e) {
        e.preventDefault();
        const rangeOption = $('#range-option').val();
        let startDate, endDate;

        switch (rangeOption) {
            case '7days':
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                startDate = formatDate(sevenDaysAgo);
                endDate = formatDate(new Date());
                loadJSONData(startDate, endDate);
                break;
            case '30days':
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                startDate = formatDate(thirtyDaysAgo);
                endDate = formatDate(new Date());
                loadJSONData(startDate, endDate);
                break;
            case '90days':
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                startDate = formatDate(ninetyDaysAgo);
                endDate = formatDate(new Date());
                loadJSONData(startDate, endDate);
                break;
            default:
                startDate = $('#start-date').val();
                endDate = $('#end-date').val();
                if (!startDate || !endDate) {
                    alert('Please select start and end dates.');
                    return;
                }
                loadJSONData(startDate, endDate);
                break;
        }
    });

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
});
