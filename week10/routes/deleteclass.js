import express from 'express';
import { selectSql, deleteSql } from '../database/sql';

const router = express.Router();

router.get('/', async (req, res) => {
    if (req.session.user != undefined && req.session.user.role === 'student') {
        const student_class = await selectSql.getstudentclass();
        res.render('deleteclass', {
            title: "Delete class",
            student_class,
        });
    } else{
        res.redirect('/');
    }
});

router.post('/', async (req, res) => {
    console.log("delete :", req.body.delBtn);
    const data = {
        Class_Id: req.body.delBtn, 
    };

    await deleteSql.deletestudentclass(data);

    res.redirect('/delete/class');
});

module.exports = router;

