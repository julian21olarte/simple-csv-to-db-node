const mysql = require('promise-mysql');
const dbConfig = require('./dbConfig');
const csv = require('csv-parser');
const fs = require('fs');

const connectDB = () => {
    return mysql.createConnection(dbConfig);
};

const insert = (conn, data) => {
    return conn.query("INSERT INTO data(city, name, street_address, locality, address_region, postal_code, phone, website) VALUES ?", [data]);
};

const run = async () => {
    const start = new Date().getTime();
    const conn = await connectDB();
    let dataRows = [];
    fs.createReadStream('18000.csv')
    .pipe(csv())
    .on('data', (data) => {
        dataRows.push(Object.values(data));
        if(dataRows.length === 50000) {
            insert(conn, dataRows);
            dataRows = [];
        }
    })
    .on('end', async () => {
        if(dataRows.length) await insert(conn, dataRows);
        conn.end();
        const finish = new Date().getTime() - start;

        console.log('TIME: ', finish);
        console.log('TIMESECONDS: ', (finish/1000));
    });
};
run();