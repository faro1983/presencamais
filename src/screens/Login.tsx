import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import pt from '../i18n/pt-BR';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function entrar() {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      // onAuthStateChanged no App.tsx fará a navegação baseada em role
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao entrar');
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>{pt.login.titulo}</Text>
      <TextInput label={pt.login.email} value={email} onChangeText={setEmail} style={{ marginBottom: 8 }} />
      <TextInput label={pt.login.senha} value={senha} onChangeText={setSenha} secureTextEntry style={{ marginBottom: 16 }} />

      <Button mode="contained" onPress={entrar} style={{ marginBottom: 8 }}>{pt.login.entrar}</Button>
      <Button mode="outlined" onPress={() => navigation.navigate('EsqueciSenha')} style={{ marginBottom: 8 }}>{pt.login.esqueceu}</Button>

      <Button onPress={() => navigation.navigate('CadastroResponsavel')}>Cadastrar Responsável</Button>
    </View>
  );
}
