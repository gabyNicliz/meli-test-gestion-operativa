const https = require('https');
const readline = require('readline');
const fs = require('fs');

let seller_data = [];
const file_path = './log-del-script.txt';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Introducir el ID del vendedor: ', (seller_id) => {
  rl.question('Introducir el ID del pais: ', (site_id) => {
    https.get(`https://api.mercadolibre.com/sites/${site_id}/search?seller_id=${seller_id}`, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const parsed_seller_data = JSON.parse(data).results;
        
        parsed_seller_data.map((item) => {
          https.get(`https://api.mercadolibre.com/categories/${item.category_id}`, (res) => {
            let c_data = '';

            res.on('data', (category_chunk) => {
              c_data += category_chunk;
            });

            res.on('end', () => {
              const parsed_category = JSON.parse(c_data);
              try {
                if (fs.existsSync(file_path)) {
                  const text_to_copy = `item_id: ${item.id},\nitem_title: ${item.title},\nitem_category_id: ${item.category_id},\nitem_category_name: ${parsed_category.name}\n\n`;
                  fs.appendFile('log-del-script.txt', text_to_copy, function (err) {
                    if (err) throw err;
                    console.log('Updated!');
                  });
                } else {
                  fs.appendFile('log-del-script.txt', '.LOG\n', function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                  });
                }
              } catch(err) {
                console.error(err)
              }
            });
          }).on('error', (err) => {
            console.log('Error: ' + err.message);
          });
        });
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
    rl.close();
  });
});
