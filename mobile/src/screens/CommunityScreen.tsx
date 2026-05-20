import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

// ─── mock data ────────────────────────────────────────────────────────────────

const MOCK_RESPONSES: Record<string, string> = {
  default: 'Boa pergunta! Para saber o descarte correto, use o scanner do EcoScan.',
  pizza: 'Caixa de pizza com gordura vai para o lixo comum (cinza). Caixa limpa pode ir para o azul.',
  plastico: 'Plasticos como garrafas PET, potes e embalagens vao na lixeira vermelha.',
  papel: 'Papel, papelao, revistas e caixas limpas vao na lixeira azul.',
  vidro: 'Vidros e frascos vao na lixeira verde. Embale vidros quebrados antes.',
  metal: 'Latas, tampinhas e metais vao na lixeira amarela.',
  pilha: 'Pilhas e baterias tem descarte especial — leve a um ecoponto ou loja.',
};

const MOCK_GROUP = {
  name: 'UFCG — Sistemas de Informacao',
  city: 'Campina Grande, PB',
  members: 5,
  totalKg: 47.3,
  co2: 12.8,
};

const MOCK_MEMBERS = [
  { name: 'Gabriel Azevedo', points: 2840, position: 1, isMe: true },
  { name: 'Miguel Menezes', points: 2210, position: 2, isMe: false },
  { name: 'Carlos Damacena', points: 1890, position: 3, isMe: false },
  { name: 'Mateus Regis', points: 1540, position: 4, isMe: false },
  { name: 'David Victor', points: 1320, position: 5, isMe: false },
];

const MOCK_RANKING = [
  { pos: 1, name: 'Guardioes do Baturite', city: 'Fortaleza, CE', kg: 312.4 },
  { pos: 2, name: 'Recicla Recife', city: 'Recife, PE', kg: 289.7 },
  { pos: 3, name: 'Verde Salvador', city: 'Salvador, BA', kg: 241.2 },
  { pos: 4, name: 'UFCG — Sistemas de Informacao', city: 'Campina Grande, PB', kg: 198.6 },
  { pos: 5, name: 'Eco Maceio', city: 'Maceio, AL', kg: 176.3 },
  { pos: 6, name: 'Sustentavel Natal', city: 'Natal, RN', kg: 154.8 },
  { pos: 7, name: 'Recicladores Joao Pessoa', city: 'Joao Pessoa, PB', kg: 143.2 },
  { pos: 8, name: 'Greenpoint Aracaju', city: 'Aracaju, SE', kg: 132.7 },
  { pos: 9, name: 'Eco Teresina', city: 'Teresina, PI', kg: 121.5 },
  { pos: 10, name: 'Coleta Sao Luis', city: 'Sao Luis, MA', kg: 109.4 },
];

const MEDAL_COLORS = ['#eab308', '#94a3b8', '#cd7c45'];

// ─── types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

// ─── sub-components ──────────────────────────────────────────────────────────

function TypingDots() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const seq = (sv: typeof dot1, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 350 }),
            withTiming(0.3, { duration: 350 }),
          ),
          -1,
          false,
        ),
      );
    };
    seq(dot1, 0);
    seq(dot2, 200);
    seq(dot3, 400);
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={typingStyles.row}>
      <Animated.View style={[typingStyles.dot, s1]} />
      <Animated.View style={[typingStyles.dot, s2]} />
      <Animated.View style={[typingStyles.dot, s3]} />
    </View>
  );
}

const typingStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, padding: 12 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
});

function RankingRow({ item, index }: { item: (typeof MOCK_RANKING)[number]; index: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(index * 60, withTiming(1, { duration: 350 }));
    translateY.value = withDelay(index * 60, withTiming(0, { duration: 350 }));
  }, [opacity, translateY, index]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isTop3 = item.pos <= 3;
  const medalColor = isTop3 ? MEDAL_COLORS[item.pos - 1] : colors.muted;
  const isMyGroup = item.name === MOCK_GROUP.name;

  return (
    <Animated.View style={[rankStyles.row, isMyGroup && rankStyles.rowHighlight, style]}>
      <Text style={[rankStyles.pos, { color: medalColor }]}>
        {String(item.pos).padStart(2, '0')}
      </Text>
      <View style={rankStyles.body}>
        <Text style={[rankStyles.name, isMyGroup && rankStyles.nameHighlight]}>{item.name}</Text>
        <Text style={rankStyles.city}>{item.city}</Text>
      </View>
      <Text style={rankStyles.kg}>{item.kg} kg</Text>
    </Animated.View>
  );
}

const rankStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowHighlight: {
    backgroundColor: 'rgba(29,255,138,0.04)',
  },
  pos: {
    width: 30,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 0.4,
  },
  body: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.text,
    letterSpacing: 0.6,
  },
  nameHighlight: {
    color: colors.green,
  },
  city: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  kg: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.dim,
    letterSpacing: 0.4,
  },
});

// ─── main screen ─────────────────────────────────────────────────────────────

type RankView = 'grupo' | 'geral';

export function CommunityScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', text: 'Ola! Sou o assistente ecologico do EcoScan. Pergunte sobre descarte de residuos!', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [rankView, setRankView] = useState<RankView>('grupo');
  const chatRef = useRef<FlatList<ChatMessage>>(null);

  const detectKeyword = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('pizza')) return 'pizza';
    if (t.includes('plastico') || t.includes('pet')) return 'plastico';
    if (t.includes('papel') || t.includes('papelao') || t.includes('caixa')) return 'papel';
    if (t.includes('vidro') || t.includes('garrafa')) return 'vidro';
    if (t.includes('metal') || t.includes('lata')) return 'metal';
    if (t.includes('pilha') || t.includes('bateria')) return 'pilha';
    return 'default';
  };

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const key = detectKeyword(text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: MOCK_RESPONSES[key],
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 1000);
  }, [input]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, typing]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Chatbot ────────────────────────────────────────────────────── */}
        <View style={styles.sectionHead}>
          <Feather name="message-circle" size={14} color={colors.green} />
          <Text style={styles.sectionTitle}>Chatbot Eco</Text>
        </View>

        <View style={styles.chatBox}>
          <FlatList
            ref={chatRef}
            data={messages}
            keyExtractor={(m) => m.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  item.sender === 'user' ? styles.bubbleUser : styles.bubbleBot,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    item.sender === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            )}
            ListFooterComponent={typing ? <TypingDots /> : null}
          />
        </View>

        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="Digite sua pergunta..."
            placeholderTextColor={colors.muted}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <Pressable style={styles.sendBtn} onPress={sendMessage}>
            <Feather name="send" size={16} color={colors.bg} />
          </Pressable>
        </View>

        {/* ── Ranking ────────────────────────────────────────────────────── */}
        <View style={[styles.sectionHead, { marginTop: 28 }]}>
          <Feather name="users" size={14} color={colors.green} />
          <Text style={styles.sectionTitle}>Grupos</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, rankView === 'grupo' && styles.toggleBtnActive]}
            onPress={() => setRankView('grupo')}
          >
            <Text style={[styles.toggleText, rankView === 'grupo' && styles.toggleTextActive]}>
              Meu Grupo
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, rankView === 'geral' && styles.toggleBtnActive]}
            onPress={() => setRankView('geral')}
          >
            <Text style={[styles.toggleText, rankView === 'geral' && styles.toggleTextActive]}>
              Ranking Geral
            </Text>
          </Pressable>
        </View>

        {/* My Group view */}
        {rankView === 'grupo' && (
          <View>
            <View style={styles.groupCard}>
              <Text style={styles.groupLabel}>Meu grupo</Text>
              <Text style={styles.groupName}>{MOCK_GROUP.name}</Text>
              <Text style={styles.groupCity}>{MOCK_GROUP.city}</Text>
              <View style={styles.groupMetrics}>
                <View style={styles.groupMetric}>
                  <Text style={styles.groupMetricValue}>{MOCK_GROUP.members}</Text>
                  <Text style={styles.groupMetricLabel}>membros</Text>
                </View>
                <View style={styles.groupMetricDivider} />
                <View style={styles.groupMetric}>
                  <Text style={styles.groupMetricValue}>{MOCK_GROUP.totalKg} kg</Text>
                  <Text style={styles.groupMetricLabel}>reciclado</Text>
                </View>
                <View style={styles.groupMetricDivider} />
                <View style={styles.groupMetric}>
                  <Text style={styles.groupMetricValue}>{MOCK_GROUP.co2} kg</Text>
                  <Text style={styles.groupMetricLabel}>CO2 evitado</Text>
                </View>
              </View>
            </View>

            <View style={styles.memberList}>
              {MOCK_MEMBERS.map((member) => (
                <View
                  key={member.name}
                  style={[styles.memberRow, member.isMe && styles.memberRowHighlight]}
                >
                  <View style={[styles.avatar, member.isMe && styles.avatarMe]}>
                    <Text style={[styles.avatarText, member.isMe && styles.avatarTextMe]}>
                      {member.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberBody}>
                    <Text style={[styles.memberName, member.isMe && styles.memberNameMe]}>
                      {member.name}
                    </Text>
                    <Text style={styles.memberPts}>{member.points} pts</Text>
                  </View>
                  <Text style={styles.memberPos}>
                    {String(member.position).padStart(2, '0')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* General ranking view */}
        {rankView === 'geral' && (
          <View style={styles.rankPanel}>
            {MOCK_RANKING.map((item, i) => (
              <RankingRow key={item.pos} item={item} index={i} />
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // section header
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // chat
  chatBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 200,
    maxHeight: 320,
    padding: 12,
    marginBottom: 10,
  },
  bubble: {
    maxWidth: '80%',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.green,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  bubbleTextBot: {
    color: colors.text,
  },
  bubbleTextUser: {
    color: colors.bg,
  },

  // input row
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text,
  },
  sendBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
  },

  // toggle
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleBtnActive: {
    backgroundColor: colors.surface2,
    borderColor: colors.green,
  },
  toggleText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  toggleTextActive: {
    color: colors.green,
  },

  // group card
  groupCard: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(29,255,138,0.04)',
    padding: 18,
    marginBottom: 12,
  },
  groupLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  groupName: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    lineHeight: 28,
  },
  groupCity: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 14,
  },
  groupMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupMetric: {
    alignItems: 'center',
    flex: 1,
  },
  groupMetricValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.green,
    letterSpacing: 0.4,
  },
  groupMetricLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  groupMetricDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },

  // member list
  memberList: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberRowHighlight: {
    borderLeftWidth: 2,
    borderLeftColor: colors.green,
    backgroundColor: 'rgba(29,255,138,0.03)',
  },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMe: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.dim,
  },
  avatarTextMe: {
    color: colors.bg,
  },
  memberBody: {
    flex: 1,
  },
  memberName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
  memberNameMe: {
    color: colors.green,
  },
  memberPts: {
    fontFamily: fonts.bodyLight,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  memberPos: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.dim,
    letterSpacing: 0.4,
  },

  // general ranking
  rankPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
});
