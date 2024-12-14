const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('admin', { title: '관리자 페이지' }); 
});

module.exports = router;
