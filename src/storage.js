// src/storage.js
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';

// Function to store notes in local storage
export const storeInLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Function to retrieve notes from local storage
export const getFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};
function prepareData(data) {
  // Ensure the data is an object
  if (Array.isArray(data)) {
      throw new Error("Data must be an object, not an array");
  }

  // Recursively remove empty fields
  function removeEmptyFields(obj) {
      Object.keys(obj).forEach(key => {
          if (obj[key] && typeof obj[key] === 'object') {
              removeEmptyFields(obj[key]);
          } else if (obj[key] === "" || obj[key] === null) {
              delete obj[key];
          }
      });
  }

  removeEmptyFields(data);

  return data;
}
// Function to store notes in Firebase
export const storeInFirebase = async (collectionName, data) => {
  try {
    // const collectionRef = collection(db, collectionName);

    // // Retrieve all documents in the collection
    // const querySnapshot = await getDocs(collectionRef);

    // // Only delete existing documents if there is at least one
    // if (!querySnapshot.empty) {
    //   const deletePromises = querySnapshot.docs.map((docSnapshot) =>
    //     deleteDoc(doc(db, collectionName, docSnapshot.id))
    //   );
    //   await Promise.all(deletePromises);
    //   console.log(`Cleared existing documents in the '${collectionName}' collection.`);
    // }
    //const cleanedData = Object.entries(data).filter(([_, value]) => value !== undefined)
    const cleanedData = prepareData(data);
    const collectionRef = collection(db, collectionName);
    console.log('cleaned data:' + cleanedData)
    // Add the new document to the collection
    //alert(data);
    const docRef = await addDoc(collectionRef, cleanedData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

// Function to retrieve notes from Firebase
export const getFromFirebase = async (collectionName) => {
  const q = query(
    collection(db, collectionName),
    orderBy("createdDatetime", "desc"), // Replace "timestamp" with your timestamp field name
    //limit(1)
  );
  const querySnapshot = await getDocs(q);
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
};