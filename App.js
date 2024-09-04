import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { useState } from "react";

export default function App() {
  //Hver note skal returneres som en string (tekst)
  const [note, setNote] = useState("");
  //Laver 2 noter som allerede vil eksistere i notelisten
  const [noteText, setNoteText] = useState([
    { key: 1, noteType: "Husk ugeopgave 1 i MOD" },
    { key: 2, noteType: "Husk ugeopgave 2 i MOD" },
  ]);

  function buttonHandler() {
    //For hver ny note, vil den altid komme øverst efter den senest note
    setNoteText([{ key: noteText.length + 1, noteType: note }, ...noteText]);
    setNote(""); //Input felt bliver tomt
    // Viser en alert-besked efter en forsinkelse på 100 millisekunder
    //Besked vises først efter listen er opdateret
    setTimeout(() => {
      alert("Din note: " + note + " ,er gemt");
    }, 100);
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
        </TouchableOpacity>
      </View>

      <View style={styles.containerList}>
        <FlatList
          data={noteText}
          renderItem={(listNotes) => (
            <Text style={styles.noteItem}>• {listNotes.item.noteType}</Text> //Listen af noter som er string i et array
          )}
        />
      </View>
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
  containerList: {
    backgroundColor: "#fcefbb",
    alignItems: "center",
    height: 400,
    width: 500,
    borderColor: "black",
    borderWidth: 2,
  },
  noteText: {
    fontSize: 30,
    padding: 20,
    fontWeight: "bold",
    marginTop: 50,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ffbe30", //yellow
    padding: 15,
    borderRadius: 5,
    marginBottom: 40, //distance from bottom
  },
  buttonText: {
    color: "#000000", //black
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "black", // Sort kant
    borderWidth: 1, // Tykkelse af kanten
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "30%",
    borderRadius: 5, // Afrunding af hjørner
    backgroundColor: "#f5f5f5", // grå baggrundsfarve
    fontSize: 15,
  },
  noteItem: {
    fontSize: 18, // Større tekststørrelse for noterne
    padding: 10, // Giver lidt ekstra plads omkring hver note
  },
});
