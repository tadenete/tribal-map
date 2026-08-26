<template>
  <div id="popupButton" style="height: 0px; display: none;">
    <i-button id="saveResultsButtonOriginal" label="Save Results" variant="primary" theme="on-dark" size="small"/>
  </div>
  <div id="map" role="none" :style="!isMobile ? 'min-height: 700px;':'min-height: 300px;'"></div>
</template>
<script>
  import {IButton} from 'indigo-component-library'
  import * as L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import variables from './variables.js';
  import CartoDeckGLLeafletMap from './CartoDeckGLLeafletMap.vue';
  import emitter from 'tiny-emitter/instance';
  import locationSVGFile from "./images/location.svg";
  import $ from 'jquery'
  window.jQuery = window.$ = $

  export default {
    name: "CartoDeckGLLeafletMap",
    components: {IButton},
    props: {
      isMobile: {
        type: Boolean,
        required: true
      }
    },
    mounted() {
      setTimeout(function() {
        CartoDeckGLLeafletMap.loadMap();
      }, 1000);
      this.emitter.on('showLocationOnMap', (searchType, searchStatus) => {
        return CartoDeckGLLeafletMap.showLocationOnMap(searchType, searchStatus);
      });
      this.emitter.on('changePopupAndStatusMessageOrientation', (deviceChange) => {
        CartoDeckGLLeafletMap.changePopupAndStatusMessageOrientation(deviceChange)
      });
    },
    loadMap() {
      variables.map = L.map(document.getElementById("map"), {
        center: [variables.defaultMapLatitude, variables.defaultMapLongitude],
        zoom: variables.defaultMapZoom,
        zoominfoControl: true,
        zoomControl: false,
        worldCopyJump: true,
        zoomDelta: 1,
        wheelPxPerZoomLevel: 200,
        minZoom: variables.mapMinimumZoom,
        maxZoom: variables.mapMaximumZoom,
      });
      L.control.scale({position: "bottomright"}).addTo(variables.map);
      this.setupCustomZoomControl();
      variables.activeBasemap = L.tileLayer(variables.mapboxStreetMapURL, {attribution: variables.mapboxAttribution, accessToken: variables.mapboxCred}).addTo(variables.map);
      variables.map.attributionControl.addAttribution('&copy; <a href="https://carto.com/about-carto/">CARTO</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
      variables.map.on('contextmenu', function(e) {L.DomEvent.stopPropagation(e);});
      variables.map.on("zoomend", function (e) {CartoDeckGLLeafletMap.mapEvents_ZoomEnd(e)});
      variables.map.on('popupopen', function (e) {
        setTimeout(function() {
          $("#saveButton").append($("#saveResultsButtonOriginal").clone().attr("id", "saveResultsButton"));
          $("#saveResultsButton").on("click", function() {window.print();});
          $("#saveResultsButton").focus();
        }, 200);
      });
      if (variables.map.getZoom() == variables.mapMinimumZoom) {$('.zoom_control_zoom_out').addClass('leaflet-disabled');}
    },
    showLocationOnMap(searchType, searchStatus) {
      variables.searchType = searchType;
      variables.searchStatus = searchStatus;
      if (variables.marker != '') {
        variables.map.removeLayer(variables.marker);
        variables.marker = '';
      }
      variables.popupContentDesktop = '';
      variables.popupContentMobile = '';
      var popupContent = '';
      if (searchStatus) {
        variables.popupContentMobile = '<div class="searchPopup">';
        variables.popupContentDesktop = '<div class="searchPopup"><div id="popupHeader" style="padding-bottom: 12px;"><p><span class="popupHeading">Tribal Land</span></p></div>';
      } else {
        variables.popupContentMobile = '<div class="searchPopup">';
        variables.popupContentDesktop = '<div class="searchPopup"><div id="popupHeader" style="padding-bottom: 12px;"><p><span class="popupHeading">Non-Tribal Land</span></p></div>';
      }
      if (searchType === 'SearchByAddress') {
        if (variables.searchState == 'PR') {popupContent = popupContent + '<p><span class="popupLineContent">' + variables.searchUrbanizationCode + '</span></p>';}
        popupContent = popupContent + '<p><span class="popupLineContent">' + variables.searchStreetAddress + '</span></p>'
          + '<p><span class="popupLineContent">' + variables.searchCity + ', ' + variables.searchState + ', ' + variables.searchZipCode + '</span></p>'
          + '<p style="padding-top: 16px;"><span class="popupLineContent">' + variables.searchLatitude + ', ' + variables.searchLongitude +'</span></p>';
      } else {
        popupContent = popupContent + '<p><span class="popupLineContent">Latitude: ' + variables.searchLatitude + '</span></p>'
          + '<p><span class="popupLineContent">Longitude: ' + variables.searchLongitude +'</span></p>';
      }
      variables.popupContentMobile = variables.popupContentMobile + popupContent + '</div></div>';
      variables.popupContentDesktop = variables.popupContentDesktop + popupContent + '<div id="saveButton" /></div>';
      if (variables.isMobile) {
        document.querySelector(':root').style.setProperty('--popup-close-font-size', 32+'px');
        document.querySelector(':root').style.setProperty('--popup-close-top', 18+'px');
        document.querySelector(':root').style.setProperty('--popup-close-right', 16+'px');
        document.querySelector(':root').style.setProperty('--popup-padding', 16+'px '+16+'px '+16+'px '+24+'px');
        document.querySelector(':root').style.setProperty('--popup-width', 240+'px');
        if (searchType === 'SearchByAddress') {
          if (variables.searchState == 'PR') {
            document.querySelector(':root').style.setProperty('--popup-width', 290+'px');
            if (variables.searchStreetAddress.length > 48  || (variables.searchCity + ', ' + variables.searchState + ', ' + variables.searchZipCode).length > 24)
              variables.map.setView([variables.searchLatitude+0.0010, variables.searchLongitude+0.0002], 17);
            else
              variables.map.setView([variables.searchLatitude+0.0007, variables.searchLongitude+0.0002], 17);
          } else {
            if (variables.searchStreetAddress.length > 48  || (variables.searchCity + ', ' + variables.searchState + ', ' + variables.searchZipCode).length > 24) {
              document.querySelector(':root').style.setProperty('--popup-width', 290+'px');
              variables.map.setView([variables.searchLatitude+0.0007, variables.searchLongitude+0.0002], 17);
            } else {
              variables.map.setView([variables.searchLatitude+0.0005, variables.searchLongitude+0.0002], 17);
            }
          }
        } else {
          variables.map.setView([variables.searchLatitude+0.0003, variables.searchLongitude+0.0002], 17);
        }
      } else {
        document.querySelector(':root').style.setProperty('--popup-close-font-size', 48+'px');
        document.querySelector(':root').style.setProperty('--popup-close-top', 32+'px');
        document.querySelector(':root').style.setProperty('--popup-close-right', 24+'px');
        document.querySelector(':root').style.setProperty('--popup-padding', 24+'px '+24+'px '+32+'px '+24+'px');
        if (searchType === 'SearchByAddress') {
          document.querySelector(':root').style.setProperty('--popup-width', 300+'px');
        } else {
          document.querySelector(':root').style.setProperty('--popup-width', 290+'px');
        }
        if ($(window).width() < 1000)
          variables.map.setView([variables.searchLatitude+0.0008, variables.searchLongitude-0.0022], 17);
        else
          variables.map.setView([variables.searchLatitude+0.0008, variables.searchLongitude-0.0008], 17);
      }
      var usacLocationIcon = L.icon({
        iconUrl: locationSVGFile,
        iconSize: [39, 60],
        iconAnchor: [20, 40],
        popupAnchor: [0, -32]
      });
      if (variables.isMobile) {
        popupContent = variables.popupContentMobile;
      } else {
        popupContent = variables.popupContentDesktop;
      }
      variables.marker = L.marker([variables.searchLatitude, variables.searchLongitude], {icon: usacLocationIcon}).addTo(variables.map).bindPopup(popupContent, {closeButton: true, autoPan: false, closeOnClick: false}).openPopup();
      variables.displaySatelliteView = true;
      CartoDeckGLLeafletMap.satelliteMapSwitchControl();
      emitter.emit('searchComplete', true);
    },
    changePopupAndStatusMessageOrientation(showDesktopPopup) {
      var searchType = variables.searchType;
      var searchStatus = variables.searchStatus;
      if (showDesktopPopup) {
        $("#successMessageMobile").hide();
        $("#failureMessageMobile").hide();
        if (searchType === 'SearchByAddress' && searchStatus) $("#successMessageSearchByAddress").show();
        if (searchType === 'SearchByAddress' && !searchStatus) $("#failureMessageSearchByAddress").show();
        if (searchType === 'SearchByLocation' && searchStatus) $("#successMessageSearchByLocation").show();
        if (searchType === 'SearchByLocation' && !searchStatus) $("#failureMessageSearchByLocation").show();
      } else {
        $("#successMessageSearchByAddress").hide();
        $("#failureMessageSearchByAddress").hide();
        $("#successMessageSearchByLocation").hide();
        $("#failureMessageSearchByLocation").hide();
        if (searchStatus) $("#successMessageMobile").show();
        if (!searchStatus) $("#failureMessageMobile").show();
      }
      if (!showDesktopPopup) {
        document.querySelector(':root').style.setProperty('--popup-close-font-size', 32+'px');
        document.querySelector(':root').style.setProperty('--popup-close-top', 18+'px');
        document.querySelector(':root').style.setProperty('--popup-close-right', 16+'px');
        document.querySelector(':root').style.setProperty('--popup-padding', 16+'px '+16+'px '+16+'px '+24+'px');
        document.querySelector(':root').style.setProperty('--popup-width', 240+'px');
        if (searchType === 'SearchByAddress') {
          if (variables.searchState == 'PR') {
            document.querySelector(':root').style.setProperty('--popup-width', 290+'px');
            if (variables.searchStreetAddress.length > 48  || (variables.searchCity + ', ' + variables.searchState + ', ' + variables.searchZipCode).length > 24)
              setTimeout(function() {variables.map.setView([variables.searchLatitude+0.0010, variables.searchLongitude+0.0002], 17)}, 100);
            else
              setTimeout(function() {variables.map.setView([variables.searchLatitude+0.0007, variables.searchLongitude+0.0002], 17)}, 100);
          } else {
            if (variables.searchStreetAddress.length > 48  || (variables.searchCity + ', ' + variables.searchState + ', ' + variables.searchZipCode).length > 24) {
              document.querySelector(':root').style.setProperty('--popup-width', 290+'px');
              setTimeout(function() {variables.map.setView([variables.searchLatitude+0.0007, variables.searchLongitude+0.0002], 17)}, 100);
            } else {
              setTimeout(function() {variables.map.setView([variables.searchLatitude+0.0005, variables.searchLongitude+0.0002], 17)}, 100);
            }
          }
        } else {
          setTimeout(function() {variables.map.setView([variables.searchLatitude+0.0003, variables.searchLongitude+0.0002], 17)}, 100);
        }
      } else {
        document.querySelector(':root').style.setProperty('--popup-close-font-size', 48+'px');
        document.querySelector(':root').style.setProperty('--popup-close-top', 32+'px');
        document.querySelector(':root').style.setProperty('--popup-close-right', 24+'px');
        document.querySelector(':root').style.setProperty('--popup-padding', 24+'px '+24+'px '+32+'px '+24+'px');
        if (searchType === 'SearchByAddress') {
          document.querySelector(':root').style.setProperty('--popup-width', 300+'px');
        } else {
          document.querySelector(':root').style.setProperty('--popup-width', 290+'px');
        }
        setTimeout(function() {
          if ($(window).width() < 1000)
            variables.map.setView([variables.searchLatitude+0.0008, variables.searchLongitude-0.0022], 17);
          else
            variables.map.setView([variables.searchLatitude+0.0008, variables.searchLongitude-0.0008], 17);
        }, 100);
      }
      if (!showDesktopPopup) {
        variables.marker.setPopupContent(variables.popupContentMobile);
      } else {
        variables.marker.setPopupContent(variables.popupContentDesktop);
        setTimeout(function() {
          $("#saveButton").append($("#saveResultsButtonOriginal").clone().attr("id", "saveResultsButton"));
          $("#saveResultsButton").on("click", function() {window.print();});
          $("#saveResultsButton").focus();
        }, 200);
      }
    },
    mapEvents_ZoomEnd(event) {
      $('.zoom_control_zoom_in').removeClass('leaflet-disabled');
      $('.zoom_control_zoom_out').removeClass('leaflet-disabled');
      if (variables.map.getZoom() == variables.mapMaximumZoom) {
        $('.zoom_control_zoom_in').addClass('leaflet-disabled');
      }
      if (variables.map.getZoom() == variables.mapMinimumZoom) {
        $('.zoom_control_zoom_out').addClass('leaflet-disabled');
      }
    },
    setupCustomZoomControl() {
      L.Control.customZoomControl = L.Control.extend({
        options: {position: 'topright'},
        onAdd: function () {
          var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          var homeButton = CartoDeckGLLeafletMap.createZoombarButton('', 'Zoom to Start Position', 'zoom_control_home_button', container);
          L.DomEvent.on(homeButton, 'click', function() {variables.map.setView([variables.defaultMapLatitude, variables.defaultMapLongitude], variables.defaultMapZoom);});
          var zoomInButton = CartoDeckGLLeafletMap.createZoombarButton('+', 'Zoom In', 'zoom_control_zoom_in', container);
          L.DomEvent.on(zoomInButton, 'click', function() {variables.map.setZoom(variables.map.getZoom() + 1);});
          var zoomOutButton = CartoDeckGLLeafletMap.createZoombarButton('-', 'Zoom Out', 'zoom_control_zoom_out', container);
          L.DomEvent.on(zoomOutButton, 'click', function() {variables.map.setZoom(variables.map.getZoom() - 1);});
          var satelliteSwitchButton = CartoDeckGLLeafletMap.createZoombarButton('', 'Switch to Satellite/Map View', 'zoom_control_satellite_button', container);
          L.DomEvent.on(satelliteSwitchButton, 'click', function() {CartoDeckGLLeafletMap.satelliteMapSwitchControl();});
          return container;
        },
      });
      new L.Control.customZoomControl().addTo(variables.map);
    },
    createZoombarButton(html, title, className, container, operation) {
      var link = L.DomUtil.create('a', className, container);
      link.innerHTML = html;
      link.href = '#';
      link.title = title;
      link.setAttribute("role", "button");
      link.setAttribute("aria-label", title);
      link.setAttribute("tabindex", 0);
      L.DomEvent.on(link, 'click mousedown dblclick', L.DomEvent.stopPropagation)
          .on(link, 'click', L.DomEvent.preventDefault);
      L.DomEvent.disableClickPropagation(link);
      return link;
    },
    satelliteMapSwitchControl() {
      if (variables.displaySatelliteView) {
        variables.displaySatelliteView = false;
        variables.activeBasemap._url = variables.mapboxStreetMapURL;
        variables.activeBasemap.redraw();
      } else {
        variables.displaySatelliteView = true;
        variables.activeBasemap._url = variables.satelliteMapURL;
        variables.activeBasemap.redraw();
      }
    },
  }
</script>
<style>
  :root {
    --popup-width: 100px;
    --popup-padding: 10px;
    --popup-close-font-size: 48px;
    --popup-close-top: 24px;
    --popup-close-right: 24px;
  }
  #map {
    z-index: 2;
    height: 100%;
    border: solid 0.5px #9e9e9e;
    position: relative;
  }
  .mouseover-cursor-change {
    cursor: pointer !important;
  }
  .leaflet-container .leaflet-control-attribution {
    background: #fff !important;
  }
  .searchPopup {
    padding-right: 16px;
  }
  .leaflet-popup-content-wrapper, .leaflet-popup-tip {
    background: #616161;
    color: #fff;
    box-shadow: unset;
  }
  .leaflet-popup-content-wrapper {
    padding: 0px;
    border-radius: 0px !important;
  }
  .leaflet-popup-content {
    margin: 0px;
    padding: var(--popup-padding);
    width: var(--popup-width);
    max-width: 300px;
  }
  .leaflet-popup-content p {
    width: auto;
    margin: 1px;
    font-family: "Source Sans 3";
    color: white;
    text-transform: none;
  }
  .leaflet-popup-close-button {
    font-size: var(--popup-close-font-size) !important;
    line-height: 16px !important;
    font-family: "Source Sans 3", sans-serif !important;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    text-align: left;
    width: 16px !important;
    height: 16px !important;
    top: var(--popup-close-top) !important;
    right: var(--popup-close-right) !important;
    color: #fff !important;
    background: #616161 !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .popupHeading {
    font-size: 24px;
    font-weight: 600;
    line-height: 1.33;
  }
  .popupLineContent {
    font-size: 16px;
    font-weight: normal;
    line-height: 1.25;
  }
  #saveButton {
    padding-top: 24px;
  }
  .zoom_control_home_button {
    background-image: url(images/home.png); 
    background-repeat: no-repeat; 
    background-position: center;
  }
  .zoom_control_zoom_in, .zoom_control_zoom_out {
    font: bold 26px 'Lucida Console', Monaco, monospace;
  }
  .zoom_control_satellite_button {
    background-image: url(images/globe.png); 
    background-repeat: no-repeat; 
    background-position: center;
  }
</style>