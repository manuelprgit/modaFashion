import { getConnection } from "../database/dbconfig.js";

const getAccountReceivable = async(req,res) => {
    let pool = await getConnection();
    let {recordset} = await pool.query(`
        select * from invoice.accountsReceivable
    `)
    let accountReceivable = recordset;

    res.json(accountReceivable);
}

export {
    getAccountReceivable,
}