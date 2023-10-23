import { getConnection } from "../database/dbconfig.js";

const getAllCategories = async (req, res) => {
    let pool = await getConnection();
    let categories = await pool.query('select * from inventory.category');
    res.json(categories.recordset);
}

const getCategoryById = async (req, res) => {
    const { categoryId } = req.params;
    let pool = await getConnection();
    let category = await pool.query(`
        select * from inventory.category 
        where categoryId = ${categoryId}
    `);
    res.json(category.recordset[0]);
}

const createCategory = async (req, res) => { 
    const {
        categoryDescription,
        categoryStatusId
    } = req.body;
    try {
        let pool = await getConnection();

        await pool.query(`
            insert into inventory.category(
                categoryDescription,
                categoryStatusId
            )
            values ( 
                '${categoryDescription}',
                 ${Number(categoryStatusId)}
            )
         `);

        let { recordset } = await pool.query(`
            select top(1) * from inventory.category
            order by categoryId desc        
        `);

        res.status(201).json(recordset[0]);

    } catch (error) {
        res.status(400).json({
            msg: error.message,
            error: 400
        })
    }
}

const updateeCategory = async (req, res) => {

    const {
        categoryDescription,
        categoryStatusId
    } = req.body;  
    const categoryId = req.params.categoryId;

    try {
        let pool = await getConnection();

        await pool.query(`
            update inventory.category
            set categoryDescription = '${categoryDescription}',
                categoryStatusId = ${categoryStatusId}
            where categoryId = ${categoryId};
        `);

        res.status(204).json();

    } catch (error) {
        res.status(400).json({
            msg: error.message,
            error: 400
        })
    }
}

export {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateeCategory
}