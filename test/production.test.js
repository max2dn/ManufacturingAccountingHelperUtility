process.argv[2] = "test_config.json";
const production = require('../tools/production.js')


/*
test('Post production', async() => {
    data = '{"production_date":"2019-05-11","expiration_date":"2019-07-10","product":"KAMABOKO RED - [UPC 21800)","quantity":{"SURIMI (ASF) - A":"10","SUGAR":"10","POTATO STARCH":"10","SALT":"10"},"quantity_produced":"40"}'
    let result = await production.postProduction(data);
});
*/

test('Calculate unit cost', async() => {
    var batch_id = '1362';
    let result = await production.calculateUnitCost(batch_id);
    expect(result).toEqual(4);
});
