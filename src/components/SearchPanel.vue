<template>
  <div id="searchTabsDiv">
    <i-loader variant="overlay" v-if="isLoading" aria-valuetext="Loading..."/>
    <div class="search-panel-tab-scroll">
      <i-tab default-tab="SearchByAddressTab">
        <template #SearchByAddressTab>
          <i-tab-content name="SearchByAddressTab" label="Search by Address" :active="true">
            <SearchByAddress :isMobile="isMobile" ref="addressRef" />
          </i-tab-content>
        </template>
        <template #SearchByLocationTab>
          <i-tab-content name="SearchByLocationTab" label="Search by Location">
            <SearchByLocation :isMobile="isMobile" ref="locationRef" />
          </i-tab-content>
        </template>
      </i-tab>
    </div>
    <div
      id="recaptchaSection"
      v-if="showRecaptcha"
      :class="['recaptcha-section', { 'recaptcha-section--solved': recaptchaGlobalState === 'solved' }]"
      :aria-hidden="recaptchaGlobalState === 'solved' ? 'true' : 'false'"
    >
      <div id="recaptchaContainer" class="recaptcha-container"></div>
    </div>
    <div v-if="bypassRecaptcha && showRecaptcha" class="bypass-notice">
      <i-long-form-text><p>⚠️ reCAPTCHA bypassed (VITE_BYPASS_RECAPTCHA=true)</p></i-long-form-text>
    </div>
    <div id="searchTabsFooter">
      <div id="searchButtonPanel">
        <i-button id="searchButton" label="Search" class="searchButtonCSS" variant="primary" @click="searchButtonClick" :disabled="recaptchaGlobalState !== 'solved'"/>
        <i-button id="clearButton" label="Clear" class="clearButtonCSS" variant="tertiary" @click="clearButtonClick"/>
      </div>
    </div>
  </div>
</template>
<script>
  import {ITab, ITabContent, ILoader, IButton, ILongFormText} from 'indigo-component-library'
  import SearchByAddress from './SearchByAddress.vue';
  import SearchByLocation from './SearchByLocation.vue';
  import CartoDeckGLLeafletMap from './CartoDeckGLLeafletMap.vue';
  import variables from './variables.js';
  import $ from 'jquery'
  window.jQuery = window.$ = $

  export default {
    name: "DataTablesTabs",
    components: {ITab, ITabContent, ILoader, IButton, ILongFormText, SearchByAddress, SearchByLocation},
    props: {
      isMobile: {
        type: Boolean,
        required: true
      }
    },
    mounted() {
      $("#SearchByAddressTab").click(this.searchByAddress_TabClick);
      $("#SearchByLocationTab").click(this.searchByLocation_TabClick);
      this.emitter.on('triggerSearchButtonClick', (e) => {
        return this.searchButtonClick(e);
      });
      this.emitter.on('searchComplete', (searchStatus) => {
        return this.searchComplete(searchStatus);
      });
      
      // Set up event listeners for form input changes
      this.emitter.on('formInputChanged', () => {
        this.checkFormCompletion();
      });

      // Log bypass status for debugging
      // if (this.bypassRecaptcha) {
      //   console.log('reCAPTCHA bypass enabled (VITE_BYPASS_RECAPTCHA=true)');
      // }

      // Initialize reCAPTCHA after DOM is updated
      this.$nextTick(() => {
        this.initRecaptcha();
      });
    },
    data() {
      return {
        searchByAddressTabActive: true,
        isLoading: false,
        recaptchaGlobalState: 'pending', // 'pending' | 'solved' | 'reset'
        recaptchaWidgetId: null,
        recaptchaResponseToken: '',
        showRecaptcha: false,
        recaptchaInitialized: false,
        // Bypass reCAPTCHA using environment variable
        bypassRecaptcha: import.meta.env.VITE_BYPASS_RECAPTCHA === 'true',
      };
    },
    computed: {
      recaptchaSiteKey() {
        return import.meta.env.VITE_RECAPTCHA_SITE_KEY;
      }
    },
    methods: {
      initRecaptcha() {
        this.recaptchaInitialized = false;
      },
      renderRecaptcha() {
        if (this.recaptchaInitialized) return;

        // If bypass is enabled, automatically set as solved
        if (this.bypassRecaptcha) {
          this.recaptchaGlobalState = 'solved';
          this.showRecaptcha = false;
          return;
        }

        const container = document.getElementById('recaptchaContainer');
        if (!container) return;

        container.innerHTML = '';
        const checkRecaptcha = () => {
          if (typeof grecaptcha !== 'undefined') {
            if (grecaptcha.enterprise && grecaptcha.enterprise.ready) {
              grecaptcha.enterprise.ready(() => {
                try {
                  this.recaptchaWidgetId = grecaptcha.enterprise.render('recaptchaContainer', {
                    'sitekey': this.recaptchaSiteKey,
                    'callback': (response) => {
                      if (response) {
                        this.recaptchaResponseToken = response;
                        this.recaptchaGlobalState = 'solved';
                        this.$nextTick(() => {
                          this.focusSearchButton();
                        });
                      }
                    },
                    'expired-callback': () => {
                      this.recaptchaResponseToken = '';
                      this.recaptchaGlobalState = 'pending';
                    },
                    'error-callback': () => {
                      this.recaptchaResponseToken = '';
                      this.recaptchaGlobalState = 'pending';
                    }
                  });
                  this.recaptchaInitialized = true;
                } catch (error) {
                  console.error('reCAPTCHA render error:', error);
                }
              });
            } else {
              setTimeout(checkRecaptcha, 100);
            }
          } else {
            setTimeout(checkRecaptcha, 100);
          }
        };
        checkRecaptcha();
      },
      resetRecaptcha() {
        if (this.recaptchaInitialized && typeof grecaptcha !== 'undefined' && grecaptcha.enterprise && grecaptcha.enterprise.reset && this.recaptchaWidgetId !== null) {
          try {
            grecaptcha.enterprise.reset(this.recaptchaWidgetId);
          } catch (error) {
            console.error('reCAPTCHA reset error:', error);
          }
        }
        this.showRecaptcha = false;
        this.recaptchaResponseToken = '';
        this.recaptchaGlobalState = 'pending';
        this.recaptchaInitialized = false;
        this.recaptchaWidgetId = null;
      },
      checkFormCompletion() {
        if (this.searchByAddressTabActive) {
          const addressRef = this.$refs.addressRef;
          if (addressRef) {
            const isAddressFormFilled = 
              addressRef.streetAddressInput && 
              addressRef.cityInput && 
              addressRef.stateSelect && 
              addressRef.zipCodeInput &&
              addressRef.streetAddressErrorMessage === '' &&
              addressRef.cityErrorMessage === '' &&
              addressRef.stateErrorMessage === '' &&
              addressRef.zipCodeErrorMessage === '' &&
              addressRef.urbanizationCodeErrorMessage === '';

            const wasShowing = this.showRecaptcha;
            this.showRecaptcha = isAddressFormFilled;

            if (!wasShowing && this.showRecaptcha) {
              this.recaptchaInitialized = false;
              this.$nextTick(() => {
                this.renderRecaptcha();
              });
            }
          }
        } else {
          const locationRef = this.$refs.locationRef;
          if (locationRef) {
            const isLocationFormFilled = 
              locationRef.latitudeInput && 
              locationRef.longitudeInput &&
              locationRef.latitudeErrorMessage === '' &&
              locationRef.longitudeErrorMessage === '';

            const wasShowing = this.showRecaptcha;
            this.showRecaptcha = isLocationFormFilled;

            if (!wasShowing && this.showRecaptcha) {
              this.recaptchaInitialized = false;
              this.$nextTick(() => {
                this.renderRecaptcha();
              });
            }
          }
        }
      },
      searchByAddress_TabClick() {
        this.searchByAddressTabActive = true;
        this.clearButtonClick();
        this.emitter.emit('clearSearchByAddressValues');
        this.showRecaptcha = false;

        // Check form completion after tab switch
        this.$nextTick(() => {
          this.checkFormCompletion();
        });
      },
      searchByLocation_TabClick() {
        this.searchByAddressTabActive = false;
        this.clearButtonClick();
        this.emitter.emit('clearSearchByLocationValues');
        this.showRecaptcha = false;

        // Check form completion after tab switch
        this.$nextTick(() => {
          this.checkFormCompletion();
        });
      },
      searchButtonClick(e) {
        if (this.recaptchaGlobalState !== 'solved') {
          return false;
        }
        let recaptchaToken = '';
        if (!this.bypassRecaptcha) {
          recaptchaToken = this.recaptchaResponseToken || '';
          if (!recaptchaToken && this.recaptchaWidgetId !== null && typeof grecaptcha !== 'undefined' && grecaptcha.enterprise && grecaptcha.enterprise.getResponse) {
            try {
              recaptchaToken = grecaptcha.enterprise.getResponse(this.recaptchaWidgetId) || '';
            } catch (err) {
              console.warn('reCAPTCHA getResponse failed (widget may be unmounted):', err);
            }
          }
        }
        this.isLoading = true;
        if (this.searchByAddressTabActive) {
          this.emitter.emit('checkAndExtractSearchByAddressValues', { event: e, recaptchaToken });
        } else {
          this.emitter.emit('checkAndExtractSearchByLocationValues', e);
        }
      },
      clearButtonClick() {
        this.emitter.emit('clearSearchByAddressValues');
        this.emitter.emit('clearSearchByLocationValues');
        this.resetViewOnErrorOrClearSearch();
        this.resetRecaptcha();

        this.$nextTick(() => {
          this.checkFormCompletion();
        });
      },
      resetViewOnErrorOrClearSearch() {
        if (variables.marker != '') {
          variables.map.removeLayer(variables.marker);
          variables.marker = '';
        }
        if (variables.displaySatelliteView) {
          CartoDeckGLLeafletMap.satelliteMapSwitchControl();
        }
        if ((variables.map.getBounds().getCenter().lat != variables.defaultMapLatitude) 
            || (variables.map.getBounds().getCenter().lng != variables.defaultMapLongitude) 
            || (variables.map.getZoom() != variables.defaultMapZoom)) {
          variables.map.setView([variables.defaultMapLatitude, variables.defaultMapLongitude], variables.defaultMapZoom);
        }
      },
      searchComplete(searchStatus) {
        this.isLoading = false;
        if (!searchStatus) {
          this.resetViewOnErrorOrClearSearch();
        }
        // reCAPTCHA tokens are single-use; force the user to solve a new
        // challenge before the next search so we never resend a stale token.
        this.resetRecaptcha();
        this.$nextTick(() => {
          this.checkFormCompletion();
        });
      },
      focusSearchButton() {
        const searchButton = document.getElementById('searchButton');
        if (searchButton) {
          searchButton.focus();
        }
      },
    },
  }
</script>
<style>
  #searchTabsDiv {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .search-panel-tab-scroll {
    flex: 1 0 auto;
    overflow: visible;
  }
  #searchTabsFooter {
    flex-shrink: 0;
    width: 100%;
    background: #fff;
  }
  .indi-tab__wrapper {
    margin: 0px !important;
  }
  .indi-tab {
    overflow: unset !important;
    margin: 0px !important;
  }
  .indi-tab__table {
    width: 100%;
  }
  .indi-tab__cell {
    width: 5%;
  }
  .indi-tab__content {
    padding-bottom: 0px;
  }
  #searchButtonPanel {
    padding: 24px;
    position: relative;
  }
  #searchButtonPanel .indi-button {
    min-width: auto !important;
  }
  .searchButtonCSS {
    width: 182px;
    border-radius: 4px;
  }
  .clearButtonCSS {
    color: #616161 !important;
    font-size: 18px !important;
    line-height: 24px !important;
  }
  .recaptcha-section {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    z-index: 1;
    background: #fff;
    margin: 4px 24px 0;
    flex-shrink: 0;
  }
  .recaptcha-section--solved {
    position: absolute;
    left: -10000px;
    top: 0;
    width: 304px;
    height: 78px;
    margin: 0 !important;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
    flex-shrink: 0;
    background: transparent;
    z-index: -1;
  }
  .recaptcha-section--solved .recaptcha-container {
    min-height: 0;
    padding: 0;
  }
  @media (max-width: 768px) {
    .recaptcha-section {
      margin-bottom: 16px;
    }
  }
  .recaptcha-container {
    margin: 0;
    width: 304px;
    min-height: 78px;
    padding: 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bypass-notice {
    position: relative;
    flex-shrink: 0;
    margin: 8px 24px 0;
    padding: 12px 16px;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    text-align: center;
  }
  .bypass-notice p {
    margin: 0;
    font-size: 14px;
    color: #856404;
  }
</style>