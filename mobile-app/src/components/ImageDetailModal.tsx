import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView, 
  Platform 
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  ZoomIn 
} from 'react-native-reanimated';
import { X, Download, Share2, Info, Zap, ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '../theme';
import { GlassCard } from './GlassCard';

const { width, height } = Dimensions.get('window');

interface ImageDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  image: string;
  title: string;
  subtitle?: string;
  details?: string[];
  tags?: string[];
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  isVisible,
  onClose,
  image,
  title,
  subtitle,
  details,
  tags
}) => {
  const { colors, typography } = useAppTheme();

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={onClose} 
          />
        </BlurView>

        <Animated.View 
          entering={ZoomIn.duration(400)}
          style={styles.modalContainer}
        >
          <GlassCard variant="dark" intensity={30} style={styles.contentCard}>
            {/* CLOSE BUTTON */}
            <TouchableOpacity 
              onPress={onClose} 
              style={[styles.closeButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
            >
              <X size={20} color={colors.white} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* IMAGE SECTION */}
              <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.mainImage} resizeMode="cover" />
                <View style={styles.imageOverlay} />
                
                <View style={styles.hudContainer}>
                  <View style={styles.signalBadge}>
                    <View style={styles.signalPulse} />
                    <Text style={styles.signalText}>SIGNAL_LOCK_ACTIVE</Text>
                  </View>
                  
                  <View style={styles.tagContainer}>
                    {tags?.map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* INFO SECTION */}
              <View style={styles.infoSection}>
                <Text style={styles.snapshotLabel}>// DATA_SNAPSHOT</Text>
                <Text style={[styles.title, { color: colors.white }]}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>

                {details && (
                  <View style={styles.detailsList}>
                    <Text style={styles.specsLabel}>SPÉCIFICATIONS_CORE</Text>
                    {details.map((detail, i) => (
                      <View key={i} style={styles.detailItem}>
                        <ChevronRight size={12} color={colors.primary} />
                        <Text style={styles.detailText}>{detail}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.technicalGrid}>
                  <View style={styles.techItem}>
                    <Text style={styles.techLabel}>RESOLUTION</Text>
                    <Text style={styles.techValue}>4096 x 2304</Text>
                  </View>
                  <View style={styles.techItem}>
                    <Text style={styles.techLabel}>CODEC</Text>
                    <Text style={styles.techValue}>NEURAL_RAW</Text>
                  </View>
                  <View style={styles.techItem}>
                    <Text style={styles.techLabel}>LATENCY</Text>
                    <Text style={styles.techValue}>0.003ms</Text>
                  </View>
                </View>

                {/* ACTIONS */}
                <TouchableOpacity style={[styles.primaryAction, { backgroundColor: colors.primary }]}>
                  <Text style={styles.primaryActionText}>TÉLÉCHARGER LE SCAN</Text>
                  <Download size={16} color={colors.white} />
                </TouchableOpacity>

                <View style={styles.secondaryActions}>
                  <TouchableOpacity style={styles.secondaryAction}>
                    <Share2 size={14} color={colors.primary} />
                    <Text style={styles.secondaryActionText}>PARTAGER</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryAction}>
                    <Info size={14} color={colors.primary} />
                    <Text style={styles.secondaryActionText}>INFO</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={onClose}
                  style={styles.closeAction}
                >
                  <Text style={styles.closeActionText}>[ FERMER_SESSION ]</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.decorativeCorner}>
               <Zap size={32} color={colors.primary} opacity={0.2} />
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: width * 0.9,
    height: height * 0.85,
    borderRadius: 40,
    overflow: 'hidden',
  },
  contentCard: {
    flex: 1,
    padding: 0,
    borderRadius: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  hudContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  signalPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  signalText: {
    color: '#818CF8',
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '900',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tagText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    fontWeight: '900',
  },
  infoSection: {
    padding: 30,
  },
  snapshotLabel: {
    color: '#6366f1',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    marginBottom: 30,
  },
  detailsList: {
    marginBottom: 30,
  },
  specsLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 15,
    letterSpacing: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  detailText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    flex: 1,
  },
  technicalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    marginBottom: 30,
  },
  techItem: {
    flex: 1,
  },
  techLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 7,
    fontWeight: '900',
    marginBottom: 4,
  },
  techValue: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  primaryAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontStyle: 'italic',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  secondaryActionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  closeAction: {
    alignItems: 'center',
    padding: 15,
  },
  closeActionText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  decorativeCorner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    opacity: 0.2,
  }
});
