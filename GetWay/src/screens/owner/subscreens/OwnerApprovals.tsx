import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../../constants';

interface ScientistRequest {
    id: string;
    name: string;
    email: string;
    institution: string;
    qualification: string;
    researchArea: string;
    experience: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    documents: string[];
    purpose: string;
}

const OwnerApprovals: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<ScientistRequest | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Sample data - replace with actual API data
    const [requests, setRequests] = useState<ScientistRequest[]>([
        {
            id: '1',
            name: 'Dr. Priya Sharma',
            email: 'priya.sharma@iitb.ac.in',
            institution: 'IIT Bombay',
            qualification: 'Ph.D. in Transportation Engineering',
            researchArea: 'Urban Mobility and Smart Transportation',
            experience: '8 years',
            submittedAt: '2024-03-15T10:30:00Z',
            status: 'pending',
            documents: ['CV.pdf', 'Research_Proposal.pdf', 'Institution_Letter.pdf'],
            purpose: 'Research on public transportation patterns in Mumbai metropolitan area for developing sustainable mobility solutions.'
        },
        {
            id: '2',
            name: 'Dr. Rajesh Kumar',
            email: 'rajesh.kumar@iisc.ac.in',
            institution: 'IISc Bangalore',
            qualification: 'Ph.D. in Data Science',
            researchArea: 'Traffic Analytics and Prediction Models',
            experience: '12 years',
            submittedAt: '2024-03-14T14:20:00Z',
            status: 'pending',
            documents: ['CV.pdf', 'Previous_Research.pdf'],
            purpose: 'Developing AI models for traffic flow prediction and optimization using real-time transportation data.'
        },
        {
            id: '3',
            name: 'Dr. Meera Patel',
            email: 'meera.patel@ntu.edu.sg',
            institution: 'NTU Singapore',
            qualification: 'Ph.D. in Environmental Engineering',
            researchArea: 'Sustainable Transportation',
            experience: '6 years',
            submittedAt: '2024-03-13T09:15:00Z',
            status: 'approved',
            documents: ['CV.pdf', 'Research_Proposal.pdf'],
            purpose: 'Studying the environmental impact of different transportation modes in urban Indian cities.'
        },
        {
            id: '4',
            name: 'Dr. Amit Singh',
            email: 'amit.singh@del.ac.in',
            institution: 'Delhi University',
            qualification: 'Ph.D. in Economics',
            researchArea: 'Transportation Economics',
            experience: '4 years',
            submittedAt: '2024-03-12T16:45:00Z',
            status: 'rejected',
            documents: ['CV.pdf'],
            purpose: 'Economic analysis of transportation choices in metropolitan cities.'
        }
    ]);

    const filteredRequests = requests.filter(request => 
        selectedFilter === 'all' || request.status === selectedFilter
    );

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedCount = requests.filter(r => r.status === 'approved').length;
    const rejectedCount = requests.filter(r => r.status === 'rejected').length;

    const handleApprove = (requestId: string) => {
        Alert.alert(
            'Approve Request',
            'Are you sure you want to approve this scientist request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    style: 'default',
                    onPress: () => {
                        setRequests(prev => prev.map(req => 
                            req.id === requestId ? { ...req, status: 'approved' as const } : req
                        ));
                        Alert.alert('Success', 'Request has been approved successfully!');
                    }
                }
            ]
        );
    };

    const handleReject = (requestId: string) => {
        setSelectedRequest(requests.find(r => r.id === requestId) || null);
        setModalVisible(true);
    };

    const confirmReject = () => {
        if (selectedRequest && rejectionReason.trim()) {
            setRequests(prev => prev.map(req => 
                req.id === selectedRequest.id ? { ...req, status: 'rejected' as const } : req
            ));
            setModalVisible(false);
            setRejectionReason('');
            setSelectedRequest(null);
            Alert.alert('Success', 'Request has been rejected with feedback sent to the applicant.');
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
            case 'rejected': return '#ef4444';
            default: return COLORS.gray;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time-outline';
            case 'approved': return 'checkmark-circle';
            case 'rejected': return 'close-circle';
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
                    <Text style={[styles.statNumber, { color: '#ef4444' }]}>{rejectedCount}</Text>
                    <Text style={styles.statLabel}>Rejected</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['all', 'pending', 'approved', 'rejected'].map((filter) => (
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
            <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
                {filteredRequests.map((request) => (
                    <View key={request.id} style={styles.requestCard}>
                        <View style={styles.requestHeader}>
                            <View style={styles.requestInfo}>
                                <Text style={styles.requestName}>{request.name}</Text>
                                <Text style={styles.requestEmail}>{request.email}</Text>
                                <Text style={styles.requestInstitution}>{request.institution}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(request.status)}15` }]}>
                                <Ionicons 
                                    name={getStatusIcon(request.status) as any} 
                                    size={16} 
                                    color={getStatusColor(request.status)} 
                                />
                                <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.requestDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="school-outline" size={16} color={COLORS.gray} />
                                <Text style={styles.detailText}>{request.qualification}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="search-outline" size={16} color={COLORS.gray} />
                                <Text style={styles.detailText}>{request.researchArea}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={16} color={COLORS.gray} />
                                <Text style={styles.detailText}>{request.experience} experience</Text>
                            </View>
                        </View>

                        <View style={styles.purposeSection}>
                            <Text style={styles.purposeTitle}>Research Purpose:</Text>
                            <Text style={styles.purposeText}>{request.purpose}</Text>
                        </View>

                        <View style={styles.documentsSection}>
                            <Text style={styles.documentsTitle}>Documents:</Text>
                            <View style={styles.documentsRow}>
                                {request.documents.map((doc, index) => (
                                    <TouchableOpacity key={index} style={styles.documentChip}>
                                        <Ionicons name="document-outline" size={14} color={COLORS.primary} />
                                        <Text style={styles.documentText}>{doc}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.requestFooter}>
                            <Text style={styles.submittedTime}>
                                Submitted: {formatDate(request.submittedAt)}
                            </Text>
                            
                            {request.status === 'pending' && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity 
                                        style={[styles.actionButton, styles.rejectButton]}
                                        onPress={() => handleReject(request.id)}
                                    >
                                        <Ionicons name="close" size={16} color={COLORS.white} />
                                        <Text style={styles.rejectButtonText}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.actionButton, styles.approveButton]}
                                        onPress={() => handleApprove(request.id)}
                                    >
                                        <Ionicons name="checkmark" size={16} color={COLORS.white} />
                                        <Text style={styles.approveButtonText}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                ))}

                {filteredRequests.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="folder-open-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyTitle}>No requests found</Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedFilter === 'pending' 
                                ? 'No pending requests at the moment'
                                : `No ${selectedFilter} requests found`
                            }
                        </Text>
                    </View>
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
});

export default OwnerApprovals;
