import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Switch } from 'react-native';

export default function App() {
  const [tab, setTab] = useState('Registro');
  
  // Registro Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState(''); // 'male', 'female', 'other'
  
  const [interests, setInterests] = useState([]);
  const toggleInterest = (value) => {
    if (interests.includes(value)) {
      setInterests(interests.filter(i => i !== value));
    } else {
      setInterests([...interests, value]);
    }
  };

  const [comments, setComments] = useState('');
  const [terms, setTerms] = useState(false);
  
  // Transaction Form State
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Define the API URL based on platform
  const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

  const handleRegister = async () => {
    if (!fullName || !email || !password || !country || !gender || !terms) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios y acepte los términos.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName, 
          email, 
          password, 
          phone,
          age,
          country, 
          gender, 
          interests,
          comments,
          terms 
        })
      });
      
      if (response.ok) {
        Alert.alert('Éxito', '¡Usuario registrado correctamente!');
        setFullName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setAge('');
        setCountry('');
        setGender('');
        setInterests([]);
        setComments('');
        setTerms(false);
      } else {
        Alert.alert('Error', 'Hubo un error al registrar el usuario');
      }
    } catch (error) {
      Alert.alert('Error de red', 'No se pudo conectar al servidor');
    }
  };

  const handlePayment = async () => {
    if (!amount || !cardNumber || !expiry || !cvv) {
      Alert.alert('Error', 'Por favor complete todos los datos de pago');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, cardNumber, expiry, cvv })
      });
      
      if (response.ok) {
        Alert.alert('Éxito', '¡Pago procesado correctamente!');
        setAmount('');
        setCardNumber('');
        setExpiry('');
        setCvv('');
      } else {
        Alert.alert('Error', 'Hubo un error al procesar el pago');
      }
    } catch (error) {
      Alert.alert('Error de red', 'No se pudo conectar al servidor');
    }
  };

  // UI Helpers
  const RadioButton = ({ label, selected, onPress }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]} />
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const Checkbox = ({ label, selected, onPress }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
      <View style={[styles.checkboxSquare, selected && styles.checkboxSquareSelected]}>
         {selected && <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>✓</Text>}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity 
          style={[styles.navTab, tab === 'Registro' && styles.navTabActive]}
          onPress={() => setTab('Registro')}>
          <Text style={[styles.navText, tab === 'Registro' && styles.navTextActive]}>Registro</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navTab, tab === 'Pago' && styles.navTabActive]}
          onPress={() => setTab('Pago')}>
          <Text style={[styles.navText, tab === 'Pago' && styles.navTextActive]}>Pago Simulado</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab === 'Registro' ? (
          <View style={styles.card}>
            <Text style={styles.title}>Registro</Text>
            
            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Ej: Juan Pérez" />
            
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="ejemplo@correo.com" keyboardType="email-address" autoCapitalize="none" />
            
            <Text style={styles.label}>Contraseña *</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" secureTextEntry />
            
            <Text style={styles.label}>Teléfono</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+34 600 000 000" keyboardType="phone-pad" />
            
            <Text style={styles.label}>Edad</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="18" keyboardType="numeric" />
            
            <Text style={styles.label}>País *</Text>
            <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Ej: es, mx, ar, co, cl, pe" />
            
            <Text style={styles.label}>Género *</Text>
            <View style={styles.rowGroup}>
                <RadioButton label="Masculino" selected={gender === 'male'} onPress={() => setGender('male')} />
                <RadioButton label="Femenino" selected={gender === 'female'} onPress={() => setGender('female')} />
                <RadioButton label="Otro" selected={gender === 'other'} onPress={() => setGender('other')} />
            </View>

            <Text style={styles.label}>Intereses</Text>
            <View style={styles.rowGroup}>
                <Checkbox label="Deportes" selected={interests.includes('sports')} onPress={() => toggleInterest('sports')} />
                <Checkbox label="Música" selected={interests.includes('music')} onPress={() => toggleInterest('music')} />
            </View>
            <View style={styles.rowGroup}>
                <Checkbox label="Tecnología" selected={interests.includes('technology')} onPress={() => toggleInterest('technology')} />
                <Checkbox label="Lectura" selected={interests.includes('reading')} onPress={() => toggleInterest('reading')} />
            </View>

            <Text style={styles.label}>Comentarios adicionales</Text>
            <TextInput style={[styles.input, {height: 80}]} value={comments} onChangeText={setComments} placeholder="Escriba aquí..." multiline />
            
            <View style={[styles.rowGroup, {marginTop: 10}]}>
                <Switch value={terms} onValueChange={setTerms} />
                <Text style={{marginLeft: 10, color: '#555', fontWeight: 'bold'}}>Acepto los términos y condiciones *</Text>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleRegister}>
              <Text style={styles.btnText}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>Pago Simulado</Text>
            
            <Text style={styles.label}>Monto (USD) *</Text>
            <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="100.00" keyboardType="numeric" />
            
            <Text style={styles.label}>Número de Tarjeta *</Text>
            <TextInput style={styles.input} value={cardNumber} onChangeText={setCardNumber} placeholder="0000 0000 0000 0000" keyboardType="numeric" maxLength={19} />
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flex: 1, marginRight: 10}}>
                    <Text style={styles.label}>Vencimiento *</Text>
                    <TextInput style={styles.input} value={expiry} onChangeText={setExpiry} placeholder="MM/AA" maxLength={5} />
                </View>
                <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.label}>CVV *</Text>
                    <TextInput style={styles.input} value={cvv} onChangeText={setCvv} placeholder="123" keyboardType="numeric" maxLength={4} />
                </View>
            </View>
            
            <TouchableOpacity style={styles.btn} onPress={handlePayment}>
              <Text style={styles.btnText}>Pagar Ahora</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  navTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  navTabActive: {
    backgroundColor: '#667eea',
  },
  navText: {
    fontWeight: 'bold',
    color: '#555',
  },
  navTextActive: {
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#667eea',
    marginRight: 8,
  },
  radioCircleSelected: {
    backgroundColor: '#667eea',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#667eea',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSquareSelected: {
    backgroundColor: '#667eea',
  },
  radioLabel: {
    fontSize: 14,
    color: '#555',
  }
});
