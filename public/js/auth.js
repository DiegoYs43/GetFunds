import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

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

// Obtener el correo del usuario autenticado y almacenarlo en el almacenamiento local
auth.onAuthStateChanged((user) => {
  if (user) {
    const email = user.email;
    localStorage.setItem('userEmail', email);
  } else {
    console.log("No hay usuario autenticado");
    localStorage.removeItem('userEmail'); // Eliminar el correo almacenado si no hay usuario autenticado
  }
});
