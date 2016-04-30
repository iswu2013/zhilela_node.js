/**
 * Created by wujinsong on 2016/4/30.
 */
var config = require('../config')[process.env.NOD_ENV || 'development']
var knex = require('knex')({
    client:'mysql',
    connection:config.database
});

var Schema = require('./schema');
var Promise = require('bluebird');
var _ = require('lodash');

function createTable(tableName) {
    return knex.schema.hasTable(tableName).then(function(exists) {
        if (!exists) {
            console.log('Creating: ' + tableName);
            return knex.schema.createTable(tableName, function (table) {
                var column;
                var columnKeys = _.keys(Schema[tableName]);
                _.each(columnKeys, function (key) {
                    if (Schema[tableName][key].type === 'text' && Schema[tableName][key].hasOwnProperty('fieldtype')) {
                        column = table[Schema[tableName][key].type](key, Schema[tableName][key].fieldtype);
                    }
                    else if (Schema[tableName][key].type === 'string' && Schema[tableName][key].hasOwnProperty('maxlength')) {
                        column = table[Schema[tableName][key].type](key, Schema[tableName][key].maxlength);
                    }
                    else {
                        column = table[Schema[tableName][key].type](key);
                    }
                    if (Schema[tableName][key].hasOwnProperty('nullable') && Schema[tableName][key].nullable === true) {
                        column.nullable();
                    }
                    else {
                        column.notNullable();
                    }
                    if (Schema[tableName][key].hasOwnProperty('primary') && Schema[tableName][key].primary === true) {
                        column.primary();
                    }
                    if (Schema[tableName][key].hasOwnProperty('unique') && Schema[tableName][key].unique) {
                        column.unique();
                    }
                    if (Schema[tableName][key].hasOwnProperty('unsigned') && Schema[tableName][key].unsigned) {
                        column.unsigned();
                    }
                    if (Schema[tableName][key].hasOwnProperty('references')) {
                        column.references(Schema[tableName][key].references);
                    }
                    if (Schema[tableName][key].hasOwnProperty('defaultTo')) {
                        column.defaultTo(Schema[tableName][key].defaultTo);
                    }
                });
            });
        } else {
            console.log('Exists: ' + tableName);
        }
    });
};

function createTables() {
    var tables = [];
    var tableNames = _.keys(Schema);

    return Promise.each(tableNames,createTable);
}

createTable()
.then(function () {
    console.log('Tables created');
    process.exit(0);
})
.catch(function (error) {
    throw error;
});