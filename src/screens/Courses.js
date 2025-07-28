import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCoursePress = async (course) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Login Required", "Please login to view course details.");
      return;
    }

    navigation.navigate("CourseDetails", { course });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>All Courses</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCoursePress(item)}>
            <View style={styles.courseCard}>
              {item.courseThumbnail && (
                <Image
                  source={{ uri: item.courseThumbnail }}
                  style={styles.thumbnail}
                />
              )}
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.creator}>
                By: {item.creator?.name || "Unknown"}
              </Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>Price: ${item.coursePrice}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    color: "#1f2937",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  title: {
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
  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    marginBottom: 10,
  },
});
