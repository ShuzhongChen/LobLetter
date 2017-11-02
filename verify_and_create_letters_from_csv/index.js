'use strict';

var converter = require('json-2-csv');
var fs       = require('fs');
var moment   = require('moment');
var parse    = require('csv-parse');

var LobFactory = require('../lib/index.js');
var Lob        = new LobFactory('test_ff05dcb8e3a6e89d82dff969b13c6693d0c');

var inputFile = fs.createReadStream(__dirname + '/input.csv');
var successFd = fs.openSync(__dirname + '/success.csv', 'w');
var errorFd = fs.openSync(__dirname + '/error.csv', 'w');
var letterTemplate = fs.readFileSync(__dirname + '/letter_template.html').toString();

/***** google api start *****/
var google = require('googleapis');
var civicinfo = google.civicinfo('v2');

var API_KEY = 'AIzaSyAJUniUdavPuKM1DlZWJj5kH4l-dF3Iwrs'; // specify your API key here
/*
civicinfo.representatives.representativeInfoByAddress({
  auth: API_KEY,
  address: '19530 forest ave, Castro Valley, CA 94546',
  includeOffices: 'true',
  levels: 'country',
  roles: 'deputyHeadOfGovernment',
  
}, function (err, data) {
  console.log(data.officials[0].address);
});

civicinfo.representatives.representativeInfoByAddress({
  auth: API_KEY,
  address: '19530 forest ave, Castro Valley, CA 94546',
  includeOffices: 'true',
  levels: 'country',
  roles: 'deputyHeadOfGovernment',
  
}, function (err, data) {
  console.log(data.officials[0].address);
});*/
/***** google api end *****/


var parser = parse({ columns: true }, function (err, data) {
  if (err) {
    return console.log(err);
  }
  
  
  data.forEach(function (client) {
    
    var createAddress = client.primary_line + client.secondary_line + ', ' + client.city + ', ' + client.state + ' ' + client.zip_code;
    
    var companyInfo = {
      name: client.name,
      address_line1: client.primary_line,
      address_line2: client.secondary_line,
      address_city: client.city,
      address_state: client.state,
      address_zip: client.zip_code,
      address_country: client.country
    };
    
    civicinfo.representatives.representativeInfoByAddress({
      auth: API_KEY,
      address: createAddress,
      includeOffices: 'true',
      levels: 'country',
      roles: 'deputyHeadOfGovernment',
      
    }, function (err, data) {
      if (data != null) {
        
        var name = client.name;
        var message = client.message;
        
        var address = {
          recipient: data.officials[0].name,
          primary_line: data.officials[0].address[0].line1,
          secondary_line: data.officials[0].address[0].line2,
          city: data.officials[0].address[0].city,
          state: data.officials[0].address[0].state,
          zip_code: data.officials[0].address[0].zip
        };
        
        console.log(address.primary_line);
        console.log(address.secondary_line);
    
        Lob.usVerifications.verify(address)
        .then(function (verifiedAddress) {
          return Lob.letters.create({
            description: 'Letter for ' + data.officials[0].name,
            to: {
              name: verifiedAddress.recipient,
              address_line1: verifiedAddress.primary_line,
              address_line2: verifiedAddress.secondary_line,
              address_city: address.city,
              address_state: address.state,
              address_zip: address.zip_code,
              address_country: address.country
            },
            from: companyInfo,
            file: letterTemplate,
            merge_variables: {
              detailMessage: message
            },
            color: true
          });
        })
        .then(function (letter) {
          console.log('Successfully sent a letter to ' + address.recipient);
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
            fs.write(errorFd, csv);
          }, { PREPEND_HEADER: false });
        });
        
      }
    });

    
  });

});

inputFile.pipe(parser);
