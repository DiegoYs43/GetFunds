import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOX4l0eA8l-NNtX6j0XN96PBnZepzWBh0",
  authDomain: "getfunds-d99f9.firebaseapp.com",
  projectId: "getfunds-d99f9",
  storageBucket: "getfunds-d99f9.appspot.com",
  messagingSenderId: "915683707396",
  appId: "1:915683707396:web:4b8c39399776e2a62a8351"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Función para obtener el correo electrónico del usuario autenticado
function getAuthenticatedUserEmail(callback) {
  const email = localStorage.getItem('userEmail');
  if (email) {
    callback(email);
  } else {
    console.log("No hay usuario autenticado");
    callback(null);
  }
}

// Llamada a la función para auto-completar el campo de correo en los formularios
function autocompleteEmailInForms() {
  getAuthenticatedUserEmail((email) => {
    if (email) {
      const emailFields = document.querySelectorAll('.email-field');
      emailFields.forEach(field => field.value = email);
    }
  });
}

document.addEventListener('DOMContentLoaded', (event) => {
  autocompleteEmailInForms();
});
