const express = require('express'); // Satisfy Vercel static analysis check
const app = require('./api/index.js');

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`AI Studio Server đang chạy tại http://localhost:${port}`);
    });
}

module.exports = app;
