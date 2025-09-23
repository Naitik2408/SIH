import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, FONTS } from '../../../../constants';
import { PostsAPI, CreatePostData } from '../../../../services/api';

interface CreatePostProps {
    onBack: () => void;
    onPostCreated?: () => void;
}

type PostCategory = 'travel-tips' | 'route-updates' | 'community' | 'safety' | 'experiences';

interface CategoryOption {
    id: PostCategory;
    label: string;
    icon: string;
    color: string;
    description: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ onBack, onPostCreated }) => {
    const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(null);
    const [heading, setHeading] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories: CategoryOption[] = [
        {
            id: 'travel-tips',
            label: 'Travel Tips',
            icon: 'bulb-outline',
            color: '#3b82f6',
            description: 'Share helpful travel advice and shortcuts'
        },
        {
            id: 'route-updates',
            label: 'Route Updates',
            icon: 'notifications-outline',
            color: '#f59e0b',
            description: 'Alert others about delays, closures, or changes'
        },
        {
            id: 'community',
            label: 'Community',
            icon: 'people-outline',
            color: '#10b981',
            description: 'General discussions and community topics'
        },
        {
            id: 'safety',
            label: 'Safety',
            icon: 'shield-outline',
            color: '#ef4444',
            description: 'Safety alerts and security information'
        },
        {
            id: 'experiences',
            label: 'Experiences',
            icon: 'heart-outline',
            color: '#8b5cf6',
            description: 'Share your travel stories and experiences'
        }
    ];

    // Popular keywords for posts
    const availableKeywords = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
        'Metro', 'Bus', 'Train', 'Auto', 'Taxi', 'Bike',
        'Rush Hour', 'Peak Time', 'Off Peak', 'Weekend',
        'Delay', 'Traffic', 'Fast Route', 'Shortcut', 'Alternative',
        'Safety', 'Security', 'Crowded', 'Comfortable', 'Clean',
        'Tips', 'Hack', 'Save Money', 'Save Time', 'Budget',
        'Students', 'Office', 'Airport', 'Station', 'Mall'
    ];

    const toggleKeyword = (keyword: string) => {
        setSelectedKeywords(prev => 
            prev.includes(keyword) 
                ? prev.filter(k => k !== keyword)
                : prev.length < 5 ? [...prev, keyword] : prev
        );
    };

    const pickImage = async () => {
        try {
            // Request permission to access media library
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert(
                    'Permission Required',
                    'Permission to access gallery is required to add images to your posts.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Show action sheet to choose between camera and gallery
            Alert.alert(
                'Select Image',
                'Choose how you want to add an image',
                [
                    {
                        text: 'Camera',
                        onPress: () => openCamera(),
                    },
                    {
                        text: 'Gallery',
                        onPress: () => openImageLibrary(),
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                ],
                { cancelable: true }
            );
        } catch (error) {
            console.error('Error requesting permissions:', error);
            Alert.alert('Error', 'Failed to access image picker. Please try again.');
        }
    };

    const openCamera = async () => {
        try {
            // Request camera permission
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            
            if (cameraPermission.granted === false) {
                Alert.alert(
                    'Camera Permission Required',
                    'Permission to access camera is required to take photos.',
                    [{ text: 'OK' }]
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Error opening camera:', error);
            Alert.alert('Error', 'Failed to open camera. Please try again.');
        }
    };

    const openImageLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Error opening image library:', error);
            Alert.alert('Error', 'Failed to open gallery. Please try again.');
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
    };

    const validateForm = () => {
        if (!selectedCategory) {
            Alert.alert('Category Required', 'Please select a category for your post.');
            return false;
        }
        if (!heading.trim()) {
            Alert.alert('Heading Required', 'Please enter a heading for your post.');
            return false;
        }
        if (!description.trim()) {
            Alert.alert('Description Required', 'Please enter a description for your post.');
            return false;
        }
        if (heading.length > 100) {
            Alert.alert('Heading Too Long', 'Heading must be 100 characters or less.');
            return false;
        }
        if (description.length > 500) {
            Alert.alert('Description Too Long', 'Description must be 500 characters or less.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        
        try {
            // Prepare post data
            const postData: CreatePostData = {
                title: heading.trim(),
                content: description.trim(),
                category: selectedCategory!,
                keywords: selectedKeywords
            };

            console.log('Creating post:', postData);

            // Create the post using API with image if selected
            const createdPost = await PostsAPI.createPost(postData, selectedImage);
            
            Alert.alert(
                'Post Created!',
                `Your post "${createdPost.title}" has been successfully created and will be visible to the community.${selectedKeywords.length > 0 ? `\n\nKeywords: ${selectedKeywords.join(', ')}` : ''}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            onPostCreated?.();
                            onBack();
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error('Create post error:', error);
            
            let errorMessage = 'Failed to create post. Please try again.';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'No internet connection. Please check your network and try again.';
            } else if (error.status === 401) {
                errorMessage = 'Please login again to create a post.';
            } else if (error.status === 400) {
                errorMessage = 'Please check your post details and try again.';
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        Alert.alert(
            'Discard Changes?',
            'Are you sure you want to discard your changes?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => {
                        setSelectedCategory(null);
                        setHeading('');
                        setDescription('');
                        setSelectedImage(null);
                        setSelectedKeywords([]);
                        onBack();
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={resetForm} style={styles.backButton}>
                    <Ionicons 
                        name="close" 
                        size={SIZES.heading} 
                        color={COLORS.textPrimary} 
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Post</Text>
                <TouchableOpacity 
                    onPress={handleSubmit} 
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    disabled={isSubmitting}
                >
                    <Text style={[styles.submitButtonText, isSubmitting && styles.submitButtonTextDisabled]}>
                        {isSubmitting ? 'Publishing...' : 'Publish'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Category Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Category</Text>
                    <Text style={styles.sectionSubtitle}>Choose the category that best fits your post</Text>
                    
                    <View style={styles.categoriesContainer}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryCard,
                                    selectedCategory === category.id && styles.categoryCardSelected
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}15` }]}>
                                    <Ionicons
                                        name={category.icon as any}
                                        size={20}
                                        color={category.color}
                                    />
                                </View>
                                <View style={styles.categoryInfo}>
                                    <Text style={[
                                        styles.categoryLabel,
                                        selectedCategory === category.id && styles.categoryLabelSelected
                                    ]}>
                                        {category.label}
                                    </Text>
                                    <Text style={styles.categoryDescription}>
                                        {category.description}
                                    </Text>
                                </View>
                                {selectedCategory === category.id && (
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color={category.color}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Heading Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Heading</Text>
                    <Text style={styles.sectionSubtitle}>Write a clear and engaging title</Text>
                    
                    <TextInput
                        style={styles.headingInput}
                        value={heading}
                        onChangeText={setHeading}
                        placeholder="Enter your post heading..."
                        placeholderTextColor={COLORS.textQuaternary}
                        maxLength={100}
                        multiline={false}
                    />
                    <Text style={styles.characterCount}>{heading.length}/100</Text>
                </View>

                {/* Description Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.sectionSubtitle}>Share the details of your post</Text>
                    
                    <TextInput
                        style={styles.descriptionInput}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Write your post content here..."
                        placeholderTextColor={COLORS.textQuaternary}
                        maxLength={500}
                        multiline={true}
                        textAlignVertical="top"
                    />
                    <Text style={styles.characterCount}>{description.length}/500</Text>
                </View>

                {/* Image Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Add Image (Optional)</Text>
                    <Text style={styles.sectionSubtitle}>Images help make your post more engaging</Text>
                    
                    {selectedImage ? (
                        <View style={styles.selectedImageContainer}>
                            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                                <Ionicons name="close" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                                <Text style={styles.changeImageText}>Change Image</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={32} color={COLORS.textQuaternary} />
                            <Text style={styles.imagePickerText}>Tap to add an image</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Keywords Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Add Keywords (Optional)</Text>
                    <Text style={styles.sectionSubtitle}>
                        Select up to 5 keywords to help others find your post
                    </Text>
                    
                    <View style={styles.keywordsContainer}>
                        {availableKeywords.map((keyword) => {
                            const isSelected = selectedKeywords.includes(keyword);
                            return (
                                <TouchableOpacity
                                    key={keyword}
                                    style={[
                                        styles.keywordButton,
                                        isSelected && styles.selectedKeywordButton
                                    ]}
                                    onPress={() => toggleKeyword(keyword)}
                                    disabled={!isSelected && selectedKeywords.length >= 5}
                                >
                                    <Text style={[
                                        styles.keywordText,
                                        isSelected && styles.selectedKeywordText
                                    ]}>
                                        {keyword}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    
                    {selectedKeywords.length > 0 && (
                        <View style={styles.selectedKeywordsInfo}>
                            <Text style={styles.selectedKeywordsText}>
                                Selected: {selectedKeywords.length}/5 keywords
                            </Text>
                        </View>
                    )}
                </View>

                {/* Preview Section */}
                {(selectedCategory || heading || description || selectedImage || selectedKeywords.length > 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preview</Text>
                        <View style={styles.previewCard}>
                            {selectedCategory && (
                                <View style={styles.previewCategory}>
                                    <View style={[
                                        styles.previewCategoryIcon,
                                        { backgroundColor: `${categories.find(c => c.id === selectedCategory)?.color}15` }
                                    ]}>
                                        <Ionicons
                                            name={categories.find(c => c.id === selectedCategory)?.icon as any}
                                            size={16}
                                            color={categories.find(c => c.id === selectedCategory)?.color}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.previewCategoryText,
                                        { color: categories.find(c => c.id === selectedCategory)?.color }
                                    ]}>
                                        {categories.find(c => c.id === selectedCategory)?.label}
                                    </Text>
                                </View>
                            )}
                            {heading && <Text style={styles.previewHeading}>{heading}</Text>}
                            {description && <Text style={styles.previewDescription}>{description}</Text>}
                            {selectedImage && (
                                <View style={styles.previewImageContainer}>
                                    <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                                </View>
                            )}
                            {selectedKeywords.length > 0 && (
                                <View style={styles.previewKeywords}>
                                    {selectedKeywords.map((keyword) => (
                                        <View key={keyword} style={styles.previewKeywordTag}>
                                            <Text style={styles.previewKeywordText}>#{keyword}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    submitButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.textQuaternary,
    },
    submitButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
    },
    submitButtonTextDisabled: {
        color: COLORS.textDisabled,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary,
        marginBottom: 16,
    },
    categoriesContainer: {
        gap: 12,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}05`,
    },
    categoryIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryLabel: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    categoryLabelSelected: {
        color: COLORS.textPrimary,
    },
    categoryDescription: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary,
    },
    headingInput: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        minHeight: 50,
    },
    descriptionInput: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        minHeight: 120,
    },
    characterCount: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary,
        textAlign: 'right',
        marginTop: 4,
    },
    imagePickerButton: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.lightGray,
        borderStyle: 'dashed',
    },
    imagePickerText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary,
        marginTop: 8,
    },
    selectedImageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    selectedImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    changeImageText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
    },
    keywordsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 10,
    },
    keywordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.textDisabled,
    },
    selectedKeywordButton: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    keywordText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
    },
    selectedKeywordText: {
        color: COLORS.white,
        fontFamily: FONTS.semiBold,
    },
    selectedKeywordsInfo: {
        marginTop: 12,
        paddingHorizontal: 4,
    },
    selectedKeywordsText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary,
    },
    previewCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    previewCategory: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    previewCategoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    previewCategoryText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.semiBold,
    },
    previewHeading: {
        fontSize: SIZES.body,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    previewDescription: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        lineHeight: 20,
        marginBottom: 12,
    },
    previewImageContainer: {
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#f3f4f6',
    },
    previewKeywords: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    previewKeywordTag: {
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    previewKeywordText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
    },
});

export default CreatePost;
