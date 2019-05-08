process.argv[2] = "test_config.json";

const recipe = require('../tools/recipe.js');
const mysql_tools = require('../tools/mysql_tools.js');
test('Gets Recipe', async () => {
    let return_recipe = await recipe.getRecipe('KAMABOKO (GREEN)');
    var expected_return = { product: 'KAMABOKO (GREEN)',
                            unit: 'Each',
                            category: 'fishcake',
                            ingredients:
                                [ { ingredient: 'SUGAR' },
                                { ingredient: 'SALT' },
                                { ingredient: 'SOYBEAN OIL' } ]
                                      }
    expect(return_recipe).toEqual(expected_return);
});

test('Throws Error when No Recipe', async () => {
    var err_product = 'Cobi';
    try{
        let return_recipe = await recipe.getRecipe(err_product);
    } catch(err){
        expect(err).toEqual("Error getRecipe: Item Not Found " + err_product);
    }
});