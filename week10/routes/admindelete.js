import express from 'express';
import { selectSql, deleteSql } from '../database/sql';

const router = express.Router();

// 관리자 삭제 페이지 조회
router.get('/delete', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') {
        return res.redirect('/'); // 로그인하지 않거나 Admin이 아니면 홈으로 리다이렉트
    }

    const books = await selectSql.getBook();
    const authors = await selectSql.getAuthor();
    const awards = await selectSql.getAward();
    const warehouses = await selectSql.getWarehouse();
    const inventories = await selectSql.getInventory();
    const contains = await selectSql.getContains();

    res.render('admindelete', {
        title: 'Admin Delete Page',
        books,
        authors,
        awards,
        warehouses,
        inventories,
        contains,
    });
});

// 삭제 요청 처리
router.post('/delete', async (req, res) => {
    const { tableName, identifier1, identifier2 } = req.body; // identifier1은 기본 식별자, identifier2는 조합 키에 사용

    if (tableName === 'Book') {
        await deleteSql.deleteBook(identifier1);
    } else if (tableName === 'Author') {
        await deleteSql.deleteAuthor(identifier1);
    } else if (tableName === 'Award') {
        await deleteSql.deleteAward(identifier1);
    } else if (tableName === 'Warehouse') {
        await deleteSql.deleteWarehouse(identifier1);
    } else if (tableName === 'Inventory') {
        await deleteSql.deleteInventory(identifier1, identifier2);
    } else if (tableName === 'Contains') {
        await deleteSql.deleteContains(identifier1, identifier2);
    }

    res.redirect('/admin/delete'); // 삭제 후 페이지 새로고침
});

export default router;
