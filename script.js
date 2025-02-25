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
    console.log('Decoding HIN:', hin);
    
    const errors = validateHIN(hin);
    console.log('Validation errors:', errors);
    
    if (errors.length > 0) {
        displayInvalidHIN(errors);
        return;
    }
    
    const decodedInfo = parseHIN(hin);
    console.log('Decoded info:', decodedInfo);
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
    const formatCode = hin.substring(8, 9);
    const modelYear = hin.substring(9, 11);
    const monthCode = hin.substring(11, 12);

    // Debug logging
    console.log('Validating HIN:', {
        mfrCode,
        serial,
        formatCode,
        modelYear,
        monthCode
    });

    if (!MANUFACTURERS[mfrCode] && !STATES[mfrCode]) {
        errors.push('Invalid manufacturer or state code');
    }

    // Serial number validation
    if (!/^[0-9A-HJ-NP-Z]{5}$/.test(serial)) {
        errors.push('Invalid serial number format - must be 5 characters using numbers 0-9 and letters A-Z (excluding I, O, Q)');
    }

    // Model Year Format validation
    if (formatCode === 'M') {
        const year = parseInt(modelYear);
        if (year < 72 || year > 84) {
            errors.push('Invalid model year for Model Year Format (must be 72-84)');
        }
        if (!/^[A-L]$/.test(monthCode)) {
            errors.push('Invalid production month code (A=Aug, B=Sep, C=Oct, D=Nov, E=Dec, F=Jan, G=Feb, H=Mar, I=Apr, J=May, K=Jun, L=Jul)');
        }
    }
    
    return errors;
}

function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
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
    const formatCode = hin.substring(8, 9);
    const modelYear = hin.substring(9, 11);
    const monthCode = hin.substring(11, 12);
    
    let format = '';
    let manufacturer = '';
    let productionDate = '';
    
    if (MANUFACTURERS[mfrCode]) {
        manufacturer = MANUFACTURERS[mfrCode];
        if (formatCode === 'M') {
            // Model Year Format (1972-1984)
            format = 'Model Year Format (1972-1984)';
            const month = getModelYearMonth(monthCode);
            productionDate = `Model Year: 19${modelYear} (Production Month: ${month})`;
        } else if (/^[0-9]{2}$/.test(formatCode + modelYear.charAt(0))) {
            // Straight Year Format (1972-1984)
            format = 'Straight Year Format (1972-1984)';
            const month = parseInt(formatCode + modelYear.charAt(0));
            const year = monthCode + modelYear.charAt(1);
            const monthName = new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
            productionDate = `${monthName} 19${year}`;
        } else if (/^[A-L]/.test(formatCode)) {
            // Current Format (1984-Present)
            format = 'Current Format (1984-Present)';
            const currentMonth = 'ABCDEFGHIJKL'.indexOf(formatCode) + 1;
            const currentYear = '20' + modelYear.charAt(0);
            const myear = monthCode + modelYear.charAt(1);
            productionDate = `${getMonthName(currentMonth)} ${currentYear} (Model Year: 20${myear})`;
        }
    } else if (STATES[mfrCode]) {
        manufacturer = `State-Assigned (${STATES[mfrCode]})`;
        format = 'State-Assigned Format';
        const stateMonth = 'ABCDEFGHIJKL'.indexOf(formatCode) + 1;
        productionDate = `${getMonthName(stateMonth)} 20${modelYear.charAt(0)}`;
    }
    
    return {
        format,
        manufacturer,
        serial,
        productionDate
    };
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
            <li>For Model Year Format:</li>
            <ul>
                <li>Character 9 must be 'M'</li>
                <li>Characters 10-11 must be year (72-84)</li>
                <li>Character 12 must be month (A=Aug through L=Jul)</li>
            </ul>
        </ul>
    `;
}