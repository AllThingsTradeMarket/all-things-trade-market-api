import knex from "knex";

export const connectedKnex = knex({
    client: 'sqlite3',
    connection: {
        filename: 'db/attm.sqlite3'
    },
    useNullAsDefault: true
});
