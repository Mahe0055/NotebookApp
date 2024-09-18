import { StatusBar } from "expo-status-bar";
import { app, database } from './firebase'
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useCollection } from 'react-firebase-hooks/firestore';
import { AntDesign } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  const [note, setNote] = useState("");
  const [values, loading, error] = useCollection(collection(database, "notes"));
  const noteText = values?.docs.map((doc) => ({id: doc.id, noteType: doc.data().text})) || [];

  async function buttonHandler() {
    try {
      await addDoc(collection(database, "notes"), {
        text: note
      });
      setNote("");
      setTimeout(() => {
        alert("Din note: " + note + " ,er gemt");
      }, 100);
    } catch(err) {
      console.log("fejl i DB:", err);
    }
  }

  async function deleteDocument(id) {
    try {
      await deleteDoc(doc(database, "notes", id));
    } catch (err) {
      console.log("Fejl ved sletning:", err);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.noteText}>
        Velkommen! Her kan du skrive og gemme dine noter
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={(txt) => setNote(txt)}
        value={note}
      />
      <TouchableOpacity style={styles.button} onPress={buttonHandler}>
        <Text style={styles.buttonText}>Gem note</Text>
      </TouchableOpacity>

      <View style={styles.containerList}>
        <FlatList
          data={noteText}
          renderItem={({item}) => (
            <View style={styles.noteContainer}>
              <TouchableOpacity
                style={styles.noteTextContainer}
                onPress={() =>
                  navigation.navigate("NoteDetail", {
                    note: item.noteType,
                    id: item.id,
                  })
                } 
              >
                <Text style={styles.noteItem}>• {item.noteType}</Text>              
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => deleteDocument(item.id)}
                style={styles.deleteButton}
              >
                <AntDesign name="delete" size={24} color="#FF6347" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

function NoteDetailScreen({ route, navigation }) {
  const { note, id } = route.params;
  const [editableNote, setEditableNote] = useState(note);

  const saveNoteHandler = async () => {
    try {
      await updateDoc(doc(database, "notes", id), {
        text: editableNote
      });
      navigation.navigate("Home");
    } catch (err) {
      console.log("Fejl ved opdatering:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.noteText}>Detaljer for noten:</Text>
      <TextInput
        style={styles.input}
        multiline={true}
        value={editableNote}
        onChangeText={setEditableNote}
      />
      <TouchableOpacity style={styles.button} onPress={saveNoteHandler}>
        <Text style={styles.buttonText}>Gem ændringer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  containerList: {
    flex: 1,
    backgroundColor: "#fcefbb",
    width: "90%",
    borderColor: "black",
    borderWidth: 2,
    marginBottom: 70,
    borderRadius: 10,
    padding: 10,
  },
  noteText: {
    fontSize: 30,
    padding: 20,
    fontWeight: "bold",
    marginTop: 50,
  },
  input: {
    height: 70,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "75%",
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
    fontSize: 15,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  noteTextContainer: {
    flex: 1,
  },
  noteItem: {
    fontSize: 18,
    padding: 10,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ffbe30",
    padding: 15,
    borderRadius: 5,
    marginBottom: 40,
    marginTop: 20,
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
  },
  deleteButton: {
    padding: 10,
  },
});