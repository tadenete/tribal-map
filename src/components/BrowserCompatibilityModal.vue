<template>
  <div id="browserCompatibility">
    <i-modal id="browserCompatibilityModal" class="browserCompatibilityModalCSS" ref="browserCompatibilityModal" header="Browser Compatibility Information" body="You are currently viewing the Tribal Lands Verification Tool using an unsupported browser, <div id='userBrowserDetails' class='div-inline' style='font-weight: 600'></div>. For the best experience, please use one of the following supported browsers:<br><br><ul><li>Microsoft Edge, v128.0 or later</li><li>Mozilla Firefox, v129.0 or later</li><li>Google Chrome, v128.0 or later</li><li>Safari, v17.3 or later</li></ul><br>" primary-button-label="Continue" v-on:on-primary-button-click="continueButtonClicked()" />
  </div>
</template>
<script>
  import {IModal} from 'indigo-component-library'
  import variables from './variables.js';

  export default {
    name: "BrowserCompatibilityModal",
    components: {IModal},
    mounted() {
      this.emitter.on('triggerCheckBrowserCompatibilityMessage', () => {
        return this.detectBrowserDetails();
      });
    },
    methods: {
      detectBrowserDetails() {
        var browserAndOSDetails = detect.parse(navigator.userAgent);
        variables.browserName = browserAndOSDetails.browser.family;
        variables.browserVersion = browserAndOSDetails.browser.major + (browserAndOSDetails.browser.minor/10);
        this.checkAndTriggerBrowserCompatibilityMessage();
        $("script[src='https://cdnjs.cloudflare.com/ajax/libs/Detect.js/2.2.2/detect.min.js']").remove();
      },
      checkAndTriggerBrowserCompatibilityMessage() {
        var browserCompatibilityModalDisplayed = false;
        if (variables.browserName == "Chrome" || variables.browserName == "Firefox" || variables.browserName == "Edge" || variables.browserName == "Safari" || variables.browserName == "Chrome Mobile" || variables.browserName == "Chrome Mobile iOS" || variables.browserName == "Mobile Safari" || variables.browserName == "Firefox Mobile") {
          if ((variables.browserName == "Chrome" && variables.browserVersion < 128) || 
            (variables.browserName == "Chrome Mobile" && variables.browserVersion < 133) || 
            (variables.browserName == "Chrome Mobile iOS" && variables.browserVersion < 92)) {
            browserCompatibilityModalDisplayed = true;
          } else if ((variables.browserName == "Firefox" && variables.browserVersion < 129)  || 
            (variables.browserName == "Firefox Mobile" && variables.browserVersion < 139)) {
            browserCompatibilityModalDisplayed = true;
          } else if (variables.browserName == "Edge" && variables.browserVersion < 128) {
            browserCompatibilityModalDisplayed = true;
          } else if ((variables.browserName == "Safari" && variables.browserVersion < 17.3) || 
            (variables.browserName == "Mobile Safari" && variables.browserVersion < 16.6)) {
            browserCompatibilityModalDisplayed = true;
          }
        } else {
          browserCompatibilityModalDisplayed = true;
        }
        if (browserCompatibilityModalDisplayed) {
          this.$refs.browserCompatibilityModal.toggleOpen();
          setTimeout(function() {$("#userBrowserDetails").html(variables.browserName + " - version " + variables.browserVersion);}, 100);
        }
      },
      continueButtonClicked() {
        this.$refs.browserCompatibilityModal.toggleOpen();
      }
    },
  }
</script>
<style>
  #browserCompatibility {
    right: 0px;
    position: absolute;
    z-index: 4;
  }
  .indi-modal__footer .indi-button--primary {
    min-width: unset;
  }
  .browserCompatibilityTrigger {
    padding-top: 10px !important;
    position: absolute;
  }
</style>