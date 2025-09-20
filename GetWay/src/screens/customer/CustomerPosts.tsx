import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants';

interface Post {
    id: string;
    title: string;
    content: string;
    author: string;
    date: string;
    likes: number;
    comments: number;
    category: 'travel-tips' | 'route-updates' | 'community' | 'safety' | 'experiences';
    isNew?: boolean;
    hasImage?: boolean;
    imageUrl?: string;
}

const mockPosts: Post[] = [
    {
        id: '1',
        title: 'Best Metro Routes During Rush Hour',
        content: 'Just discovered this amazing route from Andheri to BKC that saves 15 minutes during peak hours! Take the Western Line to Bandra, then switch to the new connector.',
        author: 'Priya Sharma',
        date: '2025-09-18',
        likes: 24,
        comments: 8,
        category: 'travel-tips',
        isNew: true,
        hasImage: true,
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80'
    },
    {
        id: '2',
        title: 'Metro Line 4 Delays Today',
        content: 'Heads up everyone! Metro Line 4 is experiencing 10-15 minute delays due to technical issues. Plan accordingly for your evening commute.',
        author: 'Mumbai Metro Updates',
        date: '2025-09-18',
        likes: 45,
        comments: 12,
        category: 'route-updates'
    },
    {
        id: '3',
        title: 'Found a Lost Wallet at Churchgate',
        content: 'Found a brown leather wallet near platform 3 at Churchgate station. Has some ID cards. If it\'s yours, please DM me with details!',
        author: 'Rajesh Kumar',
        date: '2025-09-17',
        likes: 18,
        comments: 6,
        category: 'community',
        hasImage: true,
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
        id: '4',
        title: 'Safety Tips for Late Night Travel',
        content: 'Traveling late? Here are some safety tips: Stay in well-lit areas, inform someone about your route, keep emergency contacts handy, and trust your instincts.',
        author: 'SafeCommute Team',
        date: '2025-09-16',
        likes: 67,
        comments: 23,
        category: 'safety',
        hasImage: true,
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
        id: '5',
        title: 'My Daily Commute Transformation',
        content: 'Switched from driving to public transport 3 months ago. Not only am I saving ₹5000/month, but also contributing to a cleaner environment. Highly recommend!',
        author: 'Sneha Patel',
        date: '2025-09-15',
        likes: 92,
        comments: 31,
        category: 'experiences',
        hasImage: true,
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80'
    },
];

interface CustomerPostsProps {
    onNavigateToCreatePost?: () => void;
}

const CustomerPosts: React.FC<CustomerPostsProps> = ({ onNavigateToCreatePost }) => {

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

    const renderPostItem = (item: Post) => {
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
                        <TouchableOpacity style={styles.engagementButton}>
                            <Ionicons name="heart-outline" size={16} color={COLORS.textQuaternary} />
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

            {/* Posts List */}
            <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.postsList}>
                    {mockPosts.map(renderPostItem)}
                </View>
            </ScrollView>
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
});

export default CustomerPosts;
