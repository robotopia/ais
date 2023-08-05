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
