<template>
  <div class="register-container">
    <h2>Cadastro</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">Nome:</label>
        <input type="text" id="name" v-model="name" required>
      </div>
      <div class="form-group">
        <label for="email">E-mail:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Senha:</label>
        <input type="password" id="password" v-model="password" required>
      </div>

      <div class="form-group">
        <label for="cep">CEP:</label>
        <input type="text" id="cep" v-model="cep" @blur="fetchAddress" required>
      </div>
      <div class="form-group">
        <label for="street">Rua:</label>
        <input type="text" id="street" v-model="street" required>
      </div>
      <div class="form-group">
        <label for="neighborhood">Bairro:</label>
        <input type="text" id="neighborhood" v-model="neighborhood" required>
      </div>
      <div class="form-group">
        <label for="city">Cidade:</label>
        <input type="text" id="city" v-model="city" required>
      </div>
      <div class="form-group">
        <label for="state">Estado:</label>
        <input type="text" id="state" v-model="state" required>
      </div>

      <button type="submit">Cadastrar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const router = useRouter();

// Novas variáveis para os campos de endereço
const cep = ref('');
const street = ref('');
const neighborhood = ref('');
const city = ref('');
const state = ref('');

// Nova função para buscar o endereço pelo CEP
const fetchAddress = async () => {
  // Remove qualquer caractere que não seja número
  const cleanedCep = cep.value.replace(/\D/g, '');
  if (cleanedCep.length !== 8) {
    return;
  }

  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cleanedCep}/json/`);
    const data = response.data;

    if (!data.erro) {
      street.value = data.logradouro;
      neighborhood.value = data.bairro;
      city.value = data.localidade;
      state.value = data.uf;
    } else {
      alert('CEP não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    alert('Erro ao buscar CEP. Tente novamente.');
  }
};

const handleRegister = async () => {
  try {
    // Enviar os dados de cadastro para o backend
    const response = await axios.post('http://localhost:3000/api/register', {
      name: name.value,
      email: email.value,
      password: password.value
      // Campos de endereço não são enviados neste momento, mas podem ser adicionados
    });
    alert(response.data);
    router.push('/login');
  } catch (error) {
    alert(error.response.data);
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: Arial, sans-serif;
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
  width: 100%;
  padding: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>