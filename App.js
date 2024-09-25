import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { app, database, storage } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
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
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useCollection } from "react-firebase-hooks/firestore";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

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
  const [editObj, setEditObj] = useState(null);
  const [values, loading, error] = useCollection(collection(database, "notes"));
  const noteText =
    values?.docs.map((doc) => ({ id: doc.id, noteType: doc.data().text })) ||
    [];

  async function buttonHandler() {
    if (note.trim() === "") return;
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
    if (note.trim() === "") return;
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
          style={[styles.input, editObj && styles.editingInput]}
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
                style={[styles.iconButton, styles.iconMargin]}
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
  const [downloadedImageUrl, setDownloadedImageUrl] = useState(null);

  useEffect(() => {
    downloadImage();
  }, []);

  const saveNoteHandler = async () => {
    if (editableNote.trim() === "") return;
    try {
      await updateDoc(doc(database, "notes", id), {
        text: editableNote,
      });
      navigation.navigate("Home");
    } catch (err) {
      console.log("Fejl ved opdatering:", err);
    }
  };

  async function launchImagePicker() {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImagePath(result.assets[0].uri);
    }
  }

  async function uploadImage() {
    if (!imagePath) return;

    const res = await fetch(imagePath);
    const blob = await res.blob();
    const storageRef = ref(storage, `notes/${id}/image.jpg`);

    try {
      await uploadBytes(storageRef, blob);
      alert("Billede er uploadet");
      downloadImage();
    } catch (error) {
      console.error("Fejl ved upload af billede:", error);
      alert("Der opstod en fejl under upload af billedet.");
    }
  }

  async function downloadImage() {
    const storageRef = ref(storage, `notes/${id}/image.jpg`);
    try {
      const url = await getDownloadURL(storageRef);
      setDownloadedImageUrl(url);
    } catch (error) {
      console.log("Fejl ved download af billede:", error);
    }
  }

  async function deleteImage() {
    const storageRef = ref(storage, `notes/${id}/image.jpg`);
    try {
      await deleteObject(storageRef);
      setDownloadedImageUrl(null);
      alert("Billede er slettet");
    } catch (error) {
      console.log("Fejl ved sletning af billede:", error);
      alert("Der opstod en fejl under sletning af billedet.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.noteText}>Detaljer for noten:</Text>
      <TextInput
        style={styles.narrowInput}
        multiline={true}
        value={editableNote}
        onChangeText={setEditableNote}
      />
      <TouchableOpacity style={styles.button} onPress={saveNoteHandler}>
        <Text style={styles.buttonText}>Gem ændringer</Text>
      </TouchableOpacity>

      {downloadedImageUrl && (
        <>
          <Image
            source={{ uri: downloadedImageUrl }}
            style={styles.largeImage}
          />
          <TouchableOpacity style={styles.deleteButton} onPress={deleteImage}>
            <Text style={styles.buttonText}>Slet billede</Text>
          </TouchableOpacity>
        </>
      )}
      {imagePath && !downloadedImageUrl && (
        <Image source={{ uri: imagePath }} style={styles.largeImage} />
      )}
      <TouchableOpacity style={styles.blueButton} onPress={launchImagePicker}>
        <Text style={styles.buttonText}>Vælg billede</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.blueButton} onPress={uploadImage}>
        <Text style={styles.buttonText}>Upload billede</Text>
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
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    fontSize: 16,
  },
  narrowInput: {
    width: "90%",
    height: 100,
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 10,
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
  updateButton: {
    backgroundColor: "#4682B4",
  },
  editingInput: {
    backgroundColor: "#e0f7fa",
    borderColor: "#4682B4",
  },
  iconMargin: {
    marginLeft: 20,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ffbe30",
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  blueButton: {
    alignItems: "center",
    backgroundColor: "#4682B4",
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  largeImage: {
    width: 250,
    height: 250,
    marginVertical: 10,
  },
});
