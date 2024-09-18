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
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useCollection } from 'react-firebase-hooks/firestore';

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

function HomeScreen({ navigation, route }) {
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
      <View>
        <TouchableOpacity style={styles.button} onPress={buttonHandler}>
          <Text style={styles.buttonText}>Gem note</Text>
          {/* Knap til at gemme ny note */}
        </TouchableOpacity>
      </View>

      <View style={styles.containerList}>
        <FlatList
          data={noteText}
          renderItem={({item}) => (
            <View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("NoteDetail", {
                    note: item.noteType,
                    id: item.id,
                  })
                } 
              >
                <Text style={styles.noteItem}>• {item.noteType}</Text>              
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteDocument(item.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
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

// Detaljeskærm for at vise/redigere hele noten
function NoteDetailScreen({ route, navigation }) {
  const { note, key } = route.params; // Henter noten og nøgle fra navigationen
  const [editableNote, setEditableNote] = useState(note); // State til redigérbar tekst

  // Handler for at gemme ændringer og gå tilbage til HomeScreen
  const saveNoteHandler = () => {
    // Naviger tilbage til HomeScreen og send opdateret note som parametre
    navigation.navigate("Home", { updatedNote: editableNote, key: key });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.noteText}>Detaljer for noten:</Text>
      <TextInput
        style={styles.input}
        multiline={true} // Tillader flere linjer
        value={editableNote} // Viser den redigerbare note
        onChangeText={setEditableNote} // Opdaterer tekst state
      />
      {/* Tilføjer en gem knap */}
      <TouchableOpacity style={styles.button} onPress={saveNoteHandler}>
        <Text style={styles.buttonText}>Gem ændringer</Text>
        {/* Knappen til at gemme ændringer */}
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
    alignItems: "center",
    width: "50%",
    borderColor: "black",
    borderWidth: 2,
    marginBottom: 70,
  },
  deleteButton: {
    color: 'red',
    padding: 5,
  },
  noteText: {
    fontSize: 30,
    padding: 20,
    fontWeight: "bold",
    marginTop: 50,
  },
  input: {
    height: 70, // Højden på tekstinputfeltet
    borderColor: "black", // Sort kant
    borderWidth: 1, // Tykkelsen af kanten
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "75%", // Giver bredde på tekstinput
    borderRadius: 5, // Afrunding af hjørner
    backgroundColor: "#f5f5f5", // Lys baggrundsfarve
    fontSize: 15,
  },
  noteItem: {
    fontSize: 18,
    padding: 10,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ffbe30", // Gul baggrundsfarve
    padding: 15,
    borderRadius: 5,
    marginBottom: 40, // Afstand fra bunden
    marginTop: 20, // Ekstra margin for at separere knappen fra inputfeltet
  },
  buttonText: {
    color: "#000000", // Sort tekst
    fontWeight: "bold",
  },
});
