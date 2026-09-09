const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

const oldEnd = `    }).join('');
}`;

const newEnd = `    }).join('');

    // Force complete reflow to fix Edge/Chromium hit-testing bug with dynamic innerHTML
    tbody.style.display = 'none';
    void tbody.offsetHeight;
    tbody.style.display = '';
}`;

adminJs = adminJs.replace(oldEnd, newEnd);

fs.writeFileSync('public/js/admin.js', adminJs, 'utf8');
console.log('Reflow hack appended successfully.');
