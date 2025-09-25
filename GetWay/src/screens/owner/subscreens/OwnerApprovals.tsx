import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../../constants';
import { ownerAPI } from '../../../services/api';

interface ScientistRequest {
    id: string;
    name: string;
    email: string;
    organizationId: string;
    department?: string;
    designation?: string;
    isApproved: boolean;
    isActive: boolean;
    createdAt: string;
}

const OwnerApprovals: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<ScientistRequest | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Dynamic state for API data
    const [scientists, setScientists] = useState<ScientistRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0
    });

  // Helper function to determine status from scientist data
  const getStatusFromScientist = (scientist: ScientistRequest): 'pending' | 'approved' => {
    console.log(`🔍 [STATUS CHECK] ${scientist.name || scientist.email}:`);
    console.log(`    isApproved: ${scientist.isApproved}`);
    
    if (scientist.isApproved) {
      console.log(`    Result: approved`);
      return 'approved';
    } else {
      console.log(`    Result: pending`);
      return 'pending';
    }
  };

    // Fetch scientists data from API
    const fetchScientists = async () => {
        try {
            console.log('🔍 [DEBUG] Fetching scientists data...');
            setLoading(true);
            
            const result = await ownerAPI.getAllScientists();
            
            // Debug logging
            console.log('✅ [DEBUG] API Response received:');
            console.log('📊 [DEBUG] Stats:', JSON.stringify(result.stats, null, 2));
            console.log('👥 [DEBUG] Scientists count:', result.scientists.length);
            console.log('📋 [DEBUG] Scientists data:');
            
            result.scientists.forEach((scientist, index) => {
                const status = scientist.isApproved ? '✅ Approved' : '⏳ Pending';
                const active = scientist.isActive ? '🟢 Active' : '🔴 Inactive';
                console.log(`   ${index + 1}. ${scientist.name} (${scientist.email}) - ${status} ${active}`);
                if (scientist.department) console.log(`      Department: ${scientist.department}`);
                if (scientist.designation) console.log(`      Designation: ${scientist.designation}`);
                console.log(`      ID: ${scientist.id}`);
            });
            
            setScientists(result.scientists);
            setStats(result.stats);
            
            console.log('✅ [DEBUG] State updated successfully');
            
        } catch (error: any) {
            console.error('❌ [DEBUG] Error fetching scientists:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error?.message || 'Unknown error',
                stack: error?.stack || 'No stack trace',
                response: error?.response?.data || 'No response data'
            });
            Alert.alert('Error', 'Failed to fetch scientists data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchScientists();
    }, []);

    // Refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchScientists();
        setRefreshing(false);
    };

    // Enhanced filtering with comprehensive debugging
    const filteredRequests = scientists.filter(scientist => {
        const status = getStatusFromScientist(scientist);
        const matchesFilter = selectedFilter === 'all' || status === selectedFilter;
        
        // Debug logging for each scientist's filtering
        console.log(`🔍 [FILTER] ${scientist.name}:`);
        console.log(`   Status: ${status} (approved: ${scientist.isApproved}, active: ${scientist.isActive})`);
        console.log(`   Filter: ${selectedFilter}`);
        console.log(`   Matches: ${matchesFilter}`);
        
        return matchesFilter;
    });

    // Debug filtered results summary
    console.log(`🎯 [FILTER SUMMARY]:`);
    console.log(`   Selected Filter: ${selectedFilter}`);
    console.log(`   Total Scientists: ${scientists.length}`);
    console.log(`   Filtered Results: ${filteredRequests.length}`);
    console.log(`   Stats - Pending: ${stats.pending}, Approved: ${stats.approved}, Total: ${stats.total}`);
    
    // Debug breakdown by status
    const statusBreakdown = {
        pending: scientists.filter(s => getStatusFromScientist(s) === 'pending').length,
        approved: scientists.filter(s => getStatusFromScientist(s) === 'approved').length
    };
    console.log(`📊 [STATUS BREAKDOWN]:`, statusBreakdown);

    const pendingCount = stats.pending;
    const approvedCount = stats.approved;

    // Debug counts
    console.log(`📊 [STATS DEBUG] Pending: ${pendingCount}, Approved: ${approvedCount}, Total: ${stats.total}`);

    const handleApprove = async (requestId: string) => {
        Alert.alert(
            'Approve Scientist',
            'Are you sure you want to approve this scientist account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    style: 'default',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await ownerAPI.approveScientist(requestId);
                            Alert.alert('Success', 'Scientist has been approved successfully!');
                            // Refresh data
                            await fetchScientists();
                        } catch (error) {
                            console.error('Error approving scientist:', error);
                            Alert.alert('Error', 'Failed to approve scientist. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReject = (requestId: string) => {
        setSelectedRequest(scientists.find(s => s.id === requestId) || null);
        setModalVisible(true);
    };

    const confirmReject = async () => {
        if (selectedRequest && rejectionReason.trim()) {
            try {
                setLoading(true);
                await ownerAPI.disapproveScientist(selectedRequest.id, rejectionReason);
                setModalVisible(false);
                setRejectionReason('');
                setSelectedRequest(null);
                Alert.alert('Success', 'Request has been rejected with feedback sent to the scientist.');
                // Refresh data
                await fetchScientists();
            } catch (error) {
                console.error('Error rejecting scientist:', error);
                Alert.alert('Error', 'Failed to reject scientist. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert('Error', 'Please provide a reason for rejection.');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'approved': return '#10b981';
            default: return COLORS.gray;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time-outline';
            case 'approved': return 'checkmark-circle';
            default: return 'help-circle';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Scientist Approvals</Text>
                <Text style={styles.subtitle}>Review and manage access requests</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{pendingCount}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#10b981' }]}>{approvedCount}</Text>
                    <Text style={styles.statLabel}>Approved</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
            </View>

            {/* Debug Info Section */}
            <View style={styles.debugContainer}>
                <Text style={styles.debugText}>
                    🔍 Debug: Loaded {scientists.length} scientists, showing {filteredRequests.length} for "{selectedFilter}" filter
                </Text>
                <TouchableOpacity 
                    onPress={() => {
                        console.log('🔄 Manual refresh triggered');
                        fetchScientists();
                    }}
                    style={styles.debugRefreshButton}
                >
                    <Text style={styles.debugRefreshText}>🔄 Refresh Data</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['all', 'pending', 'approved'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterTab,
                                selectedFilter === filter && styles.activeFilterTab
                            ]}
                            onPress={() => setSelectedFilter(filter as any)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === filter && styles.activeFilterText
                            ]}>
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Requests List */}
            <ScrollView 
                style={styles.requestsList} 
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
                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading scientists...</Text>
                        <Text style={styles.debugText}>
                            Debug: Fetching from API...
                        </Text>
                    </View>
                ) : filteredRequests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyTitle}>
                            No {selectedFilter === 'all' ? '' : selectedFilter + ' '}scientists
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedFilter === 'pending' 
                                ? 'All scientists in your organization have been processed.'
                                : selectedFilter === 'approved'
                                ? 'No approved scientists found.'
                                : 'No scientists found in your organization.'
                            }
                        </Text>
                        <Text style={styles.debugText}>
                            Debug: Total={scientists.length}, Filter="{selectedFilter}", 
                            Pending={stats.pending}, Approved={stats.approved}
                        </Text>
                    </View>
                ) : (
                    filteredRequests.map((scientist) => {
                        const status = getStatusFromScientist(scientist);
                        return (
                            <View key={scientist.id} style={styles.requestCard}>
                                <View style={styles.requestHeader}>
                                    <View style={styles.requestInfo}>
                                        <Text style={styles.requestName}>{scientist.name}</Text>
                                        <Text style={styles.requestEmail}>{scientist.email}</Text>
                                        <Text style={styles.requestInstitution}>
                                            {scientist.organizationId || 'No Organization'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(status)}15` }]}>
                                        <Ionicons 
                                            name={getStatusIcon(status) as any} 
                                            size={16} 
                                            color={getStatusColor(status)} 
                                        />
                                        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.requestDetails}>
                                    {scientist.department && (
                                        <View style={styles.detailRow}>
                                            <Ionicons name="business-outline" size={16} color={COLORS.gray} />
                                            <Text style={styles.detailText}>Department: {scientist.department}</Text>
                                        </View>
                                    )}
                                    {scientist.designation && (
                                        <View style={styles.detailRow}>
                                            <Ionicons name="briefcase-outline" size={16} color={COLORS.gray} />
                                            <Text style={styles.detailText}>Designation: {scientist.designation}</Text>
                                        </View>
                                    )}
                                    <View style={styles.detailRow}>
                                        <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
                                        <Text style={styles.detailText}>Joined: {formatDate(scientist.createdAt)}</Text>
                                    </View>
                                </View>

                                {/* Debug Information */}
                                <View style={styles.debugSection}>
                                    <Text style={styles.debugText}>
                                        🔍 ID: {scientist.id} | Approved: {scientist.isApproved ? 'Yes' : 'No'} | Active: {scientist.isActive ? 'Yes' : 'No'} | Status: {status}
                                    </Text>
                                </View>

                                <View style={styles.requestFooter}>
                                    <Text style={styles.submittedTime}>
                                        Account created: {formatDate(scientist.createdAt)}
                                    </Text>
                                    
                                    {status === 'pending' && (
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity 
                                                style={[styles.actionButton, styles.rejectButton]}
                                                onPress={() => handleReject(scientist.id)}
                                                disabled={loading}
                                            >
                                                <Ionicons name="close" size={16} color={COLORS.white} />
                                                <Text style={styles.rejectButtonText}>
                                                    {loading ? 'Processing...' : 'Reject'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.actionButton, styles.approveButton]}
                                                onPress={() => handleApprove(scientist.id)}
                                                disabled={loading}
                                            >
                                                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                                                <Text style={styles.approveButtonText}>
                                                    {loading ? 'Processing...' : 'Approve'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    
                                    {status === 'approved' && (
                                        <View style={styles.approvedIndicator}>
                                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                            <Text style={styles.approvedText}>Approved & Active</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Rejection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Reject Request</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.gray} />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.modalSubtitle}>
                            Please provide a reason for rejecting this request:
                        </Text>
                        
                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Enter reason for rejection..."
                            multiline
                            numberOfLines={4}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.confirmRejectButton}
                                onPress={confirmReject}
                            >
                                <Text style={styles.confirmRejectButtonText}>Reject Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: 50,
        paddingBottom: SIZES.md,
        backgroundColor: COLORS.primary,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SIZES.xs,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.white,
        opacity: 0.9,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SIZES.md,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
    },
    filterContainer: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.md,
    },
    filterTab: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        marginRight: SIZES.sm,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    activeFilterTab: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        fontWeight: '500',
    },
    activeFilterText: {
        color: COLORS.white,
    },
    requestsList: {
        flex: 1,
        paddingHorizontal: SIZES.lg,
    },
    requestCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SIZES.md,
        marginBottom: SIZES.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.sm,
    },
    requestInfo: {
        flex: 1,
    },
    requestName: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 2,
    },
    requestEmail: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        marginBottom: 2,
    },
    requestInstitution: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: SIZES.xs,
        fontWeight: '600',
        marginLeft: 4,
    },
    requestDetails: {
        marginBottom: SIZES.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        marginLeft: SIZES.xs,
        flex: 1,
    },
    purposeSection: {
        marginBottom: SIZES.sm,
    },
    purposeTitle: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    purposeText: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        lineHeight: 20,
    },
    documentsSection: {
        marginBottom: SIZES.sm,
    },
    documentsTitle: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    documentsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    documentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}10`,
        paddingHorizontal: SIZES.sm,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: SIZES.xs,
        marginBottom: 4,
    },
    documentText: {
        fontSize: SIZES.xs,
        color: COLORS.primary,
        marginLeft: 4,
        fontWeight: '500',
    },
    requestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SIZES.sm,
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    submittedTime: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.sm,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: SIZES.xs,
    },
    approveButton: {
        backgroundColor: '#10b981',
    },
    rejectButton: {
        backgroundColor: '#ef4444',
    },
    approveButtonText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        fontWeight: '600',
        marginLeft: 4,
    },
    rejectButtonText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        fontWeight: '600',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.gray,
        marginTop: SIZES.md,
        marginBottom: SIZES.xs,
    },
    emptySubtitle: {
        fontSize: SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
    },
    bottomSpacing: {
        height: 100,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SIZES.lg,
        margin: SIZES.lg,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    modalTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    modalSubtitle: {
        fontSize: SIZES.md,
        color: COLORS.gray,
        marginBottom: SIZES.md,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: SIZES.sm,
        fontSize: SIZES.md,
        color: COLORS.black,
        textAlignVertical: 'top',
        marginBottom: SIZES.lg,
        minHeight: 100,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: SIZES.sm,
        alignItems: 'center',
        marginRight: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: COLORS.gray,
        fontSize: SIZES.md,
        fontWeight: '600',
    },
    confirmRejectButton: {
        flex: 1,
        paddingVertical: SIZES.sm,
        alignItems: 'center',
        backgroundColor: '#ef4444',
        borderRadius: 8,
    },
    confirmRejectButtonText: {
        color: COLORS.white,
        fontSize: SIZES.md,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.xl,
    },
    loadingText: {
        marginTop: SIZES.sm,
        color: COLORS.gray,
        fontSize: SIZES.md,
    },
    approvedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10b98115',
        paddingHorizontal: SIZES.sm,
        paddingVertical: 4,
        borderRadius: 6,
    },
    approvedText: {
        marginLeft: 4,
        fontSize: SIZES.sm,
        color: '#10b981',
        fontWeight: '600',
    },
    debugText: {
        marginTop: SIZES.xs,
        fontSize: SIZES.xs,
        color: COLORS.gray,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    debugContainer: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.sm,
        alignItems: 'center',
    },
    debugRefreshButton: {
        marginTop: SIZES.xs,
        paddingHorizontal: SIZES.sm,
        paddingVertical: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    debugRefreshText: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        fontWeight: '600',
    },
    debugSection: {
        backgroundColor: '#f8f9fa',
        padding: SIZES.xs,
        borderRadius: 4,
        marginTop: SIZES.xs,
    },
});

export default OwnerApprovals;
