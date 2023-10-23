import { getConnection } from "../database/dbconfig.js";

const getAllFamilies = async (req,res) => {
    let pool = await getConnection();
    let family = await pool.query('select * from inventory.family');
    res.json(family.recordset);
}

const getFamilyById = async (req,res) => {
    const { familyId } = req.params;
    let pool = await getConnection();
    let family = await pool.query(`select * from inventory.family where familyId = ${familyId}`);
    res.json(family.recordset[0]);
}

export {
    getAllFamilies,
    getFamilyById
}