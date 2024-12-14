import express from "express";
import { selectSql, createSql } from "../database/sql"; // SQL 모듈 임포트

const router = express.Router();

// 장바구니에 책 추가
router.post("/addcart", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "User not logged in." });
    }

    const { bookISBN } = req.body;
    const userEmail = req.session.user.id;

    try {
        await createSql.addToCart({ bookISBN, userEmail });
        res.json({ success: true, message: "Book added to cart successfully!" });
    } catch (error) {
        console.error("Error adding book to cart:", error);
        res.status(500).json({ success: false, message: "Failed to add book to cart." });
    }
});

// 장바구니 조회
router.get("/addcart", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/"); // 로그인 확인
    }

    const userEmail = req.session.user.id;

    try {
        const cartItems = await selectSql.getCartItems(userEmail);
        res.render("addcart", {
            title: "My Cart",
            cartItems,
        });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).send("Error fetching cart items.");
    }
});

export default router;
