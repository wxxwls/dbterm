import express from 'express';
import { selectSql, createSql } from '../database/sql';

const router = express.Router();

router.get('/bookSearch', async (req, res) => {
    const books = await selectSql.getBook();
    res.render('bookSearch', {
        title: 'Search Books',
        books,
        searchResult: null,
        searchConditions: {},
    });
});

router.post('/bookSearch', async (req, res) => {
    const { title, authorName, awardName } = req.body;

    let searchResult = [];
    let searchConditions = { title, authorName, awardName };

    if (title) {
        searchResult = await selectSql.searchBookByTitle(title);
    } else if (authorName) {
        searchResult = await selectSql.searchBookByAuthorName(authorName);
    } else if (awardName) {
        searchResult = await selectSql.searchBookByAwardName(awardName);
    }

    res.render('bookSearch', {
        title: 'Search Books',
        books: [],
        searchResult,
        searchConditions,
    });
});

router.post('/reservation', async (req, res) => {
    const { bookId, pickupTime } = req.body;
    const userEmail = req.session.user.id;

    if (!userEmail) {
        return res.json({ success: false, message: 'User not logged in.' });
    }

    try {
        await createSql.addReservation({ userEmail, bookId, pickupTime });
        res.json({ success: true });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.json({ success: false, message: 'Failed to create reservation.' });
    }
});

export default router;
