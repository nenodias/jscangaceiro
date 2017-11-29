const stores = ['negociacoes'];
let connection = null;
let close = null;

export class ConnectionFactory{
    
    constructor() {
        throw new Error('Não é possível criar instâncias dessa classe');
    }

    static getConnection() {
        return new Promise((resolve, reject) => {
            if(connection){
                resolve(connection);
            } else {
                const openRequest = indexedDB.open('jscangaceiro', 2);
                
                openRequest.onupgradeneeded = (e) => {
                    ConnectionFactory._createStores(e.target.result);
                };
                openRequest.onsuccess = (e) => {
                    connection = e.target.result;

                    close = connection.close.bind(connection);

                    connection.close = () => {
                        throw new Error('Você não pode fechar diretamente a conexão');
                    };

                    resolve(connection);
                };
                openRequest.onerror = (e) => {
                    console.log(e.target.error);
                    reject(e.target.error.name);
                };
            }
        });
    }

    static _createStores(conn) {
        stores.forEach( (store) => {
            if(conn.objectStoreNames.contains(store)) {
                conn.deleteObjectStore(store);
            }
            conn.createObjectStore(store, { autoIncrement: true});
        });
    }

    static closeConnection() {
        if(connection){
            close();
        }
    }
}