import React, { useState ,useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Courses from "./Courses";
import MyLearning from "./MyLearning";


// Create Tab Navigator
const Tab = createMaterialTopTabNavigator();

// My Info tab content
const MyInfo = ({ user, navigation }) => (
  <View style={styles.container}>
    {user.photoUrl && user.photoUrl.startsWith("http") ? (
      <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
    ) : (
      <View style={styles.initialAvatar}>
        <Text style={styles.initialText}>
          {user.name?.charAt(0).toUpperCase()}
        </Text>
      </View>
    )}

    <Text style={styles.name}>{user.name}</Text>
    <Text style={styles.role}>Email: {user.email}</Text>
    <Text style={styles.role}>Role: {user.role}</Text>

    <TouchableOpacity
      style={styles.editButton}
      onPress={() => navigation.navigate("EditProfile", { user })}
    >
      <Ionicons name="create-outline" size={20} color="white" />
      <Text style={styles.editText}>Edit</Text>
    </TouchableOpacity>
  </View>
);

export default function Profile() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      Alert.alert("Success", "You have been logged out.");
      navigation.replace("Login");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Something went wrong while logging out.");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        "https://growskill-6gaq.onrender.com/api/v1/user/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        Alert.alert("Error", data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      Alert.alert("Error", "Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "GrowSkill",
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


useEffect(() => {
  fetchUserProfile();
}, []);



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarStyle: { backgroundColor: "#f1f5f9" },
        tabBarIndicatorStyle: { backgroundColor: "#3b82f6" },
      }}
    >
      <Tab.Screen name="My Info">
        {() => <MyInfo user={user} navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name="Courses" component={Courses} />
      <Tab.Screen name="MyLearning" component={MyLearning} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
  },
  role: {
    fontSize: 16,
    color: "#475569",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
  },
  initialAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  initialText: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  editText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});
