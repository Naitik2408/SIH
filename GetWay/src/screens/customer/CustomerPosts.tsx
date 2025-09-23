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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants';
import { PostsAPI, PostData } from '../../services/api';

interface CustomerPostsProps {
    onNavigateToCreatePost?: () => void;
    onPostCreated?: () => void;
}

const CustomerPosts: React.FC<CustomerPostsProps> = ({ onNavigateToCreatePost }) => {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load posts on component mount
    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async (isRefresh = false) => {
        try {
            if (!isRefresh) {
                setLoading(true);
            }
            setError(null);

            const response = await PostsAPI.getPosts({
                page: 1,
                limit: 20,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            setPosts(response.posts);
        } catch (error: any) {
            console.error('Error loading posts:', error);
            
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
            const result = await PostsAPI.toggleLike(postId);
            
            // Update the local state
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post.id === postId 
                        ? { 
                            ...post, 
                            likes: result.likeCount,
                            isLikedByUser: result.isLiked 
                          }
                        : post
                )
            );
        } catch (error: any) {
            console.error('Error liking post:', error);
            Alert.alert('Error', 'Failed to like post. Please try again.');
        }
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
                    </View>

                    <View style={styles.engagementContainer}>
                        <TouchableOpacity 
                            style={styles.engagementButton}
                            onPress={() => handleLikePost(item.id)}
                        >
                            <Ionicons 
                                name={item.isLikedByUser ? "heart" : "heart-outline"} 
                                size={16} 
                                color={item.isLikedByUser ? "#ef4444" : COLORS.textQuaternary} 
                            />
                            <Text style={styles.engagementText}>{item.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.engagementButton}>
                            <Ionicons name="chatbubble-outline" size={16} color={COLORS.textQuaternary} />
                            <Text style={styles.engagementText}>{item.comments}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.engagementButton}>
                            <Ionicons name="arrow-redo-outline" size={16} color={COLORS.textQuaternary} />
                        </TouchableOpacity>
                        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
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
                        {posts.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textQuaternary} />
                                <Text style={styles.emptyStateTitle}>No posts yet</Text>
                                <Text style={styles.emptyStateSubtitle}>
                                    Be the first to share your travel experience!
                                </Text>
                                <TouchableOpacity 
                                    style={styles.createPostButton} 
                                    onPress={onNavigateToCreatePost}
                                >
                                    <Text style={styles.createPostButtonText}>Create Post</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            posts.map(renderPostItem)
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
        paddingTop: 16,
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
    engagementContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    engagementButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    engagementText: {
        fontSize: SIZES.caption, // 12 - Supporting engagement numbers
        fontFamily: FONTS.medium,
        color: COLORS.textQuaternary, // Supporting information - less important
    },
    dateText: {
        fontSize: SIZES.caption, // 12 - Supporting timestamps
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary, // Supporting information - less important
        marginLeft: 'auto', // Push to the right
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
