import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import pt from '../i18n/pt-BR';
import axios from 'axios';

export default function RegistroFace({ route }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  async function capturarEEnviar() {
    if (!cameraRef.current) return;
    const foto = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true });
    try {
      // Enviar imagem para o endpoint do backend (Cloud Function)
      const resp = await axios.post('https://SEU_BACKEND/registrarFace', { imageBase64: foto.base64, alunoId: route.params?.alunoId });
      Alert.alert('OK', 'Rosto registrado com sucesso.');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao registrar face.');
    }
  }

  if (hasPermission === null) return <View><Text>Solicitando permissão...</Text></View>;
  if (hasPermission === false) return <View><Text>Permissão de câmera negada.</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} ref={cameraRef} />
      <Button title="Capturar e registrar" onPress={capturarEEnviar} />
    </View>
  );
}
