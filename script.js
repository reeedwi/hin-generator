function updateOptions() {
    const format = document.getElementById('format').value;
    const manufacturerGroup = document.getElementById('manufacturerGroup');
    const stateGroup = document.getElementById('stateGroup');

    if (format === 'state') {
        manufacturerGroup.style.display = 'none';
        stateGroup.style.display = 'block';
    } else {
        manufacturerGroup.style.display = 'block';
        stateGroup.style.display = 'none';
    }
}

function generateSerialNumber() {
    const chars = '123456789ABCDEFGHJKLMNPRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateHINs() {
    const format = document.getElementById('format').value;
    const manufacturer = document.getElementById('manufacturer').value;
    const state = document.getElementById('state').value;
    const hinList = document.getElementById('hinList');
    const copyButton = document.getElementById('copyButton');
    
    hinList.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        let hin = '';
        const serial = generateSerialNumber();
        const date = new Date();
        
        switch(format) {
            case 'current':
                const months = 'ABCDEFGHIJKL';
                const currentMonth = months[date.getMonth()];
                const currentYear = date.getFullYear().toString().slice(-1);
                const modelYear = (date.getFullYear() + 1).toString().slice(-2);
                hin = `${manufacturer}${serial}${currentMonth}${currentYear}${modelYear}`;
                break;

            case 'modelYear':
                const modelYearMonths = 'ABCDEFGHIJKL';
                const productionMonth = modelYearMonths[Math.floor(Math.random() * 12)];
                const year = Math.floor(Math.random() * (84 - 72 + 1) + 72);
                hin = `${manufacturer}${serial}M${year}${productionMonth}`;
                break;

            case 'straightYear':
                const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
                const straightYear = Math.floor(Math.random() * (84 - 72 + 1) + 72);
                hin = `${manufacturer}${serial}${month}${straightYear}`;
                break;

            case 'state':
                const stateMonth = 'ABCDEFGHIJKL'[date.getMonth()];
                const stateYear = date.getFullYear().toString().slice(-3);
                hin = `${state}${serial}${stateMonth}${stateYear}`;
                break;
        }

        const hinDiv = document.createElement('div');
        hinDiv.className = 'hin-item';
        
        // Create container for HIN and copy button
        const hinContent = document.createElement('span');
        hinContent.textContent = hin;
        hinDiv.appendChild(hinContent);

        // Create copy button for this specific HIN
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(hin).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
        };
        hinDiv.appendChild(copyBtn);
        
        hinList.appendChild(hinDiv);
    }

    // Remove the global copy button since we now have individual ones
    copyButton.style.display = 'none';
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-section`).classList.add('active');
}

const MANUFACTURERS = {
    'SER': 'Sea Ray Boats Inc.',
    'BMC': 'Bayliner Marine Corporation',
    'BWC': 'Boston Whaler Inc.',
    'GWT': 'Grady-White Boats Inc.',
    'TTM': 'Tracker Marine'
};

const STATES = {
    'MIZ': 'Mississippi',
    'MNZ': 'Minnesota',
    'LAZ': 'Louisiana'
};

function decodeHIN() {
    const hin = document.getElementById('hinInput').value.toUpperCase();
    const resultsDiv = document.getElementById('decoder-results');
    const errors = validateHIN(hin);
    
    if (errors.length > 0) {
        displayInvalidHIN(errors);
        return;
    }
    
    const decodedInfo = parseHIN(hin);
    displayValidHIN(decodedInfo);
}

function validateHIN(hin) {
    const errors = [];
    
    if (hin.length !== 12) {
        errors.push('HIN must be exactly 12 characters long');
    }
    
    if (!/^[A-Z0-9]+$/.test(hin)) {
        errors.push('HIN can only contain uppercase letters and numbers');
    }
    
    const mfrCode = hin.substring(0, 3);
    const serial = hin.substring(3, 8);
    const month = hin.substring(8, 10);
    const year = hin.substring(10, 12);

    if (!MANUFACTURERS[mfrCode] && !STATES[mfrCode]) {
        errors.push('Invalid manufacturer or state code');
    }

    // Updated serial number validation
    if (!/^[0-9A-HJ-NP-Z]{5}$/.test(serial)) {
        errors.push('Invalid serial number format - must be 5 characters using numbers 0-9 and letters A-Z (excluding I, O, Q)');
    }

    // Validate date codes based on format
    if (MANUFACTURERS[mfrCode]) {
        if (month === 'M') {
            // Model Year Format (1972-1984)
            const modelYear = parseInt(year);
            if (modelYear < 72 || modelYear > 84) {
                errors.push('Invalid model year for Model Year Format (must be 72-84)');
            }
        } else if (/^[0-9]{2}$/.test(month)) {
            // Straight Year Format (1972-1984)
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            if (monthNum < 1 || monthNum > 12) {
                errors.push('Invalid month for Straight Year Format (must be 01-12)');
            }
            if (yearNum < 72 || yearNum > 84) {
                errors.push('Invalid year for Straight Year Format (must be 72-84)');
            }
        } else if (/^[A-L]/.test(month.charAt(0))) {
            // Current Format (1984-Present)
            if (!/^[0-9]$/.test(month.charAt(1))) {
                errors.push('Invalid year code for Current Format');
            }
            if (!/^[0-9]{2}$/.test(year)) {
                errors.push('Invalid model year for Current Format');
            }
        } else {
            errors.push('Invalid date code format');
        }
    }
    
    return errors;
}

function getModelYearMonth(monthCode) {
    const months = {
        'A': 'August',
        'B': 'September',
        'C': 'October',
        'D': 'November',
        'E': 'December',
        'F': 'January',
        'G': 'February',
        'H': 'March',
        'I': 'April',
        'J': 'May',
        'K': 'June',
        'L': 'July'
    };
    return months[monthCode] || 'Unknown';
}

function parseHIN(hin) {
    const mfrCode = hin.substring(0, 3);
    const serial = hin.substring(3, 8);
    const month = hin.substring(8, 10);
    const year = hin.substring(10, 12);
    
    let format = '';
    let manufacturer = '';
    let productionDate = '';
    
    if (MANUFACTURERS[mfrCode]) {
        manufacturer = MANUFACTURERS[mfrCode];
        if (month === 'M') {
            // Model Year Format (1972-1984)
            format = 'Model Year Format (1972-1984)';
            const monthCode = year.charAt(1);
            const modelYear = year.charAt(0);
            productionDate = `Model Year: 19${year} (Production Month: ${getModelYearMonth(monthCode)})`;
        } else if (/^[0-9]{2}$/.test(month)) {
            // Straight Year Format (1972-1984)
            format = 'Straight Year Format (1972-1984)';
            const monthName = new Date(2000, parseInt(month) - 1, 1).toLocaleString('default', { month: 'long' });
            productionDate = `${monthName} 19${year}`;
        } else if (/^[A-L]/.test(month)) {
            // Current Format (1984-Present)
            format = 'Current Format (1984-Present)';
            const currentMonth = 'ABCDEFGHIJKL'.indexOf(month.charAt(0)) + 1;
            const currentYear = '20' + month.charAt(1);
            productionDate = `${getMonthName(currentMonth)} ${currentYear} (Model Year: 20${year})`;
        }
    } else if (STATES[mfrCode]) {
        manufacturer = `State-Assigned (${STATES[mfrCode]})`;
        format = 'State-Assigned Format';
        const stateMonth = 'ABCDEFGHIJKL'.indexOf(month.charAt(0)) + 1;
        productionDate = `${getMonthName(stateMonth)} 20${month.charAt(1)}`;
    }
    
    return {
        format,
        manufacturer,
        serial,
        productionDate
    };
}

function getMonthName(month) {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
}

function displayValidHIN(info) {
    const resultsDiv = document.getElementById('decoder-results');
    resultsDiv.className = 'decoder-results valid';
    resultsDiv.innerHTML = `
        <h3>✓ Valid HIN</h3>
        <ul>
            <li><strong>Format:</strong> ${info.format}</li>
            <li><strong>Manufacturer:</strong> ${info.manufacturer}</li>
            <li><strong>Serial Number:</strong> ${info.serial}</li>
            <li><strong>Production Date:</strong> ${info.productionDate}</li>
        </ul>
    `;
}

function displayInvalidHIN(errors) {
    const resultsDiv = document.getElementById('decoder-results');
    resultsDiv.className = 'decoder-results invalid';
    resultsDiv.innerHTML = `
        <h3>✗ Invalid HIN</h3>
        <ul>
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
        <p><strong>Guidance:</strong></p>
        <ul>
            <li>HIN must be 12 characters long</li>
            <li>Use only uppercase letters and numbers</li>
            <li>First three characters must be a valid manufacturer or state code</li>
            <li>Format should match one of the known HIN formats</li>
        </ul>
    `;
} 