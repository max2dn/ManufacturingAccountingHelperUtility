process.argv[2] = "test_config.json";
const inventory_tools = require("../tools/inventory_tools.js")

test('Calculate total cost', async() => {
    var batch_id = "1362";
    let total_cost = await inventory_tools.calculateTotalCost(batch_id);
    expect(total_cost).toEqual(130);
});