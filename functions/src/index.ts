import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";


const serviceAccount = require('../src/serviceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firestore-grafica-7f631-default-rtdb.firebaseio.com"
});

const db = admin.firestore();


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello mi doggy from Firebase!!!");
});

export const getGoty = functions.https.onRequest( async (request, response) => {
    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map( doc => doc.data() );

    response.json(juegos);
})

//Express
const app = express();
app.use( cors({ origin: true }));

app.get('/getGames', async(request, response) => {
    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map( doc => doc.data() );

    response.json(juegos);
});

app.post('/game/:id', async(request, response) => {
    const id = request.params.id;
    const gameRef = db.collection('goty').doc(id);
    const gameSnap = await gameRef.get();

    if(!gameSnap.exists) {
        response.status(404).json({
            status: false,
            message: 'Este juego no existe'
        })
    } else {
        const antes = gameSnap.data() || { votos: 0 };
        await gameRef.update({
            votos: antes.votos + 1
        })

        response.json({
            status: true,
            message: 'Gracias por tu voto a ' + antes.name
        })
    }
})

export const api = functions.https.onRequest(app)