import knex from "knex";

export const db = knex({
    client: 'sqlite3',
    connection: {
        filename: 'src/db/attm.sqlite3'
    },
    useNullAsDefault: true
});
