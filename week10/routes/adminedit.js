import express from 'express';
import { selectSql, updateSql, promisePoolConnection } from '../database/sql'; 

const router = express.Router();

// 관리자 수정 페이지 조회
router.get('/edit', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') {
        return res.redirect('/'); 
    }

    try {
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
    } catch (error) {
        console.error('데이터 조회 중 오류 발생:', error);
        res.status(500).send('데이터 조회 중 오류가 발생했습니다.');
    }
});

//관리제 페이지 수정 요청 처리
router.post('/edit', async (req, res) => {
    const connection = await promisePoolConnection.getConnection(); // 데이터베이스 연결 가져오기
    const { tableName, ...data } = req.body; // 수정할 테이블 이름 및 데이터

    try {
        await connection.beginTransaction(); // 트랜잭션 시작

        if (tableName === 'Book') {
            const [rows] = await connection.query(
                `SELECT * FROM Book WHERE ISBN = ? FOR UPDATE`,
                [data.ISBN]
            );
            if (rows.length === 0) throw new Error('수정하려는 Book 데이터가 존재하지 않습니다.');
            await updateSql.updateBook(connection, data);
        } else if (tableName === 'Author') {
            const [rows] = await connection.query(
                `SELECT * FROM Author WHERE ID = ? FOR UPDATE`,
                [data.ID]
            );
            if (rows.length === 0) throw new Error('수정하려는 Author 데이터가 존재하지 않습니다.');
            await updateSql.updateAuthor(connection, data);
        } else if (tableName === 'Award') {
            const [rows] = await connection.query(
                `SELECT * FROM Award WHERE ID = ? FOR UPDATE`,
                [data.ID]
            );
            if (rows.length === 0) throw new Error('수정하려는 Award 데이터가 존재하지 않습니다.');
            await updateSql.updateAward(connection, data);
        } else if (tableName === 'Warehouse') {
            const [rows] = await connection.query(
                `SELECT * FROM Warehouse WHERE Code = ? FOR UPDATE`,
                [data.Code]
            );
            if (rows.length === 0) throw new Error('수정하려는 Warehouse 데이터가 존재하지 않습니다.');
            await updateSql.updateWarehouse(connection, data);
        } else if (tableName === 'Inventory') {
            const [rows] = await connection.query(
                `SELECT * FROM Inventory WHERE Book_ISBN = ? AND Warehouse_Code = ? FOR UPDATE`,
                [data.Book_ISBN, data.Warehouse_Code]
            );
            if (rows.length === 0) throw new Error('수정하려는 Inventory 데이터가 존재하지 않습니다.');
            await updateSql.updateInventory(connection, data);
        } else if (tableName === 'Contains') {
            const [rows] = await connection.query(
                `SELECT * FROM Contains WHERE Book_ISBN = ? AND Shopping_basket_BasketID = ? FOR UPDATE`,
                [data.Book_ISBN, data.Shopping_basket_BasketID]
            );
            if (rows.length === 0) throw new Error('수정하려는 Contains 데이터가 존재하지 않습니다.');
            await updateSql.updateContains(connection, data);
        } else {
            throw new Error('지원하지 않는 테이블 이름입니다.');
        }

        await connection.commit(); // 트랜잭션 커밋
        res.redirect('/admin/edit'); // 수정 후 페이지 새로고침
    } catch (error) {
        await connection.rollback(); // 실패 시 롤백
        console.error('데이터 수정 중 오류 발생:', error);
        res.status(500).send('데이터 수정 중 오류가 발생했습니다.');
    } finally {
        connection.release(); // 연결 반환
    }
});

export default router;
