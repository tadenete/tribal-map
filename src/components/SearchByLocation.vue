<template>
  <div id="searchByLocation">
    <i-grid>
      <i-input-group label="Latitude" label-for="latitude" class="indi-col-lg-12">
        <i-input id="latitude" v-model="latitudeInput" aria-label="Latitude" maxlength="18" @focus="validateLatitude" @blur="validateLatitudeOnSubmit" @keyup="validateLatitude" :invalid="latitudeErrorMessage !== ''"/>
        <i-help-text text="Latitude (e.g., 37.7749)" />
        <i-input-notification v-bind:text="latitudeErrorMessage"/>
      </i-input-group>
      <i-input-group label="Longitude" label-for="longitude" class="indi-col-lg-12">
        <i-input id="longitude" v-model="longitudeInput" aria-label="Longitude" maxlength="19" @focus="validateLongitude" @blur="validateLongitudeOnSubmit" @keyup="validateLongitude" :invalid="longitudeErrorMessage !== ''"/>
        <i-help-text text="Longitude (e.g., -122.4194)" />
        <i-input-notification v-bind:text="longitudeErrorMessage"/>
      </i-input-group>
    </i-grid>
    <div id="messageStatusSearchByLocation" :style="!isMobile ? 'min-height: 58px;':'height: auto !important;'">
      <div id="successMessageSearchByLocation" class="learnMoreTextSuccessSearchByLocation">
        <i-long-form-text><p>Your address is on qualifying Tribal lands. Learn more about <a id="tribalLandsLinkSuccess" href="https://www.lifelinesupport.org/" target="_blank">how to apply</a>.</p></i-long-form-text>
      </div>
      <div id="failureMessageSearchByLocation" class="learnMoreTextFailureSearchByLocation">
        <i-long-form-text><p>Your address is not on qualifying Tribal lands. You may still qualify for the standard Lifeline benefit. Learn more about <a id="tribalLandsLinkFailure" href="https://www.lifelinesupport.org/do-i-qualify/" target="_blank">how to get Lifeline</a>.</p></i-long-form-text>
      </div>
      <div id="errorMessageSearchByLocation" class="learnMoreSystemErrorSearchByLocation">
        <i-long-form-text><p>An error occurred while processing the request. Please try again later.</p></i-long-form-text>
      </div>
    </div>
  </div>
</template>
<script>
  import {IInput, IInputGroup, IGrid, IInputNotification, IHelpText, ILongFormText} from 'indigo-component-library'
  import variables from './variables.js';
  import CommonFunctions from './CommonFunctions.vue';
  import $ from 'jquery'
  window.jQuery = window.$ = $

  export default {
    name: "SearchByLocation",
    components: {IInput, IInputGroup, IGrid, IInputNotification, IHelpText, ILongFormText},
    props: {
      isMobile: {
        type: Boolean,
        required: true
      }
    },
    mounted() {
      variables.searchError = false;
      $("#successMessageSearchByLocation").hide();
      $("#failureMessageSearchByLocation").hide();
      $("#errorMessageSearchByLocation").hide();
      this.emitter.on('checkAndExtractSearchByLocationValues', (e) => {
        return this.checkAndExtractSearchByLocationValues(e);
      });
      this.emitter.on('clearSearchByLocationValues', () => {
        return this.clearSearchByLocationValues();
      });
    },
    data() {
      return {
        latitudeInput: '',
        longitudeInput: '',
        latitudeErrorMessage: '',
        longitudeErrorMessage: '',
        anyValidationError: false,
        latitudeRegEx: /^(\+|-)?(?:90(?:(?:\.0{1,15})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,15})?))$/,
        longitudeRegEx: /^(\+|-)?(?:180(?:(?:\.0{1,15})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,15})?))$/,
        numberOnlyRegEx: /^[+-]?(\d*\.)?\d+$/,
        verificationCompleted: false,
      }
    },
    methods: {
      validateLatitude(e) {
        if (this.latitudeInput != '' && !this.numberOnlyRegEx.test(this.latitudeInput)) {
          this.latitudeErrorMessage = 'Only numbers are allowed';
        } else if (this.latitudeInput != '' && !this.latitudeRegEx.test(this.latitudeInput)) {
          this.latitudeErrorMessage = 'Latitude must be between -90 and 90';
        } else {
          this.latitudeErrorMessage = '';
        }
        this.emitter.emit('formInputChanged');
        if (e != null && e.key === 'Enter') {this.emitter.emit('triggerSearchButtonClick', e);}
      },
      validateLongitude(e) {
        if (this.longitudeInput != '' && !this.numberOnlyRegEx.test(this.longitudeInput)) {
          this.longitudeErrorMessage = 'Only numbers are allowed';
        } else if (this.longitudeInput != '' && !this.longitudeRegEx.test(this.longitudeInput)) {
          this.longitudeErrorMessage = 'Longitude must be between -180 and 180';
        } else {
          this.longitudeErrorMessage = '';
        }
        this.emitter.emit('formInputChanged');
        if (e != null && e.key === 'Enter') {this.emitter.emit('triggerSearchButtonClick', e);}
      },
      validateLatitudeOnSubmit() {
        if (this.latitudeInput === '') {
          this.latitudeErrorMessage = 'Latitude is required';
          this.anyValidationError = true;
        } else if (!this.numberOnlyRegEx.test(this.latitudeInput)) {
          this.latitudeErrorMessage = 'Only numbers are allowed';
          this.anyValidationError = true;
        } else if (!this.latitudeRegEx.test(this.latitudeInput)) {
          this.latitudeErrorMessage = 'Latitude must be between -90 and 90';
          this.anyValidationError = true;
        } else {
          this.latitudeErrorMessage = '';
        }
      },
      validateLongitudeOnSubmit() {
        if (this.longitudeInput === '') {
          this.longitudeErrorMessage = 'Longitude is required';
          this.anyValidationError = true;
        } else if (!this.numberOnlyRegEx.test(this.longitudeInput)) {
          this.longitudeErrorMessage = 'Only numbers are allowed';
          this.anyValidationError = true;
        } else if (!this.longitudeRegEx.test(this.longitudeInput)) {
          this.longitudeErrorMessage = 'Longitude must be between -180 and 180';
          this.anyValidationError = true;
        } else {
          this.longitudeErrorMessage = '';
        }
      },
      checkAndExtractSearchByLocationValues(e) {
        this.resetErrorStatus();
        this.resetStorage();
        this.validateLatitudeOnSubmit();
        this.validateLongitudeOnSubmit();

        e.preventDefault();

        if (!this.anyValidationError) {
          var searchStatus = false;
          variables.searchError = false;
          variables.searchLatitude = Number(this.latitudeInput);
          variables.searchLongitude = Number(this.longitudeInput);
          CommonFunctions.apiCallAjaxCartoV3Async(variables.checkStatusOfLatLongInLifelineTribalLands.replace("inputLat", variables.searchLatitude).replace("inputLong", variables.searchLongitude))
          .then((cartoLocationsAPIResponse) => {
            if (cartoLocationsAPIResponse.errorCode != 200) {
              this.isMobile ? $("#errorMessageMobile").show() : $("#errorMessageSearchByLocation").show();
              this.emitter.emit('searchComplete', false);
              variables.searchError = true;
              variables.searchType = 'SearchByLocation';
            } else if (cartoLocationsAPIResponse.downloadedData == undefined) {
              this.isMobile ? $("#errorMessageMobile").show() : $("#errorMessageSearchByLocation").show();
              this.emitter.emit('searchComplete', false);
              variables.searchError = true;
              variables.searchType = 'SearchByLocation';
            } else {
              searchStatus = cartoLocationsAPIResponse.downloadedData.status;
              if (searchStatus) {
                this.isMobile ? $("#successMessageMobile").show() : $("#successMessageSearchByLocation").show();
              } else {
                this.isMobile ? $("#failureMessageMobile").show() : $("#failureMessageSearchByLocation").show();
              }
              this.emitter.emit('showLocationOnMap', 'SearchByLocation', searchStatus);
            }
          });
        } else {
          this.emitter.emit('searchComplete', false);
        }
      },
      clearSearchByLocationValues() {
        this.resetErrorStatus();
        this.resetStorage();
        this.resetFields();
      },
      resetErrorStatus() {
        variables.searchError = false;
        this.anyValidationError = false;
        this.latitudeErrorMessage = '';
        this.longitudeErrorMessage = '';
        $("#successMessageSearchByLocation").hide();
        $("#failureMessageSearchByLocation").hide();
        $("#errorMessageSearchByLocation").hide();
        $("#successMessageMobile").hide();
        $("#failureMessageMobile").hide();
        $("#errorMessageMobile").hide();
      },
      resetStorage() {
        variables.searchLatitude = '';
        variables.searchLongitude = '';
      },
      resetFields() {
        this.latitudeInput = '';
        this.longitudeInput = '';
      }
    },
  }
</script>
<style>
  #searchByLocation {
    padding: 24px 24px 0px 24px;
    background: #fff;
    overflow-y: visible;
  }
  .learnMoreTextSuccessSearchByLocation {
    background-color: #e4f1c9;
  }
  .learnMoreTextFailureSearchByLocation {
    background-color: #ffeecc;
  }
  .learnMoreSystemErrorSearchByLocation {
    background-color: #f9eaec;
  }
  .learnMoreTextSuccessSearchByLocation,
  .learnMoreTextFailureSearchByLocation,
  .learnMoreSystemErrorSearchByLocation {
    padding: 12px 16px;
    p {
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      margin-top: 0px;
    }
  }
</style>