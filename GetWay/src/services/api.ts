import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV_CONFIG, { validateEnvConfig, logEnvConfig } from '../config/env';

// Initialize environment configuration
validateEnvConfig();
logEnvConfig();

// API Configuration from environment
export const API_CONFIG = {
    BASE_URL: ENV_CONFIG.getApiUrl(),
    TIMEOUT: ENV_CONFIG.API_TIMEOUT,
};

// Storage keys from environment
export const STORAGE_KEYS = ENV_CONFIG.STORAGE_KEYS;

// Common headers
const getHeaders = async (includeAuth = true) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (includeAuth) {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    return headers;
};

// API Response interface
export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message: string;
    data?: T;
    errors?: string[];
}

// Generic API request function
export const apiRequest = async <T = any>(
    endpoint: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        body?: any;
        includeAuth?: boolean;
        timeout?: number;
    } = {}
): Promise<ApiResponse<T>> => {
    const {
        method = 'GET',
        body,
        includeAuth = true,
        timeout = API_CONFIG.TIMEOUT,
    } = options;

    try {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        const config: RequestInit = {
            method,
        };

        // Handle headers and body based on content type
        if (body instanceof FormData) {
            // For FormData (file uploads), don't set Content-Type
            // Let the browser set it with the boundary
            const headers: Record<string, string> = {
                'Accept': 'application/json',
            };

            if (includeAuth) {
                const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }

            config.headers = headers;
            config.body = body;
        } else {
            // For JSON data
            const headers = await getHeaders(includeAuth);
            config.headers = headers;

            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.body = JSON.stringify(body);
            }
        }

        // Create timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        config.signal = controller.signal;

        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        const responseData = await response.json();

        if (!response.ok) {
            const error = {
                message: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
                status: response.status,
                errors: responseData.errors,
            };
            throw error;
        }

        return responseData;
    } catch (error: any) {
        console.error('API Request Error:', error);

        if (error.name === 'AbortError') {
            const timeoutError = {
                message: 'Request timeout. Please check your internet connection.',
                code: 'TIMEOUT_ERROR',
            };
            throw timeoutError;
        }

        // Handle network errors
        if (error.message === 'Network request failed' || error.code === 'NETWORK_ERROR') {
            const networkError = {
                message: 'No internet connection. Please check your network.',
                code: 'NETWORK_ERROR',
            };
            throw networkError;
        }

        // Re-throw API errors with status codes
        if (error.status) {
            throw error;
        }

        // Generic error
        throw {
            message: error.message || 'An unexpected error occurred',
            code: 'GENERIC_ERROR',
        };
    }
};

// Token management
export const TokenManager = {
    async setToken(token: string): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },

    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    async removeToken(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    },

    async setUser(user: any): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    async getUser(): Promise<any | null> {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    },

    async removeUser(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    },

    async clearAll(): Promise<void> {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.USER,
            STORAGE_KEYS.REFRESH_TOKEN,
        ]);
    },
};

// Posts API interface
export interface PostData {
    id: string;
    title: string;
    content: string;
    category: 'travel-tips' | 'route-updates' | 'community' | 'safety' | 'experiences';
    author: string;
    authorRole: string;
    keywords: string[];
    image?: string;
    likes: number;
    comments: number;
    views: number;
    isNew?: boolean;
    hasImage?: boolean;
    imageUrl?: string;
    date: string;
    createdAt: string;
    isPinned?: boolean;
    isLikedByUser?: boolean;
}

export interface CreatePostData {
    title: string;
    content: string;
    category: 'travel-tips' | 'route-updates' | 'community' | 'safety' | 'experiences';
    keywords?: string[];
    image?: any; // File object or FormData
}

export interface PostsResponse {
    posts: PostData[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Posts API functions
export const PostsAPI = {
    // Get all posts with optional filters
    async getPosts(params?: {
        page?: number;
        limit?: number;
        category?: string;
        keywords?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        author?: string;
    }): Promise<PostsResponse> {
        const queryParams = new URLSearchParams();
        
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.category) queryParams.append('category', params.category);
        if (params?.keywords && params.keywords.length > 0) {
            queryParams.append('keywords', params.keywords.join(','));
        }
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        if (params?.author) queryParams.append('author', params.author);

        const queryString = queryParams.toString();
        const endpoint = `/posts${queryString ? `?${queryString}` : ''}`;

        const response = await apiRequest<{ posts: PostData[]; pagination: any }>(endpoint, {
            method: 'GET',
            includeAuth: false // Posts can be viewed without authentication
        });

        return response.data!;
    },

    // Get a single post by ID
    async getPostById(id: string): Promise<PostData> {
        const response = await apiRequest<{ post: PostData }>(`/posts/${id}`, {
            method: 'GET',
            includeAuth: true // May need auth for like status
        });

        return response.data!.post;
    },

    // Create a new post
    async createPost(postData: CreatePostData, imageAsset?: any): Promise<PostData> {
        const formData = new FormData();
        
        formData.append('title', postData.title);
        formData.append('content', postData.content);
        formData.append('category', postData.category);
        
        if (postData.keywords && postData.keywords.length > 0) {
            postData.keywords.forEach(keyword => {
                formData.append('keywords[]', keyword);
            });
        }

        // Handle image upload from ImagePicker
        if (imageAsset && imageAsset.uri) {
            const imageFile = {
                uri: imageAsset.uri,
                type: imageAsset.type || 'image/jpeg',
                name: imageAsset.fileName || `image_${Date.now()}.jpg`,
            };
            
            // For React Native, append the file object directly
            formData.append('image', imageFile as any);
        }

        const response = await apiRequest<{ post: PostData }>('/posts', {
            method: 'POST',
            body: formData,
            includeAuth: true
        });

        return response.data!.post;
    },

    // Update a post
    async updatePost(id: string, updates: Partial<CreatePostData>): Promise<PostData> {
        const response = await apiRequest<{ post: PostData }>(`/posts/${id}`, {
            method: 'PUT',
            body: updates,
            includeAuth: true
        });

        return response.data!.post;
    },

    // Delete a post
    async deletePost(id: string): Promise<void> {
        await apiRequest(`/posts/${id}`, {
            method: 'DELETE',
            includeAuth: true
        });
    },

    // Toggle like on a post
    async toggleLike(id: string): Promise<{ isLiked: boolean; likeCount: number }> {
        const response = await apiRequest<{ isLiked: boolean; likeCount: number }>(`/posts/${id}/like`, {
            method: 'POST',
            includeAuth: true
        });

        return response.data!;
    },

    // Add comment to a post
    async addComment(id: string, content: string): Promise<{ commentCount: number }> {
        const response = await apiRequest<{ commentCount: number }>(`/posts/${id}/comment`, {
            method: 'POST',
            body: { content },
            includeAuth: true
        });

        return response.data!;
    },

    // Get trending posts
    async getTrendingPosts(limit?: number): Promise<PostData[]> {
        const queryParams = limit ? `?limit=${limit}` : '';
        const response = await apiRequest<{ posts: PostData[] }>(`/posts/trending${queryParams}`, {
            method: 'GET',
            includeAuth: false
        });

        return response.data!.posts;
    },

    // Get current user's posts
    async getMyPosts(params?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<PostsResponse> {
        const queryParams = new URLSearchParams();
        
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const queryString = queryParams.toString();
        const endpoint = `/posts/user/my-posts${queryString ? `?${queryString}` : ''}`;

        const response = await apiRequest<{ posts: PostData[]; pagination: any }>(endpoint, {
            method: 'GET',
            includeAuth: true
        });

        return response.data!;
    }
};

// Journey API functions
export interface JourneyData {
    _id: string;
    tripId: string;
    userId: string;
    status: 'in_progress' | 'completed';
    surveyData: {
        transportMode: string;
        journeyPurpose: string;
        routeSatisfaction: string;
        timeOfDay: string;
        travelCompanions: string;
    };
    tripDetails: {
        startTime: string;
        endTime?: string;
        actualDuration: number;
        actualDurationFormatted: string;
        startLocation?: {
            lat: number;
            lng: number;
            address: string;
            timestamp: string;
        };
        endLocation?: {
            lat: number;
            lng: number;
            address: string;
            timestamp: string;
        };
    };
    gpsTrackingData?: Array<{
        lat: number;
        lng: number;
        timestamp: string;
        speed: number;
        accuracy: number;
        heading?: number;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface JourneyResponse {
    journeys: JourneyData[];
    totalPages: number;
    currentPage: number;
    total: number;
}

export const journeyAPI = {
    // Get user's journey history
    async getUserJourneys(params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<JourneyResponse> {
        const queryParams = new URLSearchParams();
        
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const queryString = queryParams.toString();
        const endpoint = `/journeys/my-journeys${queryString ? `?${queryString}` : ''}`;

        // The apiRequest returns the raw JSON response from the server
        const response: any = await apiRequest(endpoint, {
            method: 'GET',
            includeAuth: true
        });

        console.log('🚗 Journey API Raw Response:', JSON.stringify(response, null, 2)); // Pretty debug log

        // Backend returns: { success: true, data: { journeys: [...], totalPages: 4, ... } }
        if (response && response.success && response.data) {
            console.log('🚗 Journey API Data:', response.data);
            console.log('🚗 Number of journeys found:', response.data.journeys?.length || 0);
            return response.data;
        } 
        
        // Fallback: if response has journeys directly
        else if (response && response.journeys) {
            console.log('🚗 Direct journeys response found:', response.journeys.length);
            return response;
        } 
        
        // Another fallback: if response.data has journeys directly
        else if (response && response.data && response.data.journeys) {
            console.log('🚗 Nested data.journeys found:', response.data.journeys.length);
            return response.data;
        }
        
        else {
            console.error('❌ Invalid response structure:', response);
            console.error('❌ Response keys:', response ? Object.keys(response) : 'No response');
            console.error('❌ Response type:', typeof response);
            throw new Error('Invalid response format from server');
        }
    },

    // Create a new journey
    async createJourney(journeyData: any): Promise<JourneyData> {
        const response = await apiRequest<JourneyData>(
            '/journeys',
            {
                method: 'POST',
                body: journeyData,
                includeAuth: true
            }
        );

        return response.data!;
    },

    // Delete a journey
    async deleteJourney(journeyId: string): Promise<{ message: string }> {
        const response = await apiRequest<{ message: string }>(
            `/journeys/${journeyId}`,
            {
                method: 'DELETE',
                includeAuth: true
            }
        );

        return response.data!;
    }
};
