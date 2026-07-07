import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Login from './screens/Login';
import PainelResponsavel from './screens/PainelResponsavel';
import PainelGestao from './screens/PainelGestao';
import CadastroAluno from './screens/CadastroAluno';
import CadastroResponsavel from './screens/CadastroResponsavel';
import CadastroTurma from './screens/CadastroTurma';
import RegistroFace from './screens/RegistroFace';
import RegistroPresencaFace from './screens/RegistroPresencaFace';
import ConsentimentoBiometrico from './screens/ConsentimentoBiometrico';
import Relatorios from './screens/Relatorios';
import EsqueciSenha from './screens/EsqueciSenha';
import pt from './i18n/pt-BR';
import { auth } from './services/firebase';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const token = await getIdTokenResult(u, true);
          const r = token.claims.role || null;
          setRole(r);
        } catch (e) {
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <PaperProvider>
      <NavigationContainer>
        {user ? (
          <Stack.Navigator initialRouteName={role === 'gestao' ? 'PainelGestao' : 'PainelResponsavel'}>
            <Stack.Screen name="PainelResponsavel" component={PainelResponsavel} options={{ title: 'Painel do Responsável' }} />
            <Stack.Screen name="PainelGestao" component={PainelGestao} options={{ title: 'Painel de Gestão' }} />
            <Stack.Screen name="CadastroAluno" component={CadastroAluno} options={{ title: 'Cadastro de Aluno' }} />
            <Stack.Screen name="CadastroResponsavel" component={CadastroResponsavel} options={{ title: pt.cadastroResponsavel.titulo }} />
            <Stack.Screen name="CadastroTurma" component={CadastroTurma} options={{ title: 'Cadastro de Turma' }} />
            <Stack.Screen name="RegistroFace" component={RegistroFace} options={{ title: 'Registrar Rosto' }} />
            <Stack.Screen name="RegistroPresencaFace" component={RegistroPresencaFace} options={{ title: 'Registro de Presença (Face)' }} />
            <Stack.Screen name="ConsentimentoBiometrico" component={ConsentimentoBiometrico} options={{ title: 'Consentimento Biométrico' }} />
            <Stack.Screen name="Relatorios" component={Relatorios} options={{ title: 'Relatórios' }} />
            <Stack.Screen name="EsqueciSenha" component={EsqueciSenha} options={{ title: 'Esqueci a Senha' }} />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} options={{ title: pt.login.titulo }} />
            <Stack.Screen name="EsqueciSenha" component={EsqueciSenha} options={{ title: 'Esqueci a Senha' }} />
            <Stack.Screen name="CadastroResponsavel" component={CadastroResponsavel} options={{ title: pt.cadastroResponsavel.titulo }} />
            <Stack.Screen name="CadastroAluno" component={CadastroAluno} options={{ title: 'Cadastro de Aluno' }} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}
