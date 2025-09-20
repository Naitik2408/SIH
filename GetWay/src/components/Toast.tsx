import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');

interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'success',
    duration = 3000,
    onHide,
}) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Show toast
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Hide after duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    };

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                };
            case 'error':
                return {
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                };
            case 'info':
                return {
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                };
            default:
                return {
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'error':
                return 'close-circle';
            case 'info':
                return 'information-circle';
            default:
                return 'checkmark-circle';
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                },
                getToastStyle(),
            ]}
        >
            <Ionicons name={getIcon() as any} size={24} color={COLORS.white} />
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: SIZES.md,
        right: SIZES.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 9999,
    },
    message: {
        flex: 1,
        fontSize: SIZES.md,
        color: COLORS.white,
        fontWeight: '600',
        marginLeft: SIZES.sm,
    },
});

export default Toast;
