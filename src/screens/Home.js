import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export default function Home({ navigation }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        "https://growskill-6gaq.onrender.com/api/v1/course/published-courses"
      );
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkLoginStatus = async () => {
        const token = await AsyncStorage.getItem("token");
        setIsLoggedIn(!!token);
      };

      checkLoginStatus();
      fetchCourses();
    }, [])
  );

  const handleCoursePress = async (course) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Login Required", "Please login to view course details.");
      return;
    }

    navigation.navigate("CourseDetails", { course });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to GrowSkill</Text>
      <Text style={styles.subtitle}>Learn. Grow. Succeed.</Text>
      <Text style={styles.certText}>
        Want to become a certified professional?
      </Text>

      {!isLoggedIn ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.buttonText}>Go to Profile</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.heading}>Available Courses</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCoursePress(item)}>
              <View style={styles.courseCard}>
                {item.courseThumbnail && (
                  <Image
                    source={{ uri: item.courseThumbnail }}
                    style={styles.thumbnail}
                  />
                )}
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.creator}>
                  By: {item.creator?.name || "Unknown"}
                </Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.price}>Price: ${item.coursePrice}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f8ff",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 12,
  },
  certText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  creator: {
    marginTop: 4,
    color: "#64748b",
  },
  description: {
    marginTop: 6,
    color: "#475569",
  },
  price: {
    marginTop: 8,
    fontWeight: "600",
    color: "#16a34a",
  },
});
