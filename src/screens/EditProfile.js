import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";

const EditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params; // passed from profile page

  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(null); // local image URI

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert("Permission denied", "We need camera roll permissions.");
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Image Picker Error:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Not authorized");

      const formData = new FormData();
      formData.append("name", name);

      if (image) {
        const filename = image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("profile", {
          uri: image,
          name: filename,
          type,
        });
      }

      const response = await fetch("https://growskill-6gaq.onrender.com/api/v1/user/profile/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Server Error:", data);
        return Alert.alert("Update failed", data.message || "Something went wrong");
      }

      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();

    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Update failed", "An unexpected error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
      />

      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      <Button title="Choose Image" onPress={pickImage} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Update Profile" onPress={handleUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    alignSelf: "center",
  },
});

export default EditProfile;
