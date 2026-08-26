<template>
  <HomePage />
</template>
<script>
  import HomePage from '../../components/HomePage.vue'
  import variables from '../../components/variables.js';

  export default {
    name: 'TribalMapApp',
    components: {HomePage},
    beforeMount() {
      variables.isMobile = window.innerWidth <= variables.lowResolutionWidth;
      if (variables.isMobile) {
        variables.defaultMapLongitude = variables.defaultMapLongitudeLowResolution;
      } else {
        variables.defaultMapLongitude = variables.defaultMapLongitudeLHighesolution;
      }
    },
  }
</script>
<style>
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  @media print {
    @page {
      size: landscape
    }
  }
</style>
