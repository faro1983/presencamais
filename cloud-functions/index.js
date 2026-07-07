/**
 * Entry point das Cloud Functions para deploy no Firebase.
 * Variáveis sensíveis devem ser injetadas no backend (Secrets/Functions config), nunca no app cliente.
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.registrarFace = functions.https.onRequest(async (req, res) => {
  try {
    const { imageBase64, alunoId } = req.body;
    if (!imageBase64 || !alunoId) {
      return res.status(400).send('imageBase64 e alunoId são obrigatórios');
    }

    // Placeholder de integração com provedor externo (ex.: Azure Face API)
    const faceId = 'face_' + Date.now();

    await db.collection('faces').doc(faceId).set({
      alunoId,
      criadoEm: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({ faceId });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Erro interno');
  }
});

exports.verificarFace = functions.https.onRequest(async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).send('imageBase64 é obrigatório');
    }

    // Placeholder de matching facial
    const melhorMatch = { alunoId: 'exemploAluno', score: 0.92 };
    const limiar = parseFloat(process.env.LIMIAR_CONFIDENCIA || '0.9');

    if (melhorMatch.score >= limiar) {
      const dataHoje = new Date().toISOString().slice(0, 10);
      const presencaRef = db.collection('presencas').doc(dataHoje).collection('alunos').doc(melhorMatch.alunoId);
      await presencaRef.set({
        entrada: admin.firestore.FieldValue.serverTimestamp(),
        verificadoPorFace: true,
        scoreFace: melhorMatch.score
      });
      return res.json(melhorMatch);
    }

    return res.json({ message: 'Nenhum match confiável', score: melhorMatch.score });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Erro interno');
  }
});
