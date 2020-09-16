let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  // create object store called "pending" and set autoIncrement to true
 const db = event.target.result;
 db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  // log error here
  console.log("error: ", event.target.errorCode);
};

function saveRecord(record) {
  console.log("saveRecord");
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const store = transaction.objectStore("pending");

  // add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  console.log("checkDatabase");
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite"); // open with read and write permissions
  // access your pending object store
  const store = transaction.objectStore("pending"); // use transaction var to (11:46am)
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json()) // need to return response to use it in next .then
      .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["pending"], "readwrite");

          // access your pending object store
          const store = transaction.objectStore("pending");

          // clear all items in your store
          store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);