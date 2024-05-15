import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOX4l0eA8l-NNtX6j0XN96PBnZepzWBh0",
    authDomain: "getfunds-d99f9.firebaseapp.com",
    projectId: "getfunds-d99f9",
    storageBucket: "getfunds-d99f9.appspot.com",
    messagingSenderId: "915683707396",
    appId: "1:915683707396:web:4b8c39399776e2a62a8351"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

document.querySelector("form").addEventListener("submit", async function(event) {
  event.preventDefault();

  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;

  try {
    const querySnapshot = await getDocs(query(collection(firestore, "usuarios"), where("correo", "==", correo), where("contraseña", "==", contrasena)));
    if (!querySnapshot.empty) {
      // Usuario encontrado en la base de datos
      const usuario = querySnapshot.docs[0].data();
      alert(`¡Hola ${usuario.nombre}! Bienvenido`);
    } else {
      // Usuario no encontrado en la base de datos
      alert("Credenciales inválidas. Por favor, inténtalo de nuevo.");
    }
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    alert("Ocurrió un error. Por favor, inténtalo de nuevo más tarde.");
  }
});
