// Helper functions
function formatNumber(num) {
    if (num === undefined || num === null) return 'N/A';
    return new Intl.NumberFormat('id-ID').format(num);
}

function formatAnalysisText(text) {
    if (!text) return '';
    return text.replace(/<think>[\s\S]*?<\/think>/g, '')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br>');
}

function extractConfidenceScore(text) {
    if (!text) return '';
    const match = text.match(/Confidence Score:? (\d+\/\d+)/i);
    return match ? match[1] : '';
}

// Modal functions
function showModal() {
    document.getElementById('resultsModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('resultsModal').style.display = 'none';
}

// Toggle loading state
function setLoading(isLoading) {
    const button = document.getElementById('searchButton');
    const spinner = document.getElementById('loadingSpinner');
    const buttonText = document.getElementById('buttonText');
    
    if (isLoading) {
        button.disabled = true;
        spinner.style.display = 'block';
        buttonText.textContent = 'Memproses...';
    } else {
        button.disabled = false;
        spinner.style.display = 'none';
        buttonText.textContent = 'Analisa Saham';
    }
}

// Main search function
function searchStock() {
    const query = document.getElementById('query').value.trim();
    if (!query) return;
    
    setLoading(true);
    
    fetch('https://4545-149-113-236-154.ngrok-free.app/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_code: query }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        setLoading(false);
        displayResultsInModal(query, data);
    })
    .catch(error => {
        setLoading(false);
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menganalisa saham: ' + error.message);
    });
}

function displayResultsInModal(stockCode, data) {
    const modalContent = document.getElementById('modalResultsContent');
    
    // Format all data before displaying
    const formattedData = {
        ...data,
        market: {
            ...data.market,
            data: {
                ...data.market?.data,
                market_cap_formatted: formatNumber(data.market?.data?.market_cap)
            },
            analysis_formatted: formatAnalysisText(data.market?.analysis)
        },
        technical: {
            ...data.technical,
            analysis_formatted: formatAnalysisText(data.technical?.analysis)
        },
        news: {
            ...data.news,
            analysis_formatted: formatAnalysisText(data.news?.analysis)
        },
        recommendation_formatted: formatAnalysisText(data.recommendation),
        confidence_score: extractConfidenceScore(data.recommendation)
    };

    // Create HTML content
    modalContent.innerHTML = `
        <!-- Header Section -->
        <div class="stock-header">
            <div class="stock-title">
                <div class="stock-symbol">${stockCode}</div>
                <div class="stock-name">${formattedData.market?.data?.company_name || 'Nama Perusahaan'}</div>
            </div>
            <div class="stock-price">
                <div class="current-price">${formattedData.technical?.data?.current_price ? formatNumber(formattedData.technical.data.current_price) : 'N/A'}</div>
                <div class="price-change ${formattedData.technical?.data?.price_change >= 0 ? 'positive' : 'negative'}">
                    ${formattedData.technical?.data?.price_change ? (formattedData.technical.data.price_change >= 0 ? '+' : '') + formatNumber(formattedData.technical.data.price_change) : ''}
                    ${formattedData.technical?.data?.percent_change ? '(' + (formattedData.technical.data.percent_change >= 0 ? '+' : '') + formattedData.technical.data.percent_change.toFixed(2) + '%)' : ''}
                </div>
            </div>
        </div>
        
        <!-- Recommendation Header -->
        <div class="recommendation-header">
            <div class="recommendation-header-content">
                <div class="recommendation-header-title">
                    Analyst Recommendation
                    ${formattedData.confidence_score ? `<span class="confidence-score">${formattedData.confidence_score}</span>` : ''}
                </div>
                <div class="recommendation-header-text">
                    ${formattedData.recommendation_formatted ? formattedData.recommendation_formatted.split('<br>')[0] : 'No recommendation available'}
                </div>
            </div>
        </div>

        <!-- Key Stats Section -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Market Cap</div>
                <div class="stat-value">${formattedData.market?.data?.market_cap_formatted || 'N/A'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">PE Ratio</div>
                <div class="stat-value">${formattedData.market?.data?.pe_ratio ? formattedData.market.data.pe_ratio.toFixed(2) : 'N/A'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Beta</div>
                <div class="stat-value">${formattedData.market?.data?.beta ? formattedData.market.data.beta.toFixed(2) : 'N/A'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Sector</div>
                <div class="stat-value">${formattedData.market?.data?.sector || 'N/A'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Industry</div>
                <div class="stat-value">${formattedData.market?.data?.industry || 'N/A'}</div>
            </div>
        </div>
        
        <!-- Main Content Grid -->
        <div class="content-grid">
            <!-- Left Column -->
            <div>
                <!-- Market Analysis Section -->
                <div class="section">
                    <div class="section-title">Market Analysis</div>
                    <table class="data-table">
                        <tr>
                            <th>Key Metric</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>Market Cap</td>
                            <td>${formattedData.market?.data?.market_cap_formatted || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>PE Ratio</td>
                            <td>${formattedData.market?.data?.pe_ratio ? formattedData.market.data.pe_ratio.toFixed(2) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Beta</td>
                            <td>${formattedData.market?.data?.beta ? formattedData.market.data.beta.toFixed(2) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Sector</td>
                            <td>${formattedData.market?.data?.sector || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Industry</td>
                            <td>${formattedData.market?.data?.industry || 'N/A'}</td>
                        </tr>
                    </table>
                    
                    <div class="analysis-content">
                        ${formattedData.market?.analysis_formatted || 'No market analysis available.'}
                    </div>
                </div>
                
                <!-- Technical Analysis Section -->
                <div class="section">
                    <div class="section-title">Technical Analysis</div>
                    <div class="technical-indicators">
                        <div class="indicator-card">
                            <div class="indicator-name">Current Price</div>
                            <div class="indicator-value">${formattedData.technical?.data?.current_price ? formatNumber(formattedData.technical.data.current_price) : 'N/A'}</div>
                        </div>
                        <div class="indicator-card">
                            <div class="indicator-name">RSI (14)</div>
                            <div class="indicator-value">${formattedData.technical?.data?.rsi ? formattedData.technical.data.rsi.toFixed(2) : 'N/A'}</div>
                        </div>
                        <div class="indicator-card">
                            <div class="indicator-name">SMA (20)</div>
                            <div class="indicator-value">${formattedData.technical?.data?.sma_20 ? formatNumber(formattedData.technical.data.sma_20) : 'N/A'}</div>
                        </div>
                        <div class="indicator-card">
                            <div class="indicator-name">SMA (50)</div>
                            <div class="indicator-value">${formattedData.technical?.data?.sma_50 ? formatNumber(formattedData.technical.data.sma_50) : 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="analysis-content">
                        ${formattedData.technical?.analysis_formatted || 'No technical analysis available.'}
                    </div>
                </div>
            </div>
            
            <!-- Right Column -->
            <div>
                <!-- News Section -->
                <div class="section">
                    <div class="section-title">Recent News</div>
                    ${formattedData.news?.data ? formattedData.news.data.map(item => `
                        <div class="news-item">
                            <div class="news-date">${item['published date'] || 'Date not available'}</div>
                            <div class="news-title">${item.title || 'No title available'}</div>
                            <div class="news-source">${item.source || 'Source not specified'}</div>
                        </div>
                    `).join('') : '<p>No news available</p>'}
                    
                    <div class="analysis-content" style="margin-top: 20px;">
                        ${formattedData.news?.analysis_formatted || 'No news analysis available.'}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Full Recommendation Section -->
        <div class="recommendation-card">
            <div class="recommendation-title">
                Detailed Analyst Recommendation
            </div>
            <div class="analysis-content">
                ${formattedData.recommendation_formatted || 'No recommendation details available.'}
            </div>
        </div>
    `;
    
    showModal();
}

// Allow pressing Enter key to submit
document.getElementById('query').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchStock();
    }
});