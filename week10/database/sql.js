    import mysql from 'mysql2';

    require("dotenv").config();

    const pool = mysql.createPool({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'Woojinop22!',
        database: 'bookstore',
    });

    const promisePool = pool.promise();

    export const selectSql = {
        getUser: async () => {
            const sql = `select * from user`;
            const [result] = await promisePool.query(sql);
            return result;
        },
        getBook: async () => {
            const sql = `select * from Book`;
            const [result] = await promisePool.query(sql);
            return result;
        },
        getAuthor: async () => {
            const sql = `select * from Author`;
            const [result] = await promisePool.query(sql);
            return result;
        },
        getAward: async () => {
            const sql = `select * from Award`;
            const [result] = await promisePool.query(sql);
            return result;
        },
        getWarehouse: async () => {
            const sql = `select * from Warehouse`;
            const [result] = await promisePool.query(sql);
            return result;
        },
        getInventory: async () => {
            const sql = `select * from Inventory`;
            const [result] = await promisePool.query(sql);
            return result;
        },
        getContains: async () => {
            const sql = `select * from Contains`;
            const [result] = await promisePool.query(sql);
            return result;
        },  
        searchBookByTitle: async (title) => {
            const sql = `SELECT * FROM Book WHERE Title LIKE ?`;
            const [result] = await promisePool.query(sql, [`%${title}%`]);
            return result;
        },
        searchBookByAuthorName: async (authorName) => {
            const sql = `
                SELECT B.* 
                FROM Book B 
                JOIN Author A ON B.Author_ID = A.ID 
                WHERE A.Name LIKE ?`;
            const [result] = await promisePool.query(sql, [`%${authorName}%`]);
            return result;
        },
        searchBookByAwardName: async (awardName) => {
            const sql = `
                SELECT B.* 
                FROM Book B 
                JOIN Award AW ON B.ISBN = AW.Book_ISBN 
                WHERE AW.Name LIKE ?`;
            const [result] = await promisePool.query(sql, [`%${awardName}%`]);
            return result;
        },
        // 추가된 getReservationsByEmail
        getReservationsByEmail: async (email) => {
            const sql = `
                SELECT 
                    Reservation.ID, 
                    Reservation.Reservation_date, 
                    Reservation.Pickup_time, 
                    Reservation.Book_ISBN, 
                    Book.Title AS Book_Title
                FROM 
                    Reservation
                JOIN 
                    Book ON Reservation.Book_ISBN = Book.ISBN
                WHERE 
                    Reservation.User_Email = ?;
            `;
            const [result] = await promisePool.query(sql, [email]);
            return result;
        },
        getBooknumber: async () => {
            const sql = `
                SELECT 
                    B.ISBN,
                    MAX(B.Title) AS Title, 
                    MAX(B.Category) AS Category, 
                    MAX(B.Year) AS Year, 
                    MAX(B.Price) AS Price,
                    IFNULL(SUM(I.Number), 0) AS Total_Stock
                FROM 
                    Book B
                LEFT JOIN 
                    Inventory I ON B.ISBN = I.Book_ISBN
                GROUP BY 
                    B.ISBN;
            `;
            const [result] = await promisePool.query(sql);
            return result;
        },
        getCartItems: async (userEmail) => {
            const sql = `
                SELECT C.Book_ISBN, B.Title, B.Price, C.Number
                FROM Contains C
                JOIN Book B ON C.Book_ISBN = B.ISBN
                WHERE C.Shopping_basket_BasketID = (
                    SELECT BasketID FROM Shopping_basket WHERE User_Email = ?
                );
            `;
            try {
                const [rows] = await promisePool.query(sql, [userEmail]);
                return rows;
            } catch (error) {
                console.error("Error in getCartItems:", error);
                throw error;
            }
        },
        getBookStock: async (bookISBN) => {
            const sql = `
                SELECT IFNULL(SUM(Number), 0) AS Stock
                FROM Inventory
                WHERE Book_ISBN = ?
            `;
            const [rows] = await promisePool.query(sql, [bookISBN]);
            return rows[0].Stock;
        },
        
    };

    export const createSql = {
        addBook: async (data) => {
            const sql = `
                INSERT INTO Book (ISBN, Title, Year, Category, Price, Author_ID)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [result] = await promisePool.query(sql, [
                data.ISBN,
                data.Title,
                data.Year,
                data.Category,
                data.Price,
                data.Author_ID,
            ]);
            return result;
        },
        addAuthor: async (data) => {
            const sql = `
                INSERT INTO Author (ID, Name, URL, Address)
                VALUES (?, ?, ?, ?)
            `;
            const [result] = await promisePool.query(sql, [
                data.ID,
                data.Name,
                data.URL,
                data.Address,
            ]);
            return result;
        },
        addAward: async (data) => {
            const sql = `
                INSERT INTO Award (ID, Name, Year, Author_ID, Book_ISBN)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await promisePool.query(sql, [
                data.ID,
                data.Name,
                data.Year,
                data.Author_ID,
                data.Book_ISBN,
            ]);
            return result;
        },
        addWarehouse: async (data) => {
            const sql = `
                INSERT INTO Warehouse (Code, Address, Phone)
                VALUES (?, ?, ?)
            `;
            const [result] = await promisePool.query(sql, [
                data.Code,
                data.Address,
                data.Phone,
            ]);
            return result;
        },
        addInventory: async (data) => {
            const sql = `
                INSERT INTO Inventory (Book_ISBN, Warehouse_Code, Number)
                VALUES (?, ?, ?)
            `;
            const [result] = await promisePool.query(sql, [
                data.Book_ISBN,
                data.Warehouse_Code,
                data.Number
            ]);
            return result;
        },
        addContains: async (data) => {
            const sql = `
                INSERT INTO Contains (Book_ISBN, Shopping_basket_BasketID, Number)
                VALUES (?, ?,?)
            `;
            const [result] = await promisePool.query(sql, [
                data.Book_ISBN,
                data.Shopping_basket_BasketID,
                data.Number
            ]);
            return result;
        },
        addReservation: async (data) => {
            const sql = `
                INSERT INTO Reservation (User_Email, Book_ISBN, Reservation_date, Pickup_time)
                VALUES (?, ?, NOW(), ?)
            `;
            const [result] = await promisePool.query(sql, [data.userEmail, data.bookId, data.pickupTime]);
            return result;
        },
        addToCart: async (data) => {
            const sql = `
                INSERT INTO Contains (Book_ISBN, Shopping_basket_BasketID, Number)
                VALUES (?, 
                    (SELECT BasketID FROM Shopping_basket WHERE User_Email = ? LIMIT 1), 
                    1
                )
                ON DUPLICATE KEY UPDATE Number = Number + 1;
            `;
            const [result] = await promisePool.query(sql, [data.bookISBN, data.userEmail]);
            return result;
        },
        
        
        
    };

    export const updateSql = {
        updateBook: async (data) => {
            const sql = `
                UPDATE Book
                SET Title = ?, Year = ?, Category = ?, Price = ?, Author_ID = ?
                WHERE ISBN = ?
            `;
            const [result] = await promisePool.query(sql, [
                data.Title,
                data.Year,
                data.Category,
                data.Price,
                data.Author_ID,
                data.ISBN,
            ]);
            return result;
        },
        updateAuthor: async (data) => {
            const sql = `
                UPDATE Author
                SET Name = ?, URL = ?, Address = ?
                WHERE ID = ?
            `;
            const [result] = await promisePool.query(sql, [
                data.Name,
                data.URL,
                data.Address,
                data.ID,
            ]);
            return result;
        },
        updateAward: async (data) => {
            const sql = `
                UPDATE Award
                SET Name = ?, Year = ?, Author_ID = ?, Book_ISBN = ?
                WHERE ID = ?
            `;
            const [result] = await promisePool.query(sql, [
                data.Name,
                data.Year,
                data.Author_ID,
                data.Book_ISBN,
                data.ID,
            ]);
            return result;
        },
        updateWarehouse: async (data) => {
            const sql = `
                UPDATE Warehouse
                SET Address = ?, Phone = ?
                WHERE Code = ?
            `;
            const [result] = await promisePool.query(sql, [
                data.Address,
                data.Phone,
                data.Code,
            ]);
            return result;
        },
        updateInventory: async (data) => {
            const sql = `
                UPDATE Inventory
                SET Number = ?
                WHERE Book_ISBN = ? AND Warehouse_Code = ?
            `;
            const [result] = await promisePool.query(sql, [
                data.Number,
                data.Book_ISBN,
                data.Warehouse_Code,
            ]);
            return result;
        },
        updateContains: async (data) => {
            const sql = `
                UPDATE Contains
                SET Number = ?
                WHERE Book_ISBN = ? AND Shopping_basket_BasketID = ?
            `;
            const [result] = await promisePool.query(sql, [
                data.Number,
                data.Book_ISBN,
                data.Shopping_basket_BasketID,
            ]);
            return result;
        },
        updatePickupTime: async (data) => {
            const sql = `
                UPDATE Reservation
                SET Pickup_time = ?
                WHERE ID = ?
            `;
            const [result] = await promisePool.query(sql, [data.pickupTime, data.reservationId]);
            return result;
        },
        updateCartQuantity: async (data) => {
            const sql = `
                UPDATE Contains
                SET Number = ?
                WHERE Book_ISBN = ? AND Shopping_basket_BasketID = (
                    SELECT BasketID FROM Shopping_basket WHERE User_Email = ? LIMIT 1
                );
            `;
            const [result] = await promisePool.query(sql, [data.newQuantity, data.bookISBN, data.userEmail]);
            return result;
        },
        updatecart: async (data) => {
            const sql = `
                UPDATE Contains
                SET Number = ?
                WHERE Book_ISBN = ? AND Shopping_basket_BasketID = (
                    SELECT BasketID FROM Shopping_basket WHERE User_Email = ?
                )
            `;
            const [result] = await promisePool.query(sql, [data.quantity, data.bookISBN, data.userEmail]);
            return result;
        },
        updatestock: async (data) => {
            const sql = `
                UPDATE Inventory
                SET Number = Number - ?
                WHERE Book_ISBN = ?
            `;
            const [result] = await promisePool.query(sql, [data.quantity, data.bookISBN]);
            return result;
        },
        
    };

    export const deleteSql = {
        deleteBook: async (ISBN) => {
            const sql = `DELETE FROM Book WHERE ISBN = ?`;
            const [result] = await promisePool.query(sql, [ISBN]);
            return result;
        },
        deleteAuthor: async (ID) => {
            const sql = `DELETE FROM Author WHERE ID = ?`;
            const [result] = await promisePool.query(sql, [ID]);
            return result;
        },
        deleteAward: async (ID) => {
            const sql = `DELETE FROM Award WHERE ID = ?`;
            const [result] = await promisePool.query(sql, [ID]);
            return result;
        },
        deleteWarehouse: async (Code) => {
            const sql = `DELETE FROM Warehouse WHERE Code = ?`;
            const [result] = await promisePool.query(sql, [Code]);
            return result;
        },
        deleteInventory: async (Book_ISBN, Warehouse_Code) => {
            const sql = `
                DELETE FROM Inventory 
                WHERE Book_ISBN = ? AND Warehouse_Code = ?
            `;
            const [result] = await promisePool.query(sql, [Book_ISBN, Warehouse_Code]);
            return result;
        },
        deleteContains: async (Book_ISBN, Shopping_basket_BasketID) => {
            const sql = `
                DELETE FROM Contains 
                WHERE Book_ISBN = ? AND Shopping_basket_BasketID = ?
            `;
            const [result] = await promisePool.query(sql, [Book_ISBN, Shopping_basket_BasketID]);
            return result;
        },
        deleteReservation: async (reservationId) => {
            const sql = `
                DELETE FROM Reservation 
                WHERE ID = ?
            `;
            const [result] = await promisePool.query(sql, [reservationId]);
            return result;
        },
        deleteCartItem: async (data) => {
            const sql = `
                DELETE FROM Contains
                WHERE Book_ISBN = ? AND Shopping_basket_BasketID = (
                    SELECT BasketID FROM Shopping_basket WHERE User_Email = ? LIMIT 1
                );
            `;
            const [result] = await promisePool.query(sql, [data.bookISBN, data.userEmail]);
            return result;
        },
        deletecart: async (bookISBN, userEmail) => {
            const sql = `
                DELETE FROM Contains
                WHERE Book_ISBN = ? AND Shopping_basket_BasketID = (
                    SELECT BasketID FROM Shopping_basket WHERE User_Email = ?
                )
            `;
            const [result] = await promisePool.query(sql, [bookISBN, userEmail]);
            return result;
        },
        clearCart: async (userEmail) => {
            const sql = `
                DELETE FROM Contains
                WHERE Shopping_basket_BasketID = (
                    SELECT BasketID FROM Shopping_basket WHERE User_Email = ?
                )
            `;
            await promisePool.query(sql, [userEmail]);
                },
    }
