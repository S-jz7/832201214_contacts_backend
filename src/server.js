const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());
// 创建 MySQL 连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456', 
    database: 'contact_manager'
});
// 连接数据库
db.connect(err => {
    if (err) {
        console.error('数据库连接失败: ', err);
        return;
    }
    console.log('已成功连接到数据库');
});
// 获取所有联系人
app.get('/api/contacts', (req, res) => {
    db.query('SELECT * FROM contacts', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
       
    });
});
// 查找联系人
app.get('/api/contacts/search', (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).send('查询关键词是必须的');
    }
    // 使用 SQL 的 LIKE 语句进行模糊匹配，支持通过名字、电话号码或邮箱进行查找
    const searchQuery = `
        SELECT * FROM contacts 
        WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
    `;
    const searchValue = `%${keyword}%`;
    db.query(searchQuery, [searchValue, searchValue, searchValue], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});
//添加新联系人
app.post('/api/contacts', (req, res) => {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
        return res.status(400).send('姓名和电话号码是必须的');
    }
    db.query('INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)', [name, phone, email], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send('联系人已添加');
    });
});
// 更新联系人
app.put('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    db.query('UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?', [name, phone, email, id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('联系人已更新');
    });
});
// 删除联系人
app.delete('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM contacts WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('联系人已删除');
    });
});

//黑名单
app.put('/api/contacts/:id/blacklist', (req, res) => {
    const { id } = req.params;
    const { is_blacklisted } = req.body;
    db.query('UPDATE contacts SET is_blacklisted = ? WHERE id = ?', [is_blacklisted, id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('联系人黑名单状态已更新');
    });
});
// 启动服务器
app.listen(port, () => {
    console.log(`服务器正在 http://47.97.32.161:${port} 上运行`);
});
