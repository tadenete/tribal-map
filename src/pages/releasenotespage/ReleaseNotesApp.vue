<template>
  <div id="headerPanelReleaseNotesPage">
    <i-app-header class="indigoHeader" title="" />
  </div>
  <div id="releaseNotesApplicationContent">
    <div id="releaseNotesApplicationContentInner">
      <div id="releaseNotesBody">
        <i-breadcrumb :items="[{id: 1, label: 'Tribal Lands Eligibility Verification Tool', href: './'}, {id: 2, label: 'Release Notes'},]" />
        <div id="releaseNotesContent">
          <i-long-form-text>
            <h1>Tribal Lands Verification Tool Release Notes</h1>
            <p>The Lifeline Tribal Lands Verification Tool allows consumers to determine if their address is on qualifying Tribal lands. This tool is for informational purposes only and will return results based on the information provided by the user.</p>
            <h2>Tribal Lands Verification Tool 1.0.0 Release Notes</h2>
            <p><b>Deployment Date:</b> 03/26/2026</p>
            <h3>Feature Updates</h3>
            <p>Release 1.0.0 represents the initial release of the Lifeline Tribal Lands Verification Tool. This tool will allow consumers to determine if their address is on qualifying Tribal lands by providing using either their address (Street Address, City, State, Zip Code) or their location (Latitude, Longitude).</p>
            <p>This tool is for informational purposes. It may not accurately show where you live if your address can't be found.</p>
          </i-long-form-text>
        </div>
      </div>
    </div>
  </div>
  <div id="footerPanelReleaseNotesPage">
    <i-app-footer class="indigoFooter" :legal-links="[{href: 'https://www.usac.org/about/privacy-policies/', text: 'Privacy Policies', target:'_blank'}]" />
  </div>
</template>
<script>
  import {IAppHeader, IBreadcrumb, ILongFormText, IAppFooter} from 'indigo-component-library'
  import $ from 'jquery'
  window.jQuery = window.$ = $

  export default {
    name: 'ReleaseNotesApp',
    components: {IAppHeader, IBreadcrumb, ILongFormText, IAppFooter},
    mounted() {
      $(".indi-app-header__home-link-wrap a").attr("target", "_blank");
      if ($(window).height() < 700) {
        $('.indigoFooter').addClass("sticky-footer");
      } else {
        $('.indigoFooter').removeClass("sticky-footer");
      }
      $(window).resize(function() {
        if ($(window).height() < 700) {
          $('.indigoFooter').addClass("sticky-footer");
        } else {
          $('.indigoFooter').removeClass("sticky-footer");
        }
      });
    },
  }
</script>
<style>
  #releaseNotesApplicationContent {
    padding-bottom: 25px;
    @media (max-width: 600px) {
      margin-left: 16px;
      margin-right: 16px;
    }
    @media (min-width: 601px) {
      margin-left: 32px;
      margin-right: 32px;
    }
  }
  #releaseNotesApplicationContentInner {
    margin: 0 auto;
    max-width: 1200px;
  }
  .indigoFooter {
    width: 100%;
    bottom: 0px;
    position: absolute;

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
  .sticky-footer {
    position: relative !important;
  }
</style>
