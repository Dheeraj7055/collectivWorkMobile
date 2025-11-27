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
  TouchableWithoutFeedback,
  Pressable,
  StyleSheet,
} from 'react-native';
import { PostCard } from '@/components/PostCard';
import { styles } from '@/styles/postScreenStyles';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import {
  fetchAnnouncements,
  fetchBookmarks,
  fetchPinnedUsers,
} from '@/redux/slices/announcementSlice';
import AppModal from '@/common/AppModal';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
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
  Sparkles
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { fetchUserNamesList } from '@/redux/slices/userSlice';
import { fetchDepartmentNames } from '@/redux/slices/departmentSlice';
import AudienceDropdown from '@/components/AudienceDropdown';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { apiClient } from '@/services/api';
import { API_ROUTES } from '@/constants/apiRoutes';
import { encodeData } from '@/utils/cryptoHelpers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '@/navigation/AppNavigator';
import { RefreshableList } from '@/common/RefreshableList';
import { Announcement } from '@/types/announcement';
import Toast from 'react-native-toast-message';
import { Portal } from 'react-native-paper';
import YoutubePlayer from 'react-native-youtube-iframe';


// --- TYPES ---
interface AudienceSelection {
  departments: string[];
  individuals: string[];
}

interface AudienceData {
  departments: any[];
  individuals: any[];
}

type PostScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  'MainTabs'
>;

export const PostScreen = () => {
  const navigation = useNavigation<PostScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.profile);
  const postFilters: PostFilter[] = [
    'all',
    'posts',
    'praise',
    'liked',
    'repost',
    'bookmark',
    'pinned',
    'report',
  ];
  const { records, pinnedUsers, isLoading, error } = useSelector(
    (state: RootState) => state.announcements,
  );
  const { names } = useSelector((state: RootState) => state.user);
  const { departmentNames } = useSelector(
    (state: RootState) => state.department,
  );
  const [errors, setErrors] = React.useState<{
    subject?: string;
    description?: string;
    praiseTo?: string;
    question?: string;
    options?: Record<number, string | undefined>;
  }>({});

  // --- Modals ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('General');
  const [imgModalVisible, setImgModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [audienceModalVisible, setAudienceModalVisible] = useState(false);
  const dropdownRef = React.useRef<View>(null);
  const [descriptionLoader, setDescriptionLoader] = useState(false);
  const [excludesByDept, setExcludesByDept] = React.useState<
    Record<string, string[]>
  >({});

  // NEW: how each user got into the chip list (direct vs via which dept ids)
  const [parentSourceMap, setParentSourceMap] = React.useState<
    Record<string, { fromIndividuals: boolean; depts: string[] }>
  >({});

  const permissionOptions = [
    { label: 'Likes', value: 'likes' },
    { label: 'Comments', value: 'comments' },
    { label: 'Repost', value: 'repost' },
    { label: 'Share', value: 'share' },
  ];

  // --- Post state ---
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    permissionOptions.map(opt => opt.value),
  );
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
  const [question, setQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  type PostFilter =
    | 'all'
    | 'posts'
    | 'praise'
    | 'liked'
    | 'repost'
    | 'bookmark'
    | 'pinned'
    | 'report';

  const [currentPostList, setCurrentPostList] = useState<PostFilter>('all');
  const [audienceError, setAudienceError] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);

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
    setPollOptions([...pollOptions, '']);
    setErrors(prev => ({ ...prev, options: {} }));
  };

  // --- Constants ---
  const options = [
    {
      id: 'General',
      title: 'General',
      desc: 'Post for general updates.',
      icon: '📘',
    },
    {
      id: 'Praise',
      title: 'Praise',
      desc: 'Celebrate and appreciate peers.',
      icon: '👏',
    },
    {
      id: 'Poll',
      title: 'Poll',
      desc: 'Create a poll to gather opinions.',
      icon: '📊',
    },
  ];

  useEffect(() => {
    dispatch(fetchPinnedUsers());
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

      case 'report':
        dispatch(
          fetchAnnouncements({
            postName: 'report',
            searchParam: searchValue,
          }),
        );
        break;

      case 'bookmark':
        navigation.navigate('Bookmarks');
        break;

      case 'pinned':
        dispatch(fetchPinnedUsers());
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

  const extractYouTubeId = (text: string): string | null => {
    if (!text) return null;

    try {
      // find the first URL-looking token
      const urlMatch = text.match(/https?:\/\/[^\s]+/i);
      const urlStr = urlMatch?.[0];
      if (!urlStr) return null;

      const url = new URL(urlStr);

      // youtu.be/<id>
      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.split('/')[1];
        return id?.length === 11 ? id : null;
      }

      // youtube.com/watch?v=<id>
      if (url.hostname.includes('youtube.com')) {
        if (url.pathname === '/watch') {
          const v = url.searchParams.get('v');
          return v && v.length === 11 ? v : null;
        }
        // youtube.com/shorts/<id>
        if (url.pathname.startsWith('/shorts/')) {
          const id = url.pathname.split('/')[2] || url.pathname.split('/')[1];
          return id?.length === 11 ? id : null;
        }
        // youtube.com/embed/<id>
        if (url.pathname.startsWith('/embed/')) {
          const id = url.pathname.split('/')[2];
          return id?.length === 11 ? id : null;
        }
      }
    } catch {
      // ignore parse errors
    }

    // fallback regex (covers youtu.be & watch?v=)
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i;
    const m = text.match(regex);
    return m?.[1] || null;
  };

  // add a second, optional param
  const addAudience = (
    sel: AudienceSelection,
    overridesExcludes?: Record<string, string[]>,
  ) => {
    // use the override if provided, else fall back to state
    const excludes = overridesExcludes ?? excludesByDept;

    const { selectedParent, srcMap } = buildAudienceView(sel, excludes);
    setSelectedParent(selectedParent);
    setParentSourceMap(srcMap);

    const selectedAudienceData: AudienceData = {
      departments: departmentNames
        .filter(d => sel.departments.includes(String(d.id)))
        .map(d => ({ id: d.id, name: d.label, userList: d.userList || [] })),
      individuals: names
        .filter(u => sel.individuals.includes(String(u.id)))
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

  const buildAudienceView = (
    sel: AudienceSelection,
    excludes: Record<string, string[]>,
  ) => {
    const srcMap: Record<
      string,
      { fromIndividuals: boolean; depts: string[] }
    > = {};

    // Individuals (direct)
    sel.individuals.forEach(uid => {
      const id = String(uid);
      if (!srcMap[id]) srcMap[id] = { fromIndividuals: true, depts: [] };
      else srcMap[id].fromIndividuals = true;
    });

    // Dept users (respect excludes)
    const deptUsers = departmentNames.reduce<string[]>((acc, dept) => {
      const deptId = String(dept.id);
      if (sel.departments.includes(deptId)) {
        const excluded = new Set((excludes[deptId] || []).map(String));
        const users = (dept.userList || [])
          .map((u: any) => String(u.id))
          .filter(uid => !excluded.has(uid));

        users.forEach(uid => {
          if (!srcMap[uid])
            srcMap[uid] = { fromIndividuals: false, depts: [deptId] };
          else if (!srcMap[uid].depts.includes(deptId))
            srcMap[uid].depts.push(deptId);
        });

        acc.push(...users);
      }
      return acc;
    }, []);

    // Final unique user ids for chips
    const selectedParent = Array.from(
      new Set([...sel.individuals.map(String), ...deptUsers]),
    );

    return { selectedParent, srcMap };
  };

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);

    if (checked) {
      setExcludesByDept({}); // NEW: clear any previous per-dept exclusions

      const updatedAudience: AudienceSelection = {
        departments: departmentNames.map(d => String(d.id)),
        individuals: names.map(u => String(u.id)),
      };
      setSelectedAudience(updatedAudience);
      addAudience(updatedAudience);
      setSectionSelection('all');
    } else {
      const updatedAudience: AudienceSelection = {
        departments: [],
        individuals: [],
      };
      setExcludesByDept({}); // NEW: clear
      setSelectedAudience(updatedAudience);
      addAudience(updatedAudience);
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

  const handleRemoveSelectedParent = (userId: string) => {
    const src = parentSourceMap[userId] || {
      fromIndividuals: false,
      depts: [],
    };

    //remove from individuals if needed
    const updatedSel: AudienceSelection = {
      ...selectedAudience,
      individuals: src.fromIndividuals
        ? selectedAudience.individuals.filter(i => i !== userId)
        : selectedAudience.individuals,
    };

    // exclude from contributing depts (build the *new* map locally)
    let nextExcludes = excludesByDept;
    if (src.depts.length > 0) {
      nextExcludes = { ...excludesByDept };
      src.depts.forEach(deptId => {
        const set = new Set([...(nextExcludes[deptId] || [])].map(String));
        set.add(String(userId));
        nextExcludes[deptId] = Array.from(set);
      });
    }

    // update state…
    setExcludesByDept(nextExcludes);
    setSelectedAudience(updatedSel);

    // …and recompute immediately using the *new* excludes (prevents “second click”)
    addAudience(updatedSel, nextExcludes);
  };

  const validateAnnouncement = () => {
    const e: typeof errors = {};
    const trimmedSubject = (subject || '').trim();
    const trimmedDescription = (description || '').trim();
    const trimmedQuestion = (question || '').trim();

    // Normalize options: trim, drop empties, enforce min 2 and uniqueness
    const normOptions = (pollOptions || []).map(o => (o || '').trim());
    const nonEmptyOptions = normOptions.filter(o => o.length > 0);
    const uniqueOptions = Array.from(
      new Set(nonEmptyOptions.map(o => o.toLowerCase())),
    );

    // Base checks (audience etc.) could go here if needed

    if (selectedOption === 'Praise') {
      if (!praiseTo) e.praiseTo = 'Please select a user to praise.';
      if (!trimmedSubject) e.subject = 'Subject is required for Praise.';
      if (!trimmedDescription)
        e.description = 'Description is required for Praise.';
    } else if (selectedOption === 'Poll') {
      const trimmedQuestion = (question || '').trim();
      const trimmedOptions = (pollOptions || []).map(o => (o || '').trim());

      const optionErrors: Record<number, string> = {};

      // mark empty options individually
      trimmedOptions.forEach((opt, idx) => {
        if (!opt) optionErrors[idx] = 'Please fill this option.';
      });

      // check duplicates
      const lower = trimmedOptions.filter(Boolean).map(o => o.toLowerCase());
      const dupExists = new Set(lower).size !== lower.length;

      if (!trimmedQuestion || trimmedQuestion.length < 3) {
        e.question = 'Question is required (min 3 characters).';
      }

      if (trimmedOptions.filter(Boolean).length < 2) {
        e.options = { 0: 'Add at least two filled options.' };
      }

      if (dupExists) {
        Toast.show({
          type: 'error',
          text1: 'Duplicate options are not allowed',
          visibilityTime: 2500,
          position: 'top',
        });
      }

      if (Object.keys(optionErrors).length > 0) {
        e.options = optionErrors;
      }
    } else {
      // Regular Post / Announcement
      if (!trimmedSubject) e.subject = 'Subject is required.';
      if (!trimmedDescription) e.description = 'Description is required.';
    }

    // (Optional) length limits
    if (trimmedSubject && trimmedSubject.length > 120) {
      e.subject = 'Subject must be at most 120 characters.';
    }
    if (trimmedDescription && trimmedDescription.length > 5000) {
      e.description = 'Description is too long.';
    }
    if (trimmedQuestion && trimmedQuestion.length > 300) {
      e.question = 'Question must be at most 300 characters.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- Modal handlers ---
  const handleConfirmOption = () => {
    setModalVisible(false);
    setAudienceModalVisible(true);
  };

  const handleConfirmAudience = () => {
    // reset old error
    setAudienceError('');

    // Case 1: Send to everyone -> always allowed
    if (selectAll) {
      setAudienceModalVisible(false);
      setPostModalVisible(true);
      return;
    }

    // Case 2: Departments mode -> must pick at least one dept
    if (sectionSelection === 'departments') {
      if (
        !selectedAudience.departments ||
        selectedAudience.departments.length === 0
      ) {
        setAudienceError('Please select at least one department.');
        return;
      }
    }

    // Case 3: Individuals mode -> must pick at least one user
    if (sectionSelection === 'individuals') {
      if (
        !selectedAudience.individuals ||
        selectedAudience.individuals.length === 0
      ) {
        setAudienceError('Please select at least one user.');
        return;
      }
    }

    if (!sectionSelection) {
      setAudienceError('Please select an audience.');
      return;
    }

    // If we passed validation:
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
    if (errors.options?.[index]) {
      const newErrors = { ...errors.options };
      delete newErrors[index];
      setErrors(prev => ({ ...prev, options: newErrors }));
    }
  };

  const mergeMentionedUsers = () => {
    // merge individual IDs from state
    const updatedIndividualsIds = Array.from(
      new Set([...selectedAudience.individuals, ...selectedParent]),
    );

    // build departments object list (same as addAudience)
    const mergedDepartments = departmentNames
      .filter(d => selectedAudience.departments.includes(String(d.id)))
      .map(d => ({
        id: d.id,
        name: d.label,
        userList: d.userList || [],
      }));

    // build individuals object list
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

    // create array of { id, name } from mergedIndividuals
    const selectedUsers = mergedIndividuals.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`.trim(),
    }));

    // final object for API payload
    const updatedGeneralFormData = {
      departments: mergedDepartments,
      individuals: mergedIndividuals,
    };

    return { selectedUsers, updatedGeneralFormData };
  };

  const handleCreate = async () => {
    try {
      if (!validateAnnouncement()) return;

      const { selectedUsers, updatedGeneralFormData } = mergeMentionedUsers();

      // Build payload
      const payload = {
        announcement_id: null,
        select_audience: updatedGeneralFormData,
        selected_users: selectedUsers,
        notification_level: selectAll ? 'All' : 'selection',
        schedule_announcement: selectedDate.toISOString(),
        subject: selectedOption === 'Poll' ? null : subject,
        type: selectedOption.toLowerCase(),
        description: selectedOption === 'Poll' ? null : description,
        options: selectedOption === 'Poll' ? pollOptions : null,
        question: selectedOption === 'Poll' ? question : null,
        status: 'Active',
        praised_to: praiseTo || null,
        post_configuration: {
          likesEnabled: selectedPermissions.includes('likes'),
          commentsEnabled: selectedPermissions.includes('comments'),
          repostEnabled: selectedPermissions.includes('repost'),
          shareEnabled: selectedPermissions.includes('share'),
        },
        created_by: userData?.id || null,
      };

      const encodedPayload = encodeData(payload);

      const formData = new FormData();
      formData.append('payload', encodedPayload);

      if (selectedImage) {
        formData.append('file', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'upload.jpg',
        } as any);
      }

      // 🔹 API URL
      const apiMethod = isEdit
        ? API_ROUTES.UPDATE_ANNOUNCEMENT
        : API_ROUTES.CREATE_ANNOUNCEMENT;

      const response = await apiClient.post(apiMethod, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response?.success) {
        dispatch(
          fetchAnnouncements({
            postName: 'all',
            searchParam: '',
          }),
        );

        // reset state
        setSubject('');
        setDescription('');
        setPollOptions(['', '']);
        setSelectedAudience({ departments: [], individuals: [] });
        setSelectedParent([]);
        setPraiseTo(null);
        setSelectAll(false);
        setSelectedImage(null);
        setPostModalVisible(false);
      } else {
        Alert.alert(
          'Error',
          response?.message || 'Failed to create announcement.',
        );
      }
    } catch (err: any) {
      console.error(
        'Error creating announcement:',
        err.response?.data || err.message,
      );
      Alert.alert(
        'Error',
        'Something went wrong while creating the announcement.',
      );
    }
  };

  const reloadPosts = async () => {
    await dispatch(fetchAnnouncements({ postName: 'all', searchParam: '' }));
  };

  const handleAiRewrite = async () => {
    if (!description.trim() || descriptionLoader) return;
    try {
      setDescriptionLoader(true);
      const payload = encodeData({ content: description.trim() });

      const res = await apiClient.post(API_ROUTES.AI_CONTENT_GENERATOR, {
        payload,
      });
      console.log('res', res)

     
      if (res?.data && (res.success)) {
        const newText =
          res?.data ?? res?.data ?? '';
        if (!newText) {
          Toast.show({ type: 'error', text1: 'No content.' });
        } else {
          setDescription(newText);
          Toast.show({ type: 'success', text1: 'Rewritten with AI' });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: res?.message || res?.data?.message || 'No content.',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || 'No content.',
      });
    } finally {
      setDescriptionLoader(false);
    }
  };


  const closePostModal = () => {
    setModalVisible(false);
    setSubject('');
    setDescription('');
    setPollOptions(['', '']);
    setSelectedAudience({ departments: [], individuals: [] });
    setSelectedParent([]);
    setPraiseTo(null);
    setSelectAll(false);
    setSelectedImage(null);
    setSectionSelection(null);
  };

  const closeAudienceModal = () => {
    setAudienceModalVisible(false);
    setModalVisible(true);
  };

  const closePostModalVisible = () => {
    setPostModalVisible(false);
    setSubject('');
    setDescription('');
    setPollOptions(['', '']);
    setSelectedAudience({ departments: [], individuals: [] });
    setSelectedParent([]);
    setPraiseTo(null);
    setSelectAll(false);
    setSelectedImage(null);
    setSectionSelection(null);
    setErrors({});
  };

  const onChangeDescription = (t: string) => {
    setDescription(t);
    const id = extractYouTubeId(t);
    setVideoId(id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
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
          <Portal>
            {/* Fullscreen layer above everything */}
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              {/* 1) Transparent overlay to catch outside taps */}
              <Pressable
                onPress={() => setDropdownVisible(false)}
                style={[StyleSheet.absoluteFill, { zIndex: 1, elevation: 1 }]}
              />

              {/* 2) Dropdown (rendered after overlay so it's on top and stays clickable) */}
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    position: 'absolute',
                    top: 150,
                    right: 10,
                    zIndex: 2,
                    elevation: 2,
                  },
                ]}
              >
                {postFilters.map((option: PostFilter) => (
                  <Pressable
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
                        : option === 'bookmark'
                        ? 'Bookmarked Posts'
                        : option === 'pinned'
                        ? 'Pinned Posts'
                        : option === 'report'
                        ? 'Reported Posts'
                        : 'Reposted Posts'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Portal>
        )}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={openPostCreationModal}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* --- Modal 1: Post Type --- */}
      <AppModal visible={modalVisible} onClose={() => closePostModal()}>
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
        onClose={() => closeAudienceModal()}
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
        {audienceError ? (
          <Text style={{ color: 'red', marginTop: 8 }}>{audienceError}</Text>
        ) : null}

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
        onClose={() => closePostModalVisible()}
      >
        <ScrollView style={{ maxHeight: 600 }} showsVerticalScrollIndicator>
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
              <View>
                <Text style={styles.subjectText}>Praise To</Text>
                <Dropdown
                  style={{
                    height: 50,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    borderColor: '#ccc',
                    // marginBottom: 8,
                    marginTop: 3,
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
                    if (errors.praiseTo)
                      setErrors(prev => ({ ...prev, praiseTo: undefined }));
                  }}
                  renderItem={item => (
                    <Text style={{ padding: 8 }}>{item.label}</Text>
                  )}
                />
                {!!errors.praiseTo && (
                  <Text style={{ color: 'red' }}>{errors.praiseTo}</Text>
                )}
              </View>
            </View>
          ) : (
            ''
          )}

          {selectedOption != 'Poll' ? (
            <View>
              <Text style={styles.titleText}>Subject</Text>
              <TextInput
                value={subject}
                // onChangeText={setSubject}
                onChangeText={t => {
                  setSubject(t);
                  if (errors.subject)
                    setErrors(prev => ({ ...prev, subject: undefined }));
                }}
                placeholder="Enter subject"
                style={styles.input}
              />
              {!!errors.subject && (
                <Text style={{ color: 'red' }}>{errors.subject}</Text>
              )}

              <Text style={styles.subjectText}>Description</Text>
              <TextInput
                value={description}
                // onChangeText={setDescription}
                // onChangeText={t => {
                //   setDescription(t);
                //   if (errors.description)
                //     setErrors(prev => ({ ...prev, description: undefined }));
                // }}
                onChangeText={onChangeDescription}
                placeholder="Enter description"
                multiline
                style={[styles.input, styles.textarea]}
              />
              {!!errors.description && (
                <Text style={{ color: 'red' }}>{errors.description}</Text>
              )}
            </View>
          ) : (
            ''
          )}

          {videoId && (
            <View style={{ marginTop: 12, width: '100%', aspectRatio: 16 / 9 }}>
              <YoutubePlayer
                height={230}
                play={false}
                videoId={videoId}
                webViewProps={{
                  allowsFullscreenVideo: true,
                }}
              />
            </View>
          )}

          {selectedOption === 'Poll' && (
            <View>
              <Text style={styles.quesLabel}>Question</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter"
                value={question}
                // onChangeText={setQuestion}
                onChangeText={t => {
                  setQuestion(t);
                  if (errors.question)
                    setErrors(prev => ({ ...prev, question: undefined }));
                }}
              />
              {!!errors.question && (
                <Text style={{ color: 'red' }}>{errors.question}</Text>
              )}

              <Text style={[styles.quesLabel]}>Options</Text>
              {pollOptions.map((opt, idx) => (
                <View key={idx}>
                  <View style={styles.optionRow}>
                    <Text style={styles.optionNumber}>
                      {String(idx + 1).padStart(2, '0')}
                    </Text>

                    <TextInput
                      style={[styles.optionsInput, { flex: 1, marginLeft: 8 }]}
                      placeholder="Enter"
                      value={opt}
                      onChangeText={text => {
                        handleOptionChange(text, idx);
                        if (errors.options?.[idx])
                          setErrors(prev => ({
                            ...prev,
                            options: { ...prev.options, [idx]: undefined },
                          }));
                      }}
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

                  {/* individual option error */}
                  {!!errors.options?.[idx] && (
                    <Text style={{ color: 'red', marginLeft: 35 }}>
                      {errors.options[idx]}
                    </Text>
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
          <MultiSelect
            style={styles.dropdown}
            data={permissionOptions}
            labelField="label"
            valueField="value"
            placeholder="Select permissions"
            value={selectedPermissions} // <-- this must be an array
            onChange={newSelectedArray => {
              // newSelectedArray will be array of values
              setSelectedPermissions(newSelectedArray);
            }}
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
            renderSelectedItem={(selectedItem, unSelect) => {
              // optional: how chips/badges are shown under the input
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    margin: 4,
                    borderRadius: 6,
                    backgroundColor: '#E8F4FF',
                  }}
                >
                  <Text style={{ marginRight: 6 }}>{selectedItem.label}</Text>
                  <TouchableWithoutFeedback
                    onPress={() => unSelect && unSelect(selectedItem)}
                  >
                    <Text style={{ fontSize: 12, color: '#999' }}>✕</Text>
                  </TouchableWithoutFeedback>
                </View>
              );
            }}
            search
            searchPlaceholder="Search permissions"
            inputSearchStyle={styles.searchInput}
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

            {(selectedOption === 'Praise' || selectedOption === 'General') && (
              <View
                style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}
              >
                <TouchableOpacity
                  onPress={handleAiRewrite}
                  disabled={!description.trim() || descriptionLoader}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      backgroundColor: '#F7F4EE',
                      opacity:
                        !description.trim() || descriptionLoader ? 0.6 : 1,
                    },
                  ]}
                >
                  {descriptionLoader ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Sparkles color="#c37d16" size={18} />
                  )}
                  <Text
                    style={[
                      { fontSize: 13, color: '#7a5a1a' },
                    ]}
                  >
                    Rewrite with AI
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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
        </ScrollView>
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

        <TouchableOpacity style={styles.uploadBox} onPress={handleImageUpload}>
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
      {/* <FlatList
        data={records}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <PostCard announcement={item} />}
      /> */}
      <RefreshableList
        data={
          currentPostList === 'pinned'
            ? records.filter(a => {
                const pinnedIds = pinnedUsers.map(u => Number(u.pin_user_id));

                const createdById = a?.createdByUser?.id
                  ? Number(a.createdByUser.id)
                  : undefined;
                const repostedById = a?.reposted_by
                  ? Number(a.reposted_by)
                  : undefined;

                return (
                  (createdById !== undefined &&
                    pinnedIds.includes(createdById)) ||
                  (repostedById !== undefined &&
                    pinnedIds.includes(repostedById))
                );
              })
            : currentPostList === 'repost'
            ? records?.filter(list => list?.reposted_by === userData?.id)
            : records
        }
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <PostCard announcement={item} />}
        onRefreshData={reloadPosts}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              {currentPostList === 'pinned'
                ? 'No posts from pinned users'
                : 'No posts available'}
            </Text>
          ) : null
        }
      />
    </View>
  );
};
