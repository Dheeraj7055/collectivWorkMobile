import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '@/components/PostCard';
import { styles } from '@/styles/postScreenStyles';
import { Header } from '@/components/Header';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchAnnouncements, fetchBookmarks } from '@/redux/slices/announcementSlice';
import AppModal from '@/common/AppModal';
import { Dropdown } from 'react-native-element-dropdown';
import {
  Search,
  Filter,
  Plus,
  CheckSquare,
  Square,
  ClipboardList,
  Volume2,
  Image as ImageIcon,
  Clock4,
  Upload,
  Trash,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { fetchUserNamesList } from '@/redux/slices/userSlice';
import { fetchDepartmentNames } from '@/redux/slices/departmentSlice';
import AudienceDropdown from '@/components/AudienceDropdown';
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { apiClient } from '@/services/api';
import { API_ROUTES } from '@/constants/apiRoutes';
import { encodeData } from '@/utils/cryptoHelpers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '@/navigation/AppNavigator';


// --- TYPES ---
interface AudienceSelection {
  departments: string[];
  individuals: string[];
}

interface AudienceData {
  departments: any[];
  individuals: any[];
}

type PostScreenNavigationProp = StackNavigationProp<AppStackParamList, "MainTabs">;

export const PostScreen = () => {
  const navigation = useNavigation<PostScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.profile);
  const { records, isLoading, error } = useSelector(
    (state: RootState) => state.announcements,
  );
  const { names } = useSelector((state: RootState) => state.user);
  const { departmentNames } = useSelector(
    (state: RootState) => state.department,
  );

  // --- Modals ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('General');
  const [imgModalVisible, setImgModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [audienceModalVisible, setAudienceModalVisible] = useState(false);

  // --- Post state ---
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [praiseTo, setPraiseTo] = useState<string | null>(null);

  // --- Audience state ---
  const [sectionSelection, setSectionSelection] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  const [selectedAudience, setSelectedAudience] = useState<AudienceSelection>({
    departments: [],
    individuals: [],
  });
  const [selectedParent, setSelectedParent] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any>(null);
  const [generalData, setGeneralData] = useState<any>(null);
  const [tempSelectedAudience, setTempSelectedAudience] = useState<any>(null);
  const [selectedAllData, setSelectedAllData] = useState<any>(null);
   const [question, setQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // default today
  const [showPicker, setShowPicker] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  type PostFilter = "all" | "posts" | "praise" | "liked" | "repost" | "bookmark";

  const [currentPostList, setCurrentPostList] = useState<PostFilter>("all");

  const changePostDate = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleOptionChange = (text: string, index: number) => {
    const updatedOptions = [...pollOptions];
    updatedOptions[index] = text;
    setPollOptions(updatedOptions);
  };

  const addNewOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  // --- Constants ---
  const options = [
    { id: 'General', title: 'General', desc: 'Post for general updates.', icon: '📘' },
    { id: 'Praise', title: 'Praise', desc: 'Celebrate and appreciate peers.', icon: '👏' },
    { id: 'Poll', title: 'Poll', desc: 'Create a poll to gather opinions.', icon: '📊' },
  ];

  const permissionOptions = [
    { label: 'Likes', value: 'likes' },
    { label: 'Comments', value: 'comments' },
    { label: 'Repost', value: 'repost' },
    { label: 'Share', value: 'share' },
  ];

  useEffect(() => {
    dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
  }, [dispatch]);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      dispatch(
        fetchAnnouncements({
          postName: 'all',
          searchParam: text,
        }),
      );
    }, 500),
    [],
  );

  const handleFilterChange = (filter: PostFilter) => {
    setCurrentPostList(filter);

    switch (filter) {
      case 'all':
        dispatch(
          fetchAnnouncements({
            postName: 'all',
            searchParam: searchValue,
          }),
        );
        break;

      case 'posts':
        dispatch(
          fetchAnnouncements({
            postName: 'my',
            searchParam: searchValue,
          }),
        );
        break;

      case 'praise':
        dispatch(
          fetchAnnouncements({
            postName: 'praise',
            searchParam: searchValue,
          }),
        );
        break;

      case 'liked':
        dispatch(
          fetchAnnouncements({
            postName: 'liked',
            searchParam: searchValue,
          }),
        );
        break;

      case 'repost':
        dispatch(
          fetchAnnouncements({
            postName: 'repost',
            searchParam: searchValue,
          }),
        );
        break;

      case 'bookmark':
        navigation.navigate('Bookmarks');
        break;

      default:
        dispatch(
          fetchAnnouncements({
            postName: 'all',
            searchParam: searchValue,
          }),
        );
        break;
    }
  };

  const addAudience = (selectedAudience: AudienceSelection) => {
    // const parents = [
    //   ...selectedAudience.departments,
    //   ...selectedAudience.individuals,
    // ];

    const departmentUsers = departmentNames.reduce<string[]>((acc, dept) => {
      if (selectedAudience.departments.includes(String(dept.id))) {
        const users = (dept.userList || []).map((u: any) => String(u.id));
        acc.push(...users);
      }
      return acc;
    }, []);

    setSelectedParent(Array.from(new Set([
      ...selectedAudience.individuals,
      ...departmentUsers,
    ])));


    const selectedAudienceData: AudienceData = {
      departments: departmentNames
        .filter(d => selectedAudience.departments.includes(String(d.id)))
        .map(d => ({
          id: d.id,
          name: d.label,
          userList: d.userList || [],
        })),
      individuals: names
        .filter(u => selectedAudience.individuals.includes(String(u.id)))
        .map(u => ({
          id: u.id,
          firstName: u.first_name,
          lastName: u.last_name,
          email: u.email,
          image_url: u.image_url,
          profile_color: u.profile_color,
        })),
    };

    setSelectedOptions(selectedAudienceData);
    setGeneralData(selectedAudienceData);
    setTempSelectedAudience(selectedAudienceData);
    setSelectedAllData(selectedAudienceData);
  };

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);

    if (checked) {
      const updatedAudience: AudienceSelection = {
        departments: departmentNames.map(d => String(d.id)),
        individuals: names.map(u => String(u.id)),
      };
      setSelectedAudience(updatedAudience);
      addAudience(updatedAudience);
      const unique = Array.from(
        new Set([...updatedAudience.departments, ...updatedAudience.individuals]),
      );
      setSelectedParent(unique);
      setSectionSelection('all');
    } else {
      const updatedAudience: AudienceSelection = {
        departments: [],
        individuals: [],
      };
      setSelectedAudience(updatedAudience);
      addAudience(updatedAudience);
      setSelectedParent([]);
      setSectionSelection(null);
    }
  };

  const handleDepartmentsChange = (values: string[]) => {
    const updatedAudience = { ...selectedAudience, departments: values };
    setSelectedAudience(updatedAudience);
    addAudience(updatedAudience);
  };

  const handleIndividualsChange = (values: string[]) => {
    const updatedAudience = { ...selectedAudience, individuals: values };
    setSelectedAudience(updatedAudience);
    addAudience(updatedAudience);
  };

  const handleRemoveSelectedParent = (value: string) => {
    const updatedAudience = {
      ...selectedAudience,
      departments: selectedAudience.departments.filter(d => d !== value),
      individuals: selectedAudience.individuals.filter(i => i !== value),
    };
    setSelectedAudience(updatedAudience);
    addAudience(updatedAudience);
  };

  // --- Modal handlers ---
  const handleConfirmOption = () => {
    setModalVisible(false);
    setAudienceModalVisible(true);
  };

  const handleConfirmAudience = () => {
    setAudienceModalVisible(false);
    setPostModalVisible(true);
  };

  const openImageEditor = () => setImgModalVisible(true);

  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, response => {
      if (!response.didCancel && response.assets?.length) {
        const selectedAsset = response.assets[0];
        if (selectedAsset?.uri) setSelectedImage(selectedAsset.uri);
      }
    });
  };

  const openPostCreationModal = () => {
    setModalVisible(true);
    dispatch(fetchUserNamesList({}));
    dispatch(fetchDepartmentNames({}));
  };

  const removeOption = (index: number) => {
    const updatedOptions = pollOptions.filter((_, i) => i !== index);
    setPollOptions(updatedOptions);
  };

  const mergeMentionedUsers = () => {
    // ✅ merge individual IDs from state
    const updatedIndividualsIds = Array.from(
      new Set([...selectedAudience.individuals, ...selectedParent]),
    );

    // ✅ build departments object list (same as addAudience)
    const mergedDepartments = departmentNames
      .filter(d => selectedAudience.departments.includes(String(d.id)))
      .map(d => ({
        id: d.id,
        name: d.label,
        userList: d.userList || [],
      }));

    // ✅ build individuals object list
    const mergedIndividuals = names
      .filter(u => updatedIndividualsIds.includes(String(u.id)))
      .map(u => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        image_url: u.image_url,
        profile_color: u.profile_color,
      }));

    // ✅ final object for API payload
    const updatedGeneralFormData = {
      departments: mergedDepartments,
      individuals: mergedIndividuals,
    };

    return { updatedIndividuals: mergedIndividuals, updatedGeneralFormData };
  };

const handleCreate = async () => {
  try {
    const { updatedIndividuals, updatedGeneralFormData } = mergeMentionedUsers();

    // 🔹 Build payload
    const payload = {
      announcement_id: null,
      select_audience: updatedGeneralFormData,
      notification_level: selectAll ? "All" : "selection",
      schedule_announcement: selectedDate.toISOString(),
      subject: selectedOption === "Poll" ? null : subject,
      // selected_users: updatedIndividuals,
      type: selectedOption.toLowerCase(),
      description: selectedOption === "Poll" ? null : description,
      options: selectedOption === "Poll" ? pollOptions : null,
      question: selectedOption === "Poll" ? question : null,
      status: "Active",
      praised_to: praiseTo || null,
      post_configuration: {
        likesEnabled: selectedPermissions.includes("likes"),
        commentsEnabled: selectedPermissions.includes("comments"),
        repostEnabled: selectedPermissions.includes("repost"),
        shareEnabled: selectedPermissions.includes("share"),
      },
      created_by: userData?.id || null,
    };


    const encodedPayload = encodeData(payload);

    const formData = new FormData();
    formData.append("payload", encodedPayload);

    if (selectedImage) {
      formData.append("file", {
        uri: selectedImage,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);
    }

    // 🔹 API URL
    const apiMethod = isEdit
      ? API_ROUTES.UPDATE_ANNOUNCEMENT
      : API_ROUTES.CREATE_ANNOUNCEMENT;

    const response = await apiClient.post(apiMethod, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });


    if (response?.success) {
      dispatch(
        fetchAnnouncements({
          postName: "all",
          searchParam: "",
        })
      );

      // reset state
      setSubject("");
      setDescription("");
      setPollOptions(["", ""]);
      setSelectedAudience({ departments: [], individuals: [] });
      setSelectedParent([]);
      setPraiseTo(null);
      setSelectAll(false);
      setSelectedImage(null);
      setPostModalVisible(false);
    } else {
      Alert.alert("Error", response?.message || "Failed to create announcement.");
    }
  } catch (err: any) {
    console.error(
      "Error creating announcement:",
      err.response?.data || err.message
    );
    Alert.alert("Error", "Something went wrong while creating the announcement.");
  }
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
            value={searchValue}
            onChangeText={text => {
              setSearchValue(text);
              handleSearch(text);
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Filter size={20} color="#fff" />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {(
              ['all', 'posts', 'praise', 'liked', 'repost', 'bookmark'] as PostFilter[]
            ).map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  currentPostList === option && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  handleFilterChange(option);
                  setDropdownVisible(false);
                }}
              >
                <Text
                  style={{
                    color: currentPostList === option ? '#0a66c2' : '#000',
                  }}
                >
                  {option === 'all'
                    ? 'All Posts'
                    : option === 'posts'
                    ? 'My Posts'
                    : option === 'praise'
                    ? 'Praise'
                    : option === 'liked'
                    ? 'Liked Posts'
                    :option === 'bookmark'
                    ? 'Bookmarked Posts'
                    : 'Reposted Posts'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={openPostCreationModal}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>

      </View>
        {/* --- Modal 1: Post Type --- */}
        <AppModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <View style={styles.iconGeneralCircle}>
            <Volume2 size="20" color="#0E79B6" />
          </View>
          <Text style={styles.modalTitle}>Post</Text>
          <Text style={styles.subtitle}>
            Choose the type of post you want to create.
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
                <View
                  style={[
                    styles.iconCircle,
                    selectedOption === option.id && styles.iconCircleSelected,
                  ]}
                >
                  <Text style={styles.iconText}>{option.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.optionTitle,
                    selectedOption === option.id && styles.optionTitleSelected,
                  ]}
                >
                  {option.title}
                </Text>
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

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmOption}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </AppModal>

        {/* --- Modal 2: Audience Selection --- */}
        <AppModal
          visible={audienceModalVisible}
          onClose={() => setAudienceModalVisible(false)}
        >
          <View style={styles.iconGeneralCircle}>
            <Volume2 size="20" color="#0E79B6" />
          </View>
          <Text style={styles.modalTitle}>{selectedOption}</Text>
          <Text style={styles.subtitle}>Select audience for this post.</Text>

          <AudienceDropdown
            selectAll={selectAll}
            sectionSelection={sectionSelection}
            handleSelectAllChange={handleSelectAllChange}
            setSectionSelection={setSectionSelection}
          />

          {!selectAll && sectionSelection === 'departments' && (
            <Dropdown
              style={styles.dropdownDept}
              data={departmentNames.map(d => ({
                label: d.label,
                value: String(d.id),
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Departments"
              value={selectedAudience.departments}
              onChange={item =>
                handleDepartmentsChange(
                  selectedAudience.departments.includes(item.value)
                    ? selectedAudience.departments.filter(v => v !== item.value)
                    : [...selectedAudience.departments, item.value],
                )
              }
              renderItem={item => (
                <Text style={{ padding: 8 }}>{item.label}</Text>
              )}
            />
          )}

          {!selectAll && sectionSelection === 'individuals' && (
            <Dropdown
              style={styles.dropdownDept}
              data={names.map(u => ({
                label: `${u.first_name} ${u.last_name}`,
                value: String(u.id),
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Users"
              value={selectedAudience.individuals}
              onChange={item =>
                handleIndividualsChange(
                  selectedAudience.individuals.includes(item.value)
                    ? selectedAudience.individuals.filter(v => v !== item.value)
                    : [...selectedAudience.individuals, item.value],
                )
              }
              renderItem={item => (
                <Text style={{ padding: 8 }}>{item.label}</Text>
              )}
            />
          )}

          {/* Chips */}
          <ScrollView
            style={{ maxHeight: 100 }}
            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
            nestedScrollEnabled
          >
            {selectedParent.map(value => {
              const user = names.find(u => String(u.id) === value);

              if (!user) {
                return null;
              }

              return (
                <View
                  key={value}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 6,
                    margin: 4,
                    backgroundColor: '#eee',
                    borderRadius: 16,
                  }}
                >
                  <Text style={{ marginRight: 6 }}>
                    {`${user.first_name} ${user.last_name}`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveSelectedParent(value)}
                  >
                    <Text style={{ color: 'red' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmAudience}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </AppModal>

        {/* --- Modal 3: Post Form --- */}
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
              <Text style={styles.subtitle}>Fill in the details below</Text>
            </View>
          </View>

          {selectedOption == 'Praise' ? (
            <View>
              <View style={{ marginVertical: 10 }}>
                <Text style={styles.subjectText}>Praise To</Text>
                <Dropdown
                  style={{
                    height: 50,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    borderColor: '#ccc',
                    marginBottom: 8,
                  }}
                  data={names.map(u => ({
                    label: `${u.first_name} ${u.last_name}`,
                    value: String(u.id),
                  }))}
                  labelField="label"
                  valueField="value"
                  placeholder="Select User"
                  value={praiseTo}
                  onChange={item => {
                    setPraiseTo(item.value);
                  }}
                  renderItem={item => (
                    <Text style={{ padding: 8 }}>{item.label}</Text>
                  )}
                />
              </View>
            </View>
          ) : (
            ''
          )}

          {selectedOption != 'Poll' ? (
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
            </View>
          ) : (
            ''
          )}

          {selectedOption === 'Poll' && (
            <View>
              <Text style={styles.quesLabel}>Question</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter"
                value={question}
                onChangeText={setQuestion}
              />

              <Text style={[styles.quesLabel]}>Options</Text>
              {pollOptions.map((opt, idx) => (
                <View key={idx} style={styles.optionRow}>
                  <Text style={styles.optionNumber}>
                    {String(idx + 1).padStart(2, '0')}
                  </Text>

                  <TextInput
                    style={[styles.optionsInput, { flex: 1, marginLeft: 8 }]}
                    placeholder="Enter"
                    value={opt}
                    onChangeText={text => handleOptionChange(text, idx)}
                  />

                  {pollOptions.length > 2 && (
                    <TouchableOpacity
                      style={{ marginLeft: 3 }}
                      onPress={() => removeOption(idx)}
                    >
                      <Trash size="16" color="red" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Add option */}
              <TouchableOpacity
                onPress={addNewOption}
                style={{ marginBottom: 15 }}
              >
                <Text style={styles.addOption}>+ Add new option</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.subjectText}>Permissions</Text>
          <Dropdown
            style={styles.dropdown}
            data={permissionOptions}
            labelField="label"
            valueField="value"
            placeholder="Select permissions"
            value={selectedPermissions}
            onChange={item =>
              setSelectedPermissions(prev =>
                prev.includes(item.value)
                  ? prev.filter(i => i !== item.value)
                  : [...prev, item.value],
              )
            }
            renderItem={item => {
              const isSelected = selectedPermissions.includes(item.value);
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

          <View style={styles.imgIconBlock}>
            {selectedOption != 'Poll' ? (
              <ImageIcon onPress={openImageEditor} size="20" color="gray" />
            ) : (
              ''
            )}
            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <Clock4 size={20} color="gray" />
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={changePostDate}
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              handleCreate();
            }}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </AppModal>

        {/* --- Modal 4: Upload Image --- */}
        <AppModal
          visible={imgModalVisible}
          onClose={() => setImgModalVisible(false)}
        >
          <View style={styles.iconGeneralCircle}>
            <ImageIcon size={24} color="#0E79B6" />
          </View>
          <Text style={styles.modalTitle}>Upload Image</Text>
          <Text style={styles.subtitle}>
            Upload a JPG, PNG, or GIF (max. 800×400px)
          </Text>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={handleImageUpload}
          >
            <Upload size={28} color="#888" />
            <Text style={styles.uploadText}>
              <Text style={styles.uploadLink}>Click to upload</Text> or drag and
              drop
            </Text>
            <Text style={styles.uploadHint}>SVG, PNG, JPG or GIF</Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: 120,
                height: 120,
                marginTop: 10,
                borderRadius: 8,
              }}
            />
          )}

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setImgModalVisible(false)}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </AppModal>

      {/* Loading + Error */}
      {isLoading && <ActivityIndicator size="large" color="#2196F3" />}
      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          {error}
        </Text>
      )}

      {/* Posts Feed */}
      <FlatList
        data={records}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <PostCard announcement={item} />}
      />
    </SafeAreaView>
  );
};
