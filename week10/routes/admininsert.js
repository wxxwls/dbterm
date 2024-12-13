import express from 'express';
import { selectSql, createSql } from '../database/sql'; // SQL 모듈 임포트

const router = express.Router();

// 관리자 페이지 GET 요청 (데이터 조회)
router.get('/insert', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') {
        return res.redirect('/'); // 로그인하지 않거나 Admin이 아니면 홈으로 리다이렉트
    }

    const books = await selectSql.getBook();
    const authors = await selectSql.getAuthor();
    const awards = await selectSql.getAward();
    const warehouses = await selectSql.getWarehouse();
    const inventories = await selectSql.getInventory();
    const contains = await selectSql.getContains();

    res.render('admininsert', {
        title: 'Admin Insert Page',
        books,
        authors,
        awards,
        warehouses,
        inventories,
        contains,
    });
});

// 관리자 페이지 POST 요청 (데이터 삽입)
router.post('/insert', async (req, res) => {
    const { tableName } = req.body; // tableName 추출

    // 테이블별로 다른 데이터를 처리
    if (tableName === 'Book') {
        const { ISBN, Title, Year, Category, Price, Author_ID } = req.body;
        await createSql.addBook({ ISBN, Title, Year, Category, Price, Author_ID });
    } else if (tableName === 'Author') {
        const { ID, Name, URL, Address } = req.body; // ID 필드 추가
        await createSql.addAuthor({ ID, Name, URL, Address });
    } else if (tableName === 'Award') {
        const { ID, Name, Year, Author_ID, Book_ISBN } = req.body; // ID 필드 추가
        await createSql.addAward({ ID, Name, Year, Author_ID, Book_ISBN });
    } else if (tableName === 'Warehouse') {
        const { Code, Address, Phone } = req.body;
        await createSql.addWarehouse({ Code, Address, Phone });
    } else if (tableName === 'Inventory') {
        const { Book_ISBN, Warehouse_Code, Number } = req.body; // Number 필드 추가
        await createSql.addInventory({ Book_ISBN, Warehouse_Code, Number });
    } else if (tableName === 'Contains') {
        const { Book_ISBN, Shopping_basket_BasketID, Number } = req.body; // Number 필드 추가
        await createSql.addContains({ Book_ISBN, Shopping_basket_BasketID, Number });
    }

    res.redirect('/admin/insert'); // 삽입 후 페이지 새로고침
});


export default router;
