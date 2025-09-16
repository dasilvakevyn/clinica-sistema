import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

const app = createApp(App)

app.use(router)
app.use(VCalendar, {
  formats: {
    title: 'MMMM YYYY',
    weekdays: 'W',
    navMonths: 'MMM',
    input: ['YYYY-MM-DD'],
  },
})

app.mount('#app')
