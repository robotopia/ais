const fs = require('fs');

function invoice_to_pdf(invoice) {
    fs.readFile('/invoices/template.tex', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data);
    });
}
