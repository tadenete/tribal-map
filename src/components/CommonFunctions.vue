<script>
  import emitter from 'tiny-emitter/instance';
  import variables from './variables.js';
  import $ from 'jquery'
  window.jQuery = window.$ = $

  export default {
    name: "CommonFunctions",
    apiCallAjaxCGRGeocoderAPI(recaptchaToken) {
      var geocoderResult;
      var errorCode;
      var payload = {
          "address": {
            "id": 0,
            "addressLine1": variables.searchStreetAddress,
            "city": variables.searchCity,
            "state": variables.searchState,
            "zip": variables.searchZipCode,
            "urbanizationCode": variables.searchUrbanizationCode
          },
          "option": {
            "latLong": true,
            "county": false,
            "congressionalDistrict": false,
            "sac": false,
            "censusTract": false,
            "censusBlockGroup": false,
            "censusBlock": false,
            "standardization": true,
            "exactMatch": true
          },
          "geocode": {
            "id": 0,
            "latitude": "string",
            "longitude": "string",
            "granularity": "string"
          }
      };
      payload.recaptcha_token = recaptchaToken != null ? recaptchaToken : '';
      $.ajax({
        url: variables.getCGRGeocoderAPI,
        async: false,
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function (data) {
          geocoderResult = data;
          errorCode = 200;
        },
        error: function(err) {
          emitter.emit('searchComplete', false);
          console.log("CGR_Geocoder_API connection error\n", err);
          geocoderResult = err.statusText;
          errorCode = err.status;
        },
      });
      return {errorCode, geocoderResult};
    },
    async apiCallAjaxCartoV3Async(query) {
      var downloadedData;
      var errorCode;
      await $.ajax({
        url: variables.cartoV3APIQueryUrlStart + query,
        dataType: "json",
        type: "GET",
        async: true,
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + variables.cartoV3Cred);
          xhr.setRequestHeader('Cache-Control', 'no-cache, max-age=0');
        },
        success: function (data) {
          downloadedData = data.rows[0];
          errorCode = 200;
        },
        error: function(err) {
          downloadedData = err.responseJSON;
          errorCode = err.status;
          console.log("Connection error\n", err);
        },
      });
      return {errorCode, downloadedData};
    },
  }
</script>