import express from 'express';
import { selectSql, updateSql } from '../database/sql'; // SQL 모듈 임포트

const router = express.Router();

// 관리자 페이지 GET 요청 (데이터 조회)
router.get('/edit', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') {
        return res.redirect('/'); // 로그인하지 않거나 Admin이 아니면 홈으로 리다이렉트
    }

    const books = await selectSql.getBook();
    const authors = await selectSql.getAuthor();
    const awards = await selectSql.getAward();
    const warehouses = await selectSql.getWarehouse();
    const inventories = await selectSql.getInventory();
    const contains = await selectSql.getContains();

    res.render('adminedit', {
        title: 'Admin Edit Page',
        books,
        authors,
        awards,
        warehouses,
        inventories,
        contains,
    });
});

// 관리자 페이지 POST 요청 (데이터 수정)
router.post('/edit', async (req, res) => {
    const { tableName } = req.body; // tableName 추출

    // 테이블별로 다른 데이터를 처리
    if (tableName === 'Book') {
        const { ISBN, Title, Year, Category, Price, Author_ID } = req.body;
        await updateSql.updateBook({ ISBN, Title, Year, Category, Price, Author_ID });
    } else if (tableName === 'Author') {
        const { ID, Name, URL, Address } = req.body;
        await updateSql.updateAuthor({ ID, Name, URL, Address });
    } else if (tableName === 'Award') {
        const { ID, Name, Year, Author_ID, Book_ISBN } = req.body;
        await updateSql.updateAward({ ID, Name, Year, Author_ID, Book_ISBN });
    } else if (tableName === 'Warehouse') {
        const { Code, Address, Phone } = req.body;
        await updateSql.updateWarehouse({ Code, Address, Phone });
    } else if (tableName === 'Inventory') {
        const { Book_ISBN, Warehouse_Code, Number } = req.body;
        await updateSql.updateInventory({ Book_ISBN, Warehouse_Code, Number });
    } else if (tableName === 'Contains') {
        const { Book_ISBN, Shopping_basket_BasketID, Number } = req.body;
        await updateSql.updateContains({ Book_ISBN, Shopping_basket_BasketID, Number });
    }

    res.redirect('/admin/edit'); // 수정 후 페이지 새로고침
});

export default router;
