import { getConnection } from "../database/dbconfig.js";

const getAllStatus = async (req,res) => {
    let pool = await getConnection();
    let productStatus = await pool.query('select * from inventory.productStatus');
    res.json(productStatus.recordset);
}

const getproductStatusById = async (req,res) => {
    const { statusId } = req.params;
    let pool = await getConnection();
    let productStatus = await pool.query(`select * from inventory.productStatus where statusId = ${statusId}`);
    res.json(productStatus.recordset[0]);
}

export {
    getAllStatus,
    getproductStatusById
}