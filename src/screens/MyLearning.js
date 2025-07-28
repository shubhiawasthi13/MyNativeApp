import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export default function MyLearning() {
  const [courses, setCourses] = useState([]);
  const navigation = useNavigation();

  const fetchEnrolledCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "https://growskill-6gaq.onrender.com/api/v1/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setCourses(response.data.user.enrollCourses || []);
      }
    } catch (error) {
      console.log("Fetch EnrollCourses Error:", error.message);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const handlePress = (course) => {
    navigation.navigate("CourseDetails", { course }); // Pass full course object
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Learning</Text>
      {courses.length === 0 ? (
        <Text style={styles.emptyText}>No enrolled courses found.</Text>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item)}>
              <View style={styles.card}>
                {item.courseThumbnail && (
                  <Image
                    source={{ uri: item.courseThumbnail }}
                    style={styles.thumbnail}
                  />
                )}
                <Text style={styles.title}>{item.courseTitle}</Text>
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
    padding: 26,
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
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
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#888",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
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

