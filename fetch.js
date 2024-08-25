const axios = require('axios');
(async () => {
  const where = encodeURIComponent(JSON.stringify({
    "state": {
      "__type": "Pointer",
      "className": "Usuniversitieslist_State",
      "objectId": "California"
    }
  }));
  const response = await axios.get(
    `https://parseapi.back4app.com/classes/Usuniversitieslist_University?count=1&limit=1000&order=state&where=${where}`,
    {
      headers: {
        'X-Parse-Application-Id': 'lSUXmBqMOfzUQMllD4TGMqi58evB70MEkroLnzaW', // This is your app's application id
        'X-Parse-REST-API-Key': 'qF1wa0izGSbRhCCWyrxMyJip6y3OBiGY9eXm4HB1', // This is your app's REST API key
      }
    }
  );
  const data = await response.json(); // Here you have the data that you need
console.log(data)
//   console.log(JSON.stringify(data));
})();