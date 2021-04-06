// https://finanzalocale.interno.gov.it/apps/floc.php/spettanze/index/codice_ente/2040831390/anno/2021/cod/1/md/0

var muni = require("./italy_muni.json");

// var muni = require("./italy_test.json");

var extracted_muni = [];
var final_data = [];
var log = "";

final_data.push("name,year,result");
Object.keys(muni).forEach(function (entry) {
  // console.log(entry);
  // console.log(muni[entry]);
  extracted_muni = extracted_muni.concat(muni[entry]);
});

// console.log(extracted_muni);

const axios = require("axios");
const fs = require("fs");
const cheerio = require("cheerio");

async function exec() {
  for (var year = 2009; year <= 2021; year++) {
    for (var i = 0; i < extracted_muni.length; i++) {
      var url =
        "https://finanzalocale.interno.gov.it/apps/floc.php/spettanze/index/codice_ente/" +
        extracted_muni[i].id +
        "/anno/" +
        year +
        "/cod/1/md/0";
      await axios
        .get(url)
        .then(function (response) {
          // handle success

          // console.log(response.data);
          const $ = cheerio.load(response.data);

          var total = $("td[class='ad3']").html();
          if (!total) {
            total = "NA";
          }

          console.log(total);
          console.log(url);
          var result_array = [extracted_muni[i].nome, year, total];
          final_data.push(result_array.join(","));
          console.log(extracted_muni[i].nome + " is successful");
        })
        .catch(function (error) {
          // handle error
          console.log(error);
          console.log(
            extracted_muni[i].nome +
              " failed, and id is " +
              extracted_muni[i].id
          );
          log +=
            extracted_muni[i].nome +
            " failed, and id is " +
            extracted_muni[i].id +
            "\n";
          log += JSON.stringify(error);
          log += "\n";
        });

      // console.log(final_data);
    }
  }

  fs.writeFile("data.csv", final_data.join("\n"), (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });

  fs.writeFile("logs.txt", log, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
}

exec();
