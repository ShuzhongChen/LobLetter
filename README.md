# A Program to Send Letter to Legislator with Lob

This is a command line program to send a letter to your legislator with Lob.

## Getting started
Before running this program, make sure you are in the `verify_and_create_letters_from_csv/` directory.
```
cd verify_and_create_letters_from_csv/
```

### Verify and create letters from CSV

In this program, [Google APIs Node.js Client](https://github.com/google/google-api-nodejs-client) and [lob-node](https://github.com/lob/lob-node) are used. [Google APIs Node.js Client](https://github.com/google/google-api-nodejs-client) is a Node.js client library for using Google APIs. Support for authorization and authentication with OAuth 2.0, API Keys and JWT (Service Tokens) is included. [lob-node](https://github.com/lob/lob-node) is a Node.js wrapper for the [Lob.com](https://lob.com/) API.

This program accept input by reading from a CSV file. The input includes name of user, address line 1, address line 2, city, state, country, zip code, and message to send to the legislator. Firstly, Lob's [US Address Verification API](https://lob.com/services/verifications) is used to validate and clean addresses. Then using [Google Civic Information API](https://developers.google.com/civic-information/docs/v2/representatives/representativeInfoByAddress) to return a representative contact information by using the input address. At last, Lob's [Letter API](https://lob.com/services/letters) is used to create a letter to send legislator. The output is a CSV file name "success.csv" including the sender's information and URL to the PDF of the letter in Lob's API response.

In order to run the program enter:

```
cd verify_and_create_letters_from_csv/
node index.js
```
