/**
 * Exemplo de Cloud Function (Node.js) para verificar face
 * Recebe imagem, consulta serviço externo e retorna match {alunoId, score}
 * Grava presença se score >= LIMIAR_CONFIDENCIA
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

exports.verificarFace = functions.https.onRequest(async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).send('imageBase64 é obrigatório');

    // Placeholder: lógica de verificação via Azure Face API
    const melhorMatch = { alunoId: 'exemploAluno', score: 0.92 };
    const LIMIAR = parseFloat(process.env.LIMIAR_CONFIDENCIA || '0.9');

    if (melhorMatch.score >= LIMIAR) {
      // Gravar presença no caminho /presencas/{data}/{alunoId}
      const dataHoje = new Date().toISOString().slice(0, 10);
      const presencaRef = db.collection('presencas').doc(dataHoje).collection('alunos').doc(melhorMatch.alunoId);
      await presencaRef.set({ entrada: admin.firestore.FieldValue.serverTimestamp(), verificadoPorFace: true, scoreFace: melhorMatch.score });
      return res.json(melhorMatch);
    }

    res.json({ message: 'Nenhum match confiável', score: melhorMatch.score });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno');
  }
});
