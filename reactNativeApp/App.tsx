import React from 'react';
import { StyleSheet, View } from 'react-native';
import {Input , Button, Header, Text } from 'react-native-elements';

export default function App() {
  return (
    <View style={styles.container}>
      <Header
        leftComponent={{ icon: 'menu', color: '#fff' }}
        centerComponent={{ text: 'onBoard APP', style: { color: '#fff' } }}
        rightComponent={{ icon: 'home', color: '#fff' }}
      />

    <View style={styles.view1}>

    </View>

    <View style={styles.view2}>

      <Text style = {styles.taqText}> Bem-vindo a Taqtile! </Text>

      <Input style = {styles.inputs}
        label='e-mail'
      />

      <Input style = {styles.inputs}
        label='password'
      />
      
      <Button style = {styles.myButton} title = "Submit"  />
    </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  view1: {
    flex:2,
    // backgroundColor: "red",
  },
  view2: {
    flex:4,
    // backgroundColor: "blue",

  },
  inputs: {
    marginBottom: 25,
    borderWidth:5,
    borderColor: "black",
  },
  taqText: {
    marginBottom: 30,
    alignContent: 'center',
    textAlign: 'center',
    fontSize: 20,
  },
  myButton: {
    marginLeft: 25,
    marginRight: 25,
  },

});
