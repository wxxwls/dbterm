import express from 'express';
import { selectSql, createSql } from '../database/sql'; 

const router = express.Router();

// 관리자 삽입 페이지 조회
router.get('/insert', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') {
        return res.redirect('/'); 
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

// 관리자 페이지 삽입 요청 처리
router.post('/insert', async (req, res) => {
    const { tableName } = req.body; 

   
    if (tableName === 'Book') {
        const { ISBN, Title, Year, Category, Price, Author_ID } = req.body;
        await createSql.addBook({ ISBN, Title, Year, Category, Price, Author_ID });
    } else if (tableName === 'Author') {
        const { ID, Name, URL, Address } = req.body; 
        await createSql.addAuthor({ ID, Name, URL, Address });
    } else if (tableName === 'Award') {
        const { ID, Name, Year, Author_ID, Book_ISBN } = req.body; 
        await createSql.addAward({ ID, Name, Year, Author_ID, Book_ISBN });
    } else if (tableName === 'Warehouse') {
        const { Code, Address, Phone } = req.body;
        await createSql.addWarehouse({ Code, Address, Phone });
    } else if (tableName === 'Inventory') {
        const { Book_ISBN, Warehouse_Code, Number } = req.body; 
        await createSql.addInventory({ Book_ISBN, Warehouse_Code, Number });
    } else if (tableName === 'Contains') {
        const { Book_ISBN, Shopping_basket_BasketID, Number } = req.body; 
        await createSql.addContains({ Book_ISBN, Shopping_basket_BasketID, Number });
    }

    res.redirect('/admin/insert'); 
});


export default router;
