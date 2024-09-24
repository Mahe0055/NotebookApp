import { StatusBar } from "expo-status-bar";
import { app, database } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  snapshot,
} from "firebase/firestore";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useCollection } from "react-firebase-hooks/firestore";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Button } from "react-native-web";
import { storage } from "./firebase";
import { ref, uploadBytes } from "firebase/storage";

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
  const [note, setNote] = useState(""); // For new notes
  const [editObj, setEditObj] = useState(null); // For editing existing notes
  const [values, loading, error] = useCollection(collection(database, "notes"));
  const noteText =
    values?.docs.map((doc) => ({ id: doc.id, noteType: doc.data().text })) ||
    [];

  async function buttonHandler() {
    if (note.trim() === "") return; // Prevent empty notes
    try {
      await addDoc(collection(database, "notes"), {
        text: note,
      });
      setNote("");
      setTimeout(() => {
        alert("Din note: " + note + " ,er gemt");
      }, 100);
    } catch (err) {
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

  function updateDocument(item) {
    setEditObj(item);
    setNote(item.noteType);
  }

  async function saveUpdate() {
    if (note.trim() === "") return; // Prevent empty notes
    try {
      await updateDoc(doc(database, "notes", editObj.id), {
        text: note,
      });
      setNote("");
      setEditObj(null);
    } catch (err) {
      console.log("Fejl ved opdatering:", err);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.noteText}>
        Velkommen! Her kan du skrive og gemme dine noter
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setNote}
          value={note}
          placeholder={editObj ? "Rediger note" : "Skriv en ny note"}
        />
        <TouchableOpacity
          style={[styles.button, editObj && styles.updateButton]}
          onPress={editObj ? saveUpdate : buttonHandler}
        >
          <Text style={styles.buttonText}>
            {editObj ? "Opdater" : "Gem note"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.containerList}>
        <FlatList
          data={noteText}
          renderItem={({ item }) => (
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
                style={styles.iconButton}
              >
                <AntDesign name="delete" size={24} color="#FF6347" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateDocument(item)}
                style={styles.iconButton}
              >
                <AntDesign name="edit" size={24} color="#47e000" />
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
  const [imagePath, setImagePath] = useState(null);

  const saveNoteHandler = async () => {
    if (editableNote.trim() === "") return; // Prevent empty notes
    try {
      await updateDoc(doc(database, "notes", id), {
        text: editableNote,
      });
      navigation.navigate("Home");
    } catch (err) {
      console.log("Fejl ved opdatering:", err);
    }
  };

  //funktion til at hente billede fra device
  async function launchImagePicker() {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImagePath(result.assets[0].uri);
    }
  }

  //funktion til at uploade billede til Firebase
  async function uploadImage() {
    const res = await fetch(imagePath);
    const blob = await res.blob();
    const storageRef = ref(storage, "myimage.jpg");
    uploadBytes(storageRef, blob).then((snapshot) => {
      alert("Billede er uploadet");
    });
  }

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

      <Image style={{ width: 200, height: 200 }} source={{ uri: imagePath }} />
      {/* Hent billede fra device*/}
      <Button title="Hent billede" onPress={launchImagePicker} />
      {/* Upload billede til Firebase*/}
      <Button title="Upload billede" onPress={uploadImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: "100%",
    alignSelf: "center",
  },
  containerList: {
    flex: 1,
    backgroundColor: "#fcefbb",
    width: "100%",
    borderColor: "black",
    borderWidth: 2,
    marginBottom: 70,
    borderRadius: 10,
    padding: 10,
  },
  noteText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "black",
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
    fontSize: 16,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  noteTextContainer: {
    flex: 1,
  },
  noteItem: {
    fontSize: 16,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ffbe30",
    padding: 15,
    borderRadius: 5,
  },
  updateButton: {
    backgroundColor: "#47e000",
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
});
