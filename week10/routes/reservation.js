import express from "express";
import { selectSql, updateSql, deleteSql } from "../database/sql";

const router = express.Router();

// 예약 내역 조회 및 업데이트/취소 처리
router.get("/reservation", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "Customer") {
        return res.redirect("/"); // 로그인 확인
    }

    const userEmail = req.session.user.id;

    try {
        const reservations = await selectSql.getReservationsByEmail(userEmail);
        res.render("reservation", {
            title: "My Reservations",
            reservations,
        });
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).send("Error fetching reservations.");
    }
});

// Pickup Time 업데이트 (POST)
router.post("/reservation/update", async (req, res) => {
    const { reservationId, pickupTime } = req.body;

    try {
        await updateSql.updatePickupTime({ reservationId, pickupTime });
        res.redirect("/customer/reservation");
    } catch (error) {
        console.error("Error updating pickup time:", error);
        res.status(500).send("Error updating pickup time.");
    }
});

// 예약 취소 (POST)
router.post("/reservation/cancel", async (req, res) => {
    const { reservationId } = req.body;

    try {
        await deleteSql.deleteReservation(reservationId);
        res.redirect("/customer/reservation");
    } catch (error) {
        console.error("Error cancelling reservation:", error);
        res.status(500).send("Error cancelling reservation.");
    }
});

export default router;