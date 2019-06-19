import React from 'react';
import { StyleSheet, View } from 'react-native';
import {Input , Button, Header, Text , ListItem } from 'react-native-elements';
import ApolloClient from 'apollo-boost';
import { gql } from "apollo-boost";
import {ApolloProvider} from 'react-apollo';
import {AsyncStorage} from 'react-native';

const client = new ApolloClient({
  uri: "https://tq-template-server-sample.herokuapp.com/graphql ",
});


export default class UserList extends React.Component{
  constructor(props){
    super(props);
    this.userList = [
      {
        name: "joao",
        email: "joao@joao.com"
      },
      {
        name: "henrique",
        email: "henrique@henrique.com"
      },
    ];
  }

  render(){
      
    return(
      this.userList.map((l, i) => (
        <ListItem
          key={i}
          title={l.name}
          subtitle={l.email}
        />
      ))
    );

        
      
  }
}

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email: "",
      password: "",
      errorEmail: "",
      errorPass: "",
      token: "",
      page: 0,
      loading: 0,
    }    
  }

  verifyPass(pass){
    let num = false;
    if(pass.length < 7){
      return false;
    }
    for(let i = 0;i < pass.length;i++){
      if(!isNaN(pass.charAt(i))){
        return true;
      }
    }
    return false;
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  verifyEmail(email){
    const emailRegex = '^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'; // Add email regex
    return email && email.match(emailRegex);
  }
  
  handleSubmit(){
    if(!this.validateEmail(this.state.email)){
      this.setState({errorEmail: "Invalid e-mail"});
    }else{
      this.setState({errorEmail: ""});
    }

    if(!this.verifyPass(this.state.password)){
      this.setState({errorPass: "Invalid password"});
    }else{
      this.setState({errorPass: ""});
    }

    

    const myQuery = gql`
      mutation {
        Login(data: {
          email: "${this.state.email}"
          password: "${this.state.password}"
          rememberMe: true
        }){
          user{
            id
            name
            cpf
            birthDate
            email
            role
          }
          token
        }
      }
    `;
    let loginResult;
    if(this.validateEmail(this.state.email) && this.verifyPass(this.state.password)){
      this.setState({
        loading: 1,
      });
      client.mutate({
        mutation: myQuery,
      }).then(result => {
          // console.log("token" + result.data.Login.token);
          loginResult = result;
          AsyncStorage.setItem('token', result.data.Login.token);
          const retrievedToken =  AsyncStorage.getItem('token');
          //console.log("token: ");
          //console.log(retrievedToken);
          this.setState({
          token: loginResult.data.Login.token,
          activeUser: loginResult,
          page: 1,
          loading: 0,
        });      

      }).catch(error => {
        // console.log("erro do login mutate");
        // console.log(error);

        this.setState({
          email: "",
          password: "",
          page: 0,
          errorEmail: "Invalid user authentication",
          errorPass: "Invalid user authentication",
          loading: 0,
        }); 

      });
    }
  }

  render(){
    switch(this.state.page){
      case 0:
          return(
            <ApolloProvider client = {client}>
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
      
                  <Input style = {styles.inputs} label='e-mail' onChangeText = {(text) => this.setState({email: text})} 
                  errorMessage = {this.state.errorEmail}
                  />
      
                  <Input style = {styles.inputs} label='password' onChangeText = {(text) => this.setState({password: text})}
                  errorMessage = {this.state.errorPass}
                  />
                  
                  <Button style = {styles.myButton} loading = {this.state.loading == 1} title = "Submit" onPress = {() =>  this.handleSubmit()} />
                </View>
      
            </View>
          </ApolloProvider>
          );
      break;
      case 1:
          return(
            <ApolloProvider client = {client}>
              <View style={styles.container}>
                <Header
                  leftComponent={{ icon: 'menu', color: '#fff' }}
                  centerComponent={{ text: 'onBoard APP', style: { color: '#fff' } }}
                  rightComponent={{ icon: 'home', color: '#fff' }}
                />
      
                <View style={styles.view1}>
      
                </View>
      
                <View style={styles.view2}>
      
                  <Text style = {styles.taqText}> Bem vindo {this.state.activeUser.data.Login.user.name} </Text>
                  <Button style = {styles.myButton} title = "See user list" onPress = {() =>  this.setState({page: 2})} />

      
                </View>
      
            </View>
          </ApolloProvider>
          );
      break;

      case 2:
          return(
            <ApolloProvider client = {client}>
              <View style={styles.container}>
                <Header
                  leftComponent={{ icon: 'menu', color: '#fff' }}
                  centerComponent={{ text: 'onBoard APP', style: { color: '#fff' } }}
                  rightComponent={{ icon: 'home', color: '#fff' }}
                />
      
                <View style={styles.view1}>
      
                </View>
      
                <View style={styles.view2}>
      
                  <UserList/>
                </View>
      
            </View>
          </ApolloProvider>
          );
      break;

      default:
        return null;
    }
  }
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
