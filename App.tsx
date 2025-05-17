import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import * as Location from 'expo-location';

export default function App() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState<Location.LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string>();

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    })();
  }, []);

  const subscribe = () => {
    Accelerometer.setUpdateInterval(500);
    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
      checkForFall(accelerometerData);
    });
    return subscription;
  };

  const unsubscribe = () => {
    Accelerometer.removeAllListeners();
  };

  const checkForFall = async ({ x, y, z }:AccelerometerMeasurement) => {
    const limit = 1.5; // Limite de aceleração para detecção de queda
    if (Math.abs(x) > limit || Math.abs(y) > limit || Math.abs(z) > limit) {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      alertFall(location);
    }
  };

  const alertFall = async (location:Location.LocationObject) => {
    let endereco = await Location.reverseGeocodeAsync(location.coords)
    Alert.alert(
      "Queda Detectada",
      `Uma queda foi detectada. Endereço: ${endereco[0].city}, ${location.coords.longitude}`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detector de Quedas</Text>
      <Text style={styles.text}>{errorMsg ? errorMsg : `Latitude: ${location ? location.coords.latitude : ''}, Longitude: ${location ? location.coords.longitude : ''}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
  },
});
