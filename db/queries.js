import pool from "./pool.js"

async function addnewUser(firstname, lastname, email, password, membership_status) {
    const query = {
        text : 'INSERT INTO users (firstname, lastname, email, password, membership_status) VALUES (($1), ($2), ($3), ($4), ($5))',
        values : [firstname, lastname, email, password, membership_status]
    }
    await pool.query(query);
}

async function userexistsbyemail(email) {
    const query = {
        text : 'SELECT * FROM users WHERE email = $1',
        values : [email]
    }
    const { rows } = await pool.query(query);
    return (rows.length > 0);
}

async function ismember(firstname) {
    const query = {
        text : 'SELECT membership_status FROM users WHERE firstname = $1',
        values : [firstname]
    }
    const { rows } = await pool.query(query);
    return (rows.length > 0);
}
export default {
    addnewUser,
    userexistsbyemail,
    ismember,
}