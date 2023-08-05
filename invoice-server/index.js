const express = require('express')
const ejs = require('ejs')
const mysql = require('mysql')
//const webpush = require('web-push');
//const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
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

app.get('/accounts', function(req, res) {
    if (!assert_connection(res)) {
        return
    }

    con.query("SELECT * FROM account", function(err, result, fields) {
        console.log(result);
        console.log(fields);
        res.render('accounts', {
            account_fields: fields,
            accounts: result
        });
    });
})
