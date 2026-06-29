async function openDB(){
    return new Promise((resolve,reject)=>{

        request.onerror = (event)=>{
            console.error("Error initializing IndexedDB",event.target.error.message);
            reject(event.target.error);
        }

        request.onsuccess = (event)=>{
            console.log("IndexedDB initialized successfully");
            resolve(event.target.result);
        }

        request.onupgradeneeded = (event)=>{
            let db = event.target.result;

            if(!db.objectStoreNames.contains("userInfo")){
                db.createObjectStore("userInfo",{keyPath:"uuid"});
            }
            if(!db.objectStoreNames.contains("conversations")){
                db.createObjectStore("conversations",{keyPath:"conversationId"});
            }
        }
    });

}

async function createUserInfo(userInfo){
    let db = await openDB();
    return new Promise((resolve,reject)=>{
        let transaction = db.transaction("userInfo","readwrite");
        let store = transaction.objectStore("userInfo");
        let request = store.put(userInfo);
        request.onsuccess = ()=>{
            console.log("User info stored successfully in IndexedDB");
            resolve();
        }
        request.onerror = (event)=>{
            console.error("Error storing user info in IndexedDB",event.target.error.message);
            reject(event.target.error);
        }
    });
}

async function getUserInfo(uuid){
    let db = await openDB();
    return new Promise((resolve,reject)=>{
        let transaction = db.transaction("userInfo","readonly");
        let store = transaction.objectStore("userInfo");
        let request = store.get(uuid);
        request.onsuccess = ()=>{
            console.log("User info retrieved successfully from IndexedDB");
            resolve(request.result);
        }
        request.onerror = (event)=>{
            console.error("Error retrieving user info from IndexedDB",event.target.error.message);
            reject(event.target.error);
        }
    });
}

async function
