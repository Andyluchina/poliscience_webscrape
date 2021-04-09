const csv = require("csv-parser");
const fs = require("fs");
const results = [];
// https://finanzalocale.interno.gov.it/apps/floc.php/spettanze/index/codice_ente/2040831390/anno/2021/cod/1/md/0
//https://finanzalocale.interno.gov.it/apps/floc.php/spettanze/index/codice_ente/2050900410/anno/2009/cod/1/md/0
var muni = require("./italy_muni.json");

// var muni = require("./italy_test.json");

var extracted_muni = [];
var final_data = [];
var log = "";

// async function readCSV() {
//   await fs
//     .createReadStream("data.csv")
//     .pipe(csv())
//     .on("data", (data) => results.push(data))
//     .on("end", () => {
//       console.log("current csv parsed");
//       // [
//       //   { NAME: 'Daffy Duck', AGE: '24' },
//       //   { NAME: 'Bugs Bunny', AGE: '22' }
//       // ]
//     });
// }

// function readCsv() {
//   return;
// }

// async function read() {
//   await new Promise((resolve, reject) => {
//     fs.createReadStream("data.csv")
//       .pipe(csv())
//       .on("data", (data) => results.push(data))
//       .on("end", () => {
//         console.log("Done.");
//         resolve();
//       })
//       .on("error", reject);
//   });
// }
// read();

final_data.push("name,year,result");
Object.keys(muni).forEach(function (entry) {
  // console.log(entry);
  // console.log(muni[entry]);
  extracted_muni = extracted_muni.concat(muni[entry]);
});

// console.log(extracted_muni);

const axios = require("axios");
const cheerio = require("cheerio");

async function exec() {
  await new Promise((resolve, reject) => {
    fs.createReadStream("data.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        console.log("Done.");
        resolve();
      })
      .on("error", reject);
  });
  console.log(results);
  // for (var index = 0; i < results.length; i++)
  var counter = 0;
  for (var year = 2009; year <= 2021; year++) {
    for (var i = 0; i < extracted_muni.length; i++) {
      if (results[counter].result == "NA") {
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
            var result_array = [
              JSON.stringify(extracted_muni[i].nome),
              year,
              JSON.stringify(total),
            ];
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

            var result_array = [
              JSON.stringify(results[counter].name),
              results[counter].year,
              JSON.stringify(results[counter].result),
              "request failed",
            ];
            final_data.push(result_array.join(","));
          });
      } else {
        var result_array = [
          JSON.stringify(results[counter].name),
          results[counter].year,
          JSON.stringify(results[counter].result),
        ];
        final_data.push(result_array.join(","));
      }

      counter++;

      // console.log(final_data);
    }
  }

  fs.writeFile("data_v2.csv", final_data.join("\n"), (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });

  fs.writeFile("logs_v2.txt", log, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
}

exec();
