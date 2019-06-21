import React from 'react';
import { StyleSheet, View } from 'react-native';
import {Input , Button, Header, Text , ListItem } from 'react-native-elements';
import ApolloClient from 'apollo-boost';
import { gql } from "apollo-boost";
import {ApolloProvider, Query, Mutation} from 'react-apollo';
import {AsyncStorage} from 'react-native';
import {graphql} from 'graphql';
import { InMemoryCache } from 'apollo-boost';
import { HttpLink } from 'apollo-link-http';
import UserScreen from 'UserScreen';



const client = new ApolloClient({
  uri: "https://tq-template-server-sample.herokuapp.com/graphql ",
});

let authClient;


export default class UserList extends React.Component{
  constructor(props){
    super(props);
    

  }

  render(){
    
    console.log("a list de users");
    console.log(this.props.list);

    return(
      this.props.list.map((l, i) => (
        <ListItem
          key={i}
          title={l.name}
          subtitle={l.email}
          onPress={() => this.props.listPress(l.id)}
        />
      ))
    );

        
      
  }
}

export default class App extends React.Component {
  newUser =  {
    name: "",
    email: "",
    role: "",
    password: "",
    birthDate: "",
    cpf: "",
  };

  hasCalledMutation = 0;

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
      currPage: 0,
      statusAddUser: 0,
      idAddUser: -1,
      userId: -1,
      userToShow: "",
    }
  }

  goHome(){
    this.setState({
      page: 1,
      currPage: 1,
      statusAddUser: 0,
      userToShow: -1,
      idAddUser: -1,
    });
  }

  listPress(id){
    console.log("entrou list press");
    this.setState({
      page:5,
      userToShow: id,
    });
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
  
  handleSubmitUser(){

    const createUser = gql`
              mutation {
                UserCreate(data:{
                  name: "${this.newUser.name}"
                  email: "${this.newUser.email}"
                  cpf: "${this.newUser.cpf}"
                  birthDate: "${this.newUser.birthDate}"
                  password: "${this.newUser.password}"
                  role: ${this.newUser.role}
                }){
                  id
                }
              }
            `;

    

    authClient.mutate({
      mutation: createUser,
    }).then(result => {
        let loginResult = result;
        let id = result.data.UserCreate.id;
        console.log("user id: " + id + "created");

        this.setState({
          page: 2,
          statusAddUser: 1,
        });

    }).catch(error => {
        console.log("erro no create user");
        console.log(error);

      this.setState({
        page: 2,
        statusAddUser: -1,
      });

    });
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
        
        authClient = new ApolloClient({
          cache: new InMemoryCache({
            addTypename: false
          }),
          uri: "https://tq-template-server-sample.herokuapp.com/graphql ",
          request: operation => {
            operation.setContext({
              headers: {
                authorization: loginResult.data.Login.token
              }
            });
          }
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
                  rightComponent={{ icon: 'home', color: '#fff',onPress: () => this.goHome() }}
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
                  rightComponent={{ icon: 'home', color: '#fff' ,onPress: () => this.goHome()}}
                />
      
                <View style={styles.view1}>
      
                </View>
      
                <View style={styles.view2}>
      
                  <Text style = {styles.taqText}> Bem vindo {this.state.activeUser.data.Login.user.name} </Text>
                  <Button style = {styles.myButton} title = "See user list" onPress = {() =>  this.setState({page: 2})} />
                  <Button style = {styles.myButton} title = "Add user" onPress = {() =>  this.setState({page: 3})} />


      
                </View>
      
            </View>
          </ApolloProvider>
          );
      break;

      case 2:
          const queryUsers = gql`
            query {
              Users(limit: 6, offset: ${this.state.currPage * 5}){
                nodes{
                  id
                  name
                  email
                }
                pageInfo{
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `;

          return(
            <ApolloProvider client = {authClient}>
              <View style={styles.container}>
                <Header
                  leftComponent={{ icon: 'menu', color: '#fff' }}
                  centerComponent={{ text: 'onBoard APP', style: { color: '#fff' } }}
                  rightComponent={{ icon: 'home', color: '#fff' ,onPress: () => this.goHome() }}
                />
      
                <View style={styles.view1_2}>
                  {
                    (this.state.statusAddUser == 1) ? <Text style = {styles.taqText}> User added succesfuly! </Text> : null
                  }                  
                  {
                    (this.state.statusAddUser == -1) ? <Text style = {styles.taqText}> Error adding the user... </Text> : null 
                  }
                  <Text style = {styles.taqText}> User List: </Text>
      
                </View>
      

                  <Query query={queryUsers}>
                    {({ loading, error, data }) => {
                      if (loading) return(<Text style = {styles.taqText}> Loading... </Text>);
                      if (error) return(<Text style = {styles.taqText}> Error! </Text>);

                      return (
                        <View style = {styles.view2}>

                          <UserList listPress={(id) => this.listPress(id)} list = {data.Users.nodes}/>

                          <View style={styles.pagView}>
                            <Button style = {styles.prev} disabled = {!data.Users.pageInfo.hasPreviousPage} title = "Prev" onPress = {() =>  this.setState({currPage: this.state.currPage - 1})} />
                            <Button style = {styles.next} disabled = {!data.Users.pageInfo.hasNextPage} title = "Next" onPress = {() =>  this.setState({currPage: this.state.currPage + 1})} />
                          </View>

                        </View>

                      );
                    }}
                  </Query>
                

                
      
            </View>
          </ApolloProvider>
          );
      break;

      case 3:
        return(
          <View style={styles.container}>
                <Header
                  leftComponent={{ icon: 'menu', color: '#fff' }}
                  centerComponent={{ text: 'onBoard APP', style: { color: '#fff' } }}
                  rightComponent={{ icon: 'home', color: '#fff' ,onPress: () => this.goHome() }}
                />
      
      
                <View style={styles.view2}>
      
                  <Text style = {styles.taqText}> User data </Text>
      
                  <Input style = {styles.inputs} label='Name:' onChangeText = {(text) => this.newUser.name = text } />
                  <Input style = {styles.inputs} label='E-mail:' onChangeText = {(text) => this.newUser.email = text } />
                  <Input style = {styles.inputs} label='CPF' onChangeText = {(text) => this.newUser.cpf = text } />
                  <Input style = {styles.inputs} label='Birth date:' onChangeText = {(text) => this.newUser.birthDate = text } />
                  <Input style = {styles.inputs} label='Password' onChangeText = {(text) => this.newUser.password = text } />
                  <Input style = {styles.inputs} label='Role' onChangeText = {(text) => this.newUser.role = text } />

      
                  
                  <Button style = {styles.myButton} loading = {this.state.loading == 1} title = "Submit" onPress = {() =>  this.handleSubmitUser()} />
                </View>
      
            </View>

        );

        break;



        case 4:

            const createUser = gql`
              mutation {
                UserCreate(data:{
                  name: "${this.newUser.name}"
                  email: "${this.newUser.email}"
                  cpf: "${this.newUser.cpf}"
                  birthDate: "${this.newUser.birthDate}"
                  password: "${this.newUser.password}"
                  role: "${this.newUser.role}"
                }){
                  id
                }
              }
            `;
            


  
            return(
              <ApolloProvider client = {authClient}>
                <View style={styles.container}>
                  <Header
                    leftComponent={{ icon: 'menu', color: '#fff' }}
                    centerComponent={{ text: 'onBoard APP', style: { color: '#fff' } }}
                    rightComponent={{ icon: 'home', color: '#fff' ,onPress: () => this.goHome() }}
                  />
        
                  <View style={styles.view1_2}>
        
                  </View>
        
  
                    <Mutation mutation={createUser}>
                      {(addUser, { loading, error, data }) => {
                        if(!this.hasCalledMutation){
                          addUser();
                          this.hasCalledMutation = 1;                          
                        }
                        if (loading) return(<Text style = {styles.taqText}> Loading... </Text>);
                        if (error) return(<Text style = {styles.taqText}> Error! </Text>);                        
                        if (data) return(<Text style = {styles.taqText}> Done! :D </Text>);   
                        return null;                     
                      }}
                    </Mutation>
                  
  
                  
        
              </View>
            </ApolloProvider>
            );
        break;

        case 5:
          console.log("userToShow: " + this.state.userToShow);
          return(
            <UserScreen client = {authClient} userId = {this.state.userToShow} goHome = {() => this.goHome()}> </UserScreen>
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
  view1_2: {
    flex:0.8,
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

  pagView: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prev: {
    flex: 1,
    marginLeft: 25,
  },
  next: {
    flex: 1,
    marginLeft: 25,
  },
});
