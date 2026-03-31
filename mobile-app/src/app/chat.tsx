import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions,
  StatusBar,
  Keyboard,
  Image as RNImage,
  Pressable,
  ActivityIndicator
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { 
  Send, 
  Image as ImageIcon, 
  Mic, 
  ShieldCheck, 
  Activity, 
  MoreVertical, 
  Lock, 
  Paperclip,
  Cpu,
  Zap,
  ChevronLeft,
  Video,
  Phone,
  Circle,
  Hash,
  RefreshCcw,
  Bot,
  AlertTriangle
} from "lucide-react-native";
import { useAppTheme, normalize } from "../theme";
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  FadeInRight, 
  FadeInLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Layout,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { useTranslation } from "react-i18next";
import { GlassCard } from "../components/GlassCard";
import { PulseIndicator } from "../components/PulseIndicator";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from "expo-blur";

// Logic Imports
import api from "../api/client";
import { useAuthStore } from "../store/auth.store";
import { socketService } from "../services/socket.service";

const { width, height } = Dimensions.get('window');

// --- REUSABLE REACTIVE BUTTON ---
const NeuralButton = ({ children, onPress, style, variant = "default", size = 44, disabled = false }: any) => {
  const theme = useAppTheme();
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.9, { damping: 10, stiffness: 300 });
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.neuralBtnBase,
          { width: size, height: size, borderRadius: size / 3 },
          variant === "primary" && { backgroundColor: theme.colors.primary },
          variant === "glass" && { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
          pressed && !disabled && { opacity: 0.8 },
          disabled && { opacity: 0.3 }
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

// --- MESSAGE COMPONENT ---
const MessageNode = ({ sender, text, time, isMe, type, theme, mediaUrl }: any) => {
  const { colors, typography } = theme;
  
  return (
    <Animated.View 
      entering={isMe ? FadeInRight.springify().damping(15) : FadeInLeft.springify().damping(15)} 
      layout={Layout.springify()}
      style={[styles.msgWrapper, isMe ? { alignItems: "flex-end" } : { alignItems: "flex-start" }]}
    >
      <View style={[styles.msgContainer, isMe ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' }]}>
        {!isMe && (
          <View style={styles.avatarContainer}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.avatarGradient}>
              <Text style={[styles.avatarText, { ...typography.pro, fontSize: 10 }]}>{sender?.name?.substring(0,2) || "??"}</Text>
            </LinearGradient>
            <View style={styles.onlineBadge}>
               <PulseIndicator color="#10b981" size={4} />
            </View>
          </View>
        )}
        
        <View style={[styles.msgContent, isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
           <GlassCard 
             variant={isMe ? "primary" : "transparent"} 
             intensity={isMe ? 90 : 25} 
             style={[
               styles.msgCard, 
               { 
                 borderBottomRightRadius: isMe ? 4 : 24,
                 borderBottomLeftRadius: isMe ? 24 : 4,
                 borderColor: isMe ? 'transparent' : 'rgba(255,255,255,0.05)'
               }
             ]}
           >
             {!isMe && (
               <View style={styles.senderHeader}>
                  <Text style={[styles.senderText, { color: colors.primary, ...typography.pro, fontSize: 8 }]}>{sender?.name || "ANONYMOUS_NODE"}</Text>
                  <Activity size={8} color={colors.primary} />
               </View>
             )}
             
             {type === 'IMAGE' || mediaUrl ? (
               <View style={styles.mediaContainer}>
                  <RNImage source={{ uri: mediaUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500' }} style={styles.mediaImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.mediaShadow} />
                  <View style={styles.mediaOverlay}>
                     <Text style={[styles.mediaTag, { ...typography.pro }]}>ASSET_ENCRYPTED</Text>
                  </View>
               </View>
             ) : (
               <Text style={[styles.msgText, { color: isMe ? "#fff" : colors.text, ...typography.body, fontStyle: 'italic' }]}>{text}</Text>
             )}
             
             <View style={styles.msgFooter}>
               <Text style={[styles.msgTime, { color: isMe ? "rgba(255,255,255,0.6)" : colors.textLight, ...typography.pro, fontSize: 6 }]}>{new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} // ACK_READY</Text>
               {isMe && <ShieldCheck size={8} color="rgba(255,255,255,0.8)" />}
             </View>
           </GlassCard>
        </View>
      </View>
    </Animated.View>
  );
};

export default function ChatScreen() {
  const theme = useAppTheme();
  const { colors, typography } = theme;
  const router = useRouter();
  const { id: conversationId, type: chatType } = useLocalSearchParams();
  const { user, token } = useAuthStore();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const scanlineAnim = useSharedValue(0);

  useEffect(() => {
    scanlineAnim.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      false
    );
  }, []);

  const scanlineStyle = useAnimatedStyle(() => ({
    top: interpolate(scanlineAnim.value, [0, 1], [-100, height])
  }));

  // Logic: Fetch Messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = chatType === 'global' ? '/chat/global' : `/chat/messages/${conversationId}`;
      const res = await api.get(endpoint);
      setMessages(chatType === 'global' ? res.data.data : res.data);
      
      if (conversationId && chatType !== 'global') {
        await api.post(`/chat/mark-as-read/${conversationId}`);
      }
    } catch (e: any) {
      setError("SIGNAL_DROP: HANDSHAKE_FAILED");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [conversationId, chatType]);

  useEffect(() => {
    if (token && user) {
      socketService.connect(token, user.id);
      fetchMessages();

      socketService.on("newMessage", (msg: any) => {
        if (chatType === 'global' && !msg.conversationId) {
          setMessages(prev => [...prev, msg]);
        } else if (msg.conversationId === conversationId) {
          setMessages(prev => [...prev, msg]);
          api.post(`/chat/mark-as-read/${conversationId}`);
        }
      });
    }

    return () => {
      socketService.off("newMessage");
    };
  }, [conversationId, chatType, token, user, fetchMessages]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    try {
      setIsSending(true);
      const endpoint = chatType === 'global' ? '/chat/global' : '/chat/messages';
      const payload = chatType === 'global' 
        ? { content: message } 
        : { conversationId, content: message, type: 'TEXT' };
      
      const res = await api.post(endpoint, payload);
      const newMsg = chatType === 'global' ? res.data.data : res.data;
      
      setMessages(prev => [...prev, newMsg]);
      setMessage("");
      Keyboard.dismiss();
      
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Emit to socket for real-time
      socketService.emit("sendMessage", { 
        conversationId: conversationId || null, 
        message: newMsg 
      });

    } catch (e) {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("TRANSMISSION_ERROR");
    } finally {
      setIsSending(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <PulseIndicator color={colors.primary} size={40} />
        <Text style={[styles.statusLabel, { color: colors.primary, ...typography.pro, marginTop: 20 }]}>SYNCHRONIZING_LATTICE...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* BACKGROUND DECORATIONS */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.gridPattern, { opacity: 0.05, backgroundColor: colors.primary }]} />
        <Animated.View style={[styles.scanline, scanlineStyle]} />
      </View>

      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. ULTRA PRO CHAT HEADER */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <NeuralButton variant="glass" size={40} onPress={() => router.back()}>
            <ChevronLeft color="#fff" size={20} />
          </NeuralButton>
          
          <View style={styles.targetInfo}>
            <View style={styles.targetStatus}>
              <PulseIndicator color={error ? colors.danger : "#10b981"} size={6} />
              <Text style={[styles.statusLabel, { color: error ? colors.danger : "#10b981", ...typography.pro, fontSize: 7 }]}>{error || "UPLINK_STABLE"}</Text>
            </View>
            <View style={styles.channelRow}>
               <Text style={[styles.channelName, { color: '#fff', ...typography.pro, fontSize: 14 }]}>{chatType === 'global' ? "NEURAL_CORE_STREAM" : "NODE_SECURE_LINK"}</Text>
               <Lock size={10} color={colors.accent} />
            </View>
            <Text style={[styles.channelMeta, { color: 'rgba(255,255,255,0.4)', ...typography.pro, fontSize: 6 }]}>NODE_ID: {conversationId || "GLOBAL"} // LATENCY_LOW</Text>
          </View>
          
          <View style={styles.headerActions}>
            <NeuralButton variant="glass" size={36} onPress={fetchMessages}>
               <RefreshCcw color="#fff" size={16} className={loading ? "animate-spin" : ""} />
            </NeuralButton>
            <NeuralButton variant="glass" size={36}><MoreVertical color="#fff" size={16} /></NeuralButton>
          </View>
        </View>
      </BlurView>

      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encryptionInfo}>
           <View style={styles.protocolBadge}>
              <Activity size={10} color={colors.accent} />
              <Text style={[styles.protocolText, { color: colors.accent, ...typography.pro }]}>FORENSIC_AUDIT_ENABLED</Text>
           </View>
           <Text style={[styles.dateDivider, { color: colors.textLight, ...typography.pro }]}>// {new Date().toLocaleDateString()}</Text>
        </View>
        
        {messages.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
             <Bot size={48} color={colors.primary} opacity={0.2} />
             <Text style={[styles.emptyText, { color: colors.textLight, ...typography.pro }]}>VOID_REGISTRY: NO_DATA_FOUND</Text>
          </View>
        )}

        {messages.map((msg, i) => (
          <MessageNode 
            key={msg._id || i}
            sender={msg.sender}
            text={msg.content}
            time={msg.createdAt}
            isMe={msg.sender?._id === user?.id || msg.sender === user?.id}
            type={msg.mediaType}
            mediaUrl={msg.mediaUrl}
            theme={theme}
          />
        ))}

        {isTyping && (
          <Animated.View entering={FadeInUp} style={styles.typingIndicator}>
             <View style={styles.typingAvatar}>
                <Bot size={12} color={colors.primary} />
             </View>
             <View style={styles.typingContent}>
                <PulseIndicator color={colors.primary} size={4} />
                <Text style={[styles.typingText, { color: colors.primary, ...typography.pro }]}>UPLINK_PROCESSING...</Text>
             </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* 2. NEURAL INPUT TERMINAL */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <GlassCard variant="dark" intensity={95} style={styles.inputContainer}>
          <View style={styles.inputBar}>
            <NeuralButton variant="glass" size={44}>
              <Paperclip size={20} color={colors.primary} />
            </NeuralButton>
            
            <View style={[styles.inputWrapper, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }]}>
              <TextInput 
                style={[styles.input, { color: '#fff' }]}
                placeholder="TRANSMIT_DATA..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={message}
                onChangeText={(txt) => {
                  setMessage(txt);
                  // Optional: Emit typing status via socket
                }}
                multiline
              />
              <View style={styles.inputPulse}>
                 <PulseIndicator color={message.length > 0 ? colors.primary : "rgba(255,255,255,0.2)"} size={4} />
              </View>
            </View>

            {message.length > 0 || isSending ? (
              <NeuralButton variant="primary" size={44} onPress={handleSend} disabled={isSending}>
                 {isSending ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
              </NeuralButton>
            ) : (
              <View style={styles.mediaActions}>
                <NeuralButton variant="glass" size={38}><Mic size={18} color={colors.textLight} /></NeuralButton>
              </View>
            )}
          </View>
          <View style={styles.footerInfo}>
             <View style={styles.footerTag}>
                <Circle size={4} fill={colors.accent} color={colors.accent} />
                <Text style={[styles.footerTagText, { color: colors.accent, ...typography.pro }]}>TLS_1.3_SECURED</Text>
             </View>
             <View style={styles.footerTag}>
                <Circle size={4} fill={colors.primary} color={colors.primary} />
                <Text style={[styles.footerTagText, { color: colors.primary, ...typography.pro }]}>NODE_ID: {user?.id?.substring(0,6) || "NULL"}</Text>
             </View>
          </View>
        </GlassCard>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gridPattern: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  scanline: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 1 },

  header: { height: 110, justifyContent: 'flex-end', zIndex: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  targetInfo: { flex: 1, justifyContent: 'center' },
  targetStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  statusLabel: { letterSpacing: 1 },
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  channelName: { letterSpacing: 1.5, textTransform: 'uppercase', fontStyle: 'italic', fontWeight: '900' },
  channelMeta: { letterSpacing: 0.5, opacity: 0.6 },
  headerActions: { flexDirection: 'row', gap: 8 },

  scroll: { padding: 20, paddingTop: 30, paddingBottom: 40 },
  encryptionInfo: { alignItems: 'center', marginBottom: 40, gap: 12 },
  protocolBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.05)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  protocolText: { fontSize: 7, letterSpacing: 1 },
  dateDivider: { fontSize: 8, letterSpacing: 2, opacity: 0.3 },
  
  msgWrapper: { marginBottom: 24, width: "100%" },
  msgContainer: { gap: 12, maxWidth: '90%' },
  avatarContainer: { width: 36, height: 36, borderRadius: 12, position: 'relative' },
  avatarGradient: { flex: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  avatarText: { color: '#fff' },
  onlineBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#020617', borderRadius: 6, padding: 2 },
  
  msgContent: { flexShrink: 1 },
  msgCard: { padding: 12, borderRadius: 20, borderWidth: 1 },
  senderHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  senderText: { letterSpacing: 1 },
  msgText: { fontSize: 13, lineHeight: 18 },
  
  mediaContainer: { width: normalize(220), height: normalize(160), borderRadius: 16, overflow: 'hidden', marginVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mediaImage: { width: '100%', height: '100%' },
  mediaShadow: { ...StyleSheet.absoluteFillObject },
  mediaOverlay: { position: 'absolute', bottom: 10, left: 10 },
  mediaTag: { color: '#fff', fontSize: 7, letterSpacing: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  
  msgFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 6, opacity: 0.6 },
  msgTime: { letterSpacing: 0.5 },
  
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 4, marginBottom: 20 },
  typingAvatar: { width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.2)' },
  typingContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typingText: { fontSize: 8, letterSpacing: 1, opacity: 0.8 },
  
  inputContainer: { padding: 12, paddingBottom: Platform.OS === "ios" ? 34 : 12, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  inputBar: { flexDirection: "row", alignItems: "center", gap: 10 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingRight: 12 },
  input: { flex: 1, maxHeight: 120, paddingHorizontal: 16, paddingVertical: 10, fontStyle: "italic", fontWeight: "700", fontSize: 13 },
  inputPulse: { width: 8, height: 8, justifyContent: 'center', alignItems: 'center' },
  mediaActions: { flexDirection: 'row', gap: 8 },
  
  neuralBtnBase: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  
  footerInfo: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12, opacity: 0.4 },
  footerTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerTagText: { fontSize: 6, letterSpacing: 1.5 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 20 },
  emptyText: { fontSize: 8, letterSpacing: 2, opacity: 0.3 }
});
