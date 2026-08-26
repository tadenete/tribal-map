<template>
  <div id="homePage">
    <div id="headerPanel">
      <i-app-header class="indigoHeader" title="" />
    </div>
    <div id="applicationContent">
      <div id="applicationContentInner">
        <div id="mapInformationHeader">
          <i-long-form-text>
            <h1>Tribal Lands Verification Tool</h1>
            <p>Use this tool to see if your address is on qualifying Tribal lands. This tool is for informational purposes. It may not accurately show where you live if your address can't be found.</p>
            <p>If you live on qualifying Tribal lands, you may be eligible to get a Lifeline discount of up to $34.25 per month and a one-time Link Up discount up to $100. Learn more and apply at <a id="lifelineSupportLink" href="https://www.lifelinesupport.org/" target="_blank">LifelineSupport.org<i-icon class="externalLinkIcon" name="External Link" valign="valign-middle"><IconExternalLink /></i-icon></a>.</p>
          </i-long-form-text>
        </div>
        <div id="searchResultBanner">
          <div id="successMessageMobile" class="mobileSearchResultBanner mobileLearnMoreTextSuccessSearch">
            <i-long-form-text>
              <h4 aria-level="2">Tribal land.</h4>
              <p style="font-weight: 600;">Your address is on qualifying Tribal lands. Learn more about <a id="tribalLandsLinkSuccess" href="https://www.lifelinesupport.org/" target="_blank">how to apply</a>.</p>
              <p>To retain a copy of the results, take a screenshot or save them as a PDF from your browser.</p>
            </i-long-form-text>
          </div>
          <div id="failureMessageMobile" class="mobileSearchResultBanner mobileLearnMoreTextFailureSearch">
            <i-long-form-text>
              <h4 aria-level="2">Non Tribal land.</h4>
              <p style="font-weight: 600;">Your address is not on qualifying Tribal lands. You may still qualify for the standard Lifeline benefit. Learn more about <a id="tribalLandsLinkFailure" href="https://www.lifelinesupport.org/do-i-qualify/" target="_blank">how to get Lifeline</a>.</p>
              <p>To retain a copy of the results, take a screenshot or save them as a PDF from your browser.</p>
            </i-long-form-text>
          </div>
          <div id="errorMessageMobile" class="mobileSearchResultBanner mobileLearnMoreTextErrorSearch">
            <i-long-form-text>
              <p style="font-weight: 600;margin-top: 0px;">{{ addressErrorDisplayMessage }}</p>
            </i-long-form-text>
          </div>
        </div>
        <div id="mapArea" :style="!isMobile ? 'min-height: 788px;' : 'min-height: 300px;'">
          <div class="searchPanelLayout">
            <SearchPanel :isMobile="isMobile" />
          </div>
          <div id="cartoDeckGLLeafletMap"><CartoDeckGLLeafletMap :isMobile="isMobile" /></div>
          <BrowserCompatibilityModal />
        </div>
        <div id="mapInformationFooter">
          <i-long-form-text><hr>
            <div style="padding-top: 24px;"><h6 aria-level="2">Share Feedback</h6></div>
            <p>If you would like to share feedback or experience an issue while using this tool, please email <a id="applyForTribalLandsLink" href="mailto:LifelineProgram@usac.org" target="_blank">LifelineProgram@usac.org</a>.</p>
          </i-long-form-text>
        </div>
      </div>
    </div>
    <div id="footerPanel">
      <i-app-footer class="indigoFooter" :legal-links="[{href: 'releasenotes.html', text: 'Release Notes', target:'_blank'}, {href: 'https://www.usac.org/about/privacy-policies/', text: 'Privacy Policies', target:'_blank'}]" />
    </div>
  </div>
</template>
<script>
  import {IAppHeader, IIcon, ILongFormText, IAppFooter} from 'indigo-component-library'
  import {IconExternalLink} from 'indigo-component-library/src/components/Icon/Icons'
  import CartoDeckGLLeafletMap from './CartoDeckGLLeafletMap.vue'
  import SearchPanel from './SearchPanel.vue'
  import BrowserCompatibilityModal from './BrowserCompatibilityModal.vue'
  import emitter from 'tiny-emitter/instance';
  import variables from './variables.js';
  import HomePage from './HomePage.vue';
  import $ from 'jquery'
  window.jQuery = window.$ = $

  export default {
    name: 'HomePage',
    components: {IAppHeader, IIcon, IconExternalLink, ILongFormText, IAppFooter, CartoDeckGLLeafletMap, SearchPanel, BrowserCompatibilityModal},
    computed: {
      addressErrorDisplayMessage() {
        return this.displayErrorMessage || variables.searchErrorMessage || 'An error occurred while processing the request. Please try again later.';
      }
    },
    data() {
      return {
        isMobile: false,
        displayErrorMessage: '',
      };
    },
    mounted() {
      this.isMobile = variables.isMobile;
      this.emitter.on('searchErrorMessageChanged', (msg) => {
        this.displayErrorMessage = msg;
      });
      $(".indi-app-header__home-link-wrap a").attr("target", "_blank");
      $(window).resize(function(){HomePage.dynamicScreenResize();});
      setTimeout(function(){HomePage.dynamicScreenResize();}, 1000);
      this.emitter.emit('triggerCheckBrowserCompatibilityMessage');
      window.addEventListener('resize', this.updateDeviceType);
      this.fix508ComplianceIssues();
      this.removeTabFocusCSSOnMouseClick();
      this.injectTabFocusCSSOnTabPress();
      $("#successMessageMobile").hide();
      $("#failureMessageMobile").hide();
      $("#errorMessageMobile").hide();
    },
    beforeDestory() {
      window.removeEventListener('resize', this.updateDeviceType());
    },
    methods: {
      updateDeviceType() {
        this.isMobile = variables.isMobile;
      },
      fix508ComplianceIssues() {
        $(".indi-app-header__title").attr("role", "heading").attr("aria-level", "1");
        $("#vs1__combobox input").attr("role", "textbox");
        $("#vs1__combobox button").attr("role", "button");
        $("div.v-select.vs--single.vs--searchable.indi-form__select.indi-form__select--medium").removeAttr("aria-describedby");
        $(".indi-tab__cell").on("focusin focusout", function(e) {$(this).toggleClass("indi-border-highlight");});
      },
      removeTabFocusCSSOnMouseClick() {
        $(document).on("mousedown", function(e) {
          $('body').removeClass("focus508ComplianceOnTabPress");
          $('body').addClass("focus508ComplianceRemoveBorderOutlineOnMouseClick");
        });
      },
      injectTabFocusCSSOnTabPress() {
        $(document).keydown(function(e) {
          if (e.which == 9) {
            $('body').addClass("focus508ComplianceOnTabPress");
            $('body').removeClass("focus508ComplianceRemoveBorderOutlineOnMouseClick");
          }
        });
      },
    },
    dynamicScreenResize() {
      if (window.innerWidth <= variables.lowResolutionWidth) {
        variables.defaultMapLongitude = variables.defaultMapLongitudeLowResolution;
        $('#mapArea').css('height', variables.mobile_map_height);
        $('#map').css('height', variables.mobile_map_height);
        $('#mapInformationHeader').addClass("mobileVersionMapInfoHeader");
        $('#mapInformationFooter').addClass("mobileVersionMapInfoFooter");
      } else {
        variables.defaultMapLongitude = variables.defaultMapLongitudeLHighesolution;
        $('#mapArea').css('height', variables.map_height);
        $('#map').css('height', variables.map_height);
        $('#mapInformationHeader').removeClass("mobileVersionMapInfoHeader");  
        $('#mapInformationFooter').removeClass("mobileVersionMapInfoFooter");  
      }
      if (variables.isMobile != (window.innerWidth <= variables.lowResolutionWidth)) {
        if (variables.marker != '') {
          emitter.emit('changePopupAndStatusMessageOrientation', variables.isMobile);
        }
        if (variables.searchError) {
          if (variables.isMobile) {
            $("#errorMessageMobile").hide();
            if (variables.searchType === 'SearchByAddress') $("#errorMessageSearchByAddress").show();
            if (variables.searchType === 'SearchByLocation') $("#errorMessageSearchByLocation").show();
          } else {
            $("#errorMessageSearchByAddress").hide();
            $("#errorMessageSearchByLocation").hide();
            $("#errorMessageMobile").show();
          }
        }
      }
      variables.isMobile = window.innerWidth <= variables.lowResolutionWidth;
    },
  }
</script>
<style>
  #applicationContent {
    @media (max-width: 599px) {
      margin-left: 16px;
      margin-right: 16px;
    }
    @media (min-width: 600px) {
      margin-left: 32px;
      margin-right: 32px;
    }
    @media (max-width: 599px) {
      #mapArea {
        display: flex;
        flex-direction: column-reverse;
        height: unset !important;
      }
      .searchPanelLayout {
        width: auto !important;
        max-width: 100% !important;
        height: auto !important;
        position: unset !important;
      }
    }
  }
  #applicationContentInner {
    margin: 0 auto;
    max-width: 1200px;
  }
  #mapArea {
    height: 100%;
    position: relative;
  }
  #mapInformationHeader {
    padding: 48px 0px 32px 0px;
    .indi-long-form-text a {
      font-size: 18px !important;
    }
  }
  #mapInformationHeader.mobileVersionMapInfoHeader {
    padding: 32px 0px 16px 0px;
    .indi-long-form-text a {
      font-size: 16px !important;
    }
    .indi-long-form-text p {
      font-size: 16px !important;
    }
  }
  .externalLinkIcon {
    height: 18px !important;
    width: 18px !important;
    margin-left: 4px;
  }
  .searchPanelLayout {
    width: 455px;
    max-width: 455px;
    height: 756px;
    max-height: 756px;
    left: 16px;
    top: 16px;
    position: absolute;
    background: #fff;
    border: solid 0.5px #9e9e9e;
    z-index: 3;
  }
  #mapInformationFooter {
    padding: 48px 0px;
    .indi-long-form-text a {
      font-size: 18px !important;
    }
  }
  #mapInformationFooter.mobileVersionMapInfoFooter {
    .indi-long-form-text a {
      font-size: 16px !important;
    }
  }
  .focus508ComplianceOnTabPress .indi-border-highlight {
    outline: 5px auto rgba(0, 0, 0, 1) !important;
    -webkit-outline: 5px auto rgba(0, 0, 0, 1) !important;
    -moz-outline: 5px auto rgba(0, 0, 0, 1) !important;
    -ms-outline: 5px auto rgba(0, 0, 0, 1) !important;
    -o-outline: 5px auto rgba(0, 0, 0, 1) !important;
    border: 5px auto rgba(0, 0, 0, 1) !important;
  }
  .indigoFooter {
    width: 100%;
    bottom: 0px;
    position: relative;

    a:focus, a:hover {
      color: #0052EB;
    }
  }
  .indi-app-footer__legal {
    display: none;
  }
  .indi-app-footer__legal-links {
    width: 100% !important;
  }
  .mobileSearchResultBanner {
    flex-grow: 0;
    margin-bottom: 16px;
  }
  .mobileLearnMoreTextSuccessSearch {
    background-color: #e4f1c9;
  }
  .mobileLearnMoreTextFailureSearch {
    background-color: #ffeecc;
  }
  .mobileLearnMoreTextErrorSearch {
    background-color: #f9eaec;
  }
  .mobileLearnMoreTextSuccessSearch,
  .mobileLearnMoreTextFailureSearch,
  .mobileLearnMoreTextErrorSearch {
    padding: 12px 12px 12px 12px;
    p {
      font-size: 14px !important; 
      font-stretch: normal;
      font-style: normal;
      line-height: 1.29;
      letter-spacing: normal;
      text-align: left;
      flex-grow: 0;
      margin: 8px 0px 0px 0px;
    }
    a {
      font-size: 14px !important;
    }
  }
</style>