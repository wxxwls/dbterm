import express from "express";
import { selectSql, createSql } from "../database/sql";

const router = express.Router();

// 로그인 상태 확인 미들웨어
function checkLoggedIn(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "User not logged in." });
    }
    next();
}

router.get("/bookSearch", async (req, res) => {
    const books = await selectSql.getBooknumber();
    res.render("bookSearch", {
        title: "Search Books",
        books,
        searchResult: null,
        searchConditions: {},
    });
});

router.post("/bookSearch", async (req, res) => {
    const { title, authorName, awardName } = req.body;

    let searchResult = [];
    let searchConditions = { title, authorName, awardName };

    if (title) {
        searchResult = await selectSql.searchBookByTitle(title);
    } else if (authorName) {
        searchResult = await selectSql.searchBookByAuthorName(authorName);
    } else if (awardName) {
        searchResult = await selectSql. searchBookByAwardName(awardName);
    }

    res.render("bookSearch", {
        title: "Search Books",
        books: [],
        searchResult,
        searchConditions,
    });
});

// 예약 처리 라우트 (로그인 상태 확인 추가)
router.post("/reservation", checkLoggedIn, async (req, res) => {
    const { bookId, pickupTime } = req.body;
    const userEmail = req.session.user.id; // 로그인된 사용자의 이메일

    const books = await selectSql.getBooknumber();
    const book = books.find((b) => b.ISBN === bookId);

    if (!book || book.Total_Stock <= 0) {
        return res.json({ success: false, message: "Book out of stock." });
    }

    try {
        await createSql.addReservation({ userEmail, bookId, pickupTime });
        res.json({ success: true });
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.json({ success: false, message: "Failed to create reservation." });
    }
});

router.post("/addToCart", checkLoggedIn, async (req, res) => {
    const { bookId } = req.body; // 책 ID
    const userEmail = req.session.user.id; // 사용자 이메일

    const books = await selectSql.getBooknumber();
    const book = books.find((b) => b.ISBN === bookId);

    if (!book || book.Total_Stock <= 0) {
        return res.json({ success: false, message: "Book out of stock." });
    }

    try {
        await createSql.addToCart({ bookISBN: bookId, userEmail });
        res.json({ success: true });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.json({ success: false, message: "Failed to add to cart." });
    }
});
export default router;