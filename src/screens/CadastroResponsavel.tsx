import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Text, Checkbox, ActivityIndicator } from 'react-native-paper';
import pt from '../i18n/pt-BR';
import { collection, doc, getDocs, query, where, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

// Tela de cadastro de responsável
export default function CadastroResponsavel({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [turmas, setTurmas] = useState<any[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);
  const [consentimento, setConsentimento] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // carregar turmas
    (async () => {
      const snap = await getDocs(collection(db, 'turmas'));
      setTurmas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  useEffect(() => {
    // ao selecionar turma, carregar alunos
    if (!turmaSelecionada) {
      setAlunos([]);
      return;
    }
    (async () => {
      const q = query(collection(db, 'alunos'), where('turmaId', '==', turmaSelecionada));
      const snap = await getDocs(q);
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAlunos(arr);
    })();
  }, [turmaSelecionada]);

  function toggleAluno(id: string) {
    setAlunosSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function salvar() {
    if (alunosSelecionados.length === 0) {
      Alert.alert(pt.cadastroResponsavel.erroObrigatorioAlunos);
      return;
    }

    if (!consentimento) {
      Alert.alert('Consentimento', 'É necessário aceitar o consentimento biométrico.');
      return;
    }

    setLoading(true);
    try {
      // Transação atômica: cria responsável e atualiza alunos vinculados
      await runTransaction(db, async (tx) => {
        const responsavelRef = doc(collection(db, 'responsaveis'));
        tx.set(responsavelRef, { nome, email, telefone, alunosIds: alunosSelecionados });

        // atualizar cada aluno
        for (const alunoId of alunosSelecionados) {
          const alunoRef = doc(db, 'alunos', alunoId);
          const alunoSnap = await tx.get(alunoRef);
          if (!alunoSnap.exists()) {
            throw new Error('Aluno não existe: ' + alunoId);
          }
          const data: any = alunoSnap.data();
          const responsaveisIds = Array.isArray(data.responsaveisIds) ? data.responsaveisIds : [];
          if (!responsaveisIds.includes(responsavelRef.id)) responsaveisIds.push(responsavelRef.id);
          tx.update(alunoRef, { responsaveisIds });
        }

        // auditoria
        const audRef = doc(collection(db, 'auditoria'));
        tx.set(audRef, {
          acao: 'cadastro_responsavel',
          usuarioId: responsavelRef.id,
          timestamp: serverTimestamp(),
          detalhes: { nome, email, alunosIds: alunosSelecionados }
        });
      });

      Alert.alert(pt.mensagens.sucessoCadastro);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert(pt.mensagens.erroGeral);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator animating={true} />;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>{pt.cadastroResponsavel.titulo}</Text>
      <TextInput label={pt.cadastroResponsavel.nome} value={nome} onChangeText={setNome} style={{ marginBottom: 8 }} />
      <TextInput label={pt.cadastroResponsavel.email} value={email} onChangeText={setEmail} style={{ marginBottom: 8 }} />
      <TextInput label={pt.cadastroResponsavel.telefone} value={telefone} onChangeText={setTelefone} style={{ marginBottom: 8 }} />

      <Text style={{ marginTop: 12 }}>{pt.cadastroResponsavel.turma}</Text>
      {turmas.map(t => (
        <Button key={t.id} mode={turmaSelecionada === t.id ? 'contained' : 'outlined'} onPress={() => setTurmaSelecionada(t.id)} style={{ marginTop: 6 }}>
          {t.nome}
        </Button>
      ))}

      <Text style={{ marginTop: 12 }}>{pt.cadastroResponsavel.alunosVinculados}</Text>
      {alunos.length === 0 && turmaSelecionada && (
        <View>
          <Text>{pt.cadastroResponsavel.erroSemAlunos}</Text>
        </View>
      )}

      {alunos.map(a => (
        <Button key={a.id} mode={alunosSelecionados.includes(a.id) ? 'contained' : 'outlined'} onPress={() => toggleAluno(a.id)} style={{ marginTop: 6 }}>
          {a.nome}
        </Button>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
        <Checkbox status={consentimento ? 'checked' : 'unchecked'} onPress={() => setConsentimento(!consentimento)} />
        <Text>{pt.cadastroResponsavel.consentimento}</Text>
      </View>

      <Button mode="contained" onPress={salvar} style={{ marginTop: 16 }}>{pt.cadastroResponsavel.salvar}</Button>
    </View>
  );
}
