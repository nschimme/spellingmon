import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import { persistencePlugin } from './utils/persistencePlugin'

const app = createApp(App)
const pinia = createPinia()
pinia.use(persistencePlugin)

app.use(pinia)
app.use(i18n)
app.mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}
