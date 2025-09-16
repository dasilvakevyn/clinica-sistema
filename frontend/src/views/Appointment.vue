<template>
  <div class="appointment-container">
    <h2>Agendamento de Consultas</h2>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
<p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div class="calendar-section">
      <label>Selecione a Data:</label>
      <VCalendar
  :attributes="calendarAttributes"
  :min-date="new Date()"
  @dayclick="onDateSelect"
/>
    </div>

    <div v-if="selectedDate" class="form-section">
      <h3>Horários Disponíveis em {{ formattedDate }}</h3>
      <p v-if="occupiedTimes.length > 0" class="occupied-message">Horários ocupados: {{ occupiedTimes.join(', ') }}</p>
      <p v-else class="available-message">Nenhum horário agendado para esta data. 🎉</p>

      <form @submit.prevent="handleAppointment">
        <div class="form-group">
          <label for="patientName">Nome do Paciente:</label>
          <input type="text" id="patientName" v-model="patientName" required>
        </div>
        <div class="form-group">
          <label for="appointmentTime">Horário:</label>
          <input type="time" id="appointmentTime" v-model="appointmentTime" required>
        </div>
        <button type="submit">Agendar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import { Calendar as VCalendar } from 'v-calendar';
import 'v-calendar/style.css';

const selectedDate = ref(null);
const patientName = ref('');
const appointmentTime = ref('');
const occupiedTimes = ref([]);
const successMessage = ref('');
const errorMessage = ref('');

const formattedDate = computed(() => {
  return selectedDate.value ? selectedDate.value.toLocaleDateString('pt-BR') : '';
});

const calendarAttributes = ref([]);

const handleAppointment = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
        errorMessage.value = 'Você precisa estar logado para agendar uma consulta.';
        return;
    }

    const payload = {
        patientName: patientName.value,
        appointmentDate: selectedDate.value.toISOString().split('T')[0],
        appointmentTime: appointmentTime.value,
    };

    const response = await axios.post('http://localhost:3000/api/appointments', payload, {
        headers: {
            'x-auth-token': token
        }
    });

    // Chamada para a API de clima após o agendamento (NOVA LÓGICA)
    const weatherResponse = await axios.get('http://localhost:3000/api/weather', {
      params: { lat: -22.7844, lon: -43.3159 } // Coordenadas do Rio de Janeiro
    });

    const weatherData = weatherResponse.data;
    let weatherMessage = `Agendamento criado! Previsão do tempo: ${weatherData.description}, ${weatherData.temp}°C.`;

    if (weatherData.willRain) {
      weatherMessage += ' Não se esqueça do guarda-chuva!';
    }

    successMessage.value = weatherMessage;
    errorMessage.value = '';

    patientName.value = '';
    appointmentTime.value = '';

    await fetchOccupiedTimes(payload.appointmentDate);

  } catch (error) {
    errorMessage.value = error.response.data || 'Erro ao agendar consulta.';
    successMessage.value = '';
  }
};

const fetchOccupiedTimes = async (date) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/appointments/occupied/${date}`);
    occupiedTimes.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar horários agendados:', error);
    occupiedTimes.value = [];
  }
};

watch(selectedDate, (newDate) => {
  if (!newDate) return;
  const dateString = newDate.toISOString().split('T')[0];
  fetchOccupiedTimes(dateString);
});
const onDateSelect = (day) => {
  selectedDate.value = day.date;
  console.log('Data selecionada:', selectedDate.value);
};
</script>

<style scoped>
.appointment-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.calendar-section, .form-section {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.occupied-message, .available-message {
  font-style: italic;
  color: #555;
  margin-bottom: 20px;
}
.success-message {
    color: green;
    font-weight: bold;
    text-align: center;
}
.error-message {
    color: red;
    font-weight: bold;
    text-align: center;
}
</style>