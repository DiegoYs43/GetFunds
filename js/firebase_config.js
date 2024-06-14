// Importaciones de Firebase
import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Verificar si la aplicación de Firebase ya está inicializada
if (!getApps().length) {
  const firebaseConfig = {
    apiKey: "AIzaSyCOX4l0eA8l-NNtX6j0XN96PBnZepzWBh0",
    authDomain: "getfunds-d99f9.firebaseapp.com",
    projectId: "getfunds-d99f9",
    storageBucket: "getfunds-d99f9.appspot.com",
    messagingSenderId: "915683707396",
    appId: "1:915683707396:web:4b8c39399776e2a62a8351"
  };
  
  initializeApp(firebaseConfig);
}

// Exportar instancias de Firestore y Auth
export const firestore = getFirestore();
export const auth = getAuth();
