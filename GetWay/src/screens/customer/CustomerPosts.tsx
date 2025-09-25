import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants';
import { PostsAPI, PostData } from '../../services/api';

interface CustomerPostsProps {
    onNavigateToCreatePost?: () => void;
    onPostCreated?: () => void;
    currentUser?: { id: string; name: string; email: string }; // Add current user prop
}

const CustomerPosts: React.FC<CustomerPostsProps> = ({ 
    onNavigateToCreatePost, 
    currentUser 
}) => {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'my'>('all'); // Add filter state
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [deletedPosts, setDeletedPosts] = useState<Set<string>>(new Set());

    // Load posts on component mount
    useEffect(() => {
        const initializeData = async () => {
            const [loadedLikedPosts, loadedDeletedPosts] = await Promise.all([
                loadLikedPosts(),
                loadDeletedPosts()
            ]);
            setLikedPosts(loadedLikedPosts);
            setDeletedPosts(loadedDeletedPosts);
            await loadPosts();
        };

        initializeData();
    }, []);    // Load liked posts from AsyncStorage
    const loadLikedPosts = async (): Promise<Set<string>> => {
        try {
            const likedPosts = await AsyncStorage.getItem('likedPosts');
            return likedPosts ? new Set(JSON.parse(likedPosts)) : new Set();
        } catch (error) {
            return new Set();
        }
    };

    // Save liked posts to AsyncStorage
    const saveLikedPosts = async (likedPosts: Set<string>): Promise<void> => {
        try {
            await AsyncStorage.setItem('likedPosts', JSON.stringify([...likedPosts]));
        } catch (error) {
            // Handle error silently
        }
    };

    // Load deleted posts from AsyncStorage
    const loadDeletedPosts = async (): Promise<Set<string>> => {
        try {
            const deletedPosts = await AsyncStorage.getItem('deletedPosts');
            return deletedPosts ? new Set(JSON.parse(deletedPosts)) : new Set();
        } catch (error) {
            return new Set();
        }
    };

    // Save deleted posts to AsyncStorage
    const saveDeletedPosts = async (deletedPosts: Set<string>): Promise<void> => {
        try {
            await AsyncStorage.setItem('deletedPosts', JSON.stringify([...deletedPosts]));
        } catch (error) {
            // Handle error silently
        }
    };

    const loadPosts = async (isRefresh = false) => {
        try {
            if (!isRefresh) {
                setLoading(true);
            }
            setError(null);

            // Load posts from API
            const response = await PostsAPI.getPosts({
                page: 1,
                limit: 50,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            // Load liked posts and deleted posts from local storage
            const [likedPostsSet, deletedPostsSet] = await Promise.all([
                loadLikedPosts(),
                loadDeletedPosts()
            ]);

            // Filter out deleted posts and update posts with local like state
            const postsWithLikeState = response.posts
                .filter(post => !deletedPostsSet.has(post.id))
                .map(post => ({
                    ...post,
                    isLikedByUser: likedPostsSet.has(post.id),
                    // If liked locally but not reflected in API response, increment likes
                    likes: likedPostsSet.has(post.id) && !post.isLikedByUser ? post.likes + 1 : post.likes
                }));

            setPosts(postsWithLikeState);
        } catch (error: any) {
            let errorMessage = 'Failed to load posts. Please try again.';
            if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'No internet connection. Please check your network.';
            }
            
            setError(errorMessage);
            
            // If this is initial load and there's an error, show the error
            if (!isRefresh) {
                Alert.alert('Error', errorMessage);
            }
        } finally {
            setLoading(false);
            if (isRefresh) {
                setRefreshing(false);
            }
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPosts(true);
    }, []);

    const handleLikePost = async (postId: string) => {
        try {
            // Load current liked posts
            const likedPosts = await loadLikedPosts();
            const isCurrentlyLiked = likedPosts.has(postId);

            // Optimistically update the UI first
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post.id === postId 
                        ? { 
                            ...post, 
                            likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
                            isLikedByUser: !isCurrentlyLiked 
                          }
                        : post
                )
            );

            // Update local storage
            if (isCurrentlyLiked) {
                likedPosts.delete(postId);
            } else {
                likedPosts.add(postId);
            }
            await saveLikedPosts(likedPosts);

            // Make API call (this may fail but local state is preserved)
            try {
                await PostsAPI.toggleLike(postId);
            } catch (apiError) {
                // API call failed, but local state is maintained
                // The like will be preserved locally
            }

        } catch (error: any) {
            // Revert optimistic update on error
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post.id === postId 
                        ? { 
                            ...post, 
                            likes: post.isLikedByUser ? post.likes + 1 : post.likes - 1,
                            isLikedByUser: !post.isLikedByUser 
                          }
                        : post
                )
            );
            Alert.alert('Error', 'Failed to like post. Please try again.');
        }
    };

    const handleDeletePost = async (postId: string) => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Remove post from local state immediately
                            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                            
                            // Track deleted post locally to prevent reappearing
                            const newDeletedPosts = new Set(deletedPosts);
                            newDeletedPosts.add(postId);
                            setDeletedPosts(newDeletedPosts);
                            await saveDeletedPosts(newDeletedPosts);
                            
                            // Make API call to delete from server
                            await PostsAPI.deletePost(postId);
                            
                            Alert.alert('Success', 'Post deleted successfully.');
                        } catch (error: any) {
                            // If API call fails, we still keep it deleted locally
                            // This prevents the post from reappearing
                            Alert.alert('Post Deleted', 'Post has been removed from your view.');
                        }
                    }
                }
            ]
        );
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'travel-tips': return 'bulb-outline';
            case 'route-updates': return 'notifications-outline';
            case 'community': return 'people-outline';
            case 'safety': return 'shield-outline';
            case 'experiences': return 'heart-outline';
            default: return 'chatbubble-outline';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'travel-tips': return '#3b82f6';
            case 'route-updates': return '#f59e0b';
            case 'community': return '#10b981';
            case 'safety': return '#ef4444';
            case 'experiences': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter posts based on current filter
    const getFilteredPosts = () => {
        if (filter === 'my' && currentUser) {
            return posts.filter(post => post.author === currentUser.name);
        }
        return posts;
    };

    const renderPostItem = (item: PostData) => {
        const categoryColor = getCategoryColor(item.category);
        const categoryIcon = getCategoryIcon(item.category);

        return (
            <TouchableOpacity key={item.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                    <View style={styles.categoryContainer}>
                        <View style={[styles.categoryIcon, { backgroundColor: `${categoryColor}15` }]}>
                            <Ionicons
                                name={categoryIcon as any}
                                size={18}
                                color={categoryColor}
                            />
                        </View>
                        <Text style={[styles.categoryText, { color: categoryColor }]}>
                            {item.category.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Text>
                    </View>
                    {item.isNew && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postContent}>{item.content}</Text>

                {/* Post Image */}
                {item.hasImage && item.imageUrl && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.postImage}
                            resizeMode="cover"
                        />
                    </View>
                )}

                <View style={styles.postFooter}>
                    <View style={styles.authorContainer}>
                        <View style={styles.authorAvatar}>
                            <Text style={styles.authorInitial}>
                                {item.author.charAt(0)}
                            </Text>
                        </View>
                        <Text style={styles.authorName}>{item.author}</Text>
                        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    </View>

                    <View style={styles.actionContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.likeButton,
                                item.isLikedByUser && styles.likeButtonActive
                            ]}
                            onPress={() => handleLikePost(item.id)}
                        >
                            <Ionicons 
                                name={item.isLikedByUser ? "heart" : "heart-outline"} 
                                size={20} 
                                color={item.isLikedByUser ? "#ef4444" : COLORS.textQuaternary} 
                            />
                            <Text style={[
                                styles.likeText,
                                item.isLikedByUser && styles.likeTextActive
                            ]}>
                                {item.likes}
                            </Text>
                        </TouchableOpacity>
                        
                        {/* Show delete button only for posts created by current user */}
                        {currentUser && item.author === currentUser.name && (
                            <TouchableOpacity 
                                style={styles.deleteButton}
                                onPress={() => handleDeletePost(item.id)}
                            >
                                <Ionicons 
                                    name="trash-outline" 
                                    size={18} 
                                    color="#ef4444" 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Community Posts</Text>
                    <Text style={styles.subtitle}>Share and discover travel experiences</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={onNavigateToCreatePost}
                >
                    <Ionicons
                        name="add"
                        size={SIZES.subheading + 2}
                        color={COLORS.white}
                    />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filter === 'all' && styles.filterTabActive
                    ]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[
                        styles.filterTabText,
                        filter === 'all' && styles.filterTabTextActive
                    ]}>
                        All Posts
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filter === 'my' && styles.filterTabActive
                    ]}
                    onPress={() => setFilter('my')}
                >
                    <Text style={[
                        styles.filterTabText,
                        filter === 'my' && styles.filterTabTextActive
                    ]}>
                        My Posts
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Loading State */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading posts...</Text>
                </View>
            )}

            {/* Error State */}
            {error && !loading && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={COLORS.textQuaternary} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadPosts()}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Posts List */}
            {!loading && !error && (
                <ScrollView
                    style={styles.contentContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    <View style={styles.postsList}>
                        {getFilteredPosts().length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textQuaternary} />
                                <Text style={styles.emptyStateTitle}>
                                    {filter === 'my' ? 'No posts yet' : 'No posts yet'}
                                </Text>
                                <Text style={styles.emptyStateSubtitle}>
                                    {filter === 'my' 
                                        ? 'You haven\'t created any posts yet. Share your travel experience!' 
                                        : 'Be the first to share your travel experience!'
                                    }
                                </Text>
                                <TouchableOpacity 
                                    style={styles.createPostButton} 
                                    onPress={onNavigateToCreatePost}
                                >
                                    <Text style={styles.createPostButtonText}>Create Post</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            getFilteredPosts().map(renderPostItem)
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Match CustomerTripLogs background
    },
    scrollContent: {
        paddingBottom: 120, // Extra padding to ensure content is above bottom navbar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTabActive: {
        backgroundColor: COLORS.primary,
    },
    filterTabText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
    },
    filterTabTextActive: {
        color: COLORS.white,
        fontFamily: FONTS.semiBold,
    },
    headerContent: {
        flex: 1,
        marginRight: 16,
    },
    addButton: {
        width: 35,
        height: 35,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 4,
    },
    title: {
        fontSize: SIZES.heading, // 20 - Match trip logs title size
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary, // Use hierarchy colors
        marginBottom: 4,
    },
    subtitle: {
        fontSize: SIZES.body, // 14 - Consistent with body text
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary, // Less prominent subtitle
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8, // Reduced since filter takes up space
    },
    postsList: {
        paddingBottom: 20,
    },
    postCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        // Match notification button shadow exactly
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    categoryText: {
        fontSize: SIZES.caption, // 12 - Supporting category labels
        fontFamily: FONTS.semiBold,
    },
    newBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    newBadgeText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    postTitle: {
        fontSize: SIZES.subheading, // 16 - Important post titles
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary, // Most important content
        marginBottom: 8,
        lineHeight: 22,
    },
    postContent: {
        fontSize: SIZES.body, // 14 - Body content
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary, // Regular content - medium importance
        lineHeight: 20,
        marginBottom: 12,
    },
    imageContainer: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    postImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f3f4f6', // Fallback color while loading
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    authorAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    authorInitial: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    authorName: {
        fontSize: SIZES.caption, // 12 - Supporting author info
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary, // Regular content - medium importance
        flex: 1,
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        minHeight: 40, // Ensure consistent height
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        minWidth: 60, // Ensure consistent width
        justifyContent: 'center',
    },
    likeButtonActive: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: '#ef4444',
    },
    likeText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textQuaternary,
    },
    likeTextActive: {
        color: '#ef4444',
        fontFamily: FONTS.semiBold,
    },
    deleteButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    debugText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
    },
    dateText: {
        fontSize: SIZES.caption, // 12 - Supporting timestamps
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary, // Supporting information - less important
        marginLeft: 8,
    },
    // Loading state styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        marginTop: 16,
    },
    // Error state styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
    },
    // Empty state styles
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    createPostButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createPostButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
    },
});

export default CustomerPosts;
