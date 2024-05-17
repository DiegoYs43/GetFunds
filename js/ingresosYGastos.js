// ingresosYGastos.js
import { initializeApp, auth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
// Configura tu aplicación de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCOX4l0eA8l-NNtX6j0XN96PBnZepzWBh0",
      authDomain: "getfunds-d99f9.firebaseapp.com",
      projectId: "getfunds-d99f9",
      storageBucket: "getfunds-d99f9.appspot.com",
      messagingSenderId: "915683707396",
      appId: "1:915683707396:web:4b8c39399776e2a62a8351"
};

firebase.initializeApp(firebaseConfig);

// Obtén el elemento de formulario y el campo de correo electrónico
const formulario = document.getElementById("registroForm");
const campoCorreo = document.getElementById("correo");

// Detecta el estado de autenticación del usuario
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Si el usuario está autenticado, obtén su correo electrónico y llénalo en el campo correspondiente
        const correoUsuario = user.email;
        campoCorreo.value = correoUsuario;
    } else {
        // Si el usuario no está autenticado, deja el campo de correo electrónico vacío o muestra un mensaje de error
        campoCorreo.value = "";
        console.log("El usuario no ha iniciado sesión.");
    }
});

// Manejo del envío del formulario, validación, etc.
formulario.addEventListener("submit", function(event) {
    event.preventDefault();
    // Tu lógica de manejo del formulario aquí
});
