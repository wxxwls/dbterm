import express from "express";
import { selectSql, updateSql, deleteSql } from "../database/sql"; 

const router = express.Router();

// 장바구니 조회
router.get("/addcart", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/"); 
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

//장바구니 수량 수정
router.post("/addcart/update", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "User not logged in." });
    }

    const { bookISBN, quantity } = req.body;
    const userEmail = req.session.user.id;

    try {
        if (quantity <= 0) {
            await deleteSql.deletecart(bookISBN, userEmail); // 수량 0이면 삭제
        } else {
            await updateSql.updatecart({ bookISBN, userEmail, quantity }); // 수량 업데이트
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, message: "Failed to update cart." });
    }
});

// 장바구니 아이템 삭제
router.post("/addcart/remove", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "User not logged in." });
    }

    const { bookISBN } = req.body;
    const userEmail = req.session.user.id;

    try {
        await deleteSql.deletecart(bookISBN, userEmail); // 삭제 처리
        res.json({ success: true });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).json({ success: false, message: "Failed to remove item from cart." });
    }
});
export default router;
