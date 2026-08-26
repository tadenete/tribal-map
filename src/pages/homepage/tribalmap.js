import {createApp} from 'vue'
import emitter from 'tiny-emitter/instance';
import VueTheMask from 'vue-the-mask';
import TribalMapApp from './TribalMapApp.vue'
import variables from '../../components/variables.js';

variables.cartoV3APIQueryUrlStart = import.meta.env.VITE_CARTOV3APIQUERYURLSTART;
variables.cartoV3Cred = import.meta.env.VITE_CARTOV3CRED;
variables.cartoV3DatasetLocation = import.meta.env.VITE_CARTOV3DATASETLOCATION;
variables.cartoV3TribalMapDataset = import.meta.env.VITE_CARTOV3TRIBALMAPDATASET;
variables.mapboxCred = import.meta.env.VITE_MAPBOXCRED;
variables.mapboxStreetMapURL = import.meta.env.VITE_MAPBOXSTREETMAPURL + import.meta.env.VITE_MAPBOXCRED;
variables.mapboxAttribution = import.meta.env.VITE_MAPBOXATTRIBUTION;
variables.satelliteMapURL = import.meta.env.VITE_SATELLITEMAPURL;
variables.getCGRGeocoderAPI = import.meta.env.VITE_CGRAPI;
variables.checkStatusOfLatLongInLifelineTribalLands = variables.checkStatusOfLatLongInLifelineTribalLands.replace("cartoV3DatasetLocation", variables.cartoV3DatasetLocation).replace("cartoV3TribalMapDataset", variables.cartoV3TribalMapDataset);

const app = createApp(TribalMapApp).use(VueTheMask);
app.config.globalProperties.emitter = emitter;
app.mount('#tribalMapApp')
