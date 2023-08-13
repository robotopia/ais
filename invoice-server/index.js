const express = require('express')
const ejs = require('ejs')
const mysql = require('mysql')
//const webpush = require('web-push');
//const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

function today() {
    date = new Date();
    year = date.getFullYear();
    month = ("0" + (date.getMonth() + 1)).slice(-2);
    day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
}

const db = "ppc_invoices";
let con = 0;
function assert_connection(res) {
    if (con == 0) {
        console.log("No connection, redirecting to login");
        res.redirect('/login');
        return false;
    }
    return true;
};

const port = 3000;
app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

app.get('/', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    res.render('index');
})

/*
app.get('/login', function(req, res) {
    res.render('login');
})
*/

app.get('/login', function(req, res) {
    con = mysql.createConnection({
        host: "localhost",
        user: process.env.DB_USER, //req.body.username,
        password: process.env.DB_PASS, //req.body.password,
        database: db,
        multipleStatements: true
    });

    con.connect(function(err) {
        if (err) {
            console.log(err.sqlMessage);
            con = 0;
        }
        else {
            console.log("Connected to " + db);
            res.redirect('/');
        }
    });
})

function validateAccountForm(data) {
    const bsb_re = /^[0-9]{3}-*[0-9]{3}$/;
    if (bsb_re.test(String(data.bsb)) == false) {
        console.log("Invalid BSB number");
        return false;
    }

    const number_re = /^[0-9 -]+$/;
    if (number_re.test(String(data.number)) == false) {
        console.log("Invalid account number");
        return false;
    }

    const name_re = /^[a-zA-Z0-9 ]+$/;
    if (name_re.test(String(data.name)) == false) {
        console.log("Invalid account name (can contain only alphanumerics and spaces)");
        return false;
    }

    return true;
}

app.get('/accounts', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    con.query("SELECT * FROM account", function(err, result, fields) {
        res.render('accounts', {
            account_fields: fields,
            accounts: result
        });
    });
})

app.post('/accounts', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    if (validateAccountForm(req.body) == false) {
        return;
    }

    if (req.body.action == "insert") {
        con.query("INSERT INTO account(bsb, number, name) VALUES (?, ?, ?)",
            [req.body.bsb, req.body.number, req.body.name]
        );
    }
    else if (req.body.action == "delete") {
        con.query("DELETE FROM account WHERE id = ?",
            [parseInt(req.body.id)]
        );
    }
    else if (req.body.action == "update") {
        con.query("UPDATE account SET bsb = ?, number = ?, name = ? WHERE id = ?",
            [req.body.bsb, req.body.number, req.body.name, parseInt(req.body.id)]
        );
    }

    res.redirect('/accounts');
})


function validateBillingForm(data) {
    const str_re = /^[a-zA-Z0-9, ]+$/;
    if (str_re.test(String(data.name)) == false) {
        console.log("Invalid billing name (can contain only alphanumerics, commas, and spaces)");
        return false;
    }

    if (str_re.test(String(data.addr1)) == false) {
        console.log("Invalid address line 1 (can contain only alphanumerics and spaces)");
        return false;
    }

    if (str_re.test(String(data.addr2)) == false) {
        console.log("Invalid address line 2 (can contain only alphanumerics and spaces)");
        return false;
    }

    const phone_re = /^[0-9 -+]+$/;
    if (phone_re.test(String(data.phone)) == false) {
        console.log("Invalid phone number");
        return false;
    }

    const email_re = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if (email_re.test(String(data.email)) == false) {
        console.log("Invalid email address");
        return false;
    }

    const abn_re = /^[0-9 -]+$/;
    if (abn_re.test(String(data.abn)) == false) {
        console.log("Invalid ABN");
        return false;
    }

    if (str_re.test(String(data.bill_to)) == false) {
        console.log("Invalid \"Bill to\" value");
        return false;
    }

    return true;
}

app.get('/billing', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    con.query("SELECT * FROM billing", function(err, result, fields) {
        res.render('billing', {
            billing_fields: fields,
            billings: result
        });
    });
})

app.post('/billing', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    if (validateBillingForm(req.body) == false) {
        return;
    }

    if (req.body.action == "insert") {
        con.query("INSERT INTO billing(name, addr1, addr2, phone, email, abn, bill_to) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [req.body.name, req.body.addr1, req.body.addr2, req.body.phone, req.body.email, req.body.abn, req.body.bill_to]
        );
    }
    else if (req.body.action == "delete") {
        con.query("DELETE FROM billing WHERE id = ?",
            [parseInt(req.body.id)]
        );
    }
    else if (req.body.action == "update") {
        con.query("UPDATE billing SET name = ?, addr1 = ?, addr2 = ?, phone = ?, email = ?, abn = ?, bill_to = ? WHERE id = ?",
            [req.body.name, req.body.addr1, req.body.addr2, req.body.phone, req.body.email, req.body.abn, req.body.bill_to, parseInt(req.body.id)]
        );
    }

    res.redirect('/billing');
})


function validateActivityTypeForm(data) {
    const str_re = /^[a-zA-Z0-9, ()]+$/;
    if (str_re.test(String(data.description)) == false) {
        console.log("Invalid description (can contain only alphanumerics, commas, parentheses, and spaces)");
        return false;
    }

    return true;
}

app.get('/activity-type', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    con.query("SELECT id, description, rate_cents/100.0 AS rate FROM activity_type", function(err, result, fields) {
        res.render('activity_types', {
            activity_type_fields: fields,
            activity_types: result
        });
    });
})

app.post('/activity-type', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    if (validateActivityTypeForm(req.body) == false) {
        return;
    }

    if (req.body.action == "insert") {
        con.query("INSERT INTO activity_type(description, rate_cents) VALUES (?, ?)",
            [req.body.description, 100*parseFloat(req.body.rate)]
        );
    }
    else if (req.body.action == "delete") {
        con.query("DELETE FROM activity_type WHERE id = ?",
            [parseInt(req.body.id)]
        );
    }
    else if (req.body.action == "update") {
        con.query("UPDATE activity_type SET description = ?, rate_cents = ? WHERE id = ?",
            [req.body.description, 100*parseFloat(req.body.rate), parseInt(req.body.id)]
        );
    }

    res.redirect('/activity-type');
})


function validateActivityForm(data) {
    const date_re = /^[0-9]{4}-[0-1][0-9]-[0-3][0-9]$/;
    if (date_re.test(String(data.date)) == false) {
        console.log("Invalid date (DD-MM-YYYY)");
        return false;
    }

    return true;
}

app.get('/activity', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    sql1 = "SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date_str, qty, activity_type_id, notes FROM activity ORDER BY date"
    sql2 = "SELECT id, description FROM activity_type"
    sql = sql1 + "; " + sql2;

    con.query(sql, function(err, results, fields) {
        res.render('activities', {
            activities: results[0],
            activity_types: results[1]
        });
    });
})

app.post('/activity', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    if (validateActivityForm(req.body) == false) {
        return;
    }

    if (req.body.action == "insert") {
        con.query("INSERT INTO activity(date, qty, activity_type_id, notes) VALUES (STR_TO_DATE(?, '%Y-%m-%d'), ?, ?, ?)",
            [req.body.date, parseFloat(req.body.qty), parseInt(req.body.activity_type), req.body.notes]
        );
    }
    else if (req.body.action == "delete") {
        con.query("DELETE FROM activity WHERE id = ?",
            [parseInt(req.body.id)]
        );
    }
    else if (req.body.action == "update") {
        con.query("UPDATE activity SET date = STR_TO_DATE(?, '%Y-%m-%d'), qty = ?, activity_type_id = ?, notes = ? WHERE id = ?",
            [req.body.date, parseFloat(req.body.qty), parseInt(req.body.activity_type), req.body.notes, parseInt(req.body.id)]
        );
    }

    res.redirect('/activity');
})


app.get('/invoices', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    let sql = "SELECT * FROM invoice_view"
    con.query(sql, function(err, result, field) {
        if (err) {
            console.log(err);
        }

        res.render('invoices', {invoices: result});
    });
});

app.post('/invoice/:id', function(req, res) {
    if (!assert_connection(res)) {
        return;
    }

    // Turn empty date strings into nulls
    issued = req.body.issued_str.length > 0 ? req.body.issued_str : null;
    due = req.body.due_str.length > 0 ? req.body.due_str : null;
    paid = req.body.paid_str.length > 0 ? req.body.paid_str : null;

    values = [req.body.billing_id,
        req.body.account_id,
        issued,
        due,
        paid];

    // Two cases: "id" is an existing invoice id, or "id" = "new"
    if (req.params.id == "new") {
        // Insert new invoice
        sql = "INSERT INTO invoice (billing_id, account_id, issued, due, paid, created) VALUES (?)"
        values.push(today());

        con.query(sql, values, function(err, result) {
            if (err) {
                console.log(err);
                res.redirect("/invoices");
            }

            res.redirect("/invoice/" + result.insertId);
        });
    } else {
        // Update existing invoice
        sql = "UPDATE invoice SET billing_id = ?, account_id = ?, issued = ?, due = ?, paid = ? WHERE id = ?";

        values.push(req.params.id);

        con.query(sql, values, function(err) {
            if (err) console.log(err);
        });

        res.redirect('/invoice/' + req.params.id);
    }
});

app.get('/invoice/:id', function(req, res) {
    if (!assert_connection(res)) {
        return;
    }

    // If "id" is existing invoice id, display invoice,
    // but if "id" = "new", display empty form

    if (req.params.id == "new") {
        invoice = {id: "new"};
        activities = [];

        context = {
            invoice: invoice,
            activities: activities,
        };

        res.render('invoice', context)
    } else {
        // Find the (most recently created) invoice with the matching month and year
        sql1 = "SELECT * FROM invoice_view WHERE id = ?";
        sql2 = "SELECT * FROM activity_view WHERE invoice_id = ?";
        sql = sql1 + "; " + sql2;

        con.query(sql, [req.params.id, req.params.id], function(err, results, field) {
            if (err) {
                console.log(err);
            }

            if (results[0].length == 0) {
                res.sendStatus(404);
            }

            invoice = results[0][0]; // There can only be 1 invoice
            activities = results[1];

            context = {
                invoice: invoice,
                activities: activities,
            };

            res.render('invoice', context)
        });
    }
})


app.get('/add_invoice_item/:invoice_id', function (req, res) {
    if (!assert_connection(res)) {
        return;
    }

    sql1 = "SELECT * FROM activity_view ORDER BY date_str DESC";
    sql2 = "SELECT * FROM invoice WHERE id = ?";

    sql = sql1 + "; " + sql2;
    con.query(sql, [req.params.invoice_id], function(err, results, fields) {
        if (err) console.log(err);

        res.render('add_invoice_item', {
            activities: results[0],
            invoice: results[1][0]
        });
    });

});


app.post('/add_invoice_item/:invoice_id', function(req, res) {
    if (!assert_connection(res)) {
        return;
    }

    if (! req.body.hasOwnProperty("activities")) {
        res.sendStatus(204);
    }
    else {
        var activity_ids = [];
        if (Array.isArray(req.body.activities)) {
            req.body.activities.forEach(function(activity_id) {
                activity_ids.push(activity_id);
            });
        }
        else {
            activity_ids = [req.body.activities];
        }

        sql1 = "UPDATE activity SET invoice_id = NULL WHERE invoice_id = ?"; // Clear out the existing invoice associations
        sql2 = "UPDATE activity SET invoice_id = ? WHERE id IN (?)"; // Add the selected ones

        sql = sql1 + "; " + sql2;
        con.query(sql, [req.params.invoice_id, req.params.invoice_id, activity_ids], function(err) {
            if (err) console.log(err);
        })

        res.redirect('/add_invoice_item/' + req.params.invoice_id);
    }
});

