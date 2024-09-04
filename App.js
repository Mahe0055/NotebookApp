import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useState } from "react";
import { FlatList } from "react-native-web";

export default function App() {
  const [note, setNote] = useState("");
  const notes = [
    { key: 1, noteType: "Husk ugeopgave 1 i MOD" },
    { key: 2, noteType: "Husk ugeopgave 2 i MOD" },
  ];
  function buttonHandler() {
    alert("Din note " + note + " er gemt");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.noteText}>
        Velkommen! Her kan du skrive og gemme dine noter
      </Text>
      <TextInput style={styles.input} onChangeText={(txt) => setNote(txt)} />
      <View>
        <TouchableOpacity style={styles.button} onPress={buttonHandler}>
          <Text style={styles.buttonText}>Gem note</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        renderItem={(listNotes) => <Text>• {listNotes.item.noteType}</Text>}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "column",
  },
  noteText: {
    fontSize: 30,
    padding: 20,
    fontWeight: "bold",
    marginTop: 80,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ffbe30",
    padding: 15,
    borderRadius: 5,
    marginBottom: 80,
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "black", // Sort kant
    borderWidth: 2, // Tykkelse af kanten
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "30%",
    borderRadius: 5, // Afrunding af hjørner
    backgroundColor: "#f5f5f5", // grå baggrundsfarve
  },
});
