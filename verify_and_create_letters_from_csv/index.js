'use strict';

var converter = require('json-2-csv');
var fs       = require('fs');
var moment   = require('moment');
var parse    = require('csv-parse');

var LobFactory = require('../lib/index.js');
var Lob        = new LobFactory('test_ff05dcb8e3a6e89d82dff969b13c6693d0c'); // Lob.com API key

var inputFile = fs.createReadStream(__dirname + '/input.csv');
var successFd = fs.openSync(__dirname + '/success.csv', 'w');
var gErrorFd = fs.openSync(__dirname + '/gError.csv', 'w');
var vErrorFd = fs.openSync(__dirname + '/vError.csv', 'w');
var sErrorFd = fs.openSync(__dirname + '/sError.csv', 'w');
var letterTemplate = fs.readFileSync(__dirname + '/letter_template.html').toString();

var google = require('googleapis');
var civicinfo = google.civicinfo('v2');

var API_KEY = 'AIzaSyAJUniUdavPuKM1DlZWJj5kH4l-dF3Iwrs'; // Google API key


var parser = parse({ columns: true }, function (err, data) {
  if (err) {
    return console.log(err);
  }
  
  
  data.forEach(function (client) {
  
    var name = client.name;
    var message = client.message;
    var country = client.country;

    var address = {
      recipient: name,
      primary_line: client.primary_line,
      secondary_line: client.secondary_line,
      city: client.city,
      state: client.state,
      zip_code: client.zip_code
    };
  
    Lob.usVerifications.verify(address)
    .then(function (verifiedAddress) {
        
        var companyInfo = {
          name: verifiedAddress.recipient,
          address_line1: verifiedAddress.primary_line,
          address_line2: verifiedAddress.secondary_line,
          address_city: address.city,
          address_state: address.state,
          address_zip: address.zip_code,
          address_country: address.country
        };

        var createAddress = verifiedAddress.primary_line + verifiedAddress.secondary_line + ', ' + address.city + ', ' 
                            + address.state + ' ' + address.zip_code;

        civicinfo.representatives.representativeInfoByAddress({
          auth: API_KEY,
          address: createAddress,
          includeOffices: 'true',
          levels: 'country',
          roles: 'deputyHeadOfGovernment',

        }, function (err, data) {
          if (err) {
            converter.json2csv(err, function (err, csv) {
            if (err) {
              throw err;
            }
            fs.write(gErrorFd, csv);
          }, { PREPEND_HEADER: false });
          }
          
          if (data != null) {

            Lob.letters.create({
            description: 'Letter for ' + data.officials[0].name,
            to: {
              name: data.officials[0].name,
              address_line1: data.officials[0].address[0].line1,
              address_line2: data.officials[0].address[0].line2,
              address_city: data.officials[0].address[0].city,
              address_state: data.officials[0].address[0].state,
              address_zip: data.officials[0].address[0].zip
            },
            from: companyInfo,
            file: letterTemplate,
            merge_variables: {
              detailMessage: message
            },
            color: true
            })
            .then(function (letter) {
              console.log('Successfully sent a letter to legislator');
              client.letter_id = letter.id;
              client.letter_url = letter.url;
              console.log(letter.url);
              converter.json2csv(client, function (err, csv) {
                if (err) {
                  throw err;
                }
                fs.write(successFd, csv);
              }, { PREPEND_HEADER: false });
            })
            .catch(function () {
              console.log('Could not send letter to ');
              converter.json2csv(client, function (err, csv) {
                if (err) {
                  throw err;
                }
                fs.write(sErrorFd, csv);
              }, { PREPEND_HEADER: false });
            });

          }
        });
    })
    .catch(function () {
      console.log('Could not send letter to ');
      converter.json2csv(client, function (err, csv) {
        if (err) {
          throw err;
        }
      fs.write(vErrorFd, csv);
      }, { PREPEND_HEADER: false });
    });
  });

});

inputFile.pipe(parser);
