const express = require('express');
const session = require('express-session');
const passport = require('passport');
const ejs = require('ejs');
const mysql = require('mysql');
const fs = require('fs');
const Readable = require('stream').Readable;
const latex = require('node-latex');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config()

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

var userProfile;

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://ais.gazza.rocks/redirect"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));

app.use(session({
        resave: false,
        saveUninitialized: true,
        secret: 'SECRET',
}));

app.use(passport.initialize());
app.use(passport.session());

function authenticationMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/')
  }
}

function today() {
    date = new Date();
    year = date.getFullYear();
    month = ("0" + (date.getMonth() + 1)).slice(-2);
    day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
}

const {
    DBNAME,
    DBHOST,
    DBPORT,
    DBUSER,
    DBPASS
} = process.env;

let con = mysql.createConnection({
        host: DBHOST,
        port: DBPORT,
        user: DBUSER,
        password: DBPASS,
        database: DBNAME,
        multipleStatements: true,
        dateStrings: 'date'
});

const PORT = 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS
    }
});

function validateClientForm(data) {
    const str_re = /^[a-zA-Z0-9, ]+$/;
    if (str_re.test(String(data.name)) == false) {
        console.log("Invalid billing name (can contain only alphanumerics, commas, and spaces)");
        return false;
    }

    const email_re = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if (email_re.test(String(data.bill_email)) == false) {
        console.log("Invalid email address");
        return false;
    }

    return true;
}

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

function validateTaxPeriodForm(data) {
    const date_re = /^[0-9]{4}-[0-1][0-9]-[0-3][0-9]$/;
    if (date_re.test(String(data.start)) == false) {
        console.log("Invalid date (YYYY-MM-DD)");
        return false;
    }

    if (date_re.test(String(data.end)) == false) {
        console.log("Invalid date (YYYY-MM-DD)");
        return false;
    }

    return true;
}

function validateActivityForm(data) {
    const date_re = /^[0-9]{4}-[0-1][0-9]-[0-3][0-9]$/;
    if (date_re.test(String(data.date)) == false) {
        console.log("Invalid date (YYYY-MM-DD)");
        return false;
    }

    return true;
}

function validateActivityTypeForm(data) {
    const str_re = /^[-a-zA-Z0-9, ()\$]+$/;
    if (str_re.test(String(data.description)) == false) {
        console.log("Invalid description (can contain only alphanumerics, commas, parentheses, and spaces)");
        return false;
    }

    return true;
}

const tables = {
    account: {
        parent_display: "Accounts",
        validationFunc: validateAccountForm,
        fields: {
            id: {display: "ID", type: "text"},
            name: {display: "Account Name", type: "text", required: true},
            bsb: {display: "BSB", type: "text", required: true},
            number: {display: "Account No.", type: "text", required: true}
        },
        fields_editable: ["bsb", "name"],
        fields_list: ["bsb", "name"],
        slug: "number"
    },
    activity: {
        parent_display: "Activities",
        validationFunc: validateActivityForm,
        view: "activity_view",
        fields: {
            id: {display: "ID", type: "text"},
            date: {display: "Date", type: "date", required: true},
            qty: {display: "Qty", type: "text", required: true},
            activity_type: {display: "Activity type", type: "text"},
            activity_type_id: {display: "Activity type", type: "select", required: true, references: "activity_type"},
            notes: {display: "Notes", type: "text"},
            invoice: {display: "Invoice", type: "text"},
            invoice_id: {display: "Invoice", type: "select", references: "invoice"}
        },
        fields_editable: ["qty", "activity_type_id", "notes", "invoice_id"],
        fields_list: ["qty", "activity_type", "notes", "invoice"],
        slug: "date",
        order_by: "-date"
    },
    activity_type: {
        parent_display: "Activity types",
        view: "activity_type_view",
        validationFunc: validateActivityTypeForm,
        fields: {
            id: {display: "ID", type: "text"},
            description: {display: "Description", type: "text", required: true},
            rate: {display: "Rate ($)", type: "text", required: true},
            rate_display: {display: "Rate", type: "text"}
        },
        fields_editable: ["rate"],
        fields_list: ["rate_display"],
        slug: "description"
    },
    billing: {
        parent_display: "Billing information",
        validationFunc: validateBillingForm,
        fields: {
            id: {display: "ID", type: "text"},
            name: {display: "Name", type: "text", required: true},
            addr1: {display: "Address line 1", type: "text"},
            addr2: {display: "Address line 2", type: "text"},
            phone: {display: "Phone", type: "text", required: true},
            email: {display: "Email", type: "text", required: true},
            abn: {display: "ABN", type: "text", required: true},
            is_gst_registered: {display: "GST registered?", type: "checkbox"}
        },
        fields_editable: ["addr1", "addr2", "phone", "email", "abn", "is_gst_registered"],
        fields_list: ["email", "abn"],
        slug: "name"
    },
    client: {
        parent_display: "Clients",
        validationFunc: validateClientForm,
        fields: {
            id: {display: "ID", type: "text"},
            name: {display: "Name", type: "text", required: true},
            bill_email: {display: "Billing email", type: "text"},
            email_text: {display: "Email text", type: "text"}
        },
        fields_editable: ["bill_email", "email_text"],
        fields_list: ["bill_email"],
        slug: "name"
    },
    expense: {
        parent_display: "Expenses",
        view: "expense_view",
        fields: {
            id: {display: "ID", type: "text"},
            date: {display: "Date", type: "date", required: true},
            amount: {display: "Amount ($)", type: "text", required: true},
            description: {display: "Description", type: "text"},
            fuel_kms: {display: "Fuel kms (leave blank for non-fuel expenses)", type: "text"},
            receipt: {display: "Receipt", type: "image"},
            tax_deductible_amount: {display: "Tax deductible amount", type: "text"}
        },
        fields_editable: ["amount", "description", "fuel_kms"],
        fields_list: ["amount", "description", "fuel_kms", "tax_deductible_amount"],
        slug: "date",
        order_by: "-date"
    },
    invoice: {
        parent_display: "Invoices",
        /*
        validationFunc: validateInvoiceForm,
        fields: {
            id: {display: "ID", type: "text"},
            name: {display: "Name", type: "text", required: true},
            bill_email: {display: "Billing email", type: "text"}
        },
        fields_editable: ["bill_email"],
        fields_list: ["bill_email"],
        */
        slug: "name"
    },
    tax_period: {
        parent_display: "Tax periods",
        view: "tax_period_view",
        validationFunc: validateTaxPeriodForm,
        fields: {
            id: {display: "ID", type: "text"},
            name: {display: "Name", type: "text", required: true},
            start: {display: "Start date", type: "date", required: true},
            end: {display: "Start date", type: "date", required: true},
            taxable_income: {display: "Taxable income", type: "text"}
        },
        fields_editable: ["start", "end"],
        fields_list: ["start", "end", "taxable_income"],
        slug: "name"
    },
    travel: {
        parent_display: "Travel diary",
        view: "travel_view",
        fields: {
            id: {display: "ID", type: "text"},
            date: {display: "Date", type: "date"},
            activity: {display: "Activity", type: "text"},
            activity_id: {display: "Activity", type: "select", required: true, references: "activity"},
            from_location: {display: "From", type: "text"},
            to_location: {display: "To", type: "text"},
            kms: {display: "Kilometers travelled", type: "text", required: true},
            expense: {display: "Expense", type: "text"},
            expense_id: {display: "Expense", type: "select", references: "expense"}
        },
        fields_editable: ["from_location", "to_location", "activity_id", "kms", "expense_id"],
        fields_list: ["from_location", "to_location", "activity", "kms", "expense"],
        slug: "date",
        order_by: "-date"
    }
};

app.get('/', function(req, res) {
    //res.render('index');
    res.render('pages/auth');
});

app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

app.get('/auth/google',
  passport.authenticate('google', { scope : ['profile', 'email'] }));

app.get('/redirect',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.get('/about',
    authenticationMiddleware(),
function(req, res) {
    res.send('Testing testing 1 2 3');
});

con.connect(function(err) {
    if (err) {
        console.log(err.sqlMessage);
    }
    else {
        console.log("Connected to database");
    }
});

app.post('/invoice/delete/:id', function(req, res) {
    authenticationMiddleware(),

    sql = "DELETE FROM invoice WHERE id = ?"
    con.query(sql, [req.params.id]);

    res.redirect('/invoices');
});


app.get('/:table/list',
    authenticationMiddleware(),

    function(req, res) {
    table = tables[req.params.table];

    view = table.hasOwnProperty("view") ? table.view : req.params.table;
    order_by = table.hasOwnProperty("order_by") ? table.order_by : table.slug;

    sql = "SELECT * FROM ?? ORDER BY " + order_by;

    con.query(sql, [view], function(err, results) {
        res.render("objs", {table: table, table_name: req.params.table, objs: results});
    });
})

app.get('/:table/:id/edit',
    authenticationMiddleware(),
function(req, res) {
    table = tables[req.params.table];
    view = table.hasOwnProperty("view") ? table.view : req.params.table;

    ref_sqls = [];
    references = [];
    ref_table_names = [];
    for (var k in table.fields) {
        if (table.fields[k].hasOwnProperty("references")) {
            ref_sqls.push("SELECT id, ?? AS slug FROM ??");
            ref = table.fields[k].references;
            references.push(tables[ref].slug);
            references.push(ref);
            ref_table_names.push(ref);
        }
    }

    nsqls = ref_sqls.length;
    ref_sql = ref_sqls.join("; ");

    con.query(ref_sql, references, function(err, ref_results) {
        // Doesn't matter if this query fails (e.g. if ref_sql is empty)

        // "refs" includes all "SELECT *" results from tables to populate select boxes
        if (nsqls == 1) {
            ref_results = [ref_results]; // Make sure the following map works
        }

        refs = Object.fromEntries(ref_table_names.map((k, i) => [k, ref_results[i]]));
        if (req.params.id == "new") {
            obj = {};
            for (var k in table.fields) {
                obj[k] = "";
            }
            obj.id = "new";
            res.render('obj', {table: table, table_name: req.params.table, obj: obj, refs: refs});
        } else {
            sql = "SELECT * FROM ?? WHERE id = ?";
            con.query(sql, [view, req.params.id], function(err, results) {
                if (err) {
                    console.log(err);
                    res.sendStatus(404);
                } else if (results.length == 0) {
                    res.sendStatus(404);
                } else {
                    obj = results[0];
                    res.render('obj', {table: table, table_name: req.params.table, obj: obj});
                }
            });
        }
    });
});


app.post('/:table/:id/delete',
    authenticationMiddleware(),
function(req, res) {
    sql = "DELETE FROM ?? WHERE id = ?"
    con.query(sql, [req.params.table, req.params.id]);

    res.redirect('/' + req.params.table + '/list');
});

app.post('/:table/:id/edit',
    authenticationMiddleware(),
function(req, res) {
    table = tables[req.params.table];
    if (table.hasOwnProperty("validationFunc")) {
        if (table.validationFunc(req.body) == false) {
            return;
        }
    }

    data = req.body;
    table.fields_editable.forEach(function(k) {
        // Ensure checkbox values are always present
        if (table.fields[k].type == "checkbox") {
            data[k] = req.body.hasOwnProperty(k) ? 1 : 0;
        }

        // Force all empty strings to be nulls
        if (data[k].length == 0) {
            data[k] = null;
        }
    });

    if (req.params.id == "new") {
        sql = "INSERT INTO ?? (??) VALUES (?)"
        con.query(sql, [req.params.table, Object.keys(data), Object.values(data)], function(err, result) {
            if (err) {
                console.log(err);
                res.redirect('/' + req.params.table + '/list');
            } else {
                res.redirect('/' + req.params.table + '/' + result.insertId + '/edit');
            }
        });
    } else {
        sql = "UPDATE ?? SET ? WHERE id = ?";
        con.query(sql, [req.params.table, data, req.params.id], function(err) {
            if (err) {
                console.log(err);
                res.redirect('/' + req.params.table + '/list');
            } else {
                res.redirect('/' + req.params.table + '/' + req.params.id + '/edit');
            }
        });
    }
})


app.get('/invoices',
    authenticationMiddleware(),
function(req, res) {
    let sql = "SELECT * FROM invoice_view ORDER BY -issued"
    con.query(sql, function(err, result, field) {
        if (err) {
            console.log(err);
        }

        res.render('invoices', {invoices: result});
    });
});

app.get('/invoices/pdf/:pdf',
    authenticationMiddleware(),
function(req, res) {
    var filename = "invoices/" + req.params.pdf;

    fs.readFile(filename, function (err, data) {
        if (err) {
            console.error(err);
            res.sendStatus(400);
        } else {
            // Set the "viewed" flag in the database
            sql = "UPDATE invoice SET pdf_viewed = true WHERE pdf = ?";
            con.query(sql, [req.params.pdf], function(err) {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                } else {
                    // Serve the pdf
                    res.contentType("application/pdf");
                    res.send(data);
                }
            });
        }
    });
});

function issue_pdf(invoice) {
    var mailOptions = {
        from: invoice.email,
        to: invoice.bill_email,
        subject: "Invoice for " + invoice.name,
        text: invoice.email_text,
        attachments: [{
            filename: invoice.pdf,
            path: 'invoices/' + invoice.pdf
        }]
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.error("Email not sent: " + err);
        } else {
            console.log("Invoice " + invoice.name + " sent to " + invoice.bill_email + ": " + info.response);

            sql = "UPDATE invoice SET issued = ? WHERE id = ?";
            con.query(sql, [today(), invoice.id], function(err) {
                if (err) {
                    console.error("Invoice issued, but issued date not updated in database: " + err);
                }
            });
        }
    });
}

function generate_pdf(invoice, activities) {
    fs.readFile('invoices/template.tex', (err, template) => {
        if (err) {
            console.error(err);
            return false;
        } else {
            // Replace all the keywords in template with values drawn from the invoice
            template = template.toString("utf8");
            template = template.replace("<bsb>", invoice.bsb);
            template = template.replace("<number>", invoice.number);
            template = template.replace("<account_name>", invoice.account_name);
            template = template.replaceAll("<total_amount>", invoice.total_amount);
            template = template.replace("<issued>", today());
            template = template.replace("<due>", invoice.due);
            template = template.replace("<name>", invoice.name);
            template = template.replace("<bill_to_name>", invoice.bill_to_name);
            template = template.replace("<billing_name>", invoice.billing_name);
            template = template.replace("<email>", invoice.email);
            template = template.replace("<phone>", invoice.phone);
            template = template.replace("<addr1>", invoice.addr1);
            template = template.replace("<addr2>", invoice.addr2);
            template = template.replace("<abn_display>", invoice.abn_display);

            // Add in the activities
            activities.forEach(function(activity) {
                // Sanitize (via escaping) any instances of '$' in the description for LaTeX's benefit
                description = activity.description.replaceAll("$", "\\$");

                // Construct the LaTeX table row
                row = activity.date + " & $" + activity.qty + "\\times$ & \\$" + activity.rate + " & " + description + " & \\$" + activity.amount + " \\\\ \\hline\n<activity>"
                template = template.replace("<activity>", row);
            });
            // Now remove the "<activity>" marker
            template = template.replace("<activity>", "");

            // Convert string to stream to pass to node-latex
            // https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
            const input = new Readable;
            input.push(template);
            input.push(null);

            // https://www.npmjs.com/package/node-latex
            var filename;
            if (invoice.pdf) {
                filename = invoice.pdf;
            } else {
                // Generate safe, unique filename
                filename = invoice.name.replaceAll(" ", "-"); // First, replace spaces with hyphens
                filename = filename.replace(/[^a-zA-Z0-9_-]/g, ""); // Then remove all non-conforming characters
                filename = invoice.id + "-" + filename + ".pdf";
            }

            filepath = "invoices/" + filename;
            console.log("Writing PDF to " + filepath);
            const output = fs.createWriteStream(filepath);
            latex(input).pipe(output);

            // Record the new pdf filename to the database
            sql = "UPDATE invoice SET pdf = ? WHERE id = ?";
            con.query(sql, [filename, invoice.id], function(err) {
                if (err) {
                    console.error(err);
                    return false;
                }
            });
        }
    });

    return true;
}

app.post('/invoice/:id',
    authenticationMiddleware(),
function(req, res) {
    // Two cases: "id" is an existing invoice id, or "id" = "new"
    if (req.params.id == "new") {
        values = [req.body.name,
            req.body.client_id,
            req.body.billing_id,
            req.body.account_id,
            null,
            null];

        // Insert new invoice
        sql = "INSERT INTO invoice (name, bill_to, billing_id, account_id, due, paid, created) VALUES (?)"
        values.push(today());

        con.query(sql, [values], function(err, result) {
            if (err) {
                console.log(err);
                res.redirect("/invoices");
            } else {
                res.redirect("/invoice/" + result.insertId);
            }
        });
    } else {
        // Turn empty date strings into nulls
        due = req.body.due.length > 0 ? req.body.due : null;
        paid = req.body.paid.length > 0 ? req.body.paid : null;

        values = [req.body.name,
            req.body.client_id,
            req.body.billing_id,
            req.body.account_id,
            due,
            paid];

        // Update existing invoice
        sql = "UPDATE invoice SET name = ?, bill_to = ?, billing_id = ?, account_id = ?, due = ?, paid = ? WHERE id = ?";

        values.push(req.params.id);

        con.query(sql, values, function(err) {
            if (err) console.log(err);
        });

        res.redirect('/invoice/' + req.params.id);

        // Generate/update/send PDF
        sql = "SELECT * FROM invoice_view WHERE id = ?; SELECT * FROM invoice_item_view WHERE invoice_id = ?";
        con.query(sql, [req.params.id, req.params.id], function(err, results) {
            if (err) {
                return false;
            }

            invoice = results[0][0];
            activities = results[1];

            if (req.body.hasOwnProperty("issue_pdf")) {
                issue_pdf(invoice);
            } else {
                generate_pdf(invoice, activities);
                sql = "UPDATE invoice SET pdf_viewed = false WHERE id = ?";
                con.query(sql, [req.params.id]);
            }
        });
    }
});

app.get('/invoice/:id',
    authenticationMiddleware(),
function(req, res) {
    // Prepare a few queries
    sql_clients = "SELECT * FROM client";
    sql_billings = "SELECT * FROM billing";
    sql_accounts = "SELECT * FROM account";

    // If "id" is existing invoice id, display invoice,
    // but if "id" = "new", display empty form

    if (req.params.id == "new") {
        sql = sql_clients;
        sql += "; " + sql_billings;
        sql += "; " + sql_accounts;

        con.query(sql, function(err, results, field) {
            if (err) {
                console.log(err);
            }

            context = {
                invoice: {id: "new"},
                activities: [],
                clients: results[0],
                billings: results[1],
                accounts: results[2]
            };

            res.render('invoice', context);
        });
    } else {
        // Find the matching invoice
        sql = "SELECT * FROM invoice_view WHERE id = ?";
        sql += "; SELECT * FROM invoice_item_view WHERE invoice_id = ?";
        sql += "; " + sql_clients;
        sql += "; " + sql_billings;
        sql += "; " + sql_accounts;

        con.query(sql, [req.params.id, req.params.id], function(err, results, field) {
            if (err) {
                console.log(err);
                res.sendStatus(404);
            } else {
                if (results[0].length == 0) {
                    res.sendStatus(404);
                } else {
                    context = {
                        invoice: results[0][0], // There can only be 1 invoice
                        activities: results[1],
                        clients: results[2],
                        billings: results[3],
                        accounts: results[4]
                    };

                    res.render('invoice', context)
                }
            }
        });
    }
})


app.get('/add_invoice_item/:invoice_id',
    authenticationMiddleware(),
function (req, res) {
    sql1 = "SELECT * FROM invoice_item_view ORDER BY date DESC";
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


app.post('/add_invoice_item/:invoice_id',
    authenticationMiddleware(),
    function(req, res) {
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

