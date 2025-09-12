
import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PostCard } from "@/components/PostCard";
import { styles } from "@/styles/postScreenStyles";
import { Header } from "@/components/Header";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchAnnouncements } from "@/redux/slices/announcementSlice";
import AppModal from "@/common/AppModal";
import { Dropdown } from "react-native-element-dropdown";
import { Search, Filter, Plus, CheckSquare, Square, ClipboardList, Volume2, Image as ImageIcon, Clock4, Upload } from "lucide-react-native";
import {launchImageLibrary} from 'react-native-image-picker';
import { Image } from "react-native"; 

export const PostScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { records, isLoading, error } = useSelector(
    (state: RootState) => state.announcements
  );

  // Step 1 modal (Post type)
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("General");
  const [imgModalVisible, setImgModalVisible] = useState(false);

  // Step 2 modal (Audience selection for "General")
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [audienceModalVisible, setAudienceModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const audienceOptions = [
  { label: "All Users", value: "all" },
  { label: "Departments", value: "departments" },
  { label: "Individuals", value: "individuals" },
];

  const [selected, setSelected] = useState<string[]>([]);


  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  // Dynamic data based on Audience type
  const getDropdownData = () => {
    if (selectedAudience.includes("departments")) return departments;
    if (selectedAudience.includes("individuals")) return individuals;
    if (selectedAudience.includes("allUsers")) return allUsers;
    return [];
  };

// Example mock data
const allUsers = [
  { label: "User 1", value: "1" },
  { label: "User 2", value: "2" },
  { label: "User 3", value: "3" },
];
const departments = [
  { label: "HR", value: "hr" },
  { label: "Engineering", value: "eng" },
  { label: "Finance", value: "fin" },
];
const individuals = [
  { label: "John Doe", value: "john" },
  { label: "Jane Smith", value: "jane" },
  { label: "Mark Lee", value: "mark" },
];

  const options = [
    {
      id: "General",
      title: "General",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      icon: "📘",
    },
    {
      id: "Praise",
      title: "Praise",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      icon: "👏",
    },
    {
      id: "Poll",
      title: "Poll",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      icon: "📊",
    },
  ];


const permissionOptions = [
  { label: "Likes", value: "likes" },
  { label: "Comments", value: "comments" },
  { label: "Repost", value: "repost" },
  { label: "Share", value: "share" },
];

  useEffect(() => {
    let payload = {
      postName: "all",
      searchParam: "",
    };
    dispatch(fetchAnnouncements(payload));
  }, [dispatch]);

  const handleConfirmOption = () => {
    if (selectedOption === "General") {
      setModalVisible(false);
      setAudienceModalVisible(true);
    } else {
      console.log("Selected:", selectedOption);
      setModalVisible(false);
      setAudienceModalVisible(true);
    }
  };

  const handleConfirmAudience = () => {
    console.log("Audience:", selectedAudience, "Users:", selectedUsers);
    setAudienceModalVisible(false);
    setPostModalVisible(true);
  };

  const openImageEditor = () => {
    setImgModalVisible(true);
  }

  const handleConfirmUpload = () => {
    console.log('Confirm upload action');
    setImgModalVisible(false);
  };

  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, response => {
      if (response.didCancel || !response.assets?.length) {
        console.log('No image selected');
        return;
      }

      const selectedAsset = response.assets[0];
      if (selectedAsset?.uri) {
        setSelectedImage(selectedAsset.uri);
      }
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#f2f2f2' }}
      edges={['top', 'left', 'right']}
    >
      <Header title="Posts" />

      {/* Search + Buttons */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Filter size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.container}>
          <AppModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          >
            <View style={styles.iconGeneralCircle}>
              <Volume2 size="20" color="#0E79B6" />
            </View>
            <Text style={styles.modalTitle}>Post</Text>
            <Text style={styles.subtitle}>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry.
            </Text>

            {options.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.option,
                  selectedOption === option.id && styles.optionSelected,
                ]}
                onPress={() => setSelectedOption(option.id)}
              >
                <View style={styles.optionHeader}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.iconCircle,
                      selectedOption === option.id && styles.iconCircleSelected,
                    ]}
                  >
                    <Text style={styles.iconText}>{option.icon}</Text>
                  </View>

                  {/* Title */}
                  <Text
                    style={[
                      styles.optionTitle,
                      selectedOption === option.id &&
                        styles.optionTitleSelected,
                    ]}
                  >
                    {option.title}
                  </Text>

                  {/* Radio */}
                  <View
                    style={[
                      styles.radioOuter,
                      selectedOption === option.id && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedOption === option.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>

                {/* Description */}
                <Text
                  style={[
                    styles.optionDesc,
                    selectedOption === option.id && styles.optionDescSelected,
                  ]}
                >
                  {option.desc}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmOption}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </AppModal>

          <AppModal
            visible={audienceModalVisible}
            onClose={() => setAudienceModalVisible(false)}
          >
            <View style={styles.iconGeneralCircle}>
              <Volume2 size="20" color="#0E79B6" />
            </View>
            <Text style={styles.modalTitle}>{selectedOption}</Text>
            <Text style={styles.subtitle}>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry.
            </Text>
            <View>
              {/* Audience Multi-select */}
              <Text style={{ fontSize: 16, marginBottom: 8 }}>
                Select Audience
              </Text>
              <Dropdown
                style={{
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  marginBottom: 15,
                  borderColor: '#ccc',
                }}
                data={audienceOptions}
                labelField="label"
                valueField="value"
                placeholder="Choose audience"
                value={selectedAudience}
                onChange={item => {
                  if (selectedAudience.includes(item.value)) {
                    setSelectedAudience(
                      selectedAudience.filter(v => v !== item.value),
                    );
                  } else {
                    setSelectedAudience([...selectedAudience, item.value]);
                  }
                }}
                renderItem={item => {
                  const isSelected = selectedAudience.includes(item.value);
                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 10,
                      }}
                    >
                      <Text style={{ flex: 1 }}>{item.label}</Text>
                      {isSelected ? (
                        <CheckSquare size={20} color="#2196F3" />
                      ) : (
                        <Square size={20} color="#ccc" />
                      )}
                    </View>
                  );
                }}
              />

              {/* Conditionally show sub-dropdown */}
              {selectedAudience.includes('departments') ||
              selectedAudience.includes('individuals') ||
              selectedAudience.includes('allUsers') ? (
                <>
                  <Text style={{ fontSize: 16, marginBottom: 8 }}>
                    {selectedAudience.includes('departments')
                      ? 'Select Departments'
                      : 'Select Users'}
                  </Text>

                  <Dropdown
                    style={{
                      height: 50,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      borderColor: '#ccc',
                    }}
                    data={getDropdownData()}
                    labelField="label"
                    valueField="value"
                    placeholder="Choose option"
                    value={
                      selectedAudience.includes('departments')
                        ? selectedDepartments
                        : selectedUsers
                    }
                    onChange={item => {
                      if (selectedAudience.includes('departments')) {
                        if (selectedDepartments.includes(item.value)) {
                          setSelectedDepartments(
                            selectedDepartments.filter(v => v !== item.value),
                          );
                        } else {
                          setSelectedDepartments([
                            ...selectedDepartments,
                            item.value,
                          ]);
                        }
                      } else {
                        if (selectedUsers.includes(item.value)) {
                          setSelectedUsers(
                            selectedUsers.filter(v => v !== item.value),
                          );
                        } else {
                          setSelectedUsers([...selectedUsers, item.value]);
                        }
                      }
                    }}
                    renderItem={item => {
                      const isSelected = selectedAudience.includes(
                        'departments',
                      )
                        ? selectedDepartments.includes(item.value)
                        : selectedUsers.includes(item.value);

                      return (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 10,
                          }}
                        >
                          <Text style={{ flex: 1 }}>{item.label}</Text>
                          {isSelected ? (
                            <CheckSquare size={20} color="#2196F3" />
                          ) : (
                            <Square size={20} color="#ccc" />
                          )}
                        </View>
                      );
                    }}
                  />
                </>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmAudience}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </AppModal>

          <AppModal
            visible={postModalVisible}
            onClose={() => setPostModalVisible(false)}
          >
            <View style={styles.iconGeneralCircle}>
              <ClipboardList size="20" color="#0E79B6" />
            </View>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.modalTitle}>{selectedOption}</Text>
                <Text style={styles.subtitle}>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry.
                </Text>
              </View>
            </View>

            <View>
              <Text style={styles.subjectText}>Subject</Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter subject"
                style={styles.input}
              />

              <Text style={styles.subjectText}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                multiline
                style={[styles.input, styles.textarea]}
              />

              <Text style={styles.subjectText}>Permissions</Text>
              <Dropdown
                style={{
                  height: 50,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  borderColor: '#ccc',
                }}
                data={permissionOptions}
                labelField="label"
                valueField="value"
                placeholder="Select permissions"
                value={selected}
                onChange={item => {
                  if (selected.includes(item.value)) {
                    setSelected(selected.filter(i => i !== item.value));
                  } else {
                    setSelected([...selected, item.value]);
                  }
                }}
                renderItem={item => {
                  const isSelected = selected.includes(item.value);
                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 10,
                      }}
                    >
                      <Text style={{ flex: 1 }}>{item.label}</Text>
                      {isSelected ? (
                        <CheckSquare size={20} color="#2196F3" />
                      ) : (
                        <Square size={20} color="#ccc" />
                      )}
                    </View>
                  );
                }}
              />
            </View>

            <View style={styles.imgIconBlock}>
              <ImageIcon
                onPress={openImageEditor}
                size="20"
                color="gray"
              ></ImageIcon>
              <Clock4 size="20" color="gray"></Clock4>
            </View>

            {/* Confirm */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                console.log('Post data:', {
                  subject,
                  description,
                  selectedPermissions,
                });
                setPostModalVisible(false);
              }}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </AppModal>

          <AppModal
            visible={imgModalVisible}
            onClose={() => setImgModalVisible(false)}
          >
            <View style={styles.iconGeneralCircle}>
              <ImageIcon size={24} color="#0E79B6" />
            </View>

            {/* Title + Subtitle */}
            <Text style={styles.modalTitle}>Upload Image</Text>
            <Text style={styles.subtitle}>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry.
            </Text>

            {/* Upload box */}
            {/* <TouchableOpacity
              style={styles.uploadBox}
              onPress={handleImageUpload}
            >
              <Upload size={28} color="#888" />
              <Text style={styles.uploadText}>
                <Text style={styles.uploadLink}>Click to upload</Text> or drag
                and drop
              </Text>
              <Text style={styles.uploadHint}>
                SVG, PNG, JPG or GIF (max. 800×400px)
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={handleImageUpload}
            >
              <Upload size={28} color="#888" />
              <Text style={styles.uploadText}>
                <Text style={styles.uploadLink}>Click to upload</Text> or drag
                and drop
              </Text>
              <Text style={styles.uploadHint}>
                SVG, PNG, JPG or GIF (max. 800×400px)
              </Text>
            </TouchableOpacity>

            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={{
                  width: 120,
                  height: 120,
                  marginTop: 10,
                  borderRadius: 8,
                }}
              />
            ) : (
              <></>
            )}

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmUpload}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </AppModal>
        </View>
      </View>

      {/* Loading state */}
      {isLoading && <ActivityIndicator size="large" color="#2196F3" />}

      {/* Error state */}
      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          {error}
        </Text>
      )}

      {/* Posts Feed */}
      <FlatList
        data={records}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            announcement={item}
            id={item.id}
            name={`${item.createdByUser?.first_name || ''} ${
              item.createdByUser?.last_name || ''
            }`}
            date={item.created_at}
            title={item.subject}
            content={item.description}
            images={item.document_urls || []}
            likes={item.total_likes}
            comments={item.total_comments}
            profileImage={item.createdByUser?.image_url}
            profileColor={item.createdByUser?.profile_color}
          />
        )}
      />
    </SafeAreaView>
  );
};


