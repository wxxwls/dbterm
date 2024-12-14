import express from "express";
import { selectSql, deleteSql, updateSql } from "../database/sql";

const router = express.Router();

// 구매 처리
router.post("/buy", async (req, res) => {
    try {
        // 로그인 확인
        if (!req.session?.user?.id) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not logged in" });
        }

        const userEmail = req.session.user.id;

        // 장바구니 항목 가져오기
        const cartItems = await selectSql.getCartItems(userEmail);
        if (!cartItems.length) {
            return res.json({ success: false, message: "Your cart is empty." });
        }

        // 재고 확인 및 창고 재고 차감
        for (const item of cartItems) {
            let remainingQuantity = item.Number; // 필요한 수량
            const warehouses = await selectSql.getInventoryByBookISBN(item.Book_ISBN); // 창고별 재고 가져오기

            for (const warehouse of warehouses) {
                if (remainingQuantity <= 0) break;

                const reduceQuantity = Math.min(warehouse.Number, remainingQuantity); // 줄일 수 있는 최대 수량
                await updateSql.updatebuy({
                    Book_ISBN: item.Book_ISBN,
                    Warehouse_Code: warehouse.Warehouse_Code,
                    Number: warehouse.Number - reduceQuantity,
                });

                remainingQuantity -= reduceQuantity; // 남은 수량 업데이트
            }

            if (remainingQuantity > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for "${item.Title}".`,
                });
            }
        }

        // 구매 요약 정보를 세션에 저장
        req.session.purchaseSummary = {
            cartItems,
            total: cartItems.reduce((sum, item) => sum + item.Price * item.Number, 0),
        };

        // 장바구니 비우기
        await deleteSql.clearCart(userEmail);

        res.json({ success: true, message: "Purchase completed successfully." });
    } catch (error) {
        console.error("Error processing purchase:", error);
        res.status(500).json({ success: false, message: "Failed to complete purchase." });
    }
});



// 구매 완료 페이지
router.get("/buy", async (req, res) => {
    try {
        if (!req.session || !req.session.user || !req.session.user.id) {
            return res.redirect("/");
        }

        // 구매 요약 정보를 세션에서 가져오기
        const { cartItems, total } = req.session.purchaseSummary || { cartItems: [], total: 0 };
        console.log("Cart Items for Summary Page:", cartItems);
        console.log("Total Amount:", total);

        res.render("buy", {
            title: "Purchase Summary",
            date: new Date().toLocaleString(),
            total: total.toFixed(2), // 소수점 두 자리
            cartItems, // 구매한 책 목록
        });

        // 구매 요약 정보 세션에서 제거 (원하지 않을 경우 제거 생략 가능)
        delete req.session.purchaseSummary;
    } catch (error) {
        console.error("Error fetching purchase details:", error);
        res.status(500).send("Error fetching purchase details.");
    }
});

export default router;
