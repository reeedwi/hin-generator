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
    const hins = [];

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
                const productionMonth = 'ABCDEFGHIJKL'[Math.floor(Math.random() * 12)];
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
        hinDiv.textContent = hin;
        hinList.appendChild(hinDiv);
        hins.push(hin);
    }

    copyButton.style.display = 'block';
    copyButton.setAttribute('data-hins', hins.join('\n'));
}

function copyHINs() {
    const copyButton = document.getElementById('copyButton');
    const hins = copyButton.getAttribute('data-hins');
    
    navigator.clipboard.writeText(hins).then(() => {
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    });
} 