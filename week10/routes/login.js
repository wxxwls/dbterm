import express from "express";
import { selectSql } from "../database/sql";

const router = express.Router();

router.get('/', (req, res) => {
    res.render('login');
});

router.post('/', async (req, res) => {
    const vars = req.body;
    const users = await selectSql.getUser();

    users.map((user) => {
        console.log('ID :', user.Email);
        if (vars.id === user.Email && vars.password === user.Password) {
            console.log('login success!');
            req.session.user = { id: user.Email, role: user.Role, checkLogin: true };
        }
    });

    if (req.session.user == undefined) {
        console.log('login failed!');
        res.send(`<script>
                    alert('login failed!');
                    location.href='/';
                </script>`)
    } else if (req.session.user.checkLogin && req.session.user.role === 'Admin') {
        res.redirect('/admin');
    } else if (req.session.user.checkLogin && req.session.user.role === 'Customer') {
        res.redirect('/customer');
    }
});

module.exports = router;
