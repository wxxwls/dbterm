const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('customer', { title: '고객 페이지' }); 
});

module.exports = router;
