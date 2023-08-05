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

    res.redirect('/accounts');
})

app.get('/login', function(req, res) {
    res.render('login');
})

app.post('/login', function(req, res) {
    con = mysql.createConnection({
        host: "localhost",
        user: req.body.username,
        password: req.body.password,
        database: db
    });

    con.connect(function(err) {
        if (err) {
            console.log(err.sqlMessage);
            con = 0;
        }
        else {
            console.log("Connected to " + db);
            res.redirect('/accounts');
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

