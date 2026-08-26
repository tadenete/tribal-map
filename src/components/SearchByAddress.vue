<template>
  <div id="searchByAddress">
    <i-grid>
      <i-input-group label="Street Address" label-for="streetAddress" class="indi-col-lg-12">
        <i-input id="streetAddress" type="text" maxlength="150" v-model="streetAddressInput" @focus="validateStreetAddress" @blur="validateStreetAddressOnSubmit" @keyup="validateStreetAddress" :invalid="streetAddressErrorMessage !== ''"/>
        <i-input-notification v-bind:text="streetAddressErrorMessage"/>
      </i-input-group>
    </i-grid>
    <i-grid>
      <i-input-group label="City" label-for="city" class="indi-col-lg-8" style="float: left;">
        <i-input id="city" type="text" maxlength="70" v-model="cityInput" @focus="validateCity" @blur="validateCityOnSubmit" @keyup="validateCity" :invalid="cityErrorMessage !== ''"/>
        <i-input-notification v-bind:text="cityErrorMessage"/>
      </i-input-group>
      <i-input-group label="State" label-for="state" class="indi-col-lg-4" style="float: right; padding-left: 24px;">
        <i-select id="state" maxlength="2" v-bind:options="stateList" aria-label="State" v-model="stateSelect" @update:modelValue="onSelectedState" @search:blur="checkStateValueIfPresent" :invalid="stateErrorMessage !== ''"/>
        <i-input-notification v-bind:text="stateErrorMessage"/>
      </i-input-group>
    </i-grid>
    <i-grid>
      <i-input-group id="zipCodeClass" label="Zip Code" label-for="zipCode" class="indi-col-lg-8" style="float: left;">
        <i-input id="zipCode" type="text" aria-label="Zip Code" maxlength="5" v-model="zipCodeInput" @focus="validateZipCode" @blur="validateZipCodeOnSubmit" @keyup="validateZipCode" :invalid="zipCodeErrorMessage !== ''"/>
        <i-input-notification v-bind:text="zipCodeErrorMessage"/>
      </i-input-group>
      <i-input-group id="urbanizationCodeDisplay" label="Urbanization Code" label-for="urbanizationCode" class="indi-col-lg-8" style="float: right; padding-left: 24px;" :optional=true>
        <i-input id="urbanizationCode" type="text" aria-label="Zip Code" maxlength="100" v-model="urbanizationCodeInput" @focus="validateUrbanizationCode" @blur="validateUrbanizationCodeOnSubmit" @keyup="validateUrbanizationCode" :invalid="urbanizationCodeErrorMessage !== ''"/>
        <i-input-notification v-bind:text="urbanizationCodeErrorMessage"/>
      </i-input-group>
    </i-grid>
    <div id="messageStatusSearchByAddress" :style="!isMobile ? 'min-height: 58px;':'height: auto !important;'">
      <div id="successMessageSearchByAddress" class="learnMoreTextSuccessSearchByAddress">
        <i-long-form-text><p>Your address is on qualifying Tribal lands. Learn more about <a id="tribalLandsLinkSuccess" href="https://www.lifelinesupport.org/" target="_blank">how to apply</a>.</p></i-long-form-text>
      </div>
      <div id="failureMessageSearchByAddress" class="learnMoreTextFailureSearchByAddress">
        <i-long-form-text><p>Your address is not on qualifying Tribal lands. You may still qualify for the standard Lifeline benefit. Learn more about <a id="tribalLandsLinkFailure" href="https://www.lifelinesupport.org/do-i-qualify/" target="_blank">how to get Lifeline</a>.</p></i-long-form-text>
      </div>
      <div id="errorMessageSearchByAddress" class="learnMoreSystemErrorSearchByAddress">
        <i-long-form-text><p>{{ addressErrorDisplayMessage }}</p></i-long-form-text>
      </div>
    </div>
  </div>
</template>
<script>
  import {ISelect, IInput, IInputGroup, IInputNotification, IGrid, ILongFormText} from 'indigo-component-library'
  import variables from './variables.js';
  import CommonFunctions from './CommonFunctions.vue';
  import $ from 'jquery'
  window.jQuery = window.$ = $

  export default {
    name: "SearchByAddress",
    components: {ISelect, IInput, IInputGroup, IInputNotification, IGrid, ILongFormText},
    props: {
      isMobile: {
        type: Boolean,
        required: true
      }
    },
    mounted() {
      variables.searchError = false;
      $("#successMessageSearchByAddress").hide();
      $("#failureMessageSearchByAddress").hide();
      $("#errorMessageSearchByAddress").hide();
      $("#urbanizationCodeDisplay").hide();
      $("#zipCodeClass").removeClass('indi-col-lg-4').addClass('indi-col-lg-8');
      this.emitter.on('checkAndExtractSearchByAddressValues', (payload) => {
        const e = payload && typeof payload === 'object' && 'event' in payload ? payload.event : payload;
        const recaptchaToken = payload && typeof payload === 'object' && 'recaptchaToken' in payload ? payload.recaptchaToken : '';
        return this.checkAndExtractSearchByAddressValues(e, recaptchaToken);
      });
      this.emitter.on('clearSearchByAddressValues', () => {
        return this.clearSearchByAddressValues();
      });
    },
    computed: {
      addressErrorDisplayMessage() {
        return this.displayErrorMessage || variables.searchErrorMessage || 'An error occurred while processing the request. Please try again later.';
      }
    },
    data() {
      return {
        stateList: variables.stateDropdownValues,
        streetAddressInput: '',
        cityInput: '',
        stateSelect: null,
        zipCodeInput: '',
        urbanizationCodeInput: '',
        streetAddressErrorMessage: '',
        cityErrorMessage: '',
        stateErrorMessage: '',
        zipCodeErrorMessage: '',
        urbanizationCodeErrorMessage: '',
        anyValidationError: false,
        streetAddressRegEx: /^[-.()"':;`&/#@áéíóúüña-zA-Z0-9 ]+$/,
        cityRegEx: /^[-.,'áéíóúüña-zA-Z ]+$/,
        zipCodeRegEx: /^\d{5}$/,
        urbanizationCodeRegEx: /^[áéíóúüña-zA-Z0-9 ]+$/,
        verificationCompleted: false,
        displayErrorMessage: '',
      }
    },
    methods: {
      checkStateValueIfPresent() {
        if (this.stateSelect === null) {
          this.stateErrorMessage = 'Select a state or territory';
        } else {
          this.stateErrorMessage = '';
        }
      },
      validateStreetAddress(e) {
        if (this.streetAddressInput != '' && !this.streetAddressRegEx.test(this.streetAddressInput)) {
          this.streetAddressErrorMessage = 'Enter a valid street address (ex. 1234 Real Street)';
        } else {
          this.streetAddressErrorMessage = '';
        }
        this.emitter.emit('formInputChanged');
        if (e != null && e.key === 'Enter') {this.emitter.emit('triggerSearchButtonClick', e);}
      },
      validateCity(e) {
        if (this.cityInput != '' && !this.cityRegEx.test(this.cityInput)) {
          this.cityErrorMessage = 'Enter a valid city';
        } else {
          this.cityErrorMessage = '';
        }
        this.emitter.emit('formInputChanged');
        if (e != null && e.key === 'Enter') {this.emitter.emit('triggerSearchButtonClick', e);}
      },
      validateZipCode(e) {
        if (this.zipCodeInput != '' && !this.zipCodeRegEx.test(this.zipCodeInput)) {
          this.zipCodeErrorMessage = 'Enter a valid zip code';
        } else {
          this.zipCodeErrorMessage = '';
        }
        this.emitter.emit('formInputChanged');
        if (e != null && e.key === 'Enter') {this.emitter.emit('triggerSearchButtonClick', e);}
      },
      validateUrbanizationCode(e) {
        if (this.urbanizationCodeInput === '') {
          this.urbanizationCodeErrorMessage = '';
        } else if (!this.urbanizationCodeRegEx.test(this.urbanizationCodeInput)) {
          this.urbanizationCodeErrorMessage = 'Please enter a valid Urbanization Code for Puerto Rico';
        } else {
          this.urbanizationCodeErrorMessage = '';
        }
        this.emitter.emit('formInputChanged');
        if (e != null && e.key === 'Enter') {this.emitter.emit('triggerSearchButtonClick', e);}
      },
      onSelectedState() {
        this.urbanizationCodeErrorMessage = '';
        this.urbanizationCodeInput = '';
        if (this.stateSelect === 'PR') {
          $("#urbanizationCodeDisplay").show();
          $("#zipCodeClass").removeClass('indi-col-lg-8').addClass('indi-col-lg-4');
        } else {
          $("#urbanizationCodeDisplay").hide();
          $("#zipCodeClass").removeClass('indi-col-lg-4').addClass('indi-col-lg-8');
        }
        this.emitter.emit('formInputChanged');
      },
      validateStreetAddressOnSubmit() {
        if (this.streetAddressInput === '') {
          this.streetAddressErrorMessage = 'Enter a street address (ex. 1234 Real Street)';
          this.anyValidationError = true;
        } else if (!this.streetAddressRegEx.test(this.streetAddressInput)) {
          this.streetAddressErrorMessage = 'Enter a valid street address (ex. 1234 Real Street)';
          this.anyValidationError = true;
        } else {
          this.streetAddressErrorMessage = '';
        }
      },
      validateCityOnSubmit() {
        if (this.cityInput === '') {
          this.cityErrorMessage = 'Enter a city';
          this.anyValidationError = true;
        } else if (!this.cityRegEx.test(this.cityInput)) {
          this.cityErrorMessage = 'Enter a valid city';
          this.anyValidationError = true;
        } else {
          this.cityErrorMessage = '';
        }
      },
      validateStateOnSubmit() {
        if (this.stateSelect === null) {
          this.stateErrorMessage = 'Select a state or territory';
          this.anyValidationError = true;
        } else {
          this.stateErrorMessage = '';
        }
      },
      validateZipCodeOnSubmit() {
        if (this.zipCodeInput === '') {
          this.zipCodeErrorMessage = 'Enter a zip code';
          this.anyValidationError = true;
        } else if (!this.zipCodeRegEx.test(this.zipCodeInput)) {
          this.zipCodeErrorMessage = 'Enter a valid zip code';
          this.anyValidationError = true;
        } else {
          this.zipCodeErrorMessage = '';
        }
      },
      validateUrbanizationCodeOnSubmit() {
        if (this.urbanizationCodeInput === '') {
          this.urbanizationCodeErrorMessage = '';
        } else if (!this.urbanizationCodeRegEx.test(this.urbanizationCodeInput)) {
          this.urbanizationCodeErrorMessage = 'Please enter a valid Urbanization Code for Puerto Rico';
          this.anyValidationError = true;
        } else {
          this.urbanizationCodeErrorMessage = '';
        }
      },
      checkAndExtractSearchByAddressValues(e, recaptchaToken) {
        this.resetErrorStatus();
        this.resetStorage();
        this.validateStreetAddressOnSubmit();
        this.validateCityOnSubmit();
        this.validateStateOnSubmit();
        this.validateZipCodeOnSubmit();
        this.validateUrbanizationCodeOnSubmit();

        if (e && typeof e.preventDefault === 'function') {
          e.preventDefault();
        }

        if (!this.anyValidationError) {
          variables.searchStreetAddress = this.streetAddressInput;
          variables.searchCity = this.cityInput;
          variables.searchState = this.stateSelect;
          variables.searchZipCode = this.zipCodeInput;
          if (this.stateSelect === 'PR') {variables.searchUrbanizationCode = this.urbanizationCodeInput;}
          var searchStatus = false;
          variables.searchError = false;
          var CGRAPICallResponse = CommonFunctions.apiCallAjaxCGRGeocoderAPI(recaptchaToken);
          if (CGRAPICallResponse.errorCode === 200 && CGRAPICallResponse.geocoderResult.geocode != null) {
            var geocoderResult = CGRAPICallResponse.geocoderResult;
            var responseCodes = geocoderResult.responseCodes;
            var amsResponseCodesStr = responseCodes && typeof responseCodes.amsResponseCodes === 'string' ? responseCodes.amsResponseCodes : null;
            var granularity = geocoderResult.geocode && typeof geocoderResult.geocode.granularity === 'string' ? geocoderResult.geocode.granularity : null;
            var amsCode = amsResponseCodesStr != null ? parseInt(amsResponseCodesStr.trim().split(/\s+/)[0], 10) : NaN;
            var granularityLower = granularity != null ? granularity.toLowerCase() : '';
            var isAmsAndGranularityInvalid = isNaN(amsCode) || 
              (amsCode !== 31 && amsCode !== 32) || (granularityLower !== 'parcel' && granularityLower !== 'rooftop');
            if (isAmsAndGranularityInvalid) {
              variables.searchErrorMessage = "We couldn't find this address. Please re-enter your address or use Search by Location.";
              this.displayErrorMessage = variables.searchErrorMessage;
              this.emitter.emit('searchErrorMessageChanged', variables.searchErrorMessage);
              this.isMobile ? $("#errorMessageMobile").show() : $("#errorMessageSearchByAddress").show();
              this.emitter.emit('searchComplete', false);
              variables.searchError = true;
              variables.searchType = 'SearchByAddress';
            } else {
              variables.searchLatitude = Number(CGRAPICallResponse.geocoderResult.geocode.latitude);
              variables.searchLongitude = Number(CGRAPICallResponse.geocoderResult.geocode.longitude);

              variables.searchStreetAddress = CGRAPICallResponse.geocoderResult.processedAddress.address.addressLine1;
              if (CGRAPICallResponse.geocoderResult.processedAddress.address.addressLine2 != null)
                variables.searchStreetAddress = variables.searchStreetAddress + " " + CGRAPICallResponse.geocoderResult.processedAddress.address.addressLine2
              if (CGRAPICallResponse.geocoderResult.processedAddress.address.unit != null)
                variables.searchStreetAddress = variables.searchStreetAddress + " " + CGRAPICallResponse.geocoderResult.processedAddress.address.unit

              variables.searchCity = CGRAPICallResponse.geocoderResult.processedAddress.address.city;
              variables.searchState = CGRAPICallResponse.geocoderResult.processedAddress.address.state;
              variables.searchZipCode = CGRAPICallResponse.geocoderResult.processedAddress.address.zip;
              if (this.stateSelect === 'PR') {variables.searchUrbanizationCode = CGRAPICallResponse.geocoderResult.processedAddress.address.urbanizationCode;}

              CommonFunctions.apiCallAjaxCartoV3Async(variables.checkStatusOfLatLongInLifelineTribalLands.replace("inputLat", variables.searchLatitude).replace("inputLong", variables.searchLongitude))
              .then((cartoLocationsAPIResponse) => {
                if (cartoLocationsAPIResponse.errorCode != 200) {
                  variables.searchErrorMessage = 'An error occurred while processing the request. Please try again later.';
                  this.displayErrorMessage = variables.searchErrorMessage;
                  this.emitter.emit('searchErrorMessageChanged', variables.searchErrorMessage);
                  this.isMobile ? $("#errorMessageMobile").show() : $("#errorMessageSearchByAddress").show();
                  this.emitter.emit('searchComplete', false);
                  variables.searchError = true;
                  variables.searchType = 'SearchByAddress';
                } else if (cartoLocationsAPIResponse.downloadedData == undefined) {
                  variables.searchErrorMessage = 'An error occurred while processing the request. Please try again later.';
                  this.displayErrorMessage = variables.searchErrorMessage;
                  this.emitter.emit('searchErrorMessageChanged', variables.searchErrorMessage);
                  this.isMobile ? $("#errorMessageMobile").show() : $("#errorMessageSearchByAddress").show();
                  this.emitter.emit('searchComplete', false);
                  variables.searchError = true;
                  variables.searchType = 'SearchByAddress';
                } else {
                  searchStatus = cartoLocationsAPIResponse.downloadedData.status;
                  if (searchStatus) {
                    this.isMobile ? $("#successMessageMobile").show() : $("#successMessageSearchByAddress").show();
                  } else {
                    this.isMobile ? $("#failureMessageMobile").show() : $("#failureMessageSearchByAddress").show();
                  }
                  this.emitter.emit('showLocationOnMap', 'SearchByAddress', searchStatus);
                }
              });
            }
          } else {
            variables.searchErrorMessage = 'An error occurred while processing the request. Please try again later.';
            this.displayErrorMessage = variables.searchErrorMessage;
            this.emitter.emit('searchErrorMessageChanged', variables.searchErrorMessage);
            this.isMobile ? $("#errorMessageMobile").show() : $("#errorMessageSearchByAddress").show();
            this.emitter.emit('searchComplete', false);
            variables.searchError = true;
            variables.searchType = 'SearchByAddress';
          }
        } else {
          this.emitter.emit('searchComplete', false);
        }
      },
      clearSearchByAddressValues() {
        this.resetErrorStatus();
        this.resetStorage();
        this.resetFields();
      },
      resetErrorStatus() {
        variables.searchError = false;
        variables.searchErrorMessage = '';
        this.displayErrorMessage = '';
        this.emitter.emit('searchErrorMessageChanged', '');
        this.anyValidationError = false;
        this.streetAddressErrorMessage = '';
        this.cityErrorMessage = '';
        this.stateErrorMessage = '';
        this.zipCodeErrorMessage = '';
        this.urbanizationCodeErrorMessage = '';
        $("#successMessageSearchByAddress").hide();
        $("#failureMessageSearchByAddress").hide();
        $("#errorMessageSearchByAddress").hide();
        $("#successMessageMobile").hide();
        $("#failureMessageMobile").hide();
        $("#errorMessageMobile").hide();
      },
      resetStorage() {
        variables.searchStreetAddress = '';
        variables.searchCity = '';
        variables.searchState = '';
        variables.searchZipCode = '';
        variables.searchUrbanizationCode = null;
        variables.searchLatitude = '';
        variables.searchLongitude = '';
      },
      resetFields() {
        this.streetAddressInput = '';
        this.cityInput = '';
        this.stateSelect = null;
        this.zipCodeInput = '';
        this.urbanizationCodeInput = '';
        $("#zipCodeClass").removeClass('indi-col-lg-4').addClass('indi-col-lg-8');
        $("#urbanizationCodeDisplay").hide();
      },
    },
  }
</script>
<style>
  #searchByAddress {
    padding: 24px 24px 0px 24px;
    background: #fff;
    overflow-y: visible;
  }
  .indi-form__input {
    margin: 0px !important;
  }
  .indi-form__input-group {
    margin-bottom: 0px !important;
    padding-bottom: 24px !important;
  }
  .indi-col-lg-12 {
    width: 100% !important;
  }
  .indi-col-lg-8 {
    width: 67% !important;
  }
  .indi-col-lg-4 {
    width: 33% !important;
  }
  .indi-col-lg-4, .indi-col-lg-8, .indi-col-lg-12 {
    padding-left: 0px;
    padding-right: 0px;
  }
  #vs1__listbox {
    max-height: 250px !important;
  }
  .vs__dropdown-menu {
    min-width: auto;
  }
  .learnMoreTextSuccessSearchByAddress {
    background-color: #e4f1c9;
  }
  .learnMoreTextFailureSearchByAddress {
    background-color: #ffeecc;
  }
  .learnMoreSystemErrorSearchByAddress {
    background-color: #f9eaec;
  }
  .learnMoreTextSuccessSearchByAddress,
  .learnMoreTextFailureSearchByAddress,
  .learnMoreSystemErrorSearchByAddress {
    padding: 12px 16px;
    p {
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      margin-top: 0px;
    }
  }
</style>