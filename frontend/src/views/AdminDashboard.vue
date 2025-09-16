<template>
  <div class="admin-dashboard">
    <h2>Painel Administrativo</h2>
    <p v-if="loading">Carregando agendamentos...</p>
    <p v-if="error" class="error-message">{{ error }}</p>

    <div v-if="!loading && !error && appointments.length">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome do Paciente</th>
            <th>Data</th>
            <th>Horário</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in appointments" :key="appointment.id">
            <td>{{ appointment.id }}</td>
            <td>{{ appointment.patient_name }}</td>
            <td>{{ new Date(appointment.appointment_date).toLocaleDateString() }}</td>
            <td>{{ appointment.appointment_time }}</td>
            <td>
              <select v-model="appointment.status" @change="updateStatus(appointment)">
                <option value="Agendado">Agendado</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Concluído">Concluído</option>
              </select>
            </td>
            <td>
              <button @click="deleteAppointment(appointment.id)" class="delete-btn">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && !error && !appointments.length">Nenhum agendamento encontrado.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();

const fetchAppointments = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await axios.get('http://localhost:3000/api/admin/appointments', {
      headers: {
        'x-auth-token': token
      }
    });

    appointments.value = response.data;
  } catch (err) {
    if (err.response && err.response.status === 403) {
      error.value = 'Acesso negado. Você não tem permissão de administrador.';
    } else {
      error.value = 'Erro ao carregar agendamentos.';
    }
    console.error('Erro ao buscar agendamentos:', err);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (appointment) => {
  if (!confirm('Tem certeza de que deseja atualizar o status?')) {
    return;
  }
  try {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:3000/api/admin/appointments/${appointment.id}`, {
      status: appointment.status
    }, {
      headers: {
        'x-auth-token': token
      }
    });
    alert('Status atualizado com sucesso!');
  } catch (error) {
    alert('Erro ao atualizar status.');
    console.error('Erro ao atualizar status:', error);
  }
};

const deleteAppointment = async (id) => {
  if (confirm('Tem certeza de que deseja excluir este agendamento?')) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/admin/appointments/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      appointments.value = appointments.value.filter(app => app.id !== id);
      alert('Agendamento excluído com sucesso!');
    } catch (error) {
      alert('Erro ao excluir agendamento.');
      console.error('Erro ao excluir agendamento:', error);
    }
  }
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
.admin-dashboard {
  max-width: 900px;
  margin: 50px auto;
  padding: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.error-message {
  color: red;
  font-weight: bold;
}
</style>