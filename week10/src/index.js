import express from 'express';
import logger from 'morgan';
import path from 'path';
import expressSession from 'express-session';

import loginRouter from '../routes/login';
import adminRouter from '../routes/admin';
import admininsertRouter from '../routes/admininsert'; // 경로 수정
import admineditRouter from '../routes/adminedit'; // 경로 수정
import admindeleteRouter from '../routes/admindelete'; // 경로 수정
import customerRouter from '../routes/customer';
import bookSearchRouter from '../routes/bookSearch';
import reservationRouter from '../routes/reservation';

const PORT = 3000;

const app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    expressSession({
        secret: 'Woojinop22!',
        resave: true,
        saveUninitialized: true,
    })
);

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));

app.use('/', loginRouter);
app.use('/admin', adminRouter);
app.use('/admin', admininsertRouter); // /admin/insert 경로에 admininsertRouter 연결
app.use('/admin', admineditRouter); // /admin/insert 경로에 admininsertRouter 연결
app.use('/admin', admindeleteRouter); // /admin/insert 경로에 admininsertRouter 연결
app.use('/customer', customerRouter);
app.use('/customer', bookSearchRouter);
app.use('/customer', reservationRouter);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
