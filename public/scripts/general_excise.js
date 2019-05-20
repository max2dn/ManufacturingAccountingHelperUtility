customer_types = ["OAHU","MAUI","BIG ISLAND","KAUAI","OUT-OF-STATE","MILITARY"]
tax_categories = ["Retail Rate","Wholesale","Exempt"]
income_accounts = ["4000", "4100"]
var gross = setupEmptyGrossObject();

$(document).ready(function(){
    $('#navigation').load('/modules/navigation_menu.html');
});

function parseGeneralExciseFile(){
    var general_excise_input_file = document.getElementById("general_excise_input_file").files[0];
    Papa.parse(general_excise_input_file, {
        complete: function(results) {
            var parsedData = parseGeneralExciseCSVData(results.data);
            downloadCSVFile(parsedData);
            setupEmptyGrossObject();
        }
    });
}

function getPreviousMonthString(){
    var todays_date = new Date();
    todays_date.setMonth(todays_date.getMonth()-1);
    return todays_date.toLocaleString('en-us', { month: 'long' });
}

function downloadCSVFile(data){
    var rawCSVData = Papa.unparse(data);
    rawCSVData = "data:text/csv;charset=utf-8," + rawCSVData;
    var encodedUri = encodeURI(rawCSVData);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    var suggested_filename = getPreviousMonthString() + "_GET_Summary.csv";
    link.setAttribute("download", suggested_filename);
    document.body.appendChild(link); // Required for FF
    link.click();
}

function parseRow(row, column_names){
    income_account = row[column_names["Income Account"]];
    tax_category = row[column_names["Tax Name"]]
    customer_type = row[column_names["Customer Type"]]
    if(row[column_names["Amount"]].replace(",","") != ''){
        amount = parseFloat(row[column_names["Amount"]].replace(",",""))
    }
    else{
        amount = 0
    }
    if(row[column_names["Tax Amount"]].replace(",","") != ''){
        tax_amount = parseFloat(row[column_names["Tax Amount"]].replace(",",""))
    }
    else{
        tax_amount = 0
    }
    if(!income_accounts.includes(income_account)){
        return
    }
    gross[customer_type][tax_category][income_account] += amount + tax_amount
}

function parseGeneralExciseCSVData(csv_data){
    column_names = {}
    transaction_rows = []
    for(i=0; i<csv_data.length; i++){
        row = csv_data[i];
        if (i == 0){
            for(column_num=0; column_num<row.length; column_num++){
                column = row[column_num];
                column_names[column] = column_num;
            }
            column_names["Income Account"] = 0;
            continue;
        }

        if(row[0] == "Not Specified"){
            break;
        }

        if(row[0] == ""){
            row[0] = account_number
            if(row[5] == "")
                row[5] = "0";
            if(row[6] == "")
                row[6] = "Exempt";
            if(row[7] == "")
                row[7] = "OAHU";
            transaction_rows.push(row)
        }

        if(!isNaN(row[0].slice(0,4))){
            account_number = row[0].slice(0,4);
        }
    }

    transaction_rows.forEach(row => {
        parseRow(row, column_names)
    });

    gross_rows = [['Customer Type', "Tax Category", "Income Account", "Total"]]
    customer_types.forEach(customer_type => {
        tax_categories.forEach(tax_category => {
            income_accounts.forEach(income_account => {
                gross_rows.push([customer_type,
                                tax_category,
                                income_account,
                                gross[customer_type][tax_category][income_account]])
            });
        });
    });
    return gross_rows;
}      

function setupEmptyGrossObject() {
    gross = {}
    customer_types.forEach(customer_type => {
        gross[customer_type] = {};
        tax_categories.forEach(tax_category => {
            gross[customer_type][tax_category] = {};
            income_accounts.forEach(income_account => {
                gross[customer_type][tax_category][income_account] = 0;
            });
        });
    });
    return gross;
}

