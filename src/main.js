import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ChartPlugin from '../plugins/chartPlugin';

const app = createApp(App)


app.use(ChartPlugin);
app.use(createPinia())
app.use(router)

app.mount('#app')
