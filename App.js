import React, { useState, useEffect } from 'react';
import { Button, View, Platform, Text, ScrollView, ActivityIndicator } from 'react-native';
import OCRImagePicker from './componets/OCRImagePicker';

export default function App() {
  const [ocrText, setOCRText] = useState(null);
  const [isLoading, setIsLoading] = useState(false)

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <OCRImagePicker handleResponse={setOCRText} handleLoading={setIsLoading} />
      {isLoading && <ActivityIndicator size="large" />}
      
      {!!ocrText && <ScrollView><Text>Распознанные ингредиенты:{ocrText.join(", ")}</Text></ScrollView>}
    </View>
  );
}