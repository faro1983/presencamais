/**
 * Exemplo de Cloud Function (Node.js) para registrar face
 * Variáveis de ambiente necessárias:
 * - AZURE_FACE_KEY
 * - AZURE_FACE_ENDPOINT
 * - LIMIAR_CONFIDENCIA
 * NÃO inclua essas chaves no cliente.
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

exports.registrarFace = functions.https.onRequest(async (req, res) => {
  try {
    const { imageBase64, alunoId } = req.body;
    if (!imageBase64 || !alunoId) return res.status(400).send('imageBase64 e alunoId são obrigatórios');

    // Exemplo: chamada à Azure Face API para criar faceId/embedding
    const endpoint = process.env.AZURE_FACE_ENDPOINT;
    const key = process.env.AZURE_FACE_KEY;

    // Aqui você faria a chamada para criar a face e obter um faceId
    // Placeholder: gerar faceId fictício
    const faceId = 'face_' + Date.now();

    // Salvar mapping faceId -> alunoId em Firestore
    await db.collection('faces').doc(faceId).set({ alunoId, criadoEm: admin.firestore.FieldValue.serverTimestamp() });

    res.json({ faceId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno');
  }
});
