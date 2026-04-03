import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC4-clIxNzyMpjm6pHVn3bAVHmtrLOmbYk',
  authDomain: 'ipl-fantasy-270dd.firebaseapp.com',
  projectId: 'ipl-fantasy-270dd',
  storageBucket: 'ipl-fantasy-270dd.firebasestorage.app',
  messagingSenderId: '1031619268473',
  appId: '1:1031619268473:web:c27147c4745537fa9129a8',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

